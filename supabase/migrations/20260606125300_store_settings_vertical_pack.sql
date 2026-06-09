-- Migration: Add vertical_pack_config to store_settings
-- Created at: 2026-06-06 12:53:00

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS vertical_pack_config JSONB;

-- Comment for the column
COMMENT ON COLUMN public.store_settings.vertical_pack_config IS 'Holds the runtime configuration for the store vertical pack (sections, taxonomies, attributes).';
