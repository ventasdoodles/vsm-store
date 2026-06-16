import { supabase } from '@/lib/supabase';

export type KnowledgeCategory = 'shipping' | 'payments' | 'vape_basics' | '420_basics' | 'policies' | 'faq' | 'onboarding';

export interface StoreKnowledgeNode {
    id: string;
    title: string;
    content: string;
    category: KnowledgeCategory;
    source_type: string;
    source_id: string | null;
    metadata: Record<string, unknown>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    has_embedding: boolean;
}

function mapKnowledgeRow(row: Record<string, unknown>): StoreKnowledgeNode {
    const has_embedding = row.embedding !== null;
    const { embedding: _embedding, ...rest } = row;

    return {
        ...rest,
        has_embedding,
    } as unknown as StoreKnowledgeNode;
}

async function fetchKnowledgeChunkById(id: string): Promise<StoreKnowledgeNode> {
    const { data, error } = await supabase
        .from('store_knowledge')
        .select('id, title, content, category, source_type, source_id, metadata, is_active, created_at, updated_at, embedding')
        .eq('id', id)
        .single();

    if (error) throw error;
    return mapKnowledgeRow(data);
}

export const adminKnowledgeService = {
    async fetchKnowledgeChunks(search?: string, category?: string): Promise<StoreKnowledgeNode[]> {
        let query = supabase
            .from('store_knowledge')
            .select('id, title, content, category, source_type, source_id, metadata, is_active, created_at, updated_at, embedding')
            .order('updated_at', { ascending: false })
            .limit(100); // Admin sanity limit

        if (search) {
            // Search in both title and content
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }
        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((row: Record<string, unknown>) => mapKnowledgeRow(row));
    },

    // Dual-layer validation happens inside the edge function (authoritative) 
    // and here we just transmit the explicit payload.
    async updateKnowledgeChunk(
        id: string, 
        payload: { title: string; content: string; category: KnowledgeCategory; source_type: string; metadata?: Record<string, unknown> }
    ): Promise<StoreKnowledgeNode> {
        const { data, error } = await supabase.functions.invoke('knowledge-ingestor', {
            body: {
                action: 'update_chunk',
                id,
                ...payload
            }
        });

        if (error) {
            console.error('Error invoking knowledge-ingestor update_chunk:', error);
            throw new Error(error.message || 'Error updating chunk embedding');
        }

        if (data.error) {
           throw new Error(data.error);
        }

        return fetchKnowledgeChunkById(id);
    },

    async toggleChunkStatus(id: string, is_active: boolean): Promise<StoreKnowledgeNode> {
        const { error } = await supabase
            .from('store_knowledge')
            .update({ is_active })
            .eq('id', id);

        if (error) throw error;
        return fetchKnowledgeChunkById(id);
    }
};
