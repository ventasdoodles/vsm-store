/**
 * // ─── INFRAESTRUCTURA: Supabase Client ───
 * // Arquitectura: API Gateway (Lego Master)
 * // Proposito principal: Instancia global del cliente Supabase con manejo de entorno seguro.
 * // Regla / Notas: Singleton. Incluye validadores de configuración para evitar crashes en runtime.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
    console.error('❌ Supabase no configurado. Faltan variables de entorno.');
}

// Create client or fallback to avoid crash
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder'); // Fallback to avoid import crash

