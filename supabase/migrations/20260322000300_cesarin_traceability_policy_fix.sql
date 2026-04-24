-- ============================================================================
-- Cesarin Traceability — RLS Policy Fix
-- ============================================================================
-- The initial policies for cesarin_signal_states and cesarin_operator_actions
-- used an admin_users subquery: exists(select 1 from admin_users where id = auth.uid()).
-- This is the same pattern as cesarin_improvement_items, but if the operator's
-- Supabase auth.uid() is not registered in admin_users (possible in some deploy
-- configurations), all writes are silently blocked by RLS.
--
-- This migration replaces those checks with auth.uid() is not null — meaning
-- any authenticated session can write. Access restriction is enforced at the
-- application layer by AdminGuard, which is the same trust model used by the
-- rest of the admin stack.
-- ============================================================================

-- ── cesarin_signal_states ────────────────────────────────────────────────────

drop policy if exists "signal_states_select_admin" on public.cesarin_signal_states;
drop policy if exists "signal_states_insert_admin" on public.cesarin_signal_states;
drop policy if exists "signal_states_update_admin" on public.cesarin_signal_states;

create policy "signal_states_select_auth"
    on public.cesarin_signal_states
    for select to authenticated
    using (auth.uid() is not null);

create policy "signal_states_insert_auth"
    on public.cesarin_signal_states
    for insert to authenticated
    with check (auth.uid() is not null);

create policy "signal_states_update_auth"
    on public.cesarin_signal_states
    for update to authenticated
    using  (auth.uid() is not null)
    with check (auth.uid() is not null);

-- ── cesarin_operator_actions ─────────────────────────────────────────────────

drop policy if exists "operator_actions_select_admin" on public.cesarin_operator_actions;
drop policy if exists "operator_actions_insert_admin" on public.cesarin_operator_actions;

create policy "operator_actions_select_auth"
    on public.cesarin_operator_actions
    for select to authenticated
    using (auth.uid() is not null);

create policy "operator_actions_insert_auth"
    on public.cesarin_operator_actions
    for insert to authenticated
    with check (auth.uid() is not null);
