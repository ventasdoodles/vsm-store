#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const registryPath = path.join(__dirname, 'eval-coverage-registry.json');

const VALID_STATUSES = new Set(['covered', 'partial', 'uncovered', 'not-applicable-yet']);
const REQUIRED_TOP_LEVEL_ARRAYS = ['nonClaims', 'failCodes', 'lanes', 'historicalRegressions'];

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const unknownArgs = args.filter((arg) => arg !== '--json');

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function countByStatus(entries) {
  const counts = {
    covered: 0,
    partial: 0,
    uncovered: 0,
    'not-applicable-yet': 0,
  };

  for (const entry of entries) {
    counts[entry.status] += 1;
  }

  return counts;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateRelativeFixturePath(relativePath, owner, errors) {
  if (typeof relativePath !== 'string' || relativePath.trim() === '') {
    errors.push(`${owner} has an empty fixture path`);
    return;
  }

  if (path.isAbsolute(relativePath)) {
    errors.push(`${owner} uses an absolute fixture path: ${relativePath}`);
    return;
  }

  const resolved = path.resolve(repoRoot, relativePath);
  const relative = path.relative(repoRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    errors.push(`${owner} references a path outside the repo: ${relativePath}`);
    return;
  }

  if (!fs.existsSync(resolved)) {
    errors.push(`${owner} references a missing fixture path: ${relativePath}`);
  }
}

function validateFixtureList(values, owner, errors) {
  if (!Array.isArray(values)) {
    errors.push(`${owner} fixture list must be an array`);
    return;
  }

  const seen = new Set();
  for (const fixturePath of values) {
    if (seen.has(fixturePath)) {
      errors.push(`${owner} repeats fixture path: ${fixturePath}`);
    }
    seen.add(fixturePath);
    validateRelativeFixturePath(fixturePath, owner, errors);
  }
}

function validateRegistry(registry) {
  const errors = [];

  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    return ['Registry root must be an object'];
  }

  if (typeof registry.version !== 'string' || registry.version.trim() === '') {
    errors.push('Registry version must be a non-empty string');
  }

  if (registry.status !== 'local-manual') {
    errors.push('Registry status must be local-manual');
  }

  for (const field of REQUIRED_TOP_LEVEL_ARRAYS) {
    if (!Array.isArray(registry[field])) {
      errors.push(`Registry ${field} must be an array`);
    }
  }

  const failCodeSet = new Set();
  for (const [index, entry] of (registry.failCodes ?? []).entries()) {
    const owner = `failCodes[${index}]`;
    if (typeof entry.code !== 'string' || !/^FAIL_[A-Z0-9_]+$/.test(entry.code)) {
      errors.push(`${owner} must have a FAIL_* code`);
    } else if (failCodeSet.has(entry.code)) {
      errors.push(`${owner} duplicates code ${entry.code}`);
    } else {
      failCodeSet.add(entry.code);
    }

    if (!VALID_STATUSES.has(entry.status)) {
      errors.push(`${owner} has invalid status: ${entry.status}`);
    }

    validateFixtureList(entry.fixturePaths, `${owner} ${entry.code ?? '(unknown)'}`, errors);

    if ((entry.status === 'covered' || entry.status === 'partial') && entry.fixturePaths.length === 0) {
      errors.push(`${owner} ${entry.code} is ${entry.status} but has no fixture paths`);
    }

    if ((entry.status === 'uncovered' || entry.status === 'not-applicable-yet') && entry.fixturePaths.length > 0) {
      errors.push(`${owner} ${entry.code} is ${entry.status} but lists fixture paths`);
    }

    if (typeof entry.notes !== 'string' || entry.notes.trim() === '') {
      errors.push(`${owner} ${entry.code ?? '(unknown)'} must include notes`);
    }
  }

  const laneSet = new Set();
  for (const [index, entry] of (registry.lanes ?? []).entries()) {
    const owner = `lanes[${index}]`;
    if (typeof entry.id !== 'string' || entry.id.trim() === '') {
      errors.push(`${owner} must have an id`);
    } else if (laneSet.has(entry.id)) {
      errors.push(`${owner} duplicates id ${entry.id}`);
    } else {
      laneSet.add(entry.id);
    }

    if (typeof entry.label !== 'string' || entry.label.trim() === '') {
      errors.push(`${owner} must have a label`);
    }

    validateFixtureList(entry.coveredFixtureFiles, `${owner} ${entry.id ?? '(unknown)'}`, errors);

    if (!Array.isArray(entry.knownResiduals) || entry.knownResiduals.length === 0) {
      errors.push(`${owner} ${entry.id ?? '(unknown)'} must include knownResiduals`);
    }

    if (!Array.isArray(entry.nonClaims) || entry.nonClaims.length === 0) {
      errors.push(`${owner} ${entry.id ?? '(unknown)'} must include nonClaims`);
    }
  }

  const regressionSet = new Set();
  for (const [index, entry] of (registry.historicalRegressions ?? []).entries()) {
    const owner = `historicalRegressions[${index}]`;
    if (typeof entry.id !== 'string' || entry.id.trim() === '') {
      errors.push(`${owner} must have an id`);
    } else if (regressionSet.has(entry.id)) {
      errors.push(`${owner} duplicates id ${entry.id}`);
    } else {
      regressionSet.add(entry.id);
    }

    if (typeof entry.label !== 'string' || entry.label.trim() === '') {
      errors.push(`${owner} must have a label`);
    }

    if (!VALID_STATUSES.has(entry.status)) {
      errors.push(`${owner} has invalid status: ${entry.status}`);
    }

    validateFixtureList(entry.fixturePaths, `${owner} ${entry.id ?? '(unknown)'}`, errors);

    if ((entry.status === 'covered' || entry.status === 'partial') && entry.fixturePaths.length === 0) {
      errors.push(`${owner} ${entry.id} is ${entry.status} but has no fixture paths`);
    }

    if ((entry.status === 'uncovered' || entry.status === 'not-applicable-yet') && entry.fixturePaths.length > 0) {
      errors.push(`${owner} ${entry.id} is ${entry.status} but lists fixture paths`);
    }

    if (typeof entry.notes !== 'string' || entry.notes.trim() === '') {
      errors.push(`${owner} ${entry.id ?? '(unknown)'} must include notes`);
    }
  }

  return errors;
}

function buildReport(registry, errors) {
  return {
    ok: errors.length === 0,
    registry: toRepoPath(registryPath),
    version: registry.version,
    status: registry.status,
    summary: {
      failCodes: {
        total: registry.failCodes.length,
        byStatus: countByStatus(registry.failCodes),
      },
      lanes: {
        total: registry.lanes.length,
      },
      historicalRegressions: {
        total: registry.historicalRegressions.length,
        byStatus: countByStatus(registry.historicalRegressions),
      },
    },
    failCodes: registry.failCodes.map((entry) => ({
      code: entry.code,
      status: entry.status,
      laneType: entry.laneType,
      fixturePaths: entry.fixturePaths,
      notes: entry.notes,
    })),
    lanes: registry.lanes.map((entry) => ({
      id: entry.id,
      label: entry.label,
      fixtureCount: entry.coveredFixtureFiles.length,
      knownResiduals: entry.knownResiduals,
      nonClaims: entry.nonClaims,
    })),
    historicalRegressions: registry.historicalRegressions.map((entry) => ({
      id: entry.id,
      label: entry.label,
      status: entry.status,
      fixturePaths: entry.fixturePaths,
      notes: entry.notes,
    })),
    nonClaims: registry.nonClaims,
    errors,
  };
}

function printHumanReport(report) {
  console.log('Eval Coverage Registry Report');
  console.log(`Registry: ${report.registry}`);
  console.log(`Version: ${report.version}`);
  console.log(`Status: ${report.status}`);
  console.log('');

  console.log('Fail code counts by status:');
  for (const [status, count] of Object.entries(report.summary.failCodes.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }
  console.log('');

  console.log('Coverage by fail code:');
  for (const entry of report.failCodes) {
    console.log(`  ${entry.status.padEnd(18)} ${entry.code} (${entry.laneType})`);
  }
  console.log('');

  console.log('Coverage by lane:');
  for (const entry of report.lanes) {
    console.log(`  ${entry.label}: ${entry.fixtureCount} fixture reference(s)`);
  }
  console.log('');

  console.log('Coverage by historical regression:');
  for (const entry of report.historicalRegressions) {
    console.log(`  ${entry.status.padEnd(18)} ${entry.label}`);
  }
  console.log('');

  console.log('Non-claims:');
  for (const nonClaim of report.nonClaims) {
    console.log(`  - ${nonClaim}`);
  }

  if (report.errors.length > 0) {
    console.log('');
    console.log('Registry errors:');
    for (const error of report.errors) {
      console.log(`  - ${error}`);
    }
  }
}

if (unknownArgs.length > 0) {
  const errors = [`Unknown argument(s): ${unknownArgs.join(', ')}`];
  const report = {
    ok: false,
    registry: toRepoPath(registryPath),
    version: null,
    status: null,
    summary: {
      failCodes: { total: 0, byStatus: countByStatus([]) },
      lanes: { total: 0 },
      historicalRegressions: { total: 0, byStatus: countByStatus([]) },
    },
    failCodes: [],
    lanes: [],
    historicalRegressions: [],
    nonClaims: [],
    errors,
  };

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReport(report);
  }
  process.exit(1);
}

let registry = null;
let errors = [];

try {
  registry = readJson(registryPath);
  errors = validateRegistry(registry);
} catch (error) {
  registry = {
    version: null,
    status: null,
    nonClaims: [],
    failCodes: [],
    lanes: [],
    historicalRegressions: [],
  };
  errors = [`Failed to read registry: ${error.message}`];
}

const report = buildReport(registry, errors);

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHumanReport(report);
}

process.exit(report.ok ? 0 : 1);
