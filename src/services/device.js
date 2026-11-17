import {Alert, Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
// API "legacy" de expo-calendar: la nueva todavía no funciona en Expo Go.
import * as Calendar from 'expo-calendar/legacy';
import {ensurePermission} from './permissions';
import {formatAddress} from '../utils/format';

// Todas las funciones devuelven null si el usuario cancela
// o si no dio el permiso (en ese caso ensurePermission ya mostró el mensaje).

const IMAGE_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.6,
};

// ---------- Cámara y galería (expo-image-picker) ----------

/** Abre la cámara y devuelve la URI de la foto. */
export async function takePhoto() {
  if (!(await ensurePermission('camera'))) {
    return null;
  }
  const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
  // Siempre verificar result.canceled antes de usar result.assets
  return result.canceled ? null : result.assets[0].uri;
}

/** Abre la galería y devuelve la URI de la imagen elegida. */
export async function pickImage() {
  if (!(await ensurePermission('gallery'))) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
  return result.canceled ? null : result.assets[0].uri;
}

// ---------- Ubicación (expo-location) ----------

/**
 * Obtiene la ubicación actual: {latitude, longitude, address}.
 * La dirección es aproximada y puede ser null si no se pudo calcular.
 */
export async function getCurrentLocation() {
  if (!(await ensurePermission('location'))) {
    return null;
  }
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const {latitude, longitude} = position.coords;

    let address = null;
    try {
      const [place] = await Location.reverseGeocodeAsync({latitude, longitude});
      address = formatAddress(place);
    } catch (e) {
      // Sin dirección: se muestran solo las coordenadas.
    }
    return {latitude, longitude, address};
  } catch (e) {
    Alert.alert(
      'No se pudo obtener la ubicación',
      'Revisá que el GPS (Ubicación) esté activado en el celular.',
    );
    return null;
  }
}

// ---------- Contactos (expo-contacts) ----------

/** Abre la agenda del celular y devuelve {id, name, phone}. */
export async function pickContact() {
  if (!(await ensurePermission('contacts'))) {
    return null;
  }
  const contact = await Contacts.Contact.presentPicker();
  if (!contact) {
    return null; // el usuario cerró la agenda sin elegir
  }
  const name = await contact.getFullName();
  const phones = await contact.getPhones();
  return {
    id: contact.id,
    name: name || 'Sin nombre',
    phone: phones[0]?.number ?? null,
  };
}

// ---------- Calendario (expo-calendar) ----------

/** Busca un calendario donde se puedan crear eventos (o crea uno). */
async function getWritableCalendarId() {
  if (Platform.OS === 'ios') {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    return defaultCalendar.id;
  }
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  const writable = calendars.filter(c => c.allowsModifications);
  const primary = writable.find(c => c.isPrimary) ?? writable[0];
  if (primary) {
    return primary.id;
  }
  // Si el celular no tiene ningún calendario editable, creamos uno local.
  return Calendar.createCalendarAsync({
    title: 'TaskApp',
    color: '#3B5BDB',
    entityType: Calendar.EntityTypes.EVENT,
    name: 'TaskApp',
    ownerAccount: 'TaskApp',
    source: {
      isLocalAccount: true,
      name: 'TaskApp',
      type: Calendar.SourceType.LOCAL,
    },
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
}

/**
 * Crea un evento de 1 hora en el calendario del celular.
 * Devuelve {id, startDate} o null si no hay permiso.
 */
export async function createCalendarEvent({title, startDate, location}) {
  if (!(await ensurePermission('calendar'))) {
    return null;
  }
  const calendarId = await getWritableCalendarId();
  const id = await Calendar.createEventAsync(calendarId, {
    title: `📋 ${title}`,
    startDate: new Date(startDate),
    endDate: new Date(startDate + 60 * 60 * 1000),
    location: location ?? undefined,
    notes: 'Creado desde TaskApp',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    alarms: [{relativeOffset: -15}], // aviso 15 minutos antes
  });
  return {id, startDate};
}

/** Borra el evento del calendario (cuando se borra la tarea). */
export async function deleteCalendarEvent(eventId) {
  if (!eventId) {
    return;
  }
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch (e) {
    // Si el usuario ya lo borró desde el calendario, no hay nada que hacer.
  }
}
