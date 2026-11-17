import {Alert, Linking} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Contacts from 'expo-contacts';
// expo-calendar trae una API nueva que todavía no funciona en Expo Go,
// por eso usamos la API "legacy", que anda en Expo Go y en el APK.
import * as Calendar from 'expo-calendar/legacy';

/**
 * Recursos del dispositivo que usa la app.
 * Para cada uno: nombre para mostrar, cómo consultar el permiso actual,
 * cómo pedirlo y qué alternativa tiene el usuario si lo rechaza.
 */
export const RESOURCES = {
  camera: {
    label: 'Cámara',
    usage: 'sacar una foto para la tarea',
    fallback: 'Podés elegir una imagen de la galería.',
    get: () => ImagePicker.getCameraPermissionsAsync(),
    request: () => ImagePicker.requestCameraPermissionsAsync(),
  },
  gallery: {
    label: 'Galería',
    usage: 'elegir una imagen para la tarea',
    fallback: 'Podés sacar una foto con la cámara.',
    get: () => ImagePicker.getMediaLibraryPermissionsAsync(),
    request: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
  },
  location: {
    label: 'Ubicación',
    usage: 'guardar dónde hay que hacer la tarea',
    fallback: 'Podés escribir la dirección a mano.',
    get: () => Location.getForegroundPermissionsAsync(),
    request: () => Location.requestForegroundPermissionsAsync(),
  },
  contacts: {
    label: 'Contactos',
    usage: 'elegir al responsable de la tarea',
    fallback: 'Podés escribir el nombre del responsable a mano.',
    get: () => Contacts.getPermissionsAsync(),
    request: () => Contacts.requestPermissionsAsync(),
  },
  calendar: {
    label: 'Calendario',
    usage: 'agendar la tarea en tu calendario',
    fallback: 'La tarea se guarda igual, sin evento en el calendario.',
    get: () => Calendar.getCalendarPermissionsAsync(),
    request: () => Calendar.requestCalendarPermissionsAsync(),
  },
};

/** Los 4 estados que maneja la app. */
export const PERMISSION_STATE = {
  GRANTED: 'granted', // concedido
  DENIED: 'denied', // denegado, pero se puede volver a pedir
  BLOCKED: 'blocked', // denegado y el sistema ya no lo vuelve a pedir
  UNDETERMINED: 'undetermined', // pendiente: todavía no se pidió
};

/** Texto e ícono de cada estado, para mostrarlos en pantalla. */
export const STATE_INFO = {
  granted: {text: 'Concedido', icon: '✅'},
  denied: {text: 'Denegado', icon: '❌'},
  blocked: {text: 'Bloqueado', icon: '🚫'},
  undetermined: {text: 'Pendiente', icon: '⏳'},
};

/**
 * Convierte la respuesta de Expo ({status, granted, canAskAgain})
 * en uno de nuestros 4 estados.
 */
export function toPermissionState(response) {
  if (!response) {
    return PERMISSION_STATE.UNDETERMINED;
  }
  if (response.granted || response.status === 'granted') {
    return PERMISSION_STATE.GRANTED;
  }
  if (response.status === 'undetermined') {
    return PERMISSION_STATE.UNDETERMINED;
  }
  if (response.canAskAgain === false) {
    return PERMISSION_STATE.BLOCKED;
  }
  return PERMISSION_STATE.DENIED;
}

/** Consulta el estado actual de un permiso, sin pedirlo. */
export async function getPermissionState(resource) {
  const response = await RESOURCES[resource].get();
  return toPermissionState(response);
}

/** Muestra un mensaje claro cuando el permiso fue rechazado. */
export function showDeniedMessage(resource, state) {
  const {label, usage, fallback} = RESOURCES[resource];
  if (state === PERMISSION_STATE.BLOCKED) {
    Alert.alert(
      `Permiso de ${label} bloqueado`,
      `Para ${usage} tenés que activarlo desde la configuración del celular.\n\n${fallback}`,
      [
        {text: 'Ahora no', style: 'cancel'},
        {text: 'Abrir configuración', onPress: () => Linking.openSettings()},
      ],
    );
  } else {
    Alert.alert(
      `Sin permiso de ${label}`,
      `No diste permiso para ${usage}.\n\n${fallback}`,
    );
  }
}

/**
 * Flujo completo de permisos (el de la Unidad 8):
 * 1. Verificar el estado actual.
 * 2. Si está pendiente o denegado, pedirlo.
 * 3. Si queda concedido, devolver true.
 * 4. Si no, mostrar un mensaje claro con la alternativa y devolver false.
 */
export async function ensurePermission(resource) {
  let state = await getPermissionState(resource);
  if (state === PERMISSION_STATE.GRANTED) {
    return true;
  }
  if (state !== PERMISSION_STATE.BLOCKED) {
    state = toPermissionState(await RESOURCES[resource].request());
    if (state === PERMISSION_STATE.GRANTED) {
      return true;
    }
  }
  showDeniedMessage(resource, state);
  return false;
}
