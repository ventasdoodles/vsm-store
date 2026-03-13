import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook useEmergencyMode
 * Detects backend (Supabase) failures and triggers a global "Safe Mode".
 * Part of Wave 80 - Sales Shielding.
 */
export function useEmergencyMode() {
    const [isEmergency, setIsEmergency] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    const checkHealth = useCallback(async () => {
        try {
            // Heartbeat: check connection to a small, public table
            const { error } = await supabase.from('categories').select('id', { count: 'exact', head: true }).limit(1);
            
            if (error) {
                console.error('[HealthCheck] Supabase error:', error);
                throw error;
            }

            // Recovery: If it was in emergency, reset it
            if (isEmergency) {
                if (import.meta.env.DEV) console.warn('[HealthCheck] System recovered.');
                setIsEmergency(false);
                setErrorCount(0);
            }
        } catch (_err) {
            const nextCount = errorCount + 1;
            setErrorCount(nextCount);
            
            // Threshold: 3 consecutive failures triggers Emergency Mode
            if (nextCount >= 3 && !isEmergency) {
                console.warn('[HealthCheck] Threshold reached. ACTIVATING EMERGENCY MODE.', _err);
                setIsEmergency(true);
            }
        }
    }, [errorCount, isEmergency]);

    useEffect(() => {
        // Initial check
        checkHealth();

        // Interval check every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    return { isEmergency, checkHealth };
}
