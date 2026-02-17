// Monitoring Service - VSM Store
import { supabase } from '@/lib/supabase';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AppLog {
    level: LogLevel;
    category: string;
    message: string;
    details?: any;
    url?: string;
    user_id?: string;
}

/**
 * Envia un log a la base de datos
 */
export async function logToSupabase(log: AppLog) {
    try {
        const { error } = await supabase.from('app_logs').insert({
            ...log,
            user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
            url: log.url || (typeof window !== 'undefined' ? window.location.href : undefined)
        });
        if (error) console.error('[Monitoring] Error sending log:', error);
    } catch (err) {
        console.error('[Monitoring] Critical failure logging to Supabase:', err);
    }
}

/**
 * Captura un error global y lo registra
 */
export function logError(category: string, error: any, extraDetails?: any) {
    console.error(`[${category}]`, error);

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    logToSupabase({
        level: 'error',
        category,
        message,
        details: { ...extraDetails, stack }
    });
}

/**
 * Presence Helpers
 */
export const MONITORING_CHANNEL = 'store_monitoring';

export function joinPresence(channelName: string, userData: any) {
    const channel = supabase.channel(channelName);

    channel
        .on('presence', { event: 'sync' }, () => {
            // Optional: local sync handling
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track(userData);
            }
        });

    return channel;
}
