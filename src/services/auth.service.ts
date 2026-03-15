/**
 * auth.service.ts - VSM Store
 * 
 * Capa de servicio para operaciones de autenticación y gestión de perfiles
 * interactuando directamente con Supabase Auth y Database.
 * 
 * @module services/auth.service
 */
import { supabase } from '@/lib/supabase';
import type { AIPreferences, IAContext, CustomerProfile } from '@/types/customer';

// ─── Sign Up ──────────────────────────────────────
export async function signUp(
    email: string,
    password: string,
    fullName?: string,
    phone?: string,
    ai_preferences?: AIPreferences,
    ia_context?: IAContext
) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, phone },
            emailRedirectTo: `${window.location.origin}/login`,
        },
    });

    if (error) throw error;

    // Crear perfil en customer_profiles
    if (data.user) {
        await createCustomerProfile(data.user.id, {
            full_name: fullName,
            phone: phone ?? null,
            whatsapp: phone ?? null,
            ai_preferences,
            ia_context
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
export async function getCustomerProfile(userId: string): Promise<CustomerProfile | null> {
    const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    return data as CustomerProfile | null;
}

// ─── Create Customer Profile ─────────────────────
export async function createCustomerProfile(
    userId: string,
    data: { 
        full_name?: string | null; 
        phone: string | null; 
        whatsapp: string | null;
        ai_preferences?: AIPreferences;
        ia_context?: IAContext;
    }
) {
    const { error } = await supabase
        .from('customer_profiles')
        .upsert({
            id: userId,
            ...data
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
        avatar_url?: string;
        ia_context?: IAContext;
    }
) {
    const { error } = await supabase
        .from('customer_profiles')
        .upsert({ id: userId, ...data });

    if (error) throw error;
}
