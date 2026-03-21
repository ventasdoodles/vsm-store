const fallbackBuildInfo = {
    canonBaseBuild: 'dev',
    runtimeBuildFingerprint: 'dev-runtime',
    buildTimestamp: 'unknown-build-time',
} as const;

export const runtimeBuildInfo = {
    canonBaseBuild: typeof __CANON_BASE_BUILD__ !== 'undefined'
        ? __CANON_BASE_BUILD__
        : fallbackBuildInfo.canonBaseBuild,
    runtimeBuildFingerprint: typeof __RUNTIME_BUILD_FINGERPRINT__ !== 'undefined'
        ? __RUNTIME_BUILD_FINGERPRINT__
        : fallbackBuildInfo.runtimeBuildFingerprint,
    buildTimestamp: typeof __BUILD_TIMESTAMP__ !== 'undefined'
        ? __BUILD_TIMESTAMP__
        : fallbackBuildInfo.buildTimestamp,
} as const;

export type RuntimeShellFreshness =
    | 'fresh'
    | 'update-pending'
    | 'drift'
    | 'uncontrolled'
    | 'unsupported';

export interface ServiceWorkerDiagnostics {
    supported: boolean;
    controlled: boolean;
    controllerVersion: string | null;
    activeVersion: string | null;
    waitingVersion: string | null;
    installingVersion: string | null;
    storedFingerprint: string | null;
    freshness: RuntimeShellFreshness;
}

export function parseServiceWorkerVersion(scriptUrl: string | null | undefined): string | null {
    if (!scriptUrl) return null;

    try {
        return new URL(scriptUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost').searchParams.get('v');
    } catch {
        return null;
    }
}

export function resolveShellFreshness(input: {
    supported: boolean;
    controlled: boolean;
    controllerVersion: string | null;
    waitingVersion: string | null;
    storedFingerprint: string | null;
    runtimeFingerprint: string;
}): RuntimeShellFreshness {
    if (!input.supported) return 'unsupported';
    if (!input.controlled) return 'uncontrolled';
    if (input.waitingVersion === input.runtimeFingerprint) return 'update-pending';
    if (
        input.controllerVersion === input.runtimeFingerprint &&
        input.storedFingerprint === input.runtimeFingerprint
    ) {
        return 'fresh';
    }
    return 'drift';
}

export function detectStandaloneMode(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    return window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
        || document.referrer.includes('android-app://');
}

export async function readServiceWorkerDiagnostics(): Promise<ServiceWorkerDiagnostics> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return {
            supported: false,
            controlled: false,
            controllerVersion: null,
            activeVersion: null,
            waitingVersion: null,
            installingVersion: null,
            storedFingerprint: null,
            freshness: 'unsupported',
        };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const controllerVersion = parseServiceWorkerVersion(navigator.serviceWorker.controller?.scriptURL);
    const activeVersion = parseServiceWorkerVersion(registration?.active?.scriptURL);
    const waitingVersion = parseServiceWorkerVersion(registration?.waiting?.scriptURL);
    const installingVersion = parseServiceWorkerVersion(registration?.installing?.scriptURL);
    const storedFingerprint = localStorage.getItem('vsm_runtime_fingerprint');

    return {
        supported: true,
        controlled: Boolean(navigator.serviceWorker.controller),
        controllerVersion,
        activeVersion,
        waitingVersion,
        installingVersion,
        storedFingerprint,
        freshness: resolveShellFreshness({
            supported: true,
            controlled: Boolean(navigator.serviceWorker.controller),
            controllerVersion,
            waitingVersion,
            storedFingerprint,
            runtimeFingerprint: runtimeBuildInfo.runtimeBuildFingerprint,
        }),
    };
}
