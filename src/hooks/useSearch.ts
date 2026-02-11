// Hook de búsqueda con debounce - VSM Store
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/services/search.service';
import type { Section } from '@/types/product';

/**
 * Hook que debouncea el input y busca productos
 * Solo ejecuta la query si el texto tiene >= 3 caracteres
 */
export function useSearch(query: string, section?: Section) {
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    // Debounce de 300ms
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    const trimmed = debouncedQuery.trim();
    const enabled = trimmed.length >= 3;

    return useQuery({
        queryKey: ['search', trimmed, section],
        queryFn: () => searchProducts(trimmed, { section }),
        enabled,
        staleTime: 1000 * 60, // 1 minuto
    });
}
