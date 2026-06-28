



import { type CesarinPreferenceSummary } from '@/lib/cesarin-stage3';



import { type CesarinCommercialMove } from '@/lib/cesarin-commercial-judgment';







import type { Product } from '@/types/product';


import type { InternalResolvedProduct } from '@/types/ai-capsule';

export interface ConciergeMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    suggestedProducts?: (Product | InternalResolvedProduct)[];
    intent?: 'search' | 'info' | 'support' | 'recommendation' | 'whatsapp';
    turn_analysis?: ConciergeTurnAnalysis;
    catalog_gate?: ConciergeCatalogGate;
    source_context?: ConciergeSourceContext;
    action?: {
        label: string;
        url: string;
        type: 'whatsapp' | 'link';
    };
    capsule_contract?: Record<string, any>;
}

export interface ConciergeProductSearchMemoryContext {
    preference_summary?: CesarinPreferenceSummary | null;
}

export type ConciergeTurnPriority = 'primary' | 'secondary' | 'mixed' | 'unknown';

export type ConciergeCatalogGateReason =
    | 'search_leading'
    | 'explicit_product_request'
    | 'clarification_first'
    | 'non_catalog_lane'
    | 'out_of_domain';

export interface ConciergeTurnAnalysis {
    primary_intent: string | null;
    secondary_intents: string[];
    turn_priority: ConciergeTurnPriority;
    current_turn_decision: string | null;
    turn_focus?: string | null;
    commercial_move?: CesarinCommercialMove | null;
}

export interface ConciergeCatalogGate {
    is_open: boolean;
    reason: ConciergeCatalogGateReason;
    primary_intent: string | null;
    explicit_product_request: boolean;
    search_leading: boolean;
    needs_clarification: boolean;
}

export interface ConciergeSourceContext {
    label: string;
    brief?: string;
    sources: Array<{ title: string; url: string }>;
}
