// Auth Context - VSM Store
// Provee estado de autenticación global
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as authService from '@/services/auth.service';
import { useNotification } from '@/hooks/useNotification';

// ─── Types ────────────────────────────────────────
export interface CustomerProfile {
    id: string;
    full_name: string;
    phone: string | null;
    whatsapp: string | null;
    birthdate: string | null;
    customer_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    total_orders: number;
    total_spent: number;
    favorite_category_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthContextValue {
    user: User | null;
    profile: CustomerProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────
export const AuthContext = createContext<AuthContextValue>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    signUp: async () => { },
    signIn: async () => { },
    signOut: async () => { },
    refreshProfile: async () => { },
});

// ─── Provider ─────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { error: notifyError } = useNotification();

    // Cargar perfil de customer_profiles
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const data: any = await authService.getCustomerProfile(userId);

            // Check Account Status (God Mode Enforcement)
            if (data?.account_status === 'banned') {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                notifyError('Cuenta Baneada', 'Tu cuenta ha sido baneada permanentemente. Contacta a soporte.');
                return;
            }

            if (data?.account_status === 'suspended') {
                const now = new Date();
                const end = data.suspension_end ? new Date(data.suspension_end) : null;
                if (!end || now < end) {
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                    notifyError('Cuenta Suspendida', `Tu cuenta está suspendida hasta ${end ? end.toLocaleDateString() : 'indefinidamente'}.`);
                    return;
                }
            }

            setProfile(data as CustomerProfile | null);
        } catch (err) {
            console.error('Error cargando perfil:', err);
            setProfile(null);
        }
    }, []);

    // Escuchar cambios de auth
    useEffect(() => {
        // Obtener sesión inicial
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await loadProfile(currentUser.id); // esperar perfil
            }
            setLoading(false); // ← false DESPUÉS de tener perfil
        });

        // Suscribirse a cambios (NO async para no bloquear Supabase internals)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setLoading(false); // ← Always resolve auth immediately
                if (currentUser) {
                    loadProfile(currentUser.id); // fire-and-forget
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    // ─── Acciones ─────────────────────────────────
    const handleSignUp = useCallback(async (
        email: string,
        password: string,
        fullName: string,
        phone?: string
    ) => {
        await authService.signUp(email, password, fullName, phone);
    }, []);

    const handleSignIn = useCallback(async (email: string, password: string) => {
        await authService.signIn(email, password);
    }, []);

    const handleSignOut = useCallback(async () => {
        await authService.signOut();
        setProfile(null);
    }, []);

    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user.id);
    }, [user, loadProfile]);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        refreshProfile,
    }), [user, profile, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
