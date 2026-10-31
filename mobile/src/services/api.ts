import type {
  ApiItemResponse,
  ApiListResponse,
  CenterProfile,
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

async function getJson<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar à API. Confira se o backend está em execução.',
      0,
    );
  }

  if (!response.ok) {
    let message = 'A API não conseguiu concluir a consulta.';
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
  const response = await getJson<ApiListResponse<CenterProfile>>(
    `/centers${query ? `?${query}` : ''}`,
  );
  return response.data;
}

export async function getCenter(id: number): Promise<CenterProfile> {
  const response = await getJson<ApiItemResponse<CenterProfile>>(
    `/centers/${encodeURIComponent(String(id))}`,
  );
  return response.data;
}

export async function listMaterials(): Promise<Material[]> {
  const response = await getJson<ApiListResponse<Material>>('/materials');
  return response.data;
}
