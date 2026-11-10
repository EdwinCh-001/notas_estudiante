export type ColorScheme = 'light' | 'dark';

/**
 * `system` follows the device preference. `light` and `dark` are explicit
 * overrides that a future settings screen can persist.
 */
export type ThemeMode = 'system' | ColorScheme;

/**
 * Colors that need to be consumed from JavaScript (Lucide icons, native
 * props, SVG artwork...). UI styling should prefer CSS variable utilities
 * such as `bg-background` or `text-foreground`.
 */
export interface ThemeColors {
  background: string;
  backgroundSubtle: string;
  foreground: string;
  foregroundSecondary: string;
  mutedForeground: string;
  card: string;
  cardMuted: string;
  secondary: string;
  secondaryForeground: string;
  primary: string;
  primaryForeground: string;
  accent: string;
  accentSoft: string;
  border: string;
  borderStrong: string;
  input: string;
  inputBorder: string;
  ring: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
}
