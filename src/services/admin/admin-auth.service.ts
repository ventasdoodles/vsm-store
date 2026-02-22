// ─── Admin Auth Service ──────────────────────────
import { supabase } from '@/lib/supabase';

export async function checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', userId)
        .single();

    if (error || !data) return false;
    return true;
}
