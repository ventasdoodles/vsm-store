#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const canonRoot = path.resolve(__dirname, '..', '..');
const workspaceRoot = path.resolve(canonRoot, '..');
// Monorepo: canon, client, and admin are all in workspaceRoot

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const laneArg = valueFor('--lane') || 'repo-baseline';
const allowedLanes = new Set(['repo-baseline', 'workspace-sync', 'prompt', 'qa-preflight', 'canon']);

function valueFor(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function commandText(command, commandArgs) {
  return [command, ...commandArgs].join(' ');
}

function run(command, commandArgs, cwd, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
    ...options,
  });

  return {
    command: commandText(command, commandArgs),
    cwd,
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error ? result.error.message : null,
  };
}

function repoExists(repoPath) {
  return fs.existsSync(path.join(repoPath, '.git'));
}

function repoStatus(label, repoPath, options = {}) {
  if (!repoExists(repoPath)) {
    return {
      id: `repo-${label}`,
      label,
      ok: false,
      warning: false,
      details: { repoPath, reason: 'missing .git' },
    };
  }

  const statusRun = run('git', ['status', '--short'], repoPath);
  const branchRun = run('git', ['status', '-sb'], repoPath);
  const aheadRun = run('git', ['rev-list', '--left-right', '--count', 'origin/main...HEAD'], repoPath);
  const lines = statusRun.stdout.split(/\r?\n/).filter(Boolean);
  const unexpected = lines.filter((line) => !(options.allowedStatusLine || (() => false))(line));
  const aligned = aheadRun.status === 0 && aheadRun.stdout.trim() === '0\t0';
  const ok = statusRun.status === 0 && branchRun.status === 0 && aheadRun.status === 0 && unexpected.length === 0 && aligned;

  return {
    id: `repo-${label}`,
    label,
    ok,
    warning: !ok && unexpected.length !== lines.length,
    command: statusRun.command,
    status: statusRun.status,
    details: {
      repoPath,
      branch: branchRun.stdout.trim(),
      aheadBehind: aheadRun.stdout.trim(),
      statusLines: lines,
      allowedStatusLines: lines.filter((line) => !unexpected.includes(line)),
      unexpectedStatusLines: unexpected,
      alignedWithOriginMain: aligned,
    },
  };
}

function check(id, label, runResult, ok, details = {}) {
  return {
    id,
    label,
    ok,
    command: runResult.command,
    cwd: runResult.cwd,
    status: runResult.status,
    details,
    error: runResult.error || null,
    stderr: ok ? '' : runResult.stderr.trim(),
  };
}

function addRepoBaseline(checks) {
  checks.push(repoStatus('monorepo', workspaceRoot, {
    allowedStatusLine: (line) => line === '?? qa-temp/',
  }));
}

function addWorkspaceSync(checks) {
  checks.push(repoStatus('monorepo', workspaceRoot));
}

function addPromptReliability(checks) {
  const smoke = run(process.execPath, ['tools/prompt-lint/reliability-smoke.mjs', '--json'], canonRoot);
  let parsed = null;
  let parseError = null;
  try {
    parsed = JSON.parse(smoke.stdout);
  } catch (error) {
    parseError = error.message;
  }

  checks.push(check(
    'prompt-reliability-smoke',
    'Prompt reliability smoke reports ok true',
    smoke,
    smoke.status === 0 && parsed?.ok === true,
    {
      jsonParsed: Boolean(parsed),
      parseError,
      summary: parsed?.summary || null,
      nonClaims: parsed?.nonClaims || [],
    },
  ));
}

function addQaPreflight(checks) {
  const contractPath = path.join(workspaceRoot, 'scripts', 'qa-runtime-contract-check.cjs');
  if (!fs.existsSync(contractPath)) {
    checks.push({
      id: 'qa-runtime-contract',
      label: 'QA runtime contract checker exists',
      ok: false,
      warning: false,
      details: { contractPath, reason: 'missing checker' },
    });
    return;
  }

  const contract = run(process.execPath, ['scripts/qa-runtime-contract-check.cjs'], workspaceRoot);
  checks.push(check(
    'qa-runtime-contract',
    'QA runtime contract checker passes before harness execution',
    contract,
    contract.status === 0 && contract.stdout.includes('READY_FOR_QA_RUN'),
    {
      safeOutputTail: contract.stdout.split(/\r?\n/).filter(Boolean).slice(-8),
      nonClaims: [
        'does not print secrets',
        'does not start full harness',
        'does not prove production readiness',
      ],
    },
  ));
}

function addCanonChecks(checks) {
  addRepoBaseline(checks);
  addPromptReliability(checks);
  const diffCheck = run('git', ['diff', '--check'], workspaceRoot);
  checks.push(check(
    'canon-diff-check',
    'Canon repo diff has no whitespace errors',
    diffCheck,
    diffCheck.status === 0,
  ));
}

if (!allowedLanes.has(laneArg)) {
  const failure = {
    ok: false,
    lane: laneArg,
    checks: [],
    failures: [`Unsupported lane: ${laneArg}`],
    allowedLanes: Array.from(allowedLanes).sort(),
  };
  output(failure);
  process.exit(2);
}

const checks = [];
if (laneArg === 'repo-baseline') addRepoBaseline(checks);
if (laneArg === 'workspace-sync') addWorkspaceSync(checks);
if (laneArg === 'prompt') addPromptReliability(checks);
if (laneArg === 'qa-preflight') addQaPreflight(checks);
if (laneArg === 'canon') addCanonChecks(checks);

const failures = checks.filter((item) => !item.ok && !item.warning);
const warnings = checks.filter((item) => !item.ok && item.warning);
const report = {
  ok: failures.length === 0,
  lane: laneArg,
  checks,
  summary: {
    total: checks.length,
    passed: checks.filter((item) => item.ok).length,
    warnings: warnings.length,
    failed: failures.length,
  },
  failures: failures.map((item) => item.id),
  warnings: warnings.map((item) => item.id),
  nonClaims: [
    'local/manual gate only',
    'no hooks/CI/runtime enforcement',
    'no product runtime mutation',
    'no DB/Auth/Supabase/browser/provider proof unless the selected lane explicitly runs that checker',
  ],
};

output(report);
process.exit(report.ok ? 0 : 1);

function output(report) {
  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`VSM_GATE: ${report.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Lane: ${report.lane}`);
  for (const item of report.checks) {
    const state = item.ok ? 'PASS' : item.warning ? 'WARN' : 'FAIL';
    console.log(`- ${state} ${item.id}: ${item.label}`);
  }
  if (report.failures.length) console.log(`Failures: ${report.failures.join(', ')}`);
  if (report.warnings.length) console.log(`Warnings: ${report.warnings.join(', ')}`);
  console.log(`Non-claims: ${report.nonClaims.join('; ')}`);
}
