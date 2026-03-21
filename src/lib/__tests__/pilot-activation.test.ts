import { beforeEach, describe, expect, it } from 'vitest';

import {
    activatePilot,
    bootstrapPilotFromSearch,
    deactivatePilot,
    getPilotActivationState,
    isPilotActive,
} from '../pilot-activation';

const LEGACY_KEY = 'vsm_storefront_ai_pilot_enabled';

describe('pilot activation', () => {
    beforeEach(() => {
        document.cookie = 'vsm_storefront_ai_pilot_enabled=; path=/; max-age=0; SameSite=Lax';
        window.sessionStorage.removeItem(LEGACY_KEY);
    });

    it('bootstraps durable activation from the pilot query param and survives refresh reads', () => {
        expect(isPilotActive()).toBe(false);

        expect(bootstrapPilotFromSearch('?pilot=cesarin')).toBe(true);
        expect(isPilotActive()).toBe(true);
        expect(getPilotActivationState()).toEqual({
            active: true,
            source: 'DurableCookie',
        });
    });

    it('migrates a legacy session activation into the durable source of truth', () => {
        window.sessionStorage.setItem(LEGACY_KEY, 'true');

        expect(isPilotActive()).toBe(true);
        expect(window.sessionStorage.getItem(LEGACY_KEY)).toBeNull();
        expect(getPilotActivationState().source).toBe('DurableCookie');
    });

    it('clears the durable pilot state deterministically', () => {
        activatePilot();
        expect(isPilotActive()).toBe(true);

        deactivatePilot();
        expect(isPilotActive()).toBe(false);
        expect(getPilotActivationState()).toEqual({
            active: false,
            source: 'Inactive',
        });
    });
});
