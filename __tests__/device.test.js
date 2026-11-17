import {Alert, Platform} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Calendar from 'expo-calendar/legacy';
import {
  createCalendarEvent,
  getCurrentLocation,
  pickContact,
  pickImage,
  takePhoto,
} from '../src/services/device';

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('cámara y galería', () => {
  it('devuelve la URI de la foto sacada o elegida', async () => {
    expect(await takePhoto()).toBe('file://foto.jpg');
    expect(await pickImage()).toBe('file://galeria.jpg');
  });

  it('devuelve null si el usuario cancela', async () => {
    ImagePicker.launchCameraAsync.mockResolvedValueOnce({canceled: true});
    expect(await takePhoto()).toBeNull();
  });

  it('sin permiso de cámara no la abre', async () => {
    ImagePicker.getCameraPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
      canAskAgain: false,
    });
    expect(await takePhoto()).toBeNull();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
  });
});

describe('ubicación', () => {
  it('devuelve coordenadas y dirección aproximada', async () => {
    expect(await getCurrentLocation()).toEqual({
      latitude: -34.72,
      longitude: -58.25,
      address: 'Av. Mitre 123, Quilmes',
    });
  });

  it('si el GPS está apagado avisa y devuelve null', async () => {
    Location.getCurrentPositionAsync.mockRejectedValueOnce(new Error('off'));
    expect(await getCurrentLocation()).toBeNull();
    expect(Alert.alert).toHaveBeenCalled();
  });
});

describe('contactos y calendario', () => {
  it('pickContact devuelve nombre y teléfono', async () => {
    expect(await pickContact()).toEqual({
      id: 'c1',
      name: 'Ana Gómez',
      phone: '1155550000',
    });
  });

  it('createCalendarEvent crea un evento de 1 hora (Android)', async () => {
    Platform.OS = 'android';
    const start = new Date(2026, 10, 18, 9, 0).getTime();
    const event = await createCalendarEvent({
      title: 'Comprar pintura',
      startDate: start,
      location: 'Av. Mitre 123',
    });

    expect(event).toEqual({id: 'event-1', startDate: start});
    const [calendarId, data] = Calendar.createEventAsync.mock.calls[0];
    expect(calendarId).toBe('cal1');
    expect(data.title).toContain('Comprar pintura');
    expect(data.endDate - data.startDate).toBe(60 * 60 * 1000);
  });

  it('en iPhone usa el calendario por defecto', async () => {
    Platform.OS = 'ios';
    await createCalendarEvent({title: 'X', startDate: Date.now()});
    expect(Calendar.createEventAsync.mock.calls[0][0]).toBe('cal-ios');
  });
});
