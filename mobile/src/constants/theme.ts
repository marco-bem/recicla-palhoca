import { Platform } from 'react-native';

/**
 * Tokens semânticos do ReciclaPalhoça.
 * Fonte de referência: Figma / 01 — Fundamentos visuais.
 */
export const Colors = {
  light: {
    // Compatibilidade com os nomes já utilizados pelas telas existentes.
    text: '#193B31',
    background: '#F7FAF7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DDF8E9',
    textSecondary: '#557166',
    primary: '#126B50',
    accent: '#086FAF',
    border: '#D8E7DF',
    info: '#086FAF',
    success: '#126B50',
    danger: '#B54747',

    // Papéis semânticos adicionais.
    textPrimary: '#193B31',
    textOnPrimary: '#FFFFFF',
    textDisabled: '#557166',
    backgroundCanvas: '#F7FAF7',
    surface: '#FFFFFF',
    backgroundDisabled: '#D8E7DF',
    backgroundInfo: '#F1F9FD',
    backgroundSuccess: '#DDF8E9',
    backgroundWarning: '#FFF5C9',
    backgroundDanger: '#FCE9E9',
    primaryPressed: '#36584C',
    focusBorder: '#086FAF',
    iconPrimary: '#193B31',
    eco: '#22C978',
    coral: '#FF8A4C',
    highlight: '#FFD447',
    warning: '#91650A',

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
    // Compatibilidade com os nomes já utilizados pelas telas existentes.
    text: '#E8F4ED',
    background: '#0D1D17',
    backgroundElement: '#172C23',
    backgroundSelected: '#2B493B',
    textSecondary: '#B2C9BC',
    primary: '#A9EFCB',
    accent: '#65BFE8',
    border: '#2B493B',
    info: '#65BFE8',
    success: '#A9EFCB',
    danger: '#F29A9A',

    // Papéis semânticos adicionais.
    textPrimary: '#E8F4ED',
    textOnPrimary: '#0D1D17',
    textDisabled: '#B2C9BC',
    backgroundCanvas: '#0D1D17',
    surface: '#172C23',
    backgroundDisabled: '#2B493B',
    backgroundInfo: '#2B493B',
    backgroundSuccess: '#2B493B',
    backgroundWarning: '#2B493B',
    backgroundDanger: '#2B493B',
    primaryPressed: '#A9EFCB',
    focusBorder: '#65BFE8',
    iconPrimary: '#E8F4ED',
    eco: '#A9EFCB',
    coral: '#FF8A4C',
    highlight: '#FFD447',
    warning: '#FFD447',

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

export type ThemeColor = keyof Omit<typeof Colors.light, 'category'> &
  keyof Omit<typeof Colors.dark, 'category'>;
export type ThemeMode = keyof typeof Colors;

/**
 * Fontes carregadas no layout raiz por @expo-google-fonts/inter.
 * Os nomes correspondem aos exports oficiais do pacote.
 */
export const Fonts = {
  sans: 'Inter_400Regular',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  serif: Platform.select({ ios: 'ui-serif', default: 'serif' }) ?? 'serif',
  rounded: Platform.select({ ios: 'ui-rounded', default: 'sans-serif' }) ?? 'sans-serif',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }) ?? 'monospace',
} as const;

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

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

/** Escala 4 px oficial do Figma, mantendo aliases legados usados pelo código atual. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,

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
  lineCap: 'round',
  lineJoin: 'round',
  sizes: {
    sm: 16,
    md: 20,
    default: 24,
    lg: 32,
  },
} as const;

/**
 * Effect styles Elevation/01 e Elevation/02 do Figma.
 * O campo elevation é uma aproximação de profundidade para Android.
 */
export const Elevation = {
  level1: {
    shadowColor: '#0E4166',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  level2: {
    shadowColor: '#0E4166',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
