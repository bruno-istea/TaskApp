import {create} from 'zustand';
import {clearSession, getSession, saveSession} from '../storage/storage';
import {useTaskStore} from './taskStore';

/**
 * Store global de autenticación (Zustand).
 * Reemplaza al AuthContext del Parcial 1: cualquier componente lee el usuario
 * con un selector, por ejemplo `useAuthStore(s => s.user)`, sin Provider.
 */
export const useAuthStore = create(set => ({
  user: null, // usuario logueado (null = nadie)
  loading: true, // true mientras se lee la sesión guardada al abrir la app

  /** Lee la sesión guardada en AsyncStorage al abrir la app. */
  restoreSession: async () => {
    try {
      const saved = await getSession();
      set({user: saved, loading: false});
    } catch (e) {
      set({user: null, loading: false});
    }
  },

  login: async username => {
    await saveSession(username);
    set({user: username});
  },

  logout: async () => {
    await clearSession();
    useTaskStore.getState().clear(); // no dejar las tareas del usuario anterior
    set({user: null});
  },
}));
