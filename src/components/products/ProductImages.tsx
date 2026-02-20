import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface ProductImagesProps {
    images: string[];
    coverImage?: string | null;
    productName: string;
}

/**
 * Galería con imagen principal (zoom on hover) y thumbnails clickeables
 */
export function ProductImages({ images, coverImage, productName }: ProductImagesProps) {
    // Asegurar que la imagen de portada sea SIEMPRE la primera en mostrarse
    const allImages = (() => {
        if (!coverImage) return images;
        // Filtrar la portada de su posición actual y ponerla al inicio
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

    // Si no hay imágenes, mostrar placeholder
    if (allImages.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-theme/40 bg-theme-secondary/30">
                <span className="text-5xl font-bold text-theme-secondary/20">VSM</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Imagen principal con zoom */}
            <div
                ref={imageRef}
                className="group relative overflow-hidden rounded-2xl border border-theme/40 bg-theme-secondary/30 cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <OptimizedImage
                    src={allImages[selectedIndex] || ''}
                    alt={`${productName} - imagen ${selectedIndex + 1}`}
                    width={1000}
                    height={1000}
                    quality={90}
                    containerClassName="h-full w-full"
                    className={cn(
                        'aspect-square object-cover transition-transform duration-300',
                        isZoomed && 'scale-150'
                    )}
                    style={isZoomed ? {
                        transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)',
                    } : undefined}
                />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-theme-primary/70 px-2.5 py-1 text-[10px] font-medium text-theme-secondary backdrop-blur-sm border border-theme/30">
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                )}
            </div>

            {/* Thumbnails (solo si hay más de 1 imagen) */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {allImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200',
                                selectedIndex === index
                                    ? 'border-vape-500 shadow-md shadow-vape-500/20 scale-105'
                                    : 'border-theme/40 opacity-50 hover:opacity-100 hover:border-theme'
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
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
