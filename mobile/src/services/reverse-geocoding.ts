import type { Coordinates } from '@/types/api';
import type { LocationAddress } from '@/types/location';

interface PhotonProperties {
  name?: string;
  osm_value?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  district?: string;
  locality?: string;
  city?: string;
  county?: string;
  state?: string;
}

interface PhotonResponse {
  features?: {
    properties?: PhotonProperties;
  }[];
}

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function parsePhotonAddress(
  payload: PhotonResponse,
): LocationAddress | null {
  const properties = payload.features?.[0]?.properties;
  if (!properties) return null;

  const placeName = clean(properties.name);
  const isNeighborhood =
    properties.osm_value === 'suburb' ||
    properties.osm_value === 'neighbourhood' ||
    properties.osm_value === 'quarter';

  const address: LocationAddress = {
    street: clean(properties.street),
    streetNumber: clean(properties.housenumber),
    placeName,
    neighborhood:
      (isNeighborhood ? placeName : undefined) ??
      clean(properties.district) ??
      clean(properties.locality),
    city: clean(properties.city) ?? clean(properties.county),
    state: clean(properties.state),
    postalCode: clean(properties.postcode),
  };

  return Object.values(address).some(Boolean) ? address : null;
}

export async function reverseGeocodeCoordinates(
  coordinates: Coordinates,
): Promise<LocationAddress | null> {
  const url = new URL('https://photon.komoot.io/reverse');
  url.searchParams.set('lat', String(coordinates.latitude));
  url.searchParams.set('lon', String(coordinates.longitude));
  url.searchParams.set('lang', 'default');
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/geo+json, application/json' },
  });

  if (!response.ok) {
    throw new Error('Não foi possível identificar o endereço desta localização.');
  }

  const payload = (await response.json()) as PhotonResponse;
  return parsePhotonAddress(payload);
}
