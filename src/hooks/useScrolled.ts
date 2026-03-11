/**
 * useScrolled - VSM Store
 * 
 * Custom hook para la lógica y gestión de Scrolled.
 * @module hooks/useScrolled
 */

import { useState, useEffect } from 'react';

/**
 * Detecta si el usuario ha hecho scroll más allá del umbral.
 * Útil para cambiar estilos del header (glassmorphism, sombra, etc.)
 */
export function useScrolled(threshold = 10) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}
