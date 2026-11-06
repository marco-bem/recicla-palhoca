export interface Material {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CenterOpeningHour {
  dayOfWeek: number;
  periodNumber: number;
  opensAt: string;
  closesAt: string;
}

export interface CenterMaterial {
  id: number;
  name: string;
  slug: string;
}

export interface CenterProfile {
  id: number;
  name: string;
  publicPhone: string;
  address: {
    postalCode: string;
    street: string;
    streetNumber: string;
    complement: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  services: {
    acceptsDropoff: boolean;
    offersPickup: boolean;
  };
  isActive: boolean;
  openingHours: CenterOpeningHour[];
  materials: CenterMaterial[];
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiItemResponse<T> {
  data: T;
}

export interface CollectionRequestForm {
  requesterName: string;
  requesterPhone: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  preferredDate: string;
  preferredPeriod: string;
  notes: string;
}

export interface CollectionRequestInput extends CollectionRequestForm {
  centerId: number;
  materialIds: number[];
}

export interface CollectionRequestConfirmation {
  protocol: string;
  status: 'PENDENTE';
}

export interface CollectionRequestStatus {
  protocol: string;
  status: 'PENDENTE' | 'ACEITA' | 'RECUSADA' | 'CONCLUIDA';
  centerName: string;
  address: string;
  preferredDate: string | null;
  preferredPeriod: string | null;
  materials: string[];
}

export interface ManagedCollectionRequest extends CollectionRequestStatus {
  requesterName: string;
  requestedAt: string;
}

export interface CenterWriteInput {
  name: string;
  publicPhone: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  addressComplement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  acceptsDropoff: boolean;
  offersPickup: boolean;
  openingHours: CenterOpeningHour[];
  materialIds: number[];
}
