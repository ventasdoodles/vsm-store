-- ============================================================================
-- Cesarin Operator Actions — Shared Admin Activity Traceability
-- ============================================================================
-- Append-only log of operator actions taken inside Cesarin OS.
-- Captures: actor email, action type, module, target reference, detail, outcome.
-- Not a full enterprise audit system — a practical shared traceability layer.
-- ============================================================================

create table if not exists public.cesarin_operator_actions (
    id          uuid        primary key default gen_random_uuid(),

    -- Operator attribution (best-effort email from Supabase session)
    actor       text,

    -- Action label (human-readable, e.g. "Directriz creada", "Señal → Mejora")
    action      text        not null,

    -- Module/surface that generated the action
    module      text        not null    default 'cesarin_os',

    -- Reference to the target object (rule content snippet, improvement title, etc.)
    target_ref  text,

    -- Additional detail (free text)
    detail      text,

    -- Outcome if available ("ok", "duplicate", error message, etc.)
    outcome     text,

    ts          timestamptz not null    default now()
);

comment on table public.cesarin_operator_actions is
    'Append-only shared activity log for Cesarin OS operator actions. '
    'Captures actor, action, module, target and timestamp for shared operational trust.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists cesarin_operator_actions_ts_idx
    on public.cesarin_operator_actions (ts desc);

create index if not exists cesarin_operator_actions_actor_idx
    on public.cesarin_operator_actions (actor);

create index if not exists cesarin_operator_actions_module_idx
    on public.cesarin_operator_actions (module);

-- ── Row Level Security ───────────────────────────────────────────────────────

alter table public.cesarin_operator_actions enable row level security;

drop policy if exists "operator_actions_select_admin" on public.cesarin_operator_actions;
create policy "operator_actions_select_admin"
    on public.cesarin_operator_actions
    for select to authenticated
    using (exists (select 1 from public.admin_users where id = auth.uid()));

drop policy if exists "operator_actions_insert_admin" on public.cesarin_operator_actions;
create policy "operator_actions_insert_admin"
    on public.cesarin_operator_actions
    for insert to authenticated
    with check (exists (select 1 from public.admin_users where id = auth.uid()));

-- No update, no delete — append-only audit trail
