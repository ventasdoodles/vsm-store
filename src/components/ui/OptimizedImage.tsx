import { useState, useEffect } from 'react';
import { cn, optimizeImage } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
    containerClassName?: string;
    loadingStrategy?: 'lazy' | 'eager';
    fallbackIcon?: React.ReactNode;
}

export function OptimizedImage({
    src,
    alt,
    width = 800,
    height,
    quality = 80,
    format = 'webp',
    className,
    containerClassName,
    loadingStrategy = 'lazy',
    fallbackIcon,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Reset state if src changes
    useEffect(() => {
        setIsLoading(true);
        setError(false);
    }, [src]);

    const optimizedSrc = optimizeImage(src, { width, height, quality, format });

    return (
        <div className={cn("relative overflow-hidden bg-theme-secondary/20", containerClassName)}>
            {/* Skeleton / Placeholder */}
            {isLoading && !error && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-theme-secondary/30 to-transparent bg-[length:200%_100%]" />
            )}

            {/* Error Fallback */}
            {error ? (
                <div className="flex h-full w-full items-center justify-center bg-theme-secondary/10 flex-col gap-2 p-4 text-center">
                    {fallbackIcon || <ImageOff className="h-10 w-10 text-theme-tertiary" />}
                    <span className="text-[10px] text-theme-tertiary font-medium uppercase tracking-tight">Image not available</span>
                </div>
            ) : (
                <img
                    src={optimizedSrc}
                    alt={alt}
                    loading={loadingStrategy}
                    className={cn(
                        "h-full w-full object-cover transition-opacity duration-500",
                        isLoading ? "opacity-0" : "opacity-100",
                        className
                    )}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
