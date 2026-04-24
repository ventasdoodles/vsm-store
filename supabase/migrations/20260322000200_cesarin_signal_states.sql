-- ============================================================================
-- Cesarin Signal States — Shared Operator Signal Handling Traceability
-- ============================================================================
-- Stores signal handling decisions made by operators in the Aprendizaje tab.
-- One row per ai_analytics interaction; upsert semantics on analytics_id.
-- Replaces browser-local localStorage as the source of truth for signal state.
-- ============================================================================

create table if not exists public.cesarin_signal_states (
    id              uuid        primary key default gen_random_uuid(),

    -- Source interaction (required; unique so one state per signal)
    analytics_id    uuid        not null,

    -- Handling state
    status          text        not null
                    check       (status in (
                                    'revisada',
                                    'descartada',
                                    'convertida_regla',
                                    'convertida_mejora',
                                    'resuelta'
                                )),

    -- Operator attribution (best-effort email; nullable for anonymous/fallback)
    handled_by      text,

    -- Timestamp of last state change
    handled_at      timestamptz not null    default now(),

    -- Lineage reference — points to created rule content or improvement title
    ref_label       text,

    updated_at      timestamptz not null    default now(),

    -- One state row per signal
    constraint cesarin_signal_states_analytics_id_key unique (analytics_id)
);

comment on table public.cesarin_signal_states is
    'Shared operator signal handling decisions for the Cesarin learning surface. '
    'Replaces localStorage — allows multiple operators to share signal triage state.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists cesarin_signal_states_analytics_id_idx
    on public.cesarin_signal_states (analytics_id);

create index if not exists cesarin_signal_states_handled_at_idx
    on public.cesarin_signal_states (handled_at desc);

create index if not exists cesarin_signal_states_status_idx
    on public.cesarin_signal_states (status);

-- ── updated_at trigger ───────────────────────────────────────────────────────

create or replace function public.handle_cesarin_signal_states_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists cesarin_signal_states_updated_at on public.cesarin_signal_states;
create trigger cesarin_signal_states_updated_at
    before update on public.cesarin_signal_states
    for each row execute function public.handle_cesarin_signal_states_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.cesarin_signal_states enable row level security;

drop policy if exists "signal_states_select_admin" on public.cesarin_signal_states;
create policy "signal_states_select_admin"
    on public.cesarin_signal_states
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "signal_states_insert_admin" on public.cesarin_signal_states;
create policy "signal_states_insert_admin"
    on public.cesarin_signal_states
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "signal_states_update_admin" on public.cesarin_signal_states;
create policy "signal_states_update_admin"
    on public.cesarin_signal_states
    for update to authenticated
    using  (exists (select 1 from public.admin_users where id = auth.uid()))
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- No delete policy — signal state history is preserved
