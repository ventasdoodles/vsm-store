import { StrictMode, type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import type { CustomerProfile } from '@/types/customer';

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const signOutSessionMock = vi.fn();

const signInMock = vi.fn();
const signUpMock = vi.fn();
const signOutMock = vi.fn();
const resetPasswordMock = vi.fn();
const getCustomerProfileMock = vi.fn();

const notifySuccessMock = vi.fn();
const notifyInfoMock = vi.fn();

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args: unknown[]) => getSessionMock(...args),
            onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
            signOut: (...args: unknown[]) => signOutSessionMock(...args),
        },
    },
}));

vi.mock('@/services', () => ({
    signIn: (...args: unknown[]) => signInMock(...args),
    signUp: (...args: unknown[]) => signUpMock(...args),
    signOut: (...args: unknown[]) => signOutMock(...args),
    resetPassword: (...args: unknown[]) => resetPasswordMock(...args),
    getCustomerProfile: (...args: unknown[]) => getCustomerProfileMock(...args),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: notifySuccessMock,
        info: notifyInfoMock,
        warning: vi.fn(),
        error: vi.fn(),
    }),
}));

function createProfile(overrides: Partial<CustomerProfile> = {}): CustomerProfile {
    return {
        id: 'user-1',
        email: 'cliente@vsm.test',
        full_name: 'Cliente VSM',
        phone: null,
        whatsapp: null,
        birthdate: null,
        tier: 'bronze',
        account_status: 'active',
        suspension_end: null,
        total_orders: 0,
        total_spent: 0,
        avatar_url: null,
        favorite_category_id: null,
        points: 0,
        referral_code: null,
        referred_by: null,
        ai_preferences: null,
        ia_context: null,
        created_at: '2026-03-25T00:00:00.000Z',
        updated_at: '2026-03-25T00:00:00.000Z',
        ...overrides,
    };
}

function createUser() {
    return {
        id: 'user-1',
        email: 'cliente@vsm.test',
    };
}

function wrapper({ children }: { children: ReactNode }) {
    return (
        <StrictMode>
            <AuthProvider>{children}</AuthProvider>
        </StrictMode>
    );
}

describe('AuthProvider', () => {
    beforeEach(() => {
        getSessionMock.mockReset();
        onAuthStateChangeMock.mockReset();
        signOutSessionMock.mockReset();
        signInMock.mockReset();
        signUpMock.mockReset();
        signOutMock.mockReset();
        resetPasswordMock.mockReset();
        getCustomerProfileMock.mockReset();
        notifySuccessMock.mockReset();
        notifyInfoMock.mockReset();

        onAuthStateChangeMock.mockImplementation(() => ({
            data: {
                subscription: {
                    unsubscribe: vi.fn(),
                },
            },
        }));
    });

    it('restores the persisted session during StrictMode bootstrap instead of staying unresolved', async () => {
        const user = createUser();
        getSessionMock.mockResolvedValue({
            data: {
                session: {
                    user,
                },
            },
        });
        getCustomerProfileMock.mockResolvedValue(createProfile());

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user?.id).toBe('user-1');
        expect(result.current.isAuthenticated).toBe(true);
        expect(getSessionMock).toHaveBeenCalled();
        expect(getCustomerProfileMock).toHaveBeenCalledWith('user-1');
    });

    it('hydrates user immediately from the resolved sign-in result under StrictMode', async () => {
        getSessionMock.mockResolvedValue({
            data: {
                session: null,
            },
        });
        getCustomerProfileMock.mockResolvedValue(createProfile());
        signInMock.mockResolvedValue({
            user: createUser(),
            session: {
                user: createUser(),
            },
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.signIn('cliente@vsm.test', 'secret');
        });

        await waitFor(() => {
            expect(result.current.isAuthenticated).toBe(true);
        });

        expect(result.current.user?.id).toBe('user-1');
        expect(notifyInfoMock).toHaveBeenCalledTimes(1);
        expect(notifyInfoMock.mock.calls[0]?.[1]).toBe('Bienvenido de nuevo a VSM Store.');
        expect(getCustomerProfileMock).toHaveBeenCalledWith('user-1');
    });
});
