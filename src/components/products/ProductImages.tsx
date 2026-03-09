/**
 * // ─── COMPONENTE: ProductImages ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Galeria interactiva con Spotlight y transiciones elasticas.
 *    Features: Zoom 3D on hover, thumbnails Glass-Pro, Elastic Spring transitions.
 * // Regla / Notas: Optimizado para interaccion movil y desktop.
 */
import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';

interface ProductImagesProps {
    images: string[];
    coverImage?: string | null;
    productName: string;
}

/**
 * Galería con imagen principal (zoom on hover) y thumbnails clickeables.
 * Premium Style: Glassmorphic thumbnails & smooth transitions.
 * Omni-Pulse Power: Haptic feedback & Immersive Zoom.
 */
export function ProductImages({ images, coverImage, productName }: ProductImagesProps) {
    const allImages = (() => {
        if (!coverImage) return images;
        const filtered = images.filter(img => img !== coverImage);
        return [coverImage, ...filtered];
    })();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
    const lastTap = useRef(0);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    /** Activa retroalimentación háptica si está disponible */
    const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
        if (!window.navigator.vibrate) return;
        
        switch (type) {
            case 'light': window.navigator.vibrate(10); break;
            case 'medium': window.navigator.vibrate(20); break;
            case 'heavy': window.navigator.vibrate([30, 50, 30]); break;
        }
    }, []);

    const toggleZoom = useCallback((x?: number, y?: number) => {
        setIsZoomed((prev) => {
            const next = !prev;
            triggerHaptic(next ? 'medium' : 'light');
            
            if (next && x !== undefined && y !== undefined && imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                const zx = ((x - rect.left) / rect.width) * 100;
                const zy = ((y - rect.top) / rect.height) * 100;
                imageRef.current.style.setProperty('--zoom-x', `${zx}%`);
                imageRef.current.style.setProperty('--zoom-y', `${zy}%`);
            }
            return next;
        });
    }, [triggerHaptic]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();

        // Zoom values (solo si no es mobile o si queremos preview)
        if (!isZoomed) {
            const zx = ((e.clientX - rect.left) / rect.width) * 100;
            const zy = ((e.clientY - rect.top) / rect.height) * 100;
            imageRef.current.style.setProperty('--zoom-x', `${zx}%`);
            imageRef.current.style.setProperty('--zoom-y', `${zy}%`);
        }

        // Spotlight values
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            const touch = e.touches[0];
            if (touch) {
                toggleZoom(touch.clientX, touch.clientY);
            }
        }
        lastTap.current = now;
    };

    if (allImages.length === 0) {
        return (
            <div className="vsm-surface flex aspect-square items-center justify-center bg-theme-secondary/30 backdrop-blur-md">
                <span className="text-5xl font-black text-theme-secondary/10 tracking-widest uppercase">VSM</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Imagen principal con zoom */}
            <div
                ref={imageRef}
                className={cn(
                    "vsm-gallery group relative bg-theme-secondary/20 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl",
                    isZoomed ? "cursor-grab active:cursor-grabbing touch-none ring-2 ring-vape-500/50" : "cursor-zoom-in"
                )}
                onMouseEnter={() => !isZoomed && setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
                onClick={() => !isZoomed && toggleZoom()}
            >
                <AnimatePresence exitBeforeEnter={false} initial={false}>
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                        animate={{
                            opacity: 1,
                            scale: isZoomed ? 2.5 : 1,
                            rotateY: 0
                        }}
                        exit={{ opacity: 0, scale: 1.1, rotateY: -10 }}
                        transition={{
                            type: 'spring',
                            stiffness: 120,
                            damping: 25
                        }}
                        drag={isZoomed}
                        dragConstraints={imageRef}
                        dragElastic={0.1}
                        className="relative h-full w-full origin-[var(--zoom-x,50%)_var(--zoom-y,50%)]"
                    >
                        <OptimizedImage
                            src={allImages[selectedIndex] || ''}
                            alt={`${productName} - imagen ${selectedIndex + 1}`}
                            width={1200}
                            height={1200}
                            quality={100}
                            containerClassName="h-full w-full aspect-square pointer-events-none"
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* 🔦 Spotlight Effect (Enhanced) */}
                <motion.div
                    className="pointer-events-none absolute -inset-px z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                400px circle at ${mouseX}px ${mouseY}px,
                                rgba(59, 130, 246, 0.15),
                                transparent 80%
                            )
                        `,
                    }}
                />

                {/* Glassmorphic Controls Indicator */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <AnimatePresence>
                        {isZoomed && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="vsm-pill bg-vape-500 text-slate-950 font-black text-[10px] uppercase tracking-tighter"
                            >
                                Immersivo
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Mobile dismiss hint */}
                <AnimatePresence>
                    {isZoomed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-16 left-1/2 -translate-x-1/2 md:hidden vsm-pill bg-black/60 text-white border-white/10 backdrop-blur-md pointer-events-none z-30"
                        >
                            Doble toque para salir
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shimmer overlay on hover */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transition-opacity duration-700 z-20",
                    isZoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                )} />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <span className={cn(
                        "vsm-pill absolute bottom-3 right-3 bg-slate-950/80 text-white border-white/10 backdrop-blur-md shadow-lg transition-all duration-300 z-20",
                        isZoomed && "opacity-0 scale-90 translate-y-4"
                    )}>
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
                    {allImages.map((image, index) => (
                        <button
                            key={image}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'vsm-thumbnail relative',
                                selectedIndex === index
                                    ? 'border-accent-primary ring-2 ring-accent-primary/20 scale-105 shadow-xl'
                                    : 'border-theme opacity-60 hover:opacity-100 hover:border-theme-strong hover:scale-105'
                            )}
                        >
                            <OptimizedImage
                                src={image}
                                alt={`${productName} - thumbnail ${index + 1}`}
                                width={200}
                                height={200}
                                quality={80}
                                containerClassName="h-16 w-16 sm:h-20 sm:w-20"
                                className="object-cover"
                            />
                            {/* Selected overlay */}
                            {selectedIndex === index && (
                                <div className="absolute inset-0 bg-accent-primary/5 pointer-events-none" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
