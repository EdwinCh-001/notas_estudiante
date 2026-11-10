import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';
import { Uniwind, useCSSVariable } from 'uniwind';

import type { ColorScheme, ThemeColors, ThemeMode } from '@/types';

import { colorFallbacks, themeCssVariables } from './tokens';

export interface ThemeContextValue {
  /** Preference selected by the user or the default `system` mode. */
  mode: ThemeMode;
  /** Resolved scheme after applying the system preference. */
  colorScheme: ColorScheme;
  /** Theme-aware colors for native props and non-className consumers. */
  colors: ThemeColors;
  /** Future settings screens call this to override the system preference. */
  setMode: (mode: ThemeMode) => void;
}

interface ThemeProviderProps extends PropsWithChildren {
  initialMode?: ThemeMode;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const cssVariableNames = Object.values(themeCssVariables);

export function ThemeProvider({
  children,
  initialMode = 'system',
}: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const resolvedVariables = useCSSVariable(cssVariableNames);

  useEffect(() => {
    // `system` keeps adaptive themes enabled; explicit modes disable them.
    Uniwind.setTheme(mode);
  }, [mode]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const colors = useMemo<ThemeColors>(() => {
    const keys = Object.keys(
      themeCssVariables,
    ) as (keyof ThemeColors)[];

    return keys.reduce<ThemeColors>((result, key, index) => {
      const value = resolvedVariables[index];

      result[key] =
        typeof value === 'string' ? value : colorFallbacks[key];

      return result;
    }, { ...colorFallbacks });
  }, [resolvedVariables]);

  const colorScheme: ColorScheme =
    mode === 'system' ? (systemColorScheme ?? 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colorScheme, colors, setMode }),
    [mode, colorScheme, colors, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
