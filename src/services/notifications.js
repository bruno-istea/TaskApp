import {Platform} from 'react-native';
import * as Notifications from 'expo-notifications';

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

/** Pide permiso (Android 13+ / iOS) y crea el canal de notificaciones. */
export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios de tareas',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
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
  const granted = await setupNotifications();
  if (!granted) {
    return null;
  }
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Tarea pendiente',
      body: title,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: CHANNEL_ID,
    },
  });
}

/** Cancela una notificación programada (por ejemplo, al borrar la tarea). */
export async function cancelReminder(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
