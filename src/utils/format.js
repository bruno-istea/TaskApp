// Funciones puras para mostrar ubicación y fechas (fáciles de testear).

/**
 * Arma una dirección legible a partir de lo que devuelve
 * Location.reverseGeocodeAsync. Ej: "Av. Mitre 123, Quilmes".
 */
export function formatAddress(place) {
  if (!place) {
    return null;
  }
  const street = [place.street, place.streetNumber].filter(Boolean).join(' ');
  const city = place.city || place.subregion || place.district;
  const parts = [street || place.name, city].filter(Boolean);
  // Evita repetir partes iguales (a veces name === street)
  const unique = parts.filter((p, i) => parts.indexOf(p) === i);
  return unique.length ? unique.join(', ') : null;
}

/** Coordenadas con 5 decimales (≈ 1 metro de precisión). */
export function formatCoords(latitude, longitude) {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return '';
  }
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

/** Link para abrir la ubicación en Google Maps. */
export function mapsUrl(latitude, longitude) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** Fecha y hora cortas: "17/11 18:30". */
export function formatDateTime(timestamp) {
  const d = new Date(timestamp);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${min}`;
}

/**
 * Opciones de fecha para el evento del calendario.
 * Devuelve el timestamp de inicio a partir de "ahora".
 */
export const EVENT_OPTIONS = [
  {key: '1h', label: 'En 1 hora'},
  {key: 'tomorrow', label: 'Mañana 9:00'},
  {key: '3d', label: 'En 3 días'},
];

export function eventStartFor(key, now = Date.now()) {
  if (key === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.getTime();
  }
  if (key === '3d') {
    return now + 3 * 24 * 60 * 60 * 1000;
  }
  return now + 60 * 60 * 1000; // '1h'
}
