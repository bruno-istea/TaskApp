import * as Notifications from 'expo-notifications';
import {
  cancelReminder,
  scheduleTaskReminder,
} from '../src/services/notifications';

describe('Notificaciones locales (expo-notifications)', () => {
  it('programa la notificación con los segundos elegidos', async () => {
    const id = await scheduleTaskReminder('Estudiar', 5);

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({body: 'Estudiar'}),
        trigger: expect.objectContaining({seconds: 5}),
      }),
    );
    expect(id).toBe('notif-id');
  });

  it('no programa nada si el usuario no da permiso', async () => {
    Notifications.scheduleNotificationAsync.mockClear();
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
    });
    expect(await scheduleTaskReminder('Estudiar', 5)).toBeNull();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancela la notificación al borrar la tarea', async () => {
    await cancelReminder('notif-id');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'notif-id',
    );
  });
});
