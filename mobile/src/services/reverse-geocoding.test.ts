import { parsePhotonAddress, reverseGeocodeCoordinates } from './reverse-geocoding';

describe('parsePhotonAddress', () => {
  it('maps street, number, postcode and locality fields', () => {
    expect(
      parsePhotonAddress({
        features: [
          {
            properties: {
              street: 'Rua das Flores',
              housenumber: '120',
              postcode: '88130000',
              district: 'Centro',
              city: 'Palhoça',
              state: 'Santa Catarina',
            },
          },
        ],
      }),
    ).toEqual({
      street: 'Rua das Flores',
      streetNumber: '120',
      placeName: undefined,
      neighborhood: 'Centro',
      city: 'Palhoça',
      state: 'Santa Catarina',
      postalCode: '88130000',
    });
  });

  it('uses locality and county when district and city are absent', () => {
    expect(
      parsePhotonAddress({
        features: [
          {
            properties: {
              name: 'Praça Central',
              locality: 'Passa Vinte',
              county: 'Palhoça',
            },
          },
        ],
      }),
    ).toEqual({
      street: undefined,
      streetNumber: undefined,
      placeName: 'Praça Central',
      neighborhood: 'Passa Vinte',
      city: 'Palhoça',
      state: undefined,
      postalCode: undefined,
    });
  });

  it('returns null when no address information is available', () => {
    expect(parsePhotonAddress({ features: [] })).toBeNull();
    expect(parsePhotonAddress({})).toBeNull();
  });
});

describe('reverseGeocodeCoordinates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests Photon local-language results instead of unsupported Portuguese lang', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [
          {
            properties: {
              street: 'Rua das Flores',
              city: 'Palhoça',
              state: 'SC',
              postcode: '88130000',
            },
          },
        ],
      }),
    } as Response);

    const address = await reverseGeocodeCoordinates({
      latitude: -27.6824064,
      longitude: -48.6703104,
    });

    const requestedUrl = new URL(String(fetchSpy.mock.calls[0]?.[0]));

    expect(requestedUrl.searchParams.get('lang')).toBe('default');
    expect(address).toMatchObject({
      street: 'Rua das Flores',
      city: 'Palhoça',
      state: 'SC',
      postalCode: '88130000',
    });
  });
});
