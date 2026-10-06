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
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
