/**
 * // ─── ADMIN EVALUATION SERVICE ─── [Wave 190 — Cesarin Human Evaluation Loop]
 * // Propósito: Supervised human scoring and failure tagging for AI interactions.
 * // Canon: 1:1 model. Exactly one evaluation per ai_analytics.id.
 */
import { supabase } from '@/lib/supabase';

export interface EvaluationData {
    analytics_id: string;
    score: number;
    primary_tag: string;
    secondary_tags?: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    expected_outcome?: string;
    comment?: string;
    evaluator_id?: string;
}

/**
 * Saves or updates a human evaluation for a specific interaction.
 * Enforces the 1:1 model via UPSERT on analytics_id.
 */
export async function saveEvaluation(data: EvaluationData) {
    const { data: result, error } = await supabase
        .from('ai_evaluations')
        .upsert({
            analytics_id: data.analytics_id,
            score: data.score,
            primary_tag: data.primary_tag,
            secondary_tags: data.secondary_tags || [],
            severity: data.severity,
            expected_outcome: data.expected_outcome,
            comment: data.comment,
            evaluator_id: data.evaluator_id,
            updated_at: new Date().toISOString()
        }, { onConflict: 'analytics_id' })
        .select()
        .single();

    if (error) throw error;
    return result;
}

/**
 * Fetches the human evaluation for a given interaction ID, if it exists.
 */
export async function getEvaluation(analyticsId: string) {
    const { data, error } = await supabase
        .from('ai_evaluations')
        .select('*')
        .eq('analytics_id', analyticsId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

/**
 * Fetches basic stats for evaluation buckets.
 */
export async function getEvaluationStats() {
    const { data, error } = await supabase
        .from('view_ai_evaluation_stats')
        .select('*');

    if (error) throw error;
    return data;
}
