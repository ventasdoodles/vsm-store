-- Migration: Cesarin OS Tables
-- Description: Creates tables for AI behavior rules and study materials.

CREATE TABLE IF NOT EXISTS public.ai_behavior_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('MUST_DO', 'NEVER_DO')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('link', 'text', 'pdf')),
    content_url TEXT,
    raw_text TEXT,
    status TEXT NOT NULL CHECK (status IN ('memorizing', 'memorized')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.ai_behavior_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_study_materials ENABLE ROW LEVEL SECURITY;

-- Admins can do anything
CREATE POLICY "Admins can manage behavior rules"
    ON public.ai_behavior_rules
    FOR ALL
    TO authenticated
    USING ( (auth.jwt() ->> 'role') = 'admin' );

CREATE POLICY "Admins can manage study materials"
    ON public.ai_study_materials
    FOR ALL
    TO authenticated
    USING ( (auth.jwt() ->> 'role') = 'admin' );

-- Edge functions might need to read rules
CREATE POLICY "Edge functions can read behavior rules"
    ON public.ai_behavior_rules
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Triggers for updated_at
CREATE TRIGGER set_ai_behavior_rules_updated_at
    BEFORE UPDATE ON public.ai_behavior_rules
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

CREATE TRIGGER set_ai_study_materials_updated_at
    BEFORE UPDATE ON public.ai_study_materials
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();
