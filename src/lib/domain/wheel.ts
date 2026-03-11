/**
 * // ─── MÓDULO: lib/domain/wheel ───
 * // Arquitectura: Lógica de dominio pura (sin side effects, sin imports de UI)
 * // Proposito principal: Funciones puras para la mecánica de la Ruleta de Premios.
 *    Selección de prize por probabilidad acumulada y cálculo de rotación visual.
 * // Regla / Notas: Sin `any`. Sin imports de React. Debe tener tests en __tests__/.
 */

import type { WheelPrize } from '@/services/gamification.service';

/**
 * Selecciona un premio basándose en probabilidades acumuladas.
 * @param prizes   Array de premios con campo `probability` (suma debe ser ~1.0)
 * @param random   Número pseudo-aleatorio en [0, 1). Por defecto: Math.random()
 * @returns { prize, index } del premio ganador, o null si prizes está vacío.
 */
export function selectPrizeByProbability(
    prizes: WheelPrize[],
    random: number = Math.random(),
): { prize: WheelPrize; index: number } | null {
    if (prizes.length === 0) return null;

    let cumulative = 0;
    for (let i = 0; i < prizes.length; i++) {
        const p = prizes[i];
        if (!p) continue;
        cumulative += p.probability;
        if (random < cumulative) {
            return { prize: p, index: i };
        }
    }

    // Fallback al último (por redondeo de probabilidades)
    const last = prizes[prizes.length - 1];
    return last ? { prize: last, index: prizes.length - 1 } : null;
}

/**
 * Calcula la rotación final de la ruleta para que el puntero apunte al segmento ganador.
 * @param prizeIndex       Índice del premio seleccionado
 * @param totalPrizes      Total de segmentos en la ruleta
 * @param currentRotation  Rotación actual acumulada (para continuar desde ahí)
 * @param extraRounds      Vueltas extra para la animación (default: 8–12)
 * @returns Nuevos grados absolutos de rotación
 */
export function calculateTargetRotation(
    prizeIndex: number,
    totalPrizes: number,
    currentRotation: number,
    extraRounds: number = 8 + Math.floor(Math.random() * 4),
): number {
    const degreesPerSegment = 360 / totalPrizes;
    // Centro del segmento ganador
    const segmentCenterAngle = prizeIndex * degreesPerSegment + degreesPerSegment / 2;
    // La ruleta gira hacia adelante; el puntero está arriba (0°)
    // Para que el segmento quede bajo el puntero, rotamos (360 - ángulo) + vueltas extra
    return currentRotation + extraRounds * 360 + (360 - segmentCenterAngle);
}

/**
 * Formatea el valor de un premio para mostrarlo en la UI.
 */
export function formatPrizeValue(prize: WheelPrize): string {
    switch (prize.type) {
        case 'points':
            return `+${prize.value.amount ?? 0} V-Coins`;
        case 'coupon':
            return `${prize.value.discount ?? 0}% OFF`;
        case 'empty':
            return '¡Mejor suerte!';
        default:
            return prize.label;
    }
}
