/**
 * VSM Store — OpenRouter Multi-Model Bridge
 * 
 * Utility to invoke GLM 5.3 Flash (implementador) and Luna Pro (auditor)
 * via OpenRouter API from Antigravity orchestrator.
 * 
 * Usage:
 *   node .vsm-workkit/tools/openrouter-bridge.mjs invoke \
 *     --model "z-ai/glm-5.3-flash" \
 *     --role "implementador" \
 *     --prompt-file /path/to/prompt.md \
 *     --output /path/to/response.md
 */
import fs from 'node:fs';
import path from 'node:path';

const MODELS = {
  'glm-flash': { id: 'z-ai/glm-5.3-flashx', name: 'GLM 5.3 FlashX', role: 'Implementador' },
  'luna-pro':  { id: 'openai/gpt-6-luna-pro', name: 'Luna Pro (GPT-6)', role: 'Auditor de Aceptación' },
};

async function invoke(modelAlias, promptText, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENROUTER_API_KEY not set');
    process.exit(1);
  }

  const model = MODELS[modelAlias];
  if (!model) {
    console.error(`ERROR: Unknown model alias "${modelAlias}". Use: ${Object.keys(MODELS).join(', ')}`);
    process.exit(1);
  }

  const systemPrompt = options.system || null;
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: promptText });

  const start = Date.now();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://vsm-store.local',
      'X-Title': `vsm-store-${model.role}`,
    },
    body: JSON.stringify({
      model: model.id,
      messages,
      temperature: options.temperature ?? 0.15,
    }),
  });

  const duration = Date.now() - start;
  const data = await res.json();

  if (!res.ok || data.error) {
    console.error(`ERROR: ${res.status} — ${JSON.stringify(data.error)}`);
    process.exit(1);
  }

  const result = {
    model: model.name,
    role: model.role,
    modelId: model.id,
    duration_ms: duration,
    usage: data.usage,
    cost: data.usage?.cost ?? null,
    reasoning_tokens: data.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
    content: data.choices[0].message.content,
  };

  return result;
}

// ── CLI Entry Point ──
const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === 'invoke') {
  const modelAlias = args[args.indexOf('--model') + 1];
  const promptFile = args[args.indexOf('--prompt-file') + 1];
  const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;
  const systemFile = args.includes('--system-file') ? args[args.indexOf('--system-file') + 1] : null;

  if (!modelAlias || !promptFile) {
    console.error('Usage: node openrouter-bridge.mjs invoke --model <alias> --prompt-file <path> [--output <path>] [--system-file <path>]');
    process.exit(1);
  }

  const promptText = fs.readFileSync(path.resolve(promptFile), 'utf8');
  const systemText = systemFile ? fs.readFileSync(path.resolve(systemFile), 'utf8') : null;

  const result = await invoke(modelAlias, promptText, { system: systemText });

  // Always print metadata to stderr
  console.error(`[${result.role}] ${result.model} — ${result.duration_ms}ms — ${result.usage?.total_tokens} tokens — $${result.cost}`);

  if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), result.content, 'utf8');
    // Also write metadata sidecar
    fs.writeFileSync(path.resolve(outputFile + '.meta.json'), JSON.stringify({
      model: result.model,
      role: result.role,
      modelId: result.modelId,
      duration_ms: result.duration_ms,
      total_tokens: result.usage?.total_tokens,
      reasoning_tokens: result.reasoning_tokens,
      cost: result.cost,
    }, null, 2), 'utf8');
    console.error(`Output written to ${outputFile}`);
  } else {
    // Print content to stdout
    console.log(result.content);
  }

} else if (cmd === 'test') {
  // Quick connectivity test
  for (const [alias, model] of Object.entries(MODELS)) {
    const result = await invoke(alias, 'Responde exactamente: OK');
    console.log(`✅ ${model.name} (${model.role}): ${result.content.trim()} — ${result.duration_ms}ms — $${result.cost}`);
  }

} else {
  console.log('VSM Store OpenRouter Bridge');
  console.log('Commands:');
  console.log('  invoke  --model <glm-flash|luna-pro> --prompt-file <path> [--output <path>]');
  console.log('  test    Quick connectivity test for all models');
}
