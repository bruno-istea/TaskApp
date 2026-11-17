import {Alert, Linking} from 'react-native';
import * as Location from 'expo-location';
import {
  PERMISSION_STATE,
  ensurePermission,
  toPermissionState,
} from '../src/services/permissions';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('toPermissionState', () => {
  it('reconoce los 4 estados', () => {
    expect(toPermissionState({status: 'granted', granted: true})).toBe(
      PERMISSION_STATE.GRANTED,
    );
    expect(toPermissionState({status: 'undetermined', canAskAgain: true})).toBe(
      PERMISSION_STATE.UNDETERMINED,
    );
    expect(toPermissionState({status: 'denied', canAskAgain: true})).toBe(
      PERMISSION_STATE.DENIED,
    );
    expect(toPermissionState({status: 'denied', canAskAgain: false})).toBe(
      PERMISSION_STATE.BLOCKED,
    );
  });

  it('sin respuesta lo toma como pendiente', () => {
    expect(toPermissionState(null)).toBe(PERMISSION_STATE.UNDETERMINED);
  });
});

describe('ensurePermission', () => {
  it('si ya está concedido, no lo vuelve a pedir', async () => {
    expect(await ensurePermission('location')).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('si está pendiente lo pide, y si lo concede devuelve true', async () => {
    Location.getForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    expect(await ensurePermission('location')).toBe(true);
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('si lo rechaza, muestra un mensaje claro y devuelve false', async () => {
    Location.getForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'undetermined',
      canAskAgain: true,
    });
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: true,
    });

    expect(await ensurePermission('location')).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      'Sin permiso de Ubicación',
      expect.stringContaining('escribir la dirección a mano'),
    );
  });

  it('si está bloqueado, ofrece abrir la configuración', async () => {
    Location.getForegroundPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: false,
    });

    expect(await ensurePermission('location')).toBe(false);
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();

    // El 3er argumento del Alert son los botones: el 2do abre la configuración.
    const buttons = Alert.alert.mock.calls[0][2];
    expect(buttons[1].text).toBe('Abrir configuración');
    const openSettings = jest
      .spyOn(Linking, 'openSettings')
      .mockResolvedValue();
    buttons[1].onPress();
    expect(openSettings).toHaveBeenCalled();
  });
});
