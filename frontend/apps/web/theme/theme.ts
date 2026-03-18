import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: { main: string };
  }
  interface PaletteOptions {
    sidebar?: { main: string };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0D47A1' },
    secondary: { main: '#FF8A00' },
    background: {
      default: '#F0F4F8',
      paper: '#FFFFFF',
    },
    sidebar: { main: '#0D2137' },
    success: { main: '#2E7D32' },
    warning: { main: '#F57C00' },
    error: { main: '#C62828' },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"DM Sans", "Cairo", "JetBrains Mono", sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
      },
    },
  },
});