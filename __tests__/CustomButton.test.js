import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import CustomButton from '../src/components/CustomButton';

describe('CustomButton (componente reutilizable)', () => {
  it('renderiza el texto recibido', async () => {
    await render(<CustomButton title="Guardar tarea" onPress={() => {}} />);
    expect(screen.getByText('Guardar tarea')).toBeTruthy();
  });

  it('llama a onPress al tocarlo', async () => {
    const onPress = jest.fn();
    await render(<CustomButton title="Ingresar" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Ingresar'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no llama a onPress si está deshabilitado', async () => {
    const onPress = jest.fn();
    await render(<CustomButton title="Ingresar" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText('Ingresar'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
