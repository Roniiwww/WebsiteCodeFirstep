import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Opportunity } from '../../types';
import {
  POPULAR_CITIES,
  CITY_COORDINATES,
  Coordinates
} from '../../utils/geoUtils';
import {
  getSavedGoogleMapsApiKey,
  saveGoogleMapsApiKey,
  isEnvGoogleMapsKeySet,
  loadGoogleMapsLibraries,
  subscribeGoogleMapsAuthFailure,
  hasGoogleMapsAuthFailed,
  LoadedGoogleMaps
} from '../../utils/googleMapsLoader';
import {
  MapPin,
  Navigation,
  Search,
  Flame,
  Compass,
  Crosshair,
  Map as MapIcon,
  List,
  KeyRound,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  LocateFixed
} from 'lucide-react';

interface VolunteerPlacesMapProps {
  opportunities: Opportunity[];
  onSelectOpportunity: (opp: Opportunity) => void;
  onApplyOpportunity: (opp: Opportunity) => void;
  initialCity?: string;
  className?: string;
}

type EnrichedOpportunity = Opportunity & {
  distance: number;
  lat: number;
  lng: number;
};

type GpsStatus =
  | 'idle'
  | 'locating'
  | 'success'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported';

type LocationSource = 'none' | 'gps' | 'city' | 'pin';

const DEFAULT_WORLD_CENTER: Coordinates = { lat: 42.6629, lng: 21.1655 };
const MAX_MAP_PINS = 65;
const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_MILES = 3958.8;

function getZoomForState(
  selectedRadius: number,
  locationSource: LocationSource,
  accuracyMeters: number | null
): number {
  if (locationSource === 'none') return 3;
  if (selectedRadius === 0) {
    if (locationSource === 'gps') {
      if (accuracyMeters && accuracyMeters > 3000) return 11;
      return 13;
    }
    return 11;
  }
  if (selectedRadius <= 25) return 12;
  if (selectedRadius <= 100) return 9;
  if (selectedRadius <= 500) return 6;
  return 4;
}

function buildPinSvgDataUrl(fillHex: string, strokeHex: string, scale = 1): string {
  const w = Math.round(30 * scale);
  const h = Math.round(38 * scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 30 38"><path d="M15 1C7.82 1 2 6.82 2 14c0 9.4 11.4 21.6 12.2 22.4a1.1 1.1 0 0 0 1.6 0C16.6 35.6 28 23.4 28 14 28 6.82 22.18 1 15 1z" fill="${fillHex}" stroke="${strokeHex}" stroke-width="2"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createPinIconSet() {
  const normalSize = new google.maps.Size(30, 38);
  const selectedSize = new google.maps.Size(36, 46);
  const normalAnchor = new google.maps.Point(15, 37);
  const selectedAnchor = new google.maps.Point(18, 45);
  const normalLabelOrigin = new google.maps.Point(15, 14);
  const selectedLabelOrigin = new google.maps.Point(18, 17);

  return {
    orgNormal: {
      url: buildPinSvgDataUrl('#0f172a', '#ffffff', 1),
      scaledSize: normalSize,
      anchor: normalAnchor,
      labelOrigin: normalLabelOrigin
    },
    orgSelected: {
      url: buildPinSvgDataUrl('#2563eb', '#ffffff', 1.2),
      scaledSize: selectedSize,
      anchor: selectedAnchor,
      labelOrigin: selectedLabelOrigin
    },
    reqNormal: {
      url: buildPinSvgDataUrl('#d97706', '#ffffff', 1),
      scaledSize: normalSize,
      anchor: normalAnchor,
      labelOrigin: normalLabelOrigin
    },
    reqSelected: {
      url: buildPinSvgDataUrl('#b45309', '#fde68a', 1.2),
      scaledSize: selectedSize,
      anchor: selectedAnchor,
      labelOrigin: selectedLabelOrigin
    },
    urgentNormal: {
      url: buildPinSvgDataUrl('#dc2626', '#ffffff', 1),
      scaledSize: normalSize,
      anchor: normalAnchor,
      labelOrigin: normalLabelOrigin
    },
    urgentSelected: {
      url: buildPinSvgDataUrl('#b91c1c', '#fecaca', 1.2),
      scaledSize: selectedSize,
      anchor: selectedAnchor,
      labelOrigin: selectedLabelOrigin
    }
  };
}

type PinIconSet = ReturnType<typeof createPinIconSet>;

function getMarkerIconForOpp(
  opp: EnrichedOpportunity,
  isSelected: boolean,
  icons: PinIconSet
): google.maps.Icon {
  const isRequest = opp.isDirectRequest || opp.organizerType === 'Individual in Need';
  if (isRequest) return isSelected ? icons.reqSelected : icons.reqNormal;
  if (opp.isUrgent) return isSelected ? icons.urgentSelected : icons.urgentNormal;
  return isSelected ? icons.orgSelected : icons.orgNormal;
}

function buildInfoWindowElement(
  opp: EnrichedOpportunity,
  onSelect: (o: Opportunity) => void,
  onApply: (o: Opportunity) => void
): HTMLElement {
  const isRequest = opp.isDirectRequest || opp.organizerType === 'Individual in Need';
  const kmDistance = Math.round(opp.distance * 1.60934 * 10) / 10;
  const spotsLeft = Math.max(0, opp.spotsNeeded - opp.spotsFilled);

  const root = document.createElement('div');
  root.style.cssText = 'max-width:250px;font-family:Inter,system-ui,sans-serif;padding:2px;';

  const topRow = document.createElement('div');
  topRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;';

  const badge = document.createElement('span');
  badge.style.cssText = isRequest
    ? 'font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:#fef3c7;color:#92400e;'
    : 'font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:#dbeafe;color:#1e40af;';
  badge.textContent = isRequest ? 'Citizen Request' : 'Opportunity';
  topRow.appendChild(badge);

  if (opp.isUrgent) {
    const urgentBadge = document.createElement('span');
    urgentBadge.style.cssText = 'font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:#fee2e2;color:#b91c1c;';
    urgentBadge.textContent = 'Urgent';
    topRow.appendChild(urgentBadge);
  }

  const locSpan = document.createElement('span');
  locSpan.style.cssText = 'font-size:10px;color:#64748b;font-weight:600;';
  locSpan.textContent = `${opp.city}, ${opp.country}`;
  topRow.appendChild(locSpan);
  root.appendChild(topRow);

  const titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:13px;font-weight:700;color:#0f172a;line-height:1.3;margin-bottom:3px;';
  titleEl.textContent = opp.title;
  root.appendChild(titleEl);

  const metaEl = document.createElement('div');
  metaEl.style.cssText = 'font-size:11px;color:#475569;margin-bottom:8px;';
  metaEl.textContent = `${opp.organization} • ${kmDistance} km (${opp.distance} mi) • ${spotsLeft} spots left`;
  root.appendChild(metaEl);

  const actionsEl = document.createElement('div');
  actionsEl.style.cssText = 'display:flex;gap:6px;';

  const detailsBtn = document.createElement('button');
  detailsBtn.type = 'button';
  detailsBtn.style.cssText = 'flex:1;padding:5px 8px;font-size:11px;font-weight:700;border-radius:8px;border:1px solid #cbd5e1;background:#f8fafc;color:#1e293b;cursor:pointer;';
  detailsBtn.textContent = 'View Details';
  detailsBtn.onclick = () => onSelect(opp);

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.style.cssText = 'flex:1;padding:5px 8px;font-size:11px;font-weight:700;border-radius:8px;border:none;background:#059669;color:#ffffff;cursor:pointer;';
  applyBtn.textContent = 'Apply';
  applyBtn.onclick = () => onApply(opp);

  actionsEl.appendChild(detailsBtn);
  actionsEl.appendChild(applyBtn);
  root.appendChild(actionsEl);

  return root;
}

interface MapOpportunityRowProps {
  opp: EnrichedOpportunity;
  index: number;
  isActive: boolean;
  onCardClick: (opp: EnrichedOpportunity) => void;
  onSelect: (opp: Opportunity) => void;
  onApply: (opp: Opportunity) => void;
}

const MapOpportunityRow: React.FC<MapOpportunityRowProps> = React.memo(
  ({ opp, index, isActive, onCardClick, onSelect, onApply }) => {
    const isRequest = opp.isDirectRequest || opp.organizerType === 'Individual in Need';
    const kmDistance = Math.round(opp.distance * 1.60934 * 10) / 10;

    return (
      <div
        onClick={() => onCardClick(opp)}
        className={`cursor-pointer transition-colors duration-150 rounded-2xl p-3 border ${
          isActive
            ? 'bg-blue-50/90 border-blue-300 shadow-sm'
            : 'bg-white hover:bg-slate-50 border-slate-200/80'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-900 text-white">
                #{index + 1}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {kmDistance} km ({opp.distance} mi) away
              </span>
              {isRequest && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Citizen Request
                </span>
              )}
              {opp.isUrgent && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-red-500" /> Urgent
                </span>
              )}
            </div>

            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2">
              {opp.title}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">{opp.organization}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 truncate max-w-[200px] sm:max-w-none">
                {opp.address ? `${opp.address} • ` : ''}
                {opp.city}, {opp.country}
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg shrink-0 border border-blue-200">
            {Math.max(0, opp.spotsNeeded - opp.spotsFilled)} spots left
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            {opp.commitmentHours}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(opp);
              }}
              className="px-2.5 py-1 text-slate-700 hover:text-blue-600 font-bold hover:bg-slate-100 rounded-lg transition"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onApply(opp);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs transition inline-flex items-center gap-1"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
);

MapOpportunityRow.displayName = 'MapOpportunityRow';

function findExactCityCoords(query: string): { label: string; coords: Coordinates } | null {
  const clean = query.toLowerCase().trim();
  if (clean.length < 2) return null;

  if (CITY_COORDINATES[clean]) {
    return { label: query.trim(), coords: CITY_COORDINATES[clean] };
  }
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.startsWith(clean) && clean.length >= 3) {
      return { label: query.trim(), coords };
    }
  }
  return null;
}

export const VolunteerPlacesMap: React.FC<VolunteerPlacesMapProps> = ({
  opportunities,
  onSelectOpportunity,
  onApplyOpportunity,
  className = ''
}) => {
  // Reference coordinates & GPS ping state
  const [currentLocation, setCurrentLocation] = useState<Coordinates>(DEFAULT_WORLD_CENTER);
  const [hasUserLocation, setHasUserLocation] = useState<boolean>(false);
  const [locationSource, setLocationSource] = useState<LocationSource>('none');
  const [currentCityName, setCurrentCityName] = useState<string>('Worldwide (All Continents)');
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [gpsErrorMessage, setGpsErrorMessage] = useState<string>('');
  const [locationSuccessNotice, setLocationSuccessNotice] = useState<string>(
    'Worldwide volunteer places & requests'
  );

  // Filters
  const [selectedRadius, setSelectedRadius] = useState<number>(0); // 0 = Worldwide
  const [selectedCause] = useState<string>('All');
  const [urgentOnly, setUrgentOnly] = useState<boolean>(false);
  const [requestsOnly, setRequestsOnly] = useState<boolean>(false);
  const [activeOpportunityId, setActiveOpportunityId] = useState<string | null>(null);

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');
  const [searchLocQuery, setSearchLocQuery] = useState<string>('');
  const [listLimit, setListLimit] = useState<number>(35);

  // Google Maps API state
  const [apiKey, setApiKey] = useState<string>(() => getSavedGoogleMapsApiKey());
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getSavedGoogleMapsApiKey());
  const [showKeyForm, setShowKeyForm] = useState<boolean>(false);
  const [mapsStatus, setMapsStatus] = useState<'needs-key' | 'loading' | 'ready' | 'error'>(() =>
    getSavedGoogleMapsApiKey() ? 'loading' : 'needs-key'
  );
  const [mapsErrorMsg, setMapsErrorMsg] = useState<string>('');

  // Stable callback refs so Google Maps listeners never go stale
  const onSelectRef = useRef(onSelectOpportunity);
  const onApplyRef = useRef(onApplyOpportunity);
  useEffect(() => {
    onSelectRef.current = onSelectOpportunity;
    onApplyRef.current = onApplyOpportunity;
  }, [onSelectOpportunity, onApplyOpportunity]);

  // Google Maps object refs (reused across updates for zero-lag rendering)
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const gmapsLibsRef = useRef<LoadedGoogleMaps | null>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersMapRef = useRef<Map<string, { marker: google.maps.Marker; opp: EnrichedOpportunity }>>(
    new Map()
  );
  const pinIconsRef = useRef<PinIconSet | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const accuracyCircleRef = useRef<google.maps.Circle | null>(null);
  const prevActiveIdRef = useRef<string | null>(null);
  const shouldMoveCameraRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Real Browser GPS Ping (two-stage accuracy: precise first, standard Wi-Fi/OS fallback on timeout; never fake city or IP)
  const pingActualLocation = useCallback((isAutoMount = false) => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      setGpsErrorMessage(
        'Your browser does not support Geolocation. Search a city or click the map to pin your location.'
      );
      return;
    }

    setGpsStatus('locating');
    if (!isAutoMount) {
      setGpsErrorMessage('');
    }

    const handleSuccess = (pos: GeolocationPosition) => {
      if (!mountedRef.current) return;
      const { latitude, longitude, accuracy } = pos.coords;
      const roundedAcc = Math.round(accuracy);
      shouldMoveCameraRef.current = true;
      setCurrentLocation({ lat: latitude, lng: longitude });
      setHasUserLocation(true);
      setLocationSource('gps');
      setGpsAccuracyMeters(roundedAcc);
      setGpsStatus('success');
      setGpsErrorMessage('');
      setCurrentCityName(`Actual GPS Location (±${roundedAcc} m)`);
      setLocationSuccessNotice(
        `GPS pinged: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (±${roundedAcc} m)`
      );
    };

    const handleFinalError = (err: GeolocationPositionError) => {
      if (!mountedRef.current) return;
      if (err.code === 1) {
        setGpsStatus('denied');
        setGpsErrorMessage(
          'Location permission was denied. Allow location access in your browser address bar, then click Retry Ping.'
        );
      } else if (err.code === 3) {
        setGpsStatus('timeout');
        setGpsErrorMessage(
          'Location request timed out. Ensure device location services are enabled, then click Retry Ping.'
        );
      } else {
        setGpsStatus('unavailable');
        setGpsErrorMessage(
          'Your device could not determine its position right now. Check OS Location Services and click Retry Ping.'
        );
      }
    };

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        if (!mountedRef.current) return;
        // If high-accuracy timed out or was unavailable, try standard OS/Wi-Fi geolocation
        if (err.code === 2 || err.code === 3) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleFinalError,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: isAutoMount ? 60000 : 15000
            }
          );
        } else {
          handleFinalError(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: isAutoMount ? 15000 : 0
      }
    );
  }, []);

  // Ping actual location on initial mount
  useEffect(() => {
    pingActualLocation(true);
  }, [pingActualLocation]);

  // Debounced city search resolution (eliminates lag while typing)
  useEffect(() => {
    const trimmed = searchLocQuery.trim();
    if (trimmed.length < 2) return;

    const timer = window.setTimeout(() => {
      const match = findExactCityCoords(trimmed);
      if (match) {
        shouldMoveCameraRef.current = true;
        setCurrentLocation(match.coords);
        setHasUserLocation(true);
        setLocationSource('city');
        setGpsAccuracyMeters(null);
        setCurrentCityName(match.label);
        setLocationSuccessNotice(`Centered on ${match.label}`);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchLocQuery]);

  // Stage 1 filter: cause/type/urgency (independent of currentLocation for fast dragging/panning)
  const filteredBase = useMemo(() => {
    return opportunities.filter((opp) => {
      if (opp.locationType === 'remote') return false;
      if (urgentOnly && !opp.isUrgent) return false;
      if (requestsOnly && !opp.isDirectRequest && opp.organizerType !== 'Individual in Need') {
        return false;
      }
      if (selectedCause !== 'All' && opp.cause !== selectedCause) return false;
      return true;
    });
  }, [opportunities, urgentOnly, requestsOnly, selectedCause]);

  // Stage 2: fast inline Haversine distance + radius filter + sort
  const enrichedOpportunities = useMemo<EnrichedOpportunity[]>(() => {
    const lat1Rad = currentLocation.lat * DEG_TO_RAD;
    const cosLat1 = Math.cos(lat1Rad);
    const refLat = currentLocation.lat;
    const refLng = currentLocation.lng;

    const result: EnrichedOpportunity[] = [];
    for (let i = 0; i < filteredBase.length; i++) {
      const opp = filteredBase[i];
      const lat = opp.lat || DEFAULT_WORLD_CENTER.lat;
      const lng = opp.lng || DEFAULT_WORLD_CENTER.lng;

      const dLat = (lat - refLat) * DEG_TO_RAD;
      const dLon = (lng - refLng) * DEG_TO_RAD;
      const sinDLat = Math.sin(dLat * 0.5);
      const sinDLon = Math.sin(dLon * 0.5);
      const a = sinDLat * sinDLat + cosLat1 * Math.cos(lat * DEG_TO_RAD) * sinDLon * sinDLon;
      const rawDist = EARTH_RADIUS_MILES * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
      const distance = Math.round(rawDist * 10) / 10;

      if (selectedRadius > 0 && distance > selectedRadius) continue;
      result.push({ ...opp, distance, lat, lng });
    }

    result.sort((a, b) => a.distance - b.distance);
    return result;
  }, [filteredBase, currentLocation, selectedRadius]);

  // Capped markers to keep rendering snappy
  const markersToRender = useMemo(() => {
    if (enrichedOpportunities.length <= MAX_MAP_PINS) return enrichedOpportunities;
    const subset = enrichedOpportunities.slice(0, MAX_MAP_PINS);
    if (activeOpportunityId && !subset.some((o) => o.id === activeOpportunityId)) {
      const active = enrichedOpportunities.find((o) => o.id === activeOpportunityId);
      if (active) subset.push(active);
    }
    return subset;
  }, [enrichedOpportunities, activeOpportunityId]);

  // Subscribe to Google Maps auth failures (invalid key, domain restriction, billing)
  useEffect(() => {
    return subscribeGoogleMapsAuthFailure(() => {
      setMapsStatus('error');
      setMapsErrorMsg(
        'Google Maps rejected this API key (check that Maps JavaScript API & billing are enabled and localhost is allowed in key restrictions).'
      );
      setShowKeyForm(true);
    });
  }, []);

  // Initialize Google Maps instance once when API key is available
  useEffect(() => {
    if (!apiKey) {
      setMapsStatus('needs-key');
      return;
    }

    let cancelled = false;
    setMapsStatus(hasGoogleMapsAuthFailed() ? 'error' : 'loading');

    loadGoogleMapsLibraries(apiKey)
      .then((libs) => {
        if (cancelled || !mapContainerRef.current) return;
        gmapsLibsRef.current = libs;

        if (!pinIconsRef.current) {
          pinIconsRef.current = createPinIconSet();
        }

        if (!mapInstanceRef.current) {
          const map = new libs.mapsLib.Map(mapContainerRef.current, {
            center: { lat: currentLocation.lat, lng: currentLocation.lng },
            zoom: getZoomForState(selectedRadius, locationSource, gpsAccuracyMeters),
            gestureHandling: 'greedy',
            clickableIcons: false,
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
              position: libs.coreLib.ControlPosition.TOP_LEFT
            },
            zoomControl: true
          });

          const infoWindow = new libs.mapsLib.InfoWindow();
          infoWindowRef.current = infoWindow;

          // Persistent draggable user pin (hidden until user location is active)
          const userMarker = new libs.markerLib.Marker({
            map,
            position: { lat: currentLocation.lat, lng: currentLocation.lng },
            visible: hasUserLocation,
            draggable: true,
            zIndex: 2000,
            title: 'Your reference location (drag to adjust)',
            icon: {
              path: libs.coreLib.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#2563eb',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3
            }
          });

          userMarker.addListener('dragend', () => {
            const pos = userMarker.getPosition();
            if (!pos) return;
            shouldMoveCameraRef.current = false;
            setCurrentLocation({ lat: pos.lat(), lng: pos.lng() });
            setHasUserLocation(true);
            setLocationSource('pin');
            setGpsAccuracyMeters(null);
            setCurrentCityName('Custom Pinned Spot');
            setLocationSuccessNotice(
              `Custom pin: ${pos.lat().toFixed(4)}, ${pos.lng().toFixed(4)}`
            );
          });

          userMarkerRef.current = userMarker;

          // Persistent GPS accuracy circle
          const circle = new libs.mapsLib.Circle({
            map,
            center: { lat: currentLocation.lat, lng: currentLocation.lng },
            radius: gpsAccuracyMeters || 0,
            visible: hasUserLocation && locationSource === 'gps' && Boolean(gpsAccuracyMeters),
            fillColor: '#3b82f6',
            fillOpacity: 0.14,
            strokeColor: '#2563eb',
            strokeOpacity: 0.45,
            strokeWeight: 1.5,
            clickable: false
          });
          accuracyCircleRef.current = circle;

          // Click anywhere on map to place custom reference pin without jolting zoom
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            infoWindow.close();
            shouldMoveCameraRef.current = false;
            setCurrentLocation({ lat, lng });
            setHasUserLocation(true);
            setLocationSource('pin');
            setGpsAccuracyMeters(null);
            setCurrentCityName('Selected Map Spot');
            setLocationSuccessNotice(`Pinned to ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          });

          mapInstanceRef.current = map;
        }

        if (!hasGoogleMapsAuthFailed()) {
          setMapsStatus('ready');
          setMapsErrorMsg('');
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setMapsStatus('error');
        setMapsErrorMsg(err?.message || 'Failed to load Google Maps JavaScript API.');
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Clean up Google Map listeners & markers only on unmount
  useEffect(() => {
    return () => {
      markersMapRef.current.forEach(({ marker }) => marker.setMap(null));
      markersMapRef.current.clear();
      userMarkerRef.current?.setMap(null);
      accuracyCircleRef.current?.setMap(null);
      infoWindowRef.current?.close();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update user marker, accuracy circle, and camera smoothly in place
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userMarker = userMarkerRef.current;
    const circle = accuracyCircleRef.current;
    if (!map || !userMarker || !circle || mapsStatus !== 'ready') return;

    const pos = { lat: currentLocation.lat, lng: currentLocation.lng };
    userMarker.setPosition(pos);
    userMarker.setVisible(hasUserLocation);

    const showAccuracy =
      hasUserLocation && locationSource === 'gps' && Boolean(gpsAccuracyMeters);
    circle.setCenter(pos);
    circle.setRadius(gpsAccuracyMeters || 0);
    circle.setVisible(showAccuracy);

    if (shouldMoveCameraRef.current) {
      shouldMoveCameraRef.current = false;
      map.panTo(pos);
      map.setZoom(getZoomForState(selectedRadius, locationSource, gpsAccuracyMeters));
    }
  }, [
    currentLocation,
    hasUserLocation,
    locationSource,
    gpsAccuracyMeters,
    selectedRadius,
    mapsStatus
  ]);

  // Diff-sync opportunity markers on Google Maps (zero clearLayers thrashing)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const libs = gmapsLibsRef.current;
    const icons = pinIconsRef.current;
    if (!map || !libs || !icons || mapsStatus !== 'ready') return;

    const existing = markersMapRef.current;
    const nextIds = new Set(markersToRender.map((o) => o.id));

    // Remove markers no longer in subset
    existing.forEach((entry, id) => {
      if (!nextIds.has(id)) {
        entry.marker.setMap(null);
        existing.delete(id);
      }
    });

    // Add new markers or update rank/data on existing markers
    markersToRender.forEach((opp, index) => {
      const isSelected = activeOpportunityId === opp.id;
      const rankText = String(index + 1);
      const found = existing.get(opp.id);

      if (found) {
        found.opp = opp;
        const currentLabel = found.marker.getLabel();
        if (typeof currentLabel === 'object' && currentLabel?.text !== rankText) {
          found.marker.setLabel({
            text: rankText,
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: '700'
          });
        }
        found.marker.setIcon(getMarkerIconForOpp(opp, isSelected, icons));
        found.marker.setZIndex(isSelected ? 900 : opp.isUrgent ? 500 : 100);
        return;
      }

      const marker = new libs.markerLib.Marker({
        map,
        position: { lat: opp.lat, lng: opp.lng },
        optimized: true,
        zIndex: isSelected ? 900 : opp.isUrgent ? 500 : 100,
        icon: getMarkerIconForOpp(opp, isSelected, icons),
        label: {
          text: rankText,
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: '700'
        },
        title: opp.title
      });

      marker.addListener('click', () => {
        const latest = markersMapRef.current.get(opp.id)?.opp || opp;
        setActiveOpportunityId(latest.id);
        map.panTo({ lat: latest.lat, lng: latest.lng });
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(
            buildInfoWindowElement(
              latest,
              (o) => onSelectRef.current(o),
              (o) => onApplyRef.current(o)
            )
          );
          infoWindowRef.current.open({ map, anchor: marker });
        }
      });

      existing.set(opp.id, { marker, opp });
    });

    prevActiveIdRef.current = activeOpportunityId;
  }, [markersToRender, mapsStatus]);

  // O(1) marker highlight update when activeOpportunityId changes
  useEffect(() => {
    const icons = pinIconsRef.current;
    if (!icons || mapsStatus !== 'ready') return;

    const prevId = prevActiveIdRef.current;
    if (prevId && prevId !== activeOpportunityId) {
      const prevEntry = markersMapRef.current.get(prevId);
      if (prevEntry) {
        prevEntry.marker.setIcon(getMarkerIconForOpp(prevEntry.opp, false, icons));
        prevEntry.marker.setZIndex(prevEntry.opp.isUrgent ? 500 : 100);
      }
    }

    if (activeOpportunityId) {
      const nextEntry = markersMapRef.current.get(activeOpportunityId);
      if (nextEntry) {
        nextEntry.marker.setIcon(getMarkerIconForOpp(nextEntry.opp, true, icons));
        nextEntry.marker.setZIndex(900);
      }
    }

    prevActiveIdRef.current = activeOpportunityId;
  }, [activeOpportunityId, mapsStatus]);

  const handleCitySelect = useCallback((city: (typeof POPULAR_CITIES)[0]) => {
    shouldMoveCameraRef.current = true;
    setCurrentLocation({ lat: city.lat, lng: city.lng });
    setHasUserLocation(true);
    setLocationSource('city');
    setGpsAccuracyMeters(null);
    setGpsErrorMessage('');
    setCurrentCityName(`${city.name}, ${city.state}`);
    setLocationSuccessNotice(`Focused on ${city.name}, ${city.state}`);
    setActiveOpportunityId(null);
  }, []);

  const handleWorldwideReset = useCallback(() => {
    shouldMoveCameraRef.current = true;
    setCurrentLocation(DEFAULT_WORLD_CENTER);
    setHasUserLocation(false);
    setLocationSource('none');
    setGpsAccuracyMeters(null);
    setCurrentCityName('Worldwide (All Continents)');
    setSelectedRadius(0);
    setLocationSuccessNotice('Showing volunteer places worldwide');
    setGpsErrorMessage('');
    setActiveOpportunityId(null);
    infoWindowRef.current?.close();
  }, []);

  const handleOpportunityCardClick = useCallback((opp: EnrichedOpportunity) => {
    setActiveOpportunityId(opp.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.panTo({ lat: opp.lat, lng: opp.lng });
      if ((map.getZoom() || 3) < 10) {
        map.setZoom(12);
      }
      const entry = markersMapRef.current.get(opp.id);
      if (entry && infoWindowRef.current) {
        infoWindowRef.current.setContent(
          buildInfoWindowElement(
            entry.opp,
            (o) => onSelectRef.current(o),
            (o) => onApplyRef.current(o)
          )
        );
        infoWindowRef.current.open({ map, anchor: entry.marker });
      }
    }
  }, []);

  const handleSelectFromRow = useCallback((opp: Opportunity) => {
    onSelectRef.current(opp);
  }, []);

  const handleApplyFromRow = useCallback((opp: Opportunity) => {
    onApplyRef.current(opp);
  }, []);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = apiKeyInput.trim();
    if (!cleaned) return;
    const { needsReload } = saveGoogleMapsApiKey(cleaned);
    if (needsReload) {
      window.location.reload();
      return;
    }
    setApiKey(cleaned);
    setShowKeyForm(false);
    setMapsErrorMsg('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const match = findExactCityCoords(searchLocQuery);
      if (match) {
        shouldMoveCameraRef.current = true;
        setCurrentLocation(match.coords);
        setHasUserLocation(true);
        setLocationSource('city');
        setGpsAccuracyMeters(null);
        setCurrentCityName(match.label);
        setLocationSuccessNotice(`Focused on ${match.label}`);
      }
    }
  };

  const handleRadiusChange = (radius: number) => {
    shouldMoveCameraRef.current = true;
    setSelectedRadius(radius);
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}>
      {/* Top Header & Search Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              Google Maps • Worldwide Volunteer Places & Citizen Requests
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Explore Volunteer Places & Requests Near You
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Hardware-accelerated Google Map synced with your actual GPS location and global volunteer hubs.
            </p>
          </div>

          {/* Location Search & Real GPS Ping */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Type city (e.g. Tirana, Berlin, New York)..."
                value={searchLocQuery}
                onChange={(e) => setSearchLocQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64 shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => pingActualLocation(false)}
              disabled={gpsStatus === 'locating'}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition inline-flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap disabled:opacity-60"
            >
              {gpsStatus === 'locating' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Pinging GPS...</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-3.5 h-3.5" />
                  <span>Ping My Location</span>
                </>
              )}
            </button>

            {!isEnvGoogleMapsKeySet() && (
              <button
                type="button"
                onClick={() => setShowKeyForm((prev) => !prev)}
                className="h-8 px-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition inline-flex items-center justify-center gap-1 shrink-0"
                title="Configure Google Maps API key"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Maps Key</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Hub Selector Pills */}
        <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-1.5 pt-2.5 pb-1.5 sm:pb-0.5 -mx-1 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Global Hubs:
          </span>
          <button
            type="button"
            onClick={handleWorldwideReset}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold transition whitespace-nowrap border shrink-0 ${
              locationSource === 'none' && selectedRadius === 0
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Worldwide (All)
          </button>
          {POPULAR_CITIES.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={`h-7 px-2.5 rounded-md text-xs font-semibold transition whitespace-nowrap border shrink-0 ${
                locationSource === 'city' &&
                currentCityName.toLowerCase().includes(city.name.toLowerCase())
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>

        {/* GPS Status & Instruction Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] text-blue-700 bg-blue-50/80 px-2.5 py-1.5 rounded-lg border border-blue-200/60 mt-2">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>
              Click anywhere on Google Maps or drag the blue pin to recalculate exact distances in real time.
            </span>
          </div>
          {locationSuccessNotice && (
            <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/60 inline-flex items-center gap-1 break-words max-w-full">
              {locationSource === 'gps' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
              <span>{locationSuccessNotice}</span>
            </span>
          )}
        </div>

        {/* Real GPS Permission / Retry Banner (shown if browser GPS failed or was denied) */}
        {(gpsStatus === 'denied' ||
          gpsStatus === 'timeout' ||
          gpsStatus === 'unavailable' ||
          gpsStatus === 'unsupported') && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Could not ping your actual GPS location: </span>
                <span>{gpsErrorMessage}</span>
              </div>
            </div>
            {gpsStatus !== 'unsupported' && (
              <button
                type="button"
                onClick={() => pingActualLocation(false)}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 transition"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Retry Location Ping</span>
              </button>
            )}
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-3 border-t border-slate-200/60">
          <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Radius:
            </span>
            {[
              { label: 'Worldwide', value: 0 },
              { label: '< 25 mi', value: 25 },
              { label: '< 100 mi', value: 100 },
              { label: '< 500 mi', value: 500 },
              { label: '< 2000 mi', value: 2000 }
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRadiusChange(r.value)}
                className={`h-7 px-2.5 rounded-md text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                  selectedRadius === r.value
                    ? 'bg-blue-100 text-blue-800 border border-blue-300 font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={requestsOnly}
                  onChange={(e) => setRequestsOnly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span>Citizen Requests Only</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                />
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Urgent Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dedicated Mobile View Switcher (Map vs Ranked List) */}
        <div className="grid grid-cols-2 sm:hidden gap-1.5 pt-3">
          <button
            type="button"
            onClick={() => setMobileView('map')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
              mobileView === 'map'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('list')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition ${
              mobileView === 'list'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List ({enrichedOpportunities.length})</span>
          </button>
        </div>
      </div>

      {/* Main Google Maps Viewport & Ranked Closest Places */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Google Maps Container */}
        <div
          className={`lg:col-span-7 relative h-[360px] sm:h-[440px] lg:h-auto min-h-[380px] bg-slate-100 ${
            mobileView === 'list' ? 'hidden sm:block' : 'block'
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Google Maps API Key Setup / Error Overlay */}
          {(mapsStatus === 'needs-key' || mapsStatus === 'error' || showKeyForm) && (
            <div className="absolute inset-0 z-20 bg-slate-900/55 backdrop-blur-xs flex items-center justify-center p-4">
              <form
                onSubmit={handleSaveApiKey}
                className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Google Maps API Key Required
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Enter a Google Maps JavaScript API key or add{' '}
                        <code className="bg-slate-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to{' '}
                        <code className="bg-slate-100 px-1 rounded">.env</code>
                      </p>
                    </div>
                  </div>
                  {mapsStatus === 'ready' && (
                    <button
                      type="button"
                      onClick={() => setShowKeyForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      Close
                    </button>
                  )}
                </div>

                {mapsErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700">
                    {mapsErrorMsg}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <label className="font-semibold text-slate-700">
                      Maps JavaScript API Key
                    </label>
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
                    >
                      <span>Get API Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="AIzaSy..."
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Save Key & Load Google Maps
                </button>
              </form>
            </div>
          )}

          {/* Loading overlay */}
          {mapsStatus === 'loading' && !showKeyForm && (
            <div className="absolute inset-0 z-10 bg-slate-50/80 flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-4 py-2.5 rounded-xl shadow border border-slate-200">
                <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Loading Google Maps...</span>
              </div>
            </div>
          )}

          {/* Floating Map Overlay Badge */}
          <div className="absolute top-12 left-2.5 sm:top-3 sm:left-auto sm:right-14 z-10 bg-white/95 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-slate-800 pointer-events-none">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span>
              {enrichedOpportunities.length} locations
              {enrichedOpportunities.length > markersToRender.length && (
                <span className="hidden sm:inline text-[10px] text-slate-400 font-normal ml-1">
                  (showing {markersToRender.length} nearest pins)
                </span>
              )}
            </span>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-2.5 z-10 bg-white/95 px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] text-slate-600 flex-wrap max-w-[calc(100%-3.5rem)]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-slate-900" />
              <span>Organization Drive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-600" />
              <span>Citizen Request</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span>Urgent Need</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-xs" />
              <span>Your Reference</span>
            </div>
          </div>
        </div>

        {/* Closest Places Ranked List */}
        <div
          className={`lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-slate-50/40 ${
            mobileView === 'map' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <div className="p-3.5 border-b border-slate-200/80 bg-white flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              Ranked by Distance ({enrichedOpportunities.length})
            </span>
            <span className="text-[11px] text-slate-400">
              {hasUserLocation ? 'Closest to your pin' : 'Closest to reference'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[460px] p-3 space-y-2.5">
            {enrichedOpportunities.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">
                  No Volunteer Places in this radius
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Try expanding the distance filter to "Worldwide" or choose a different global city above.
                </p>
                <button
                  type="button"
                  onClick={() => handleRadiusChange(0)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                >
                  Show All Worldwide Locations
                </button>
              </div>
            ) : (
              <>
                {enrichedOpportunities.slice(0, listLimit).map((opp, idx) => (
                  <MapOpportunityRow
                    key={opp.id}
                    opp={opp}
                    index={idx}
                    isActive={activeOpportunityId === opp.id}
                    onCardClick={handleOpportunityCardClick}
                    onSelect={handleSelectFromRow}
                    onApply={handleApplyFromRow}
                  />
                ))}

                {enrichedOpportunities.length > listLimit && (
                  <div className="pt-2 text-center pb-2">
                    <button
                      type="button"
                      onClick={() => setListLimit((prev) => prev + 35)}
                      className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      Show More Places ({enrichedOpportunities.length - listLimit} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
