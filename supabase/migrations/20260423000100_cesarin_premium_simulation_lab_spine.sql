-- ============================================================================
-- Cesarin OS Premium Simulation Lab - Persistence Spine Phase 1
-- ============================================================================
-- First-class durable persistence for future premium simulation lab revival.
-- This pass intentionally does NOT revive the old simulator shell/UI.
-- It adds:
--   - durable sessions
--   - durable turns
--   - explicit mode identity
--   - turn review linkage
--   - session/turn comments
--   - case draft / improvement workflow links
-- ============================================================================

create table if not exists public.cesarin_premium_lab_sessions (
    id              uuid primary key default gen_random_uuid(),
    mode_identity   text not null
                    check (mode_identity in ('storefront-equivalent', 'admin-simulated', 'replay')),
    status          text not null default 'draft'
                    check (status in ('draft', 'active', 'closed', 'archived')),
    title           text,
    description     text,
    created_by      uuid references auth.users(id) on delete set null,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint cesarin_premium_lab_sessions_id_mode_key unique (id, mode_identity)
);

comment on table public.cesarin_premium_lab_sessions is
    'Durable premium simulation lab sessions for future Cesarin OS lab UX. '
    'Mode identity is first-class and queryable.';

create table if not exists public.cesarin_premium_lab_turns (
    id                          uuid primary key default gen_random_uuid(),
    session_id                  uuid not null,
    turn_number                 integer not null check (turn_number > 0),
    mode_identity               text not null
                                check (mode_identity in ('storefront-equivalent', 'admin-simulated', 'replay')),
    execution_kind              text not null
                                check (execution_kind in ('storefront_runtime', 'lab_simulation', 'replay_snapshot')),
    prompt_query                text not null,
    history_snapshot            jsonb not null default '[]'::jsonb,
    history_message_count       integer not null default 0 check (history_message_count >= 0),
    assistant_answer_snapshot   text not null,
    artifact_snapshot           jsonb not null default '{}'::jsonb,
    evidence_summary            text,
    runtime_interaction_id      uuid references public.ai_analytics(id) on delete set null,
    replay_source_turn_id       uuid references public.cesarin_premium_lab_turns(id) on delete set null,
    replay_source_interaction_id uuid references public.ai_analytics(id) on delete set null,
    created_by                  uuid references auth.users(id) on delete set null,
    created_at                  timestamptz not null default now(),
    constraint cesarin_premium_lab_turns_session_mode_fkey
        foreign key (session_id, mode_identity)
        references public.cesarin_premium_lab_sessions(id, mode_identity)
        on delete cascade,
    constraint cesarin_premium_lab_turns_session_turn_key unique (session_id, turn_number),
    constraint cesarin_premium_lab_turns_mode_execution_check
        check (
            (mode_identity = 'storefront-equivalent' and execution_kind = 'storefront_runtime')
            or (mode_identity = 'admin-simulated' and execution_kind = 'lab_simulation')
            or (mode_identity = 'replay' and execution_kind = 'replay_snapshot')
        ),
    constraint cesarin_premium_lab_turns_runtime_truth_check
        check (
            (mode_identity = 'storefront-equivalent' and runtime_interaction_id is not null)
            or (mode_identity = 'admin-simulated' and runtime_interaction_id is null)
            or (mode_identity = 'replay')
        ),
    constraint cesarin_premium_lab_turns_replay_source_check
        check (
            (
                mode_identity = 'replay'
                and (
                    replay_source_turn_id is not null
                    or replay_source_interaction_id is not null
                )
            )
            or (
                mode_identity <> 'replay'
                and replay_source_turn_id is null
                and replay_source_interaction_id is null
            )
        )
);

comment on table public.cesarin_premium_lab_turns is
    'Durable premium simulation lab turns with immutable prompt/history/answer/artifact snapshots. '
    'Mode identity and runtime linkage remain explicit.';

comment on column public.cesarin_premium_lab_turns.runtime_interaction_id is
    'Real ai_analytics linkage when and only when the saved turn is storefront-equivalent runtime truth.';

create table if not exists public.cesarin_premium_lab_comments (
    id              uuid primary key default gen_random_uuid(),
    scope           text not null check (scope in ('session', 'turn')),
    session_id      uuid references public.cesarin_premium_lab_sessions(id) on delete cascade,
    turn_id         uuid references public.cesarin_premium_lab_turns(id) on delete cascade,
    body            text not null,
    created_by      uuid references auth.users(id) on delete set null,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint cesarin_premium_lab_comments_scope_target_check
        check (
            (scope = 'session' and session_id is not null and turn_id is null)
            or (scope = 'turn' and turn_id is not null and session_id is null)
        )
);

comment on table public.cesarin_premium_lab_comments is
    'Freeform comments attached to premium lab sessions or turns.';

create table if not exists public.cesarin_premium_lab_turn_reviews (
    id              uuid primary key default gen_random_uuid(),
    turn_id         uuid not null unique references public.cesarin_premium_lab_turns(id) on delete cascade,
    review_source   text not null
                    check (review_source in ('linked_ai_evaluation', 'lab_review')),
    ai_evaluation_id uuid references public.ai_evaluations(id) on delete cascade,
    score           integer check (score between 1 and 5),
    primary_tag     text,
    secondary_tags  text[] not null default '{}'::text[],
    severity        text check (severity in ('low', 'medium', 'high', 'critical')),
    expected_outcome text,
    comment         text,
    reviewer_id     uuid references auth.users(id) on delete set null,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    constraint cesarin_premium_lab_turn_reviews_source_shape_check
        check (
            (
                review_source = 'linked_ai_evaluation'
                and ai_evaluation_id is not null
                and score is null
                and primary_tag is null
                and severity is null
                and expected_outcome is null
                and comment is null
            )
            or (
                review_source = 'lab_review'
                and ai_evaluation_id is null
                and score is not null
                and primary_tag is not null
                and severity is not null
            )
        )
);

comment on table public.cesarin_premium_lab_turn_reviews is
    'Structured review linkage for premium lab turns. '
    'Links to canonical ai_evaluations when runtime truth already exists, or stores lab-local reviews otherwise.';

create table if not exists public.cesarin_premium_lab_turn_case_draft_links (
    id              uuid primary key default gen_random_uuid(),
    turn_id         uuid not null references public.cesarin_premium_lab_turns(id) on delete cascade,
    case_draft_id   uuid not null references public.operator_case_drafts(id) on delete cascade,
    link_kind       text not null default 'derived_case_draft'
                    check (link_kind in ('derived_case_draft', 'linked_case_draft')),
    created_by      uuid references auth.users(id) on delete set null,
    created_at      timestamptz not null default now(),
    constraint cesarin_premium_lab_turn_case_draft_links_turn_case_key unique (turn_id, case_draft_id)
);

comment on table public.cesarin_premium_lab_turn_case_draft_links is
    'Explicit linkage between premium lab turns and reusable operator case drafts.';

create table if not exists public.cesarin_premium_lab_turn_improvement_links (
    id                          uuid primary key default gen_random_uuid(),
    turn_id                     uuid not null references public.cesarin_premium_lab_turns(id) on delete cascade,
    link_kind                   text not null
                                check (link_kind in ('improvement_item', 'intervention_signal', 'intervention_recommendation')),
    improvement_item_id         uuid references public.cesarin_improvement_items(id) on delete cascade,
    intervention_signal_id      uuid references public.intervention_signals(id) on delete set null,
    intervention_recommendation_id uuid references public.intervention_recommendations(id) on delete set null,
    created_by                  uuid references auth.users(id) on delete set null,
    created_at                  timestamptz not null default now(),
    constraint cesarin_premium_lab_turn_improvement_links_target_check
        check (
            (
                link_kind = 'improvement_item'
                and improvement_item_id is not null
                and intervention_signal_id is null
                and intervention_recommendation_id is null
            )
            or (
                link_kind = 'intervention_signal'
                and improvement_item_id is null
                and intervention_signal_id is not null
                and intervention_recommendation_id is null
            )
            or (
                link_kind = 'intervention_recommendation'
                and improvement_item_id is null
                and intervention_signal_id is null
                and intervention_recommendation_id is not null
            )
        )
);

comment on table public.cesarin_premium_lab_turn_improvement_links is
    'Explicit linkage between premium lab turns and the existing intervention/improvement workflow entities.';

create index if not exists cesarin_premium_lab_sessions_mode_idx
    on public.cesarin_premium_lab_sessions (mode_identity);

create index if not exists cesarin_premium_lab_sessions_status_idx
    on public.cesarin_premium_lab_sessions (status);

create index if not exists cesarin_premium_lab_sessions_created_at_idx
    on public.cesarin_premium_lab_sessions (created_at desc);

create index if not exists cesarin_premium_lab_turns_session_turn_idx
    on public.cesarin_premium_lab_turns (session_id, turn_number);

create index if not exists cesarin_premium_lab_turns_mode_idx
    on public.cesarin_premium_lab_turns (mode_identity);

create index if not exists cesarin_premium_lab_turns_runtime_interaction_idx
    on public.cesarin_premium_lab_turns (runtime_interaction_id)
    where runtime_interaction_id is not null;

create index if not exists cesarin_premium_lab_turns_replay_source_turn_idx
    on public.cesarin_premium_lab_turns (replay_source_turn_id)
    where replay_source_turn_id is not null;

create index if not exists cesarin_premium_lab_turns_replay_source_interaction_idx
    on public.cesarin_premium_lab_turns (replay_source_interaction_id)
    where replay_source_interaction_id is not null;

create index if not exists cesarin_premium_lab_comments_session_idx
    on public.cesarin_premium_lab_comments (session_id, created_at asc)
    where session_id is not null;

create index if not exists cesarin_premium_lab_comments_turn_idx
    on public.cesarin_premium_lab_comments (turn_id, created_at asc)
    where turn_id is not null;

create index if not exists cesarin_premium_lab_turn_reviews_ai_evaluation_idx
    on public.cesarin_premium_lab_turn_reviews (ai_evaluation_id)
    where ai_evaluation_id is not null;

create index if not exists cesarin_premium_lab_turn_case_draft_links_case_idx
    on public.cesarin_premium_lab_turn_case_draft_links (case_draft_id);

create index if not exists cesarin_premium_lab_turn_improvement_links_turn_idx
    on public.cesarin_premium_lab_turn_improvement_links (turn_id);

create index if not exists cesarin_premium_lab_turn_improvement_links_improvement_idx
    on public.cesarin_premium_lab_turn_improvement_links (improvement_item_id)
    where improvement_item_id is not null;

create index if not exists cesarin_premium_lab_turn_improvement_links_signal_idx
    on public.cesarin_premium_lab_turn_improvement_links (intervention_signal_id)
    where intervention_signal_id is not null;

create index if not exists cesarin_premium_lab_turn_improvement_links_recommendation_idx
    on public.cesarin_premium_lab_turn_improvement_links (intervention_recommendation_id)
    where intervention_recommendation_id is not null;

drop trigger if exists cesarin_premium_lab_sessions_updated_at on public.cesarin_premium_lab_sessions;
create trigger cesarin_premium_lab_sessions_updated_at
    before update on public.cesarin_premium_lab_sessions
    for each row execute function public.update_updated_at_column();

drop trigger if exists cesarin_premium_lab_comments_updated_at on public.cesarin_premium_lab_comments;
create trigger cesarin_premium_lab_comments_updated_at
    before update on public.cesarin_premium_lab_comments
    for each row execute function public.update_updated_at_column();

drop trigger if exists cesarin_premium_lab_turn_reviews_updated_at on public.cesarin_premium_lab_turn_reviews;
create trigger cesarin_premium_lab_turn_reviews_updated_at
    before update on public.cesarin_premium_lab_turn_reviews
    for each row execute function public.update_updated_at_column();

alter table public.cesarin_premium_lab_sessions enable row level security;
alter table public.cesarin_premium_lab_turns enable row level security;
alter table public.cesarin_premium_lab_comments enable row level security;
alter table public.cesarin_premium_lab_turn_reviews enable row level security;
alter table public.cesarin_premium_lab_turn_case_draft_links enable row level security;
alter table public.cesarin_premium_lab_turn_improvement_links enable row level security;

drop policy if exists "premium_lab_sessions_select_admin" on public.cesarin_premium_lab_sessions;
create policy "premium_lab_sessions_select_admin"
    on public.cesarin_premium_lab_sessions
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_sessions_insert_admin" on public.cesarin_premium_lab_sessions;
create policy "premium_lab_sessions_insert_admin"
    on public.cesarin_premium_lab_sessions
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_sessions_update_admin" on public.cesarin_premium_lab_sessions;
create policy "premium_lab_sessions_update_admin"
    on public.cesarin_premium_lab_sessions
    for update to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turns_select_admin" on public.cesarin_premium_lab_turns;
create policy "premium_lab_turns_select_admin"
    on public.cesarin_premium_lab_turns
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turns_insert_admin" on public.cesarin_premium_lab_turns;
create policy "premium_lab_turns_insert_admin"
    on public.cesarin_premium_lab_turns
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turns_update_admin" on public.cesarin_premium_lab_turns;
create policy "premium_lab_turns_update_admin"
    on public.cesarin_premium_lab_turns
    for update to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_comments_select_admin" on public.cesarin_premium_lab_comments;
create policy "premium_lab_comments_select_admin"
    on public.cesarin_premium_lab_comments
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_comments_insert_admin" on public.cesarin_premium_lab_comments;
create policy "premium_lab_comments_insert_admin"
    on public.cesarin_premium_lab_comments
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_comments_update_admin" on public.cesarin_premium_lab_comments;
create policy "premium_lab_comments_update_admin"
    on public.cesarin_premium_lab_comments
    for update to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turn_reviews_select_admin" on public.cesarin_premium_lab_turn_reviews;
create policy "premium_lab_turn_reviews_select_admin"
    on public.cesarin_premium_lab_turn_reviews
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turn_reviews_insert_admin" on public.cesarin_premium_lab_turn_reviews;
create policy "premium_lab_turn_reviews_insert_admin"
    on public.cesarin_premium_lab_turn_reviews
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_turn_reviews_update_admin" on public.cesarin_premium_lab_turn_reviews;
create policy "premium_lab_turn_reviews_update_admin"
    on public.cesarin_premium_lab_turn_reviews
    for update to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_case_draft_links_select_admin" on public.cesarin_premium_lab_turn_case_draft_links;
create policy "premium_lab_case_draft_links_select_admin"
    on public.cesarin_premium_lab_turn_case_draft_links
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_case_draft_links_insert_admin" on public.cesarin_premium_lab_turn_case_draft_links;
create policy "premium_lab_case_draft_links_insert_admin"
    on public.cesarin_premium_lab_turn_case_draft_links
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_improvement_links_select_admin" on public.cesarin_premium_lab_turn_improvement_links;
create policy "premium_lab_improvement_links_select_admin"
    on public.cesarin_premium_lab_turn_improvement_links
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "premium_lab_improvement_links_insert_admin" on public.cesarin_premium_lab_turn_improvement_links;
create policy "premium_lab_improvement_links_insert_admin"
    on public.cesarin_premium_lab_turn_improvement_links
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));
