import { execSync } from 'node:child_process';

function getGitShortHash() {
    try {
        return execSync('git rev-parse --short HEAD', {
            stdio: ['ignore', 'pipe', 'ignore'],
        }).toString().trim();
    } catch {
        return 'nogit';
    }
}

export function getBuildInfo() {
    const canonBaseBuild = process.env.VSM_CANON_BASE_BUILD ?? 'v113';
    const gitShortHash = getGitShortHash();
    const runtimeBuildFingerprint = process.env.VSM_RUNTIME_BUILD_FINGERPRINT
        ?? `${canonBaseBuild}-${gitShortHash}`;
    const buildTimestamp = process.env.VSM_BUILD_TIMESTAMP ?? new Date().toISOString();

    return {
        canonBaseBuild,
        gitShortHash,
        runtimeBuildFingerprint,
        buildTimestamp,
    };
}
