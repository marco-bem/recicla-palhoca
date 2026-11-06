import type {
  ApiItemResponse,
  ApiListResponse,
  CenterProfile,
  CenterWriteInput,
  CollectionRequestConfirmation,
  CollectionRequestInput,
  CollectionRequestStatus,
  Material,
  ManagedCollectionRequest,
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

  if (response.status === 204) return undefined as T;
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
      body: JSON.stringify({ ...input, preferredDate: input.preferredDate || null }),
    },
  );
  return response.data;
}

export async function lookupCollectionRequest(
  protocol: string,
  requesterPhone: string,
): Promise<CollectionRequestStatus> {
  const response = await requestJson<ApiItemResponse<CollectionRequestStatus>>(
    '/collection-requests/lookup',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocol, requesterPhone }),
    },
  );
  return response.data;
}

export async function loginCenterManager(email: string, password: string) {
  const { token } = await requestJson<{ token: string }>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return token;
}

export async function listManagedRequests(token: string, status?: CollectionRequestStatus['status']) {
  const query = status ? `?status=${status}` : '';
  const { data } = await requestJson<ApiItemResponse<{
    centerName: string;
    requests: ManagedCollectionRequest[];
  }>>(`/center-collection-requests${query}`, { headers: { Authorization: `Bearer ${token}` } });
  return data;
}

export async function getManagedRequest(token: string, protocol: string) {
  const { data } = await requestJson<ApiItemResponse<ManagedCollectionRequest>>(
    `/center-collection-requests/${encodeURIComponent(protocol)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return data;
}

export async function updateManagedRequest(
  token: string,
  protocol: string,
  status: Exclude<CollectionRequestStatus['status'], 'PENDENTE'>,
  reason?: string,
) {
  const { data } = await requestJson<ApiItemResponse<Pick<CollectionRequestStatus, 'protocol' | 'status'>>>(
    `/center-collection-requests/${encodeURIComponent(protocol)}/status`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason }),
    },
  );
  return data;
}

export async function registerCenterManager(fullName: string, email: string, password: string) {
  const { token } = await requestJson<{ token: string }>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });
  return token;
}

export async function getOwnCenter(token: string) {
  const { data } = await requestJson<ApiItemResponse<CenterProfile | null>>('/centers/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function saveOwnCenter(token: string, input: CenterWriteInput, id?: number) {
  const { data } = await requestJson<ApiItemResponse<CenterProfile>>(id ? `/centers/${id}` : '/centers', {
    method: id ? 'PUT' : 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return data;
}

export async function deactivateOwnCenter(token: string, id: number) {
  await requestJson<void>(`/centers/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
