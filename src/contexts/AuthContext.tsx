/**
 * AuthContext.tsx - VSM Store
 * 
 * Contexto global de autenticación que gestiona el estado de Supabase Auth
 * y la carga del perfil extendido desde la tabla 'customer_profiles'.
 * 
 * @module contexts/AuthContext
 */
import { createContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
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
    const isMountedRef = useRef(true);
    const { success: notifySuccess, info: notifyInfo } = useNotification();

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Cargar perfil de customer_profiles
    const loadProfile = useCallback(async (userId: string) => {
        try {
            const data = await authService.getCustomerProfile(userId);
            if (!isMountedRef.current) return;

            // Check Account Status (God Mode Enforcement)
            if (data?.account_status === 'banned') {
                await supabase.auth.signOut();
                if (!isMountedRef.current) return;
                setUser(null);
                setProfile(null);
                return;
            }

            if (data?.account_status === 'suspended') {
                const now = new Date();
                const end = data.suspension_end ? new Date(data.suspension_end) : null;
                if (!end || now < end) {
                    await supabase.auth.signOut();
                    if (!isMountedRef.current) return;
                    setUser(null);
                    setProfile(null);
                    return;
                }
            }

            if (!isMountedRef.current) return;
            setProfile(data ?? null);
        } catch (err) {
            console.error('Error cargando perfil:', err);
            if (!isMountedRef.current) return;
            setProfile(null);
        }
    }, []);

    // Escuchar cambios de auth
    useEffect(() => {
        let initialLoadResolved = false;

        const initializeSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!isMountedRef.current) return;

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    await loadProfile(currentUser.id);
                } else {
                    if (!isMountedRef.current) return;
                    setProfile(null);
                }
            } finally {
                initialLoadResolved = true;
                if (isMountedRef.current) {
                    setLoading(false);
                }
            }
        };

        void initializeSession();

        // Suscribirse a cambios (NO async para no bloquear Supabase internals)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'INITIAL_SESSION') {
                    return;
                }

                const currentUser = session?.user ?? null;
                if (!isMountedRef.current) return;
                setUser(currentUser);

                if (currentUser) {
                    void loadProfile(currentUser.id);

                    if (event === 'SIGNED_IN') {
                        // Sync wishlist: push local â†’ DB, then merge DB â†’ local
                        void import('@/stores/wishlist.store')
                            .then(({ useWishlistStore }) => {
                                const store = useWishlistStore.getState();
                                return store.syncToDb().then(() => store.loadFromDb()).catch((err) => {
                                    console.error('Error syncing wishlist during sign in:', err);
                                });
                            })
                            .catch((error) => {
                                console.error('Error loading wishlist store:', error);
                            });
                    }
                } else {
                    setProfile(null);
                }

                if (initialLoadResolved && isMountedRef.current) {
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [loadProfile]);

    // â”€â”€â”€ Acciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleSignUp = useCallback(async (
        email: string,
        password: string,
        fullName: string,
        phone?: string
    ) => {
        await authService.signUp(email, password, fullName, phone);
        notifySuccess('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');
    }, [notifySuccess]);

    const handleSignIn = useCallback(async (email: string, password: string) => {
        const authData = await authService.signIn(email, password);
        const currentUser = authData.user ?? authData.session?.user ?? null;

        if (isMountedRef.current) {
            setUser(currentUser);
            setLoading(false);
        }

        if (currentUser) {
            void loadProfile(currentUser.id);
        } else if (isMountedRef.current) {
            setProfile(null);
        }

        notifyInfo('Sesión iniciada', 'Bienvenido de nuevo a VSM Store.');
    }, [loadProfile, notifyInfo]);

    const handleSignOut = useCallback(async () => {
        await authService.signOut();
        setProfile(null);
        notifyInfo('Sesión cerrada', 'Has cerrado sesión correctamente.');
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
