import { useEffect, ReactNode } from 'react';

/**
 * ThemeProvider — Dark-only. No toggle, no light mode.
 * Ensures <html class="dark"> is always set and cleans up legacy localStorage.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        document.documentElement.classList.add('dark');
        localStorage.removeItem('vsm-theme');
    }, []);

    return <>{children}</>;
};
