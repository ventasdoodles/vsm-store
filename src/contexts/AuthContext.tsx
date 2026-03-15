/**
 * AuthContext.tsx - VSM Store
 * 
 * Contexto global de autenticaciÃ³n que gestiona el estado de Supabase Auth
 * y la carga del perfil extendido desde la tabla 'customer_profiles'.
 * 
 * @module contexts/AuthContext
 */
import { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as authService from '@/services';
import { useNotification } from '@/hooks/useNotification';
import type { CustomerProfile } from '@/types/customer';

// Re-export para consumers que importan desde AuthContext
export type { CustomerProfile } from '@/types/customer';

export interface AuthContextValue {
    user: User | null;
    profile: CustomerProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

// â”€â”€â”€ Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const AuthContext = createContext<AuthContextValue>({
    user: null,
    profile: null,
    loading: true,
    isAuthenticated: false,
    signUp: async () => { },
    signIn: async () => { },
    signOut: async () => { },
    resetPassword: async () => { },
    refreshProfile: async () => { },
});

// â”€â”€â”€ Provider â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<CustomerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { success: notifySuccess, info: notifyInfo } = useNotification();

    // Cargar perfil de customer_profiles
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const data = await authService.getCustomerProfile(userId);

            // Check Account Status (God Mode Enforcement)
            if (data?.account_status === 'banned') {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                return;
            }

            if (data?.account_status === 'suspended') {
                const now = new Date();
                const end = data.suspension_end ? new Date(data.suspension_end) : null;
                if (!end || now < end) {
                    await supabase.auth.signOut();
                    setUser(null);
                    setProfile(null);
                    return;
                }
            }

            setProfile(data ?? null);
        } catch (err) {
            console.error('Error cargando perfil:', err);
            setProfile(null);
        }
    }, []);

    // Escuchar cambios de auth
    useEffect(() => {
        // Obtener sesiÃ³n inicial
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await loadProfile(currentUser.id); // esperar perfil
            }
            setLoading(false); // â† false DESPUÃ‰S de tener perfil
        });

        // Suscribirse a cambios (NO async para no bloquear Supabase internals)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setLoading(false); // â† Always resolve auth immediately
                if (currentUser) {
                    loadProfile(currentUser.id); // fire-and-forget
                    // Sync wishlist: push local â†’ DB, then merge DB â†’ local
                    import('@/stores/wishlist.store').then(({ useWishlistStore }) => {
                        const store = useWishlistStore.getState();
                        store.syncToDb().then(() => store.loadFromDb()).catch(() => { });
                    });
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [loadProfile]);

    // â”€â”€â”€ Acciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSignUp = useCallback(async (
        email: string,
        password: string,
        fullName: string,
        phone?: string
    ) => {
        await authService.signUp(email, password, fullName, phone);
        notifySuccess('Â¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
    }, [notifySuccess]);

    const handleSignIn = useCallback(async (email: string, password: string) => {
        await authService.signIn(email, password);
        notifyInfo('SesiÃ³n iniciada', 'Bienvenido de nuevo a VSM Store.');
    }, [notifyInfo]);

    const handleSignOut = useCallback(async () => {
        await authService.signOut();
        setProfile(null);
        notifyInfo('SesiÃ³n cerrada', 'Has cerrado sesiÃ³n correctamente.');
    }, [notifyInfo]);

    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user.id);
    }, [user, loadProfile]);

    const handleResetPassword = useCallback(async (email: string) => {
        await authService.resetPassword(email);
    }, []);

    const value = useMemo(() => ({
        user,
        profile,
        loading,
        isAuthenticated: !!user,
        signUp: handleSignUp,
        signIn: handleSignIn,
        signOut: handleSignOut,
        resetPassword: handleResetPassword,
        refreshProfile,
    }), [user, profile, loading, handleSignUp, handleSignIn, handleSignOut, handleResetPassword, refreshProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

