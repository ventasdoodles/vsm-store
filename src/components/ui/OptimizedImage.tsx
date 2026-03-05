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
    /** Marca como imagen prioritaria (LCP): loading="eager" + fetchpriority="high" */
    priority?: boolean;
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
    priority = false,
    fallbackIcon,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [useFallback, setUseFallback] = useState(false);

    // Reset state if src changes
    useEffect(() => {
        setIsLoading(true);
        setError(false);
        setUseFallback(false);
    }, [src]);

    const optimizedSrc = optimizeImage(src, { width, height, quality, format });
    // If render endpoint failed, fall back to original URL before giving up
    const activeSrc = useFallback ? src : optimizedSrc;

    // If src is empty/falsy, show fallback immediately
    if (!src) {
        return (
            <div className={cn("relative overflow-hidden bg-theme-secondary/20", containerClassName)}>
                <div className="flex h-full w-full items-center justify-center bg-theme-secondary/10 flex-col gap-2 p-4 text-center">
                    {fallbackIcon || <ImageOff className="h-12 w-12 text-theme-tertiary/40" />}
                    <span className="text-xs text-theme-tertiary/60 font-medium uppercase tracking-tight">Sin imagen</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden bg-theme-secondary/20", containerClassName)}>
            {/* Skeleton / Placeholder */}
            {isLoading && !error && (
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-theme-secondary/30 to-transparent bg-[length:200%_100%]" />
            )}

            {/* Error Fallback */}
            {error ? (
                <div className="flex h-full w-full items-center justify-center bg-theme-secondary/10 flex-col gap-2 p-4 text-center">
                    {fallbackIcon || <ImageOff className="h-12 w-12 text-theme-tertiary/40" />}
                    <span className="text-xs text-theme-tertiary/60 font-medium uppercase tracking-tight">Imagen no disponible</span>
                </div>
            ) : (
                <img
                    src={activeSrc}
                    alt={alt}
                    loading={priority ? 'eager' : loadingStrategy}
                    // eslint-disable-next-line react/no-unknown-property
                    fetchPriority={priority ? 'high' : undefined}
                    className={cn(
                        "h-full w-full object-cover transition-opacity duration-500",
                        isLoading ? "opacity-0" : "opacity-100",
                        className
                    )}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        // If render endpoint failed and we haven't tried original yet, try it
                        if (!useFallback && activeSrc !== src) {
                            setUseFallback(true);
                            return;
                        }
                        setIsLoading(false);
                        setError(true);
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
