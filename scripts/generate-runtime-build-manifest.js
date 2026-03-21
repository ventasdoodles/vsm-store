import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getBuildInfo } from './build-info.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const relativeTarget = process.argv[2] ?? 'dist/runtime-build.json';
const targetPath = path.resolve(__dirname, '..', relativeTarget);

const buildInfo = getBuildInfo();

const manifest = {
    canonBaseBuild: buildInfo.canonBaseBuild,
    runtimeBuildFingerprint: buildInfo.runtimeBuildFingerprint,
    bundleBuildTimestamp: buildInfo.buildTimestamp,
    gitShortHash: buildInfo.gitShortHash,
    manifestGeneratedAt: new Date().toISOString(),
};

fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Runtime build manifest generated at ${targetPath}`);
