import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import AttachmentsEditor from '../src/components/AttachmentsEditor';

const empty = {
  photoUri: null,
  location: null,
  contact: null,
  calendarEvent: null,
};

describe('AttachmentsEditor (componente reutilizable)', () => {
  it('muestra los adjuntos que ya tiene la tarea', async () => {
    await render(
      <AttachmentsEditor
        title="Pintar"
        value={{
          photoUri: 'file://foto.jpg',
          location: {latitude: -34.72, longitude: -58.25, address: 'Quilmes'},
          contact: {name: 'Ana Gómez', phone: '1155550000'},
          calendarEvent: null,
        }}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByTestId('attachment-photo')).toBeTruthy();
    expect(screen.getByText('Quilmes')).toBeTruthy();
    expect(screen.getByText('Ana Gómez')).toBeTruthy();
  });

  it('al elegir de la galería avisa la foto nueva', async () => {
    const onChange = jest.fn();
    await render(
      <AttachmentsEditor title="Pintar" value={empty} onChange={onChange} />,
    );

    await fireEvent.press(screen.getByText('Galería'));

    expect(onChange).toHaveBeenCalledWith({photoUri: 'file://galeria.jpg'});
  });

  it('permite escribir la dirección a mano (alternativa sin GPS)', async () => {
    const onChange = jest.fn();
    await render(
      <AttachmentsEditor title="Pintar" value={empty} onChange={onChange} />,
    );

    await fireEvent.press(screen.getByText('O escribir la dirección a mano'));
    await fireEvent.changeText(
      screen.getByPlaceholderText('Ej: Av. Mitre 123, Quilmes'),
      'Calle Falsa 123',
    );
    await fireEvent.press(screen.getByText('Guardar'));

    expect(onChange).toHaveBeenCalledWith({
      location: {latitude: null, longitude: null, address: 'Calle Falsa 123'},
    });
  });
});
