import type { Coordinates } from '../types/api';

export function parseCoordinates(
  latitude: unknown,
  longitude: unknown,
): Coordinates | null {
  const isCoordinateValue = (value: unknown): value is string | number =>
    (typeof value === 'number' && Number.isFinite(value)) ||
    (typeof value === 'string' && value.trim().length > 0);

  if (!isCoordinateValue(latitude) || !isCoordinateValue(longitude)) {
    return null;
  }

  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (
    !Number.isFinite(parsedLatitude) ||
    !Number.isFinite(parsedLongitude) ||
    parsedLatitude < -90 ||
    parsedLatitude > 90 ||
    parsedLongitude < -180 ||
    parsedLongitude > 180
  ) {
    return null;
  }

  return { latitude: parsedLatitude, longitude: parsedLongitude };
}
