import { ReactNode } from 'react';

/**
 * ThemeProvider — Ultra-Safe Version.
 * No hooks, no side effects, no state. Just a wrapper.
 * The 'dark' class is handled by the index.html or main.tsx direct script.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
};
