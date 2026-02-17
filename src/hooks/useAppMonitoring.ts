// Hook para monitoreo de la aplicación - VSM Store
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { MONITORING_CHANNEL, logError } from '@/services/monitoring.service';
import { useAuth } from '@/hooks/useAuth';

export function useAppMonitoring() {
    const location = useLocation();
    const { user } = useAuth();

    // Key anónima estable para toda la sesión del browser
    const anonKey = useRef<string>(
        'anon-' + Math.random().toString(36).substring(2, 9)
    );

    useEffect(() => {
        const presenceKey = user?.id || anonKey.current;

        // 1. Configurar tracking en tiempo real (Presence)
        const channel = supabase.channel(MONITORING_CHANNEL, {
            config: {
                presence: {
                    key: presenceKey,
                },
            },
        });

        const startTime = Date.now();

        channel
            .on('presence', { event: 'sync' }, () => {
                // Sincronización realizada
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        email: user?.email || 'Anónimo',
                        path: location.pathname,
                        joined_at: new Date().toISOString(),
                        session_start: startTime,
                        last_active: Date.now()
                    });
                }
            });

        // Actualizar actividad cada vez que cambia la ruta
        const updateActivity = async () => {
            if (channel.state === 'joined') {
                await channel.track({
                    email: user?.email || 'Anónimo',
                    path: location.pathname,
                    joined_at: new Date(startTime).toISOString(),
                    session_start: startTime,
                    last_active: Date.now()
                });
            }
        };

        updateActivity();

        return () => {
            channel.unsubscribe();
        };
    }, [location.pathname, user?.id, user?.email]);

    useEffect(() => {
        // 2. Captura de errores globales (Runtime)
        const handleError = (event: ErrorEvent) => {
            logError('runtime', event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno
            });
        };

        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            logError('promise_rejection', event.reason);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);
}
