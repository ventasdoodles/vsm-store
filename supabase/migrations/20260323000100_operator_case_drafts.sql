-- ============================================================================
-- Operator Case Drafts — Reusable Private Case Draft Workspace
-- ============================================================================
-- B2 Pass 1: Stores operator-created draft test cases sourced from real
-- interactions (ReviewDrawer) or failed QA simulation results (TabQuality).
-- One row per case draft; no uniqueness constraint — operator may create
-- multiple drafts from same source if needed.
-- ============================================================================

create table if not exists public.operator_case_drafts (
    id                      uuid        primary key default gen_random_uuid(),

    -- Origin surface
    source_type             text        not null
                            check       (source_type in ('review_drawer', 'qa_simulation')),

    -- Source reference (interaction ID, scenario_id, or report ID)
    source_ref_id           text        not null,

    -- Nullable linkage fields
    source_session_id       text,
    source_interaction_id   uuid,

    -- Test case content
    input                   text        not null,
    observed_response       text,
    evaluation_summary      text,
    expected_outcome        text,

    -- Routing context
    route_or_capsule        text,
    detected_intent         text,

    -- Evaluation evidence
    evaluation_score        integer     check (evaluation_score between 1 and 5),
    failure_reason          text,

    -- Workflow readiness
    readiness_status        text        not null    default 'draft'
                            check       (readiness_status in (
                                            'draft',
                                            'needs_expected_outcome',
                                            'ready'
                                        )),

    created_at              timestamptz not null    default now(),
    updated_at              timestamptz not null    default now()
);

comment on table public.operator_case_drafts is
    'Operator-created reusable private case drafts sourced from live interactions '
    '(ReviewDrawer) or failed QA simulation results (TabQuality). B2 Pass 1.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists operator_case_drafts_source_type_idx
    on public.operator_case_drafts (source_type);

create index if not exists operator_case_drafts_readiness_status_idx
    on public.operator_case_drafts (readiness_status);

create index if not exists operator_case_drafts_created_at_idx
    on public.operator_case_drafts (created_at desc);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.handle_operator_case_drafts_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists operator_case_drafts_updated_at on public.operator_case_drafts;
create trigger operator_case_drafts_updated_at
    before update on public.operator_case_drafts
    for each row execute function public.handle_operator_case_drafts_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.operator_case_drafts enable row level security;

drop policy if exists "case_drafts_select_admin" on public.operator_case_drafts;
create policy "case_drafts_select_admin"
    on public.operator_case_drafts
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "case_drafts_insert_admin" on public.operator_case_drafts;
create policy "case_drafts_insert_admin"
    on public.operator_case_drafts
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "case_drafts_update_admin" on public.operator_case_drafts;
create policy "case_drafts_update_admin"
    on public.operator_case_drafts
    for update to authenticated
    using  (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "case_drafts_delete_admin" on public.operator_case_drafts;
create policy "case_drafts_delete_admin"
    on public.operator_case_drafts
    for delete to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));
