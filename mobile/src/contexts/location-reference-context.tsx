import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { LocationReference } from '@/types/location';

interface LocationReferenceContextValue {
  locationReference: LocationReference | null;
  setLocationReference: (reference: LocationReference | null) => void;
}

const LocationReferenceContext =
  createContext<LocationReferenceContextValue | null>(null);

export function LocationReferenceProvider({
  children,
}: PropsWithChildren) {
  const [locationReference, setLocationReference] =
    useState<LocationReference | null>(null);

  const value = useMemo(
    () => ({ locationReference, setLocationReference }),
    [locationReference],
  );

  return (
    <LocationReferenceContext.Provider value={value}>
      {children}
    </LocationReferenceContext.Provider>
  );
}

export function useLocationReference() {
  const context = useContext(LocationReferenceContext);

  if (!context) {
    throw new Error(
      'useLocationReference deve ser usado dentro de LocationReferenceProvider.',
    );
  }

  return context;
}
