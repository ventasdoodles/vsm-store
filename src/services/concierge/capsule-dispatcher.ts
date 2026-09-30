import type { CustomerProfile } from '@/types/customer';
import { isCustomerIntelligenceNoWriteSmokeActive } from '@/lib/customer-intelligence-no-write-smoke';
import { capsuleHandlers } from './handlers';
import type {
    ConciergeCatalogGate,
    ConciergeMessage,
    ConciergeSourceContext,
    ConciergeTurnAnalysis,
} from './types';
import type { Product } from '@/types/product';
import type { InternalResolvedProduct } from '@/types/ai-capsule';

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

export async function dispatchClientCapsule(params: DispatchClientCapsuleParams): Promise<ClientCapsuleDispatchResult | null> {
    const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data.no_write_smoke);
    const handler = capsuleHandlers[params.data.capsule_name];

    if (handler) {
        return handler(params, noWriteSmokeActive);
    }

    return null;
}
