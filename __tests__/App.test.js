import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import {useAuthStore} from '../src/stores/authStore';
import {useTaskStore} from '../src/stores/taskStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  // Los stores de Zustand viven fuera de React: se resetean entre tests.
  useAuthStore.setState({user: null, loading: true});
  useTaskStore.setState({owner: null, tasks: []});
});

describe('Navegación y autenticación', () => {
  it('sin sesión iniciada muestra el Login y no el Home', async () => {
    await render(<App />);
    expect(
      await screen.findByText('Iniciá sesión para continuar'),
    ).toBeTruthy();
    expect(screen.queryByText('Mis tareas')).toBeNull();
  });

  it('muestra un error si el login es incorrecto', async () => {
    await render(<App />);
    await fireEvent.changeText(
      await screen.findByPlaceholderText('Tu usuario'),
      'bruno',
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText('Tu contraseña'),
      'mal',
    );
    await fireEvent.press(screen.getByText('Ingresar'));
    expect(
      await screen.findByText('Usuario o contraseña incorrectos.'),
    ).toBeTruthy();
  });

  it('con credenciales válidas entra al Home', async () => {
    await AsyncStorage.setItem(
      '@taskapp/users',
      JSON.stringify({bruno: '1234'}),
    );
    await render(<App />);
    await fireEvent.changeText(
      await screen.findByPlaceholderText('Tu usuario'),
      'bruno',
    );
    await fireEvent.changeText(
      screen.getByPlaceholderText('Tu contraseña'),
      '1234',
    );
    await fireEvent.press(screen.getByText('Ingresar'));
    expect(await screen.findByText('Hola, bruno 👋')).toBeTruthy();
  });
});
