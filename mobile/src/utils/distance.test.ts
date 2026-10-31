import type { CenterProfile } from '@/types/api';
import { distanceKm, formatDistance, sortCentersByDistance } from './distance';

function center(
  id: number,
  name: string,
  latitude: number | null,
  longitude: number | null,
): CenterProfile {
  return {
    id,
    name,
    publicPhone: '4833334444',
    address: {
      postalCode: '88130000',
      street: 'Rua de Exemplo',
      streetNumber: '100',
      complement: null,
      neighborhood: 'Centro',
      city: 'Palhoça',
      state: 'SC',
    },
    coordinates: { latitude, longitude },
    services: { acceptsDropoff: true, offersPickup: false },
    isActive: true,
    openingHours: [
      { dayOfWeek: 1, periodNumber: 1, opensAt: '09:00:00', closesAt: '17:00:00' },
    ],
    materials: [{ id: 1, name: 'Papel', slug: 'papel' }],
  };
}

describe('distance utilities', () => {
  it('returns zero for the same coordinates', () => {
    expect(
      distanceKm(
        { latitude: -27.645, longitude: -48.669 },
        { latitude: -27.645, longitude: -48.669 },
      ),
    ).toBeCloseTo(0, 5);
  });

  it('calculates a positive distance between two coordinates', () => {
    const distance = distanceKm(
      { latitude: -27.595, longitude: -48.551 },
      { latitude: -27.645, longitude: -48.669 },
    );

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(20);
  });

  it('formats meters and kilometers for the list cards', () => {
    expect(formatDistance(0.42)).toBe('420 m');
    expect(formatDistance(2.35)).toBe('2,4 km');
  });

  it('sorts centers by distance and leaves centers without coordinates last', () => {
    const reference = { latitude: -27.645, longitude: -48.669 };
    const far = center(1, 'Centro distante', -27.595, -48.551);
    const near = center(2, 'Centro próximo', -27.646, -48.670);
    const withoutCoordinates = center(3, 'Centro sem coordenadas', null, null);

    expect(sortCentersByDistance([far, withoutCoordinates, near], reference).map((item) => item.id))
      .toEqual([2, 1, 3]);
  });
});
