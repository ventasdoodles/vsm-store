-- MVP Learning Intervention Workflow Storage
-- Minimal schema for operator-reviewable intervention recommendations
-- Surgical scope: signal storage + recommendation contract only

-- ========================================
-- 1. INTERVENTION SIGNALS TABLE
-- Captures frustration/error signals from live operation
-- ========================================
CREATE TABLE IF NOT EXISTS public.intervention_signals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Signal type: enrichment_gap | compatibility_miss | escalation_theme
    signal_type text NOT NULL,

    -- Context (optional): which product/category triggered this
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    category text,

    -- Core evidence
    evidence_count int NOT NULL DEFAULT 1,
    evidence_window_days int NOT NULL DEFAULT 7,
    confidence text NOT NULL DEFAULT 'medium', -- high | medium | low

    -- Signal details
    signal_detail jsonb NOT NULL, -- shape depends on signal_type

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    first_occurrence_at timestamptz DEFAULT now(),
    last_occurrence_at timestamptz DEFAULT now(),

    -- Status tracking
    status text DEFAULT 'pending', -- pending | acknowledged | closed

    CONSTRAINT valid_signal_type CHECK (signal_type IN ('enrichment_gap', 'compatibility_miss', 'escalation_theme')),
    CONSTRAINT valid_confidence CHECK (confidence IN ('high', 'medium', 'low')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'acknowledged', 'closed'))
);

-- ========================================
-- 2. INTERVENTION RECOMMENDATIONS TABLE
-- Operator-reviewable recommendations derived from signals
-- ========================================
CREATE TABLE IF NOT EXISTS public.intervention_recommendations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id uuid NOT NULL REFERENCES public.intervention_signals(id) ON DELETE CASCADE,

    -- Intervention type: enrichment | compatibility | escalation_playbook
    intervention_type text NOT NULL,

    -- Ranked recommendations (may have multiple per signal)
    rank int NOT NULL DEFAULT 1,

    -- Diagnosis & reasoning
    diagnosis jsonb NOT NULL, -- { root_cause, reasoning, effort_hours, estimated_impact }

    -- Operator decision
    operator_decision text DEFAULT 'pending', -- pending | approved | rejected | deferred
    operator_id uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
    operator_notes text,
    operator_decision_at timestamptz,

    -- Execution tracking (manual for MVP — not auto-executed)
    execution_status text DEFAULT 'not_started', -- not_started | in_progress | completed | failed
    executed_at timestamptz,

    -- Validation (post-execution check, optional for MVP)
    validation_date timestamptz,
    signal_reduction_percent int, -- % reduction in signal frequency after intervention

    -- Timestamps
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT valid_intervention_type CHECK (intervention_type IN ('enrichment', 'compatibility', 'escalation_playbook')),
    CONSTRAINT valid_operator_decision CHECK (operator_decision IN ('pending', 'approved', 'rejected', 'deferred')),
    CONSTRAINT valid_execution_status CHECK (execution_status IN ('not_started', 'in_progress', 'completed', 'failed'))
);

-- ========================================
-- 3. ENABLE RLS & POLICIES
-- ========================================
ALTER TABLE public.intervention_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_recommendations ENABLE ROW LEVEL SECURITY;

-- Signals: readable by admins, writable by backend service
CREATE POLICY "Admins can view intervention signals"
ON public.intervention_signals FOR SELECT
USING (
    exists (select 1 from public.admin_users where id = auth.uid())
);

CREATE POLICY "Admins can update signal status"
ON public.intervention_signals FOR UPDATE
USING (
    exists (select 1 from public.admin_users where id = auth.uid())
);

-- Recommendations: readable by admins, writable by backend + operator decisions
CREATE POLICY "Admins can view intervention recommendations"
ON public.intervention_recommendations FOR SELECT
USING (
    exists (select 1 from public.admin_users where id = auth.uid())
);

CREATE POLICY "Admins can update operator decisions"
ON public.intervention_recommendations FOR UPDATE
USING (
    exists (select 1 from public.admin_users where id = auth.uid())
);

-- ========================================
-- 4. INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_intervention_signals_status ON public.intervention_signals(status);
CREATE INDEX idx_intervention_signals_type ON public.intervention_signals(signal_type);
CREATE INDEX idx_intervention_signals_created ON public.intervention_signals(created_at DESC);
CREATE INDEX idx_intervention_recommendations_signal_id ON public.intervention_recommendations(signal_id);
CREATE INDEX idx_intervention_recommendations_operator_decision ON public.intervention_recommendations(operator_decision);
CREATE INDEX idx_intervention_recommendations_created ON public.intervention_recommendations(created_at DESC);
