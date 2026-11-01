/**
 * Tokens visuais do ReciclaPalhoça.
 * Valores alinhados à página "01 — Fundamentos visuais" do Figma.
 *
 * O aplicativo Expo utiliza atualmente a composição Light aprovada nos fluxos.
 * A paleta Dark permanece definida para uma implementação futura e não é
 * parcialmente aplicada à navegação ou às telas.
 */
export const Colors = {
  light: {
    textPrimary: '#193B31',
    textOnPrimary: '#FFFFFF',
    textSecondary: '#557166',
    textDisabled: '#557166',
    iconPrimary: '#193B31',

    backgroundCanvas: '#F7FAF7',
    surface: '#FFFFFF',
    backgroundSelected: '#DDF8E9',
    backgroundDisabled: '#D8E7DF',
    backgroundInfo: '#F1F9FD',
    backgroundSuccess: '#DDF8E9',
    backgroundWarning: '#FFF5C9',
    backgroundDanger: '#FCE9E9',

    primary: '#126B50',
    primaryPressed: '#36584C',
    accent: '#086FAF',
    focusBorder: '#086FAF',
    border: '#D8E7DF',

    info: '#086FAF',
    success: '#126B50',
    danger: '#B54747',
    warning: '#91650A',

    eco: '#22C978',
    coral: '#FF8A4C',
    highlight: '#FFD447',

    category: {
      paper: '#E4F3FC',
      plastic: '#FFE8DC',
      glass: '#DDF8E9',
      metal: '#FFF5C9',
      electronics: '#EEE7FF',
      organic: '#FFF5C9',
    },
  },
  dark: {
    textPrimary: '#E8F4ED',
    textOnPrimary: '#0D1D17',
    textSecondary: '#B2C9BC',
    textDisabled: '#B2C9BC',
    iconPrimary: '#E8F4ED',

    backgroundCanvas: '#0D1D17',
    surface: '#172C23',
    backgroundSelected: '#2B493B',
    backgroundDisabled: '#2B493B',
    backgroundInfo: '#2B493B',
    backgroundSuccess: '#2B493B',
    backgroundWarning: '#2B493B',
    backgroundDanger: '#2B493B',

    primary: '#A9EFCB',
    primaryPressed: '#A9EFCB',
    accent: '#65BFE8',
    focusBorder: '#65BFE8',
    border: '#2B493B',

    info: '#65BFE8',
    success: '#A9EFCB',
    danger: '#F29A9A',
    warning: '#FFD447',

    eco: '#A9EFCB',
    coral: '#FF8A4C',
    highlight: '#FFD447',

    category: {
      paper: '#2B493B',
      plastic: '#2B493B',
      glass: '#2B493B',
      metal: '#2B493B',
      electronics: '#2B493B',
      organic: '#2B493B',
    },
  },
} as const;

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/** Escala tipográfica oficial: família Inter, tamanho/entrelinha e peso. */
export const Typography = {
  display: { fontFamily: Fonts.semibold, fontSize: 32, lineHeight: 40, fontWeight: '600' },
  h1: { fontFamily: Fonts.bold, fontSize: 28, lineHeight: 36, fontWeight: '700' },
  h2: { fontFamily: Fonts.semibold, fontSize: 22, lineHeight: 30, fontWeight: '600' },
  h3: { fontFamily: Fonts.semibold, fontSize: 18, lineHeight: 26, fontWeight: '600' },
  bodyLarge: { fontFamily: Fonts.regular, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  body: { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  caption: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  button: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 20, fontWeight: '600' },
} as const;

/** Escala oficial de espaçamento em múltiplos de 4 px. */
export const Spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
  space16: 64,
} as const;

/** Medidas de composição compartilhadas pelas telas mobile. */
export const Layout = {
  screenHorizontalInset: 20,
  screenTopInset: 20,
  contentMaxWidth: 560,
  cardInset: 20,
  bottomTabHeight: 76,
} as const;

export const Radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const BorderWidth = {
  default: 1,
} as const;

export const Iconography = {
  grid: 24,
  strokeMin: 1.75,
  strokeMax: 2,
  strokeDefault: 1.8,
  lineCap: 'round',
  lineJoin: 'round',
  sizes: {
    sm: 16,
    md: 20,
    default: 24,
    lg: 32,
  },
} as const;

/** Effect styles Elevation/01 e Elevation/02 do Figma. */
export const Elevation = {
  level1: {
    shadowColor: '#193B31',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: '#193B31',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
