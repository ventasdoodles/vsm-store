import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-theme-secondary rounded-full transition-colors duration-300 hover:bg-theme-tertiary"
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
            {/* Slider */}
            <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-1' : 'translate-x-8'
                    }`}
            >
                {/* Icono dentro del slider */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {theme === 'dark' ? (
                        <Moon className="w-3 h-3 text-black" />
                    ) : (
                        <Sun className="w-3 h-3 text-yellow-500" />
                    )}
                </div>
            </div>
        </button>
    );
};
