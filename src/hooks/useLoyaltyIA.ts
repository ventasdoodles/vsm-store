/**
 * // ─── HOOK: useLoyaltyIA ───
 * // Arquitectura: Custom Hook (State + Logic)
 * // Proposito principal: Cerebro proactivo que decide cuándo mostrar 
 *    recompensas inteligentes basadas en el segmento del cliente.
 * // Regla / Notas: No importa supabase directo (§1.1). Usa services de IA.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getActiveIAProposition,
    generateSmartReward,
    getCustomerIntelligence360,
    SmartLoyaltyProposition
} from '@/services/loyaltyIA.service';

export function useLoyaltyIA() {
    const { profile } = useAuth();
    const [proposition, setProposition] = useState<SmartLoyaltyProposition | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;

        const syncLoyaltyIA = async () => {
            setIsLoading(true);
            try {
                // 1. Buscar si ya tiene una propuesta activa (Service Layer)
                const active = await getActiveIAProposition(profile.id);

                if (active) {
                    setProposition(active);
                } else {
                    // 2. Si no tiene, ver si califica para una nueva
                    // Consultamos inteligencia 360 vía Service (§1.1)
                    const intel = await getCustomerIntelligence360(profile.id);

                    // Disparamos IA si es un segmento que queremos incentivar
                    const targetSegments = ['En Riesgo', 'Casi Perdido', 'Nuevo', 'Prospecto'];

                    if (intel && targetSegments.includes(intel.segment)) {
                        const newReward = await generateSmartReward(profile.id);
                        setProposition(newReward);
                    }
                }
            } catch (err) {
                console.error('[useLoyaltyIA] Error syncing IA:', err);
            } finally {
                setIsLoading(false);
            }
        };

        syncLoyaltyIA();
    }, [profile?.id]);

    return {
        proposition,
        isLoading,
        hasProposition: !!proposition
    };
}
