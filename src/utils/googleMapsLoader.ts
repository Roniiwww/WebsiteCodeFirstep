import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const STORAGE_KEY = 'giveback_google_maps_api_key';

export interface LoadedGoogleMaps {
  mapsLib: google.maps.MapsLibrary;
  markerLib: google.maps.MarkerLibrary;
  coreLib: google.maps.CoreLibrary;
}

let initializedKey: string | null = null;
let loadedLibrariesPromise: Promise<LoadedGoogleMaps> | null = null;
let authFailed = false;
const authFailureListeners = new Set<() => void>();

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export function getSavedGoogleMapsApiKey(): string {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  if (envKey) return envKey;
  try {
    return (localStorage.getItem(STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function saveGoogleMapsApiKey(apiKey: string): { needsReload: boolean } {
  const cleanKey = apiKey.trim();
  try {
    if (cleanKey) {
      localStorage.setItem(STORAGE_KEY, cleanKey);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }

  // Google Maps JS API can only be bootstrapped once per document lifecycle
  const alreadyBootstrapped =
    initializedKey !== null || Boolean(window.google?.maps?.importLibrary);

  return { needsReload: alreadyBootstrapped && initializedKey !== cleanKey };
}

export function isEnvGoogleMapsKeySet(): boolean {
  return Boolean((import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim());
}

export function subscribeGoogleMapsAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);
  if (authFailed) {
    listener();
  }
  return () => {
    authFailureListeners.delete(listener);
  };
}

export function hasGoogleMapsAuthFailed(): boolean {
  return authFailed;
}

export async function loadGoogleMapsLibraries(
  apiKey: string
): Promise<LoadedGoogleMaps> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Google Maps API key is required.');
  }

  if (typeof window !== 'undefined' && !window.gm_authFailure) {
    window.gm_authFailure = () => {
      authFailed = true;
      authFailureListeners.forEach((fn) => fn());
    };
  }

  if (!loadedLibrariesPromise) {
    authFailed = false;
    initializedKey = cleanKey;
    setOptions({
      key: cleanKey,
      v: 'weekly'
    });
    loadedLibrariesPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('core')
    ])
      .then(([mapsLib, markerLib, coreLib]) => ({
        mapsLib,
        markerLib,
        coreLib
      }))
      .catch((err) => {
        loadedLibrariesPromise = null;
        throw err;
      });
  }

  return loadedLibrariesPromise;
}
