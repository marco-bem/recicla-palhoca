import type { Coordinates } from './api';

export interface LocationAddress {
  street?: string;
  streetNumber?: string;
  placeName?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface LocationReference {
  coordinates: Coordinates;
  source: 'gps' | 'cep';
  label: string;
  address: LocationAddress | null;
}
