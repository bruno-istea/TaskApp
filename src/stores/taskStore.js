import {create} from 'zustand';
import {getTasks, saveTasks} from '../storage/storage';

/**
 * Store global de tareas (Zustand).
 * Tiene la lista principal de la app y las acciones para agregar, eliminar
 * y actualizar tareas. Cada acción guarda la lista en AsyncStorage
 * (por usuario), así los datos siguen después de cerrar la app.
 */
export const useTaskStore = create((set, get) => ({
  owner: null, // usuario dueño de las tareas cargadas
  tasks: [],

  /** Carga desde AsyncStorage las tareas del usuario. */
  loadTasks: async username => {
    const tasks = await getTasks(username);
    set({owner: username, tasks});
  },

  /** Agrega una tarea al principio de la lista. */
  addTask: async task => {
    const tasks = [task, ...get().tasks];
    set({tasks});
    await saveTasks(get().owner, tasks);
  },

  /** Elimina una tarea por id. */
  removeTask: async id => {
    const tasks = get().tasks.filter(t => t.id !== id);
    set({tasks});
    await saveTasks(get().owner, tasks);
  },

  /** Actualiza solo los campos indicados de una tarea. */
  updateTask: async (id, changes) => {
    const tasks = get().tasks.map(t => (t.id === id ? {...t, ...changes} : t));
    set({tasks});
    await saveTasks(get().owner, tasks);
  },

  /** Marca o desmarca una tarea como hecha. */
  toggleTask: async id => {
    const task = get().tasks.find(t => t.id === id);
    if (task) {
      await get().updateTask(id, {done: !task.done});
    }
  },

  /** Vacía el store (al cerrar sesión). */
  clear: () => set({owner: null, tasks: []}),
}));

/** Selector: busca una tarea por id (para la pantalla de detalle). */
export const selectTaskById = id => state => state.tasks.find(t => t.id === id);
