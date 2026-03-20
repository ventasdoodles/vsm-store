import { 
    InternalKnowledgeChunkType, 
    InternalKnowledgeContractType
} from '../types/ai-capsule';

export const KNOWLEDGE_RAG_CAPSULE_VERSION = '1.0.0';

/**
 * Pure Mapper Shell for Knowledge & RAG Foundation Capsule.
 * Does NOT generate embeddings, execute RPC or call DB.
 * Focus is purely on mapping raw text hits to an architectural contract.
 */

export function buildDegradedKnowledgeContract(
    reason: 'VECTOR_TIMEOUT' | 'DB_LATENCY' | 'QUOTA_LIMIT' | 'SCHEMA_ERROR',
    latency_ms: number,
    safeFallbackMessage: string = "Actualmente no puedo consultar el manual de políticas de forma automática. ¿Deseas contactar a un asesor humano por WhatsApp?"
): InternalKnowledgeContractType {
    return {
        capsule_name: 'knowledge_rag_foundation',
        capsule_version: KNOWLEDGE_RAG_CAPSULE_VERSION,
        execution_status: 'DEGRADED',
        match_strategy: 'DEGRADED',
        ui_render_hint: safeFallbackMessage,
        search_confidence: 0,
        latency_ms,
        degraded_reason: reason,
        resolved_chunks: []
    };
}

export function buildEmptyKnowledgeContract(
    latency_ms: number,
    hint: string = "No encontré información específica en la base de datos oficial sobre este tema."
): InternalKnowledgeContractType {
    return {
        capsule_name: 'knowledge_rag_foundation',
        capsule_version: KNOWLEDGE_RAG_CAPSULE_VERSION,
        execution_status: 'SUCCESS',
        match_strategy: 'NO_MATCH',
        ui_render_hint: hint,
        search_confidence: 0,
        latency_ms,
        resolved_chunks: []
    };
}

export function evaluateKnowledgeRAGTree(
    rawChunks: any[],
    is_ambiguous: boolean,
    latency_ms: number
): InternalKnowledgeContractType {
    if (!rawChunks || rawChunks.length === 0) {
        return buildEmptyKnowledgeContract(latency_ms);
    }

    // Sort by similarity descending (if present)
    const sortedChunks = [...rawChunks].sort((a, b) => (b.similarity || 0) - (a.similarity || 0));
    const topChunk = sortedChunks[0];
    const topScore = topChunk.similarity || 0;

    const mappedChunks: InternalKnowledgeChunkType[] = sortedChunks.map(c => ({
        id: c.id,
        category: c.category,
        title: c.title,
        content: c.content,
        similarity_score: c.similarity
    }));

    // Threshold evaluation to determine strategy
    let strategy: InternalKnowledgeContractType['match_strategy'] = 'NO_MATCH';
    let hint: string = '';

    if (topScore >= 0.82 && !is_ambiguous) {
        strategy = 'HIGH_CONFIDENCE_POLICY_MATCH';
        hint = "He encontrado esta coincidencia exacta en nuestras políticas oficiales:";
    } else if (topScore >= 0.65 || (is_ambiguous && mappedChunks.length > 1)) {
        strategy = 'MODERATE_CONFIDENCE_MULTI_SOURCE';
        hint = "He recopilado esta información relacionada de nuestros tutoriales y manuales operativos:";
    } else if (topScore >= 0.50) {
        strategy = 'LOW_CONFIDENCE_FALLBACK';
        hint = "No obtuve una respuesta contundente en la base de datos oficial, pero este fragmento podría darte una pista:";
    } else {
        return buildEmptyKnowledgeContract(latency_ms);
    }

    return {
        capsule_name: 'knowledge_rag_foundation',
        capsule_version: KNOWLEDGE_RAG_CAPSULE_VERSION,
        execution_status: 'SUCCESS',
        match_strategy: strategy,
        ui_render_hint: hint,
        search_confidence: topScore,
        latency_ms,
        resolved_chunks: mappedChunks
    };
}
