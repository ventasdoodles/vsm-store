/**
 * Constantes compartidas del Slider Hero (MegaHero).
 *
 * Single source of truth para los gradientes premium y las etiquetas predefinidas.
 * Importado desde:
 *   - src/components/home/MegaHero.tsx        (renderizado en tienda)
 *   - src/components/admin/settings/HeroSliderSettings.tsx  (panel de admin)
 *
 * @module slider-constants
 */

/** Configuración visual de cada tema premium */
export interface PresetGradient {
    /** Identificador único del preset (se guarda en BD como bgGradientLight) */
    id: string;
    /** Nombre legible para el panel de administración */
    name: string;
    /** Clases Tailwind del fondo del slide */
    bg: string;
    /** Gradiente del subtítulo (color contrastante al fondo) */
    textGradient: string;
    /** Gradiente del botón CTA principal */
    buttonGradient: string;
    /** Color de la descripción del slide */
    textColor: string;
    /** Color CSS del resplandor (glow) del botón */
    glowColor: string;
}

/**
 * Paletas premium con colores complementarios para máximo contraste visual.
 *
 * Cada preset define:
 *  - Fondo oscuro temático (`bg`)
 *  - Subtítulo en color contrastante (`textGradient`)
 *  - Descripción legible (`textColor`)
 *  - Botón con gradiente cohesivo (`buttonGradient`)
 *  - Glow del CTA (`glowColor`)
 */
export const PREMIUM_GRADIENTS: PresetGradient[] = [
    {
        id: 'cyberpunk',
        name: 'Neon Cyberpunk (Morado/Fucsia)',
        bg: 'from-violet-900 via-fuchsia-900 to-purple-900',
        textGradient: 'from-amber-300 to-yellow-500',
        buttonGradient: 'from-fuchsia-600 to-purple-600',
        textColor: 'text-amber-100',
        glowColor: 'rgba(192,38,211,0.5)',
    },
    {
        id: 'nature',
        name: 'Kush Nature (Verde/Esmeralda)',
        bg: 'from-emerald-900 via-green-900 to-teal-900',
        textGradient: 'from-amber-200 to-orange-400',
        buttonGradient: 'from-green-600 to-emerald-600',
        textColor: 'text-emerald-50',
        glowColor: 'rgba(5,150,105,0.5)',
    },
    {
        id: 'fire',
        name: 'Fire Vape (Rojo/Naranja)',
        bg: 'from-orange-900 via-red-900 to-rose-900',
        textGradient: 'from-cyan-300 to-blue-400',
        buttonGradient: 'from-red-600 to-orange-500',
        textColor: 'text-orange-50',
        glowColor: 'rgba(239,68,68,0.5)',
    },
    {
        id: 'ocean',
        name: 'Deep Blue (Azul/Cian)',
        bg: 'from-blue-900 via-cyan-900 to-slate-900',
        textGradient: 'from-yellow-300 to-amber-500',
        buttonGradient: 'from-cyan-600 to-blue-600',
        textColor: 'text-cyan-50',
        glowColor: 'rgba(56,189,248,0.5)',
    },
    {
        id: 'gold',
        name: 'Luxury Gold (Dorado/Ambar)',
        bg: 'from-stone-900 via-stone-800 to-zinc-900',
        textGradient: 'from-amber-200 via-yellow-400 to-amber-500',
        buttonGradient: 'from-amber-600 to-yellow-600',
        textColor: 'text-stone-200',
        glowColor: 'rgba(245,158,11,0.5)',
    },
];

/** Etiquetas predefinidas para el badge superior del slide */
export const PREDEFINED_TAGS = [
    'Ninguno',
    'Nuevo',
    'Lanzamiento',
    'Top Ventas',
    'Destacado',
    'Exclusivo',
    'Oferta',
    'Premium',
    'Restock',
] as const;

export type SliderTag = (typeof PREDEFINED_TAGS)[number];
