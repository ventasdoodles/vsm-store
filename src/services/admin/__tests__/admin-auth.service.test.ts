// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { User } from '@supabase/supabase-js';

const fromMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
  },
}));

import { checkIsAdmin } from '../admin-auth.service';

describe('admin-auth.service (checkIsAdmin)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns false safely when user is null or undefined', async () => {
    expect(await checkIsAdmin(null)).toBe(false);
    expect(await checkIsAdmin(undefined)).toBe(false);
    expect(await checkIsAdmin({} as User)).toBe(false);
  });

  it('returns true on JWT fast path when app_metadata.role is admin without DB query', async () => {
    const adminUser = {
      id: 'admin-uuid-1',
      app_metadata: { role: 'admin' },
    } as unknown as User;

    const result = await checkIsAdmin(adminUser);
    expect(result).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('returns true on JWT fast path when app_metadata.role is super_admin without DB query', async () => {
    const superAdminUser = {
      id: 'super-admin-uuid-1',
      app_metadata: { role: 'super_admin' },
    } as unknown as User;

    const result = await checkIsAdmin(superAdminUser);
    expect(result).toBe(true);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('falls back to DB when app_metadata has no admin role and queries admin_users', async () => {
    const normalUser = {
      id: 'user-uuid-123',
      app_metadata: { role: 'authenticated' },
    } as unknown as User;

    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: { id: 'user-uuid-123', role: 'admin' },
      error: null,
    });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await checkIsAdmin(normalUser);

    expect(result).toBe(true);
    expect(fromMock).toHaveBeenCalledWith('admin_users');
    expect(selectMock).toHaveBeenCalledWith('id, role');
    expect(eqMock).toHaveBeenCalledWith('id', 'user-uuid-123');
  });

  it('returns false when DB query returns no matching admin user row', async () => {
    const normalUser = {
      id: 'user-uuid-non-admin',
      app_metadata: {},
    } as unknown as User;

    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await checkIsAdmin(normalUser);

    expect(result).toBe(false);
    expect(fromMock).toHaveBeenCalledWith('admin_users');
  });

  it('returns false gracefully when DB query returns an error', async () => {
    const normalUser = {
      id: 'user-uuid-error',
      app_metadata: {},
    } as unknown as User;

    const maybeSingleMock = vi.fn().mockResolvedValue({
      data: null,
      error: new Error('Database connection failed'),
    });
    const eqMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    fromMock.mockReturnValue({ select: selectMock });

    const result = await checkIsAdmin(normalUser);

    expect(result).toBe(false);
  });
});
