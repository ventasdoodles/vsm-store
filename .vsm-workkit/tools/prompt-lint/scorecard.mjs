#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const promptLintPath = path.join(__dirname, 'prompt-lint.mjs');

const STRICT_THRESHOLD = 85;
const HARD_FAIL_SCORE_CAP = 49;

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
  'FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING',
  'FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING',
  'FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING',
  'FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED',
  'FAIL_ACCEPTANCE_REPO_STATE_MISSING',
  'FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING',
  'FAIL_ACCEPTANCE_NON_CLAIMS_MISSING',
  'FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE',
  'FAIL_LANE_MIXING',
  'FAIL_FRAGILE_INLINE_COMMAND',
  'FAIL_SECRET_INSPECTION_RISK',
]);

const REPAIRABILITY_ORDER = ['no-op', 'template-repairable', 'context-required', 'unsafe-blocked'];

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(values) {
  return [...new Set(values)];
}

function parseArgs(argv) {
  const args = {
    json: false,
    strict: false,
    threshold: STRICT_THRESHOLD,
    promptFile: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      args.json = true;
    } else if (arg === '--strict') {
      args.strict = true;
    } else if (arg === '--threshold') {
      const next = argv[i + 1];
      if (!next || /^--/.test(next)) {
        throw new Error('Missing value for --threshold');
      }
      const parsed = Number(next);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        throw new Error(`Invalid threshold: ${next}`);
      }
      args.threshold = parsed;
      i += 1;
    } else if (!args.promptFile) {
      args.promptFile = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  if (!args.promptFile) {
    throw new Error('Usage: node tools/prompt-lint/scorecard.mjs <prompt-file> [--json] [--strict] [--threshold N]');
  }

  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function normalizePromptPath(inputPath) {
  return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
}

function runPromptLint(promptFile) {
  const result = spawnSync(process.execPath, [promptLintPath, promptFile], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function parseLintFindings(stdout) {
  const findings = [];
  const regex = /^\d+\.\s+(ERROR|WARN|INFO)\s+([A-Z0-9_]+)/gm;
  let match = regex.exec(stdout);
  while (match) {
    findings.push({ severity: match[1], code: match[2] });
    match = regex.exec(stdout);
  }
  return findings;
}

function hardFailCodesFromFindings(findings) {
  return unique(findings.filter((finding) => finding.severity === 'ERROR').map((finding) => finding.code)).sort();
}

function isAcceptanceReport(raw) {
  return /\bVERDICT\b/i.test(raw) && /\bACCEPT(?: WITH RESIDUAL RISK)?\b|\bREJECT\b/i.test(raw);
}

function embeddedCanonPromptText(raw) {
  const marker = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?(?:EXACT CANON PROMPT IF ACCEPTED|EXACT CANON PROMPT|EXACT NEXT CANON PROMPT|EXACT NEXT PROMPT IF ACCEPTED)\s*:?\s*/i.exec(raw);
  return marker ? raw.slice(marker.index) : null;
}

function embeddedCanonPromptCodes(raw) {
  const promptText = embeddedCanonPromptText(raw);
  if (!promptText) return [];

  const requiredPatterns = [
    /\bSTRICT MODE\./i,
    /\bUSE REPO PROCEDURE ABSOLUTE PATH:/i,
    /C:\\dev\\vsm-store-fresh\\.vsm-workkit\\skills\\vsm-canon-reconciliation\\SKILL\.md/i,
    /\bCANON\s*\/\s*DOC RECONCILIATION ONLY\./i,
    /\bVALIDATION\s*\+\s*COMMIT\s*\+\s*PUSH REQUIRED\./i,
    /\bNO SOURCE\/RUNTIME\/TEST CHANGES\./i,
    /\bTarget tool:\s*(?:\r?\n\s*)?Codex\b/i,
    /\bMission objective:/i,
    /\bScope:/i,
    /\bForbidden actions:/i,
    /\bValidation:/i,
    /\bCommit\/push:/i,
    /\bFinal repo checks:/i,
    /\bOutput:/i,
    /\bFOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT\b/i,
    /\bSuccess condition:/i,
    /\bPROMPT QUALITY GATE CHECK:\s*PASS\b/i,
  ];

  return requiredPatterns.every((pattern) => pattern.test(promptText))
    ? []
    : ['FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE'];
}

function acceptanceReportCodes(raw) {
  if (!isAcceptanceReport(raw)) return [];

  const checks = [
    {
      code: 'FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING',
      pattern: /\b(commit|HEAD)\b[\s\S]{0,120}\b([0-9a-f]{7,40}|implemented commit|commit identity)\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING',
      pattern: /\b(scope verdict|scope)\b[\s\S]{0,160}\b(in scope|out of scope|no out-of-scope|unauthorized surface|authorized files)\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING',
      pattern: /\b(validation|verification|evidence)\b[\s\S]{0,220}\b(passed|0 findings|exit\s*0|10\/10|11\/11|git diff --check)\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED',
      pattern: /\b(unauthorized files?|out-of-scope files?|modified files?|diff scope|name-only)\b[\s\S]{0,200}\b(none|not modified|not touched|only authorized|in scope)\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_REPO_STATE_MISSING',
      pattern: /\b(git status -sb|repo (?:is )?clean|clean and aligned|origin\/main|ahead\/behind|0\s+0)\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING',
      pattern: /\bresidual risk(?:s)?\b/i,
    },
    {
      code: 'FAIL_ACCEPTANCE_NON_CLAIMS_MISSING',
      pattern: /\bnon-claims?\b/i,
    },
  ];

  return [
    ...checks
    .filter((check) => !check.pattern.test(raw))
    .map((check) => check.code),
    ...embeddedCanonPromptCodes(raw),
  ];
}

function classifyRepairability(codes) {
  if (codes.length === 0) return 'no-op';
  if (codes.some((code) => CONTEXT_REQUIRED_CODES.has(code))) return 'context-required';
  if (codes.some((code) => UNSAFE_BLOCKED_CODES.has(code))) return 'unsafe-blocked';
  if (codes.every((code) => TEMPLATE_REPAIRABLE_CODES.has(code))) return 'template-repairable';
  return 'unsafe-blocked';
}

function scoreFromPenaltyMap(codes, penalties) {
  const deductions = [];
  let score = 100;

  for (const [code, penalty, reason] of penalties) {
    if (!codes.includes(code)) continue;
    score -= penalty;
    deductions.push({ code, points: penalty, reason });
  }

  return { score: clampScore(score), deductions };
}

function scorePromptStructure(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_MISSING_STRICT_MODE', 25, 'STRICT MODE marker is missing.'],
    ['FAIL_LANE_DECLARATION_MISSING', 25, 'Explicit lane declaration is missing.'],
    ['FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING', 25, 'Repo procedure output contract is incomplete.'],
    ['FAIL_PROMPT_GATE_MISSING', 25, 'Quality gate footer or required section is missing.'],
  ]);
}

function scoreLanePurity(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_LANE_MIXING', 50, 'Prompt mixes lane obligations or omits lane-critical sections.'],
    ['FAIL_READONLY_WITH_COMMIT_PUSH', 50, 'Read-only boundaries were violated with commit/push language.'],
    ['FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH', 25, 'Implementation lane obligations are incomplete.'],
    ['FAIL_CANON_WITHOUT_COMMIT_PUSH', 25, 'Canon lane obligations are incomplete.'],
  ]);
}

function scoreTargetToolRole(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_TARGET_TOOL_MISSING', 50, 'Target tool declaration is missing.'],
    ['FAIL_TARGET_TOOL_NOT_CODEX', 50, 'Target tool is not Codex.'],
    ['FAIL_STALE_EXTERNAL_TOOL_NAME', 20, 'Stale external tool wording appears.'],
  ]);
}

function scoreProcedurePath(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_RELATIVE_SKILL_PATH', 50, 'Repo procedure path is relative.'],
    ['FAIL_SKILL_PATH_NOT_FOUND', 50, 'Repo procedure path does not resolve cleanly.'],
  ]);
}

function scoreForbiddenSafety(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_READONLY_WITH_COMMIT_PUSH', 40, 'Read-only scope is violated.'],
    ['FAIL_SECRET_INSPECTION_RISK', 60, 'Secret/session/storage inspection wording is present.'],
    ['FAIL_FRAGILE_INLINE_COMMAND', 30, 'Fragile inline command pattern is present.'],
  ]);
}

function scoreNonClaims(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_NON_CLAIMS_MISSING', 100, 'Required non-claims / residual-risk language is missing.'],
  ]);
}

function scoreGitEvidence(codes) {
  return scoreFromPenaltyMap(codes, [
    ['FAIL_BASELINE_CHECKS_MISSING', 34, 'Baseline git checks are missing.'],
    ['FAIL_GIT_COMPLETENESS_MISSING', 33, 'Git completeness requirements are missing.'],
    ['FAIL_FINAL_REPO_CHECKS_MISSING', 33, 'Final repo git checks are missing.'],
  ]);
}

function scoreRepairability(repairability) {
  const scoreMap = {
    'no-op': 100,
    'template-repairable': 90,
    'context-required': 75,
    'unsafe-blocked': 50,
  };

  return {
    score: scoreMap[repairability] ?? 0,
    deductions: repairability === 'no-op'
      ? []
      : [{ code: `REPAIRABILITY_${repairability.toUpperCase().replace(/-/g, '_')}`, points: 100 - (scoreMap[repairability] ?? 0), reason: `Repairability classified as ${repairability}.` }],
  };
}

function scoreBlockedRepair(raw, repairability) {
  if (repairability !== 'context-required') {
    return {
      score: 100,
      deductions: [],
      note: 'Not applicable for this prompt.',
    };
  }

  if (/REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT/i.test(raw)) {
    return {
      score: 100,
      deductions: [],
      note: 'Blocked-repair code is present.',
    };
  }

  return {
    score: 60,
    deductions: [
      {
        code: 'REPAIR_BLOCKED_MISSING_AUTHORITATIVE_CONTEXT',
        points: 40,
        reason: 'Context-required prompt did not explicitly preserve the blocked-repair code.',
      },
    ],
    note: 'Context-required prompt is missing the blocked-repair code.',
  };
}

function scoreRegressionDrift(codes) {
  const uniqueCodes = unique(codes);
  const deductions = [];
  let score = 100;
  if (uniqueCodes.length > 0) {
    const penalty = Math.min(60, uniqueCodes.length * 10);
    score -= penalty;
    deductions.push({
      code: 'REGRESSION_DRIFT',
      points: penalty,
      reason: `Prompt emits ${uniqueCodes.length} unique hard fail code${uniqueCodes.length === 1 ? '' : 's'}.`,
    });
  }
  return { score: clampScore(score), deductions };
}

function scoreAcceptanceAudit(codes, raw) {
  if (!isAcceptanceReport(raw)) {
    return {
      score: 100,
      deductions: [],
      note: 'Not applicable for this prompt.',
    };
  }

  return scoreFromPenaltyMap(codes, [
    ['FAIL_ACCEPTANCE_COMMIT_IDENTITY_MISSING', 25, 'Acceptance report does not verify commit identity.'],
    ['FAIL_ACCEPTANCE_SCOPE_VERDICT_MISSING', 25, 'Acceptance report does not verify scope.'],
    ['FAIL_ACCEPTANCE_VALIDATION_EVIDENCE_MISSING', 25, 'Acceptance report does not check validation evidence.'],
    ['FAIL_ACCEPTANCE_UNAUTHORIZED_FILES_UNCHECKED', 25, 'Acceptance report does not check unauthorized file modifications.'],
    ['FAIL_ACCEPTANCE_REPO_STATE_MISSING', 25, 'Acceptance report does not confirm repo cleanliness/alignment.'],
    ['FAIL_ACCEPTANCE_RESIDUAL_RISKS_MISSING', 25, 'Acceptance report omits residual risks.'],
    ['FAIL_ACCEPTANCE_NON_CLAIMS_MISSING', 25, 'Acceptance report omits non-claims.'],
    ['FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE', 25, 'Embedded exact canon prompt is incomplete.'],
  ]);
}

function sumScores(categoryScores) {
  const values = Object.values(categoryScores);
  return clampScore(values.reduce((total, value) => total + value, 0) / values.length);
}

function capHardFailScore(score, hardFailCodes) {
  if (hardFailCodes.length === 0) {
    return {
      overallScore: score,
      cap: {
        applied: false,
        maxScore: null,
        uncappedOverallScore: score,
      },
    };
  }

  return {
    overallScore: Math.min(score, HARD_FAIL_SCORE_CAP),
    cap: {
      applied: score > HARD_FAIL_SCORE_CAP,
      maxScore: HARD_FAIL_SCORE_CAP,
      uncappedOverallScore: score,
    },
  };
}

function buildReport(promptFile) {
  const normalizedPromptFile = normalizePromptPath(promptFile);
  if (!fs.existsSync(normalizedPromptFile)) {
    throw new Error(`Prompt file not found: ${normalizedPromptFile}`);
  }

  const raw = readText(normalizedPromptFile);
  const lintRun = runPromptLint(normalizedPromptFile);
  const lintFindings = parseLintFindings(lintRun.stdout);
  const acceptanceReport = isAcceptanceReport(raw);
  const lintHardFailCodes = acceptanceReport ? [] : hardFailCodesFromFindings(lintFindings);
  const hardFailCodes = unique([...lintHardFailCodes, ...acceptanceReportCodes(raw)]).sort();
  const repairability = classifyRepairability(hardFailCodes);

  const promptStructure = scorePromptStructure(hardFailCodes);
  const lanePurity = scoreLanePurity(hardFailCodes);
  const targetToolRole = scoreTargetToolRole(hardFailCodes);
  const procedurePath = scoreProcedurePath(hardFailCodes);
  const forbiddenActionsSafety = scoreForbiddenSafety(hardFailCodes);
  const nonClaimsResidualRisk = scoreNonClaims(hardFailCodes);
  const gitEvidenceCompleteness = scoreGitEvidence(hardFailCodes);
  const repairabilityClassification = scoreRepairability(repairability);
  const blockedRepairCorrectness = scoreBlockedRepair(raw, repairability);
  const regressionDrift = scoreRegressionDrift(hardFailCodes);
  const acceptanceAuditCompleteness = scoreAcceptanceAudit(hardFailCodes, raw);

  const categoryScores = {
    promptStructure: promptStructure.score,
    lanePurity: lanePurity.score,
    targetToolRole: targetToolRole.score,
    procedurePath: procedurePath.score,
    forbiddenActionsSafety: forbiddenActionsSafety.score,
    nonClaimsResidualRisk: nonClaimsResidualRisk.score,
    gitEvidenceCompleteness: gitEvidenceCompleteness.score,
    repairabilityClassification: repairabilityClassification.score,
    blockedRepairCorrectness: blockedRepairCorrectness.score,
    regressionDrift: regressionDrift.score,
    acceptanceAuditCompleteness: acceptanceAuditCompleteness.score,
  };

  const uncappedOverallScore = sumScores(categoryScores);
  const cappedScore = capHardFailScore(uncappedOverallScore, hardFailCodes);
  const overallScore = cappedScore.overallScore;
  const findingSummary = hardFailCodes.length === 0 ? ['No hard fail codes.'] : hardFailCodes.map((code) => `- ${code}`);
  const recommendedNextAction = overallScore >= STRICT_THRESHOLD && hardFailCodes.length === 0
    ? 'Prompt is strong enough for the current lane.'
    : 'Revise the prompt before execution.';

  return {
    promptFile: normalizedPromptFile,
    threshold: STRICT_THRESHOLD,
    overallScore,
    uncappedOverallScore,
    hardFailScoreCap: cappedScore.cap,
    categoryScores,
    hardFailCodes,
    repairability,
    blockedRepairCorrectness: {
      score: blockedRepairCorrectness.score,
      note: blockedRepairCorrectness.note,
    },
    findingsSummary: findingSummary,
    deductions: {
      promptStructure: promptStructure.deductions,
      lanePurity: lanePurity.deductions,
      targetToolRole: targetToolRole.deductions,
      procedurePath: procedurePath.deductions,
      forbiddenActionsSafety: forbiddenActionsSafety.deductions,
      nonClaimsResidualRisk: nonClaimsResidualRisk.deductions,
      gitEvidenceCompleteness: gitEvidenceCompleteness.deductions,
      repairabilityClassification: repairabilityClassification.deductions,
      blockedRepairCorrectness: blockedRepairCorrectness.deductions,
      regressionDrift: regressionDrift.deductions,
      acceptanceAuditCompleteness: acceptanceAuditCompleteness.deductions,
    },
    recommendedNextAction,
    strictWouldFail: overallScore < STRICT_THRESHOLD || hardFailCodes.length > 0,
  };
}

function printHuman(report, strictMode) {
  console.log('Prompt Scorecard Report');
  console.log(`File: ${report.promptFile}`);
  console.log(`Mode: ${strictMode ? 'strict' : 'default'}`);
  console.log(`Threshold: ${report.threshold}`);
  console.log(`Overall score: ${report.overallScore}/100`);
  if (report.hardFailScoreCap.applied) {
    console.log(`Hard-fail score cap: ${report.hardFailScoreCap.maxScore}/100 (uncapped ${report.uncappedOverallScore}/100)`);
  }
  console.log(`Repairability: ${report.repairability}`);
  console.log(`Hard fail codes: ${report.hardFailCodes.join(', ') || '(none)'}`);
  console.log('Category scores:');
  for (const key of Object.keys(report.categoryScores)) {
    console.log(`  ${key}: ${report.categoryScores[key]}/100`);
  }
  console.log('Findings summary:');
  for (const line of report.findingsSummary) {
    console.log(`  ${line}`);
  }
  console.log('Deductions:');
  for (const [category, deductions] of Object.entries(report.deductions)) {
    if (deductions.length === 0) {
      console.log(`  ${category}: none`);
      continue;
    }
    for (const deduction of deductions) {
      console.log(`  ${category}: -${deduction.points} (${deduction.code}) ${deduction.reason}`);
    }
  }
  console.log(`Blocked-repair correctness note: ${report.blockedRepairCorrectness.note}`);
  console.log(`Recommended next action: ${report.recommendedNextAction}`);
  console.log(`Strict would fail: ${report.strictWouldFail ? 'yes' : 'no'}`);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const report = buildReport(args.promptFile);
    if (args.json) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } else {
      printHuman(report, args.strict);
    }
    process.exit(args.strict && report.strictWouldFail ? 1 : 0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
