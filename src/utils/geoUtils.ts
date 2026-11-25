export interface Coordinates {
  lat: number;
  lng: number;
}

export const POPULAR_CITIES: { name: string; state: string; lat: number; lng: number }[] = [
  { name: 'Prishtina', state: 'Kosovo', lat: 42.6629, lng: 21.1655 },
  { name: 'Tirana', state: 'Albania', lat: 41.3275, lng: 19.8187 },
  { name: 'Berlin', state: 'Germany', lat: 52.5200, lng: 13.4050 },
  { name: 'London', state: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris', state: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Rome', state: 'Italy', lat: 41.9028, lng: 12.4964 },
  { name: 'Vienna', state: 'Austria', lat: 48.2082, lng: 16.3738 },
  { name: 'Amsterdam', state: 'Netherlands', lat: 52.3676, lng: 4.9041 },
  { name: 'Zurich', state: 'Switzerland', lat: 47.3769, lng: 8.5417 },
  { name: 'Madrid', state: 'Spain', lat: 40.4168, lng: -3.7038 },
  { name: 'New York', state: 'USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Tokyo', state: 'Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Nairobi', state: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Sydney', state: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'São Paulo', state: 'Brazil', lat: -23.5505, lng: -46.6333 },
  { name: 'Toronto', state: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Skopje', state: 'North Macedonia', lat: 41.9960, lng: 21.4316 }
];

export const CITY_COORDINATES: Record<string, Coordinates> = {
  // Balkan & European Hubs
  'prishtina': { lat: 42.6629, lng: 21.1655 },
  'pristina': { lat: 42.6629, lng: 21.1655 },
  'prishtine': { lat: 42.6629, lng: 21.1655 },
  'germia': { lat: 42.6730, lng: 21.2000 },
  'dardania': { lat: 42.6550, lng: 21.1550 },
  'ulpiana': { lat: 42.6510, lng: 21.1620 },
  'tirana': { lat: 41.3275, lng: 19.8187 },
  'tirane': { lat: 41.3275, lng: 19.8187 },
  'blloku': { lat: 41.3200, lng: 19.8170 },
  'parku i liqenit': { lat: 41.3120, lng: 19.8210 },
  'kombinat': { lat: 41.3100, lng: 19.7800 },
  'durres': { lat: 41.3230, lng: 19.4560 },
  'prizren': { lat: 42.2150, lng: 20.7410 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'roma': { lat: 41.9028, lng: 12.4964 },
  'vienna': { lat: 48.2082, lng: 16.3738 },
  'wien': { lat: 48.2082, lng: 16.3738 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'zurich': { lat: 47.3769, lng: 8.5417 },
  'zürich': { lat: 47.3769, lng: 8.5417 },
  'madrid': { lat: 40.4168, lng: -3.7038 },
  'barcelona': { lat: 41.3879, lng: 2.1699 },
  'milan': { lat: 45.4642, lng: 9.1900 },
  'milano': { lat: 45.4642, lng: 9.1900 },
  'brussels': { lat: 50.8503, lng: 4.3517 },
  'munich': { lat: 48.1351, lng: 11.5820 },
  'prague': { lat: 50.0755, lng: 14.4378 },
  'warsaw': { lat: 52.2297, lng: 21.0122 },
  'athens': { lat: 37.9838, lng: 23.7275 },
  'stockholm': { lat: 59.3293, lng: 18.0686 },
  'copenhagen': { lat: 55.6761, lng: 12.5683 },
  'dublin': { lat: 53.3498, lng: -6.2603 },
  'oslo': { lat: 59.9139, lng: 10.7522 },
  'helsinki': { lat: 60.1699, lng: 24.9384 },
  'lisbon': { lat: 38.7223, lng: -9.1393 },
  'zagreb': { lat: 45.8150, lng: 15.9819 },
  'sarajevo': { lat: 43.8563, lng: 18.4131 },
  'belgrade': { lat: 44.7866, lng: 20.4489 },
  'sofia': { lat: 42.6977, lng: 23.3219 },
  'bucharest': { lat: 44.4268, lng: 26.1025 },
  'budapest': { lat: 47.4979, lng: 19.0402 },
  // Other Continents
  'new york': { lat: 40.7128, lng: -74.0060 },
  'nyc': { lat: 40.7128, lng: -74.0060 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'nairobi': { lat: -1.2921, lng: 36.8219 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
  'são paulo': { lat: -23.5505, lng: -46.6333 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  // Skopje & Municipalities
  'skopje': { lat: 41.9960, lng: 21.4316 },
  'karposh': { lat: 42.0035, lng: 21.3980 },
  'centar': { lat: 41.9960, lng: 21.4316 },
  'debar maalo': { lat: 42.0005, lng: 21.4215 },
  'taftalidze': { lat: 41.9990, lng: 21.3910 },
  'aerodrom': { lat: 41.9820, lng: 21.4640 },
  'kisela voda': { lat: 41.9750, lng: 21.4420 },
  'cair': { lat: 42.0080, lng: 21.4410 },
  'saraj': { lat: 41.9989, lng: 21.3278 },
  'suto orizari': { lat: 42.0350, lng: 21.4250 }
};

/**
 * Calculates distance in miles between two latitude/longitude points (Haversine formula)
 */
export function calculateDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Calculates distance in kilometers between two latitude/longitude points (Haversine formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

export function formatDualDistance(miles: number): string {
  const km = Math.round(miles * 1.60934 * 10) / 10;
  return `${km} km (${miles} mi)`;
}

/**
 * Resolve coordinates for a given city/neighborhood string with Skopje Center as default
 */
export function getCityCoordinates(cityName: string): Coordinates {
  if (!cityName) return { lat: 41.9960, lng: 21.4316 };
  const clean = cityName.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }
  return { lat: 41.9960, lng: 21.4316 };
}
