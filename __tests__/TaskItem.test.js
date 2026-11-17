import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import TaskItem from '../src/components/TaskItem';

const task = {
  id: '1',
  title: 'Estudiar React Native',
  done: false,
  reminderAt: null,
  notificationId: null,
};

describe('TaskItem (ítem de lista reutilizable)', () => {
  it('muestra el título de la tarea', async () => {
    await render(
      <TaskItem task={task} onToggle={jest.fn()} onDelete={jest.fn()} />,
    );
    expect(screen.getByText('Estudiar React Native')).toBeTruthy();
    expect(screen.getByText('Sin recordatorio')).toBeTruthy();
  });

  it('avisa el id al marcar y al eliminar', async () => {
    const onToggle = jest.fn();
    const onDelete = jest.fn();
    await render(
      <TaskItem task={task} onToggle={onToggle} onDelete={onDelete} />,
    );

    await fireEvent.press(screen.getByTestId('task-toggle'));
    await fireEvent.press(screen.getByText('Eliminar'));

    expect(onToggle).toHaveBeenCalledWith('1');
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});

describe('TaskItem con adjuntos (Parcial 2)', () => {
  it('muestra la miniatura, el lugar y el responsable, y abre el detalle', async () => {
    const onPress = jest.fn();
    await render(
      <TaskItem
        task={{
          ...task,
          photoUri: 'file://foto.jpg',
          location: {address: 'Av. Mitre 123, Quilmes'},
          contact: {name: 'Ana Gómez'},
        }}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onPress={onPress}
      />,
    );

    expect(screen.getByTestId('task-thumbnail')).toBeTruthy();
    expect(screen.getByText('📍 Av. Mitre 123, Quilmes')).toBeTruthy();
    expect(screen.getByText('👤 Ana Gómez')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('task-open'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
