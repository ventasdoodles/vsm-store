# AUDITORÍA DESPIADADA DE SUPABASE EDGE FUNCTIONS (DENO)
## VSM Store — Pagos, Webhooks, Checkout, Inventario y Operaciones

**Fecha de Generación:** 2026-10-02T01:38:30.912Z  
**Modelo Auditor:** OpenAI GPT-6 Sol Pro Batch (`openai/gpt-6-sol-pro:batch`)  
**Tokens Auditados:** 387618  
**Costo:** $0.4440211  
**Estado:** 100% Completado  

---

# VSM Store Edge Functions: production security audit

**Release decision: block deployment of this version.** The highest-risk issue is not simply an unsigned webhook: the checkout, payment-preference, and payment-fulfillment paths do not share an enforceable, atomic definition of *which payment, for which merchant, currency, amount, and order* is authorized to change an order to `paid`.

One important limit on this audit: the implementation and schema of `fulfill_order_payment`, `decrement_stock_for_order`, coupon RPCs, table constraints, RLS policies, and Edge Function JWT settings were not supplied. The TypeScript comments describing those components are **not evidence that their claimed guarantees exist**. A purported “drop-in, production-ready” replacement for the entire payment system without those artifacts would be misleading. The code below is directly usable for the webhook ingress boundary; the database invariants listed afterward are mandatory before enabling fulfillment.

Line references below refer to the files as pasted; quoted snippets identify the locations unambiguously.

## 1. Findings that block payments

| Severity | Location and offending code | Exploit or failure | Required correction |
|---|---|---|---|
| **CRITICAL** | `mercadopago-webhook/index.ts`, `serve`; `webhook-contract.ts`, `handleMercadoPagoWebhookRequest`: `extractMercadoPagoNotification(url, body)` followed by `deps.processWebhook(notification)`. Neither checks `x-signature` or `x-request-id`. | Anyone can submit payment IDs and force calls to the MP API and privileged order RPC. Fetching the payment from MP prevents *inventing* an approved payment, but does **not** establish that the notification came from MP or that a real payment is authorized for the referenced order. It also creates an unauthenticated, potentially expensive API/DB endpoint. | Verify MP’s HMAC over its documented manifest **before** any MP or database call; reject malformed and stale signatures. Also perform payment-to-order checks inside the fulfillment transaction. |
| **CRITICAL** | `webhook-contract.ts`, `processMercadoPagoWebhook`: `const orderId = payment.external_reference.trim()` → `fulfillOrderPayment(orderId, notification.paymentId, ..., payment)`. | An approved payment whose external reference names another order can be used to fulfill that order unless the unseen RPC independently checks merchant, payment method, currency, exact amount, payment identity, and order binding. No such check appears in the supplied TypeScript. | Enforce all bindings in the locked database transaction; make payment IDs globally unique. Do not infer those checks from an RPC name. |
| **HIGH** | `webhook-contract.ts`, `processMercadoPagoWebhook`: `resolvePaymentState(payment.status)` maps every unknown status to `pending`; `updateOrderPaymentGuarded(...)` updates `mp_payment_id`. | A late or unrelated payment notification can overwrite the payment ID or cancel/change the state of an order. The refund branch of the guard permits `refunded` from *any non-refunded state*, not just a paid order for the **same** payment. | Use an explicit status allowlist and one transactional state machine, keyed by the existing bound payment ID. Refunds must identify the original order payment. |
| **HIGH** | `mercadopago-webhook/index.ts`, `updateOrderPaymentGuarded`: `await query` checks only `error`, not affected rows. | A guard that changes zero rows is reported as successfully processed. This hides races, stale notifications, and incorrect payment bindings. | Return the updated row/count and distinguish `applied`, `duplicate`, `stale`, and `conflict` in a transactional RPC. |
| **HIGH** | `create-payment/index.ts`, final `orders.update({ mp_preference_id: result.id, ... }).eq('id', order_id)`; result is ignored. | Two concurrent requests can create two live preferences and overwrite the stored ID; an update failure still returns a payment link. A webhook can arrive before the preference is durably associated with the order. | Persist a uniquely keyed payment attempt/reservation first; serialize attempt creation per order; reconcile provider creation and DB failures. Never return an unpersisted preference as authoritative. |
| **HIGH** | `create-payment/index.ts`, `getExistingPreferenceInitPoint`: every non-2xx response becomes `null`. | A transient MP outage causes creation of a second preference instead of a safe retry. | Distinguish definitive “not found” from timeout, 429, and 5xx; fail closed on uncertain outcomes. |
| **HIGH** | `checkout-submit/index.ts`, order insert → `order_items` insert → coupon insert → `increment_coupon_uses`, with compensating `orders.delete()`. | These are separate transactions. A deletion can fail; a coupon increment can succeed while another step fails; concurrent uses can exceed `max_uses`; a paid/processing order could be deleted in a race. | One database transaction for order, canonical items, coupon eligibility/redemption, and counters. Database uniqueness/locking must enforce coupon limits. |
| **HIGH** | `checkout-submit/index.ts`, pending-order search `.limit(20)` and `findReusablePendingOrder(...)`. | Concurrent identical submissions both see no order and insert duplicates. The 21st pending order is not considered. “Same-looking cart” is not a durable idempotency key. | Require a client-generated checkout idempotency key, scoped to the authenticated user, with a database `UNIQUE` constraint and an intent hash. Resolve retries in one transaction. |
| **HIGH** | `mercadopago-webhook/__tests__/webhook-contract.test.ts`, `createDeps`: omits required `fulfillOrderPayment` and `updateOrderPaymentGuarded`; tests instead assert `updateOrderPayment`, `decrementStock`, and `insertConversionEvent` calls. | The tests exercise an obsolete implementation. With TypeScript checking they should fail to type-check; without it, approved-payment tests fail at runtime. There is no credible regression coverage for the deployed transaction path. | Replace these tests with concurrent approved deliveries, out-of-order statuses, refund/payment-ID mismatch, RPC rejection, rollback, signature, and monetary-binding tests. |

**Price assessment:** Checkout *does* fetch product and variant prices from the database; it does not directly accept a client-supplied unit price. That is a useful control, but not sufficient:

- `checkout-submit/index.ts`, `validateItems`: `if (!item?.quantity || item.quantity <= 0)` accepts `Infinity`, fractional quantities, huge numbers, and duplicate lines. Stock is checked **per line**, so two lines for the same SKU can each pass while their sum exceeds stock.
- Product price validation checks `Number.isFinite(unitPrice)` but not `unitPrice > 0`; subtotal, discounts, and totals use binary floating-point arithmetic. Negative or zero catalog prices, malformed coupon values, and rounding can produce invalid payment amounts.
- Stock is read at checkout but deducted on payment approval. Concurrent checkouts can sell the same stock unless the **fulfillment RPC** locks and checks aggregate quantities.
- `create-payment/index.ts` constructs MP items from stored `orders.items` rather than the authoritative `order_items` and never proves their sum equals the persisted total. If the two representations drift, preference and fulfillment disagree.
- Shipping is always inserted as `shipping_cost: 0`. No tariff, jurisdiction, or currency policy is demonstrated. MP uses hard-coded `MXN`; the code does not establish that the order itself has an immutable `MXN` currency.

### Webhook ingress replacement

This replaces the **request authentication boundary**, not the missing database invariants. Configure `MERCADOPAGO_WEBHOOK_SECRET` to MP’s webhook secret and ensure MP is configured to send a signed `data.id` query parameter. This intentionally rejects unsigned legacy notifications; stage the change against real MP deliveries before rollout.

**`supabase/functions/mercadopago-webhook/signed-request.ts`**
```ts
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
```

Use it at the start of `mercadopago-webhook/index.ts` instead of calling `handleMercadoPagoWebhookRequest(req, ...)`, which would parse the already-consumed body and bypass this boundary:

```ts
import {
  authenticateMercadoPagoRequest,
  WebhookRequestError,
} from "./signed-request.ts";

// Inside serve(async (req) => { ... }), BEFORE creating an MP client or
// invoking processMercadoPagoWebhook:
const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET");
if (!secret) {
  console.error("Mercado Pago webhook secret missing");
  return new Response("Unavailable", { status: 503 });
}

let notification;
try {
  notification = await authenticateMercadoPagoRequest(req, secret);
} catch (error) {
  if (error instanceof WebhookRequestError) {
    return new Response(error.message, {
      status: error.status,
      headers: error.status === 405
        ? { Allow: "POST" }
        : undefined,
    });
  }
  console.error("Webhook ingress failure", error);
  return new Response("Unavailable", { status: 503 });
}
if (notification === null) return new Response("OK", { status: 200 });

// Continue with the existing processMercadoPagoWebhook(notification, deps)
// integration. Its database/payment checks must be fixed as specified below.
```

**This is not permission to ship the existing fulfillment path.** Signature verification authenticates the *notification*, not the payment’s entitlement to fulfill an order. At minimum, the locked payment transaction must check:

1. Order exists; `payment_method = 'mercadopago'`; order and payment currency are `MXN`.
2. Payment is fetched from MP using the **merchant’s** credentials, has the requested ID, belongs to the expected collector/account, is approved, and is bound to this checkout attempt/order. Verify the integration’s actual MP preference/metadata propagation rather than assuming it.
3. Payment amount equals the immutable order payable amount using integer centavos or SQL `numeric` with an explicit rounding policy. Never compare JavaScript floats as the final authority.
4. An MP payment ID cannot fulfill two orders: database `UNIQUE` on its canonical payment association.
5. Lock the order and relevant stock/coupon rows; perform state transition, aggregate stock deduction, and uniquely keyed conversion event in **one transaction**. Duplicate deliveries return `skip`; conflicts return `reject` without mutating anything.
6. Refunds reference the same bound original payment, obey explicit allowed transitions, and apply any stock/coupon reversal policy **once**. Unknown provider statuses never silently become `pending`.

An MP API read, then a separate TypeScript comparison, then the current RPC still leaves a TOCTOU gap unless the RPC itself enforces the immutable data/binding. The supplied SQL is necessary to produce an honest full replacement.

## 2. Checkout and preference corrections

**`checkout-submit/index.ts`, `validateForm(payload.form)` and `validateItems(payload.items)`**: casting `await req.json()` to `CheckoutRequest` performs no runtime validation. `payload = null`, `form = null`, non-string `customerName`, or enormous arrays can throw or consume substantial resources. The same problem appears in `create-payment/index.ts` at `const { order_id } = await req.json()`.

For an immediate, narrowly scoped input fix, validate before calling the existing business logic:

```ts
function isRecord(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}
function isUuid(x: unknown): x is string {
  return typeof x === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}
function isQuantity(x: unknown): x is number {
  return typeof x === "number" &&
    Number.isSafeInteger(x) && x >= 1 && x <= 100;
}
function parseCheckoutInput(raw: unknown): CheckoutRequest {
  if (!isRecord(raw) || !isRecord(raw.form) ||
      !Array.isArray(raw.items) ||
      raw.items.length < 1 || raw.items.length > 100 ||
      typeof raw.form.customerName !== "string" ||
      raw.form.customerName.length > 150 ||
      typeof raw.form.customerPhone !== "string" ||
      raw.form.customerPhone.length > 40 ||
      !["pickup", "delivery"].includes(String(raw.form.deliveryType)) ||
      !["transfer", "mercadopago", "cash"].includes(String(raw.form.paymentMethod))) {
    throw new Error("Invalid checkout");
  }
  for (const item of raw.items) {
    if (!isRecord(item) || !isUuid(item.product_id) ||
        !isQuantity(item.quantity) ||
        (item.variant_id != null && !isUuid(item.variant_id))) {
      throw new Error("Invalid checkout item");
    }
  }
  return raw as CheckoutRequest;
}
```

This **does not replace** a body-byte cap, address/coupon field bounds, an application-specific maximum aggregate quantity, or transactional pricing. Apply a byte cap *before* `req.json()`, including when `Content-Length` is absent.

Other concrete checkout defects:

- **HIGH — `checkout-submit/index.ts`, `buildItemsSignature` and item loop:** duplicates are aggregated for reuse but **not** for stock checking/order insertion. Normalize and aggregate by `(product_id, variant_id)` *before* both checks and persistence; reject sums over a defined limit.
- **HIGH — coupon checks:** `.select('id')` ignores its `error`; coupon eligibility and `used_count` are checked outside redemption’s transaction. Database locking and unique `(customer_id, coupon_code)`-style enforcement are needed according to the intended coupon policy.
- **MEDIUM — `findReusablePendingOrder`:** its shipping signature for saved addresses is only `address:<id>`. If that address changes, the previously snapshotted order may be silently reused for a different delivery address. Compare an immutable normalized address snapshot or intent hash.
- **MEDIUM — reuse path:** `await supabase.from('orders').update(...)` ignores its error and affected rows. Do not claim attribution was persisted when it was not.
- **HIGH — `create-payment/index.ts`:** `.single()` treats “not found” as a database error and returns 500; validate `order_id`, return an indistinguishable 404 for missing/not-owned orders, and check all update errors/results.
- **HIGH — `create-payment/index.ts`:** `Number(order.total) <= 0` lets `NaN` through because `NaN <= 0` is false. Require a valid positive integer-centavo amount; require positive integer line quantities and a matching order total.
- **MEDIUM — `create-payment/index.ts`:** the bearer token is checked but method is not restricted to `POST`; MP requests and existing-preference fetches have no explicit deadline. Use `AbortSignal.timeout(...)` for native `fetch`, and the MP SDK’s supported timeout mechanism or a bounded API wrapper; treat timeout as an *uncertain* preference-creation outcome that must be reconciled.
- **MEDIUM — both checkout endpoints:** `Access-Control-Allow-Origin: *` permits any site to invoke these authenticated endpoints with a supplied bearer token. CORS is **not authorization** and is not by itself a bearer-token theft vulnerability, but origin allowlisting reduces exposure and abuse. Check `Origin` against configured storefront origins, and retain JWT/user ownership checks.

## 3. Service-role and operations audit

| Severity | Exact file/function and snippet | Consequence and correction |
|---|---|---|
| **CRITICAL** | `knowledge-ingestor/index.ts`, `authorizeKnowledgeWrite`: `if (isServiceRoleToken(decodeJwtClaims(bearerToken))) ... authorized: true`; `auth.ts`, `decodeJwtClaims` merely base64-decodes the token. | A caller can construct an **unsigned** JWT-looking string with `{"role":"service_role"}`. With gateway JWT verification disabled or bypassed, this grants unrestricted service-role knowledge writes. Never use decoded claims as authentication. Authenticate users with `auth.getUser`; for an authorized machine caller, compare the **entire supplied credential** to a separately configured secret or validate its signature/issuer/audience. Review deployed `verify_jwt` settings immediately. |
| **HIGH** | `knowledge-ingestor/index.ts`, `ingest_text`: soft-deletes existing source **before** embedding, ignores update error, then inserts chunks one at a time and reports `success: true` with failures. | Failed Gemini calls or a concurrent ingest can destroy the active document and leave partial replacements. Generate bounded chunks/embeddings first; publish a new version and deactivate the old version atomically. Reject partial publication. Limit text, chunk size/count, overlap, and concurrent jobs. |
| **HIGH** | `bundle-intelligence/index.ts`, coupon insert: unauthenticated handler, `discount_value: 15`, `max_uses: 1`, insert error ignored. | Anonymous requests can spend Gemini credits and mint redeemable discounts repeatedly. Require an authenticated eligible customer, server-load the product, rate-limit, bind coupons to that customer/cart, and enforce issuance limits in the database. Never return a code after an insert error. |
| **HIGH** | `loyalty-intelligence/index.ts`, `{ customerId }` → service-role `customer_intelligence_360` → coupon/proposition inserts. | A regular caller can request rewards for arbitrary customers, consume credits, and disclose their segment/behavior through the response. Require verified admin authorization or require `customerId === authenticatedUser.id` with an explicitly designed self-service policy. Calculate and cap the discount server-side; do not trust `aiData.discountValue` or `discountType`. Make the two inserts transactional. |
| **HIGH** | `inventory-oracle/index.ts`, `.from('orders').select('items, created_at').gte(...)` with no `limit`; `currentStock` from request. | Anyone able to invoke it can repeatedly scan a 30-day order history using the service role and exhaust DB/AI quotas; results use attacker-supplied stock and count unpaid orders as sales. Require admin access, fetch stock server-side, and use an indexed, bounded aggregate of fulfilled sales. |
| **HIGH** | `dashboard-intelligence/index.ts`, caller-supplied `stats` inserted into a Gemini prompt; no admin check. | It does not directly read DB metrics here, but an unauthenticated caller can consume Gemini quota, inject prompts, and obtain misleading “admin” insights. Require admin authorization; fetch metrics server-side or label supplied data untrusted. |
| **HIGH** | `product-intelligence`, `visual-compatibility`, `embeddings-processor`, and `bundle-intelligence`, unrestricted `req.json()` → Gemini. | Unauthenticated or insufficiently authorized, unbounded paid-API invocation. In `visual-compatibility`, arbitrary base64 images particularly amplify bandwidth/memory costs. Require appropriate role/customer policy, byte limits, quotas, and provider deadlines. |
| **HIGH** | `track-shipment/index.ts`, arbitrary `trackingNumber` sent to DHL, then shipment events returned. | Tracking numbers can expose recipient movement/location; the endpoint is a DHL-key abuse proxy. Authenticate the caller and prove the number belongs to their order (or require an authorized operator); strictly limit number format and response fields. |
| **MEDIUM** | `visual-compatibility/index.ts`, `.or(\`name.ilike.%${aiData.model}%,short_description.ilike.%${aiData.model}%,tags.cs.{"${aiData.model}"}\`)`. | Model-generated text is interpolated into PostgREST filter syntax. A malformed/hostile model response can change the query or make it fail. Validate a short alphanumeric model token and use structured, parameterized database search/RPC; do not treat AI output as safe SQL/filter syntax. |
| **MEDIUM** | `knowledge-ingestor/index.ts`, `chunkMarkdownText(text, targetSize, overlapChars)`. | Caller-controlled zero/negative/huge sizes and overlap, plus unsplittable long sentences, break chunk limits and can drive long, costly loops. Bound parameters and total document/chunk count; split oversized spans deterministically. |
| **MEDIUM** | `knowledge-ingestor/index.ts`, `delete_source`: `{ count } = await ...update(...)` without requesting a count. | The reported `deactivated` can be `null`; it is not a reliable audit count. Request an exact count and record actor/source/version in an audit trail. |

Additional cross-cutting defects:

* **Error disclosure:** `inventory-oracle`, `dashboard-intelligence`, `product-intelligence`, `loyalty-intelligence`, `bundle-intelligence`, `visual-compatibility`, `embeddings-processor`, and `knowledge-ingestor` return `err.message` to clients. Provider messages may contain request details; database messages reveal schema/operations. Log a bounded internal incident ID and return a generic error. Do not log complete provider error bodies, raw customer prompts, image contents, bearer tokens, or API-key-bearing URLs.
* **`track-shipment/index.ts`:** the mapping accesses `ev.location?.address` even though `ev` is typed `Record<string, unknown>`; this is not sound TypeScript. Validate the nested DHL response, bound events, and apply a fetch timeout. Avoid logging arbitrary DHL response text.
* **`_shared/gemini-api.ts`:** retry backoff has no total deadline, does not honor `Retry-After`, retries network errors without a caller-wide budget, and `parseGeminiError` may consume the response body twice after failed JSON parsing. `geminiGenerateContentJson<T>` casts unvalidated provider JSON to `T`. Bound time/retries and validate provider output schemas.
* **Provider outputs are not authority:** `inventory-oracle` accepts arbitrary AI depletion dates; `dashboard-intelligence` accepts arbitrary `health_score`; `product-intelligence` returns unvalidated marketing/spec claims; `visual-compatibility` trusts claimed model/flags; both coupon-generating functions trust AI-generated fields. Schema-validate responses and enforce business bounds in deterministic code. AI must never set a payable price, entitlement, discount policy, or inventory count.
* **Operational consistency:** comments claiming Gemini `v1` conflict with `_shared/gemini-api.ts` declaring `v1beta`; comments citing model `2.0` conflict with `2.5` calls. Pin and test supported models/API versions rather than using migration comments as configuration.

## 4. Verification required before release

Do not close the audit on unit tests alone. Run integration tests against the **actual migrations and function configuration** for:

- Unsigned, incorrectly signed, expired, oversized, and conflicting-ID MP notifications; authentic MP samples from every configured notification format.
- Five simultaneous deliveries of one approved payment; approved followed by stale pending/failed; refund before and after approval; different payment IDs and different orders; rollback on stock or conversion failure.
- Wrong merchant, wrong currency, one-cent under/overpayment, wrong preference/attempt, reused approved payment, and missing order.
- Concurrent identical checkouts, aggregate duplicate-SKU overstock, coupon last-use races, payment-preference creation timeout, and DB-write failure after provider success.
- Unsigned forged `service_role` claims with **the deployed Edge Function JWT-verification setting**, ordinary customer JWTs against every service-role-backed operations function, large bodies, and provider timeouts.

**Bottom line:** add signature verification immediately, but **do not equate that patch with payment security**. The release gate is a reviewed SQL state machine and schema that atomically prove payment identity, merchant, currency, amount, order binding, stock, coupon, and idempotency.

---
*Auditoría generada por Sol Pro Batch vía Antigravity Orchestrator.*
