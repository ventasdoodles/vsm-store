#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const fromJson = valueFor('--from-json');

function valueFor(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] || null;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function loadInput() {
  if (!fromJson) return {};
  const filePath = path.resolve(fromJson);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const input = loadInput();
const evidence = {
  title: input.title || valueFor('--title') || 'Bounded QA Evidence',
  orderId: input.orderId || valueFor('--order-id') || '',
  status: input.status || valueFor('--status') || '',
  driverId: input.driverId || valueFor('--driver-id') || '',
  orderEvents: input.orderEvents ?? parseNumber(valueFor('--order-events')),
  orderOffers: input.orderOffers ?? parseNumber(valueFor('--order-offers')),
  walletTransactions: input.walletTransactions ?? parseNumber(valueFor('--wallet-transactions')),
  cleanup: input.cleanup || valueFor('--cleanup') || 'not-claimed',
  driverBaseline: input.driverBaseline || valueFor('--driver-baseline') || 'not-claimed',
  retainedEvidence: input.retainedEvidence || valueFor('--retained-evidence') || 'not-checked',
  evidenceLevel: input.evidenceLevel || valueFor('--evidence-level') || 'local/manual',
  residualRisks: normalizeList(input.residualRisks || valueFor('--residual-risks')),
  nonClaims: normalizeList(input.nonClaims || valueFor('--non-claims')),
};

const failures = [];
if (!evidence.orderId) failures.push('FAIL_ORDER_ID_MISSING');
if (evidence.orderId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(evidence.orderId)) {
  failures.push('FAIL_ORDER_ID_NOT_UUID');
}
if (!evidence.status) failures.push('FAIL_STATUS_MISSING');
if (evidence.orderEvents === null) failures.push('FAIL_ORDER_EVENTS_MISSING');
if (evidence.orderOffers === null) failures.push('FAIL_ORDER_OFFERS_MISSING');
if (evidence.walletTransactions === null) failures.push('FAIL_WALLET_TRANSACTIONS_MISSING');

const defaultNonClaims = [
  'No production readiness claim.',
  'No real payment/payout proof.',
  'No GPS/tracking/provider-grade proof.',
  'No notification or real courier operations proof.',
  'No full security/compliance proof.',
];
if (!evidence.nonClaims.length) evidence.nonClaims = defaultNonClaims;
if (!evidence.residualRisks.length) evidence.residualRisks = ['Residual risks must be filled from the accepted audit before canonization.'];

const report = {
  ok: failures.length === 0,
  failures,
  evidence,
  markdown: renderMarkdown(evidence, failures),
};

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(report.markdown);
}

process.exit(report.ok ? 0 : 1);

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return String(value).split('|').map((item) => item.trim()).filter(Boolean);
}

function row(label, value) {
  return `| ${label} | ${value === null || value === undefined || value === '' ? 'MISSING' : value} |`;
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function renderMarkdown(item, failuresForReport) {
  return `# ${item.title}

## Proof Key

${row('order_id / orders.id', item.orderId)}
${row('status', item.status)}
${row('driver_id', item.driverId || 'not-claimed')}
${row('evidence level', item.evidenceLevel)}

## DB / Ledger Counts

${row('order_events', item.orderEvents)}
${row('order_offers', item.orderOffers)}
${row('wallet_transactions', item.walletTransactions)}
${row('cleanup', item.cleanup)}
${row('driver baseline', item.driverBaseline)}
${row('retained evidence', item.retainedEvidence)}

## Residual Risks

${bullets(item.residualRisks)}

## Non-Claims

${bullets(item.nonClaims)}

## Ledger Gate

${failuresForReport.length ? `BLOCKED: ${failuresForReport.join(', ')}` : 'PASS: evidence record has the required structural fields.'}
`;
}
