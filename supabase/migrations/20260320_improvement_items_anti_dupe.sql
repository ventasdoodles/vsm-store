-- ─── Anti-duplication constraint: one improvement item per interaction ───────
-- One interaction review can produce at most one improvement item.
-- The UI promote toggle is per-evaluation; there is no legitimate use case
-- for two items from the same analytics_id.
-- Error code 23505 (unique_violation) is handled gracefully by the service layer.

alter table public.cesarin_improvement_items
    add constraint cesarin_improvement_items_analytics_id_key unique (analytics_id);
