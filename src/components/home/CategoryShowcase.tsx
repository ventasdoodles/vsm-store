/**
 * CategoryShowcase — Grid interactivo de categorías destacadas con Framer Motion.
 *
 * @module CategoryShowcase
 * @independent Componente 100% independiente. Gradientes fijos (dark-only).
 * @data Categorías gestionadas dinámicamente desde el panel de admin (store_settings).
 * @removable Quitar de Home.tsx sin consecuencias para el resto de la página.
 */
import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { CATEGORY_GRADIENTS, CATEGORY_ICONS, FALLBACK_CATEGORIES } from '@/constants/category-showcase';
import type { FeaturedCategory } from '@/services/settings.service';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

/** Subcomponente que maneja el estado de carga/error de la imagen con React state */
function CategoryCard({ category }: { category: FeaturedCategory }) {
    const [imgError, setImgError] = useState(false);

    // Reset error state when the image URL changes (e.g. when settings load from DB)
    useEffect(() => {
        setImgError(false);
    }, [category.image]);

    const preset = CATEGORY_GRADIENTS.find(g => g.id === category.presetId) ?? CATEGORY_GRADIENTS[0]!;
    const gradientClass = preset.gradient;
    const IconComponent = CATEGORY_ICONS[category.iconName as keyof typeof CATEGORY_ICONS] ?? CATEGORY_ICONS['Box']!;

    const showImage = category.image && !imgError;

    return (
        <motion.div variants={itemVariants} className="block relative">
            <Link
                to={`/${category.section}/${category.slug}`}
                className="group relative block h-80 rounded-3xl overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 vsm-border"
            >
                <div className="absolute inset-0">
                    {showImage ? (
                        <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <IconComponent className="w-20 h-20 text-white/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-theme-primary/20 group-hover:bg-theme-primary/10 transition-colors duration-500" />
                </div>

                <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} mix-blend-multiply opacity-40 group-hover:opacity-25 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-theme-primary/80 via-theme-primary/10 to-transparent" />

                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                    <motion.div
                        initial={{ y: 0 }}
                        whileHover={{ y: -10, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.4 }}
                        className="mb-6"
                    >
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white vsm-border shadow-xl">
                            <IconComponent className="w-8 h-8" />
                        </div>
                    </motion.div>

                    <div className="space-y-1">
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic line-clamp-1 pb-1 pt-1 group-hover:text-vape-400 transition-colors">
                            {category.name}
                        </h3>
                        <p className="text-white/80 text-xs font-black uppercase tracking-[0.2em]">
                            Ver productos
                        </p>
                    </div>

                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full vsm-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                        <ChevronRight className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="absolute inset-0 rounded-3xl vsm-border-subtle pointer-events-none" />
            </Link>
        </motion.div>
    );
}

export const CategoryShowcase = () => {
    const { data: settings } = useStoreSettings();

    // Obtener las 4 categorías configuradas, rellenando slots vacíos con fallbacks
    const displayCategories = useMemo(() => {
        const saved = settings?.featured_categories;
        if (!saved || saved.length === 0) return FALLBACK_CATEGORIES;

        // Siempre devolver exactamente 4 slots, usando fallback si alguno falta
        return Array.from({ length: 4 }, (_, i) => {
            const cat = saved[i];
            return (cat && cat.slug && cat.name) ? cat : FALLBACK_CATEGORIES[i]!;
        });
    }, [settings?.featured_categories]);

    return (
        <section className="space-y-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full bg-vape-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                    <h2 className="text-3xl font-black text-theme-primary tracking-tighter uppercase italic">
                        Explora Categorías
                    </h2>
                </div>
            </motion.div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-10%' }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {displayCategories.map((category, index) => (
                    <CategoryCard key={`${category.id}-${index}`} category={category} />
                ))}
            </motion.div>
        </section>
    );
};
