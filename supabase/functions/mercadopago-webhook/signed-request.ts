/**
 * signed-request.ts — Mercado Pago Webhook HMAC Signature Verification
 *
 * Authenticates incoming webhook notifications from Mercado Pago by verifying
 * their HMAC-SHA256 signature (x-signature header) before any processing.
 *
 * This replaces the previous unsigned webhook ingress that allowed anyone to
 * forge payment notifications.
 *
 * @requires MERCADOPAGO_WEBHOOK_SECRET (MP's webhook secret from dashboard)
 * @author Sol Pro (auditor) + Claude Opus 4.6 (integration)
 * @version 1.0.0
 */

export interface SignedPaymentNotification {
  type: "payment";
  paymentId: string;
}

const MAX_BODY_BYTES = 16_384;
const MAX_SKEW_MS = 5 * 60_000;
const encoder = new TextEncoder();

export class WebhookRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function readBoundedBody(req: Request): Promise<unknown> {
  const advertised = req.headers.get("content-length");
  if (
    advertised !== null &&
    (!/^\d+$/.test(advertised) || Number(advertised) > MAX_BODY_BYTES)
  ) {
    throw new WebhookRequestError(413, "Payload too large");
  }

  if (!req.body) return null;

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        throw new WebhookRequestError(413, "Payload too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (size === 0) return null;
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new WebhookRequestError(400, "Invalid JSON");
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function paymentBodyId(body: unknown): string | null {
  const data = record(record(body)?.data);
  const id = data?.id;
  return typeof id === "string" || typeof id === "number"
    ? String(id)
    : null;
}

/**
 * MP signs:
 * id:[data.id_url];request-id:[x-request-id];ts:[ts];
 * The URL ID is lowercased per MP's notification validation instructions.
 */
export async function authenticateMercadoPagoRequest(
  req: Request,
  secret: string,
  nowMs = Date.now(),
): Promise<SignedPaymentNotification | null> {
  if (req.method !== "POST") {
    throw new WebhookRequestError(405, "Method not allowed");
  }
  if (!secret) throw new Error("MERCADOPAGO_WEBHOOK_SECRET is not configured");

  const url = new URL(req.url);
  const urlIds = [
    ...url.searchParams.getAll("data.id"),
    ...url.searchParams.getAll("id"),
  ];
  if (urlIds.length !== 1 || !/^[0-9]{1,32}$/.test(urlIds[0])) {
    throw new WebhookRequestError(400, "Invalid signed payment ID");
  }
  const paymentId = urlIds[0];

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (
    !signatureHeader || !requestId ||
    requestId.length > 128 || !/^[\x21-\x7e]+$/.test(requestId)
  ) {
    throw new WebhookRequestError(401, "Missing signature");
  }

  const fields = new Map<string, string>();
  for (const segment of signatureHeader.split(",")) {
    const match = /^\s*(ts|v1)=([^\s,]+)\s*$/.exec(segment);
    if (!match || fields.has(match[1])) {
      throw new WebhookRequestError(401, "Invalid signature header");
    }
    fields.set(match[1], match[2]);
  }
  const ts = fields.get("ts");
  const hex = fields.get("v1");
  if (!ts || !/^\d{10}(\d{3})?$/.test(ts) ||
      !hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new WebhookRequestError(401, "Invalid signature header");
  }

  const timestampMs = ts.length === 10 ? Number(ts) * 1000 : Number(ts);
  if (!Number.isSafeInteger(timestampMs) ||
      Math.abs(nowMs - timestampMs) > MAX_SKEW_MS) {
    throw new WebhookRequestError(401, "Expired signature");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const mac = new Uint8Array(
    hex.match(/../g)!.map((part) => Number.parseInt(part, 16)),
  );
  const manifest =
    `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  if (!(await crypto.subtle.verify(
    "HMAC", key, mac, encoder.encode(manifest)
  ))) {
    throw new WebhookRequestError(401, "Invalid signature");
  }

  // Parse only after authentication. Do not let a signed URL ID and a
  // conflicting body ID select different payments.
  const body = await readBoundedBody(req);
  const bodyId = paymentBodyId(body);
  if (bodyId !== null && bodyId !== paymentId) {
    throw new WebhookRequestError(400, "Conflicting payment IDs");
  }
  const payloadType = record(body)?.type;
  const queryType = url.searchParams.get("type") ??
    url.searchParams.get("topic");
  if (queryType && payloadType && queryType !== payloadType) {
    throw new WebhookRequestError(400, "Conflicting event types");
  }
  const type = queryType ?? payloadType;
  return type === "payment" ? { type, paymentId } : null;
}
