import { useState, useEffect, useCallback, useMemo } from 'react';
import { checkBackendHealth } from '@/services/settings.service';

/**
 * Hook useEmergencyMode
 * Detects backend (Supabase) failures and triggers a global "Safe Mode".
 * Memoizado para evitar cascadas de re-renderizado en SafetyProvider.
 * Part of Wave 80 - Sales Shielding.
 */
export function useEmergencyMode() {
    const [isEmergency, setIsEmergency] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    const checkHealth = useCallback(async () => {
        try {
            await checkBackendHealth();

            // Recovery: If it was in emergency, reset it
            if (isEmergency) {
                if (import.meta.env.DEV) console.warn('[HealthCheck] System recovered.');
                setIsEmergency(false);
                setErrorCount(0);
            }
        } catch (_err) {
            setErrorCount(prev => prev + 1);
        }
    }, [isEmergency]); // Only depend on current state to reset

    // Separate effect to handle logic on errorCount change (avoiding dependency cycle in checkHealth)
    useEffect(() => {
        if (errorCount >= 3 && !isEmergency) {
            console.warn('[HealthCheck] Threshold reached. ACTIVATING EMERGENCY MODE.');
            setIsEmergency(true);
        }
    }, [errorCount, isEmergency]);

    useEffect(() => {
        // Initial check
        checkHealth();

        // Interval check every 30 seconds
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, [checkHealth]);

    return useMemo(() => ({ isEmergency, checkHealth }), [isEmergency, checkHealth]);
}
