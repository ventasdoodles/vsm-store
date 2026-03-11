/**
 * // ─── HOOK: usePrizeWheel ───
 * // Arquitectura: Custom Hook (State + Side Effects)
 * // Proposito principal: Gestiona el estado y la animación del giro de la ruleta.
 *    Usa funciones puras de `lib/domain/wheel` para selección y cálculo de rotación.
 * // Regla / Notas: Sin `any`. Sin lógica de negocio inline. spin() es async.
 */

import { useState, useCallback, useRef } from 'react';
import { gamificationService } from '@/services/gamification.service';
import type { WheelPrize } from '@/services/gamification.service';
import { useAuth } from '@/hooks/useAuth';
import { useHaptic } from '@/hooks/useHaptic';
import {
    selectPrizeByProbability,
    calculateTargetRotation,
} from '@/lib/domain/wheel';

const SPIN_ANIMATION_MS = 5_500; // Debe coincidir con duration en el componente (framer-motion)

export function usePrizeWheel() {
    const { user } = useAuth();
    const { trigger: haptic } = useHaptic();

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<WheelPrize | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Ángulo acumulado para que animaciones consecutivas continúen suavemente
    const currentRotation = useRef(0);

    const spin = useCallback(async (prizes: WheelPrize[]) => {
        if (!user || isSpinning || prizes.length === 0) return;

        setError(null);
        setResult(null);
        setIsSpinning(true);

        try {
            // 1. Verificar disponibilidad de giro (atomic RPC)
            const canSpin = await gamificationService.canSpin(user.id);
            if (!canSpin) {
                setError('Ya giraste hoy. ¡Tu próximo giro estará disponible en 24 horas!');
                setIsSpinning(false);
                return;
            }

            // 2. Seleccionar premio por probabilidad (lógica pura en lib/domain/wheel)
            const selection = selectPrizeByProbability(prizes);
            if (!selection) {
                setError('Error al calcular el premio. Intenta de nuevo.');
                setIsSpinning(false);
                return;
            }

            // 3. Calcular rotación final (lógica pura en lib/domain/wheel)
            const targetRotation = calculateTargetRotation(
                selection.index,
                prizes.length,
                currentRotation.current,
            );
            currentRotation.current = targetRotation;
            setRotation(targetRotation);

            // Haptic al inicio del giro
            haptic('light');

            // 4. Esperar a que la animación CSS/Framer termine
            setTimeout(async () => {
                setIsSpinning(false);
                setResult(selection.prize);
                haptic('success');

                // 5. Registrar giro en DB de forma silenciosa
                try {
                    await gamificationService.recordSpin(user.id, selection.prize);
                } catch (_err) {
                    // El premio visual ya se mostró; el error de DB es no bloqueante para el UX
                    console.warn('[usePrizeWheel] Post-spin record error:', _err);
                }
            }, SPIN_ANIMATION_MS);
        } catch (err) {
            console.error('[usePrizeWheel] Spin error:', err);
            setError('Error de conexión. Intenta de nuevo.');
            setIsSpinning(false);
        }
    }, [user, isSpinning, haptic]);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return { isSpinning, rotation, result, error, spin, reset };
}
