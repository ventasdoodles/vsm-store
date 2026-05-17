import { 
    InternalKnowledgeChunkType, 
    InternalKnowledgeContractType
} from '../types/ai-capsule';

export const KNOWLEDGE_RAG_CAPSULE_VERSION = '1.0.0';

type RawKnowledgeChunk = {
    id?: unknown;
    source_id?: unknown;
    category?: unknown;
    title?: unknown;
    content?: unknown;
    similarity?: unknown;
};

/**
 * Pure Mapper Shell for Knowledge & RAG Foundation Capsule.
 * Does NOT generate embeddings, execute RPC or call DB.
 * Focus is purely on mapping raw text hits to an architectural contract.
 */

function normalizeKnowledgeText(value: unknown): string {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function trimKnowledgePreview(value: unknown, maxLength = 220): string {
    const normalized = normalizeKnowledgeText(value);

    if (normalized.length <= maxLength) {
        return normalized;
    }

    const candidate = normalized.slice(0, maxLength + 1);
    const lastSpace = candidate.lastIndexOf(' ');
    const cutAt = lastSpace > 80 ? lastSpace : maxLength;

    return `${normalized.slice(0, cutAt).trim()}...`;
}

function getGenericKnowledgeHint(strategy: InternalKnowledgeContractType['match_strategy']): string {
    if (strategy === 'HIGH_CONFIDENCE_POLICY_MATCH') {
        return "He encontrado esta coincidencia exacta en nuestras politicas oficiales:";
    }

    if (strategy === 'LOW_CONFIDENCE_FALLBACK') {
        return "No obtuve una respuesta contundente en la base de datos oficial, pero este fragmento podria darte una pista:";
    }

    return "He recopilado esta informacion relacionada de nuestros tutoriales y manuales operativos:";
}

function normalizePolicySignal(value: unknown): string {
    return normalizeKnowledgeText(value)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function isUnsupportedShippingPromiseQuery(query?: string): boolean {
    const normalizedQuery = normalizePolicySignal(query);

    return /(garantiz|garantia|seguro|asegura|promete|promesa|llega)/.test(normalizedQuery)
        && /(manana|24 horas|dia siguiente|next day|domicilio|casa|entrega)/.test(normalizedQuery);
}

function hasShippingPolicyEvidence(chunks: InternalKnowledgeChunkType[]): boolean {
    const policyText = normalizePolicySignal(chunks
        .map(chunk => [chunk.category, chunk.title, chunk.content].filter(Boolean).join(' '))
        .join(' '));

    const hasShippingContext = /(shipping|envio|envios|dhl|paqueteria)/.test(policyText);
    const hasOcurreContext = /(ocurre|sucursal|no a domicilio)/.test(policyText);

    return hasShippingContext && hasOcurreContext;
}

function buildUnsupportedShippingPromiseHint(chunks: InternalKnowledgeChunkType[]): string | null {
    if (!hasShippingPolicyEvidence(chunks)) {
        return null;
    }

    return 'No puedo confirmar una entrega manana garantizada ni entrega a domicilio. Lo que si marca la politica es envio por DHL ocurre a sucursal; tiempos y costos se confirman antes de cerrar el pedido.';
}

function buildKnowledgeAnswerHint(
    strategy: InternalKnowledgeContractType['match_strategy'],
    chunks: InternalKnowledgeChunkType[],
    query?: string
): string {
    if (isUnsupportedShippingPromiseQuery(query)) {
        const boundedShippingHint = buildUnsupportedShippingPromiseHint(chunks);
        if (boundedShippingHint) {
            return boundedShippingHint;
        }
    }

    const topChunk = chunks[0];
    const title = normalizeKnowledgeText(topChunk?.title);
    const content = trimKnowledgePreview(topChunk?.content);

    if (!title || !content) {
        return getGenericKnowledgeHint(strategy);
    }

    const intro = strategy === 'HIGH_CONFIDENCE_POLICY_MATCH'
        ? 'Segun nuestras politicas oficiales'
        : strategy === 'LOW_CONFIDENCE_FALLBACK'
            ? 'Lo mas cercano que encontre en la base de conocimiento'
            : 'Lo mas relevante que encontre en nuestros manuales';

    return `${intro}: ${title}. ${content}`;
}

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
    rawChunks: RawKnowledgeChunk[],
    is_ambiguous: boolean,
    latency_ms: number,
    query?: string
): InternalKnowledgeContractType {
    if (!rawChunks || rawChunks.length === 0) {
        return buildEmptyKnowledgeContract(latency_ms);
    }

    // Sort by similarity descending (if present)
    const sortedChunks = [...rawChunks].sort((a, b) => Number(b.similarity ?? 0) - Number(a.similarity ?? 0));
    const topChunk = sortedChunks[0];
    if (!topChunk) {
        return buildEmptyKnowledgeContract(latency_ms);
    }
    const topScore = Number(topChunk.similarity ?? 0) || 0;

    const mappedChunks: InternalKnowledgeChunkType[] = sortedChunks.map(c => ({
        id: normalizeKnowledgeText(c.id),
        source_id: normalizeKnowledgeText(c.source_id) || undefined,
        category: normalizeKnowledgeText(c.category),
        title: normalizeKnowledgeText(c.title),
        content: normalizeKnowledgeText(c.content),
        similarity_score: Number(c.similarity ?? 0) || undefined
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

    hint = buildKnowledgeAnswerHint(strategy, mappedChunks, query);

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
