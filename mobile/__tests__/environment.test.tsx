import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

describe('Configuração de testes do ReciclaPalhoça', () => {
  it('deve renderizar um componente React Native', async () => {
    await render(<Text>ReciclaPalhoça</Text>);

    expect(screen.getByText('ReciclaPalhoça')).toBeTruthy();
  });
});