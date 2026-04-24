-- Add response_text to ai_analytics for live production turn evidence fidelity.
-- Allows the edge function to persist the actual Cesarin response text alongside
-- the user query, so operators can review what the assistant said rather than
-- inferring it from debug metadata alone. Nullable — historical rows carry NULL.
alter table public.ai_analytics add column if not exists response_text text;
