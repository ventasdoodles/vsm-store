-- ============================================================
-- VSM Store - Add References column to Addresses
-- Migración: 20260315_add_address_references.sql
-- Fecha: 15 marzo 2026
-- ============================================================

ALTER TABLE public.addresses 
ADD COLUMN IF NOT EXISTS "references" TEXT;

COMMENT ON COLUMN public.addresses."references" IS 'Referencias adicionales para la ubicación (entre calles, color de casa, etc)';
