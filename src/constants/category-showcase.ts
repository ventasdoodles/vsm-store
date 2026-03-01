import { LucideIcon, Flame, Box, Leaf, Zap, Droplets, Sparkles, Wind, Gift, Ghost, Asterisk, Coffee, Flower2 } from 'lucide-react';
import type { FeaturedCategory } from '@/services/settings.service';

/**
 * Constantes compartidas del Categorias Home (CategoryShowcase).
 * @module category-constants
 */

export interface CategoryPresetGradient {
    id: string;
    name: string;      // Nombre para el panel Admin
    dark: string;      // Clases Tailwind para el gradiente (modo oscuro)
    light: string;     // Clases Tailwind para el gradiente (modo claro)
    colorCode: string; // Hex/Tailwind class para mostrar el "color" visualmente en el admin selector
}

export const CATEGORY_GRADIENTS: CategoryPresetGradient[] = [
    { id: 'orange-red', name: 'Fuego (Naranja-Rojo)', dark: 'from-orange-500/80 to-red-600/80', light: 'from-orange-400/60 to-red-500/60', colorCode: 'bg-gradient-to-r from-orange-500 to-red-600' },
    { id: 'blue-purple', name: 'Nebula (Azul-Morado)', dark: 'from-blue-500/80 to-purple-600/80', light: 'from-blue-400/60 to-purple-500/60', colorCode: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { id: 'green-emerald', name: 'Kush (Verde-Esmeralda)', dark: 'from-green-500/80 to-emerald-600/80', light: 'from-green-400/60 to-emerald-500/60', colorCode: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { id: 'yellow-orange', name: 'Rayo (Amarillo-Naranja)', dark: 'from-yellow-500/80 to-orange-600/80', light: 'from-yellow-400/60 to-orange-500/60', colorCode: 'bg-gradient-to-r from-yellow-500 to-orange-600' },
    { id: 'pink-rose', name: 'Cyber (Rosa-Rose)', dark: 'from-fuchsia-500/80 to-rose-600/80', light: 'from-fuchsia-400/60 to-rose-500/60', colorCode: 'bg-gradient-to-r from-fuchsia-500 to-rose-600' },
    { id: 'cyan-blue', name: 'Océano (Cyan-Azul)', dark: 'from-cyan-500/80 to-blue-600/80', light: 'from-cyan-400/60 to-blue-500/60', colorCode: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
    { id: 'stone-zinc', name: 'Urbano (Gris-Oscuro)', dark: 'from-stone-600/80 to-zinc-800/80', light: 'from-stone-400/60 to-zinc-600/60', colorCode: 'bg-gradient-to-r from-stone-600 to-zinc-800' }
];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
    Flame,
    Box,
    Leaf,
    Zap,
    Droplets,
    Sparkles, 
    Wind,
    Gift,
    Ghost,
    Asterisk,
    Coffee,
    Flower2,
};

export const FALLBACK_CATEGORIES: FeaturedCategory[] = [
    {
        id: '1',
        name: 'Líquidos',
        slug: 'liquidos',
        section: 'vape',
        iconName: 'Flame',
        image: 'https://images.unsplash.com/photo-1569437061238-3cf61084f487?w=800',
        presetId: 'orange-red',
    },
    {
        id: '2',
        name: 'Pods & Mods',
        slug: 'pods',
        section: 'vape',
        iconName: 'Box',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
        presetId: 'blue-purple',
    },
    {
        id: '3',
        name: 'Cannabis Premium',
        slug: 'cannabis',
        section: '420',
        iconName: 'Leaf',
        image: 'https://images.unsplash.com/photo-1605928015870-644a025ed0d2?w=800',
        presetId: 'green-emerald',
    },
    {
        id: '4',
        name: 'Accesorios',
        slug: 'accesorios',
        section: 'vape',
        iconName: 'Zap',
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
        presetId: 'yellow-orange',
    },
];
