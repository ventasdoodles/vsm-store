export interface ProactiveInsights {
    customer_tier?: string | null;
    items_due_for_replenishment?: any[];
    owned_hardware_models?: string[];
}

export interface CustomerMemoryRecord {
    detected_interests?: string[];
    interests_metadata?: Record<string, { hits: number; last_at: string }>;
    preference_signals?: Record<string, any>;
    preference_summary?: string | null;
    last_interaction_at?: string;
    prioritized_interests?: string[];
    proactive_insights?: ProactiveInsights | null;
}

export interface MemoryTrace {
    read_attempted: boolean;
    row_found: boolean;
    context_injected: boolean;
    interests_count: number;
    preference_signal_count: number;
    preference_summary_injected: boolean;
    proactive_insights_injected: boolean;
    soft_continuity_source: string;
    soft_continuity_topic: string | null;
    soft_continuity_shift: boolean;
    soft_reopen_candidate: boolean;
    skipped_reason: string | null;
}

export class CustomerMemoryRepo {
    constructor(private supabase: any) {}

    async getPrioritizedMemory(customerId: string | undefined): Promise<{ memory: CustomerMemoryRecord | null, trace: MemoryTrace }> {
        const trace: MemoryTrace = {
            read_attempted: false,
            row_found: false,
            context_injected: false,
            interests_count: 0,
            preference_signal_count: 0,
            preference_summary_injected: false,
            soft_continuity_source: 'none',
            soft_continuity_topic: null,
            soft_continuity_shift: false,
            soft_reopen_candidate: false,
            skipped_reason: null
        };

        if (!customerId) {
            trace.skipped_reason = "no_id";
            return { memory: null, trace };
        }

        trace.read_attempted = true;
        
        const [memResult, insightsResult] = await Promise.all([
            this.supabase
                .from('ai_customer_memory')
                .select('detected_interests, interests_metadata, preference_signals, preference_summary, last_interaction_at')
                .eq('customer_id', customerId)
                .maybeSingle(),
            this.supabase
                .from('vw_ai_proactive_insights')
                .select('customer_tier, items_due_for_replenishment, owned_hardware_models')
                .eq('customer_id', customerId)
                .maybeSingle()
        ]);

        const { data: mem, error: memErr } = memResult;
        const { data: insights, error: insightsErr } = insightsResult;

        if (memErr) {
            console.error(`[MemoryRepo] Query error: ${memErr.message}`);
            trace.skipped_reason = `query_error: ${memErr.message}`;
            return { memory: null, trace };
        }

        if (insightsErr) {
            console.error(`[MemoryRepo] Insights Query error: ${insightsErr.message}`);
        }

        const hasInterests = (mem?.detected_interests?.length ?? 0) > 0;
        const hasSummary = Boolean(mem?.preference_summary && mem.preference_summary.trim().length > 0);
        const hasInsights = Boolean(insights && (
            (insights.items_due_for_replenishment?.length ?? 0) > 0 || 
            (insights.owned_hardware_models?.length ?? 0) > 0 ||
            insights.customer_tier
        ));

        if ((mem && (hasInterests || hasSummary)) || hasInsights) {
            const meta = mem.interests_metadata || {};
            const detectedInterests = mem.detected_interests || [];
            
            const sortedInterests = [...detectedInterests].sort((a, b) => {
                const metaA = meta[a.toLowerCase()] || { hits: 0, last_at: '0' };
                const metaB = meta[b.toLowerCase()] || { hits: 0, last_at: '0' };
                
                if (metaB.hits !== metaA.hits) return metaB.hits - metaA.hits;
                return new Date(metaB.last_at).getTime() - new Date(metaA.last_at).getTime();
            });

            const memory: CustomerMemoryRecord = {
                ...mem,
                prioritized_interests: sortedInterests,
                proactive_insights: insights
            };

            trace.row_found = true;
            trace.context_injected = true;
            trace.interests_count = detectedInterests.length;
            trace.preference_signal_count = Object.keys(mem?.preference_signals || {}).length;
            trace.preference_summary_injected = hasSummary;
            trace.proactive_insights_injected = hasInsights;
            
            return { memory, trace };
        }

        trace.skipped_reason = (mem || insights) ? "empty_memory" : "no_row";
        return { memory: null, trace };
    }
}
