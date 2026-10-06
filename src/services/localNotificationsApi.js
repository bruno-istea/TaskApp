// Importamos SOLO las funciones de notificaciones LOCALES de expo-notifications.
//
// ¿Por qué no `import * as Notifications from 'expo-notifications'`?
// Desde el SDK 53, en Expo Go para Android, importar el paquete completo carga
// también el registro automático de notificaciones PUSH (remotas), que Expo Go
// ya no soporta y tira un error al abrir la app. Las notificaciones LOCALES
// (las que usa esta app) sí funcionan, así que importamos solo esas partes.
export {setNotificationHandler} from 'expo-notifications/build/NotificationsHandler';
export {requestPermissionsAsync} from 'expo-notifications/build/NotificationPermissions';
export {setNotificationChannelAsync} from 'expo-notifications/build/setNotificationChannelAsync';
export {scheduleNotificationAsync} from 'expo-notifications/build/scheduleNotificationAsync';
export {cancelScheduledNotificationAsync} from 'expo-notifications/build/cancelScheduledNotificationAsync';
export {SchedulableTriggerInputTypes} from 'expo-notifications/build/Notifications.types';
export {AndroidImportance} from 'expo-notifications/build/NotificationChannelManager.types';
