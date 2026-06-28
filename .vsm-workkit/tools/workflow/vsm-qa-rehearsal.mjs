#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const canonRoot = path.resolve(__dirname, '..', '..');
const workspaceRoot = path.resolve(canonRoot, '..');
const clientRoot = path.join(workspaceRoot, 'ivoy1.6');
const adminRoot = path.join(workspaceRoot, 'ivoy-admin');
const clientQaTemp = path.join(clientRoot, 'qa-temp');
const tempRoot = os.tmpdir();
const contractPath = path.join(canonRoot, 'docs', 'operations', 'QA_RUNTIME_CONTRACT.md');
const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

const args = process.argv.slice(2);
const jsonMode = has('--json');
const helpMode = has('--help') || has('-h');
const runHarness = has('--run-harness') || has('--run');
const preflightOnly = has('--preflight-only');
const startDevServersOnly = has('--start-dev-servers-only') || has('--server-smoke-only');
const selfTestRunLabelContract = has('--self-test-run-label-contract');
const dryRun = has('--dry-run') || (!runHarness && !preflightOnly && !startDevServersOnly && !selfTestRunLabelContract);
const startDevServers = has('--start-dev-servers');
const requireEvidence = has('--require-evidence');
const runLabelArg = valueFor('--run-label');
const devServerPorts = [5173, 5174];
const startedDevServerProcesses = [];

const nonClaims = [
  'local/manual runner only',
  'no hooks/CI/runtime enforcement',
  'no automatic enforcement',
  'no product/runtime behavior change',
  'no DB/Auth/Supabase/browser/provider proof created by the runner itself',
  'no production readiness',
  'no real payment, GPS/tracking, notification, courier operation, deploy, or compliance proof',
  'no secret/env/token/cookie/storage inspection',
];

if (helpMode) {
  printHelp();
  process.exit(0);
}

const report = {
  ok: true,
  mode: selfTestRunLabelContract ? 'self-test-run-label-contract' : runHarness ? 'run-harness' : startDevServersOnly ? 'start-dev-servers-only' : preflightOnly ? 'preflight-only' : 'dry-run',
  gates: [],
  devServers: {
    requested: startDevServers || startDevServersOnly,
    started: [],
    stopped: [],
    skipped: !(startDevServers || startDevServersOnly),
    portPrecheck: null,
    listeningCheck: null,
    finalPortCheck: null,
  },
  harness: {
    requested: runHarness,
    ran: false,
    command: null,
    status: null,
    safeOutputTail: [],
    blocker: null,
  },
  evidence: {
    requestedRunLabel: runLabelArg || null,
    source: null,
    runLabel: null,
    labelsFound: [],
    selectedRunLabel: null,
    runLabelMatchesRequested: runLabelArg ? false : null,
    orders: [],
    blockers: [],
  },
  visualEvidence: {
    source: null,
    runLabel: null,
    phase: null,
    customer: null,
    driver: null,
    admin: null,
    blockers: [],
    actionableBridges: [],
  },
  cleanupStatus: 'not-claimed',
  retainedEvidenceStatus: 'not-checked',
  postCleanupVerification: {
    contractCheck: null,
    protectedEvidence: null,
    driverBaseline: null,
  },
  residualRisks: [
    'Evidence extraction reads local scratch/output only and is not DB truth.',
    'Post-cleanup retained evidence remains not-checked unless a separate authorized check proves it.',
    'Visual/browser proof is not created by this runner unless an explicit authorized harness produces it.',
  ],
  nonClaims,
  failures: [],
};

await main();
finish();

async function main() {
  try {
    if (selfTestRunLabelContract) {
      runRunLabelContractSelfTest();
      return;
    }

    if (runLabelArg && !isSafeRunLabel(runLabelArg)) {
      addFailure('BLOCKED_UNSAFE_RUN_LABEL', 'Run label must use only letters, numbers, dot, underscore, or hyphen.');
      return;
    }

    if (!fs.existsSync(path.join(clientRoot, 'scripts', 'qa-runtime-contract-check.cjs'))) {
      addFailure('BLOCKED_RUNTIME_CONTRACT_MISSING', 'Missing client QA runtime contract checker.');
    }

    runGate('repo-baseline');
    runGate('qa-preflight');

    if (preflightOnly) {
      discoverEvidence();
      return;
    }

    if (dryRun) {
      discoverEvidence();
      return;
    }

    if (!report.gates.every((gate) => gate.ok)) {
      addFailure('BLOCKED_QA_PREFLIGHT_FAILED', 'A required gate failed before dev-server or harness execution.');
      discoverEvidence();
      return;
    }

    if (startDevServersOnly) {
      await assertDevServerPortsAvailable();
      if (!report.failures.length) {
        startLocalDevServers();
        if (!report.failures.length) await waitForDevServerPorts();
      }
      return;
    }

    if (!runHarness) {
      addFailure('FAIL_HARNESS_RUN_WITHOUT_EXPLICIT_FLAG', 'Harness execution requires --run-harness or --run.');
      discoverEvidence();
      return;
    }

    if (startDevServers) {
      await assertDevServerPortsAvailable();
      if (report.failures.length) return;
      startLocalDevServers();
      if (report.failures.length) return;
      await waitForDevServerPorts();
      if (report.failures.length) return;
    }

    runMutatingHarness();
    await verifyPostCleanupState();
    discoverEvidence();
  } finally {
    stopStartedDevServers();
    if (report.devServers.started.length) {
      await verifyDevServerPortsReleased();
    }
  }
}

function has(name) {
  return args.includes(name);
}

function valueFor(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function runGate(lane) {
  const gate = runNode(['tools/workflow/vsm-gate.mjs', '--lane', lane, '--json'], canonRoot);
  const parsed = parseJson(gate.stdout);
  const ok = gate.status === 0 && parsed.value?.ok === true;
  const gateReport = {
    lane,
    ok,
    status: gate.status,
    command: gate.command,
    summary: parsed.value?.summary || null,
    failures: parsed.value?.failures || [],
    warnings: parsed.value?.warnings || [],
    parseError: parsed.error,
  };
  report.gates.push(gateReport);

  if (!ok && lane === 'qa-preflight') {
    addFailure('BLOCKED_QA_PREFLIGHT_FAILED', 'qa-preflight did not pass.');
  }
}

function runMutatingHarness() {
  const scriptPath = path.join(clientRoot, 'scripts', 'run-local-multiscenario-qa.ps1');
  if (!fs.existsSync(scriptPath)) {
    addFailure('BLOCKED_RUNTIME_CONTRACT_MISSING', 'Missing local multiscenario QA wrapper.');
    return;
  }

  const harnessEnv = runLabelArg
    ? { QA_SCREENSHOT_DIR: requestedRunLabelEvidenceDir(runLabelArg) }
    : null;

  const result = runCommand('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-Run',
  ], clientRoot, { env: harnessEnv });

  if (runLabelArg) {
    normalizeRunLabelArtifacts(runLabelArg);
  }

  report.harness = {
    requested: true,
    ran: true,
    command: result.command,
    status: result.status,
    safeOutputTail: safeTail(result.stdout, 80),
    blocker: result.status === 0 ? null : 'HARNESS_EXIT_NONZERO',
  };

  if (result.status !== 0) {
    addFailure('HARNESS_EXIT_NONZERO', 'Mutating QA harness exited nonzero.');
  }
}

function startLocalDevServers() {
  if (!runHarness && !startDevServersOnly) {
    addFailure('FAIL_UNAUTHORIZED_MUTATION_RISK', '--start-dev-servers is allowed only with explicit --run-harness.');
    return;
  }

  const targets = [
    {
      label: 'client',
      cwd: clientRoot,
      args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5173'],
    },
    {
      label: 'admin',
      cwd: adminRoot,
      args: ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '5174'],
    },
  ];

  fs.mkdirSync(clientQaTemp, { recursive: true });
  for (const target of targets) {
    const launcher = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm';
    const launcherArgs = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm.cmd', ...target.args]
      : target.args;
    let child;
    try {
      child = spawn(launcher, launcherArgs, {
        cwd: target.cwd,
        detached: false,
        windowsHide: true,
        stdio: 'ignore',
        shell: false,
      });
    } catch (error) {
      addFailure('BLOCKED_DEV_SERVER_START_FAILED', `${target.label} dev-server spawn failed: ${error.message}`);
      continue;
    }
    startedDevServerProcesses.push({ child, label: target.label });
    report.devServers.started.push({
      label: target.label,
      pid: child.pid,
      cwd: target.cwd,
      command: commandText(launcher, launcherArgs),
      port: target.label === 'client' ? 5173 : 5174,
    });
  }
}

function stopStartedDevServers() {
  for (const item of report.devServers.started) {
    if (!item.pid) continue;
    const stop = runCommand('taskkill.exe', ['/PID', String(item.pid), '/T', '/F'], canonRoot);
    report.devServers.stopped.push({
      label: item.label,
      pid: item.pid,
      ok: stop.status === 0,
      status: stop.status,
      error: stop.status === 0 ? null : stop.stderr || stop.stdout || stop.error,
    });
  }
}

async function assertDevServerPortsAvailable() {
  const ports = await checkPortsAvailable(devServerPorts);
  report.devServers.portPrecheck = ports;
  for (const item of ports) {
    if (!item.available) {
      addFailure('BLOCKED_PREEXISTING_DEV_SERVER', `Port ${item.port} is already in use before startup.`);
    }
  }
}

async function waitForDevServerPorts() {
  const deadline = Date.now() + 20000;
  let lastCheck = [];
  while (Date.now() < deadline) {
    lastCheck = await checkPortsListening(devServerPorts);
    if (lastCheck.every((item) => item.listening)) {
      report.devServers.listeningCheck = lastCheck;
      return;
    }
    sleepMs(500);
  }
  report.devServers.listeningCheck = lastCheck;
  addFailure('BLOCKED_DEV_SERVER_START_FAILED', 'Started dev servers did not listen on 5173 and 5174 before timeout.');
}

async function verifyDevServerPortsReleased() {
  await sleepAsync(1500);
  const ports = await checkPortsAvailable(devServerPorts);
  report.devServers.finalPortCheck = ports;
  for (const item of ports) {
    if (!item.available) {
      addFailure('BLOCKED_DEV_SERVER_SHUTDOWN_FAILED', `Port ${item.port} is still in use after runner shutdown.`);
    }
  }
}

function discoverEvidence() {
  const selection = selectEvidenceCandidate();
  report.evidence.labelsFound = selection.labelsFound;
  report.evidence.source = selection.candidate?.source || null;
  report.evidence.runLabel = selection.candidate?.runLabel || null;
  report.evidence.selectedRunLabel = selection.candidate?.runLabel || null;
  report.evidence.runLabelMatchesRequested = runLabelArg
    ? selection.candidate?.runLabel === runLabelArg
    : null;
  discoverVisualEvidence(selection.candidate);

  if (selection.blocker) {
    report.evidence.blockers.push(selection.blocker);
    if (requireEvidence) addFailure(selection.blocker, selection.message);
    return;
  }

  const candidate = selection.candidate;
  if (!candidate) {
    report.evidence.blockers.push('BLOCKED_NO_RUN_LABEL_FOUND');
    if (requireEvidence) addFailure('BLOCKED_NO_RUN_LABEL_FOUND', 'No local run evidence folder or visual-targets.json was found.');
    return;
  }

  const orders = collectOrders(candidate);
  report.evidence.orders = orders;
  if (!orders.length) {
    report.evidence.blockers.push('BLOCKED_NO_ORDER_ID_FOUND');
    if (requireEvidence) addFailure('BLOCKED_NO_ORDER_ID_FOUND', 'No order_id was found in collected local evidence.');
    return;
  }

  const incompleteOrders = incompleteOrderEvidence(orders);
  if (incompleteOrders.length) {
    report.evidence.blockers.push('BLOCKED_INCOMPLETE_ORDER_EVIDENCE');
    if (requireEvidence) {
      addFailure(
        'BLOCKED_INCOMPLETE_ORDER_EVIDENCE',
        'Required evidence needs order status, event/offer/wallet counts, cleanup facts, and a successful evidence-ledger derivation.'
      );
    }
    return;
  }

  report.cleanupStatus = orders.every((order) => order.cleanup === 'PASS') ? 'PASS' : 'unknown';
}

function discoverVisualEvidence(candidate) {
  const visualTargets = readBestVisualTargets(candidate);
  if (!visualTargets.payload) {
    report.visualEvidence.blockers.push('BLOCKED_VISUAL_TARGETS_MISSING');
    if (requireEvidence) {
      addFailure('BLOCKED_VISUAL_TARGETS_MISSING', 'No visual-targets handoff was found in local scratch evidence.');
    }
    return;
  }

  report.visualEvidence.source = visualTargets.source;
  report.visualEvidence.runLabel = visualTargets.payload.runLabel || null;
  report.visualEvidence.phase = visualTargets.payload.cleanupCompleted === true ? 'post-cleanup' : 'pre-cleanup';

  const handoff = visualTargets.payload.visualEvidenceHandoff;
  const surfaces = handoff?.surfaces && typeof handoff.surfaces === 'object' ? handoff.surfaces : {};
  const customer = resolveCustomerVisualSurface(surfaces.customer, visualTargets.payload, candidate);
  const driver = normalizeVisualSurface('driver', surfaces.driver, visualTargets.payload.driverVisualTarget);
  const admin = normalizeVisualSurface('admin', surfaces.admin, visualTargets.payload.adminVisualTarget);
  report.visualEvidence.customer = customer;
  report.visualEvidence.driver = driver;
  report.visualEvidence.admin = admin;

  for (const target of [visualTargets.payload.driverVisualTarget, visualTargets.payload.adminVisualTarget]) {
    if (target?.bridge?.code) {
      report.visualEvidence.actionableBridges.push({
        targetCode: target.code || null,
        bridgeCode: target.bridge.code,
        action: target.bridge.action || null,
      });
    }
  }

  if (customer.verdict !== 'PASS') {
    const customerCode = customer.blockerCode
      || (visualTargets.payload.cleanupCompleted === true && visualTargets.payload.inspectionRequiredBeforeCleanup === true
        ? 'CUSTOMER_TARGET_EXPIRED'
        : 'CUSTOMER_VISUAL_ASSERTION_BLOCKED');
    report.visualEvidence.blockers.push(customerCode);
    if (requireEvidence) {
      addFailure(customerCode, 'Customer visual proof was not preserved as PASS before cleanup.');
    }
  }

  for (const surface of [driver, admin]) {
    if (surface.verdict === 'PASS') continue;
    if (surface.bridgeCode) continue;
    const code = surface.blockerCode || `${surface.surface.toUpperCase()}_VISUAL_BRIDGE_MISSING`;
    report.visualEvidence.blockers.push(code);
    if (requireEvidence) {
      addFailure(code, `${surface.surface} visual target is blocked without an actionable auth bridge.`);
    }
  }
}

function readBestVisualTargets(candidate, qaTemp = clientQaTemp) {
  const paths = [];
  if (candidate?.source && fs.existsSync(candidate.source) && fs.statSync(candidate.source).isFile()) {
    paths.push(candidate.source);
  }
  paths.push(path.join(qaTemp, 'visual-targets.json'));
  paths.push(path.join(qaTemp, 'visual-targets.ready.json'));

  const uniquePaths = paths.filter((item, index) => item && paths.indexOf(item) === index);
  const parsed = uniquePaths
    .map((filePath) => ({ filePath, payload: readJson(filePath) }))
    .filter((item) => item.payload && typeof item.payload === 'object');

  const withPreservedCustomerProof = parsed.find((item) => (
    item.payload.visualEvidenceHandoff?.surfaces?.customer?.verdict === 'PASS'
  ));
  if (withPreservedCustomerProof) {
    return { source: withPreservedCustomerProof.filePath, payload: withPreservedCustomerProof.payload };
  }

  const currentFinal = parsed.find((item) => path.basename(item.filePath) === 'visual-targets.json');
  if (currentFinal) return { source: currentFinal.filePath, payload: currentFinal.payload };
  const ready = parsed.find((item) => path.basename(item.filePath) === 'visual-targets.ready.json');
  if (ready) return { source: ready.filePath, payload: ready.payload };
  return { source: null, payload: null };
}

function resolveCustomerVisualSurface(summarySurface, payload, candidate) {
  const direct = normalizeVisualSurface('customer', summarySurface);
  if (direct.verdict === 'PASS') return direct;

  const screenshotProof = findCustomerScreenshotProof(candidate, payload);
  if (!screenshotProof) return direct;

  return {
    surface: 'customer',
    verdict: 'PASS',
    blockerCode: null,
    evidenceLevel: 'local/manual screenshot artifact',
    routeAttempted: payload?.customerVisualTarget?.route || null,
    bridgeCode: null,
    bridgeAction: null,
    proofArtifact: screenshotProof,
  };
}

function findCustomerScreenshotProof(candidate, payload) {
  if (!candidate?.source || !fs.existsSync(candidate.source) || !fs.statSync(candidate.source).isDirectory()) return null;
  const scenarioLabel = payload?.customerVisualTarget?.scenarioLabel || null;
  if (!scenarioLabel) return null;
  const scenarioDir = path.join(candidate.source, scenarioLabel);
  if (!fs.existsSync(scenarioDir) || !fs.statSync(scenarioDir).isDirectory()) return null;

  const screenshot = safeReadDir(scenarioDir)
    .filter((item) => item.isFile() && /^client-.*\.png$/i.test(item.name))
    .map((item) => path.join(scenarioDir, item.name))
    .sort()[0];

  return screenshot || null;
}

function normalizeVisualSurface(surface, summarySurface, target = null) {
  return {
    surface,
    verdict: summarySurface?.verdict || (target?.state === 'BLOCKED' ? 'BLOCKED' : 'MISSING'),
    blockerCode: summarySurface?.blockerCode || target?.code || null,
    evidenceLevel: summarySurface?.evidenceLevel || null,
    routeAttempted: summarySurface?.routeAttempted || target?.route || null,
    bridgeCode: target?.bridge?.code || null,
    bridgeAction: target?.bridge?.action || null,
  };
}

function selectEvidenceCandidate(options = {}) {
  return selectEvidenceCandidateFrom(findEvidenceCandidates(options), runLabelArg, requireEvidence);
}

function requestedRunLabelEvidenceDir(label) {
  return path.join(tempRoot, `ivoy-multiscenario-marketplace-qa-${label}`);
}

function isSafeRunLabel(label) {
  return typeof label === 'string' && /^[A-Za-z0-9._-]+$/.test(label);
}

function normalizeRunLabelArtifacts(label, options = {}) {
  const evidenceDir = options.evidenceDir || requestedRunLabelEvidenceDir(label);
  const qaTemp = options.clientQaTemp || clientQaTemp;
  const currentHarnessLabels = new Set();
  const currentRunArtifacts = [
    path.join(evidenceDir, 'scenario-results.json'),
    path.join(qaTemp, 'visual-targets.json'),
  ];

  for (const artifactPath of currentRunArtifacts) {
    const parsed = readJson(artifactPath);
    if (!parsed || typeof parsed !== 'object') continue;
    if (typeof parsed.runLabel === 'string' && parsed.runLabel.length) currentHarnessLabels.add(parsed.runLabel);
    if (typeof parsed.visualTargets?.runLabel === 'string' && parsed.visualTargets.runLabel.length) {
      currentHarnessLabels.add(parsed.visualTargets.runLabel);
    }
  }

  const artifactPaths = [
    { filePath: path.join(evidenceDir, 'scenario-results.json'), requireCurrentLabel: false },
    { filePath: path.join(qaTemp, 'visual-targets.json'), requireCurrentLabel: false },
    { filePath: path.join(qaTemp, 'visual-targets.ready.json'), requireCurrentLabel: true },
  ];

  for (const { filePath: artifactPath, requireCurrentLabel } of artifactPaths) {
    if (!fs.existsSync(artifactPath)) continue;
    const parsed = readJson(artifactPath);
    if (!parsed || typeof parsed !== 'object') continue;
    if (requireCurrentLabel) {
      const readyRunLabel = typeof parsed.runLabel === 'string' ? parsed.runLabel : null;
      if (!readyRunLabel || (readyRunLabel !== label && !currentHarnessLabels.has(readyRunLabel))) {
        continue;
      }
    }
    if (parsed.runLabel && parsed.runLabel !== label && !parsed.harnessRunLabel) {
      parsed.harnessRunLabel = parsed.runLabel;
    }
    parsed.runLabel = label;
    if (parsed.visualTargets && typeof parsed.visualTargets === 'object') {
      if (parsed.visualTargets.runLabel && parsed.visualTargets.runLabel !== label && !parsed.visualTargets.harnessRunLabel) {
        parsed.visualTargets.harnessRunLabel = parsed.visualTargets.runLabel;
      }
      parsed.visualTargets.runLabel = label;
    }
    fs.writeFileSync(artifactPath, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
  }
}

async function verifyPostCleanupState() {
  const contract = loadQaRuntimeContractConfig();
  const runtimeEnv = loadQaRuntimeRuntimeEnv();

  const contractCheck = runNode(['scripts/qa-runtime-contract-check.cjs'], clientRoot, { env: runtimeEnv });
  const parsedContractCheck = parseContractCheckOutput(contractCheck.stdout);
  report.postCleanupVerification.contractCheck = {
    ok: contractCheck.status === 0 && parsedContractCheck?.CONTRACT_CHECK === 'PASS',
    status: contractCheck.status,
    codes: parsedContractCheck?.codes || [],
    safeDetails: parsedContractCheck?.safeDetails || [],
  };

  const baseline = await verifyDriverBaseline(runtimeEnv, contract);
  report.postCleanupVerification.driverBaseline = baseline;
  const retained = await verifyProtectedRetainedEvidence(runtimeEnv, contract);
  report.postCleanupVerification.protectedEvidence = retained;
  report.retainedEvidenceStatus = retained.ok ? 'PASS' : retained.status;
  for (const failure of postCleanupFailuresFromProofs(baseline, retained)) {
    addFailure(failure.code, failure.message);
  }
}

function postCleanupFailuresFromProofs(driverBaseline, retainedEvidence) {
  const failures = [];
  if (!retainedEvidence?.ok) {
    failures.push({
      code: retainedEvidence?.code || 'FAIL_PROTECTED_EVIDENCE_UNVERIFIED',
      message: retainedEvidence?.message || 'Protected retained evidence was not explicitly verified after cleanup.',
    });
  }
  if (!driverBaseline?.ok) {
    failures.push({
      code: driverBaseline?.code || 'FAIL_DRIVER_BASELINE_UNVERIFIED',
      message: driverBaseline?.message || 'Driver baseline was not explicitly verified after cleanup.',
    });
  }
  return failures;
}

function loadQaRuntimeContractConfig() {
  const text = fs.readFileSync(contractPath, 'utf8');
  const protectedSection = sectionBetween(text, '## Protected retained evidence', '## Driver baseline');
  const baselineSection = sectionBetween(text, '## Driver baseline', '## Forbidden actions');
  return {
    projectRef: tableValue(text, 'Project ref'),
    allowedHost: tableValue(text, 'Allowed host'),
    runtimeUrl: tableValue(text, 'Runtime URL'),
    protectedEvidenceOrderIds: [...new Set((protectedSection.match(uuidPattern) || []))],
    driverBaseline: {
      userId: firstUuid(baselineSection),
      balance: extractNumeric(baselineSection, /balance\s*=\s*([0-9.]+)/i),
      reserved_balance: extractNumeric(baselineSection, /reserved_balance\s*=\s*([0-9.]+)/i),
      availability_status: extractString(baselineSection, /availability_status\s*=\s*([A-Za-z_]+)/i),
    },
  };
}

function loadQaRuntimeRuntimeEnv() {
  const runtimePath = path.join(clientQaTemp, 'qa-runtime.local.ps1');
  const env = { ...process.env };
  if (!fs.existsSync(runtimePath)) return env;
  const text = fs.readFileSync(runtimePath, 'utf8');
  const assignment = /^\s*\$env:([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(['"])([\s\S]*?)\2\s*$/gm;
  let match;
  while ((match = assignment.exec(text)) !== null) {
    env[match[1]] = match[3];
  }
  return env;
}

async function verifyProtectedRetainedEvidence(env, contract) {
  if (!contract.allowedHost || !contract.runtimeUrl || !contract.protectedEvidenceOrderIds.length) {
    return {
      ok: false,
      status: 'BLOCKED',
      code: 'FAIL_PROTECTED_EVIDENCE_UNKNOWN',
      message: 'Protected retained evidence contract is incomplete.',
    };
  }

  const proof = await supabaseRestSelect(
    env,
    contract.runtimeUrl,
    contract.allowedHost,
    'orders',
    'id',
    [['id', `in.(${contract.protectedEvidenceOrderIds.join(',')})`]]
  );

  if (!proof.ok) {
    return {
      ok: false,
      status: 'BLOCKED',
      code: 'FAIL_PROTECTED_EVIDENCE_UNREADABLE',
      message: `Protected retained evidence check failed: ${proof.error}`,
    };
  }

  const foundIds = new Set((proof.data || []).map((item) => item.id).filter((id) => typeof id === 'string'));
  const missingIds = contract.protectedEvidenceOrderIds.filter((id) => !foundIds.has(id));
  if (missingIds.length) {
    return {
      ok: false,
      status: 'FAIL',
      code: 'FAIL_PROTECTED_EVIDENCE_TOUCHED',
      message: `Protected retained evidence missing after cleanup: ${missingIds.join(', ')}`,
      missingIds,
    };
  }

  return {
    ok: true,
    status: 'PASS',
    checkedIds: contract.protectedEvidenceOrderIds,
  };
}

async function verifyDriverBaseline(env, contract) {
  const baseline = contract.driverBaseline;
  if (!baseline?.userId || !contract.allowedHost || !contract.runtimeUrl) {
    return {
      ok: false,
      status: 'BLOCKED',
      code: 'FAIL_DRIVER_BASELINE_UNKNOWN',
      message: 'Driver baseline contract is incomplete.',
    };
  }

  const proof = await supabaseRestSelect(
    env,
    contract.runtimeUrl,
    contract.allowedHost,
    'profiles',
    'id,role,balance,reserved_balance,availability_status',
    [['id', `eq.${baseline.userId}`]]
  );

  if (!proof.ok) {
    return {
      ok: false,
      status: 'BLOCKED',
      code: 'FAIL_DRIVER_BASELINE_UNREADABLE',
      message: `Driver baseline check failed: ${proof.error}`,
    };
  }

  const row = Array.isArray(proof.data) ? proof.data[0] : null;
  if (!row) {
    return {
      ok: false,
      status: 'FAIL',
      code: 'FAIL_DRIVER_BASELINE_UNREADABLE',
      message: 'Driver baseline row missing after cleanup.',
    };
  }

  const reasons = [];
  if (row.role !== 'driver') reasons.push(`role=${row.role ?? 'MISSING'}`);
  if (Number(row.balance) !== Number(baseline.balance)) reasons.push(`balance=${row.balance ?? 'MISSING'}`);
  if (Number(row.reserved_balance) !== Number(baseline.reserved_balance)) reasons.push(`reserved_balance=${row.reserved_balance ?? 'MISSING'}`);
  if (row.availability_status !== baseline.availability_status) reasons.push(`availability_status=${row.availability_status ?? 'MISSING'}`);

  const baselineText = `${row.balance ?? 'MISSING'} / ${row.reserved_balance ?? 'MISSING'} / ${row.availability_status ?? 'MISSING'}`;
  if (reasons.length) {
    return {
      ok: false,
      status: 'FAIL',
      code: 'FAIL_DRIVER_BASELINE_NOT_RESTORED',
      message: `Driver baseline not restored after cleanup: ${reasons.join(', ')}`,
      baselineText,
    };
  }

  return {
    ok: true,
    status: 'PASS',
    baselineText,
  };
}

async function supabaseRestSelect(env, runtimeUrl, allowedHost, table, select, filters) {
  const serviceRole = String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const urlValue = String(env.SUPABASE_URL || env.VITE_SUPABASE_URL || runtimeUrl || '').trim();
  let host;
  try {
    host = new URL(urlValue).host;
  } catch {
    host = null;
  }

  if (!serviceRole) return { ok: false, error: 'service role missing' };
  if (!urlValue || host !== allowedHost) return { ok: false, error: 'runtime host mismatch' };

  const url = new URL(`/rest/v1/${table}`, urlValue);
  url.searchParams.set('select', select);
  for (const [key, value] of filters) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url, {
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
    });
    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }
    return { ok: true, data: await response.json() };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function parseContractCheckOutput(output) {
  const start = (output || '').indexOf('{');
  if (start === -1) return null;
  try {
    return JSON.parse(output.slice(start));
  } catch {
    return null;
  }
}

function sectionBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return '';
  const fromStart = text.slice(start + startMarker.length);
  const end = fromStart.indexOf(endMarker);
  return end === -1 ? fromStart : fromStart.slice(0, end);
}

function tableValue(text, label) {
  const pattern = new RegExp('\\|\\s*' + escapeRegex(label) + '\\s*\\|\\s*`([^`]+)`\\s*\\|', 'i');
  return text.match(pattern)?.[1] || null;
}

function extractNumeric(text, pattern) {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
}

function extractString(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1] : null;
}

function firstUuid(text) {
  return text.match(uuidPattern)?.[0] || null;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findEvidenceCandidates(options = {}) {
  const root = options.tempRoot || tempRoot;
  const qaTemp = options.clientQaTemp || clientQaTemp;
  const tempCandidates = safeReadDir(root)
    .filter((item) => item.isDirectory() && item.name.startsWith('ivoy-multiscenario-marketplace-qa-'))
    .map((item) => {
      const fullPath = path.join(root, item.name);
      return {
        source: fullPath,
        runLabel: item.name.replace(/^ivoy-multiscenario-marketplace-qa-/, ''),
        mtimeMs: fs.statSync(fullPath).mtimeMs,
        sourceType: 'temp',
      };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const candidates = [...tempCandidates];
  const visualTargetsPath = path.join(qaTemp, 'visual-targets.json');
  if (fs.existsSync(visualTargetsPath)) {
    const parsed = readJson(visualTargetsPath);
    if (parsed) {
      candidates.push({
        source: visualTargetsPath,
        runLabel: parsed.runLabel || null,
        mtimeMs: fs.statSync(visualTargetsPath).mtimeMs,
        sourceType: 'visual-targets',
      });
    }
  }

  return candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function selectEvidenceCandidateFrom(candidates, requestedRunLabel, evidenceRequired) {
  const labelsFound = candidates
    .map((candidate) => candidate.runLabel)
    .filter((label) => typeof label === 'string' && label.length > 0)
    .filter((label, index, labels) => labels.indexOf(label) === index);

  if (!candidates.length) {
    return {
      candidate: null,
      labelsFound,
      blocker: 'BLOCKED_NO_RUN_LABEL_FOUND',
      message: requestedRunLabel
        ? `No evidence was found for requested run label ${requestedRunLabel}.`
        : 'No local run evidence folder or visual-targets.json was found.',
    };
  }

  if (requestedRunLabel) {
    const exactMatches = candidates.filter((candidate) => candidate.runLabel === requestedRunLabel);
    const exact = exactMatches.find((candidate) => candidate.sourceType === 'temp') || exactMatches[0];
    if (exact) return { candidate: exact, labelsFound, blocker: null, message: null };

    const latest = candidates[0];
    return {
      candidate: evidenceRequired ? latest : null,
      labelsFound,
      blocker: evidenceRequired ? 'BLOCKED_RUN_LABEL_EVIDENCE_MISMATCH' : 'BLOCKED_NO_RUN_LABEL_FOUND',
      message: evidenceRequired
        ? `Requested run label ${requestedRunLabel} did not match selected evidence label ${latest.runLabel || 'MISSING'}.`
        : `No evidence was found for requested run label ${requestedRunLabel}.`,
    };
  }

  return { candidate: candidates[0], labelsFound, blocker: null, message: null };
}

function runRunLabelContractSelfTest() {
  const selfTestRoot = fs.mkdtempSync(path.join(tempRoot, 'vsm-qa-rehearsal-run-label-contract-'));
  const selfTestQaTemp = path.join(selfTestRoot, 'qa-temp');
  const matchingLabel = 'self-test-matching';
  const otherLabel = 'self-test-other';
  try {
    fs.mkdirSync(path.join(selfTestRoot, `ivoy-multiscenario-marketplace-qa-${matchingLabel}`), { recursive: true });
    fs.mkdirSync(path.join(selfTestRoot, `ivoy-multiscenario-marketplace-qa-${otherLabel}`), { recursive: true });
    fs.mkdirSync(selfTestQaTemp, { recursive: true });
    fs.writeFileSync(path.join(selfTestQaTemp, 'visual-targets.json'), JSON.stringify({ runLabel: otherLabel }), 'utf8');

    const candidates = findEvidenceCandidates({ tempRoot: selfTestRoot, clientQaTemp: selfTestQaTemp });
    const matching = selectEvidenceCandidateFrom(candidates, matchingLabel, true);
    const mismatched = selectEvidenceCandidateFrom(candidates, 'self-test-missing', true);
    const missing = selectEvidenceCandidateFrom([], 'self-test-missing', true);
    const exactPreference = selectEvidenceCandidateFrom([
      { source: path.join(selfTestQaTemp, 'visual-targets.json'), runLabel: matchingLabel, sourceType: 'visual-targets', mtimeMs: 2 },
      { source: path.join(selfTestRoot, `ivoy-multiscenario-marketplace-qa-${matchingLabel}`), runLabel: matchingLabel, sourceType: 'temp', mtimeMs: 1 },
    ], matchingLabel, true);
    const propagationLabel = 'self-test-propagation';
    const propagationDir = requestedRunLabelEvidenceDir(propagationLabel);
    const artifactQaTemp = path.join(selfTestRoot, 'artifact-qa-temp');
    fs.mkdirSync(artifactQaTemp, { recursive: true });
    const artifactEvidenceDir = path.join(selfTestRoot, `ivoy-multiscenario-marketplace-qa-${propagationLabel}`);
    fs.mkdirSync(artifactEvidenceDir, { recursive: true });
    fs.writeFileSync(path.join(artifactEvidenceDir, 'scenario-results.json'), JSON.stringify({
      runLabel: 'harness-internal',
      visualTargets: { runLabel: 'harness-internal' },
    }), 'utf8');
    fs.writeFileSync(path.join(artifactQaTemp, 'visual-targets.json'), JSON.stringify({
      runLabel: 'harness-internal',
    }), 'utf8');
    fs.writeFileSync(path.join(artifactQaTemp, 'visual-targets.ready.json'), JSON.stringify({
      runLabel: 'harness-internal',
    }), 'utf8');
    normalizeRunLabelArtifacts(propagationLabel, { evidenceDir: artifactEvidenceDir, clientQaTemp: artifactQaTemp });
    const normalizedScenarioResults = readJson(path.join(artifactEvidenceDir, 'scenario-results.json'));
    const normalizedVisualTargets = readJson(path.join(artifactQaTemp, 'visual-targets.json'));
    const normalizedReadyVisualTargets = readJson(path.join(artifactQaTemp, 'visual-targets.ready.json'));
    const staleReadyQaTemp = path.join(selfTestRoot, 'stale-ready-qa-temp');
    const staleReadyEvidenceDir = path.join(selfTestRoot, `ivoy-multiscenario-marketplace-qa-${propagationLabel}-stale`);
    fs.mkdirSync(staleReadyQaTemp, { recursive: true });
    fs.mkdirSync(staleReadyEvidenceDir, { recursive: true });
    fs.writeFileSync(path.join(staleReadyEvidenceDir, 'scenario-results.json'), JSON.stringify({
      runLabel: 'current-harness',
      visualTargets: { runLabel: 'current-harness' },
    }), 'utf8');
    fs.writeFileSync(path.join(staleReadyQaTemp, 'visual-targets.json'), JSON.stringify({
      runLabel: 'current-harness',
    }), 'utf8');
    fs.writeFileSync(path.join(staleReadyQaTemp, 'visual-targets.ready.json'), JSON.stringify({
      runLabel: 'stale-harness',
    }), 'utf8');
    normalizeRunLabelArtifacts(propagationLabel, { evidenceDir: staleReadyEvidenceDir, clientQaTemp: staleReadyQaTemp });
    const staleReadyVisualTargets = readJson(path.join(staleReadyQaTemp, 'visual-targets.ready.json'));
    const completeOrderEvidence = {
      scenario: 'self-test-complete',
      orderId: '00000000-0000-4000-8000-000000000000',
      status: 'assigned',
      orderEvents: 1,
      orderOffers: 0,
      walletTransactions: 0,
      cleanup: 'PASS',
      driverBaseline: '500 / 0 / libre',
      ledger: { ok: true },
    };
    const incompleteVisualOrderEvidence = {
      scenario: 'visual-targets',
      orderId: '00000000-0000-4000-8000-000000000001',
      status: 'MISSING',
      orderEvents: null,
      orderOffers: null,
      walletTransactions: null,
      cleanup: 'PASS',
      driverBaseline: 'not-claimed',
      ledger: null,
    };
    const completeEvidenceProblems = incompleteOrderEvidence([completeOrderEvidence]);
    const incompleteEvidenceProblems = incompleteOrderEvidence([incompleteVisualOrderEvidence]);
    const visualQaTemp = path.join(selfTestRoot, 'visual-qa-temp');
    const visualEvidenceDir = path.join(selfTestRoot, 'ivoy-multiscenario-marketplace-qa-visual-self-test');
    fs.mkdirSync(visualQaTemp, { recursive: true });
    fs.mkdirSync(path.join(visualEvidenceDir, 'direct-accept'), { recursive: true });
    fs.writeFileSync(path.join(visualEvidenceDir, 'direct-accept', 'client-order-after-direct-accept.png'), 'png-proof');
    fs.writeFileSync(path.join(visualQaTemp, 'visual-targets.json'), JSON.stringify({
      runLabel: 'visual-self-test',
      cleanupCompleted: true,
      inspectionRequiredBeforeCleanup: true,
      customerVisualTarget: {
        route: '/order/00000000-0000-4000-8000-000000000002',
        scenarioLabel: 'direct-accept',
        orderId: '00000000-0000-4000-8000-000000000002',
        requiresInspectionBeforeCleanup: true,
      },
      driverVisualTarget: {
        route: 'http://127.0.0.1:5173/driver',
        state: 'BLOCKED',
        code: 'DRIVER_AUTH_GATE_BLOCKED',
        bridge: { code: 'DRIVER_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER', action: 'driver auth bridge' },
      },
      adminVisualTarget: {
        route: 'http://127.0.0.1:5174/dashboard?tab=inProgress',
        state: 'BLOCKED',
        code: 'ADMIN_AUTH_GATE_BLOCKED',
        bridge: { code: 'ADMIN_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER', action: 'admin auth bridge' },
      },
    }), 'utf8');
    fs.writeFileSync(path.join(visualQaTemp, 'visual-targets.ready.json'), JSON.stringify({
      runLabel: 'visual-self-test',
      cleanupCompleted: false,
      inspectionRequiredBeforeCleanup: true,
      customerVisualTarget: {
        route: '/order/00000000-0000-4000-8000-000000000002',
        requiresInspectionBeforeCleanup: true,
      },
    }), 'utf8');
    const visualBest = readBestVisualTargets({ source: visualEvidenceDir }, visualQaTemp);
    const visualCustomer = resolveCustomerVisualSurface(null, visualBest.payload, { source: visualEvidenceDir });
    const visualDriver = normalizeVisualSurface(
      'driver',
      visualBest.payload?.visualEvidenceHandoff?.surfaces?.driver,
      visualBest.payload?.driverVisualTarget
    );
    const visualAdmin = normalizeVisualSurface(
      'admin',
      visualBest.payload?.visualEvidenceHandoff?.surfaces?.admin,
      visualBest.payload?.adminVisualTarget
    );
    const visualExpiredQaTemp = path.join(selfTestRoot, 'visual-expired-qa-temp');
    fs.mkdirSync(visualExpiredQaTemp, { recursive: true });
    fs.writeFileSync(path.join(visualExpiredQaTemp, 'visual-targets.json'), JSON.stringify({
      runLabel: 'visual-expired-self-test',
      cleanupCompleted: true,
      inspectionRequiredBeforeCleanup: true,
      customerVisualTarget: {
        route: '/order/00000000-0000-4000-8000-000000000003',
        requiresInspectionBeforeCleanup: true,
      },
    }), 'utf8');
    const expiredBest = readBestVisualTargets(null, visualExpiredQaTemp);
    const expiredCustomer = normalizeVisualSurface('customer', expiredBest.payload?.visualEvidenceHandoff?.surfaces?.customer);
    const expiredStopCode = expiredCustomer.blockerCode
      || (expiredBest.payload?.cleanupCompleted === true && expiredBest.payload?.inspectionRequiredBeforeCleanup === true
        ? 'CUSTOMER_TARGET_EXPIRED'
        : 'CUSTOMER_VISUAL_ASSERTION_BLOCKED');
    const protectedEvidenceBlocked = postCleanupFailuresFromProofs(
      { ok: true, code: null, message: null },
      { ok: false, status: 'not-checked', code: 'FAIL_PROTECTED_EVIDENCE_UNVERIFIED', message: 'retained evidence missing' },
    );
    const driverBaselineBlocked = postCleanupFailuresFromProofs(
      { ok: false, status: 'FAIL', code: 'FAIL_DRIVER_BASELINE_NOT_RESTORED', message: 'driver baseline missing' },
      { ok: true, code: null, message: null },
    );
    const labelSafety = {
      ok: isSafeRunLabel('runtime-proof-full-qa-rehearsal-20260602-222331')
        && !isSafeRunLabel('../unsafe')
        && !isSafeRunLabel('unsafe\\label'),
    };

    const artifactNormalization = {
      scenarioResultsOk: normalizedScenarioResults?.runLabel === propagationLabel
        && normalizedScenarioResults?.harnessRunLabel === 'harness-internal'
        && normalizedScenarioResults?.visualTargets?.runLabel === propagationLabel
        && normalizedScenarioResults?.visualTargets?.harnessRunLabel === 'harness-internal',
      visualTargetsOk: normalizedVisualTargets?.runLabel === propagationLabel
        && normalizedVisualTargets?.harnessRunLabel === 'harness-internal',
      readyOk: normalizedReadyVisualTargets?.runLabel === propagationLabel
        && normalizedReadyVisualTargets?.harnessRunLabel === 'harness-internal',
      staleReadySkipped: staleReadyVisualTargets?.runLabel === 'stale-harness'
        && !staleReadyVisualTargets?.harnessRunLabel,
    };
    artifactNormalization.ok = artifactNormalization.scenarioResultsOk
      && artifactNormalization.visualTargetsOk
      && artifactNormalization.readyOk
      && artifactNormalization.staleReadySkipped;

    report.selfTest = {
      ok: true,
      harnessRan: false,
      devServersStarted: false,
      mutations: false,
      matching: {
        ok: matching.candidate?.runLabel === matchingLabel && matching.blocker === null,
        requestedRunLabel: matchingLabel,
        selectedRunLabel: matching.candidate?.runLabel || null,
        labelsFound: matching.labelsFound,
        blocker: matching.blocker,
      },
      mismatch: {
        ok: mismatched.blocker === 'BLOCKED_RUN_LABEL_EVIDENCE_MISMATCH',
        requestedRunLabel: 'self-test-missing',
        selectedRunLabel: mismatched.candidate?.runLabel || null,
        labelsFound: mismatched.labelsFound,
        blocker: mismatched.blocker,
      },
      missing: {
        ok: missing.blocker === 'BLOCKED_NO_RUN_LABEL_FOUND',
        requestedRunLabel: 'self-test-missing',
        selectedRunLabel: missing.candidate?.runLabel || null,
        labelsFound: missing.labelsFound,
        blocker: missing.blocker,
      },
      exactPreference: {
        ok: exactPreference.candidate?.sourceType === 'temp',
        selectedSourceType: exactPreference.candidate?.sourceType || null,
      },
      propagation: {
        ok: propagationDir.endsWith(`ivoy-multiscenario-marketplace-qa-${propagationLabel}`),
        requestedRunLabel: propagationLabel,
        qaScreenshotDir: propagationDir,
      },
      artifactNormalization,
      requiredEvidenceCompleteness: {
        ok: completeEvidenceProblems.length === 0
          && incompleteEvidenceProblems.length === 1
          && incompleteEvidenceProblems[0].reasons.includes('ledger'),
        completeProblems: completeEvidenceProblems,
        incompleteProblems: incompleteEvidenceProblems,
      },
      visualEvidenceHandoff: {
        ok: path.basename(visualBest.source || '') === 'visual-targets.json'
          && visualCustomer.verdict === 'PASS'
          && visualDriver.bridgeCode === 'DRIVER_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER'
          && visualAdmin.bridgeCode === 'ADMIN_VISUAL_BRIDGE_REQUIRES_AUTHENTICATED_BROWSER'
          && expiredStopCode === 'CUSTOMER_TARGET_EXPIRED',
        selectedSource: visualBest.source,
        customerVerdict: visualCustomer.verdict,
        driverBridgeCode: visualDriver.bridgeCode,
        adminBridgeCode: visualAdmin.bridgeCode,
        expiredStopCode,
      },
      postCleanupProofs: {
        ok: protectedEvidenceBlocked.length === 1
          && protectedEvidenceBlocked[0].code === 'FAIL_PROTECTED_EVIDENCE_UNVERIFIED'
          && driverBaselineBlocked.length === 1
          && driverBaselineBlocked[0].code === 'FAIL_DRIVER_BASELINE_NOT_RESTORED',
        protectedEvidenceCode: protectedEvidenceBlocked[0]?.code || null,
        driverBaselineCode: driverBaselineBlocked[0]?.code || null,
      },
      labelSafety,
    };

    if (!report.selfTest.matching.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_MATCHING', 'Matching run-label evidence was not accepted by selector self-test.');
    }
    if (!report.selfTest.mismatch.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_MISMATCH', 'Mismatched run-label evidence did not block with BLOCKED_RUN_LABEL_EVIDENCE_MISMATCH.');
    }
    if (!report.selfTest.missing.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_MISSING', 'Missing run-label evidence did not block with BLOCKED_NO_RUN_LABEL_FOUND.');
    }
    if (!report.selfTest.exactPreference.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_EXACT_TEMP_PREFERENCE', 'Exact run-label selection did not prefer temp evidence over visual-targets metadata.');
    }
    if (!report.selfTest.propagation.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_PROPAGATION', 'Requested run label did not produce the expected QA_SCREENSHOT_DIR path.');
    }
    if (!report.selfTest.artifactNormalization.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_ARTIFACT_NORMALIZATION', 'Run-label artifact normalization did not preserve the harness label while setting the requested label.');
    }
    if (!report.selfTest.requiredEvidenceCompleteness.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_REQUIRED_EVIDENCE_COMPLETENESS', 'Incomplete order evidence was not detected by selector self-test.');
    }
    if (!report.selfTest.visualEvidenceHandoff.ok) {
      addFailure('FAIL_VISUAL_EVIDENCE_HANDOFF_SELF_TEST', 'Visual evidence handoff did not preserve customer proof or actionable auth bridges.');
    }
    if (!report.selfTest.postCleanupProofs.ok) {
      addFailure('FAIL_POST_CLEANUP_PROOFS_SELF_TEST', 'Post-cleanup proof blockers were not classified distinctly.');
    }
    if (!report.selfTest.labelSafety.ok) {
      addFailure('FAIL_RUN_LABEL_SELF_TEST_LABEL_SAFETY', 'Run-label safety check did not accept safe labels and reject path separators.');
    }
    report.selfTest.ok = !report.failures.length;
  } finally {
    fs.rmSync(selfTestRoot, { recursive: true, force: true });
  }
}

function collectOrders(candidate) {
  const orders = [];
  if (fs.existsSync(candidate.source) && fs.statSync(candidate.source).isDirectory()) {
    const readbacks = findFiles(candidate.source, 'db-readback-before-cleanup.json', 3);
    for (const filePath of readbacks) {
      const parsed = readJson(filePath);
      const order = parsed?.order || null;
      const orderId = order?.id || null;
      if (!isUuid(orderId)) continue;
      const ledgerInput = {
        orderId,
        status: order.status || '',
        orderEvents: countArray(parsed.events),
        orderOffers: countArray(parsed.offers),
        walletTransactions: countArray(parsed.balance_transactions),
        cleanup: 'PASS',
        driverBaseline: report.postCleanupVerification.driverBaseline?.baselineText || driverBaseline(parsed.driver_profile),
        retainedEvidence: report.retainedEvidenceStatus === 'PASS' ? 'untouched' : 'unknown',
      };
      orders.push({
        scenario: path.basename(path.dirname(filePath)),
        orderId,
        status: ledgerInput.status,
        orderEvents: ledgerInput.orderEvents,
        orderOffers: ledgerInput.orderOffers,
        walletTransactions: ledgerInput.walletTransactions,
        cleanup: ledgerInput.cleanup,
        driverBaseline: ledgerInput.driverBaseline,
        retainedEvidence: ledgerInput.retainedEvidence,
        ledgerCommand: evidenceLedgerCommand(ledgerInput),
        ledger: runEvidenceLedger(ledgerInput),
      });
    }
  }

  if (orders.length) return orders;

  const visualTargetsPath = fs.statSync(candidate.source).isDirectory()
    ? path.join(clientQaTemp, 'visual-targets.json')
    : candidate.source;
  const visualTargets = readJson(visualTargetsPath);
  const ids = Object.values(visualTargets?.scenarioIds || {}).filter(isUuid);
  for (const orderId of ids) {
    orders.push({
      scenario: 'visual-targets',
      orderId,
      status: 'MISSING',
      orderEvents: null,
      orderOffers: null,
      walletTransactions: null,
      cleanup: visualTargets?.cleanupCompleted === true ? 'PASS' : 'unknown',
      driverBaseline: report.postCleanupVerification.driverBaseline?.baselineText || 'not-claimed',
      retainedEvidence: report.retainedEvidenceStatus === 'PASS' ? 'untouched' : 'unknown',
      ledgerCommand: null,
      ledger: null,
    });
  }
  return orders;
}

function incompleteOrderEvidence(orders) {
  return orders
    .map((order) => {
      const reasons = [];
      if (!order.status || order.status === 'MISSING') reasons.push('status');
      if (!Number.isInteger(order.orderEvents)) reasons.push('orderEvents');
      if (!Number.isInteger(order.orderOffers)) reasons.push('orderOffers');
      if (!Number.isInteger(order.walletTransactions)) reasons.push('walletTransactions');
      if (order.cleanup !== 'PASS') reasons.push('cleanup');
      if (order.ledger?.ok !== true) reasons.push('ledger');
      return {
        scenario: order.scenario || null,
        orderId: order.orderId || null,
        reasons,
      };
    })
    .filter((item) => item.reasons.length > 0);
}

function runEvidenceLedger(input) {
  const result = runNode([
    'tools/workflow/evidence-ledger.mjs',
    '--json',
    '--order-id',
    input.orderId,
    '--status',
    input.status,
    '--order-events',
    String(input.orderEvents),
    '--order-offers',
    String(input.orderOffers),
    '--wallet-transactions',
    String(input.walletTransactions),
    '--cleanup',
    input.cleanup,
    '--driver-baseline',
    input.driverBaseline,
    '--retained-evidence',
    input.retainedEvidence,
  ], canonRoot);
  const parsed = parseJson(result.stdout);
  return {
    ok: result.status === 0 && parsed.value?.ok === true,
    status: result.status,
    failures: parsed.value?.failures || [],
    markdown: parsed.value?.markdown || null,
  };
}

function evidenceLedgerCommand(input) {
  return [
    'node tools\\workflow\\evidence-ledger.mjs',
    `--order-id ${input.orderId}`,
    `--status ${input.status}`,
    `--order-events ${input.orderEvents}`,
    `--order-offers ${input.orderOffers}`,
    `--wallet-transactions ${input.walletTransactions}`,
    `--cleanup ${input.cleanup}`,
    `--driver-baseline "${input.driverBaseline}"`,
    `--retained-evidence ${input.retainedEvidence}`,
  ].join(' ');
}

function driverBaseline(profile) {
  if (!profile) return 'not-claimed';
  const balance = profile.balance ?? 'MISSING';
  const reserved = profile.reserved_balance ?? 'MISSING';
  const availability = profile.availability_status ?? 'MISSING';
  return `${balance} / ${reserved} / ${availability}`;
}

function findFiles(root, filename, maxDepth, depth = 0) {
  if (depth > maxDepth) return [];
  const matches = [];
  for (const item of safeReadDir(root)) {
    const fullPath = path.join(root, item.name);
    if (item.isDirectory()) {
      matches.push(...findFiles(fullPath, filename, maxDepth, depth + 1));
    } else if (item.isFile() && item.name === filename) {
      matches.push(fullPath);
    }
  }
  return matches;
}

function safeReadDir(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

function checkPortsAvailable(ports) {
  return Promise.all(ports.map(async (port) => {
    const result = await canBindPort(port);
    return { port, available: result.ok, code: result.code || null };
  }));
}

function checkPortsListening(ports) {
  return Promise.all(ports.map(async (port) => {
    const result = await canConnectPort(port);
    return { port, listening: result.ok, code: result.code || null };
  }));
}

function canBindPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (error) => resolve({ ok: false, code: error.code || 'ERROR' }));
    server.once('listening', () => {
      server.close(() => resolve({ ok: true }));
    });
    server.listen({ host: '127.0.0.1', port, exclusive: true });
  });
}

function canConnectPort(port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve({ ok: true });
    });
    socket.once('error', (error) => resolve({ ok: false, code: error.code || 'ERROR' }));
    socket.setTimeout(1500, () => {
      socket.destroy();
      resolve({ ok: false, code: 'TIMEOUT' });
    });
  });
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function countArray(value) {
  return Array.isArray(value) ? value.length : 0;
}

function isUuid(value) {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function parseJson(value) {
  try {
    return { value: JSON.parse(value), error: null };
  } catch (error) {
    return { value: null, error: error.message };
  }
}

function runNode(commandArgs, cwd, options = {}) {
  return runCommand(process.execPath, commandArgs, cwd, options);
}

function runCommand(command, commandArgs, cwd, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd,
    encoding: 'utf8',
    env: options.env ? { ...process.env, ...options.env } : process.env,
    shell: false,
    windowsHide: true,
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

function safeTail(output, limit) {
  return (output || '')
    .split(/\r?\n/)
    .filter((line) => line && !/password|token|service_role|secret|cookie|storage/i.test(line))
    .slice(-limit);
}

function commandText(command, commandArgs) {
  return [command, ...commandArgs.map(quoteArg)].join(' ');
}

function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function sleepAsync(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function quoteArg(value) {
  if (!/[\s"]/u.test(value)) return value;
  return `"${String(value).replace(/"/g, '\\"')}"`;
}

function addFailure(code, message) {
  if (!report.failures.some((failure) => failure.code === code)) {
    report.failures.push({ code, message });
  }
  report.ok = false;
}

function finish() {
  report.ok = report.failures.length === 0 && report.gates.every((gate) => gate.ok);
  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printTextReport(report);
  }
  process.exit(report.ok ? 0 : 1);
}

function printTextReport(item) {
  console.log(`VSM_QA_REHEARSAL: ${item.ok ? 'PASS' : 'BLOCKED'}`);
  console.log(`Mode: ${item.mode}`);
  console.log('Gates run:');
  for (const gate of item.gates) {
    console.log(`- ${gate.ok ? 'PASS' : 'FAIL'} ${gate.lane}`);
  }
  console.log(`Harness: ${item.harness.ran ? 'RUN' : 'NOT RUN'}`);
  console.log(`Evidence source: ${item.evidence.source || 'MISSING'}`);
  console.log(`Run label: ${item.evidence.runLabel || 'MISSING'}`);
  console.log(`Orders found: ${item.evidence.orders.length}`);
  for (const order of item.evidence.orders) {
    console.log(`- ${order.orderId} status=${order.status} cleanup=${order.cleanup}`);
  }
  console.log(`Visual source: ${item.visualEvidence.source || 'MISSING'}`);
  console.log(`Visual customer: ${item.visualEvidence.customer?.verdict || 'MISSING'}${item.visualEvidence.customer?.blockerCode ? ` ${item.visualEvidence.customer.blockerCode}` : ''}`);
  console.log(`Visual driver: ${item.visualEvidence.driver?.verdict || 'MISSING'}${item.visualEvidence.driver?.bridgeCode ? ` bridge=${item.visualEvidence.driver.bridgeCode}` : ''}`);
  console.log(`Visual admin: ${item.visualEvidence.admin?.verdict || 'MISSING'}${item.visualEvidence.admin?.bridgeCode ? ` bridge=${item.visualEvidence.admin.bridgeCode}` : ''}`);
  console.log(`Cleanup status: ${item.cleanupStatus}`);
  console.log(`Retained evidence status: ${item.retainedEvidenceStatus}`);
  if (item.failures.length) {
    console.log(`Failures: ${item.failures.map((failure) => failure.code).join(', ')}`);
  }
  console.log(`Non-claims: ${item.nonClaims.join('; ')}`);
}

function printHelp() {
  const text = `Moto QA Rehearsal Runner v0

Usage:
  node tools\\workflow\\vsm-qa-rehearsal.mjs [mode] [options]

Modes:
  --dry-run            Safe default. Runs repo-baseline and qa-preflight gates, then summarizes local scratch evidence if present.
  --preflight-only     Runs repo-baseline and qa-preflight gates only, with non-mutating evidence discovery.
  --start-dev-servers-only
                       Starts local Vite dev servers after gates and port precheck, then shuts them down without running the harness.
  --server-smoke-only  Alias for --start-dev-servers-only.
  --self-test-run-label-contract
                       Non-mutating selector self-test for --run-label evidence matching.
  --run-harness        Explicit mutating mode. Runs the existing local QA harness after gates pass.
  --run                Alias for --run-harness.
  --help               Print this help.

Options:
  --json               Emit structured JSON.
  --run-label <label>  Require evidence to match this local temp evidence run label when evidence is required.
  --require-evidence   Treat missing run label, missing order_id, or non ledger-complete order evidence as blocking.
  --start-dev-servers  With --run-harness only, start local Vite dev servers and stop only PIDs started by this runner.

Safety:
  Default mode does not run mutating QA harnesses.
  Harness execution requires --run-harness or --run.
  The runner does not read .env files, credential contents, cookies, localStorage, sessionStorage, auth headers, passwords, tokens, or service-role values.
  Evidence extraction reads only local scratch/output locations and treats orders.id / order_id as the primary proof key.
  Evidence ledger output is formatting of collected local evidence, not DB truth.

Non-claims:
  ${nonClaims.join('\n  ')}

Fail/block codes:
  BLOCKED_QA_PREFLIGHT_FAILED
  BLOCKED_RUNTIME_CONTRACT_MISSING
  BLOCKED_NO_RUN_LABEL_FOUND
  BLOCKED_RUN_LABEL_EVIDENCE_MISMATCH
  BLOCKED_UNSAFE_RUN_LABEL
  BLOCKED_NO_ORDER_ID_FOUND
  BLOCKED_INCOMPLETE_ORDER_EVIDENCE
  BLOCKED_VISUAL_TARGETS_MISSING
  CUSTOMER_TARGET_EXPIRED
  CUSTOMER_VISUAL_ASSERTION_BLOCKED
  DRIVER_VISUAL_BRIDGE_MISSING
  ADMIN_VISUAL_BRIDGE_MISSING
  BLOCKED_NEEDS_SCOPE_EXPANSION
  FAIL_SECRET_INSPECTION_RISK
  FAIL_UNAUTHORIZED_MUTATION_RISK
  FAIL_HARNESS_RUN_WITHOUT_EXPLICIT_FLAG`;
  console.log(text);
}
