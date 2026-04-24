ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS is_ai_assistant_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.store_settings
ADD COLUMN IF NOT EXISTS pilot_runbook_status jsonb;
