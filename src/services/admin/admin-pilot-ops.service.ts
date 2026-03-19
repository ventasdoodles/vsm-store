/**
 * // ─── ADMIN PILOT OPS SERVICE ─── [Wave 187 — Pilot Operations Intelligence]
 * // Propósito: Operational telemetry queries against ai_analytics for the Piloto Operativo cockpit.
 * // Arquitectura: Service Layer (§1.1) — read-only JSONB extraction, null-safe.
 * // Canon: No runtime changes. No new tables. Brain-first guardrail (v106).
 */
import { supabase } from '@/lib/supabase';

// ─── Types ─────────────────────────────────────────

export interface PilotKPIs {
    totalInteractions: number;
    semanticMatchRate: number;      // 0–1
    fallbackRate: number;           // 0–1
    avgProductCards: number;
    totalCartActions: number;
    avgLatencyMs: number;
    frustrationRate: number;        // 0–1
    guardrailRescueCount: number;
    policyQueryCount: number;
    zeroProductCardCount: number;
}

export interface PilotQueryRow {
    id: string;
    query: string | null;
    created_at: string;
    frustration_detected: boolean;
    detected_intent: string | null;
    capsule: string | null;
    semantic_match_success: boolean;
    fallback_used: boolean;
    product_card_count: number;
    policy_match_count: number;
    product_match_count: number;
    latency_ms: number;
    cart_action_detected: boolean;
    raw_analyst_intent: string | null;
}

export type PilotBucket =
    | 'all'
    | 'zero_product_cards'
    | 'fallback_used'
    | 'successful_semantic_match'
    | 'policy_query'
    | 'cart_intent_signal'
    | 'guardrail_rescue'
    | 'frustration';

// ─── Null-safe JSONB helpers ───────────────────────

function safeBool(val: unknown): boolean {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    return false;
}

function safeNum(val: unknown, fallback = 0): number {
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    const parsed = Number(val);
    if (Number.isNaN(parsed)) return fallback;
    return parsed;
}

function safeStr(val: unknown): string | null {
    if (typeof val === 'string' && val.length > 0) return val;
    return null;
}

// ─── Row mapper ────────────────────────────────────

interface RawAnalyticsRow {
    id: string;
    query: string | null;
    created_at: string;
    frustration_detected: boolean | null;
    ai_logic_debug: Record<string, unknown> | null;
}

function mapRow(row: RawAnalyticsRow): PilotQueryRow {
    const d = row.ai_logic_debug ?? {};
    const rawAnalyst = (d.raw_analyst_report as Record<string, unknown> | null) ?? {};

    return {
        id: row.id,
        query: row.query,
        created_at: row.created_at,
        frustration_detected: safeBool(row.frustration_detected),
        detected_intent: safeStr(d.detected_intent),
        capsule: safeStr(d.sommelier_routed_capsule),
        semantic_match_success: safeBool(d.semantic_match_success),
        fallback_used: safeBool(d.fallback_used),
        product_card_count: safeNum(d.product_card_count),
        policy_match_count: safeNum(d.policy_match_count),
        product_match_count: safeNum(d.product_match_count),
        latency_ms: safeNum(d.latency_ms),
        cart_action_detected: safeBool(d.cart_action_detected),
        raw_analyst_intent: safeStr(rawAnalyst.intent),
    };
}

// ─── Bucket filters (canonical conditions) ─────────

function matchesBucket(row: PilotQueryRow, bucket: PilotBucket): boolean {
    switch (bucket) {
        case 'all':
            return true;
        case 'zero_product_cards':
            return row.capsule === 'product_search_integrity' && row.product_card_count === 0;
        case 'fallback_used':
            return row.fallback_used;
        case 'successful_semantic_match':
            return row.semantic_match_success;
        case 'policy_query':
            return row.capsule === 'knowledge_rag_foundation';
        case 'cart_intent_signal':
            return row.cart_action_detected;
        case 'guardrail_rescue':
            return row.raw_analyst_intent === 'UNKNOWN'
                && row.capsule !== null
                && row.capsule !== '';
        case 'frustration':
            return row.frustration_detected;
        default:
            return true;
    }
}

// ─── Service functions ─────────────────────────────

/**
 * Fetches aggregate KPIs from ai_analytics within a time range.
 * All JSONB field extraction is null-safe.
 */
export async function getPilotKPIs(from: string, to: string): Promise<PilotKPIs> {
    const { data, error } = await supabase
        .from('ai_analytics')
        .select('id, frustration_detected, ai_logic_debug')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = (data ?? []).map((r) => mapRow(r as RawAnalyticsRow));
    const total = rows.length;

    if (total === 0) {
        return {
            totalInteractions: 0,
            semanticMatchRate: 0,
            fallbackRate: 0,
            avgProductCards: 0,
            totalCartActions: 0,
            avgLatencyMs: 0,
            frustrationRate: 0,
            guardrailRescueCount: 0,
            policyQueryCount: 0,
            zeroProductCardCount: 0,
        };
    }

    let semanticMatches = 0;
    let fallbacks = 0;
    let totalProductCards = 0;
    let cartActions = 0;
    let totalLatency = 0;
    let frustrations = 0;
    let guardrailRescues = 0;
    let policyQueries = 0;
    let zeroCards = 0;

    for (const row of rows) {
        if (row.semantic_match_success) semanticMatches++;
        if (row.fallback_used) fallbacks++;
        totalProductCards += row.product_card_count;
        if (row.cart_action_detected) cartActions++;
        totalLatency += row.latency_ms;
        if (row.frustration_detected) frustrations++;
        if (matchesBucket(row, 'guardrail_rescue')) guardrailRescues++;
        if (matchesBucket(row, 'policy_query')) policyQueries++;
        if (matchesBucket(row, 'zero_product_cards')) zeroCards++;
    }

    return {
        totalInteractions: total,
        semanticMatchRate: semanticMatches / total,
        fallbackRate: fallbacks / total,
        avgProductCards: totalProductCards / total,
        totalCartActions: cartActions,
        avgLatencyMs: Math.round(totalLatency / total),
        frustrationRate: frustrations / total,
        guardrailRescueCount: guardrailRescues,
        policyQueryCount: policyQueries,
        zeroProductCardCount: zeroCards,
    };
}

/**
 * Fetches recent query log with per-row KPIs, bounded and ordered.
 * @param from - ISO date start
 * @param to - ISO date end
 * @param limit - max rows (default 100, hard capped)
 */
export async function getPilotQueryLog(
    from: string,
    to: string,
    limit = 100
): Promise<PilotQueryRow[]> {
    const cappedLimit = Math.min(limit, 200); // hard safety cap

    const { data, error } = await supabase
        .from('ai_analytics')
        .select('id, query, created_at, frustration_detected, ai_logic_debug')
        .gte('created_at', from)
        .lte('created_at', to)
        .order('created_at', { ascending: false })
        .limit(cappedLimit);

    if (error) throw error;

    return (data ?? []).map((r) => mapRow(r as RawAnalyticsRow));
}

/**
 * Filters a query log by operational bucket.
 * Client-side filtering — keeps DB queries simple and cacheable.
 */
export function filterByBucket(rows: PilotQueryRow[], bucket: PilotBucket): PilotQueryRow[] {
    if (bucket === 'all') return rows;
    return rows.filter((row) => matchesBucket(row, bucket));
}
