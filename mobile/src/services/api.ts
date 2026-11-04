import type {
  ApiItemResponse,
  ApiListResponse,
  CenterProfile,
  CollectionRequestConfirmation,
  CollectionRequestInput,
  Material,
} from '@/types/api';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (configuredBaseUrl || 'http://127.0.0.1:3000').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Confira se o backend está em execução.',
      0,
    );
  }

  if (!response.ok) {
    let message = 'A API não conseguiu concluir a operação.';
    try {
      const body = (await response.json()) as { message?: unknown };
      if (typeof body.message === 'string' && body.message.trim()) {
        message = body.message;
      }
    } catch {
      // Mantém a mensagem genérica quando a resposta não contém JSON.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export interface CenterFilters {
  q?: string;
  material?: string;
  offersPickup?: boolean;
}

export async function listCenters(filters: CenterFilters = {}): Promise<CenterProfile[]> {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set('q', filters.q.trim());
  if (filters.material) params.set('material', filters.material);
  if (filters.offersPickup !== undefined) {
    params.set('offersPickup', String(filters.offersPickup));
  }

  const query = params.toString();
  const response = await requestJson<ApiListResponse<CenterProfile>>(
    `/centers${query ? `?${query}` : ''}`,
  );
  return response.data;
}

export async function getCenter(id: number): Promise<CenterProfile> {
  const response = await requestJson<ApiItemResponse<CenterProfile>>(
    `/centers/${encodeURIComponent(String(id))}`,
  );
  return response.data;
}

export async function listMaterials(): Promise<Material[]> {
  const response = await requestJson<ApiListResponse<Material>>('/materials');
  return response.data;
}

export async function createCollectionRequest(
  input: CollectionRequestInput,
): Promise<CollectionRequestConfirmation> {
  const response = await requestJson<ApiItemResponse<CollectionRequestConfirmation>>(
    '/collection-requests',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}
