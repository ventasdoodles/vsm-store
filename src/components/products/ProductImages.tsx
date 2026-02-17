// Galería de imágenes de producto - VSM Store
import { useState, useRef } from 'react';
import { cn, optimizeImage } from '@/lib/utils';

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
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/30">
                <span className="text-5xl font-bold text-primary-800">VSM</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Imagen principal con zoom */}
            <div
                ref={imageRef}
                className="group relative overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/30 cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={optimizeImage(allImages[selectedIndex], { width: 1000, height: 1000, quality: 90, format: 'webp' })}
                    alt={`${productName} - imagen ${selectedIndex + 1}`}
                    className={cn(
                        'aspect-square w-full object-cover transition-transform duration-300',
                        isZoomed && 'scale-150'
                    )}
                    style={isZoomed ? {
                        transformOrigin: 'var(--zoom-x, 50%) var(--zoom-y, 50%)',
                    } : undefined}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/1000x1000/0a0a0a/404040?text=Imagen+no+disponible';
                    }}
                />

                {/* Image counter */}
                {allImages.length > 1 && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-primary-950/70 px-2.5 py-1 text-[10px] font-medium text-primary-300 backdrop-blur-sm border border-primary-800/30">
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
                                    : 'border-primary-800/40 opacity-50 hover:opacity-100 hover:border-primary-700'
                            )}
                        >
                            <img
                                src={optimizeImage(image, { width: 200, height: 200, quality: 80, format: 'webp' })}
                                alt={`${productName} - thumbnail ${index + 1}`}
                                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'https://via.placeholder.com/200x200/0a0a0a/404040?text=Error';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
