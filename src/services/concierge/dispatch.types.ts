import type { CustomerProfile } from '@/types/customer';
import type { Product } from '@/types/product';
import type { InternalResolvedProduct } from '@/types/ai-capsule';
import type {
    ConciergeCatalogGate,
    ConciergeMessage,
    ConciergeSourceContext,
    ConciergeTurnAnalysis,
} from './types';

export interface DispatchClientCapsuleParams {
    data: Record<string, any>;
    query: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    customerProfile?: CustomerProfile;
    catalogGate: ConciergeCatalogGate;
    turnAnalysis: ConciergeTurnAnalysis;
    sourceContext?: ConciergeSourceContext;
    invokeStart: number;
    effectiveTelemetrySessionId: string | null;
}

export interface ClientCapsuleDispatchResult {
    message: string;
    suggestedProducts?: (Product | InternalResolvedProduct)[];
    intent?: ConciergeMessage['intent'];
    turn_analysis?: ConciergeTurnAnalysis;
    catalog_gate?: ConciergeCatalogGate;
    source_context?: ConciergeSourceContext;
    action?: ConciergeMessage['action'];
    capsule_contract?: Record<string, any>;
}

export type CapsuleHandlerFn = (
    params: DispatchClientCapsuleParams,
    noWriteSmokeActive: boolean
) => Promise<ClientCapsuleDispatchResult | null>;

export const CAPSULE_NAMES = [
    'product_search_integrity',
    'storefront_kitting_basket',
    'storefront_budget_rescue',
    'storefront_compatibility_check',
    'knowledge_rag_foundation',
    'storefront_inventory_outlook',
    'authenticated_order_tracking',
    'authenticated_warranty_triage',
    'authenticated_loyalty_status',
    'storefront_checkout_readiness',
    'cart_operator',
] as const;

export type CapsuleName = typeof CAPSULE_NAMES[number];
