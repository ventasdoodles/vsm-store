// Hook para monitoreo de la aplicación - VSM Store
import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    createPresenceChannel,
    trackPresenceActivity,
    unsubscribeChannel,
    logError,
} from '@/services/monitoring.service';
import { useAuth } from '@/hooks/useAuth';

export function useAppMonitoring() {
    const location = useLocation();
    const { user } = useAuth();
    const isAdmin = location.pathname.startsWith('/admin');
    
    // Key anónima estable para toda la sesión del browser
    const [anonKey] = useState(() => 'anon-' + Math.random().toString(36).substring(2, 9));
    
    // Ref para el canal de presencia (singleton por sesión/user)
    const channelRef = useRef<any>(null);

    // 1. Gestión del Canal (Solo se recrea si cambia el usuario o el modo admin)
    useEffect(() => {
        if (!isAdmin) {
            if (channelRef.current) {
                unsubscribeChannel(channelRef.current);
                channelRef.current = null;
            }
            return;
        }

        const presenceKey = user?.id || anonKey;
        
        // Evitar recrear si ya tenemos el canal correcto
        if (channelRef.current) return;

        const channel = createPresenceChannel(presenceKey, {
            email: user?.email || 'Anónimo',
            path: location.pathname,
            joined_at: new Date().toISOString(),
            session_start: Date.now(),
            last_active: Date.now(),
        });
        
        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                unsubscribeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [isAdmin, user?.id, anonKey]); // SIN location.pathname aquí

    // 2. Tracking de Actividad (Se dispara al cambiar de ruta, sin recrear el canal)
    useEffect(() => {
        if (!isAdmin || !channelRef.current) return;

        trackPresenceActivity(channelRef.current, {
            email: user?.email || 'Anónimo',
            path: location.pathname,
            joined_at: new Date().toISOString(), // Esto debería venir del estado inicial, pero track suele sobrescribir
            session_start: Date.now(),
            last_active: Date.now(),
        });
    }, [location.pathname, isAdmin, user?.email]);

    // 3. Captura de errores globales (Runtime)
    useEffect(() => {
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
