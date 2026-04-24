-- WAVE 190: HUMAN EVALUATION LOOP
-- Unified persistence for supervised human scoring of AI interactions.

CREATE TABLE IF NOT EXISTS public.ai_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analytics_id UUID UNIQUE NOT NULL REFERENCES public.ai_analytics(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    primary_tag TEXT NOT NULL,
    secondary_tags TEXT[] DEFAULT '{}'::text[],
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    expected_outcome TEXT,
    comment TEXT,
    evaluator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.ai_evaluations ENABLE ROW LEVEL SECURITY;

-- Admins can manage everything
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ai_evaluations' AND policyname = 'Admins can manage evaluations'
    ) THEN
        CREATE POLICY "Admins can manage evaluations"
        ON public.ai_evaluations
        FOR ALL
        TO authenticated
        USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
    END IF;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_ai_evaluations_updated_at ON public.ai_evaluations;
CREATE TRIGGER trigger_ai_evaluations_updated_at
BEFORE UPDATE ON public.ai_evaluations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Analytics Helper View for Buckets
CREATE OR REPLACE VIEW public.view_ai_evaluation_stats AS
SELECT 
    e.primary_tag,
    e.severity,
    COUNT(*) as total_count,
    AVG(e.score) as avg_score
FROM public.ai_evaluations e
GROUP BY e.primary_tag, e.severity;
