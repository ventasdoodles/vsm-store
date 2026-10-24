// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

const signUpMock = vi.hoisted(() => vi.fn());
const signInWithPasswordMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());
const resetPasswordForEmailMock = vi.hoisted(() => vi.fn());
const getUserMock = vi.hoisted(() => vi.fn());
const getSessionMock = vi.hoisted(() => vi.fn());
const onAuthStateChangeMock = vi.hoisted(() => vi.fn());
const fromMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signUp: signUpMock,
            signInWithPassword: signInWithPasswordMock,
            signOut: signOutMock,
            resetPasswordForEmail: resetPasswordForEmailMock,
            getUser: getUserMock,
            getSession: getSessionMock,
            onAuthStateChange: onAuthStateChangeMock,
        },
        from: fromMock,
    },
}));

import {
    signUp,
    signIn,
    signOut,
    resetPassword,
    getCurrentUser,
    getAuthSession,
    onAuthStateChange,
    getCustomerProfile,
    createCustomerProfile,
    updateProfile,
} from '../auth.service';

describe('auth.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('signUp', () => {
        it('signs up user and creates customer profile when user object is returned', async () => {
            signUpMock.mockResolvedValue({
                data: { user: { id: 'user-new-1', email: 'test@vsm.mx' } },
                error: null,
            });
            const upsertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ upsert: upsertMock });

            const result = await signUp('test@vsm.mx', 'password123', 'Juan Perez', '7441112233');

            expect(signUpMock).toHaveBeenCalledWith({
                email: 'test@vsm.mx',
                password: 'password123',
                options: {
                    data: { full_name: 'Juan Perez', phone: '7441112233' },
                    emailRedirectTo: expect.stringMatching(/\/login$/),
                },
            });
            expect(fromMock).toHaveBeenCalledWith('customer_profiles');
            expect(upsertMock).toHaveBeenCalledWith({
                id: 'user-new-1',
                full_name: 'Juan Perez',
                phone: '7441112233',
                whatsapp: '7441112233',
                ai_preferences: undefined,
                ia_context: undefined,
            });
            expect(result.user?.id).toBe('user-new-1');
        });

        it('throws error when signUp fails', async () => {
            signUpMock.mockResolvedValue({
                data: { user: null },
                error: new Error('User already exists'),
            });

            await expect(signUp('existing@vsm.mx', 'pass')).rejects.toThrow('User already exists');
        });
    });

    describe('signIn', () => {
        it('signs in with email and password', async () => {
            signInWithPasswordMock.mockResolvedValue({
                data: { user: { id: 'u-1' }, session: { access_token: 'tok' } },
                error: null,
            });

            const result = await signIn('test@vsm.mx', 'secret');
            expect(signInWithPasswordMock).toHaveBeenCalledWith({
                email: 'test@vsm.mx',
                password: 'secret',
            });
            expect(result.user?.id).toBe('u-1');
        });

        it('throws on sign in failure', async () => {
            signInWithPasswordMock.mockResolvedValue({
                data: null,
                error: new Error('Invalid credentials'),
            });

            await expect(signIn('bad@vsm.mx', 'wrong')).rejects.toThrow('Invalid credentials');
        });
    });

    describe('signOut', () => {
        it('calls supabase.auth.signOut successfully', async () => {
            signOutMock.mockResolvedValue({ error: null });
            await signOut();
            expect(signOutMock).toHaveBeenCalled();
        });

        it('throws if signOut returns an error', async () => {
            signOutMock.mockResolvedValue({ error: new Error('Signout failed') });
            await expect(signOut()).rejects.toThrow('Signout failed');
        });
    });

    describe('resetPassword', () => {
        it('calls resetPasswordForEmail with redirect URL', async () => {
            resetPasswordForEmailMock.mockResolvedValue({ error: null });
            await resetPassword('user@vsm.mx');
            expect(resetPasswordForEmailMock).toHaveBeenCalledWith('user@vsm.mx', {
                redirectTo: expect.stringMatching(/\/login$/),
            });
        });

        it('throws if reset password fails', async () => {
            resetPasswordForEmailMock.mockResolvedValue({ error: new Error('Email not found') });
            await expect(resetPassword('invalid@vsm.mx')).rejects.toThrow('Email not found');
        });
    });

    describe('getCurrentUser', () => {
        it('returns user when authenticated', async () => {
            getUserMock.mockResolvedValue({
                data: { user: { id: 'auth-user-1', email: 'auth@vsm.mx' } },
                error: null,
            });

            const user = await getCurrentUser();
            expect(user?.id).toBe('auth-user-1');
        });

        it('returns null when error occurs', async () => {
            getUserMock.mockResolvedValue({
                data: null,
                error: new Error('Auth session missing'),
            });

            const user = await getCurrentUser();
            expect(user).toBeNull();
        });

        it('returns null when rejection occurs', async () => {
            getUserMock.mockRejectedValue(new Error('Network error'));
            const user = await getCurrentUser();
            expect(user).toBeNull();
        });
    });

    describe('getAuthSession', () => {
        it('returns session when present', async () => {
            const mockSession = { user: { id: 'session-user-1' } };
            getSessionMock.mockResolvedValue({
                data: { session: mockSession },
                error: null,
            });

            const session = await getAuthSession();
            expect(session).toEqual(mockSession);
        });

        it('returns null when error occurs or session is missing', async () => {
            getSessionMock.mockResolvedValue({
                data: { session: null },
                error: null,
            });

            const session = await getAuthSession();
            expect(session).toBeNull();
        });

        it('returns null on promise rejection', async () => {
            getSessionMock.mockRejectedValue(new Error('Storage failure'));
            const session = await getAuthSession();
            expect(session).toBeNull();
        });
    });

    describe('onAuthStateChange', () => {
        it('subscribes callback and returns subscription object with unsubscribe', () => {
            const unsubscribeMock = vi.fn();
            onAuthStateChangeMock.mockReturnValue({
                data: {
                    subscription: {
                        unsubscribe: unsubscribeMock,
                    },
                },
            });

            const cb = vi.fn();
            const sub = onAuthStateChange(cb);

            expect(onAuthStateChangeMock).toHaveBeenCalledWith(cb);
            expect(sub).toBeDefined();
            sub.unsubscribe();
            expect(unsubscribeMock).toHaveBeenCalled();
        });
    });

    describe('getCustomerProfile', () => {
        it('queries customer_profiles with explicit selector and returns single record', async () => {
            const mockProfile = { id: 'u-1', email: 'p@vsm.mx', tier: 'gold' };
            const maybeSingleMock = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const profile = await getCustomerProfile('u-1');

            expect(fromMock).toHaveBeenCalledWith('customer_profiles');
            expect(selectMock).toHaveBeenCalledWith(expect.stringContaining('id, email, full_name'));
            expect(eqMock).toHaveBeenCalledWith('id', 'u-1');
            expect(profile).toEqual(mockProfile);
        });

        it('returns null when query errors', async () => {
            const maybeSingleMock = vi.fn().mockResolvedValue({
                data: null,
                error: new Error('DB error'),
            });
            const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
            const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
            fromMock.mockReturnValue({ select: selectMock });

            const profile = await getCustomerProfile('u-err');
            expect(profile).toBeNull();
        });
    });

    describe('createCustomerProfile', () => {
        it('upserts customer profile payload without throwing even on error', async () => {
            const upsertMock = vi.fn().mockResolvedValue({ error: new Error('Table issue') });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await expect(
                createCustomerProfile('u-1', {
                    phone: '123',
                    whatsapp: '123',
                })
            ).resolves.not.toThrow();

            expect(fromMock).toHaveBeenCalledWith('customer_profiles');
        });
    });

    describe('updateProfile', () => {
        it('upserts updated profile fields', async () => {
            const upsertMock = vi.fn().mockResolvedValue({ error: null });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await updateProfile('u-1', { full_name: 'Juanito' });

            expect(fromMock).toHaveBeenCalledWith('customer_profiles');
            expect(upsertMock).toHaveBeenCalledWith({ id: 'u-1', full_name: 'Juanito' });
        });

        it('throws on update error', async () => {
            const upsertMock = vi.fn().mockResolvedValue({ error: new Error('Update failed') });
            fromMock.mockReturnValue({ upsert: upsertMock });

            await expect(updateProfile('u-1', { full_name: 'Juanito' })).rejects.toThrow('Update failed');
        });
    });
});
