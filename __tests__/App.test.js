import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';

beforeEach(async () => {
  await AsyncStorage.clear();
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
    await fireEvent.changeText(screen.getByPlaceholderText('Tu contraseña'), 'mal');
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
    await fireEvent.changeText(screen.getByPlaceholderText('Tu contraseña'), '1234');
    await fireEvent.press(screen.getByText('Ingresar'));
    expect(await screen.findByText('Hola, bruno 👋')).toBeTruthy();
  });
});
