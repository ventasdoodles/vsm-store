import { supabase } from '@/lib/supabase';

export type KnowledgeCategory = 'shipping' | 'payments' | 'vape_basics' | '420_basics' | 'policies' | 'faq' | 'onboarding';

export interface StoreKnowledgeNode {
    id: string;
    title: string;
    content: string;
    category: KnowledgeCategory;
    source_type: string;
    source_id: string | null;
    metadata: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    has_embedding: boolean;
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

        return data.map((row: any) => {
            const has_embedding = row.embedding !== null;
            delete row.embedding; 
            return {
                ...row,
                has_embedding
            };
        });
    },

    // Dual-layer validation happens inside the edge function (authoritative) 
    // and here we just transmit the explicit payload.
    async updateKnowledgeChunk(
        id: string, 
        payload: { title: string; content: string; category: KnowledgeCategory; source_type: string; metadata?: Record<string, any> }
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

        // Return updated stub
        return {
            id,
            ...payload,
            source_id: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_embedding: true,
            metadata: payload.metadata || {}
        };
    },

    async toggleChunkStatus(id: string, is_active: boolean): Promise<void> {
        const { error } = await supabase
            .from('store_knowledge')
            .update({ is_active })
            .eq('id', id);

        if (error) throw error;
    }
};
