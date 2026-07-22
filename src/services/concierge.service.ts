/**
 * // ─── SERVICIO: CONCIERGE SERVICE (FACADE) ───
 * // Propósito: Fachada delegada hacia el módulo especializado src/services/concierge/
 * // Arquitectura: Domain-Driven Submodules (Wave 120 Modularization) (§1.1).
 */
import {
    chat,
    semanticSearch,
    neuralSearch,
    updatePreferences,
    getMyIntelligence,
    getPersonalizedBanner,
} from './concierge/index';

export * from './concierge/index';

export const conciergeService = {
    chat,
    semanticSearch,
    neuralSearch,
    updatePreferences,
    getMyIntelligence,
    getPersonalizedBanner,
};
