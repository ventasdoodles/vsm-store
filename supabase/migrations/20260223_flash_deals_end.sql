-- ============================================================
-- VSM Store - Flash deals countdown dinámico
-- Migración: 20260223_flash_deals_end.sql
-- Fecha: 23 febrero 2026
-- ============================================================

-- Hora de fin del countdown de ofertas flash (configurable desde admin)
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS flash_deals_end TIMESTAMPTZ;

COMMENT ON COLUMN public.store_settings.flash_deals_end IS 'Hora de fin del countdown de ofertas flash. NULL = timer automático de 6h.';
