import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { conciergeService } from '@/services';
import type { Product } from '@/types/product';
import { trackAIInteraction } from '@/lib/analytics';

export interface UseNeuralSearchResult {
    query: string;
    setQuery: (q: string) => void;
    results: Product[];
    isLoading: boolean;
    error: unknown;
    search: () => void;
}

/**
 * Hook for Wave 120: Neural Commerce Search.
 * Encapsulates the logic for semantic product discovery using vector embeddings.
 */
export function useNeuralSearch(initialQuery: string = ''): UseNeuralSearchResult {
    const [query, setQuery] = useState(initialQuery);

    const { data: results = [], isLoading, error, refetch } = useQuery({
        queryKey: ['neural-search', query],
        queryFn: async () => {
            if (!query.trim()) return [];
            
            trackAIInteraction('neural_search_query', { query });
            return conciergeService.neuralSearch(query);
        },
        enabled: false, // Only manual search or triggered from effective intents
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });

    const search = () => {
        if (query.trim()) {
            refetch();
        }
    };

    return {
        query,
        setQuery,
        results,
        isLoading,
        error,
        search
    };
}
