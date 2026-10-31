import { useSyncExternalStore } from 'react';

import type { LocationReference } from '@/types/location';

let currentLocationReference: LocationReference | null = null;

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLocationReference;
}

function getServerSnapshot() {
  return null;
}

export function setLocationReference(
  reference: LocationReference | null,
): void {
  currentLocationReference = reference;
  listeners.forEach((listener) => listener());
}

export function useLocationReference() {
  const locationReference = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    locationReference,
    setLocationReference,
  };
}
