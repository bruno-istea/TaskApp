import AsyncStorage from '@react-native-async-storage/async-storage';
import {selectTaskById, useTaskStore} from '../src/stores/taskStore';
import {getTasks} from '../src/storage/storage';

const tarea = (id, extra = {}) => ({
  id,
  title: `Tarea ${id}`,
  done: false,
  ...extra,
});

// Igual que en la Unidad 10: se testea el store directo, sin renderizar nada.
beforeEach(async () => {
  await AsyncStorage.clear();
  useTaskStore.setState({owner: 'bruno', tasks: []});
});

describe('taskStore (Zustand)', () => {
  it('addTask agrega la tarea al principio y la guarda', async () => {
    const {addTask} = useTaskStore.getState();
    await addTask(tarea('1'));
    await addTask(tarea('2'));

    expect(useTaskStore.getState().tasks.map(t => t.id)).toEqual(['2', '1']);
    expect(await getTasks('bruno')).toHaveLength(2); // quedó en AsyncStorage
  });

  it('removeTask elimina solo la tarea indicada', async () => {
    useTaskStore.setState({tasks: [tarea('1'), tarea('2')]});
    await useTaskStore.getState().removeTask('1');

    expect(useTaskStore.getState().tasks.map(t => t.id)).toEqual(['2']);
  });

  it('updateTask cambia solo los campos indicados', async () => {
    useTaskStore.setState({tasks: [tarea('1')]});
    await useTaskStore
      .getState()
      .updateTask('1', {photoUri: 'file://foto.jpg', contact: {name: 'Ana'}});

    const task = useTaskStore.getState().tasks[0];
    expect(task.photoUri).toBe('file://foto.jpg');
    expect(task.contact.name).toBe('Ana');
    expect(task.title).toBe('Tarea 1'); // lo demás no cambia
  });

  it('toggleTask marca y desmarca la tarea', async () => {
    useTaskStore.setState({tasks: [tarea('1')]});
    const {toggleTask} = useTaskStore.getState();

    await toggleTask('1');
    expect(useTaskStore.getState().tasks[0].done).toBe(true);
    await toggleTask('1');
    expect(useTaskStore.getState().tasks[0].done).toBe(false);
  });

  it('loadTasks trae las tareas guardadas de cada usuario', async () => {
    await AsyncStorage.setItem(
      '@taskapp/tasks/juan',
      JSON.stringify([tarea('9')]),
    );
    await useTaskStore.getState().loadTasks('juan');

    expect(useTaskStore.getState().owner).toBe('juan');
    expect(useTaskStore.getState().tasks[0].id).toBe('9');
  });

  it('selectTaskById encuentra una tarea por id', () => {
    useTaskStore.setState({tasks: [tarea('1'), tarea('2')]});
    expect(selectTaskById('2')(useTaskStore.getState()).title).toBe('Tarea 2');
  });
});
