import type { CenterProfile, Coordinates } from '../types/api';

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceKm(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export function sortCentersByDistance(
  centers: CenterProfile[],
  reference: Coordinates | null,
): CenterProfile[] {
  const items = [...centers];

  if (!reference) {
    return items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }

  return items.sort((a, b) => {
    const aLatitude = a.coordinates.latitude;
    const aLongitude = a.coordinates.longitude;
    const bLatitude = b.coordinates.latitude;
    const bLongitude = b.coordinates.longitude;

    const aDistance =
      aLatitude === null || aLongitude === null
        ? Number.POSITIVE_INFINITY
        : distanceKm(reference, { latitude: aLatitude, longitude: aLongitude });
    const bDistance =
      bLatitude === null || bLongitude === null
        ? Number.POSITIVE_INFINITY
        : distanceKm(reference, { latitude: bLatitude, longitude: bLongitude });

    return aDistance - bDistance || a.name.localeCompare(b.name, 'pt-BR');
  });
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1).replace('.', ',')} km`;
}
