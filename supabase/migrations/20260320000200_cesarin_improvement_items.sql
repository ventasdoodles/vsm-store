-- ============================================================================
-- Cesarin Improvement Queue — Governed Evaluation-to-Action Bridge
-- ============================================================================
-- Stores improvement items sourced from reviewed ai_evaluations / live turns.
-- Operators create these explicitly from the ReviewDrawer after evaluating a
-- real interaction. Each item declares a target lane, title, severity, status,
-- and optional owner. Execution is manual and out-of-band — this table tracks
-- intent and traceability, not autonomous action.
-- ============================================================================

create table if not exists public.cesarin_improvement_items (
    id              uuid        primary key default gen_random_uuid(),

    -- Source traceability (both nullable but at least analytics_id is required)
    analytics_id    uuid        not null
                    references  public.ai_analytics(id)
                    on delete   cascade,

    evaluation_id   uuid
                    references  public.ai_evaluations(id)
                    on delete   set null,

    -- Lane: where this improvement must be executed
    lane            text        not null
                    check       (lane in ('rule', 'knowledge', 'compatibility', 'commerce', 'other')),

    -- Description
    title           text        not null,
    summary         text,

    -- Severity (inherited from or overriding the source evaluation)
    severity        text        not null    default 'medium'
                    check       (severity in ('low', 'medium', 'high', 'critical')),

    -- Workflow state
    status          text        not null    default 'open'
                    check       (status in ('open', 'in_progress', 'resolved', 'wont_fix')),

    -- Operator ownership (nullable = unassigned)
    owner_id        uuid
                    references  public.admin_users(id)
                    on delete   set null,

    -- Execution evidence (free-text note + optional artifact link)
    execution_note  text,
    artifact_ref    text,

    created_at      timestamptz not null    default now(),
    updated_at      timestamptz not null    default now()
);

comment on table public.cesarin_improvement_items is
    'Governed improvement queue sourced from reviewed Cesarin interactions. '
    'Each item is operator-created and tracks intent, not autonomous execution.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists cesarin_improvement_items_status_idx
    on public.cesarin_improvement_items (status);

create index if not exists cesarin_improvement_items_lane_idx
    on public.cesarin_improvement_items (lane);

create index if not exists cesarin_improvement_items_created_at_idx
    on public.cesarin_improvement_items (created_at desc);

create index if not exists cesarin_improvement_items_analytics_id_idx
    on public.cesarin_improvement_items (analytics_id);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.handle_improvement_item_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists improvement_item_updated_at on public.cesarin_improvement_items;
create trigger improvement_item_updated_at
    before update on public.cesarin_improvement_items
    for each row execute function public.handle_improvement_item_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.cesarin_improvement_items enable row level security;

-- Admins can read all items
drop policy if exists "improvement_items_select_admin" on public.cesarin_improvement_items;
create policy "improvement_items_select_admin"
    on public.cesarin_improvement_items
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

-- Admins can insert (create from evaluated interactions)
drop policy if exists "improvement_items_insert_admin" on public.cesarin_improvement_items;
create policy "improvement_items_insert_admin"
    on public.cesarin_improvement_items
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- Admins can update status / owner / notes (no delete — audit trail preserved)
drop policy if exists "improvement_items_update_admin" on public.cesarin_improvement_items;
create policy "improvement_items_update_admin"
    on public.cesarin_improvement_items
    for update to authenticated
    using  (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));
