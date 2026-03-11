/**
 * // ─── ADMIN AUTH SERVICE ───
 * // Proposito: Gestion de permisos y verificacion de roles administrativos.
 * // Arquitectura: Security Layer (§1.1).
 * // Regla / Notas: Validacion estricta contra la tabla admin_users.
 */
import { supabase } from '@/lib/supabase';

/**
 * Verifica si un usuario tiene privilegios de administrador.
 * @param userId ID del usuario de Supabase Auth.
 * @returns boolean indicando si es admin confirmado.
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', userId)
        .single();

    if (error || !data) return false;
    return true;
}
