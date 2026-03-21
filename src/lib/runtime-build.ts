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
    | 'stale-shell'
    | 'drift'
    | 'manifest-unavailable'
    | 'uncontrolled'
    | 'unsupported';

export interface RuntimeReleaseManifest {
    canonBaseBuild: string;
    runtimeBuildFingerprint: string;
    bundleBuildTimestamp: string;
    gitShortHash: string;
    manifestGeneratedAt: string;
}

export interface ServiceWorkerDiagnostics {
    supported: boolean;
    controlled: boolean;
    bundleFingerprint: string;
    deployedFingerprint: string | null;
    deployedBuildTimestamp: string | null;
    manifestGeneratedAt: string | null;
    controllerVersion: string | null;
    activeVersion: string | null;
    waitingVersion: string | null;
    installingVersion: string | null;
    controllerScriptUrl: string | null;
    activeScriptUrl: string | null;
    waitingScriptUrl: string | null;
    installingScriptUrl: string | null;
    storedFingerprint: string | null;
    freshness: RuntimeShellFreshness;
}

function isRuntimeReleaseManifest(value: unknown): value is RuntimeReleaseManifest {
    if (!value || typeof value !== 'object') return false;

    const candidate = value as Record<string, unknown>;
    return typeof candidate.canonBaseBuild === 'string'
        && typeof candidate.runtimeBuildFingerprint === 'string'
        && typeof candidate.bundleBuildTimestamp === 'string'
        && typeof candidate.gitShortHash === 'string'
        && typeof candidate.manifestGeneratedAt === 'string';
}

export async function readRuntimeReleaseManifest(): Promise<RuntimeReleaseManifest | null> {
    if (typeof window === 'undefined') return null;

    try {
        const response = await fetch(`/runtime-build.json?ts=${Date.now()}`, {
            cache: 'no-store',
        });

        if (!response.ok) return null;

        const payload = await response.json();
        return isRuntimeReleaseManifest(payload) ? payload : null;
    } catch {
        return null;
    }
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
    bundleFingerprint: string;
    deployedFingerprint: string | null;
    controllerVersion: string | null;
    waitingVersion: string | null;
    storedFingerprint: string | null;
}): RuntimeShellFreshness {
    if (!input.supported) return 'unsupported';
    if (!input.controlled) return 'uncontrolled';

    const targetFingerprint = input.deployedFingerprint ?? input.bundleFingerprint;
    const controllerMatchesTarget = input.controllerVersion === targetFingerprint;
    const waitingMatchesTarget = input.waitingVersion === targetFingerprint;
    const bundleMatchesTarget = input.bundleFingerprint === targetFingerprint;
    const storedMatchesBundle = input.storedFingerprint === input.bundleFingerprint;

    if (waitingMatchesTarget && !controllerMatchesTarget) return 'update-pending';

    if (
        controllerMatchesTarget &&
        bundleMatchesTarget &&
        storedMatchesBundle
    ) {
        return 'fresh';
    }

    if (input.deployedFingerprint) {
        return 'stale-shell';
    }

    if (controllerMatchesTarget || storedMatchesBundle) {
        return 'drift';
    }

    return 'manifest-unavailable';
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
            bundleFingerprint: runtimeBuildInfo.runtimeBuildFingerprint,
            deployedFingerprint: null,
            deployedBuildTimestamp: null,
            manifestGeneratedAt: null,
            controllerVersion: null,
            activeVersion: null,
            waitingVersion: null,
            installingVersion: null,
            controllerScriptUrl: null,
            activeScriptUrl: null,
            waitingScriptUrl: null,
            installingScriptUrl: null,
            storedFingerprint: null,
            freshness: 'unsupported',
        };
    }

    const registration = await navigator.serviceWorker.getRegistration();
    const manifest = await readRuntimeReleaseManifest();
    const controllerScriptUrl = navigator.serviceWorker.controller?.scriptURL ?? null;
    const activeScriptUrl = registration?.active?.scriptURL ?? null;
    const waitingScriptUrl = registration?.waiting?.scriptURL ?? null;
    const installingScriptUrl = registration?.installing?.scriptURL ?? null;
    const controllerVersion = parseServiceWorkerVersion(controllerScriptUrl);
    const activeVersion = parseServiceWorkerVersion(activeScriptUrl);
    const waitingVersion = parseServiceWorkerVersion(waitingScriptUrl);
    const installingVersion = parseServiceWorkerVersion(installingScriptUrl);
    const storedFingerprint = localStorage.getItem('vsm_runtime_fingerprint');

    return {
        supported: true,
        controlled: Boolean(navigator.serviceWorker.controller),
        bundleFingerprint: runtimeBuildInfo.runtimeBuildFingerprint,
        deployedFingerprint: manifest?.runtimeBuildFingerprint ?? null,
        deployedBuildTimestamp: manifest?.bundleBuildTimestamp ?? null,
        manifestGeneratedAt: manifest?.manifestGeneratedAt ?? null,
        controllerVersion,
        activeVersion,
        waitingVersion,
        installingVersion,
        controllerScriptUrl,
        activeScriptUrl,
        waitingScriptUrl,
        installingScriptUrl,
        storedFingerprint,
        freshness: resolveShellFreshness({
            supported: true,
            controlled: Boolean(navigator.serviceWorker.controller),
            bundleFingerprint: runtimeBuildInfo.runtimeBuildFingerprint,
            deployedFingerprint: manifest?.runtimeBuildFingerprint ?? null,
            controllerVersion,
            waitingVersion,
            storedFingerprint,
        }),
    };
}
