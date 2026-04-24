-- ============================================================
-- VSM Store - Flash Deals module (tabla dedicada)
-- Migración: 20260302_flash_deals.sql
-- Fecha: 2 marzo 2026
-- ============================================================

-- Tabla de ofertas flash vinculadas a productos reales
CREATE TABLE IF NOT EXISTS public.flash_deals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  flash_price DECIMAL(10,2) NOT NULL,
  max_qty     INT NOT NULL DEFAULT 10,
  sold_count  INT NOT NULL DEFAULT 0,
  starts_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at     TIMESTAMPTZ NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  priority    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT flash_deals_positive_price CHECK (flash_price > 0),
  CONSTRAINT flash_deals_positive_qty CHECK (max_qty > 0),
  CONSTRAINT flash_deals_valid_range CHECK (ends_at > starts_at)
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_flash_deals_active
  ON public.flash_deals (is_active, ends_at DESC)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_flash_deals_product
  ON public.flash_deals (product_id);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION update_flash_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_flash_deals_updated_at ON public.flash_deals;
CREATE TRIGGER trg_flash_deals_updated_at
  BEFORE UPDATE ON public.flash_deals
  FOR EACH ROW EXECUTE FUNCTION update_flash_deals_updated_at();

-- RLS: solo admins escriben, todos leen las activas
ALTER TABLE public.flash_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flash_deals_read_all"
  ON public.flash_deals FOR SELECT
  USING (true);

CREATE POLICY "flash_deals_admin_insert"
  ON public.flash_deals FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "flash_deals_admin_update"
  ON public.flash_deals FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

CREATE POLICY "flash_deals_admin_delete"
  ON public.flash_deals FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

COMMENT ON TABLE public.flash_deals IS 'Ofertas flash con precio especial, cantidad limitada y timer configurable.';
