import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(undefined);
const THEME_STORAGE_KEY = 'emotitunes_theme';
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'dark' || stored === 'light') {
                return stored;
            }
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.setAttribute('data-theme', theme);
        root.style.colorScheme = theme;
        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        }
        catch {
            // Ignore local storage errors in sandboxed environments
        }
    }, [theme]);
    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>);
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
