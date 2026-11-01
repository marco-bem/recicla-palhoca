import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppButton, AppText, FilterChip, StatusBadge, TextField } from './recicla-ui';

describe('componentes compartilhados do ReciclaPalhoça', () => {
  it('aplica tipografia Inter nos textos', () => {
    render(<AppText size="h3" weight="semibold">Título</AppText>);
    expect(screen.getByText('Título')).toHaveStyle({
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      lineHeight: 26,
    });
  });

  it('executa a ação do botão primário', () => {
    const onPress = jest.fn();
    render(<AppButton label="Salvar" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não executa a ação do botão desabilitado', () => {
    const onPress = jest.fn();
    render(<AppButton label="Salvar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expõe a seleção de filtro para acessibilidade', () => {
    const onPress = jest.fn();
    render(<FilterChip label="Papel" selected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Papel' });
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('envia o valor informado no campo de texto', () => {
    const onChangeText = jest.fn();
    render(<TextField label="CEP" value="" onChangeText={onChangeText} placeholder="Informe o CEP" />);
    fireEvent.changeText(screen.getByLabelText('CEP'), '88130-000');
    expect(onChangeText).toHaveBeenCalledWith('88130-000');
  });

  it('exibe o texto do badge de status', () => {
    render(<StatusBadge label="Concluído" status="success" />);
    expect(screen.getByText('Concluído')).toBeTruthy();
  });
});
