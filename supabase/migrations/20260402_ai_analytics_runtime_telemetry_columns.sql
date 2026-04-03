-- Bounded MVL telemetry columns for live ai_analytics inspection.
-- These are compact, queryable mirrors of runtime truth that already exists
-- inside ai_logic_debug. The full debug payload remains the source of detail.

alter table public.ai_analytics
add column if not exists primary_intent text,
add column if not exists current_turn_decision text,
add column if not exists turn_focus text,
add column if not exists catalog_gate_open boolean,
add column if not exists catalog_gate_reason text,
add column if not exists next_step_family text,
add column if not exists assist_action_present boolean,
add column if not exists source_context_present boolean,
add column if not exists retrieval_source text;
