-- Migration: Real-time Monitoring & Error Logging
-- Description: Creates the app_logs table and enables presence for monitoring.

-- 1. Create App Logs table
CREATE TABLE IF NOT EXISTS public.app_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
    category TEXT NOT NULL, -- e.g., 'auth', 'cart', 'payment', 'runtime'
    message TEXT NOT NULL,
    details JSONB, -- For error stacks, context, etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    url TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indices for performance
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON public.app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON public.app_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_logs_category ON public.app_logs(category);

-- 3. RLS Policies
ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all logs
CREATE POLICY "Admins can view all app logs"
ON public.app_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Everyone (even anon) can insert logs (to capture errors before login)
CREATE POLICY "Anyone can insert app logs"
ON public.app_logs FOR INSERT
WITH CHECK (true);

-- 4. Presence handles through Supabase Realtime (no extra table needed)
-- But we need to make sure the app has a way to identify these as monitorable channels.
COMMENT ON TABLE public.app_logs IS 'System for capturing application errors and critical events.';
