import { useState, useEffect, RefObject } from 'react';

interface SwipeInput {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
}

/**
 * Hook para detectar gestos de swipe en un elemento.
 * @param ref Referencia al elemento DOM que escuchará los eventos táctiles.
 * @param options Callbacks para cada dirección y umbral de distancia (por defecto 50px).
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, options: SwipeInput) {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

    const minSwipeDistance = options.threshold || 50;

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const onTouchStart = (e: TouchEvent) => {
            setTouchEnd(null);
            const touch = e.targetTouches[0];
            if (touch) {
                setTouchStart({
                    x: touch.clientX,
                    y: touch.clientY,
                });
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            const touch = e.targetTouches[0];
            if (touch) {
                setTouchEnd({
                    x: touch.clientX,
                    y: touch.clientY,
                });
            }
        };

        const onTouchEnd = () => {
            if (!touchStart || !touchEnd) return;

            const distanceX = touchStart.x - touchEnd.x;
            const distanceY = touchStart.y - touchEnd.y;
            const isLeftSwipe = distanceX > minSwipeDistance;
            const isRightSwipe = distanceX < -minSwipeDistance;
            const isUpSwipe = distanceY > minSwipeDistance;
            const isDownSwipe = distanceY < -minSwipeDistance;

            // Determinar si el swipe fue mayormente horizontal o vertical
            if (Math.abs(distanceX) > Math.abs(distanceY)) {
                if (isLeftSwipe && options.onSwipeLeft) {
                    options.onSwipeLeft();
                }
                if (isRightSwipe && options.onSwipeRight) {
                    options.onSwipeRight();
                }
            } else {
                if (isUpSwipe && options.onSwipeUp) {
                    options.onSwipeUp();
                }
                if (isDownSwipe && options.onSwipeDown) {
                    options.onSwipeDown();
                }
            }
        };

        element.addEventListener('touchstart', onTouchStart, { passive: true });
        element.addEventListener('touchmove', onTouchMove, { passive: true });
        element.addEventListener('touchend', onTouchEnd);

        return () => {
            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchmove', onTouchMove);
            element.removeEventListener('touchend', onTouchEnd);
        };
    }, [ref, touchStart, touchEnd, options, minSwipeDistance]);
}
