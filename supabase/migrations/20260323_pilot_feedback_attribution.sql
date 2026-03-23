-- ============================================================================
-- Pilot Feedback — Operator Attribution Column
-- ============================================================================
-- Adds submitted_by to pilot_feedback so every scoring row is traceable
-- to the authenticated admin actor who submitted it.
-- Pattern: uuid FK to auth.users, nullable on delete (preserves rows if user removed).
-- ============================================================================

alter table public.pilot_feedback
    add column if not exists submitted_by uuid references auth.users(id) on delete set null;

comment on column public.pilot_feedback.submitted_by is
    'Auth user ID of the admin operator who submitted this feedback row. '
    'Nullable — rows are preserved if the auth user is later removed.';

create index if not exists pilot_feedback_submitted_by_idx
    on public.pilot_feedback (submitted_by);
