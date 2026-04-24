-- ============================================================================
-- Cesarin OS Premium Simulation Lab - Truth Boundary Fix
-- ============================================================================
-- Repair the rejected Phase 1 gap:
--   replay turns must not carry runtime_interaction_id
--   admin-simulated turns must not carry runtime_interaction_id
-- Preserve replay provenance by moving any historical replay misuse to
-- replay_source_interaction_id when that source field is still empty.
-- ============================================================================

update public.cesarin_premium_lab_turns
set replay_source_interaction_id = coalesce(replay_source_interaction_id, runtime_interaction_id),
    runtime_interaction_id = null
where mode_identity = 'replay'
  and runtime_interaction_id is not null;

update public.cesarin_premium_lab_turns
set runtime_interaction_id = null
where mode_identity = 'admin-simulated'
  and runtime_interaction_id is not null;

alter table public.cesarin_premium_lab_turns
drop constraint if exists cesarin_premium_lab_turns_runtime_truth_check;

alter table public.cesarin_premium_lab_turns
add constraint cesarin_premium_lab_turns_runtime_truth_check
check (
    (mode_identity = 'storefront-equivalent' and runtime_interaction_id is not null)
    or (mode_identity in ('admin-simulated', 'replay') and runtime_interaction_id is null)
);
