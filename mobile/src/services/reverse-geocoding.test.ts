import { parsePhotonAddress } from './reverse-geocoding';

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
