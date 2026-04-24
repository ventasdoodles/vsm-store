-- Minimal conversational conversion measurement spine.
-- Stores traceable causality events keyed by cesarin_session_id.

CREATE TABLE IF NOT EXISTS public.conversation_conversion_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT,
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS conversation_conversion_events_session_idx
    ON public.conversation_conversion_events (session_id);

CREATE INDEX IF NOT EXISTS conversation_conversion_events_type_time_idx
    ON public.conversation_conversion_events (event_type, timestamp DESC);

ALTER TABLE public.conversation_conversion_events ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON public.conversation_conversion_events TO anon;
GRANT INSERT ON public.conversation_conversion_events TO authenticated;

DROP POLICY IF EXISTS "conversation_conversion_events_insert_anon" ON public.conversation_conversion_events;
CREATE POLICY "conversation_conversion_events_insert_anon"
ON public.conversation_conversion_events
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "conversation_conversion_events_insert_authenticated" ON public.conversation_conversion_events;
CREATE POLICY "conversation_conversion_events_insert_authenticated"
ON public.conversation_conversion_events
FOR INSERT
TO authenticated
WITH CHECK (true);

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS cesarin_session_id TEXT,
ADD COLUMN IF NOT EXISTS conversion_source TEXT;

CREATE INDEX IF NOT EXISTS orders_cesarin_session_id_idx
    ON public.orders (cesarin_session_id);
