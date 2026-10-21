/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
};

export const APP_THEMES = {
  dark: {
    id: 'dark',
    name: 'Dark Cyber',
    bg: '#090d16',
    cardBg: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    text: '#ffffff',
    subText: '#94a3b8',
    headerBg: 'rgba(9, 13, 22, 0.95)',
    tabBg: '#090d16',
    isLight: false,
  },
  oled: {
    id: 'oled',
    name: 'OLED Black',
    bg: '#000000',
    cardBg: '#121214',
    border: '#27272a',
    text: '#ffffff',
    subText: '#a1a1aa',
    headerBg: '#000000',
    tabBg: '#000000',
    isLight: false,
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0a1128',
    cardBg: '#101c42',
    border: '#1c2541',
    text: '#f8fafc',
    subText: '#94a3b8',
    headerBg: '#0a1128',
    tabBg: '#0a1128',
    isLight: false,
  },
  light: {
    id: 'light',
    name: 'Clean Light',
    bg: '#f8fafc',
    cardBg: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    subText: '#64748b',
    headerBg: '#ffffff',
    tabBg: '#ffffff',
    isLight: true,
  },
};

export function getAppTheme(themeMode = 'dark') {
  return APP_THEMES[themeMode] || APP_THEMES.dark;
}


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
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
