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
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                'shimmer': 'shimmer 2.5s linear infinite',
                'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'aurora': 'aurora 60s linear infinite',
                'spotlight': 'spotlight 2s ease .75s 1 forwards',
                'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    'from': { backgroundPosition: '0 0' },
                    'to': { backgroundPosition: '-200% 0' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                aurora: {
                    'from': { backgroundPosition: '50% 50%, 50% 50%' },
                    'to': { backgroundPosition: '350% 50%, 350% 50%' },
                },
                spotlight: {
                    '0%': { opacity: 0, transform: 'translate(-72%, -62%) scale(0.5)' },
                    '100%': { opacity: 1, transform: 'translate(-50%,-40%) scale(1)' },
                },
                'border-beam': {
                    '100%': { 'offset-distance': '100%' },
                },
            },
            backgroundSize: {
                '200%': '200% auto',
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
