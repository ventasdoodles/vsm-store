// Monitoring Service - VSM Store
import { supabase } from '@/lib/supabase';

// Sentry se carga dinámicamente para no inflar el main chunk (~80-120 kB)
let sentryModule: typeof import('@sentry/react') | null = null;

const loadSentry = async () => {
    if (!sentryModule && import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        sentryModule = await import('@sentry/react');
    }
    return sentryModule;
};

export const initMonitoring = () => {
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        loadSentry().then((Sentry) => {
            if (!Sentry) return;
            Sentry.init({
                dsn: import.meta.env.VITE_SENTRY_DSN,
                integrations: [
                    Sentry.browserTracingIntegration(),
                ],
                tracesSampleRate: 1.0,
            });
        });
    }
};

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface AppLog {
    level: LogLevel;
    category: string;
    message: string;
    details?: Record<string, unknown>;
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
 * Captura un error global y lo registra (en Sentry y Supabase)
 */
export function logError(category: string, error: unknown, extraDetails?: Record<string, unknown>) {
    console.error(`[${category}]`, error);

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    // Supabase
    logToSupabase({
        level: 'error',
        category,
        message,
        details: { ...extraDetails, stack }
    });

    // Sentry
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        loadSentry().then((Sentry) => {
            Sentry?.captureException(error, { tags: { category }, extra: extraDetails });
        });
    }
}

/**
 * Presence Helpers
 */
export const MONITORING_CHANNEL = 'store_monitoring';

/**
 * Crea y suscribe un canal de Presence para monitoreo.
 * Devuelve el canal para poder hacer unsubscribe.
 */
export function createPresenceChannel(
    presenceKey: string,
    initialData: Record<string, unknown>,
) {
    const channel = supabase.channel(MONITORING_CHANNEL, {
        config: {
            presence: { key: presenceKey },
        },
    });

    channel
        .on('presence', { event: 'sync' }, () => {
            // Sincronización realizada
        })
        .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.track(initialData);
            }
        });

    return channel;
}

/**
 * Actualiza la actividad de un canal existente (si está en estado 'joined').
 */
export async function trackPresenceActivity(
    channel: ReturnType<typeof supabase.channel>,
    data: Record<string, unknown>,
) {
    if (channel.state === 'joined') {
        await channel.track(data);
    }
}

/**
 * Desuscribe un canal de Presence.
 */
export function unsubscribeChannel(channel: ReturnType<typeof supabase.channel>) {
    channel.unsubscribe();
}
