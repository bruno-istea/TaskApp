/* eslint-env jest */

// Mock oficial de AsyncStorage (guarda en memoria durante los tests)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock de expo-notifications: en los tests no hay un celular real para notificar
jest.mock('./src/services/localNotificationsApi', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({status: 'granted'})),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notif-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: {HIGH: 4},
  SchedulableTriggerInputTypes: {TIME_INTERVAL: 'timeInterval'},
}));

// Mock de safe-area-context (en los tests no hay pantalla real con bordes)
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

// ---------- Parcial 2: recursos del dispositivo ----------
// En los tests no hay celular: simulamos cada librería con jest.fn().
// Por defecto todos los permisos están concedidos; cada test puede cambiarlo.
const granted = {status: 'granted', granted: true, canAskAgain: true};

jest.mock('expo-image-picker', () => ({
  getCameraPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  getMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({canceled: false, assets: [{uri: 'file://foto.jpg'}]}),
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({canceled: false, assets: [{uri: 'file://galeria.jpg'}]}),
  ),
}));

jest.mock('expo-location', () => ({
  Accuracy: {Balanced: 3},
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({coords: {latitude: -34.72, longitude: -58.25}}),
  ),
  reverseGeocodeAsync: jest.fn(() =>
    Promise.resolve([
      {street: 'Av. Mitre', streetNumber: '123', city: 'Quilmes'},
    ]),
  ),
}));

jest.mock('expo-contacts', () => ({
  getPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  requestPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  Contact: {
    presentPicker: jest.fn(() =>
      Promise.resolve({
        id: 'c1',
        getFullName: () => Promise.resolve('Ana Gómez'),
        getPhones: () => Promise.resolve([{number: '1155550000'}]),
      }),
    ),
  },
}));

jest.mock('expo-calendar/legacy', () => ({
  EntityTypes: {EVENT: 'event'},
  SourceType: {LOCAL: 'local'},
  CalendarAccessLevel: {OWNER: 'owner'},
  getCalendarPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  requestCalendarPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  getDefaultCalendarAsync: jest.fn(() => Promise.resolve({id: 'cal-ios'})),
  getCalendarsAsync: jest.fn(() =>
    Promise.resolve([{id: 'cal1', allowsModifications: true, isPrimary: true}]),
  ),
  createCalendarAsync: jest.fn(() => Promise.resolve('cal-new')),
  createEventAsync: jest.fn(() => Promise.resolve('event-1')),
  deleteEventAsync: jest.fn(() => Promise.resolve()),
}));
