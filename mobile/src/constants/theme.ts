import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#173A52',
    background: '#F5F9FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#DCEFFA',
    textSecondary: '#617B8C',
    primary: '#0E4166',
    accent: '#258FD2',
    border: '#D6E5EF',
    info: '#1B5B82',
    success: '#26764F',
    danger: '#B54747',
  },
  dark: {
    text: '#E8F2F8',
    background: '#101C25',
    backgroundElement: '#1B2B37',
    backgroundSelected: '#25485E',
    textSecondary: '#A6BAC7',
    primary: '#7FC2E8',
    accent: '#69B9E8',
    border: '#304957',
    info: '#8BC7E8',
    success: '#82C9A0',
    danger: '#F29A9A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
