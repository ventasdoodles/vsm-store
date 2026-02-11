// Galería de imágenes de producto - VSM Store
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImagesProps {
    images: string[];
    productName: string;
}

/**
 * Galería con imagen principal y thumbnails clickeables
 */
export function ProductImages({ images, productName }: ProductImagesProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Si no hay imágenes, mostrar placeholder
    if (images.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-primary-800 bg-primary-900/50">
                <span className="text-5xl font-bold text-primary-800">VSM</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Imagen principal */}
            <div className="overflow-hidden rounded-2xl border border-primary-800 bg-primary-900/50">
                <img
                    src={images[selectedIndex]}
                    alt={`${productName} - imagen ${selectedIndex + 1}`}
                    className="aspect-square w-full object-cover transition-opacity duration-300"
                />
            </div>

            {/* Thumbnails (solo si hay más de 1 imagen) */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                                selectedIndex === index
                                    ? 'border-vape-500 shadow-md shadow-vape-500/20'
                                    : 'border-primary-800 opacity-60 hover:opacity-100'
                            )}
                        >
                            <img
                                src={image}
                                alt={`${productName} - thumbnail ${index + 1}`}
                                className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
