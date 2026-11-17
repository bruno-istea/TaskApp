import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../src/stores/authStore';
import {useTaskStore} from '../src/stores/taskStore';
import {getSession} from '../src/storage/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
  useAuthStore.setState({user: null, loading: true});
});

describe('authStore (Zustand)', () => {
  it('login guarda el usuario en el store y la sesión', async () => {
    await useAuthStore.getState().login('bruno');

    expect(useAuthStore.getState().user).toBe('bruno');
    expect(await getSession()).toBe('bruno');
  });

  it('logout borra la sesión y las tareas cargadas', async () => {
    await useAuthStore.getState().login('bruno');
    useTaskStore.setState({owner: 'bruno', tasks: [{id: '1'}]});

    await useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(await getSession()).toBeNull();
    expect(useTaskStore.getState().tasks).toEqual([]);
  });

  it('restoreSession recupera la sesión guardada al abrir la app', async () => {
    await AsyncStorage.setItem('@taskapp/session', 'bruno');
    await useAuthStore.getState().restoreSession();

    expect(useAuthStore.getState().user).toBe('bruno');
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
