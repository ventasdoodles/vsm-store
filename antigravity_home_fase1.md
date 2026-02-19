# HOME ÉPICO — FASE 1: FUNDACIÓN (3 horas)

**Objetivo:** Crear componentes base para home premium con dual theme y animaciones  
**Tiempo estimado:** 3 horas  
**Commit base:** [último commit estable]

---

## 🎨 PARTE 1: DUAL THEME SYSTEM (45 min)

### 1. Theme Context & Hook

**Archivo:** `src/contexts/ThemeContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    // Leer tema guardado o usar dark por defecto
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('vsm-theme');
        return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    });

    useEffect(() => {
        // Aplicar clase al <html>
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        
        // Guardar preferencia
        localStorage.setItem('vsm-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
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
```

---

### 2. Theme Toggle Button

**Archivo:** `src/components/ui/ThemeToggle.tsx`

```typescript
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 bg-primary-700 rounded-full transition-colors duration-300 hover:bg-primary-600"
            aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
        >
            {/* Slider */}
            <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-1' : 'translate-x-8'
                }`}
            >
                {/* Icono dentro del slider */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {theme === 'dark' ? (
                        <Moon className="w-3 h-3 text-primary-900" />
                    ) : (
                        <Sun className="w-3 h-3 text-yellow-500" />
                    )}
                </div>
            </div>
        </button>
    );
};
```

---

### 3. Actualizar Tailwind Config

**Archivo:** `tailwind.config.js`

Agregar al final del archivo (antes del cierre):

```javascript
module.exports = {
  // ... config existente
  darkMode: 'class', // ← AGREGAR ESTA LÍNEA
  theme: {
    extend: {
      colors: {
        // Dark theme (actual)
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1e1b4b',
        },
        // Light theme colors (agregar)
        light: {
          bg: '#FFFFFF',
          'bg-secondary': '#F9FAFB',
          text: '#111827',
          'text-secondary': '#6B7280',
          border: '#E5E7EB',
        }
      },
    },
  },
};
```

---

### 4. CSS Variables para Ambos Temas

**Archivo:** `src/index.css`

Agregar al inicio (después de Tailwind imports):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ============================================ */
/* THEME SYSTEM - Dark & Light Variables       */
/* ============================================ */

:root {
  /* Colores que se adaptan al tema */
  --bg-primary: #0A0B0D;
  --bg-secondary: #1A1B1F;
  --bg-tertiary: #2A2B2F;
  --text-primary: #F9FAFB;
  --text-secondary: #9CA3AF;
  --border-primary: #374151;
  --accent-primary: #8B5CF6;
  --accent-secondary: #10B981;
}

/* Light theme overrides */
html.light {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F9FAFB;
  --bg-tertiary: #F3F4F6;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --border-primary: #E5E7EB;
  --accent-primary: #8B5CF6;
  --accent-secondary: #10B981;
}

/* Clase helper para usar variables */
.bg-theme-primary { background-color: var(--bg-primary); }
.bg-theme-secondary { background-color: var(--bg-secondary); }
.bg-theme-tertiary { background-color: var(--bg-tertiary); }
.text-theme-primary { color: var(--text-primary); }
.text-theme-secondary { color: var(--text-secondary); }
.border-theme { border-color: var(--border-primary); }

/* ============================================ */
/* ANIMATIONS - Premium Effects                */
/* ============================================ */

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
  50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
}

@keyframes scale-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Utility classes para animaciones */
.animate-gradient { animation: gradient-shift 6s ease infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 2s linear infinite; }
.animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
.animate-scale-in { animation: scale-in 0.3s ease-out; }

/* Smooth transitions para todo */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}
```

---

### 5. Integrar ThemeProvider

**Archivo:** `src/main.tsx`

```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>  {/* ← AGREGAR */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
```

---

### 6. Agregar Toggle al Header

**Archivo:** `src/components/layout/Header.tsx`

```typescript
import { ThemeToggle } from '@/components/ui/ThemeToggle';

// Dentro del Header, agregar junto al CartButton:
<div className="flex items-center gap-4">
    <ThemeToggle />  {/* ← AGREGAR */}
    <CartButton />
    {/* ... otros botones */}
</div>
```

---

## 🎨 PARTE 2: MEGA HERO CON CAROUSEL (1.5 horas)

### Componente: MegaHero

**Archivo:** `src/components/home/MegaHero.tsx`

```typescript
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Zap, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

interface Slide {
    id: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    bgGradient: string;
    bgGradientLight: string; // Para light theme
    image?: string;
    badges?: { icon: JSX.Element; text: string; variant: 'success' | 'warning' }[];
}

const SLIDES: Slide[] = [
    {
        id: '1',
        title: 'Los Mejores Vapes',
        subtitle: '20% OFF en tu primera compra + envío gratis en Xalapa',
        ctaText: 'Compra Ahora',
        ctaLink: '/vape',
        bgGradient: 'from-purple-600 via-pink-600 to-purple-700',
        bgGradientLight: 'from-purple-400 via-pink-400 to-purple-500',
        badges: [
            { icon: <Package className="w-4 h-4" />, text: 'Envío Gratis', variant: 'success' },
            { icon: <Zap className="w-4 h-4" />, text: '20% OFF', variant: 'warning' },
        ],
    },
    {
        id: '2',
        title: 'Productos Premium 420',
        subtitle: 'La mejor selección de productos importados directamente para ti',
        ctaText: 'Explorar 420',
        ctaLink: '/420',
        bgGradient: 'from-green-600 via-emerald-600 to-teal-700',
        bgGradientLight: 'from-green-400 via-emerald-400 to-teal-500',
        badges: [
            { icon: <Package className="w-4 h-4" />, text: 'Importados', variant: 'success' },
        ],
    },
    {
        id: '3',
        title: 'Más de 50 Sabores',
        subtitle: 'Encuentra tu favorito entre nuestra amplia variedad de líquidos',
        ctaText: 'Ver Líquidos',
        ctaLink: '/vape/liquidos',
        bgGradient: 'from-blue-600 via-indigo-600 to-purple-700',
        bgGradientLight: 'from-blue-400 via-indigo-400 to-purple-500',
    },
];

export const MegaHero = () => {
    const { isDark } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        }, 5000); // Cambiar cada 5 segundos

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
        setIsAutoPlaying(false); // Pausar auto-play al interactuar
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % SLIDES.length);
        setIsAutoPlaying(false);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
        setIsAutoPlaying(false);
    };

    const slide = SLIDES[currentSlide];
    const gradientClass = isDark ? slide.bgGradient : slide.bgGradientLight;

    return (
        <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
            {/* Background gradient con animación */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} animate-gradient bg-[length:200%_200%]`} />

            {/* Particles effect (sutil) */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl animate-float" />
                <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full container-vsm flex items-center">
                <div className="max-w-2xl">
                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-scale-in">
                        {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/90 mb-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                        {slide.subtitle}
                    </p>

                    {/* CTA Button */}
                    <Link
                        to={slide.ctaLink}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-opacity-90 transition-all hover:scale-105 hover:shadow-2xl animate-scale-in"
                        style={{ animationDelay: '0.2s' }}
                    >
                        {slide.ctaText}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* Badges flotantes (top-right) */}
            {slide.badges && (
                <div className="absolute top-6 right-6 space-y-2 z-20">
                    {slide.badges.map((badge, idx) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm backdrop-blur-sm animate-scale-in ${
                                badge.variant === 'success'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-yellow-500/90 text-gray-900'
                            }`}
                            style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                        >
                            {badge.icon}
                            {badge.text}
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Slide anterior"
            >
                <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="Siguiente slide"
            >
                <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Dots navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                            idx === currentSlide
                                ? 'w-8 bg-white'
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Ir a slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
```

---

## 🎨 PARTE 3: CATEGORY SHOWCASE (1 hora)

### Componente: CategoryShowcase

**Archivo:** `src/components/home/CategoryShowcase.tsx`

```typescript
import { Link } from 'react-router-dom';
import { Flame, Box, Leaf, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface CategoryCard {
    id: string;
    name: string;
    slug: string;
    section: 'vape' | '420';
    icon: JSX.Element;
    productCount: number;
    image: string;
    gradient: string;
    gradientLight: string;
}

const FEATURED_CATEGORIES: CategoryCard[] = [
    {
        id: '1',
        name: 'Líquidos',
        slug: 'liquidos',
        section: 'vape',
        icon: <Flame className="w-8 h-8" />,
        productCount: 127,
        image: 'https://images.unsplash.com/photo-1569437061238-3cf61084f487?w=800',
        gradient: 'from-orange-500/80 to-red-600/80',
        gradientLight: 'from-orange-400/60 to-red-500/60',
    },
    {
        id: '2',
        name: 'Pods & Mods',
        slug: 'pods',
        section: 'vape',
        icon: <Box className="w-8 h-8" />,
        productCount: 85,
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
        gradient: 'from-blue-500/80 to-purple-600/80',
        gradientLight: 'from-blue-400/60 to-purple-500/60',
    },
    {
        id: '3',
        name: 'Cannabis Premium',
        slug: 'cannabis',
        section: '420',
        icon: <Leaf className="w-8 h-8" />,
        productCount: 64,
        image: 'https://images.unsplash.com/photo-1605928015870-644a025ed0d2?w=800',
        gradient: 'from-green-500/80 to-emerald-600/80',
        gradientLight: 'from-green-400/60 to-emerald-500/60',
    },
    {
        id: '4',
        name: 'Accesorios',
        slug: 'accesorios',
        section: 'vape',
        icon: <Zap className="w-8 h-8" />,
        productCount: 43,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
        gradient: 'from-yellow-500/80 to-orange-600/80',
        gradientLight: 'from-yellow-400/60 to-orange-500/60',
    },
];

export const CategoryShowcase = () => {
    const { isDark } = useTheme();

    return (
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-theme-primary">
                    Explora por Categoría
                </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURED_CATEGORIES.map((category) => {
                    const gradientClass = isDark ? category.gradient : category.gradientLight;

                    return (
                        <Link
                            key={category.id}
                            to={`/${category.section}/${category.slug}`}
                            className="group relative h-64 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} transition-opacity duration-300 group-hover:opacity-90`} />

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-end p-6">
                                {/* Icon */}
                                <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                                        {category.icon}
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-white/80 text-sm">
                                    {category.productCount} productos
                                </p>

                                {/* Arrow indicator */}
                                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};
```

---

## 🔄 PARTE 4: ACTUALIZAR HOME PAGE

**Archivo:** `src/pages/Home.tsx`

Reemplazar el componente completo:

```typescript
import { MegaHero } from '@/components/home/MegaHero';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';
import { ProductRail } from '@/components/home/ProductRail';
import { PromoSection } from '@/components/home/PromoSection';
import { SEO } from '@/components/seo/SEO';

export function Home() {
    return (
        <div className="min-h-screen pb-20 pt-6 bg-theme-primary">
            <SEO
                title="Inicio"
                description="Tu tienda de confianza para vapeo y productos 420 en Xalapa. Envíos gratis y variedad de productos."
            />

            <div className="container-vsm space-y-10 md:space-y-16">
                {/* 1. MEGA HERO */}
                <MegaHero />

                {/* 2. CATEGORY SHOWCASE */}
                <CategoryShowcase />

                {/* 3. NEW ARRIVALS */}
                <ProductRail
                    type="new"
                    title="🔥 Nuevos Lanzamientos"
                />

                {/* 4. PROMO BANNER */}
                <PromoSection
                    title="Envíos Gratis en Xalapa"
                    subtitle="Recibe tus productos favoritos en la puerta de tu casa sin costo adicional en compras mayores a $500."
                    cta="Ver zonas de entrega"
                    link="/referencias"
                    bgImage="https://images.unsplash.com/photo-1615550280562-b1fc56e18f87?q=80&w=2670&auto=format&fit=crop"
                />

                {/* 5. BESTSELLERS */}
                <ProductRail
                    type="bestseller"
                    title="🏆 Los Más Vendidos"
                />
            </div>
        </div>
    );
}
```

---

## 📋 COMMITS

### Commit 1: Theme System
```bash
git add src/contexts/ThemeContext.tsx src/components/ui/ThemeToggle.tsx src/main.tsx src/components/layout/Header.tsx tailwind.config.js src/index.css
git commit -m "feat(theme): add dual theme system with dark/light mode

- Create ThemeContext with localStorage persistence
- Add ThemeToggle component with smooth animation
- Configure Tailwind for class-based dark mode
- Add CSS variables for theme-aware colors
- Integrate toggle in Header
- Add premium animation keyframes"
```

### Commit 2: MegaHero Component
```bash
git add src/components/home/MegaHero.tsx
git commit -m "feat(home): add premium MegaHero carousel component

- 3 slides with auto-play (5s interval)
- Animated gradients (theme-aware)
- Floating badges (Envío Gratis, 20% OFF)
- Navigation arrows + dots
- Particle effects background
- Smooth transitions and hover effects
- Responsive: 400px mobile, 500px desktop"
```

### Commit 3: CategoryShowcase Component
```bash
git add src/components/home/CategoryShowcase.tsx
git commit -m "feat(home): add CategoryShowcase with premium visuals

- 4 featured categories with images
- Hover: scale 1.1x + overlay opacity
- Icons with rotation animation on hover
- Product count display
- Responsive: 2 cols mobile, 4 cols desktop
- Theme-aware gradients"
```

### Commit 4: Update Home Page
```bash
git add src/pages/Home.tsx
git commit -m "feat(home): integrate MegaHero and CategoryShowcase

- Replace basic HeroBanner with MegaHero
- Add CategoryShowcase after hero
- Increase spacing between sections (10/16)
- Apply theme-aware background
- Phase 1 of home epic redesign complete"
```

---

## 🧪 TESTING CHECKLIST

### Theme System
- [ ] Toggle cambia tema correctamente
- [ ] Tema persiste al recargar página
- [ ] CSS variables cambian en ambos temas
- [ ] Animaciones suaves (200ms transition)
- [ ] Toggle visible en Header (desktop y mobile)

### MegaHero
- [ ] 3 slides visibles
- [ ] Auto-play funciona (5s)
- [ ] Click en arrows cambia slide
- [ ] Click en dots cambia slide
- [ ] Hover en hero muestra arrows
- [ ] Badges visibles (top-right)
- [ ] CTA button funciona
- [ ] Responsive en mobile (400px height)
- [ ] Responsive en desktop (500px height)
- [ ] Gradientes animados

### CategoryShowcase
- [ ] 4 categorías visibles
- [ ] Hover: imagen zoom + overlay
- [ ] Hover: icon rotate
- [ ] Links funcionan
- [ ] Product count visible
- [ ] Responsive: 2 cols mobile, 4 desktop
- [ ] Gradientes adaptan a tema

### General
- [ ] Home carga sin errores
- [ ] Espaciado entre secciones correcto
- [ ] Tema claro se ve bien
- [ ] Tema oscuro se ve bien
- [ ] Mobile responsive
- [ ] Desktop responsive

---

## 📝 NOTAS IMPORTANTES

**Sobre Imágenes:**
- Las URLs de Unsplash son temporales
- Reemplazar con imágenes reales de productos
- Idealmente: fotos profesionales de tu inventario

**Sobre Performance:**
- Hero auto-play: 5 segundos (ajustable)
- Animations: GPU-accelerated (transform, opacity)
- Images: Lazy loading aplicado automáticamente

**Sobre Accesibilidad:**
- Todos los buttons tienen aria-label
- Keyboard navigation funciona
- Theme toggle es accesible

---

## ⏭️ PRÓXIMOS PASOS (FASE 2)

Después de verificar Fase 1, implementaremos:

1. **Flash Deals** con countdown timer
2. **Brands Carousel** (Elfbar, Vaporesso, etc)
3. **Social Proof** (testimonials de clientes)
4. **Trust Badges** footer
5. **Quick Actions** cards

**Tiempo Fase 2:** 3 horas

---

**FIN DE FASE 1**

Tiempo total: ~3 horas
Resultado: Home premium con dual theme y componentes base épicos
