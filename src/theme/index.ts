import { createTheme } from '@mui/material/styles';

export const createAppTheme = (darkMode: boolean, primaryColor = '#2196f3', secondaryColor = '#f50057') => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
    background: {
      default: darkMode ? '#0a1929' : '#f5f5f5',
      paper: darkMode ? '#1a2027' : '#ffffff',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          zIndex: 1300,
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: darkMode ? '#1a2027' : '#ffffff',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
}); 