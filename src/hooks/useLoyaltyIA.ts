import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
    getActiveIAProposition,
    generateSmartReward,
    SmartLoyaltyProposition
} from '@/services/loyaltyIA.service';
import { supabase } from '@/lib/supabase';

export function useLoyaltyIA() {
    const { profile } = useAuth();
    const [proposition, setProposition] = useState<SmartLoyaltyProposition | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!profile?.id) return;

        const syncLoyaltyIA = async () => {
            setIsLoading(true);
            try {
                // 1. Buscar si ya tiene una propuesta activa
                const active = await getActiveIAProposition(profile.id);

                if (active) {
                    setProposition(active);
                } else {
                    // 2. Si no tiene, ver si califica para una nueva
                    // Consultamos la vista de inteligencia 360
                    const { data: intel } = await supabase
                        .from('customer_intelligence_360')
                        .select('segment, health_status')
                        .eq('customer_id', profile.id)
                        .single();

                    // Disparamos IA si es un segmento que queremos incentivar
                    const targetSegments = ['En Riesgo', 'Casi Perdido', 'Nuevo', 'Prospecto'];

                    if (intel && targetSegments.includes(intel.segment)) {
                        const newReward = await generateSmartReward(profile.id);
                        setProposition(newReward);
                    }
                }
            } catch (err) {
                console.error('Error in useLoyaltyIA:', err);
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
