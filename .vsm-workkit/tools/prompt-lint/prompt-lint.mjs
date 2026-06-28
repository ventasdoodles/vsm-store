#!/usr/bin/env node
import fs from 'node:fs';

const SUPPORTED_SKILLS = new Set([
  'vsm-readiness',
  'vsm-implementation',
  'vsm-acceptance-audit',
  'vsm-canon-reconciliation',
  'vsm-real-system-qa',
  'vsm-browser-visual-qa',
  'vsm-high-risk-lane',
  'vsm-controlled-rollout',
]);

const SKILL_ROOT = 'C:\\dev\\vsm-store-fresh\\.vsm-workkit\\skills';

const args = process.argv.slice(2);
let strict = false;
const positional = [];

for (const arg of args) {
  if (arg === '--strict') {
    strict = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log('Usage: node tools/prompt-lint/prompt-lint.mjs <prompt-file> [--strict]');
    console.log('');
    console.log('Local/manual prompt lint helper for exact-next-prompt text files.');
    console.log('Also supports acceptance audit reports by checking embedded exact canon prompts when present.');
    console.log('');
    console.log('Options:');
    console.log('  --strict   Exit nonzero when ERROR findings exist.');
    console.log('  --help     Show this help text.');
    process.exit(0);
  } else {
    positional.push(arg);
  }
}

if (positional.length !== 1) {
  console.error('Usage: node tools/prompt-lint/prompt-lint.mjs <prompt-file> [--strict]');
  process.exit(1);
}

const promptPath = positional[0];

if (!fs.existsSync(promptPath)) {
  console.error(`Prompt file not found: ${promptPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(promptPath, 'utf8');
const lines = raw.split(/\r?\n/);

const findings = [];

function addFinding(severity, code, message, lineNumber = null, evidence = null) {
  findings.push({ severity, code, message, lineNumber, evidence });
}

function addUniqueFinding(severity, code, message, lineNumber = null, evidence = null) {
  if (
    findings.some(
      (finding) =>
        finding.severity === severity &&
        finding.code === code &&
        finding.message === message &&
        finding.lineNumber === lineNumber &&
        finding.evidence === evidence,
    )
  ) {
    return;
  }

  addFinding(severity, code, message, lineNumber, evidence);
}

function hasAny(patterns) {
  return patterns.some((pattern) => pattern.test(raw));
}

function hasAll(patterns) {
  return patterns.every((pattern) => pattern.test(raw));
}

function findLineNumber(regex) {
  const index = lines.findIndex((line) => regex.test(line));
  return index >= 0 ? index + 1 : null;
}

function hasLine(regex) {
  return lines.some((line) => regex.test(line));
}

function isSectionHeading(line) {
  return /^\s*[A-Za-z][A-Za-z0-9 \/&-]*:\s*$/.test(line);
}

function getSectionBlock(labelRegex) {
  for (let i = 0; i < lines.length; i += 1) {
    if (!labelRegex.test(lines[i])) continue;

    const block = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      if (j > i + 1 && isSectionHeading(lines[j])) break;
      block.push(lines[j]);
    }

    return { lineNumber: i + 1, lines: block };
  }

  return null;
}

function sectionHasAll(section, patterns) {
  return Boolean(section && patterns.every((pattern) => section.lines.some((line) => pattern.test(line))));
}

function getSectionValue(labelRegex) {
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!labelRegex.test(line)) continue;

    const afterColon = line.includes(':') ? line.split(':').slice(1).join(':').trim() : '';
    if (afterColon) {
      return { value: afterColon, lineNumber: i + 1 };
    }

    for (let j = i + 1; j < lines.length; j += 1) {
      const nextLine = lines[j].trim();
      if (nextLine) {
        return { value: nextLine, lineNumber: j + 1 };
      }
    }
  }

  return null;
}

function hasNegation(line) {
  return /\b(do not|don't|must not|never|no|not|forbid|forbidden)\b/i.test(line);
}

function isAcceptanceReport(rawText) {
  return /\bVERDICT\b/i.test(rawText) && /\bACCEPT(?: WITH RESIDUAL RISK)?\b|\bREJECT\b/i.test(rawText);
}

function embeddedCanonPromptText(rawText) {
  const marker = /(?:^|\n)\s*(?:#{1,6}\s*)?(?:\d+\.\s*)?(?:EXACT CANON PROMPT IF ACCEPTED|EXACT CANON PROMPT|EXACT NEXT CANON PROMPT|EXACT NEXT PROMPT IF ACCEPTED)\s*:?\s*/i.exec(rawText);
  return marker ? rawText.slice(marker.index) : null;
}

function embeddedCanonPromptIsComplete(rawText) {
  const promptText = embeddedCanonPromptText(rawText);
  if (!promptText) return true;

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

  return requiredPatterns.every((pattern) => pattern.test(promptText));
}

const acceptanceReport = isAcceptanceReport(raw);

if (acceptanceReport && !embeddedCanonPromptIsComplete(raw)) {
  addUniqueFinding(
    'ERROR',
    'FAIL_ACCEPTANCE_EMBEDDED_CANON_PROMPT_INCOMPLETE',
    'Acceptance report contains an incomplete embedded exact canon prompt.',
    findLineNumber(/(?:EXACT CANON PROMPT IF ACCEPTED|EXACT CANON PROMPT|EXACT NEXT CANON PROMPT|EXACT NEXT PROMPT IF ACCEPTED)/i),
  );
}

const targetToolSection = getSectionValue(/^\s*target tool\s*:/i);
if (!acceptanceReport) {
  if (!targetToolSection) {
    addUniqueFinding('ERROR', 'FAIL_TARGET_TOOL_MISSING', 'Target tool block is missing.');
  } else {
    const value = targetToolSection.value.trim();
    const targetValue = value.split(',')[0].trim();

    if (!targetValue) {
      addUniqueFinding(
        'ERROR',
        'FAIL_TARGET_TOOL_MISSING',
        'Target tool block is present but empty.',
        targetToolSection.lineNumber,
        targetToolSection.value,
      );
    } else {
      if (!/codex/i.test(targetValue)) {
        addUniqueFinding(
          'ERROR',
          'FAIL_TARGET_TOOL_NOT_CODEX',
          'Target tool is declared but not Codex.',
          targetToolSection.lineNumber,
          targetValue,
        );
      }

      if (!/codex/i.test(targetValue) && /\b(anty|chatgpt|openai|claude|gemini|cursor|copilot)\b/i.test(targetValue)) {
        addUniqueFinding(
          'ERROR',
          'FAIL_STALE_EXTERNAL_TOOL_NAME',
          'Stale external tool wording is being used as the active target.',
          targetToolSection.lineNumber,
          targetValue,
        );
      }
    }
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (hasNegation(line) || /\bcodex\b/i.test(line)) continue;
    if (/\b(use|run|execute|send to|handoff to|hand off to|target tool)\b.{0,80}\b(chatgpt|claude|gemini|cursor|copilot)\b/i.test(line)) {
      addUniqueFinding(
        'ERROR',
        'FAIL_STALE_EXTERNAL_TOOL_NAME',
        'Stale external tool wording is being used as an active instruction.',
        i + 1,
        line.trim(),
      );
    }
  }
}

const procedureSection = getSectionValue(/^\s*use repo procedure(?: absolute path)?\s*:/i);
const procedureInvoked = /\buse repo procedure\b/i.test(raw);

if (!acceptanceReport && procedureInvoked && !procedureSection) {
  addUniqueFinding(
    'ERROR',
    'FAIL_SKILL_PATH_NOT_FOUND',
    'Repo procedure is invoked without a required absolute skill path.',
  );
}

if (!acceptanceReport && procedureSection) {
  const value = procedureSection.value;
  const absolutePattern = /^C:\\dev\\vsm-store-fresh\\.vsm-workkit\\skills\\([^\\\/]+)\\SKILL\.md$/i;
  const absoluteMatch = value.match(absolutePattern);
  const looksRelative = /(^|[^\w])(?:\.{1,2}[\\/]|skills[\\/])/i.test(value);

  if (!absoluteMatch) {
    if (looksRelative) {
      addUniqueFinding(
        'ERROR',
        'FAIL_RELATIVE_SKILL_PATH',
        'Repo procedure path is relative instead of absolute.',
        procedureSection.lineNumber,
        value,
      );
    } else {
      addUniqueFinding(
        'ERROR',
        'FAIL_SKILL_PATH_NOT_FOUND',
        'Repo procedure path does not resolve to an allowed absolute skill file.',
        procedureSection.lineNumber,
        value,
      );
    }
  } else {
    const skillName = absoluteMatch[1];
    const expectedPath = `${SKILL_ROOT}\\${skillName}\\SKILL.md`;
    if (!SUPPORTED_SKILLS.has(skillName) || !fs.existsSync(expectedPath)) {
      addUniqueFinding(
        'ERROR',
        'FAIL_SKILL_PATH_NOT_FOUND',
        'Referenced skill path is not in the supported registry list or does not exist.',
        procedureSection.lineNumber,
        value,
      );
    }
  }
}

const lanePatterns = {
  readiness: [/ROADMAP\s*\/\s*READINESS ONLY\.?/i],
  acceptanceAudit: [/ACCEPTANCE AUDIT ONLY\.?/i],
  canon: [/CANON\s*\/\s*DOC RECONCILIATION ONLY\.?/i, /CANON RECONCILIATION ONLY\.?/i],
  implementation: [/IMPLEMENTATION AUTHORIZED\.?/i],
  realSystemQa: [/REAL-SYSTEM QA ONLY\.?/i],
  browserVisualQa: [/BROWSER VISUAL QA ONLY\.?/i],
  controlledRollout: [/CONTROLLED ROLLOUT/i],
  readOnly: [/^\s*READ-ONLY\b/i],
};

const hasExplicitLaneDeclaration = Object.values(lanePatterns).some((patterns) => patterns.some((pattern) => hasAny([pattern])));

if (!acceptanceReport && !hasExplicitLaneDeclaration) {
  addUniqueFinding('ERROR', 'FAIL_LANE_DECLARATION_MISSING', 'Prompt is missing an explicit lane declaration.');
}

const isReadOnlyLane = hasAny([
  ...lanePatterns.readiness,
  ...lanePatterns.acceptanceAudit,
  ...lanePatterns.realSystemQa,
  ...lanePatterns.browserVisualQa,
  ...lanePatterns.readOnly,
]);

const isAcceptanceAuditLane = hasAny(lanePatterns.acceptanceAudit);
const isImplementationLane = hasAny(lanePatterns.implementation);
const isCanonLane = hasAny(lanePatterns.canon);
const canonNoCommitPushLines = lines.filter((line) => /\bno commit\b/i.test(line) || /\bno push\b/i.test(line));

if (!acceptanceReport && !/^\s*strict mode\.\s*$/im.test(raw)) {
  addUniqueFinding('ERROR', 'FAIL_MISSING_STRICT_MODE', 'Prompt is missing STRICT MODE.');
}

const outputSectionPresent = hasLine(/^\s*output\s*:/i);
if (!acceptanceReport && procedureInvoked && (!outputSectionPresent || !/FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT/i.test(raw))) {
  addUniqueFinding(
    'ERROR',
    'FAIL_PROCEDURE_OUTPUT_FORMAT_MISSING',
    'Repo procedure invocation requires an Output section with FOLLOW THE PROCEDURE\'S REQUIRED OUTPUT FORMAT.',
  );
}

const requiredReadOnlyMarkers = ['NO COMMIT', 'NO PUSH'];
if (isAcceptanceAuditLane) {
  requiredReadOnlyMarkers.push('NO IMPLEMENTATION', 'NO DOC/CANON CHANGES');
}

if (!acceptanceReport && isReadOnlyLane) {
  const missingMarkers = requiredReadOnlyMarkers.filter((marker) => !new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(raw));
  if (missingMarkers.length > 0 || !hasLine(/^\s*(forbidden actions|constraints)\s*:/i)) {
    addUniqueFinding(
      'ERROR',
      'FAIL_READONLY_CONSTRAINTS_MISSING',
      `Read-only lane is missing required constraints: ${[
        ...missingMarkers,
        !hasLine(/^\s*(forbidden actions|constraints)\s*:/i) ? 'FORBIDDEN ACTIONS / CONSTRAINTS SECTION' : null,
      ]
        .filter(Boolean)
        .join(', ')}.`,
      findLineNumber(/^\s*(read-only|roadmap \/ readiness only|acceptance audit only|canon \/ doc reconciliation only|real-system qa only|browser visual qa only)/i),
    );
  }

  const positiveCommitPushLines = lines.filter(
    (line) =>
      /\b(commit|push)\b/i.test(line) &&
      !/\bno commit\b/i.test(line) &&
      !/\bno push\b/i.test(line) &&
      !/\bdo not\b/i.test(line) &&
      !/\bmust not\b/i.test(line) &&
      !/\bforbidden\b/i.test(line),
  );

  if (positiveCommitPushLines.length > 0) {
    addUniqueFinding(
      'ERROR',
      'FAIL_READONLY_WITH_COMMIT_PUSH',
      'Read-only lane must not ask for commit or push work.',
      findLineNumber(/^\s*(read-only|roadmap \/ readiness only|acceptance audit only|canon \/ doc reconciliation only|real-system qa only|browser visual qa only)/i),
      positiveCommitPushLines[0].trim(),
    );
  }
}

const baselineSection = getSectionBlock(/^\s*baseline\s*:/i);
const validationSection = getSectionBlock(/^\s*validation\s*:/i);

const hasBaselineChecks = sectionHasAll(baselineSection, [
  /git\s+status\s+-sb/i,
  /git\s+rev-list\s+--left-right\s+--count\s+origin\/main\.\.\.HEAD/i,
  /git\s+log\s+-1\s+--oneline/i,
]);

const hasValidationChecks = sectionHasAll(validationSection, [
  /git\s+diff\s+--check/i,
  /git\s+diff\s+--stat/i,
  /git\s+diff\s+--name-only/i,
]);

const hasFinalRepoChecks = hasAll([
  /final\s+git\s+status\s+-sb/i,
  /final\s+git\s+rev-list\s+--left-right\s+--count\s+origin\/main\.\.\.HEAD/i,
  /final\s+git\s+log\s+-1\s+--oneline/i,
]);

const hasStageOnlyAuthorizedFiles = /stage only authorized files/i.test(raw);
const hasCommitInstruction = lines.some(
  (line) =>
    /\bcommit\b/i.test(line) &&
    !/\bno commit\b/i.test(line) &&
    !/\bdo not commit\b/i.test(line) &&
    !/\bmust not commit\b/i.test(line),
);
const hasPushInstruction = lines.some(
  (line) =>
    /\bpush\b/i.test(line) &&
    !/\bno push\b/i.test(line) &&
    !/\bdo not push\b/i.test(line) &&
    !/\bmust not push\b/i.test(line),
);

const implementationOrCanonLane = isImplementationLane || isCanonLane;

if (!acceptanceReport && implementationOrCanonLane && !hasBaselineChecks) {
  addUniqueFinding(
    'ERROR',
    'FAIL_BASELINE_CHECKS_MISSING',
    'Implementation or canon lane is missing baseline git checks.',
  );
}

if (!acceptanceReport && implementationOrCanonLane && (!hasValidationChecks || !hasStageOnlyAuthorizedFiles || !hasCommitInstruction || !hasPushInstruction)) {
  addUniqueFinding(
    'ERROR',
    'FAIL_GIT_COMPLETENESS_MISSING',
    'Implementation or canon lane is missing validation, stage-only, commit, or push requirements.',
  );
  addUniqueFinding(
    'ERROR',
    isImplementationLane ? 'FAIL_IMPLEMENTATION_WITHOUT_COMMIT_PUSH' : 'FAIL_CANON_WITHOUT_COMMIT_PUSH',
    isImplementationLane
      ? 'Implementation lane is missing validation, commit, and push requirements.'
      : 'Canon lane is missing validation, commit, and push requirements.',
  );
}

if (!acceptanceReport && isCanonLane && canonNoCommitPushLines.length > 0) {
  addUniqueFinding(
    'ERROR',
    'FAIL_CANON_WITHOUT_COMMIT_PUSH',
    'Canon reconciliation lane must require commit and push; NO COMMIT / NO PUSH markers are forbidden.',
    lines.indexOf(canonNoCommitPushLines[0]) + 1,
    canonNoCommitPushLines[0].trim(),
  );
}

if (!acceptanceReport && implementationOrCanonLane && !hasFinalRepoChecks) {
  addUniqueFinding(
    'ERROR',
    'FAIL_FINAL_REPO_CHECKS_MISSING',
    'Implementation or canon lane is missing final repo git checks.',
  );
}

if (!acceptanceReport && !hasAny([/^\s*mission objective\s*:/im, /^\s*objective\s*:/im, /^\s*mission\s*:/im])) {
  addUniqueFinding(
    'ERROR',
    'FAIL_LANE_MIXING',
    'Prompt is missing a mission objective or equivalent mission section.',
  );
}

if (
  !acceptanceReport &&
  !hasAny([
    /^\s*scope\s*:/im,
    /^\s*authorized files(?:\/folders)?\s*:/im,
    /^\s*authorized surfaces\s*:/im,
    /\bauthorized files\b/i,
    /\bauthorized surfaces\b/i,
  ])
) {
  addUniqueFinding('ERROR', 'FAIL_LANE_MIXING', 'Prompt is missing scope or authorized files/surfaces.');
}

if (
  !acceptanceReport &&
  !hasAny([
    /\bdo not\b/i,
    /\bmust not\b/i,
    /\bforbidden actions\b/i,
    /\bno commit\b/i,
    /\bno push\b/i,
  ])
) {
  addUniqueFinding('ERROR', 'FAIL_LANE_MIXING', 'Prompt is missing forbidden actions or constraints.');
}

if (!acceptanceReport && !/success condition/i.test(raw)) {
  addUniqueFinding('ERROR', 'FAIL_PROMPT_GATE_MISSING', 'Prompt is missing a success condition section.');
}

if (!acceptanceReport && !/prompt quality gate check:\s*pass/i.test(raw)) {
  addUniqueFinding('ERROR', 'FAIL_PROMPT_GATE_MISSING', 'Prompt is missing PROMPT QUALITY GATE CHECK: PASS.');
}

if (!acceptanceReport && /\b(acceptance|canon|qa|readiness|audit)\b/i.test(raw) && !/\b(non-claims|residual risk|residual risks)\b/i.test(raw)) {
  addUniqueFinding(
    'ERROR',
    'FAIL_NON_CLAIMS_MISSING',
    'Prompt is missing non-claims or residual-risk language for a governance lane.',
  );
}

for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i];
  const normalized = line.toLowerCase();

  const secretRiskTerms = [
    '.env',
    'env.local',
    'localstorage',
    'sessionstorage',
    'cookies',
    'cookie',
    'token',
    'auth header',
    'authorization header',
    'browser storage',
    'provider credentials',
    'credentials',
    'secret',
    'password',
    'private key',
    'refresh token',
    'access token',
    'jwt',
  ];

  const riskyHit = secretRiskTerms.some((term) => normalized.includes(term));
  if (riskyHit && !hasNegation(line)) {
    addUniqueFinding(
      'ERROR',
      'FAIL_SECRET_INSPECTION_RISK',
      'Prompt includes secret/session/storage inspection wording.',
      i + 1,
      line.trim(),
    );
  }

  const fragilePatterns = [
    /\b(get-content|cat|type)\b.*\|\s*(select-string|where-object|foreach-object|select-object)/i,
    /\bselect-string\b.*\|\s*(where-object|foreach-object|select-object)/i,
    /\binvoke-expression\b/i,
    /\bcmd\s*\/c\b/i,
    /\b-join\b/i,
    /\b-split\b/i,
  ];

  if (fragilePatterns.some((pattern) => pattern.test(line))) {
    addUniqueFinding(
      /\binvoke-expression\b|\bcmd\s*\/c\b/i.test(line) ? 'ERROR' : 'WARN',
      'FAIL_FRAGILE_INLINE_COMMAND',
      'Prompt uses a fragile inline command pattern.',
      i + 1,
      line.trim(),
    );
  }
}

const errorCount = findings.filter((finding) => finding.severity === 'ERROR').length;
const warnCount = findings.filter((finding) => finding.severity === 'WARN').length;
const infoCount = findings.filter((finding) => finding.severity === 'INFO').length;

console.log('Prompt Lint Report');
console.log(`File: ${promptPath}`);
console.log(`Mode: ${strict ? 'strict' : 'default'}`);
console.log(`Findings: ${findings.length}`);

if (findings.length === 0) {
  console.log('No findings.');
} else {
  findings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding.severity} ${finding.code}`);
    console.log(`   ${finding.message}`);
    if (finding.lineNumber !== null && finding.lineNumber !== undefined) {
      console.log(`   Line: ${finding.lineNumber}`);
    }
    if (finding.evidence) {
      console.log(`   Evidence: ${finding.evidence}`);
    }
  });
}

console.log(`Summary: ${errorCount} error(s), ${warnCount} warning(s), ${infoCount} info(s)`);

process.exit(strict && errorCount > 0 ? 1 : 0);
