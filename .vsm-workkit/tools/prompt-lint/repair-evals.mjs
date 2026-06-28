#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const fixtureRoot = path.join(__dirname, 'fixtures', 'repair');
const manifestPath = path.join(fixtureRoot, 'manifest.json');
const promptLintPath = path.join(__dirname, 'prompt-lint.mjs');

const args = process.argv.slice(2);
const strict = args.includes('--strict');

const VALID_REPAIRABILITY = new Set(['no-op', 'template-repairable', 'context-required', 'unsafe-blocked']);
const REQUIRED_BLOCKED_CODE = 'REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT';

const TEMPLATE_REPAIRABLE_CODES = new Set([
  'FAIL_STALE_EXTERNAL_TOOL_NAME',
  'FAIL_RELATIVE_SKILL_PATH',
  'FAIL_MISSING_STRICT_MODE',
  'FAIL_LANE_DECLARATION_MISSING',
  'FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING',
  'FAIL_READONLY_CONSTRAINTS_MISSING',
  'FAIL_BASELINE_CHECKS_MISSING',
  'FAIL_GIT_COMPLETENESS_MISSING',
  'FAIL_FINAL_REPO_CHECKS_MISSING',
  'FAIL_NON_CLAIMS_MISSING',
  'FAIL_PROMPT_GATE_MISSING',
]);

const CONTEXT_REQUIRED_CODES = new Set(['FAIL_TARGET_TOOL_MISSING', 'FAIL_SKILL_PATH_NOT_FOUND']);

const UNSAFE_BLOCKED_CODES = new Set([
  'FAIL_TARGET_TOOL_NOT_CODEX',
  'FAIL_READONLY_WITH_COMMIT_PUSH',
  'FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH',
  'FAIL_CANON_WITHOUT_COMMIT_PUSH',
  'FAIL_LANE_MIXING',
  'FAIL_FRAGILE_INLINE_COMMAND',
  'FAIL_SECRET_INSPECTION_RISK',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizePathForNode(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function parseFindingCodes(stdout) {
  const codes = [];
  const regex = /^\d+\.\s+(?:ERROR|WARN|INFO)\s+([A-Z0-9_]+)/gm;
  let match = regex.exec(stdout);
  while (match) {
    codes.push(match[1]);
    match = regex.exec(stdout);
  }
  return codes;
}

function runPromptLint(promptFile, modeStrict) {
  const lintArgs = [promptLintPath, normalizePathForNode(promptFile)];
  if (modeStrict) lintArgs.push('--strict');

  const result = spawnSync(process.execPath, lintArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    codes: parseFindingCodes(result.stdout ?? ''),
  };
}

function unique(values) {
  return [...new Set(values)];
}

function sortCodes(values) {
  return [...values].sort();
}

function sameCodeSet(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);

  if (actualSet.size !== expectedSet.size) return false;
  for (const value of expectedSet) {
    if (!actualSet.has(value)) return false;
  }
  for (const value of actualSet) {
    if (!expectedSet.has(value)) return false;
  }
  return true;
}

function diffCodes(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  const missing = sortCodes(expected.filter((code) => !actualSet.has(code)));
  const extra = sortCodes(actual.filter((code) => !expectedSet.has(code)));
  return { missing, extra };
}

function normalizeTextForAssertion(value) {
  return value
    .toLowerCase()
    .replace(/[`'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyRepairability(fixture, findings) {
  if (findings.length === 0) return 'no-op';

  if (fixture.category === 'missing-authoritative-context' || fixture.category === 'no-invention') {
    return 'context-required';
  }

  if (findings.some((code) => CONTEXT_REQUIRED_CODES.has(code))) {
    return 'context-required';
  }

  if (findings.some((code) => UNSAFE_BLOCKED_CODES.has(code))) {
    return 'unsafe-blocked';
  }

  if (findings.every((code) => TEMPLATE_REPAIRABLE_CODES.has(code))) {
    return 'template-repairable';
  }

  return 'unsafe-blocked';
}

function blockedCodeFor(classification) {
  return classification === 'context-required' ? REQUIRED_BLOCKED_CODE : null;
}

function validateManifestFixture(fixture, index) {
  const requiredFields = [
    'id',
    'category',
    'laneType',
    'inputPromptFile',
    'expectedFindings',
    'expectedRepairability',
    'expectedBlockedCode',
    'expectedNoInvention',
    'expectedDefaultExit',
    'expectedStrictExit',
    'nonClaimsToPreserve',
  ];

  const failures = [];
  for (const field of requiredFields) {
    if (!(field in fixture)) failures.push(`fixture[${index}] missing metadata field: ${field}`);
  }

  if (!VALID_REPAIRABILITY.has(fixture.expectedRepairability)) {
    failures.push(`${fixture.id ?? `fixture[${index}]`} has invalid expectedRepairability`);
  }

  if (!Array.isArray(fixture.expectedFindings)) {
    failures.push(`${fixture.id ?? `fixture[${index}]`} expectedFindings must be an array`);
  }

  if (!Array.isArray(fixture.nonClaimsToPreserve) || fixture.nonClaimsToPreserve.length === 0) {
    failures.push(`${fixture.id ?? `fixture[${index}]`} must preserve at least one non-claim`);
  }

  if (fixture.expectedNoInvention !== true) {
    failures.push(`${fixture.id ?? `fixture[${index}]`} must set expectedNoInvention true`);
  }

  return failures;
}

function evaluateFixture(fixture, index) {
  const metadataFailures = validateManifestFixture(fixture, index);
  if (metadataFailures.length > 0) {
    return { fixture, passed: false, failures: metadataFailures };
  }

  const promptFile = path.join(fixtureRoot, fixture.inputPromptFile);
  const failures = [];

  if (!fs.existsSync(promptFile)) {
    return { fixture, passed: false, failures: [`inputPromptFile not found: ${fixture.inputPromptFile}`] };
  }

  const promptText = fs.readFileSync(promptFile, 'utf8');
  const defaultRun = runPromptLint(promptFile, false);
  const strictRun = runPromptLint(promptFile, true);
  const findings = sortCodes(unique(defaultRun.codes));
  const expectedFindings = sortCodes(unique(fixture.expectedFindings));
  const classification = classifyRepairability(fixture, findings);
  const blockedCode = blockedCodeFor(classification);

  if (!sameCodeSet(findings, expectedFindings)) {
    const { missing, extra } = diffCodes(findings, expectedFindings);
    const parts = [];
    if (missing.length > 0) parts.push(`missing: ${missing.join(', ')}`);
    if (extra.length > 0) parts.push(`extra: ${extra.join(', ')}`);
    failures.push(`expected findings ${expectedFindings.join(', ') || '(none)'} but got ${findings.join(', ') || '(none)'}${parts.length > 0 ? ` (${parts.join('; ')})` : ''}`);
  }

  if (classification !== fixture.expectedRepairability) {
    failures.push(`expected repairability ${fixture.expectedRepairability} but got ${classification}`);
  }

  if ((fixture.expectedBlockedCode ?? null) !== blockedCode) {
    failures.push(`expected blocked code ${fixture.expectedBlockedCode ?? '(none)'} but got ${blockedCode ?? '(none)'}`);
  }

  if (defaultRun.status !== fixture.expectedDefaultExit) {
    failures.push(`expected default exit ${fixture.expectedDefaultExit} but got ${defaultRun.status}`);
  }

  if (strictRun.status !== fixture.expectedStrictExit) {
    failures.push(`expected strict exit ${fixture.expectedStrictExit} but got ${strictRun.status}`);
  }

  for (const nonClaim of fixture.nonClaimsToPreserve) {
    if (!normalizeTextForAssertion(promptText).includes(normalizeTextForAssertion(nonClaim))) {
      failures.push(`missing non-claim text in fixture prompt: ${nonClaim}`);
    }
  }

  if (fixture.expectedNoInvention !== true) {
    failures.push('expectedNoInvention must remain true');
  }

  if (defaultRun.stderr.trim()) {
    failures.push(`default prompt-lint stderr: ${defaultRun.stderr.trim()}`);
  }

  if (strictRun.stderr.trim()) {
    failures.push(`strict prompt-lint stderr: ${strictRun.stderr.trim()}`);
  }

  return {
    fixture,
    passed: failures.length === 0,
    failures,
    findings,
    classification,
    blockedCode,
    defaultExit: defaultRun.status,
    strictExit: strictRun.status,
  };
}

if (!fs.existsSync(manifestPath)) {
  console.error(`Repair eval manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = readJson(manifestPath);
const fixtures = manifest.fixtures ?? [];
const results = fixtures.map((fixture, index) => evaluateFixture(fixture, index));
const failed = results.filter((result) => !result.passed);

console.log('Prompt Repair Eval Report');
console.log(`Manifest: ${normalizePathForNode(manifestPath)}`);
console.log(`Mode: ${strict ? 'strict' : 'default'}`);
console.log(`Fixtures: ${results.length}`);
console.log(`Passed: ${results.length - failed.length}`);
console.log(`Failed: ${failed.length}`);

for (const result of results) {
  const status = result.passed ? 'PASS' : 'FAIL';
  console.log(`${status} ${result.fixture.id} ${result.fixture.category}`);
  if (result.findings) {
    console.log(`  findings: ${result.findings.join(', ') || '(none)'}`);
    console.log(`  repairability: ${result.classification}`);
    console.log(`  blockedCode: ${result.blockedCode ?? '(none)'}`);
  }
  for (const failure of result.failures) {
    console.log(`  - ${failure}`);
  }
}

console.log('Non-claims: no --repair, no generated repaired prompt text, no helper behavior change, no hook, no CI, no automation, no runtime integration.');

process.exit(strict && failed.length > 0 ? 1 : 0);
