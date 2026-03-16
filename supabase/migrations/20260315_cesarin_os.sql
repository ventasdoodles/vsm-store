-- CESARIN OS INFRASTRUCTURE (Wave 158)
-- Modular AI Operating System for VSM Store

-- 1. AI Global Configuration
CREATE TABLE IF NOT EXISTS public.ai_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL, -- e.g., 'vsm-cesarin'
    name TEXT DEFAULT 'Cesarin',
    voice_tone TEXT DEFAULT 'Asesor experto, vibrante y profesional',
    behavior_mode TEXT DEFAULT 'vendedor', -- 'vendedor', 'informativo', 'soporte'
    welcome_message TEXT DEFAULT '¡Hola! Soy Cesarin, tu asistente de VSM. ¿En qué puedo ayudarte hoy?',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Behavioral Rules
CREATE TABLE IF NOT EXISTS public.ai_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES public.ai_configs(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'integralidad', 'personalidad', 'logistica', 'ventas'
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Intent Definitions (Classification Layer)
CREATE TABLE IF NOT EXISTS public.ai_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- 'search', 'recommendation', 'support', 'info'
    description TEXT,
    keywords TEXT[], -- array of triggering keywords for pre-parsing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. AI Interaction Logs (Analytics Layer)
CREATE TABLE IF NOT EXISTS public.ai_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    query TEXT,
    detected_intent TEXT,
    recommended_product_ids UUID[],
    to_whatsapp BOOLEAN DEFAULT false,
    sentiment TEXT DEFAULT 'neutral',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Product AI Enrichment
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS ai_is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_sales_note TEXT,
ADD COLUMN IF NOT EXISTS ai_exclude BOOLEAN DEFAULT false;

-- Initial Seed for Cesarin
INSERT INTO public.ai_configs (key, name, behavior_mode) 
VALUES ('vsm-cesarin', 'Cesarin', 'vendedor')
ON CONFLICT (key) DO NOTHING;

-- Seed Basic Rules
INSERT INTO public.ai_rules (config_id, category, content, priority)
SELECT id, 'integralidad', 'NUNCA inventes productos. Si no está en el catálogo JSON, no existe.', 100
FROM public.ai_configs WHERE key = 'vsm-cesarin'
UNION ALL
SELECT id, 'ventas', 'Si el usuario parece indeciso, sugiere el producto más vendido de la categoría.', 50
FROM public.ai_configs WHERE key = 'vsm-cesarin';

-- Seed Intents
INSERT INTO public.ai_intents (name, keywords) VALUES 
('search', ARRAY['buscar', 'tienes', 'vendes', 'hay']),
('support', ARRAY['ayuda', 'soporte', 'falla', 'problema', 'envío', 'pago']);
