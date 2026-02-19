/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Colores primarios VSM (base slate)
                // Colores primarios VSM (base slate) - REMOVED (Use theme properties below)

                // Sección Vape - Azul
                vape: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Sección 420 / Herbal - Verde
                herbal: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    200: '#a7f3d0',
                    300: '#6ee7b7',
                    400: '#34d399',
                    500: '#10b981',
                    600: '#059669',
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'slide-out-right': 'slideOutRight 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'shimmer': 'shimmer 1.5s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'bounce-in': 'bounce-in 0.5s ease-out',
                'gradient': 'gradient-shift 3s ease infinite',
            },
            backgroundSize: {
                '200%': '200% 200%',
            },
            backgroundColor: {
                theme: {
                    primary: 'rgb(var(--bg-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--bg-secondary) / <alpha-value>)',
                    tertiary: 'rgb(var(--bg-tertiary) / <alpha-value>)',
                    highlight: 'rgb(var(--bg-tertiary) / <alpha-value>)',
                },
                accent: {
                    primary: 'rgb(var(--accent-primary) / <alpha-value>)',
                }
            },
            textColor: {
                theme: {
                    primary: 'rgb(var(--text-primary) / <alpha-value>)',
                    secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
                },
                accent: {
                    primary: 'rgb(var(--accent-primary) / <alpha-value>)',
                }
            },
            borderColor: {
                theme: 'rgb(var(--border-primary) / <alpha-value>)',
                accent: 'rgb(var(--accent-primary) / <alpha-value>)',
            }
        },
    },
    plugins: [],
}
