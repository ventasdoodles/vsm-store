-- ============================================================================
-- Pilot Feedback — Operator Manual Pilot Session Scoring
-- ============================================================================
-- Stores operator-submitted quality ratings from TabPilot's manual simulation
-- flow. Rows are append-only (no update path). One row per feedback submission.
-- Fields match the PilotFeedbackInput contract in ai-capsule-orchestrator.service.ts.
-- ============================================================================

create table if not exists public.pilot_feedback (
    id                  uuid        primary key default gen_random_uuid(),

    -- The prompt the operator sent during the manual simulation
    prompt              text        not null,

    -- The response text shown by the simulator
    response            text        not null,

    -- Capsule slug that handled the turn (nullable — not always resolved)
    capsule_slug        text,

    -- Operator ratings: 1–5 integer scale
    rating_accuracy     integer     not null    check (rating_accuracy  between 1 and 5),
    rating_tone         integer     not null    check (rating_tone       between 1 and 5),
    rating_utility      integer     not null    check (rating_utility    between 1 and 5),

    created_at          timestamptz not null    default now()
);

comment on table public.pilot_feedback is
    'Operator-submitted quality ratings from TabPilot manual simulation sessions. '
    'Append-only. One row per feedback submission.';

-- ── Index ─────────────────────────────────────────────────────────────────────

create index if not exists pilot_feedback_created_at_idx
    on public.pilot_feedback (created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table public.pilot_feedback enable row level security;

drop policy if exists "pilot_feedback_select_admin" on public.pilot_feedback;
create policy "pilot_feedback_select_admin"
    on public.pilot_feedback
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "pilot_feedback_insert_admin" on public.pilot_feedback;
create policy "pilot_feedback_insert_admin"
    on public.pilot_feedback
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));
