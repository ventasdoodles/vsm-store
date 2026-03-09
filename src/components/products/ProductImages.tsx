/**
 * // ─── COMPONENTE: ProductImages ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Galeria interactiva con Spotlight y transiciones elasticas.
 *    Features: Zoom 3D on hover, thumbnails Glass-Pro, Elastic Spring transitions.
 * // Regla / Notas: Optimizado para interaccion movil y desktop.
 */
import { useState, useRef } from 'react';
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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();

        // Zoom values
        const zx = ((e.clientX - rect.left) / rect.width) * 100;
        const zy = ((e.clientY - rect.top) / rect.height) * 100;
        imageRef.current.style.setProperty('--zoom-x', `${zx}%`);
        imageRef.current.style.setProperty('--zoom-y', `${zy}%`);

        // Spotlight values
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            // Double tap detected
            setIsZoomed((prev: boolean) => !prev);

            // Set pan origin based on touch position
            if (!isZoomed && imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                const touch = e.touches[0];
                if (touch) {
                    const x = ((touch.clientX - rect.left) / rect.width) * 100;
                    const y = ((touch.clientY - rect.top) / rect.height) * 100;
                    imageRef.current.style.setProperty('--zoom-x', `${x}%`);
                    imageRef.current.style.setProperty('--zoom-y', `${y}%`);
                }
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
                    "vsm-gallery group relative bg-theme-secondary/20 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden",
                    isZoomed ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-zoom-in"
                )}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
                onTouchStart={handleTouchStart}
            >
                <AnimatePresence exitBeforeEnter={false} initial={false}>
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                        animate={{
                            opacity: 1,
                            scale: isZoomed ? 2 : 1,
                            rotateY: 0
                        }}
                        exit={{ opacity: 0, scale: 1.1, rotateY: -10 }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 20
                        }}
                        drag={isZoomed}
                        dragConstraints={imageRef}
                        dragElastic={0.1}
                        className="relative h-full w-full origin-[var(--zoom-x,50%)_var(--zoom-y,50%)]"
                    >
                        <OptimizedImage
                            src={allImages[selectedIndex] || ''}
                            alt={`${productName} - imagen ${selectedIndex + 1}`}
                            width={1000}
                            height={1000}
                            quality={90}
                            containerClassName="h-full w-full aspect-square pointer-events-none"
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* 🔦 Spotlight Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                300px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.12),
                                transparent 80%
                            )
                        `,
                    }}
                />

                {/* Mobile dismiss hint */}
                <AnimatePresence>
                    {isZoomed && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-4 left-1/2 -translate-x-1/2 md:hidden vsm-pill bg-black/60 text-white border-white/10 backdrop-blur-md pointer-events-none"
                        >
                            Doble toque para alejar
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shimmer overlay on hover - hidden when zoomed on mobile */}
                <div className={cn(
                    "absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transition-opacity duration-700",
                    isZoomed ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                )} />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <span className={cn(
                        "vsm-pill absolute bottom-3 right-3 bg-theme-primary/80 text-theme-secondary border-theme-subtle backdrop-blur-md shadow-lg transition-opacity duration-300",
                        isZoomed && "opacity-0 md:opacity-100"
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
