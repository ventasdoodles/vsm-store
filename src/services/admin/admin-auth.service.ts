/**
 * // ─── ADMIN AUTH SERVICE ───
 * // Proposito: Gestion de permisos y verificacion de roles administrativos.
 * // Arquitectura: Security Layer (§1.1).
 * // Regla / Notas: Validacion estricta contra la tabla admin_users.
 */
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Verifica si un usuario tiene privilegios de administrador.
 * Optimizado para leer primero del JWT (app_metadata.role) con fallback a DB.
 * @param user Objeto de usuario de Supabase Auth
 * @returns boolean indicando si es admin confirmado.
 */
export async function checkIsAdmin(user: User): Promise<boolean> {
    // 1. JWT Fast Path
    const role = user.app_metadata?.role;
    if (role === 'admin' || role === 'super_admin') {
        return true;
    }

    // 2. DB Fallback Path
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .single();

    if (error || !data) return false;
    return true;
}
