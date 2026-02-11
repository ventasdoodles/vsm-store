// Servicio de autenticación - VSM Store
import { supabase } from '@/lib/supabase';

// ─── Sign Up ──────────────────────────────────────
export async function signUp(
    email: string,
    password: string,
    fullName: string,
    phone?: string
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, phone },
        },
    });

    if (error) throw error;

    // Crear perfil en customer_profiles
    if (data.user) {
        await createCustomerProfile(data.user.id, {
            full_name: fullName,
            phone: phone ?? null,
            whatsapp: phone ?? null,
        });
    }

    return data;
}

// ─── Sign In ──────────────────────────────────────
export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    return data;
}

// ─── Sign Out ─────────────────────────────────────
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// ─── Reset Password ──────────────────────────────
export async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
}

// ─── Get Current User ────────────────────────────
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
}

// ─── Get Customer Profile ────────────────────────
export async function getCustomerProfile(userId: string) {
    const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
}

// ─── Create Customer Profile ─────────────────────
export async function createCustomerProfile(
    userId: string,
    data: { full_name: string; phone: string | null; whatsapp: string | null }
) {
    const { error } = await supabase
        .from('customer_profiles')
        .upsert({
            id: userId,
            full_name: data.full_name,
            phone: data.phone,
            whatsapp: data.whatsapp,
        });

    if (error) {
        console.error('Error creando perfil:', error);
        // No lanzar error para no bloquear signup si la tabla no existe aún
    }
}

// ─── Update Profile ──────────────────────────────
export async function updateProfile(
    userId: string,
    data: {
        full_name?: string;
        phone?: string;
        whatsapp?: string;
        birthdate?: string;
    }
) {
    const { error } = await supabase
        .from('customer_profiles')
        .update(data)
        .eq('id', userId);

    if (error) throw error;
}
