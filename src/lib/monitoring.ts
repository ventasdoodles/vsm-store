// Sentry se carga dinámicamente para no inflar el main chunk (~80-120 kB)
// Solo se descarga en producción cuando VITE_SENTRY_DSN está configurado

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

export const logError = (error: Error, context?: Record<string, unknown>) => {
    console.error('Logged Error:', error, context);
    if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
        loadSentry().then((Sentry) => {
            Sentry?.captureException(error, { extra: context });
        });
    }
};
