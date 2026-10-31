import type { Coordinates } from '@/types/api';
import type { LocationAddress } from '@/types/location';

interface BrasilApiCepResponse {
  cep?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  street?: string;
  location?: {
    coordinates?: {
      latitude?: string | number;
      longitude?: string | number;
    };
  };
}

export interface CepReferenceResult {
  address: LocationAddress;
  coordinates: Coordinates | null;
}

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function parseBrasilApiCep(
  payload: BrasilApiCepResponse,
): CepReferenceResult {
  const latitudeValue = payload.location?.coordinates?.latitude;
  const longitudeValue = payload.location?.coordinates?.longitude;
  const latitude =
    latitudeValue === undefined || String(latitudeValue).trim() === ''
      ? Number.NaN
      : Number(latitudeValue);
  const longitude =
    longitudeValue === undefined || String(longitudeValue).trim() === ''
      ? Number.NaN
      : Number(longitudeValue);

  const coordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
      ? { latitude, longitude }
      : null;

  return {
    address: {
      street: clean(payload.street),
      neighborhood: clean(payload.neighborhood),
      city: clean(payload.city),
      state: clean(payload.state),
      postalCode: clean(payload.cep),
    },
    coordinates,
  };
}

export async function lookupCepReference(
  cep: string,
): Promise<CepReferenceResult> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8) {
    throw new Error('Informe um CEP com oito dígitos.');
  }

  const response = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${digits}`,
    { headers: { Accept: 'application/json' } },
  );

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'CEP não encontrado. Confira os números e tente novamente.'
        : 'O serviço de CEP está indisponível no momento.',
    );
  }

  return parseBrasilApiCep(
    (await response.json()) as BrasilApiCepResponse,
  );
}
