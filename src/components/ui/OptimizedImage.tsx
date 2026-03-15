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
            <div className={cn("relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/5", containerClassName)}>
                <div className="flex h-full w-full items-center justify-center flex-col gap-3 p-4 text-center group relative z-10">
                    <div className="w-16 h-16 rounded-full bg-black/40 border border-white/5 flex items-center justify-center transition-transform duration-500 hover:scale-105">
                        {fallbackIcon || <ImageOff className="h-8 w-8 text-white/30" strokeWidth={1.5} />}
                    </div>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Sin imagen</span>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative overflow-hidden bg-white/5", containerClassName)}>
            {/* Skeleton / Placeholder */}
            {isLoading && !error && (
                <div className="absolute inset-0 z-20">
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
            )}

            {/* Error Fallback / No Image */}
            {error || !src ? (
                <div className="flex h-full w-full items-center justify-center bg-[#0f172a] flex-col gap-3 p-4 text-center group relative overflow-hidden">
                    {/* Artistic Glow for Fallback */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-vape-500 rounded-full blur-[40px] animate-pulse" />
                    </div>
                    
                    <div className="relative z-10 w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner">
                        {fallbackIcon || <ImageOff className="h-8 w-8 text-white/30" strokeWidth={1.5} />}
                    </div>
                    <span className="relative z-10 text-[10px] text-white/40 font-black uppercase tracking-[0.3em] italic">VSM Artistic Selection</span>
                </div>
            ) : (
                <img
                    src={activeSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : loadingStrategy}
                    fetchpriority={priority ? 'high' : undefined}
                    className={cn(
                        "h-full w-full object-cover transition-opacity duration-500",
                        isLoading ? "opacity-0" : "opacity-100",
                        className
                    )}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        // If optimization failed, try original URL
                        if (!useFallback && optimizedSrc !== src) {
                            console.warn(`[OptimizedImage] Optimization failed for ${src}, falling back to original.`);
                            setUseFallback(true);
                        } else {
                            // If original also failed (or no optimization was tried), show error UI
                            setIsLoading(false);
                            setError(true);
                        }
                    }}
                    {...props}
                />
            )}
        </div>
    );
}
