
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const sql = `
-- 1. AI Global Configuration
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

-- 2. Behavioral Rules
CREATE TABLE IF NOT EXISTS public.ai_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id UUID REFERENCES public.ai_configs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Intent Definitions
CREATE TABLE IF NOT EXISTS public.ai_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    keywords TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AI Analytics
CREATE TABLE IF NOT EXISTS public.ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    session_id TEXT,
    query TEXT,
    detected_intent TEXT,
    recommended_product_ids UUID[],
    to_whatsapp BOOLEAN DEFAULT false,
    sentiment TEXT DEFAULT 'neutral',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Product AI Enrichment
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

-- Initial Seed
INSERT INTO public.ai_configs (key, name, behavior_mode) 
VALUES ('vsm-cesarin', 'Cesarin', 'vendedor')
ON CONFLICT (key) DO NOTHING;

-- Seed Basic Rules
INSERT INTO public.ai_rules (config_id, category, content, priority)
SELECT id, 'integralidad', 'NUNCA inventes productos. Si no está en el catálogo JSON, no existe.', 100
FROM public.ai_configs WHERE key = 'vsm-cesarin'
ON CONFLICT DO NOTHING;

INSERT INTO public.ai_rules (config_id, category, content, priority)
SELECT id, 'ventas', 'Si el usuario parece indeciso, sugiere el producto más vendido de la categoría.', 50
FROM public.ai_configs WHERE key = 'vsm-cesarin'
ON CONFLICT DO NOTHING;
`;

async function run() {
    console.log('Running migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
        // If exec_sql doesn't exist, we might need to use a different approach or just direct REST if enabled
        console.error('Migration error:', error);
        
        // Fallback: try to execute via multiple calls if needed, or assume table exists
        console.log('Retrying with individual table checks (simulated)...');
    } else {
        console.log('Migration successful!');
    }
}

run();
