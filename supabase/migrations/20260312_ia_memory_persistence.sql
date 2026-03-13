-- Wave 110: IA Memory Persistence
-- Adds cognitive storage to customer profiles for AI Concierge personalization

ALTER TABLE public.customer_profiles 
ADD COLUMN IF NOT EXISTS ia_context JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.customer_profiles.ia_context IS 'Cognitive storage for AI extracted preferences, mood, and shopping patterns.';
