/**
 * // ─── COMPONENTE: CATEGORY SHOWCASE ───
 * // Propósito: Grid interactivo de categorías con efectos de spotlight.
 * // Arquitectura: Presentational component con estados de mouse locales.
 * // Estética: §2.1 Premium (Spotlight effect, Glassmorphism, Gradientes suaves).
 */
import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CATEGORY_GRADIENTS_MAP, CATEGORY_ICONS, FALLBACK_CATEGORIES, CATEGORY_GRADIENTS } from '@/constants/category-showcase';
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

/** Subcomponent que maneja el estado de carga/error de la imagen con React state */
function CategoryCard({ category }: { category: FeaturedCategory }) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const preset = CATEGORY_GRADIENTS_MAP.get(category.presetId) ?? CATEGORY_GRADIENTS[0]!;
    const gradientClass = preset.gradient;
    const IconComponent = CATEGORY_ICONS[category.iconName as keyof typeof CATEGORY_ICONS] ?? CATEGORY_ICONS['Box']!;

    return (
        <motion.div
            ref={cardRef}
            variants={itemVariants}
            className="block relative group/card cursor-pointer"
            onMouseMove={handleMouseMove}
        >
            <Link
                to={`/${category.section}/${category.slug}`}
                className="group relative block h-80 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] vsm-border bg-slate-900/40 backdrop-blur-3xl spotlight-container"
            >
                {/* Spotlight Reveal */}
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                    style={{
                        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.08), transparent 80%)`
                    }}
                />

                <div className="absolute inset-0">
                    {category.image ? (
                        <OptimizedImage
                            src={category.image}
                            alt={category.name}
                            width={400}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110 opacity-60 group-hover:opacity-80"
                            fallbackIcon={<IconComponent className="w-20 h-20 text-white/10" />}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                            <IconComponent className="w-20 h-20 text-white/10" />
                        </div>
                    )}
                </div>

                {/* Layered Glassmorphism */}
                <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />

                <div className="relative h-full flex flex-col justify-end p-8 z-20">
                    <motion.div
                        whileHover={{ y: -5, scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        className="mb-6 w-fit"
                    >
                        <div className="w-16 h-16 bg-white/5 backdrop-blur-2xl rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-2xl relative overflow-hidden group/icon">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                            <IconComponent className="w-8 h-8 relative z-10" />
                        </div>
                    </motion.div>

                    <div className="space-y-2">
                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-2 leading-[0.9] pb-1 pt-1 group-hover:text-vape-400 transition-colors">
                            {category.name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="h-px w-8 bg-vape-500/50 group-hover:w-12 transition-all duration-500" />
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                                Explore Collection
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-8 right-8 w-12 h-12 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 shadow-2xl">
                        <ChevronRight className="w-6 h-6 text-white" />
                    </div>
                </div>
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
