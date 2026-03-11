/**
 * BrandsCarousel Component — VSM Store
 *
 * Carrusel infinito de marcas destacadas para generar Social Proof.
 * Implementa scrolling continuo y efectos de glassmorphism premium.
 *
 * @author VSM Store
 * @version 1.1.0
 */
import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrands } from '@/hooks/useBrands';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { PublicBrand } from '@/hooks/useBrands';

/** Tarjeta individual de marca con efecto glassmorphism + hover glow */
function BrandCard({ brand }: { brand: PublicBrand }) {

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.05 }}
            className="flex-shrink-0 group cursor-pointer"
        >
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-3xl flex items-center justify-center p-6 transition-all duration-500 hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.05)] spotlight-container overflow-hidden">
                <div className="relative z-10 w-full h-full">
                    {brand.logo_url ? (
                        <OptimizedImage
                            src={brand.logo_url}
                            alt={brand.name}
                            width={200}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-contain opacity-40 group-hover:opacity-100 transition-all duration-700 filter group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] grayscale group-hover:grayscale-0"
                            fallbackIcon={
                                <div className="flex flex-col items-center justify-center gap-2 select-none w-full h-full">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
                                        <span className="text-2xl font-black text-white/30 group-hover:text-white/80 transition-colors tracking-tighter">
                                            {brand.name[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-white/20 group-hover:text-white/60 font-black uppercase tracking-[0.2em] text-center w-full px-2 truncate transition-colors">
                                        {brand.name}
                                    </span>
                                </div>
                            }
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 select-none w-full h-full">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
                                <span className="text-2xl font-black text-white/30 group-hover:text-white/80 transition-colors tracking-tighter">
                                    {brand.name[0]?.toUpperCase()}
                                </span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-white/20 group-hover:text-white/60 font-black uppercase tracking-[0.2em] text-center w-full px-2 truncate transition-colors">
                                {brand.name}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export const BrandsCarousel = () => {
    const { data: brands = [], isLoading } = useBrands();

    // Duplicate brands to ensure continuous loop
    const doubledBrands = useMemo(() => [...brands, ...brands, ...brands], [brands]);

    if (isLoading || brands.length === 0) return null;

    return (
        <section className="relative py-24 sm:py-32 overflow-hidden bg-theme-primary">
            {/* Background elements */}
            <div className="absolute top-0 left-1/4 w-[1000px] h-full bg-vape-500/[0.02] -skew-x-12 blur-[150px] pointer-events-none" />

            {/* Header Premium */}
            <div className="container-vsm relative z-10 text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
                        <Award className="w-4 h-4 text-accent-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                            Partner Network
                        </span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-theme-tertiary drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Trusted by the</span>{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-vape-400 to-accent-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            Industry Leaders
                        </span>
                    </h2>

                    <p className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-white/40 max-w-lg mx-auto leading-relaxed">
                        100% Authentic products from verified global manufacturers
                    </p>
                </motion.div>
            </div>

            {/* Carousel Track with Glass Track Effect */}
            <div className="relative group/track">
                {/* Horizontal Glass Track Background */}
                <div className="absolute inset-y-0 left-0 right-0 bg-white/[0.01] backdrop-blur-[2px] border-y border-white/[0.05] pointer-events-none" />

                <div className="flex overflow-hidden relative">
                    {/* Infinite Scrolling Container */}
                    <motion.div
                        className="flex gap-6 sm:gap-8 py-10 px-4"
                        animate={{
                            x: [0, -100 * brands.length],
                        }}
                        transition={{
                            x: {
                                repeat: Infinity,
                                repeatType: "loop",
                                duration: brands.length * 3, // Adjust speed based on item count
                                ease: "linear",
                            },
                        }}
                        style={{ width: "fit-content" }}
                    >
                        {doubledBrands.map((brand, idx) => (
                            <BrandCard key={`${brand.id}-${idx}`} brand={brand} />
                        ))}
                    </motion.div>

                    {/* Gradient Masks */}
                    <div className="absolute inset-y-0 left-0 w-32 sm:w-64 bg-gradient-to-r from-theme-primary via-theme-primary/80 to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-y-0 right-0 w-32 sm:w-64 bg-gradient-to-l from-theme-primary via-theme-primary/80 to-transparent pointer-events-none z-10" />
                </div>
            </div>

            {/* Bottom Counter */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center mt-12"
            >
                <div className="inline-flex items-center gap-4">
                    <div className="h-px w-12 bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
                        {brands.length} Verified Brands
                    </span>
                    <div className="h-px w-12 bg-white/10" />
                </div>
            </motion.div>
        </section>
    );
};
