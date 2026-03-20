/**
 * LEARNING INTERVENTION WORKFLOW SERVICE
 * Minimal MVP for operator-reviewable intervention recommendations
 *
 * MVP Read-Only Operations (admin user level):
 * - Fetch pending recommendations for operator review
 * - Track operator decisions (approve/reject) via UPDATE
 * - Acknowledge signals
 *
 * Backend-Only Operations (SERVICE_ROLE, not MVP):
 * - Record intervention signals from live operation
 * - Generate and create recommendations
 * - These functions exist for future backend signal producers, not client-side use
 *
 * Out of scope (manual/out-of-band):
 * - Automatic intervention execution
 * - Giant scoring engines
 * - Autonomous feedback loops
 */

import { supabase } from '@/lib/supabase';
import type {
  InterventionSignal,
  InterventionRecommendation,
  InterventionDiagnosis,
  Confidence,
  InterventionSignalType,
  InterventionType,
  OperatorDecision
} from '@/types/cesarin';

// ========================================
// 1. SIGNAL RECORDING (Backend-Only, SERVICE_ROLE)
// Not used in MVP; signals are manually seeded for testing
// ========================================

export interface RecordSignalInput {
  signal_type: InterventionSignalType;
  product_id?: string;
  category?: string;
  evidence_count?: number;
  confidence?: Confidence;
  signal_detail: Record<string, unknown>;
}

/**
 * Record a single intervention signal from live operation
 * Checks if duplicate signal exists in last 24h; if so, increments evidence_count
 *
 * NOTE: Requires SERVICE_ROLE access (backend-only, not MVP)
 * MVP uses manually seeded signals. Future: connect to backend signal producers.
 */
export async function recordInterventionSignal(input: RecordSignalInput): Promise<InterventionSignal | null> {
  try {
    // Check for recent duplicate signal
    const { data: existing, error: checkError } = await supabase
      .from('intervention_signals')
      .select('id, evidence_count, last_occurrence_at')
      .eq('signal_type', input.signal_type)
      .eq('product_id', input.product_id || null)
      .eq('category', input.category || null)
      .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking duplicate signal:', checkError);
      return null;
    }

    // If duplicate found within 24h, increment evidence count
    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('intervention_signals')
        .update({
          evidence_count: existing.evidence_count + 1,
          last_occurrence_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError || !updated) {
        console.error('Error updating signal evidence:', updateError);
        return null;
      }
      return updated as InterventionSignal;
    }

    // Otherwise, create new signal
    const { data: newSignal, error: insertError } = await supabase
      .from('intervention_signals')
      .insert({
        signal_type: input.signal_type,
        product_id: input.product_id || null,
        category: input.category || null,
        evidence_count: input.evidence_count || 1,
        confidence: input.confidence || 'medium',
        signal_detail: input.signal_detail,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError || !newSignal) {
      console.error('Error recording signal:', insertError);
      return null;
    }

    return newSignal as InterventionSignal;
  } catch (err) {
    console.error('Unexpected error recording signal:', err);
    return null;
  }
}

// ========================================
// 2. DIAGNOSIS & RECOMMENDATION GENERATION
// Simple, explicit, rule-based logic
// ========================================

/**
 * Generate diagnosis and recommendation based on signal
 * Returns structured diagnosis object (not an execution command)
 *
 * Pure function: no side effects, can be called by admin or backend
 */
export function diagnoseSignal(signal: InterventionSignal): InterventionDiagnosis | null {
  switch (signal.signal_type) {
    case 'enrichment_gap':
      return diagnoseEnrichmentGap(signal);
    case 'compatibility_miss':
      return diagnoseCompatibilityMiss(signal);
    case 'escalation_theme':
      return diagnoseEscalationTheme(signal);
    default:
      return null;
  }
}

function diagnoseEnrichmentGap(signal: InterventionSignal): InterventionDiagnosis {
  const detail = signal.signal_detail as { product_name?: string; missing_field?: string };
  return {
    root_cause: `Product "${detail.product_name}" lacks enriched ${detail.missing_field || 'metadata'} for response context`,
    reasoning: `Without curated specs or ai_sales_note, Cesarin drafts generic responses instead of contextual recommendations. Customer perceives missed personalization.`,
    effort_hours: 0.25,
    estimated_impact: 'medium',
    implementation_notes: 'Operator enriches product via ProductEditorDrawer (ai_sales_note + specs merge). Automatic on next customer query.'
  };
}

function diagnoseCompatibilityMiss(signal: InterventionSignal): InterventionDiagnosis {
  const detail = signal.signal_detail as { product_a?: string; product_b?: string };
  return {
    root_cause: `Compatibility gap: "${detail.product_a}" and "${detail.product_b}" not linked in concept_aliases or compatibility_relations`,
    reasoning: `Customer asks "Can I use these together?" but Cesarin's check_compatibility tool finds no explicit relation. System defaults to safe "I'm not sure" instead of trusted recommendation.`,
    effort_hours: 0.5,
    estimated_impact: 'medium',
    implementation_notes: 'Add concept_alias or compatibility_relation entry. SQL migration or admin form submission. Requires brief QA verification.'
  };
}

function diagnoseEscalationTheme(signal: InterventionSignal): InterventionDiagnosis {
  const detail = signal.signal_detail as { theme?: string; operator_response?: string };
  return {
    root_cause: `Repeated escalation pattern: operators manually provide same guidance on "${detail.theme}"`,
    reasoning: `${signal.evidence_count} instances of operator creating custom instruction for this scenario. System rule not yet in place to automate this decision.`,
    effort_hours: 1.0,
    estimated_impact: 'high',
    implementation_notes: `Create escalation playbook document with decision criteria and approved response template. Add to system prompt as new rule in "escalation" category.`
  };
}

/**
 * Get mapped intervention type based on signal type
 */
function getInterventionType(signal_type: InterventionSignalType): InterventionType {
  const mapping: Record<InterventionSignalType, InterventionType> = {
    enrichment_gap: 'enrichment',
    compatibility_miss: 'compatibility',
    escalation_theme: 'escalation_playbook'
  };
  return mapping[signal_type];
}

// ========================================
// 3. RECOMMENDATION MANAGEMENT
// ========================================

export interface CreateRecommendationInput {
  signal_id: string;
  diagnosis: InterventionDiagnosis;
}

/**
 * Create a recommendation from a signal + diagnosis
 * Recommendation starts in 'pending' state for operator review
 *
 * NOTE: Requires SERVICE_ROLE access (backend-only, not MVP)
 * MVP assumes signals are pre-created. Future: backend creates these as signals flow in.
 */
export async function createRecommendation(
  input: CreateRecommendationInput,
  signal: InterventionSignal
): Promise<InterventionRecommendation | null> {
  try {
    const { data, error } = await supabase
      .from('intervention_recommendations')
      .insert({
        signal_id: input.signal_id,
        intervention_type: getInterventionType(signal.signal_type),
        rank: 1,
        diagnosis: input.diagnosis,
        operator_decision: 'pending',
        execution_status: 'not_started'
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating recommendation:', error);
      return null;
    }

    return data as InterventionRecommendation;
  } catch (err) {
    console.error('Unexpected error creating recommendation:', err);
    return null;
  }
}

/**
 * Fetch pending recommendations for operator review
 * Includes signal context for full picture
 */
export async function getPendingRecommendations(): Promise<
  (InterventionRecommendation & { signal: InterventionSignal })[]
> {
  try {
    const { data, error } = await supabase
      .from('intervention_recommendations')
      .select(
        `
        *,
        signal:intervention_signals(*)
      `
      )
      .eq('operator_decision', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return (data || []) as (InterventionRecommendation & { signal: InterventionSignal })[];
  } catch (err) {
    console.error('Unexpected error fetching recommendations:', err);
    return [];
  }
}

/**
 * Fetch all recommendations with optional filters
 */
export async function getRecommendations(filters?: {
  signal_type?: InterventionSignalType;
  operator_decision?: OperatorDecision;
  limit?: number;
}): Promise<(InterventionRecommendation & { signal: InterventionSignal })[]> {
  try {
    let query = supabase
      .from('intervention_recommendations')
      .select('*, signal:intervention_signals(*)')
      .order('created_at', { ascending: false });

    if (filters?.signal_type) {
      // Filter by signal type requires matching on related signal
      const { data: signalIds, error: signalError } = await supabase
        .from('intervention_signals')
        .select('id')
        .eq('signal_type', filters.signal_type);

      if (signalError || !signalIds || signalIds.length === 0) {
        // No matching signals found; return empty array (not all recommendations)
        return [];
      }

      const ids = signalIds.map(s => s.id);
      query = query.in('signal_id', ids);
    }

    if (filters?.operator_decision) {
      query = query.eq('operator_decision', filters.operator_decision);
    }

    const limit = filters?.limit || 50;
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }

    return (data || []) as (InterventionRecommendation & { signal: InterventionSignal })[];
  } catch (err) {
    console.error('Unexpected error fetching recommendations:', err);
    return [];
  }
}

// ========================================
// 4. OPERATOR DECISION TRACKING
// ========================================

export interface OperatorDecisionInput {
  recommendation_id: string;
  operator_decision: OperatorDecision;
  operator_id: string;
  notes?: string;
}

/**
 * Record operator approval/rejection decision
 * Execution remains manual/out-of-band
 */
export async function recordOperatorDecision(input: OperatorDecisionInput): Promise<InterventionRecommendation | null> {
  try {
    const { data, error } = await supabase
      .from('intervention_recommendations')
      .update({
        operator_decision: input.operator_decision,
        operator_id: input.operator_id,
        operator_notes: input.notes || null,
        operator_decision_at: new Date().toISOString()
      })
      .eq('id', input.recommendation_id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error recording operator decision:', error);
      return null;
    }

    return data as InterventionRecommendation;
  } catch (err) {
    console.error('Unexpected error recording decision:', err);
    return null;
  }
}

/**
 * Update signal status after operator review
 * Acknowledges signal is being handled
 */
export async function acknowledgeSignal(signal_id: string): Promise<InterventionSignal | null> {
  try {
    const { data, error } = await supabase
      .from('intervention_signals')
      .update({ status: 'acknowledged' })
      .eq('id', signal_id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error acknowledging signal:', error);
      return null;
    }

    return data as InterventionSignal;
  } catch (err) {
    console.error('Unexpected error acknowledging signal:', err);
    return null;
  }
}
