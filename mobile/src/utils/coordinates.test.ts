import { parseCoordinates } from './coordinates';

describe('coordinate parsing', () => {
  it('accepts valid numeric and string coordinates', () => {
    expect(parseCoordinates('-27.645', '-48.669')).toEqual({
      latitude: -27.645,
      longitude: -48.669,
    });
    expect(parseCoordinates(-27.645, -48.669)).toEqual({
      latitude: -27.645,
      longitude: -48.669,
    });
  });

  it.each([
    [null, '-48.669'],
    ['', '-48.669'],
    ['   ', '-48.669'],
    ['not-a-number', '-48.669'],
    ['91', '-48.669'],
    ['-27.645', '181'],
    [undefined, undefined],
  ])('rejects missing or out-of-range coordinates (%s, %s)', (latitude, longitude) => {
    expect(parseCoordinates(latitude, longitude)).toBeNull();
  });
});
