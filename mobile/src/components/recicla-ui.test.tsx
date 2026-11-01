import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppIcon } from '@/components/app-icons';
import { AppButton, AppText, CenterCard, FilterChip, MaterialChip, StatusBadge, TextField } from './recicla-ui';

describe('componentes compartilhados do ReciclaPalhoça', () => {
  it('aplica tipografia Inter nos textos', async () => {
    await render(<AppText size="h3" weight="semibold">Título</AppText>);
    expect(screen.getByText('Título')).toHaveStyle({
      fontFamily: 'Inter_600SemiBold',
      fontSize: 18,
      lineHeight: 26,
    });
  });

  it('executa a ação do botão primário', async () => {
    const onPress = jest.fn();
    await render(<AppButton label="Salvar" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não executa a ação do botão desabilitado', async () => {
    const onPress = jest.fn();
    await render(<AppButton label="Salvar" onPress={onPress} disabled />);
    fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('expõe a seleção de filtro para acessibilidade', async () => {
    const onPress = jest.fn();
    await render(<FilterChip label="Papel" selected onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Papel' });
    expect(chip.props.accessibilityState).toMatchObject({ selected: true });
    fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('envia o valor informado no campo de texto', async () => {
    const onChangeText = jest.fn();
    await render(
      <TextField
        label="CEP"
        value=""
        onChangeText={onChangeText}
        placeholder="Informe o CEP"
        leadingIcon={<AppIcon name="search" />}
      />,
    );
    fireEvent.changeText(screen.getByLabelText('CEP'), '88130-000');
    expect(onChangeText).toHaveBeenCalledWith('88130-000');
  });

  it('exibe o chip de material e executa sua ação', async () => {
    const onPress = jest.fn();
    await render(
      <MaterialChip label="Papel" category="paper" onPress={onPress} />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Papel' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renderiza o cartão compacto de centro e executa sua navegação', async () => {
    const onPress = jest.fn();
    await render(
      <CenterCard
        name="Centro Recicla"
        materials="Papel · vidro"
        eyebrow="CENTRO DE RECICLAGEM"
        layout="compact"
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exibe o texto do badge de status', async () => {
    await render(<StatusBadge label="Concluído" status="success" />);
    expect(screen.getByText('Concluído')).toBeTruthy();
  });
});
