-- Cesarin Stage 2: lightweight storefront taste memory
-- Keeps memory bounded to compact preference signals and summaries.

ALTER TABLE public.ai_customer_memory
ADD COLUMN IF NOT EXISTS interests_metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS preference_signals JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS preference_summary JSONB DEFAULT '{}'::jsonb;

UPDATE public.ai_customer_memory
SET
    interests_metadata = COALESCE(interests_metadata, '{}'::jsonb),
    preference_signals = COALESCE(preference_signals, '{}'::jsonb),
    preference_summary = COALESCE(preference_summary, '{}'::jsonb)
WHERE
    interests_metadata IS NULL
    OR preference_signals IS NULL
    OR preference_summary IS NULL;

COMMENT ON COLUMN public.ai_customer_memory.interests_metadata IS 'Frequency/recency metadata for compact interest memory.';
COMMENT ON COLUMN public.ai_customer_memory.preference_signals IS 'Bounded storefront taste signals with conservative evidence tiers.';
COMMENT ON COLUMN public.ai_customer_memory.preference_summary IS 'Compact preference summary injected into Cesarin prompts for authenticated returning customers.';
