'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { createAppTheme } from '../theme/theme';

type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

const STORAGE_KEY = 'ferza.theme.mode';

type ThemeRegistryProps = {
  children: React.ReactNode;
};

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') setMode(stored);
  }, []);

  const colorMode = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem(STORAGE_KEY, next);
          return next;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
