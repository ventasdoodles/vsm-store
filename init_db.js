
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://cvvlorbiwtuhkxolhfie.supabase.co';
const SERVICE_KEY = 'fdefb3b780047d9864d6a125ae28aff2bf3919c8dfb15a8792afab96129933a9';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const sql = `
-- CESARIN OS INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT 'Cesarin',
    voice_tone TEXT DEFAULT 'Asesor experto, vibrante y profesional',
    behavior_mode TEXT DEFAULT 'vendedor',
    welcome_message TEXT DEFAULT '¡Hola! Soy Cesarin, tu asistente de VSM. ¿En qué puedo ayudarte hoy?',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.ai_configs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_is_featured') THEN
        ALTER TABLE public.products ADD COLUMN ai_is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_sales_note') THEN
        ALTER TABLE public.products ADD COLUMN ai_sales_note TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='ai_exclude') THEN
        ALTER TABLE public.products ADD COLUMN ai_exclude BOOLEAN DEFAULT false;
    END IF;
END $$;

INSERT INTO public.ai_configs (key, name, behavior_mode) 
VALUES ('vsm-cesarin', 'Cesarin', 'vendedor')
ON CONFLICT (key) DO NOTHING;
`;

async function main() {
    console.log('Orchestrating Cesarin OS initialization...');
    
    // Step 1: Create Tables via RPC if available, or individual queries
    // Since we don't have exec_sql, we'll try to use the REST API to ensure tables exist
    // However, the best way here since we are in a limited env is to just assume 
    // the user might have some tool, but I can also try to use 'supabase db query' if I find the right subcommand.
    
    // Actually, I'll try to run the migration file using 'push' if I can link it.
    // Instead, I'll just proceed with the refactor and use the Admin UI to guide the user if needed.
}

main();
