const PILOT_QUERY_KEY = 'pilot';
const PILOT_QUERY_VALUE = 'cesarin';
const PILOT_COOKIE_NAME = 'vsm_storefront_ai_pilot_enabled';
const LEGACY_SESSION_KEY = 'vsm_storefront_ai_pilot_enabled';
const PILOT_COOKIE_VALUE = 'true';
const PILOT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const PILOT_ACTIVATION_EVENT = 'vsm:pilot-activation-changed';

type PilotActivationSource = 'DurableCookie' | 'Inactive';

function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function readCookie(name: string): string | null {
    if (!isBrowser()) return null;

    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`));

    if (!cookie) return null;

    return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
    if (!isBrowser()) return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearCookie(name: string): void {
    if (!isBrowser()) return;

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

function readLegacySessionActivation(): boolean {
    if (!isBrowser()) return false;
    return window.sessionStorage.getItem(LEGACY_SESSION_KEY) === PILOT_COOKIE_VALUE;
}

function clearLegacySessionActivation(): void {
    if (!isBrowser()) return;
    window.sessionStorage.removeItem(LEGACY_SESSION_KEY);
}

function dispatchPilotActivationEvent(active: boolean): void {
    if (!isBrowser()) return;
    window.dispatchEvent(new CustomEvent(PILOT_ACTIVATION_EVENT, { detail: { active } }));
}

export function activatePilot(): void {
    if (!isBrowser()) return;

    writeCookie(PILOT_COOKIE_NAME, PILOT_COOKIE_VALUE, PILOT_COOKIE_MAX_AGE_SECONDS);
    clearLegacySessionActivation();
    dispatchPilotActivationEvent(true);
}

export function deactivatePilot(): void {
    if (!isBrowser()) return;

    clearCookie(PILOT_COOKIE_NAME);
    clearLegacySessionActivation();
    dispatchPilotActivationEvent(false);
}

export function isPilotActive(): boolean {
    if (!isBrowser()) return false;

    const cookieValue = readCookie(PILOT_COOKIE_NAME);
    if (cookieValue === PILOT_COOKIE_VALUE) {
        return true;
    }

    if (readLegacySessionActivation()) {
        writeCookie(PILOT_COOKIE_NAME, PILOT_COOKIE_VALUE, PILOT_COOKIE_MAX_AGE_SECONDS);
        clearLegacySessionActivation();
        console.warn('[Pilot Gate] Migrated legacy session activation to durable cookie.');
        return true;
    }

    return false;
}

export function bootstrapPilotFromSearch(search: string): boolean {
    if (!isBrowser()) return false;

    const params = new URLSearchParams(search);
    if (params.get(PILOT_QUERY_KEY) !== PILOT_QUERY_VALUE) {
        return false;
    }

    activatePilot();
    return true;
}

export function getPilotActivationState(): {
    active: boolean;
    source: PilotActivationSource;
} {
    const active = isPilotActive();
    return {
        active,
        source: active ? 'DurableCookie' : 'Inactive',
    };
}
