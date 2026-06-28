#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const scorecardPath = path.join(__dirname, 'scorecard.mjs');
const manifestPath = path.join(__dirname, 'fixtures', 'scorecard', 'manifest.json');
const HARD_FAIL_SCORE_CAP = 49;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unique(values) {
  return [...new Set(values)];
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

function normalizePromptPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function runScorecard(promptFile, strict = false) {
  const args = [scorecardPath, normalizePromptPath(promptFile), '--json'];
  if (strict) args.push('--strict');

  const result = spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  const stdout = result.stdout ?? '';
  let report = null;
  try {
    report = JSON.parse(stdout);
  } catch {
    report = null;
  }

  return {
    status: result.status ?? 1,
    stdout,
    stderr: result.stderr ?? '',
    report,
  };
}

function evaluateFixture(fixture, index) {
  const failures = [];
  const promptFile = path.join(__dirname, 'fixtures', 'scorecard', fixture.inputPromptFile);

  if (!fs.existsSync(promptFile)) {
    return { fixture, passed: false, failures: [`inputPromptFile not found: ${fixture.inputPromptFile}`] };
  }

  const defaultRun = runScorecard(promptFile, false);
  const strictRun = runScorecard(promptFile, true);

  if (!defaultRun.report) {
    failures.push(`default run did not return JSON for fixture ${fixture.id}`);
  } else {
    const actualHardFailCodes = unique(defaultRun.report.hardFailCodes ?? []);
    const expectedHardFailCodes = unique(fixture.expectedHardFailCodes ?? []);
    if (!sameCodeSet(actualHardFailCodes, expectedHardFailCodes)) {
      failures.push(`expected hard fail codes ${expectedHardFailCodes.join(', ') || '(none)'} but got ${actualHardFailCodes.join(', ') || '(none)'}`);
    }
    if (defaultRun.report.repairability !== fixture.expectedRepairability) {
      failures.push(`expected repairability ${fixture.expectedRepairability} but got ${defaultRun.report.repairability}`);
    }
    if (defaultRun.report.overallScore < fixture.expectedScoreMin || defaultRun.report.overallScore > fixture.expectedScoreMax) {
      failures.push(`expected score between ${fixture.expectedScoreMin} and ${fixture.expectedScoreMax} but got ${defaultRun.report.overallScore}`);
    }
    if (expectedHardFailCodes.length > 0 && defaultRun.report.overallScore > HARD_FAIL_SCORE_CAP) {
      failures.push(`hard-fail fixture score must be <= ${HARD_FAIL_SCORE_CAP} but got ${defaultRun.report.overallScore}`);
    }
  }

  if (strictRun.status !== fixture.expectedStrictExit) {
    failures.push(`expected strict exit ${fixture.expectedStrictExit} but got ${strictRun.status}`);
  }

  return {
    fixture,
    passed: failures.length === 0,
    failures,
    defaultScore: defaultRun.report?.overallScore,
    strictExit: strictRun.status,
  };
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error(`Scorecard manifest not found: ${manifestPath}`);
    process.exit(1);
  }

  const manifest = readJson(manifestPath);
  const fixtures = manifest.fixtures ?? [];
  const results = fixtures.map((fixture, index) => evaluateFixture(fixture, index));
  const failed = results.filter((result) => !result.passed);

  console.log('Prompt Scorecard Eval Report');
  console.log(`Manifest: ${path.relative(repoRoot, manifestPath).split(path.sep).join('/')}`);
  console.log(`Fixtures: ${results.length}`);
  console.log(`Passed: ${results.length - failed.length}`);
  console.log(`Failed: ${failed.length}`);

  for (const result of results) {
    const status = result.passed ? 'PASS' : 'FAIL';
    console.log(`${status} ${result.fixture.id}`);
    console.log(`  score: ${result.defaultScore ?? '(n/a)'}`);
    console.log(`  strictExit: ${result.strictExit}`);
    for (const failure of result.failures) {
      console.log(`  - ${failure}`);
    }
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main();
