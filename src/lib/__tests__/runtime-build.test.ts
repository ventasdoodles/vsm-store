import { describe, expect, it } from 'vitest';

import { parseServiceWorkerVersion, resolveShellFreshness } from '../runtime-build';

describe('runtime build diagnostics', () => {
    it('extracts the runtime fingerprint from versioned service worker URLs', () => {
        expect(parseServiceWorkerVersion('/sw.js?v=v113-abc123')).toBe('v113-abc123');
        expect(parseServiceWorkerVersion('https://example.com/sw.js?v=v113-prod')).toBe('v113-prod');
    });

    it('classifies a controlled matching shell as fresh', () => {
        expect(resolveShellFreshness({
            supported: true,
            controlled: true,
            bundleFingerprint: 'v113-abc123',
            deployedFingerprint: 'v113-abc123',
            controllerVersion: 'v113-abc123',
            waitingVersion: null,
            storedFingerprint: 'v113-abc123',
        })).toBe('fresh');
    });

    it('classifies a matching waiting worker as update-pending', () => {
        expect(resolveShellFreshness({
            supported: true,
            controlled: true,
            bundleFingerprint: 'v113-old',
            deployedFingerprint: 'v113-new',
            controllerVersion: 'v113-old',
            waitingVersion: 'v113-new',
            storedFingerprint: 'v113-old',
        })).toBe('update-pending');
    });

    it('classifies a deployed mismatch as stale-shell', () => {
        expect(resolveShellFreshness({
            supported: true,
            controlled: true,
            bundleFingerprint: 'v113-old',
            deployedFingerprint: 'v113-new',
            controllerVersion: 'v113-old',
            waitingVersion: null,
            storedFingerprint: 'v113-old',
        })).toBe('stale-shell');
    });
});
