/**
 * VSM Store — OpenRouter Multi-Model Bridge
 * 
 * Utility to invoke:
 *   - GLM 5.3 FlashX (Implementador)
 *   - Luna Pro GPT-6 (Auditor de Aceptación Rápido)
 *   - Claude Opus 5.5 (Auditor Despiadado Directo)
 *   - Claude Opus 5.5 Batch (Auditor Despiadado Batch 24h — 50% Cost Reduction)
 * via OpenRouter API from Antigravity orchestrator.
 * 
 * Usage:
 *   # Direct Chat Completions:
 *   node .vsm-workkit/tools/openrouter-bridge.mjs invoke --model <glm-flash|luna-pro|opus> --prompt-file <path> [--output <path>]
 * 
 *   # Submit Batch and Wait until Completed (Single Command):
 *   node .vsm-workkit/tools/openrouter-bridge.mjs batch-audit --model opus-batch --prompt-file <path> --output <path>
 * 
 *   # Asynchronous Batch Workflow:
 *   node .vsm-workkit/tools/openrouter-bridge.mjs batch-submit --model opus-batch --prompt-file <path>
 *   node .vsm-workkit/tools/openrouter-bridge.mjs batch-status --batch-id <batch_id> [--output <path>]
 *   node .vsm-workkit/tools/openrouter-bridge.mjs batch-list
 */
import fs from 'node:fs';
import path from 'node:path';

const MODELS = {
  'glm-flash': {
    id: 'z-ai/glm-5.3-flashx',
    name: 'GLM 5.3 FlashX',
    role: 'Implementador',
    type: 'chat',
  },
  'luna-pro': {
    id: 'openai/gpt-6-luna-pro',
    name: 'Luna Pro (GPT-6)',
    role: 'Auditor de Aceptación',
    type: 'chat',
  },
  'opus': {
    id: 'anthropic/claude-opus-5.5',
    name: 'Claude Opus 5.5',
    role: 'Auditor Despiadado (Directo)',
    type: 'chat',
  },
  'opus-batch': {
    id: 'anthropic/claude-opus-5.5-20260921',
    name: 'Claude Opus 5.5 (Batch 50% off)',
    role: 'Auditor Despiadado (Batch)',
    type: 'batch',
  },
};

function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('ERROR: OPENROUTER_API_KEY environment variable is not set.');
    process.exit(1);
  }
  return apiKey;
}

// ── Direct Invocation (Chat Completions) ──
async function invoke(modelAlias, promptText, options = {}) {
  const apiKey = getApiKey();
  const model = MODELS[modelAlias];
  if (!model) {
    console.error(`ERROR: Unknown model alias "${modelAlias}". Use: ${Object.keys(MODELS).join(', ')}`);
    process.exit(1);
  }

  if (model.type === 'batch') {
    console.error(`NOTE: "${modelAlias}" is a batch model. Use 'batch-audit' or 'batch-submit' instead of 'invoke'.`);
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

  return {
    model: model.name,
    role: model.role,
    modelId: model.id,
    duration_ms: duration,
    usage: data.usage,
    cost: data.usage?.cost ?? null,
    reasoning_tokens: data.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
    content: data.choices[0].message.content,
  };
}

// ── Batch API Operations ──
async function submitBatch(modelAlias, promptText, options = {}) {
  const apiKey = getApiKey();
  const model = MODELS[modelAlias] || { id: modelAlias, name: modelAlias, role: 'Batch Worker' };

  const customId = options.customId || `audit-batch-${Date.now()}`;
  const messages = [];
  if (options.system) messages.push({ role: 'system', content: options.system });
  messages.push({ role: 'user', content: promptText });

  const start = Date.now();
  const payload = {
    endpoint: '/v1/chat/completions',
    model: model.id,
    completion_window: '24h',
    requests: [
      {
        custom_id: customId,
        body: {
          messages,
          temperature: options.temperature ?? 0.15,
        },
      },
    ],
  };

  const res = await fetch('https://openrouter.ai/api/v1/batches', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    console.error(`ERROR creating batch (${res.status}): ${JSON.stringify(data.error)}`);
    process.exit(1);
  }

  return {
    ...data,
    modelName: model.name,
    role: model.role,
    submission_duration_ms: Date.now() - start,
  };
}

async function getBatchStatus(batchId) {
  const apiKey = getApiKey();
  const res = await fetch(`https://openrouter.ai/api/v1/batches/${batchId}`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    console.error(`ERROR fetching batch status (${res.status}): ${JSON.stringify(data.error)}`);
    process.exit(1);
  }

  return data;
}

async function listBatches() {
  const apiKey = getApiKey();
  const res = await fetch('https://openrouter.ai/api/v1/batches', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    console.error(`ERROR listing batches (${res.status}): ${JSON.stringify(data.error)}`);
    process.exit(1);
  }

  return data;
}

function extractBatchResult(batchData) {
  if (!batchData.results || batchData.results.length === 0) {
    return null;
  }

  const firstResult = batchData.results[0];
  const responseBody = firstResult.response?.body;
  const choice = responseBody?.choices?.[0];
  let content = choice?.message?.content || null;
  const reasoning = choice?.message?.reasoning || null;

  if (!content && reasoning) {
    content = `### Auditor Reasoning\n\n${reasoning}`;
  }

  return {
    custom_id: firstResult.custom_id,
    content,
    reasoning,
    usage: batchData.usage,
    cost: batchData.usage?.cost ?? null,
    total_tokens: batchData.usage?.total_tokens,
    prompt_tokens: batchData.usage?.prompt_tokens,
    completion_tokens: batchData.usage?.completion_tokens,
  };
}

// ── CLI Handler ──
const args = process.argv.slice(2);
const cmd = args[0];

function getArgValue(flag) {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null;
}

if (cmd === 'invoke') {
  const modelAlias = getArgValue('--model');
  const promptFile = getArgValue('--prompt-file');
  const outputFile = getArgValue('--output');
  const systemFile = getArgValue('--system-file');

  if (!modelAlias || !promptFile) {
    console.error('Usage: node openrouter-bridge.mjs invoke --model <alias> --prompt-file <path> [--output <path>] [--system-file <path>]');
    process.exit(1);
  }

  const promptText = fs.readFileSync(path.resolve(promptFile), 'utf8');
  const systemText = systemFile ? fs.readFileSync(path.resolve(systemFile), 'utf8') : null;

  const result = await invoke(modelAlias, promptText, { system: systemText });

  console.error(`[${result.role}] ${result.model} — ${result.duration_ms}ms — ${result.usage?.total_tokens} tokens — $${result.cost}`);

  if (outputFile) {
    fs.writeFileSync(path.resolve(outputFile), result.content, 'utf8');
    fs.writeFileSync(
      path.resolve(outputFile + '.meta.json'),
      JSON.stringify(
        {
          model: result.model,
          role: result.role,
          modelId: result.modelId,
          duration_ms: result.duration_ms,
          total_tokens: result.usage?.total_tokens,
          reasoning_tokens: result.reasoning_tokens,
          cost: result.cost,
        },
        null,
        2
      ),
      'utf8'
    );
    console.error(`Output written to ${outputFile}`);
  } else {
    console.log(result.content);
  }

} else if (cmd === 'batch-submit') {
  const modelAlias = getArgValue('--model') || 'opus-batch';
  const promptFile = getArgValue('--prompt-file');
  const systemFile = getArgValue('--system-file');
  const customId = getArgValue('--custom-id');

  if (!promptFile) {
    console.error('Usage: node openrouter-bridge.mjs batch-submit --prompt-file <path> [--model opus-batch] [--system-file <path>] [--custom-id <id>]');
    process.exit(1);
  }

  const promptText = fs.readFileSync(path.resolve(promptFile), 'utf8');
  const systemText = systemFile ? fs.readFileSync(path.resolve(systemFile), 'utf8') : null;

  const batch = await submitBatch(modelAlias, promptText, { system: systemText, customId });

  console.log(`\n🚀 [BATCH SUBMITTED]`);
  console.log(`Batch ID:          ${batch.id}`);
  console.log(`Model:             ${batch.model} (${batch.modelName || modelAlias})`);
  console.log(`Status:            ${batch.status}`);
  console.log(`Completion Window: ${batch.completion_window}`);
  console.log(`\nTo check status and retrieve output:`);
  console.log(`  node .vsm-workkit/tools/openrouter-bridge.mjs batch-status --batch-id ${batch.id} --output ./audit-verdict.md`);
  console.log(`\nTo wait for completion:`);
  console.log(`  node .vsm-workkit/tools/openrouter-bridge.mjs batch-wait --batch-id ${batch.id} --output ./audit-verdict.md\n`);

} else if (cmd === 'batch-status') {
  const batchId = getArgValue('--batch-id');
  const outputFile = getArgValue('--output');

  if (!batchId) {
    console.error('Usage: node openrouter-bridge.mjs batch-status --batch-id <id> [--output <path>]');
    process.exit(1);
  }

  const data = await getBatchStatus(batchId);
  console.log(`Batch ID:   ${data.id}`);
  console.log(`Model:      ${data.model}`);
  console.log(`Status:     ${data.status}`);
  console.log(`Requests:   Total: ${data.request_counts?.total ?? 0}, Completed: ${data.request_counts?.completed ?? 0}, Failed: ${data.request_counts?.failed ?? 0}`);

  if (data.usage) {
    console.log(`Tokens:     Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}`);
    console.log(`Cost:       $${data.usage.cost}`);
  }

  if (data.status === 'completed') {
    const extracted = extractBatchResult(data);
    if (extracted?.content && outputFile) {
      fs.writeFileSync(path.resolve(outputFile), extracted.content, 'utf8');
      fs.writeFileSync(
        path.resolve(outputFile + '.meta.json'),
        JSON.stringify(
          {
            batch_id: data.id,
            model: data.model,
            usage: extracted.usage,
            cost: extracted.cost,
            finalized_at: data.finalized_at,
          },
          null,
          2
        ),
        'utf8'
      );
      console.log(`\n✅ Audit report saved to: ${outputFile}`);
    } else if (extracted?.content) {
      console.log('\n--- BATCH RESULT ---\n');
      console.log(extracted.content);
    }
  }

} else if (cmd === 'batch-wait') {
  const batchId = getArgValue('--batch-id');
  const outputFile = getArgValue('--output');
  const intervalSec = parseInt(getArgValue('--poll-interval') || '20', 10);

  if (!batchId) {
    console.error('Usage: node openrouter-bridge.mjs batch-wait --batch-id <id> [--output <path>] [--poll-interval <sec>]');
    process.exit(1);
  }

  console.log(`⏳ Monitoring Batch ${batchId} (checking every ${intervalSec}s)...`);
  const startTime = Date.now();

  while (true) {
    const data = await getBatchStatus(batchId);
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    process.stdout.write(`\r[${elapsedSec}s elapsed] Status: ${data.status.toUpperCase()} (${data.request_counts?.completed ?? 0}/${data.request_counts?.total ?? 1} completed)... `);

    if (data.status === 'completed') {
      console.log('\n\n🎉 Batch processing completed!');
      const extracted = extractBatchResult(data);
      if (extracted?.content && outputFile) {
        fs.writeFileSync(path.resolve(outputFile), extracted.content, 'utf8');
        fs.writeFileSync(
          path.resolve(outputFile + '.meta.json'),
          JSON.stringify(
            {
              batch_id: data.id,
              model: data.model,
              usage: extracted.usage,
              cost: extracted.cost,
              elapsed_seconds: elapsedSec,
            },
            null,
            2
          ),
          'utf8'
        );
        console.log(`Output successfully written to: ${outputFile}`);
        console.log(`Cost: $${extracted.cost} | Total Tokens: ${extracted.total_tokens}`);
      } else if (extracted?.content) {
        console.log('\n' + extracted.content);
      }
      break;
    }

    if (data.status === 'failed' || data.status === 'expired' || data.status === 'cancelled') {
      console.error(`\n❌ Batch terminated with status: ${data.status}`);
      if (data.error) console.error(JSON.stringify(data.error, null, 2));
      process.exit(1);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalSec * 1000));
  }

} else if (cmd === 'batch-audit') {
  const modelAlias = getArgValue('--model') || 'opus-batch';
  const promptFile = getArgValue('--prompt-file');
  const systemFile = getArgValue('--system-file');
  const outputFile = getArgValue('--output');
  const intervalSec = parseInt(getArgValue('--poll-interval') || '20', 10);

  if (!promptFile || !outputFile) {
    console.error('Usage: node openrouter-bridge.mjs batch-audit --prompt-file <path> --output <path> [--model opus-batch] [--system-file <path>] [--poll-interval 20]');
    process.exit(1);
  }

  const promptText = fs.readFileSync(path.resolve(promptFile), 'utf8');
  const systemText = systemFile ? fs.readFileSync(path.resolve(systemFile), 'utf8') : null;

  console.log(`📤 Submitting audit to OpenRouter Batch API (${MODELS[modelAlias]?.name || modelAlias})...`);
  const batch = await submitBatch(modelAlias, promptText, { system: systemText });
  console.log(`✅ Batch registered: ${batch.id} (Status: ${batch.status})`);
  console.log(`⏳ Entering polling loop until Claude Opus 5.5 finishes reasoning...`);

  const startTime = Date.now();
  while (true) {
    const data = await getBatchStatus(batch.id);
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    process.stdout.write(`\r[${elapsedSec}s elapsed] Status: ${data.status.toUpperCase()} (${data.request_counts?.completed ?? 0}/${data.request_counts?.total ?? 1} done)... `);

    if (data.status === 'completed') {
      console.log('\n\n🎯 Audit complete!');
      const extracted = extractBatchResult(data);
      if (extracted?.content) {
        fs.writeFileSync(path.resolve(outputFile), extracted.content, 'utf8');
        fs.writeFileSync(
          path.resolve(outputFile + '.meta.json'),
          JSON.stringify(
            {
              batch_id: data.id,
              model: data.model,
              usage: extracted.usage,
              cost: extracted.cost,
              elapsed_seconds: elapsedSec,
            },
            null,
            2
          ),
          'utf8'
        );
        console.log(`Audit report saved to: ${outputFile}`);
        console.log(`💰 Batch Cost: $${extracted.cost} | Total Tokens: ${extracted.total_tokens}`);
      }
      break;
    }

    if (data.status === 'failed' || data.status === 'expired' || data.status === 'cancelled') {
      console.error(`\n❌ Batch failed with status: ${data.status}`);
      if (data.error) console.error(JSON.stringify(data.error, null, 2));
      process.exit(1);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalSec * 1000));
  }

} else if (cmd === 'batch-list') {
  const list = await listBatches();
  console.log(`\n📋 OpenRouter Batches History (${list.data?.length ?? 0} found):\n`);
  for (const b of (list.data || []).slice(0, 10)) {
    const createdDate = new Date(b.created_at * 1000).toLocaleString();
    console.log(`• [${b.status.toUpperCase()}] ${b.id}`);
    console.log(`  Model: ${b.model} | Created: ${createdDate} | Cost: $${b.usage?.cost ?? 0}`);
  }
  console.log('');

} else if (cmd === 'test') {
  console.log('Testing connectivity to OpenRouter Chat & Batch endpoints...\n');

  // Test chat models
  for (const [alias, model] of Object.entries(MODELS)) {
    if (model.type === 'chat') {
      try {
        const result = await invoke(alias, 'Responde exactamente: OK');
        console.log(`✅ ${model.name} (${model.role}): ${result.content.trim()} — ${result.duration_ms}ms — $${result.cost}`);
      } catch (err) {
        console.error(`❌ ${model.name}: ${err.message}`);
      }
    } else {
      console.log(`ℹ️  ${model.name} (${model.role}): Configured for Batches API (POST /api/v1/batches)`);
    }
  }

  // Test batch list endpoint
  try {
    const batches = await listBatches();
    console.log(`✅ Batches API Endpoint: OK (${batches.data?.length ?? 0} batches retrieved)`);
  } catch (err) {
    console.error(`❌ Batches API Endpoint: ${err.message}`);
  }

} else {
  console.log('VSM Store OpenRouter Multi-Model Bridge');
  console.log('\nSupported Models:');
  for (const [alias, m] of Object.entries(MODELS)) {
    console.log(`  ${alias.padEnd(12)} -> ${m.name} [${m.type}]`);
  }
  console.log('\nCommands:');
  console.log('  invoke        --model <glm-flash|luna-pro|opus> --prompt-file <path> [--output <path>]');
  console.log('  batch-audit   --model opus-batch --prompt-file <path> --output <path> [--poll-interval 20]');
  console.log('  batch-submit  --model opus-batch --prompt-file <path> [--custom-id <id>]');
  console.log('  batch-status  --batch-id <id> [--output <path>]');
  console.log('  batch-wait    --batch-id <id> [--output <path>] [--poll-interval 20]');
  console.log('  batch-list    Lists recent batch jobs');
  console.log('  test          Tests connectivity to chat and batch endpoints');
}
