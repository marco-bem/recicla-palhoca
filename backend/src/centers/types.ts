import type { Request, Response } from "express";

export interface CenterFilters {
  q?: string;
  neighborhood?: string;
  material?: string;
  offersPickup?: boolean;
}

export interface OpeningHourInput {
  dayOfWeek: number;
  periodNumber: number;
  opensAt: string;
  closesAt: string;
}

export interface CenterInput {
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
  openingHours: OpeningHourInput[];
  materialIds: number[];
}

export type CenterOpeningHour = OpeningHourInput;

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

export interface CentersRepository {
  listPublic(filters: CenterFilters): Promise<CenterProfile[]>;
  findPublicById(id: number): Promise<CenterProfile | null>;
  createForUser(userId: number, input: CenterInput): Promise<CenterProfile>;
  updateForUser(userId: number, id: number, input: CenterInput): Promise<CenterProfile | null>;
  deactivateForUser(userId: number, id: number): Promise<boolean>;
}

export type AuthenticatedUserIdResolver = (
  request: Request,
  response: Response
) => number | null;
