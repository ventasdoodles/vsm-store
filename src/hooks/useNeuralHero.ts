/**
 * // ─── HOOK: useNeuralHero ─── [Wave 130 - Neural Identity]
 * // Propósito: Personalizar el Hero de la Home basado en el perfil del cliente.
 * // Lógica: Obtiene el segmento del CRM y genera una propuesta de slide dinámica.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getCustomerIntelligence360 } from '@/services/loyalty.service';
import { PREMIUM_GRADIENTS } from '@/constants/slider';
import type { PresetGradient } from '@/constants/slider';

export interface PersonalizedSlide {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    tag: string;
    preset: PresetGradient;
}

export function useNeuralHero() {
    const { user } = useAuth();

    const { data: intelligence, isLoading } = useQuery({
        queryKey: ['customer', 'intelligence-360', user?.id],
        queryFn: () => user?.id ? getCustomerIntelligence360(user.id) : null,
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 10, // 10 min cache
    });

    const personalizedSlide = useMemo((): PersonalizedSlide | null => {
        if (!intelligence) return null;

        const { segment } = intelligence;

        switch (segment) {
            case 'Campeón':
                return {
                    id: 'neural-vip',
                    title: 'STATUS',
                    subtitle: 'ELITE VSM',
                    description: 'Como miembro distinguido, tienes acceso prioritario a la bóveda de extractos exclusivos.',
                    image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1600&q=80',
                    ctaText: 'Ver Colección VIP',
                    ctaLink: '/420/extractos',
                    tag: 'Exclusivo VIP',
                    preset: PREMIUM_GRADIENTS[0]!
                };
            case 'En Riesgo':
                return {
                    id: 'neural-recovery',
                    title: 'VUELVE',
                    subtitle: 'TE EXTRAÑAMOS',
                    description: 'Queremos verte de nuevo. Usa el código VOLVER para un 20% en tu próxima orden.',
                    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80',
                    ctaText: 'Reclamar 20%',
                    ctaLink: '/flash-deals',
                    tag: 'Regalo Especial',
                    preset: PREMIUM_GRADIENTS[2]!
                };
            case 'Novo':
            case 'Prospecto':
                return {
                    id: 'neural-welcome',
                    title: 'COMIENZA',
                    subtitle: 'TU VIAJE',
                    description: 'Explora nuestra guía de inicio para encontrar el dispositivo perfecto para ti.',
                    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1600&q=80',
                    ctaText: 'Guía de Inicio',
                    ctaLink: '/vape/pods',
                    tag: 'Bienvenida',
                    preset: PREMIUM_GRADIENTS[1]!
                };
            default:
                return null;
        }
    }, [intelligence]);

    return {
        personalizedSlide,
        isLoading,
        segment: intelligence?.segment || 'Anónimo'
    };
}
