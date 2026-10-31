import { distanceKm, formatDistance } from './distance';

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
});
