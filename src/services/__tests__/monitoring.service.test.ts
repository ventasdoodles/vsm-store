// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from 'vitest';

const fromMock = vi.hoisted(() => vi.fn());
const channelMock = vi.hoisted(() => vi.fn());
const removeChannelMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: fromMock,
    channel: channelMock,
    removeChannel: removeChannelMock,
  },
}));

import {
  MONITORING_CHANNEL,
  subscribeToMonitoringPresence,
  getAppLogs,
  logToSupabase,
  trackPresenceActivity,
  unsubscribeChannel,
  type ActiveMonitoringUser,
} from '../monitoring.service';

describe('monitoring.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    removeChannelMock.mockResolvedValue('ok');
  });

  describe('subscribeToMonitoringPresence', () => {
    it('subscribes to channel and dispatches presence sync events to callback', async () => {
      let syncHandler: (() => Promise<void>) | undefined;
      const unsubscribeMock = vi.fn();
      const subscribeMock = vi.fn().mockImplementation((cb) => {
        if (cb) cb('SUBSCRIBED');
      });

      const presenceStateMock = vi.fn().mockReturnValue({
        'user-key-1': [
          {
            email: 'admin@vsm.test',
            path: '/admin/orders',
            joined_at: '2026-10-24T00:00:00.000Z',
            session_start: 1700000000000,
            last_active: 1700000060000,
          },
        ],
      });

      const onMock = vi.fn().mockImplementation((event, filter, handler) => {
        if (event === 'presence' && filter?.event === 'sync') {
          syncHandler = handler;
        }
        return channelObj;
      });

      const channelObj = {
        on: onMock,
        subscribe: subscribeMock,
        unsubscribe: unsubscribeMock,
        presenceState: presenceStateMock,
      };

      channelMock.mockReturnValue(channelObj);

      const onSync = vi.fn();
      const onError = vi.fn();

      const cleanup = subscribeToMonitoringPresence(onSync, onError);

      expect(channelMock).toHaveBeenCalledWith(MONITORING_CHANNEL);
      expect(onMock).toHaveBeenCalledWith('presence', { event: 'sync' }, expect.any(Function));
      expect(subscribeMock).toHaveBeenCalled();

      // Trigger sync
      expect(syncHandler).toBeDefined();
      await syncHandler!();

      expect(onSync).toHaveBeenCalledTimes(1);
      const syncedUsers = onSync.mock.calls[0]?.[0] as ActiveMonitoringUser[];
      expect(syncedUsers).toHaveLength(1);
      expect(syncedUsers[0]).toEqual({
        id: 'user-key-1',
        email: 'admin@vsm.test',
        path: '/admin/orders',
        joined_at: '2026-10-24T00:00:00.000Z',
        session_start: 1700000000000,
        last_active: 1700000060000,
      });

      // Cleanup
      cleanup();
      expect(removeChannelMock).toHaveBeenCalledWith(channelObj);

      // Trigger sync after cleanup: should not dispatch
      await syncHandler!();
      expect(onSync).toHaveBeenCalledTimes(1);
    });

    it('defaults email to Anonimo when not provided in presence state', async () => {
      let syncHandler: (() => Promise<void>) | undefined;
      const channelObj = {
        on: vi.fn().mockImplementation((_event, _filter, handler) => {
          syncHandler = handler;
          return channelObj;
        }),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
        presenceState: vi.fn().mockReturnValue({
          'anon-user': [{}],
        }),
      };
      channelMock.mockReturnValue(channelObj);

      const onSync = vi.fn();
      subscribeToMonitoringPresence(onSync);

      await syncHandler!();
      expect(onSync).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'anon-user',
          email: 'Anonimo',
          path: '/',
        }),
      ]);
    });

    it('catches async rejections from onSync and routes safely to onError', async () => {
      let syncHandler: (() => Promise<void>) | undefined;
      const channelObj = {
        on: vi.fn().mockImplementation((_event, _filter, handler) => {
          syncHandler = handler;
          return channelObj;
        }),
        subscribe: vi.fn().mockReturnThis(),
        unsubscribe: vi.fn(),
        presenceState: vi.fn().mockReturnValue({
          'u-1': [{ email: 'u1@vsm.test' }],
        }),
      };
      channelMock.mockReturnValue(channelObj);

      const asyncError = new Error('Async handler exploded');
      const onSync = vi.fn().mockRejectedValue(asyncError);
      const onError = vi.fn().mockResolvedValue(undefined);

      subscribeToMonitoringPresence(onSync, onError);

      await syncHandler!();
      expect(onError).toHaveBeenCalledWith(asyncError);
    });

    it('reports CHANNEL_ERROR and TIMED_OUT subscription statuses to onError', () => {
      let statusCallback: ((status: string) => void) | undefined;
      const channelObj = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockImplementation((cb) => {
          statusCallback = cb;
        }),
        unsubscribe: vi.fn(),
      };
      channelMock.mockReturnValue(channelObj);

      const onError = vi.fn();
      subscribeToMonitoringPresence(vi.fn(), onError);

      expect(statusCallback).toBeDefined();
      statusCallback!('CHANNEL_ERROR');
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('CHANNEL_ERROR'),
      }));

      statusCallback!('TIMED_OUT');
      expect(onError).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('TIMED_OUT'),
      }));
    });
  });

  describe('getAppLogs', () => {
    it('fetches system logs with explicit selector and order limit', async () => {
      const mockLogs = [
        { id: '1', level: 'error', message: 'Test error', created_at: '2026-10-24T00:00:00Z' },
      ];

      const limitMock = vi.fn().mockResolvedValue({ data: mockLogs, error: null });
      const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      fromMock.mockReturnValue({ select: selectMock });

      const logs = await getAppLogs(25);

      expect(fromMock).toHaveBeenCalledWith('app_logs');
      expect(selectMock).toHaveBeenCalledWith('id, created_at, level, category, message, details, url, user_id, user_agent');
      expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(limitMock).toHaveBeenCalledWith(25);
      expect(logs).toEqual(mockLogs);
    });

    it('throws when log query fails', async () => {
      const limitMock = vi.fn().mockResolvedValue({ data: null, error: new Error('Query failed') });
      const orderMock = vi.fn().mockReturnValue({ limit: limitMock });
      const selectMock = vi.fn().mockReturnValue({ order: orderMock });
      fromMock.mockReturnValue({ select: selectMock });

      await expect(getAppLogs()).rejects.toThrow('Query failed');
    });
  });

  describe('logToSupabase', () => {
    it('inserts log payload into app_logs table', async () => {
      const insertMock = vi.fn().mockResolvedValue({ error: null });
      fromMock.mockReturnValue({ insert: insertMock });

      await logToSupabase({
        level: 'info',
        category: 'checkout',
        message: 'Order created',
      });

      expect(fromMock).toHaveBeenCalledWith('app_logs');
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          category: 'checkout',
          message: 'Order created',
        })
      );
    });
  });

  describe('trackPresenceActivity & unsubscribeChannel', () => {
    it('tracks activity when channel state is joined', async () => {
      const trackMock = vi.fn().mockResolvedValue('ok');
      const mockChannel = {
        state: 'joined',
        track: trackMock,
        unsubscribe: vi.fn(),
      } as any;

      await trackPresenceActivity(mockChannel, { active: true });
      expect(trackMock).toHaveBeenCalledWith({ active: true });
    });

    it('does not track activity when channel state is not joined', async () => {
      const trackMock = vi.fn();
      const mockChannel = {
        state: 'closed',
        track: trackMock,
        unsubscribe: vi.fn(),
      } as any;

      await trackPresenceActivity(mockChannel, { active: true });
      expect(trackMock).not.toHaveBeenCalled();
    });

    it('calls removeChannel on unsubscribeChannel', () => {
      const mockChannel = {
        unsubscribe: vi.fn(),
      } as any;

      unsubscribeChannel(mockChannel);
      expect(removeChannelMock).toHaveBeenCalledWith(mockChannel);
    });
  });
});
