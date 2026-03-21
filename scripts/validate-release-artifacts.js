import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

function readRequired(relativePath) {
    const targetPath = path.join(distPath, relativePath);

    if (!fs.existsSync(targetPath)) {
        throw new Error(`Missing release artifact: ${relativePath}`);
    }

    return fs.readFileSync(targetPath, 'utf8');
}

const runtimeManifest = JSON.parse(readRequired('runtime-build.json'));
const serviceWorker = readRequired('sw.js');
const sitemapXml = readRequired('sitemap.xml');

if (!runtimeManifest.runtimeBuildFingerprint || !runtimeManifest.canonBaseBuild) {
    throw new Error('runtime-build.json is missing required fingerprint fields.');
}

if (!serviceWorker.includes("searchParams.get('v')")) {
    throw new Error('dist/sw.js is not version-query driven.');
}

const urlCount = (sitemapXml.match(/<url>/g) ?? []).length;
if (urlCount < 20) {
    throw new Error(`dist/sitemap.xml looks incomplete. URL count: ${urlCount}`);
}

console.log(JSON.stringify({
    distPath,
    runtimeBuildFingerprint: runtimeManifest.runtimeBuildFingerprint,
    canonBaseBuild: runtimeManifest.canonBaseBuild,
    sitemapUrlCount: urlCount,
    serviceWorkerVersioned: true,
}, null, 2));
