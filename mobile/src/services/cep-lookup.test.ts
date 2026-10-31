import { parseBrasilApiCep } from './cep-lookup';

describe('parseBrasilApiCep', () => {
  it('maps address and valid coordinates returned by BrasilAPI', () => {
    expect(
      parseBrasilApiCep({
        cep: '88131573',
        state: 'SC',
        city: 'Palhoça',
        neighborhood: 'Nova Palhoça',
        street: 'Rua Vereador Francisco Espindola',
        location: {
          coordinates: {
            latitude: '-27.64528',
            longitude: '-48.66778',
          },
        },
      }),
    ).toEqual({
      address: {
        street: 'Rua Vereador Francisco Espindola',
        neighborhood: 'Nova Palhoça',
        city: 'Palhoça',
        state: 'SC',
        postalCode: '88131573',
      },
      coordinates: {
        latitude: -27.64528,
        longitude: -48.66778,
      },
    });
  });

  it('retains address when coordinates are not provided', () => {
    expect(
      parseBrasilApiCep({
        cep: '88131573',
        city: 'Palhoça',
        state: 'SC',
        street: 'Rua Vereador Francisco Espindola',
      }),
    ).toEqual({
      address: {
        street: 'Rua Vereador Francisco Espindola',
        neighborhood: undefined,
        city: 'Palhoça',
        state: 'SC',
        postalCode: '88131573',
      },
      coordinates: null,
    });
  });

  it('rejects invalid coordinates but keeps the address data', () => {
    const result = parseBrasilApiCep({
      cep: '88131573',
      city: 'Palhoça',
      location: {
        coordinates: {
          latitude: '999',
          longitude: '-48.6',
        },
      },
    });

    expect(result.coordinates).toBeNull();
    expect(result.address.postalCode).toBe('88131573');
  });
});
