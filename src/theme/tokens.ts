import type { ThemeColors } from '@/types';

/**
 * CSS is the source of truth for colors (see `src/global.css`).
 * These values are only fallbacks for native APIs that need a real color
 * before the Uniwind theme store is available.
 */
export const colorFallbacks: ThemeColors = {
  background: '#f7f7fa',
  backgroundSubtle: '#f0f1f5',
  foreground: '#11131a',
  foregroundSecondary: '#3f4451',
  mutedForeground: '#626875',
  card: '#ffffff',
  cardMuted: '#f1f2f6',
  secondary: '#eef0f5',
  secondaryForeground: '#1f2430',
  primary: '#4f46e5',
  primaryForeground: '#ffffff',
  accent: '#7c3aed',
  accentSoft: '#ede9fe',
  border: '#e2e4ea',
  borderStrong: '#cfd2db',
  input: '#ffffff',
  inputBorder: '#dde0e8',
  ring: '#6366f1',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
  success: '#059669',
  warning: '#d97706',
};

export const themeCssVariables = {
  background: '--color-background',
  backgroundSubtle: '--color-background-subtle',
  foreground: '--color-foreground',
  foregroundSecondary: '--color-foreground-secondary',
  mutedForeground: '--color-muted-foreground',
  card: '--color-card',
  cardMuted: '--color-card-muted',
  secondary: '--color-secondary',
  secondaryForeground: '--color-secondary-foreground',
  primary: '--color-primary',
  primaryForeground: '--color-primary-foreground',
  accent: '--color-accent',
  accentSoft: '--color-accent-soft',
  border: '--color-border',
  borderStrong: '--color-border-strong',
  input: '--color-input',
  inputBorder: '--color-input-border',
  ring: '--color-ring',
  danger: '--color-danger',
  dangerSoft: '--color-danger-soft',
  success: '--color-success',
  warning: '--color-warning',
} as const satisfies Record<keyof ThemeColors, string>;

/**
 * Decorative palette used by the reusable background. Keeping it in TS avoids
 * exposing purely decorative colors as semantic UI utilities.
 */
export const auroraPalette = {
  light: {
    violet: '#7c3aed',
    blue: '#4f46e5',
    teal: '#0ea5e9',
    glowOpacity: 0.16,
    lineOpacity: 0.14,
  },
  dark: {
    violet: '#a78bfa',
    blue: '#818cf8',
    teal: '#67e8f9',
    glowOpacity: 0.24,
    lineOpacity: 0.2,
  },
} as const;

export const layout = {
  compactBreakpoint: 380,
  paddingCompact: 20,
  paddingRegular: 24,
  maxContentWidth: 520,
  pressedOpacity: 0.82,
} as const;
