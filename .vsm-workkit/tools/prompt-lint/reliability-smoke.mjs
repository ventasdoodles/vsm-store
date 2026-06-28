#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const unknownArgs = args.filter((arg) => arg !== '--json');

const nonClaims = [
  'local/manual only',
  'no repair',
  'no hooks/CI/automation',
  'no runtime/product/DB/Auth/Supabase/browser/provider proof',
];

const expectedCoverage = {
  failCodesTotal: 28,
  failCodesCovered: 28,
  failCodesPartial: 0,
  failCodesUncovered: 0,
  historicalRegressionsTotal: 19,
  historicalRegressionsCovered: 19,
};

const hardFailFixtures = [
  {
    fixture: 'tools/prompt-lint/fixtures/fail/canon-with-no-commit-no-push.txt',
    code: 'FAIL_CANON_WITHOUT_COMMIT_PUSH',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/canon-with-no-commit-only.txt',
    code: 'FAIL_CANON_WITHOUT_COMMIT_PUSH',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/canon-with-no-push-only.txt',
    code: 'FAIL_CANON_WITHOUT_COMMIT_PUSH',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/skill-path-not-found.txt',
    code: 'FAIL_SKILL_PATH_NOT_FOUND',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/fragile-inline-command.txt',
    code: 'FAIL_FRAGILE_INLINE_COMMAND',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/procedure-output-format-missing.txt',
    code: 'FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/missing-target-tool.txt',
    code: 'FAIL_TARGET_TOOL_MISSING',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/stale-active-external-tool-wording.txt',
    code: 'FAIL_STALE_EXTERNAL_TOOL_NAME',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/procedure-path-missing.txt',
    code: 'FAIL_SKILL_PATH_NOT_FOUND',
  },
  {
    fixture: 'tools/prompt-lint/fixtures/fail/acceptance-report-incomplete-canon-prompt.txt',
    code: 'FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE',
  },
];

function commandText(commandArgs) {
  return ['node', ...commandArgs].join(' ');
}

function runNode(commandArgs) {
  const result = spawnSync(process.execPath, commandArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  });

  return {
    command: commandText(commandArgs),
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    error: result.error ? result.error.message : null,
  };
}

function parseJson(stdout) {
  try {
    return { ok: true, value: JSON.parse(stdout) };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function makeCheck(id, label, run, ok, details = {}) {
  const check = {
    id,
    label,
    ok,
    command: run.command,
    status: run.status,
    details,
  };

  if (run.error) check.error = run.error;
  if (!ok && run.stderr.trim()) check.stderr = run.stderr.trim();
  return check;
}

function statusPassed(run) {
  return !run.error && run.status === 0;
}

function exactCoverageMatches(report) {
  const failCodes = report?.summary?.failCodes;
  const failCodeStatus = failCodes?.byStatus;
  const regressions = report?.summary?.historicalRegressions;
  const regressionStatus = regressions?.byStatus;

  return Boolean(
    report?.ok === true
      && failCodes?.total === expectedCoverage.failCodesTotal
      && failCodeStatus?.covered === expectedCoverage.failCodesCovered
      && failCodeStatus?.partial === expectedCoverage.failCodesPartial
      && failCodeStatus?.uncovered === expectedCoverage.failCodesUncovered
      && regressions?.total === expectedCoverage.historicalRegressionsTotal
      && regressionStatus?.covered === expectedCoverage.historicalRegressionsCovered,
  );
}

function coverageSummaryFrom(report) {
  const failCodes = report?.summary?.failCodes;
  const failCodeStatus = failCodes?.byStatus;
  const regressions = report?.summary?.historicalRegressions;
  const regressionStatus = regressions?.byStatus;

  return {
    failCodesTotal: failCodes?.total ?? null,
    failCodesCovered: failCodeStatus?.covered ?? null,
    failCodesPartial: failCodeStatus?.partial ?? null,
    failCodesUncovered: failCodeStatus?.uncovered ?? null,
    historicalRegressionsTotal: regressions?.total ?? null,
    historicalRegressionsCovered: regressionStatus?.covered ?? null,
  };
}

function addEvalCoverageChecks(checks) {
  const human = runNode(['tools/prompt-lint/eval-coverage.mjs']);
  checks.push(makeCheck(
    'eval-coverage-human',
    'eval coverage human report exits 0',
    human,
    statusPassed(human),
  ));

  const json = runNode(['tools/prompt-lint/eval-coverage.mjs', '--json']);
  const parsed = parseJson(json.stdout);
  const ok = statusPassed(json) && parsed.ok && exactCoverageMatches(parsed.value);

  checks.push(makeCheck(
    'eval-coverage-json',
    'eval coverage JSON is valid and matches current summary',
    json,
    ok,
    {
      jsonParsed: parsed.ok,
      coverage: parsed.ok ? coverageSummaryFrom(parsed.value) : null,
      expectedCoverage,
      parseError: parsed.ok ? null : parsed.error,
    },
  ));

  return parsed.ok ? coverageSummaryFrom(parsed.value) : null;
}

function addSimpleExitCheck(checks, id, label, commandArgs) {
  const run = runNode(commandArgs);
  checks.push(makeCheck(id, label, run, statusPassed(run)));
}

function addSafePromptLintCheck(checks, fixture) {
  const run = runNode(['tools/prompt-lint/prompt-lint.mjs', fixture, '--strict']);
  const hasZeroFindings = /Findings:\s*0\b/.test(run.stdout);
  checks.push(makeCheck(
    `safe-${path.basename(fixture, '.txt')}`,
    `${fixture} exits 0 with 0 findings`,
    run,
    statusPassed(run) && hasZeroFindings,
    { zeroFindings: hasZeroFindings },
  ));
}

function addHardFailChecks(checks) {
  for (const entry of hardFailFixtures) {
    const run = runNode(['tools/prompt-lint/prompt-lint.mjs', entry.fixture, '--strict']);
    const emittedExpectedCode = run.stdout.includes(entry.code);
    checks.push(makeCheck(
      `hard-fail-${path.basename(entry.fixture, '.txt')}`,
      `${entry.fixture} strict mode emits ${entry.code}`,
      run,
      !run.error && run.status !== 0 && emittedExpectedCode,
      {
        expectedCode: entry.code,
        emittedExpectedCode,
        expectedNonzeroExit: true,
      },
    ));
  }
}

function addScorecardHardCapCheck(checks) {
  const fixture = 'tools/prompt-lint/fixtures/scorecard/canon-with-no-commit-no-push.txt';
  const run = runNode(['tools/prompt-lint/scorecard.mjs', fixture, '--json']);
  const parsed = parseJson(run.stdout);
  const report = parsed.value;
  const uncappedScoreAvailable = typeof report?.uncappedOverallScore === 'number';
  const capAvailable = typeof report?.hardFailScoreCap?.maxScore === 'number';
  const ok = statusPassed(run)
    && parsed.ok
    && typeof report?.overallScore === 'number'
    && report.overallScore <= 49
    && uncappedScoreAvailable
    && capAvailable;

  checks.push(makeCheck(
    'scorecard-hard-fail-cap',
    'scorecard hard-fail fixture caps overallScore at 49 or lower',
    run,
    ok,
    {
      jsonParsed: parsed.ok,
      overallScore: report?.overallScore ?? null,
      uncappedOverallScore: report?.uncappedOverallScore ?? null,
      hardFailScoreCap: report?.hardFailScoreCap ?? null,
      uncappedScoreAvailable,
      parseError: parsed.ok ? null : parsed.error,
    },
  ));
}

function addEmbeddedCanonPromptRegressionCheck(checks) {
  const fixture = 'tools/prompt-lint/fixtures/scorecard/acceptance-bad-incomplete-canon-prompt.txt';
  const expectedCode = 'FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE';
  const run = runNode(['tools/prompt-lint/scorecard.mjs', fixture, '--json']);
  const parsed = parseJson(run.stdout);
  const report = parsed.value;
  const hardFailCodes = report?.hardFailCodes ?? [];
  const emittedExpectedCode = hardFailCodes.includes(expectedCode);
  const ok = statusPassed(run)
    && parsed.ok
    && emittedExpectedCode
    && typeof report?.overallScore === 'number'
    && report.overallScore <= 49;

  checks.push(makeCheck(
    'scorecard-incomplete-embedded-canon-prompt',
    'scorecard hard-fails incomplete embedded canon prompt in acceptance report',
    run,
    ok,
    {
      jsonParsed: parsed.ok,
      expectedCode,
      hardFailCodes,
      emittedExpectedCode,
      overallScore: report?.overallScore ?? null,
      parseError: parsed.ok ? null : parsed.error,
    },
  ));
}

function addExcellentScorecardCheck(checks) {
  const fixture = 'tools/prompt-lint/fixtures/scorecard/excellent-prompt.txt';
  const run = runNode(['tools/prompt-lint/scorecard.mjs', fixture, '--json']);
  const parsed = parseJson(run.stdout);
  const report = parsed.value;
  const ok = statusPassed(run) && parsed.ok && report?.overallScore === 100;

  checks.push(makeCheck(
    'scorecard-excellent',
    'excellent scorecard fixture remains 100',
    run,
    ok,
    {
      jsonParsed: parsed.ok,
      overallScore: report?.overallScore ?? null,
      parseError: parsed.ok ? null : parsed.error,
    },
  ));
}

function buildReport() {
  const checks = [];
  let coverageSummary = null;

  if (unknownArgs.length > 0) {
    const failures = unknownArgs.map((arg) => ({
      id: 'unknown-argument',
      label: `Unknown argument: ${arg}`,
    }));

    return {
      ok: false,
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: failures.length,
        coverage: null,
      },
      failures,
      nonClaims,
    };
  }

  coverageSummary = addEvalCoverageChecks(checks);
  addSimpleExitCheck(checks, 'scorecard-evals', 'scorecard evals pass', ['tools/prompt-lint/scorecard-evals.mjs']);
  addSimpleExitCheck(checks, 'repair-evals-strict', 'repair evals strict pass', ['tools/prompt-lint/repair-evals.mjs', '--strict']);
  addSafePromptLintCheck(checks, 'tools/prompt-lint/fixtures/pass/canon-safe.txt');
  addSafePromptLintCheck(checks, 'tools/prompt-lint/fixtures/pass/implementation-safe.txt');
  addHardFailChecks(checks);
  addScorecardHardCapCheck(checks);
  addEmbeddedCanonPromptRegressionCheck(checks);
  addExcellentScorecardCheck(checks);

  const failures = checks
    .filter((check) => !check.ok)
    .map((check) => ({
      id: check.id,
      label: check.label,
      command: check.command,
      status: check.status,
      details: check.details,
      error: check.error ?? null,
    }));

  return {
    ok: failures.length === 0,
    checks,
    summary: {
      total: checks.length,
      passed: checks.length - failures.length,
      failed: failures.length,
      coverage: coverageSummary,
    },
    failures,
    nonClaims,
  };
}

function printHuman(report) {
  console.log(`Prompt Reliability Smoke: ${report.ok ? 'PASS' : 'FAIL'}`);
  console.log(`Checks: ${report.summary.passed}/${report.summary.total} passed`);

  if (report.summary.coverage) {
    const coverage = report.summary.coverage;
    console.log(
      `Coverage: fail codes ${coverage.failCodesCovered}/${coverage.failCodesTotal}, partial ${coverage.failCodesPartial}, uncovered ${coverage.failCodesUncovered}; historical regressions ${coverage.historicalRegressionsCovered}/${coverage.historicalRegressionsTotal}`,
    );
  } else {
    console.log('Coverage: unavailable');
  }

  if (report.failures.length > 0) {
    console.log('');
    console.log('Failed checks:');
    for (const failure of report.failures) {
      console.log(`- ${failure.id}: ${failure.label}`);
      console.log(`  command: ${failure.command}`);
      console.log(`  status: ${failure.status}`);
      if (failure.error) console.log(`  error: ${failure.error}`);
    }
  }

  console.log('');
  console.log('Non-claims:');
  for (const nonClaim of report.nonClaims) {
    console.log(`- ${nonClaim}`);
  }
}

const report = buildReport();

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  printHuman(report);
}

process.exit(report.ok ? 0 : 1);
