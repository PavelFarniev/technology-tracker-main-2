import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const STORAGE_KEY = 'tech-tracker-theme';

const ThemeContext = createContext({
    mode: 'light',
    toggleTheme: () => {}
});

const readStoredMode = () => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
};

export function AppThemeProvider({ children }) {
    const [mode, setMode] = useState(readStoredMode);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(STORAGE_KEY, mode);
        document.documentElement.dataset.theme = mode;
    }, [mode]);

    const theme = useMemo(() => {
        const isLight = mode === 'light';

        return createTheme({
            palette: {
                mode,
                primary: {
                    main: isLight ? '#4ecdc4' : '#38bdf8'
                },
                secondary: {
                    main: isLight ? '#f5576c' : '#f472b6'
                },
                background: {
                    default: isLight ? '#f5f7fb' : '#0b1220',
                    paper: isLight ? '#ffffff' : '#1e293b'
                }
            },
            shape: {
                borderRadius: 12
            },
            typography: {
                fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            textTransform: 'none',
                            fontWeight: 600
                        }
                    }
                },
                MuiSnackbarContent: {
                    styleOverrides: {
                        root: {
                            borderRadius: 14
                        }
                    }
                }
            }
        });
    }, [mode]);

    const toggleTheme = useCallback(() => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const contextValue = useMemo(() => ({ mode, toggleTheme }), [mode, toggleTheme]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

AppThemeProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export function useThemeMode() {
    return useContext(ThemeContext);
}


