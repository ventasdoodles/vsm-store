#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultMatrixPath = path.join(__dirname, 'cesarin-matrix.json');
const defaultOutDir = path.join(repoRoot, 'temp-debug', 'cesarin-ai-eval', 'results');

const GEMINI_API_VERSION = 'v1beta';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 800;

function parseArgs(argv) {
  const args = {
    mode: 'fixture',
    matrix: defaultMatrixPath,
    outDir: defaultOutDir,
    models: ['gemini-2.5-pro', 'gemini-3.5-flash'],
    iterations: 1,
    requestDelayMs: 0,
    writeRawText: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];
    if (arg === '--mode' && next) {
      args.mode = next;
      index += 1;
    } else if (arg === '--matrix' && next) {
      args.matrix = path.resolve(next);
      index += 1;
    } else if (arg === '--out-dir' && next) {
      args.outDir = path.resolve(next);
      index += 1;
    } else if (arg === '--models' && next) {
      args.models = next.split(',').map((value) => value.trim()).filter(Boolean);
      index += 1;
    } else if (arg === '--iterations' && next) {
      args.iterations = Math.max(1, Number.parseInt(next, 10) || 1);
      index += 1;
    } else if (arg === '--request-delay-ms' && next) {
      args.requestDelayMs = Math.max(0, Number.parseInt(next, 10) || 0);
      index += 1;
    } else if (arg === '--write-raw-text') {
      args.writeRawText = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!['fixture', 'live'].includes(args.mode)) {
    throw new Error('--mode must be fixture or live');
  }
  if (args.models.length === 0) {
    throw new Error('--models must include at least one model id');
  }

  return args;
}

function usage() {
  return [
    'Local-only Cesarín AI evaluation harness',
    '',
    'Examples:',
    '  node scripts/ai-eval/cesarin-eval-harness.mjs --mode fixture --models fixture-current,fixture-candidate',
    '  node scripts/ai-eval/cesarin-eval-harness.mjs --mode live --models gemini-2.5-pro,gemini-3.5-flash --iterations 2',
    '',
    'Options:',
    '  --mode fixture|live           Default: fixture. Fixture mode makes no network calls.',
    '  --models a,b                  Comma-separated model ids.',
    '  --iterations n                Runs each prompt n times.',
    '  --matrix path                 Prompt matrix JSON path.',
    '  --out-dir path                Result artifact directory. Default is temp-debug/cesarin-ai-eval/results.',
    '  --request-delay-ms n          Optional live-mode delay between calls.',
    '  --write-raw-text              Store raw model text in local result JSON. Off by default.',
  ].join('\n');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildGeminiUrl(model) {
  return `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${encodeURIComponent(model)}:generateContent`;
}

function buildEvalPrompt(prompt) {
  return [
    'Eres el evaluado, no el evaluador.',
    'Responde como Cesarín de VSM Store usando SOLO el contrato JSON indicado.',
    'No uses markdown ni texto fuera del JSON.',
    'No inventes productos, stock, metodos de pago, envios ni promesas humanas.',
    'Pagos reales: transferencia o deposito bancario.',
    'Envios reales: DHL Express a sucursal ocurre.',
    'Si el usuario pide catalogo real, planifica product_search_integrity.',
    'Si el usuario pide politicas de pago/envio/tienda, planifica knowledge_rag_foundation.',
    'Si falta un dato material, pregunta una sola aclaracion.',
    '',
    'SCHEMA JSON:',
    '{',
    '  "text": "respuesta breve, util y honesta",',
    '  "intent": "search | info | support | recommendation | whatsapp | greeting",',
    '  "tool_calls": [{ "name": "product_search_integrity | knowledge_rag_foundation | public_web_search | public_url_context", "args": {} }],',
    '  "fallback_reason": "GREETING | CHIT_CHAT | AMBIGUOUS_QUERY | NO_CAPSULE_MATCH | SUPPORT_ESCALATION | null"',
    '}',
    '',
    `HISTORIAL: ${JSON.stringify(prompt.history ?? [])}`,
    `USUARIO: ${prompt.query}`,
  ].join('\n');
}

function buildFixtureJson(prompt, textById) {
  const expected = prompt.expected ?? {};
  const toolCalls = (expected.toolCalls ?? []).map((name) => ({ name, args: { query: prompt.query } }));
  const fallbackReason = Object.prototype.hasOwnProperty.call(expected, 'fallbackReason')
    ? expected.fallbackReason
    : toolCalls.length > 0 ? null : 'NO_CAPSULE_MATCH';

  return JSON.stringify({
    text: textById[prompt.id] ?? 'Respuesta local de fixture.',
    intent: expected.intent ?? 'info',
    tool_calls: toolCalls,
    fallback_reason: fallbackReason,
  });
}

function fixtureResponseFor(model, prompt, iteration) {
  if (model.includes('candidate') && prompt.id === 'degraded_fallback_probe') {
    return {
      status: 200,
      retryCount: 0,
      latencyMs: 2,
      rawText: 'No pude cerrar esa respuesta con suficiente certeza.',
      source: 'fixture',
    };
  }

  const expected = prompt.expected ?? {};
  const toolCalls = (expected.toolCalls ?? []).map((name) => ({ name, args: { query: prompt.query } }));
  const textById = {
    strict_json_contract: 'Puedo responder en formato claro y sin texto extra fuera del contrato.',
    cut_message_recovery: 'Parece que se corto el mensaje, que querias decirme?',
    no_tool_vape_basics: 'La nicotina alta pega mas rapido; conviene elegir segun tolerancia y uso, no por puro numero.',
    specific_product_search: 'Lo busco en catalogo real y te digo solo lo que si aparezca.',
    catalog_hallucination_risk: 'Antes de afirmar si existe o esta disponible, lo reviso contra catalogo real.',
    shipping_cost_policy: 'El costo de envio por DHL se confirma antes de cerrar el pedido; no debo inventar una tarifa fija.',
    unsupported_next_day: 'No puedo garantizar entrega manana a domicilio; tiempos y costos se confirman antes de cerrar.',
    private_order_truth: 'Para revisar un pedido necesito la verdad autenticada del pedido, no adivinar desde el chat.',
    public_web_restraint: 'Eso se revisa como contexto publico externo, sin mezclarlo con verdad privada de tienda.',
    bare_url_clarify: 'Veo el enlace, pero necesito que me digas si quieres resumen, comparacion o verificacion.',
    verbosity_short_answer: 'Para diario, define sabor y formato; con eso ya puedo orientar sin aventar una lista larga.',
    greeting: 'Hola, soy Cesarín. Dime que estas buscando y lo aterrizo sin marearte.',
    small_talk: 'Puedo orientarte con productos, pagos, envios o pedidos sin inventar certeza.',
    clarify_first_ambiguity: 'Va, para afinarlo: que buscas cuidar mas, sabor, golpe o presupuesto?',
    no_tool_informational: 'Un pod suele ser recargable y mas flexible; un desechable es mas simple, pero menos configurable.',
    product_search_request: 'Lo reviso contra catalogo real para no inventarte disponibilidad.',
    rag_required_policy: 'El envio va por DHL y el pago confirmado es por transferencia o deposito.',
    payment_policy: 'Por ahora el pago real es transferencia o deposito; no debo prometer tarjeta o meses sin confirmar.',
    unsupported_delivery: 'No te puedo prometer Uber o entrega personal; la ruta real confirmada es DHL.',
    hallucination_risk: 'Lo reviso en catalogo real antes de afirmar si existe o esta disponible.',
    memory_sensitive: 'Va, entonces busquemos algo menos dulce y mas equilibrado.',
    degraded_fallback_probe: 'No pude cerrar esa respuesta con suficiente certeza, pero puedo pedir el dato que falta.',
  };
  const rawJson = buildFixtureJson(prompt, textById);

  if (model.includes('candidate') && prompt.id === 'strict_json_contract') {
    return {
      status: 200,
      retryCount: 0,
      latencyMs: 2,
      rawText: `Claro, aqui va:\n${rawJson}`,
      source: 'fixture',
    };
  }

  return {
    status: 200,
    retryCount: 0,
    latencyMs: 1 + iteration,
    rawText: rawJson,
    source: 'fixture',
  };
}

async function liveResponseFor(apiKey, model, prompt) {
  const startedAt = Date.now();
  let retryCount = 0;
  let lastStatus = 0;
  let lastText = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(buildGeminiUrl(model), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildEvalPrompt(prompt) }] }],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    });

    lastStatus = response.status;
    const data = await response.json().catch(async () => ({ raw_error: await response.text().catch(() => '') }));

    if (response.ok) {
      return {
        status: response.status,
        retryCount,
        latencyMs: Date.now() - startedAt,
        rawText: String(data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''),
        source: 'live',
      };
    }

    lastText = String(data?.error?.message ?? data?.raw_error ?? `Gemini HTTP ${response.status}`);
    if (!(response.status === 429 || response.status >= 500) || attempt >= MAX_RETRIES) {
      break;
    }

    retryCount += 1;
    const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    const jitter = Math.random() * (backoff * 0.3);
    await sleep(backoff + jitter);
  }

  return {
    status: lastStatus,
    retryCount,
    latencyMs: Date.now() - startedAt,
    rawText: '',
    source: 'live',
    error: sanitizeError(lastText || `Gemini HTTP ${lastStatus}`),
  };
}

function sanitizeError(error) {
  return String(error ?? '')
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, '[REDACTED_GEMINI_KEY]')
    .replace(/Bearer\s+[0-9A-Za-z._-]+/gi, 'Bearer [REDACTED]')
    .slice(0, 800);
}

function extractJsonObject(rawText) {
  const trimmed = String(rawText ?? '').trim();
  if (!trimmed) {
    return { ok: false, value: null, error: 'empty_model_text' };
  }

  const unfenced = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return { ok: true, value: JSON.parse(unfenced), error: null };
  } catch (directError) {
    const match = unfenced.match(/\{[\s\S]*\}/);
    if (!match) {
      return { ok: false, value: null, error: `malformed_json:${directError.message}` };
    }
    try {
      return { ok: true, value: JSON.parse(match[0]), error: null };
    } catch (extractedError) {
      return { ok: false, value: null, error: `malformed_json:${extractedError.message}` };
    }
  }
}

function analyzeStrictJsonOnly(rawText) {
  const trimmed = String(rawText ?? '').trim();
  if (!trimmed) {
    return { passed: false, reason: 'empty_model_text' };
  }

  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { passed: false, reason: 'surrounding_text_or_markdown' };
  }

  try {
    JSON.parse(trimmed);
    return { passed: true, reason: null };
  } catch (error) {
    return { passed: false, reason: `strict_json_parse_failed:${error.message}` };
  }
}

function normalizeToolCalls(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const name = typeof entry.name === 'string' ? entry.name.trim() : '';
      if (!name) return null;
      return {
        name,
        args: entry.args && typeof entry.args === 'object' ? entry.args : {},
      };
    })
    .filter(Boolean);
}

function getPromptSeverity(prompt) {
  const severity = String(prompt.expected?.severity ?? 'blocker').toLowerCase();
  return ['blocker', 'warning', 'info'].includes(severity) ? severity : 'blocker';
}

function normalizeFallbackReason(value) {
  if (value === null) return null;
  return typeof value === 'string' ? value.trim() : value;
}

function isAllowedFallbackReason(value) {
  return value === null || [
    'GREETING',
    'CHIT_CHAT',
    'AMBIGUOUS_QUERY',
    'NO_CAPSULE_MATCH',
    'SUPPORT_ESCALATION',
  ].includes(value);
}

function findHollowFallbackText(text) {
  const normalized = String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const patterns = [
    'estoy aqui para ayudarte que necesitas',
    'en que puedo ayudarte',
    'como puedo ayudarte',
    'que necesitas',
  ];

  return patterns.filter((pattern) => normalized === pattern || normalized.includes(pattern));
}

function findProviderInternals(text) {
  return containsAny(text, [
    'gemini',
    'provider',
    'stack trace',
    'api key',
    'x-goog-api-key',
    'bearer ',
    'http 429',
    'http 500',
    'undefined',
    'null null',
    'raw error',
  ]);
}

function containsAny(text, terms) {
  const normalized = String(text ?? '').toLowerCase();
  return terms.filter((term) => normalized.includes(String(term).toLowerCase()));
}

function validateFallbackContract(prompt, value, text) {
  const expected = prompt.expected ?? {};
  const fallbackReason = normalizeFallbackReason(value.fallback_reason);
  const expectedHasFallbackReason = Object.prototype.hasOwnProperty.call(expected, 'fallbackReason');
  const fallbackTriggered = Boolean(fallbackReason) || expected.degradedFallback === true;
  const hollowFallbackMentions = findHollowFallbackText(text);
  const providerInternalMentions = findProviderInternals(text);
  const flags = [];

  if (!isAllowedFallbackReason(fallbackReason)) {
    flags.push(`invalid_fallback_reason:${String(fallbackReason)}`);
  }
  if (expectedHasFallbackReason && fallbackReason !== expected.fallbackReason) {
    flags.push(`fallback_reason_mismatch:${String(fallbackReason)}`);
  }
  if (expected.degradedFallback === true && !fallbackTriggered) {
    flags.push('expected_degraded_fallback_not_triggered');
  }
  if (expected.degradedFallback === true && String(text ?? '').trim().length < 40) {
    flags.push('degraded_fallback_too_thin');
  }
  flags.push(...hollowFallbackMentions.map((term) => `hollow_fallback:${term}`));
  flags.push(...providerInternalMentions.map((term) => `provider_internal_leak:${term}`));

  return {
    fallbackReason,
    fallbackTriggered,
    hollowFallbackMentions,
    providerInternalMentions,
    passed: flags.length === 0,
    flags,
  };
}

function evaluateParsedOutput(prompt, parsed, strictJsonOnly) {
  const expected = prompt.expected ?? {};
  const value = parsed.value && typeof parsed.value === 'object' ? parsed.value : {};
  const text = typeof value.text === 'string' ? value.text : '';
  const toolCalls = normalizeToolCalls(value.tool_calls);
  const toolNames = toolCalls.map((toolCall) => toolCall.name);
  const expectedTools = expected.toolCalls ?? [];
  const missingTools = expectedTools.filter((toolName) => !toolNames.includes(toolName));
  const extraTools = toolNames.filter((toolName) => !expectedTools.includes(toolName));
  const forbiddenMentions = containsAny(text, expected.mustNotMention ?? []);
  const requiredMentions = expected.mustMention ?? [];
  const presentRequiredMentions = containsAny(text, requiredMentions);
  const missingRequiredMentions = requiredMentions.filter((term) => !presentRequiredMentions.includes(term));
  const intentMismatch = expected.intent && value.intent !== expected.intent;
  const maxWordCount = Number.isFinite(expected.maxWordCount) ? expected.maxWordCount : null;
  const minWordCount = Number.isFinite(expected.minWordCount) ? expected.minWordCount : null;
  const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const fallback = validateFallbackContract(prompt, value, text);

  return {
    intent: typeof value.intent === 'string' ? value.intent : null,
    textLength: text.length,
    wordCount,
    toolCalls,
    flags: [
      ...(!parsed.ok ? ['json_parse_failed'] : []),
      ...(!strictJsonOnly.passed ? [`strict_json_only_failed:${strictJsonOnly.reason}`] : []),
      ...(typeof value.text !== 'string' || !value.text.trim() ? ['missing_text'] : []),
      ...(Array.isArray(value.tool_calls) ? [] : ['tool_calls_not_array']),
      ...(intentMismatch ? ['intent_mismatch'] : []),
      ...(maxWordCount !== null && wordCount > maxWordCount ? [`verbosity_over_max:${wordCount}`] : []),
      ...(minWordCount !== null && wordCount < minWordCount ? [`verbosity_under_min:${wordCount}`] : []),
      ...missingTools.map((toolName) => `missing_tool:${toolName}`),
      ...extraTools.map((toolName) => `extra_tool:${toolName}`),
      ...forbiddenMentions.map((term) => `forbidden_text:${term}`),
      ...missingRequiredMentions.map((term) => `missing_text:${term}`),
      ...fallback.flags,
    ],
    fallback,
    truthfulness: {
      forbiddenMentions,
      requiredMentions,
      missingRequiredMentions,
      passed: forbiddenMentions.length === 0 && missingRequiredMentions.length === 0,
    },
    toolDiscipline: {
      expected: expectedTools,
      actual: toolNames,
      missing: missingTools,
      extra: extraTools,
      passed: missingTools.length === 0 && extraTools.length === 0,
    },
  };
}

function summarizeFailures(entries) {
  const counts = { blocker: 0, warning: 0, info: 0 };
  const byCategory = {};
  const byFlag = {};

  for (const entry of entries) {
    if (entry.flags.length === 0) continue;
    counts[entry.severity] = (counts[entry.severity] ?? 0) + entry.flags.length;
    byCategory[entry.promptCategory] = byCategory[entry.promptCategory] ?? { blocker: 0, warning: 0, info: 0 };
    byCategory[entry.promptCategory][entry.severity] += entry.flags.length;

    for (const flag of entry.flags) {
      byFlag[flag] = (byFlag[flag] ?? 0) + 1;
    }
  }

  return { counts, byCategory, byFlag };
}

function summarize(results) {
  const byModel = new Map();
  for (const result of results) {
    if (!byModel.has(result.modelId)) byModel.set(result.modelId, []);
    byModel.get(result.modelId).push(result);
  }

  const models = {};
  for (const [modelId, entries] of byModel.entries()) {
    const okJson = entries.filter((entry) => entry.jsonParseSuccess).length;
    const strictJson = entries.filter((entry) => entry.strictJsonOnlyCompliance.passed).length;
    const toolPass = entries.filter((entry) => entry.toolDiscipline.passed).length;
    const truthPass = entries.filter((entry) => entry.truthfulness.passed).length;
    const fallbackPass = entries.filter((entry) => entry.fallbackValidation.passed).length;
    const fallbackCount = entries.filter((entry) => entry.fallbackTriggered).length;
    const retryCount = entries.reduce((sum, entry) => sum + entry.retryCount, 0);
    const malformedJson = entries.filter((entry) => entry.malformedJson).length;
    const latencies = entries.map((entry) => entry.latencyMs).filter((value) => Number.isFinite(value));
    const wordCounts = entries.map((entry) => entry.verbosity.wordCount).filter((value) => Number.isFinite(value));
    const flags = entries.flatMap((entry) => entry.flags);

    models[modelId] = {
      runs: entries.length,
      jsonValidityRate: rate(okJson, entries.length),
      strictJsonOnlyRate: rate(strictJson, entries.length),
      toolDisciplineRate: rate(toolPass, entries.length),
      truthfulnessRate: rate(truthPass, entries.length),
      fallbackValidationRate: rate(fallbackPass, entries.length),
      malformedJsonCount: malformedJson,
      fallbackCount,
      retryCount,
      failures: summarizeFailures(entries),
      avgLatencyMs: average(latencies),
      avgWordCount: average(wordCounts),
      flags: countBy(flags),
    };
  }

  return { models };
}

function rate(numerator, denominator) {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

function average(values) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function countBy(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const matrix = readJson(args.matrix);
  const prompts = Array.isArray(matrix.prompts) ? matrix.prompts : [];
  if (prompts.length === 0) {
    throw new Error(`No prompts found in matrix: ${args.matrix}`);
  }

  let apiKey = null;
  if (args.mode === 'live') {
    apiKey = process.env.GEMINI_API_KEY ?? null;
    if (!apiKey) {
      throw new Error('Live mode requires GEMINI_API_KEY in the local process environment. The harness never prints it.');
    }
  }

  const runId = `cesarin-ai-eval-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  const startedAt = new Date().toISOString();
  const results = [];

  for (const modelId of args.models) {
    for (let iteration = 1; iteration <= args.iterations; iteration += 1) {
      for (const prompt of prompts) {
        if (args.mode === 'live' && args.requestDelayMs > 0) {
          await sleep(args.requestDelayMs);
        }

        const provider = args.mode === 'fixture'
          ? fixtureResponseFor(modelId, prompt, iteration)
          : await liveResponseFor(apiKey, modelId, prompt);
        const strictJsonOnly = analyzeStrictJsonOnly(provider.rawText);
        const parsed = extractJsonObject(provider.rawText);
        const evaluation = evaluateParsedOutput(prompt, parsed, strictJsonOnly);

        results.push({
          runId,
          timestamp: new Date().toISOString(),
          mode: args.mode,
          matrixVersion: matrix.version,
          promptId: prompt.id,
          promptCategory: prompt.category,
          severity: getPromptSeverity(prompt),
          modelId,
          iteration,
          rawStatus: provider.status,
          retryCount: provider.retryCount,
          latencyMs: provider.latencyMs,
          strictJsonOnlyCompliance: strictJsonOnly,
          jsonParseSuccess: parsed.ok,
          malformedJson: !parsed.ok,
          parseError: parsed.error,
          toolCalls: evaluation.toolCalls,
          toolDiscipline: evaluation.toolDiscipline,
          hallucinationFlags: evaluation.truthfulness.forbiddenMentions.map((term) => `forbidden_text:${term}`),
          truthfulness: evaluation.truthfulness,
          fallbackValidation: evaluation.fallback,
          verbosity: {
            textLength: evaluation.textLength,
            wordCount: evaluation.wordCount,
          },
          fallbackTriggered: evaluation.fallback.fallbackTriggered,
          flags: evaluation.flags,
          error: provider.error ?? null,
          notes: [],
          rawText: args.writeRawText ? provider.rawText : undefined,
        });
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const summary = summarize(results);
  const artifact = {
    runId,
    startedAt,
    finishedAt,
    mode: args.mode,
    models: args.models,
    iterations: args.iterations,
    matrixPath: path.relative(repoRoot, args.matrix),
    matrixVersion: matrix.version,
    safety: {
      localOnly: true,
      productionMutation: false,
      dbWork: false,
      deployWorkflow: false,
      secretsLogged: false,
      rawTextStored: args.writeRawText,
    },
    summary,
    results,
  };

  fs.mkdirSync(args.outDir, { recursive: true });
  const outPath = path.join(args.outDir, `${runId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2));

  console.log(JSON.stringify({
    runId,
    mode: args.mode,
    matrixVersion: matrix.version,
    models: args.models,
    prompts: prompts.length,
    iterations: args.iterations,
    resultPath: path.relative(repoRoot, outPath),
    summary,
  }, null, 2));
}

main().catch((error) => {
  console.error(`[cesarin-ai-eval] ${sanitizeError(error.message)}`);
  process.exitCode = 1;
});
