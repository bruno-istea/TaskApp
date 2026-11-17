import {
  eventStartFor,
  formatAddress,
  formatCoords,
  formatDateTime,
  mapsUrl,
} from '../src/utils/format';

describe('formatAddress', () => {
  it('arma "calle número, ciudad"', () => {
    expect(
      formatAddress({
        street: 'Av. Mitre',
        streetNumber: '123',
        city: 'Quilmes',
      }),
    ).toBe('Av. Mitre 123, Quilmes');
  });

  it('usa otros datos si falta la calle o la ciudad', () => {
    expect(formatAddress({name: 'Plaza', subregion: 'Bernal'})).toBe(
      'Plaza, Bernal',
    );
    expect(formatAddress(null)).toBeNull();
    expect(formatAddress({})).toBeNull();
  });
});

describe('coordenadas y mapa', () => {
  it('formatea con 5 decimales', () => {
    expect(formatCoords(-34.7201234, -58.2509876)).toBe('-34.72012, -58.25099');
    expect(formatCoords(undefined, 1)).toBe('');
  });

  it('arma el link de Google Maps', () => {
    expect(mapsUrl(-34.72, -58.25)).toContain('query=-34.72,-58.25');
  });
});

describe('fechas del calendario', () => {
  it('formatea dd/mm hh:mm', () => {
    expect(formatDateTime(new Date(2026, 10, 17, 9, 5).getTime())).toBe(
      '17/11 09:05',
    );
  });

  it('calcula "mañana a las 9:00" y "en 1 hora"', () => {
    const now = new Date(2026, 10, 17, 20, 30).getTime();
    const tomorrow = new Date(eventStartFor('tomorrow', now));
    expect(tomorrow.getDate()).toBe(18);
    expect(tomorrow.getHours()).toBe(9);
    expect(eventStartFor('1h', now) - now).toBe(60 * 60 * 1000);
  });
});
