import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
// Fija el tema en dark permanentemente
    const [theme] = useState<Theme>('dark');

    useEffect(() => {
        // Aplicar clase al <html>
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        
        // Limpiar preferencia antigua
        localStorage.setItem('vsm-theme', 'dark');
    }, [theme]);

    const toggleTheme = () => {
        // Feature disabled
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
