import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkCredentials,
  getTasks,
  registerUser,
  saveTasks,
} from '../src/storage/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('Autenticación local con AsyncStorage', () => {
  it('registra un usuario y valida el login', async () => {
    expect(await registerUser('bruno', '1234')).toBeNull();
    expect(await checkCredentials('bruno', '1234')).toBe(true);
    expect(await checkCredentials('bruno', 'mal')).toBe(false);
  });

  it('no permite registrar un usuario repetido', async () => {
    await registerUser('bruno', '1234');
    expect(await registerUser('bruno', '5678')).toBe('Ese usuario ya existe.');
  });
});

describe('Tareas en AsyncStorage', () => {
  it('guarda y recupera las tareas de cada usuario', async () => {
    const tasks = [{id: '1', title: 'Tarea', done: false}];
    await saveTasks('bruno', tasks);
    expect(await getTasks('bruno')).toEqual(tasks);
    expect(await getTasks('otro')).toEqual([]);
  });
});
