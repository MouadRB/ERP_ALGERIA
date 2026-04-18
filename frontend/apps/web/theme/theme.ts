import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    sidebar: { main: string };
  }
  interface PaletteOptions {
    sidebar?: { main: string };
  }
}

export const createAppTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';

  const palette = {
    mode,
    primary: {
      main: isDark ? '#58a6ff' : '#0969da',
    },
    secondary: {
      main: isDark ? '#8b949e' : '#57606a',
    },
    background: isDark
      ? {
          default: '#0d1117',
          paper: '#161b22',
        }
      : {
          default: '#f4f6f8',
          paper: '#ffffff',
        },
    sidebar: {
      main: isDark ? '#010409' : '#ffffff',
    },
    text: {
      primary: isDark ? '#c9d1d9' : '#1f2328',
      secondary: isDark ? '#8b949e' : '#656d76',
    },
    divider: isDark ? '#30363d' : '#e0e0e0',
    success: { main: isDark ? '#3fb950' : '#2ea043' },
    warning: { main: isDark ? '#d29922' : '#bf8700' },
    error: { main: isDark ? '#f85149' : '#cf222e' },
    info: { main: isDark ? '#58a6ff' : '#0969da' },
    action: {
      hover: isDark ? 'rgba(177,186,196,0.12)' : 'rgba(31,35,40,0.06)',
      selected: isDark ? 'rgba(88,166,255,0.15)' : 'rgba(9,105,218,0.08)',
    },
  } as const;

  const base = createTheme({ palette });

  return createTheme({
    ...base,
    shape: { borderRadius: 8 },
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
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: base.palette.background.default,
            color: base.palette.text.primary,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: base.palette.background.paper,
            boxShadow: 'none',
          },
          outlined: {
            borderColor: base.palette.divider,
          },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0, variant: 'outlined' },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: base.palette.background.paper,
            borderColor: base.palette.divider,
            boxShadow: 'none',
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.paper,
            backgroundImage: 'none',
            borderBottom: `1px solid ${base.palette.divider}`,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.paper,
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.paper,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark
              ? alpha(base.palette.common.white, 0.03)
              : alpha(base.palette.common.black, 0.03),
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: base.palette.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: base.palette.action.selected,
              '&:hover': {
                backgroundColor: base.palette.action.selected,
              },
            },
          },
          head: {
            '&:hover': { backgroundColor: 'transparent' },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: base.palette.divider,
            color: base.palette.text.primary,
          },
          head: {
            backgroundColor: 'transparent',
            color: base.palette.text.secondary,
            fontWeight: 600,
            borderBottom: `1px solid ${base.palette.divider}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: base.palette.background.paper,
            color: base.palette.text.primary,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: base.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#8b949e' : '#afb8c1',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: base.palette.primary.main,
              borderWidth: '1px',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
          containedPrimary: {
            backgroundColor: isDark ? '#238636' : '#2da44e',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: isDark ? '#2ea043' : '#2c974b',
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: base.palette.divider,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? '#161b22' : '#1f2328',
            color: '#ffffff',
            border: `1px solid ${base.palette.divider}`,
          },
        },
      },
    },
  });
};

export const theme = createAppTheme('light');
