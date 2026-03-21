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
            controllerVersion: 'v113-abc123',
            waitingVersion: null,
            storedFingerprint: 'v113-abc123',
            runtimeFingerprint: 'v113-abc123',
        })).toBe('fresh');
    });

    it('classifies a matching waiting worker as update-pending', () => {
        expect(resolveShellFreshness({
            supported: true,
            controlled: true,
            controllerVersion: 'v113-old',
            waitingVersion: 'v113-new',
            storedFingerprint: 'v113-new',
            runtimeFingerprint: 'v113-new',
        })).toBe('update-pending');
    });
});
