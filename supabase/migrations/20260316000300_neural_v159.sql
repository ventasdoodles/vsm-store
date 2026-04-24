-- CESARIN OS - WAVE 159 ENHANCEMENTS
-- Neural Sales Engine & Customer Memory

-- 1. Extend AI configurations with model parameters
ALTER TABLE public.ai_configs 
ADD COLUMN IF NOT EXISTS temperature DECIMAL DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS top_p DECIMAL DEFAULT 0.9;

-- 2. Customer Memory Layer (Brain Persistence)
CREATE TABLE IF NOT EXISTS public.ai_customer_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    detected_interests TEXT[], -- e.g., ['frutales', 'sales', 'menthol']
    last_recommendation TEXT,
    frustration_level INTEGER DEFAULT 0, -- 0-10 scale
    ticket_average DECIMAL(10,2) DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id)
);

-- Enable RLS for Customer Memory
ALTER TABLE public.ai_customer_memory ENABLE ROW LEVEL SECURITY;

-- Admins can see/manage everything
CREATE POLICY "Admins can manage customer memory"
ON public.ai_customer_memory
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER trigger_customer_memory_updated_at
BEFORE UPDATE ON public.ai_customer_memory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add Frustration Tracking to Analytics
ALTER TABLE public.ai_analytics 
ADD COLUMN IF NOT EXISTS frustration_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_logic_debug JSONB;
