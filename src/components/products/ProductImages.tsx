import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { motion, AnimatePresence } from 'framer-motion';

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

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        imageRef.current.style.setProperty('--zoom-x', `${x}%`);
        imageRef.current.style.setProperty('--zoom-y', `${y}%`);
    };

    if (allImages.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-theme/40 bg-theme-secondary/30 backdrop-blur-md">
                <span className="text-5xl font-black text-theme-secondary/10 tracking-widest uppercase">VSM</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Imagen principal con zoom */}
            <div
                ref={imageRef}
                className="group relative overflow-hidden rounded-2xl border border-theme/40 bg-theme-secondary/20 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            'relative h-full w-full transition-transform duration-500 ease-out',
                            isZoomed && 'scale-[1.8]'
                        )}
                        style={isZoomed ? {
                            transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)',
                        } : undefined}
                    >
                        <OptimizedImage
                            src={allImages[selectedIndex] || ''}
                            alt={`${productName} - imagen ${selectedIndex + 1}`}
                            width={1000}
                            height={1000}
                            quality={90}
                            containerClassName="h-full w-full aspect-square"
                            className="object-cover"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Shimmer overlay on hover */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <span className="absolute bottom-4 right-4 rounded-full bg-theme-primary/80 px-3 py-1 text-[10px] font-black text-theme-secondary backdrop-blur-md border border-theme/30 shadow-lg">
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
                    {allImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'relative flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300',
                                selectedIndex === index
                                    ? 'border-accent-primary ring-2 ring-accent-primary/20 scale-105 shadow-xl'
                                    : 'border-theme/30 opacity-60 hover:opacity-100 hover:border-theme hover:scale-105'
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
