import {Platform} from 'react-native';
import * as Notifications from './localNotificationsApi';

const CHANNEL_ID = 'tareas';

// Mostrar la notificación aunque la app esté abierta (en primer plano).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Crea el canal "Recordatorios de tareas" en Android.
 * En Expo Go no se pueden crear canales propios: en ese caso devuelve false
 * y la notificación usa el canal por defecto.
 */
async function createChannel() {
  if (Platform.OS !== 'android') {
    return false;
  }
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de tareas',
      importance: Notifications.AndroidImportance.HIGH,
    });
    return true;
  } catch (e) {
    return false;
  }
}

/** Pide permiso para mostrar notificaciones (Android 13+ / iOS). */
export async function requestPermission() {
  const {status} = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Programa una notificación local para una tarea.
 * @param {string} title    título de la tarea
 * @param {number} seconds  en cuántos segundos debe dispararse
 * @returns id de la notificación (para poder cancelarla), o null si no hay permiso
 */
export async function scheduleTaskReminder(title, seconds) {
  const granted = await requestPermission();
  if (!granted) {
    return null;
  }
  const hasChannel = await createChannel();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tarea pendiente',
      body: title,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      ...(hasChannel ? {channelId: CHANNEL_ID} : {}),
    },
  });
}

/** Cancela una notificación programada (por ejemplo, al borrar la tarea). */
export async function cancelReminder(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
