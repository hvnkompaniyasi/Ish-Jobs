/**
 * Geospatial yordamchilar — Haversine masofa va formatlash.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

const R_EARTH_KM = 6371;

/** Ikki nuqta orasidagi masofa (km), Haversine formulasi */
export function haversineKm(a: LatLng, b: LatLng): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R_EARTH_KM * Math.asin(Math.sqrt(h));
}

/** "1.8 km", "350 m", "12 km" ko'rinishida formatlash */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** GeoJSON [lng, lat] → { lat, lng } */
export function coordsToLatLng(coords: [number, number]): LatLng {
  return { lat: coords[1], lng: coords[0] };
}
