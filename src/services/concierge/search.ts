import { supabase } from '@/lib/supabase';














import type { Product } from '@/types/product';


import { searchCache } from "./cache";

export async function semanticSearch(query: string): Promise<Product[]> {
        const cacheKey = `semantic:${query.toLowerCase().trim()}`;
        if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'semantic_search', 
                    query 
                }
            });

            if (error) throw error;
            const products = data.products || [];
            searchCache.set(cacheKey, products);
            return products;
        } catch (error) {
            console.error('Semantic Search Error:', error);
            return [];
        }
    }

export async function neuralSearch(query: string, matchThreshold: number = 0.5, matchCount: number = 8): Promise<Product[]> {
        const cacheKey = `neural:${query.toLowerCase().trim()}`;
        if (searchCache.has(cacheKey)) return searchCache.get(cacheKey);

        try {
            const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('embeddings-processor', {
                body: { text: query }
            });

            if (embeddingError) throw embeddingError;
            if (!embeddingData.embedding) throw new Error('No embedding returned from processor');

            const { data: matchedProducts, error: matchError } = await supabase.rpc('match_products', {
                query_embedding: embeddingData.embedding,
                match_threshold: matchThreshold,
                match_count: matchCount
            });

            if (matchError) throw matchError;
            const products = matchedProducts || [];
            searchCache.set(cacheKey, products);
            return products;
        } catch (error) {
            console.error('Neural Search Error:', error);
            return semanticSearch(query);
        }
    }
