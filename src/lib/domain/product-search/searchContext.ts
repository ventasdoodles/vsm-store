
import type { InternalResolvedProduct, InternalCapsuleContract } from '@/types/ai-capsule';
import { ProductSearchToolArgs } from "@/types/ai-capsule";

/**
 * DATALAYER CONTEXT INJECTION
 * The runtime will hydrate this context before evaluating the fallback tree.
 */
export interface ProductSearchContext {
    tool_args: ProductSearchToolArgs;
    exact_matches: InternalResolvedProduct[];
    semantic_matches: InternalResolvedProduct[];
    semantic_match_source?: 'EMBEDDING_SEMANTIC' | 'TOKEN_RECOVERY' | 'NONE';
    infrastructure_error?: 'VECTOR_TIMEOUT' | 'ORACLE_TIMEOUT' | 'DB_LATENCY' | 'QUOTA_LIMIT';
    promotion_signal?: InternalCapsuleContract['promotion_signal'];
    replenishment_signal?: InternalCapsuleContract['replenishment_signal'];
}
