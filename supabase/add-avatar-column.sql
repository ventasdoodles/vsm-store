-- ============================================================================
-- VSM Store: Add avatar_url column to customer_profiles
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Add the avatar_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='customer_profiles' AND column_name='avatar_url') THEN
        ALTER TABLE customer_profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. (Optional) Comment on the column
COMMENT ON COLUMN customer_profiles.avatar_url IS 'URL de la imagen de perfil del usuario (Supabase Storage bucket avatars)';
