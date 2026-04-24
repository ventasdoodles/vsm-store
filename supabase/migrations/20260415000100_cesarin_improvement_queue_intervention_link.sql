-- ============================================================================
-- Cesarin OS Governed Operator Queue Convergence
-- ============================================================================
-- Adds the minimum persisted lineage needed for intervention recommendations to
-- promote into the canonical cesarin_improvement_items queue.
-- ============================================================================

alter table public.cesarin_improvement_items
    add column if not exists source_kind text not null default 'review_interaction';

alter table public.cesarin_improvement_items
    add column if not exists intervention_signal_id uuid;

alter table public.cesarin_improvement_items
    add column if not exists intervention_recommendation_id uuid;

alter table public.cesarin_improvement_items
    alter column analytics_id drop not null;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'cesarin_improvement_items_source_kind_check'
    ) then
        alter table public.cesarin_improvement_items
            add constraint cesarin_improvement_items_source_kind_check
            check (source_kind in ('review_interaction', 'intervention_recommendation'));
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cesarin_improvement_items_source_lineage_check'
    ) then
        alter table public.cesarin_improvement_items
            add constraint cesarin_improvement_items_source_lineage_check
            check (
                (
                    source_kind = 'review_interaction'
                    and analytics_id is not null
                )
                or (
                    source_kind = 'intervention_recommendation'
                    and intervention_recommendation_id is not null
                    and intervention_signal_id is not null
                )
            );
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cesarin_improvement_items_intervention_signal_id_fkey'
    ) then
        alter table public.cesarin_improvement_items
            add constraint cesarin_improvement_items_intervention_signal_id_fkey
            foreign key (intervention_signal_id)
            references public.intervention_signals(id)
            on delete set null;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'cesarin_improvement_items_intervention_recommendation_id_fkey'
    ) then
        alter table public.cesarin_improvement_items
            add constraint cesarin_improvement_items_intervention_recommendation_id_fkey
            foreign key (intervention_recommendation_id)
            references public.intervention_recommendations(id)
            on delete set null;
    end if;
end $$;

create index if not exists cesarin_improvement_items_intervention_signal_id_idx
    on public.cesarin_improvement_items (intervention_signal_id);

create unique index if not exists cesarin_improvement_items_intervention_recommendation_id_key
    on public.cesarin_improvement_items (intervention_recommendation_id)
    where intervention_recommendation_id is not null;

comment on column public.cesarin_improvement_items.source_kind is
    'Canonical source lineage for the governed operator queue.';

comment on column public.cesarin_improvement_items.intervention_recommendation_id is
    'Persisted link from an approved intervention recommendation into the canonical improvement queue.';
