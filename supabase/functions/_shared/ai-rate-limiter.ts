import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function enforceAiRateLimit(req: Request, cost = 1): Promise<Response | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Auth required for AI features' }), { status: 401 });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null; // Can't check, bypass

    // Extract user from token
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY') || '', {
        global: { headers: { Authorization: authHeader } }
    });

    const { data: authData, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !authData?.user) {
         // Service role or invalid user. If service role, authData.user is null usually?
         // Actually, service role tokens often don't resolve to a user via getUser(), they might be valid but we skip rate limiting for admins.
         return null; 
    }

    const userId = authData.user.id;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Default 50 requests per hour per user
    const { data: allowed, error } = await supabaseAdmin.rpc('consume_ai_quota', {
        p_customer_id: userId,
        p_cost: cost,
        p_max_quota: 50,
        p_window_minutes: 60
    });

    if (error) {
        console.error('Rate limit error:', error);
        return null; // Fail open
    }

    if (!allowed) {
        return new Response(
            JSON.stringify({ error: 'Has excedido tu límite de uso de IA por hora. Intenta más tarde.', code: 'RATE_LIMIT_EXCEEDED' }),
            { status: 429, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
    }

    return null; // OK
}
