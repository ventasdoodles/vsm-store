// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  authenticateMercadoPagoRequest,
  WebhookRequestError,
} from '../signed-request';

const TEST_SECRET = 'test_webhook_secret_key_12345';
const TEST_PAYMENT_ID = '987654321';
const TEST_REQUEST_ID = 'req_unique_trace_id_999';

async function generateValidSignature(
  secret: string,
  paymentId: string,
  requestId: string,
  timestampMs: number,
): Promise<{ signatureHeader: string; ts: string }> {
  const ts = Math.floor(timestampMs / 1000).toString();
  const manifest = `id:${paymentId.toLowerCase()};request-id:${requestId};ts:${ts};`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(manifest),
  );
  const v1 = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return {
    signatureHeader: `ts=${ts},v1=${v1}`,
    ts,
  };
}

describe('Mercado Pago Webhook Ingress (signed-request.ts)', () => {
  it('rejects non-POST HTTP methods with 405 Method not allowed', async () => {
    const req = new Request('https://api.vsm.test/functions/v1/mercadopago-webhook', {
      method: 'GET',
    });

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET),
    ).rejects.toThrow(WebhookRequestError);

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET),
    ).rejects.toMatchObject({ status: 405, message: 'Method not allowed' });
  });

  it('throws an error if secret is missing or empty', async () => {
    const req = new Request('https://api.vsm.test/functions/v1/mercadopago-webhook', {
      method: 'POST',
    });

    await expect(
      authenticateMercadoPagoRequest(req, ''),
    ).rejects.toThrow('MERCADOPAGO_WEBHOOK_SECRET is not configured');
  });

  it('rejects requests with missing or invalid payment ID in query string with 400', async () => {
    const reqNoId = new Request('https://api.vsm.test/functions/v1/mercadopago-webhook', {
      method: 'POST',
    });

    await expect(
      authenticateMercadoPagoRequest(reqNoId, TEST_SECRET),
    ).rejects.toMatchObject({ status: 400, message: 'Invalid signed payment ID' });

    const reqBadId = new Request(
      'https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=non-numeric-id',
      { method: 'POST' },
    );

    await expect(
      authenticateMercadoPagoRequest(reqBadId, TEST_SECRET),
    ).rejects.toMatchObject({ status: 400, message: 'Invalid signed payment ID' });
  });

  it('accepts deduplicated payment IDs when both data.id and id match', async () => {
    const now = Date.now();
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}&id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type: 'payment', data: { id: TEST_PAYMENT_ID } }),
      },
    );

    const result = await authenticateMercadoPagoRequest(req, TEST_SECRET, now);
    expect(result).toEqual({ type: 'payment', paymentId: TEST_PAYMENT_ID });
  });

  it('rejects conflicting query IDs if different values are provided', async () => {
    const req = new Request(
      'https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=111&id=222',
      { method: 'POST' },
    );

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET),
    ).rejects.toMatchObject({ status: 400, message: 'Invalid signed payment ID' });
  });

  it('rejects requests with missing signature or request-id headers with 401', async () => {
    const reqNoSig = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: { 'x-request-id': TEST_REQUEST_ID },
      },
    );

    await expect(
      authenticateMercadoPagoRequest(reqNoSig, TEST_SECRET),
    ).rejects.toMatchObject({ status: 401, message: 'Missing signature' });

    const reqNoReqId = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: { 'x-signature': 'ts=123,v1=abc' },
      },
    );

    await expect(
      authenticateMercadoPagoRequest(reqNoReqId, TEST_SECRET),
    ).rejects.toMatchObject({ status: 401, message: 'Missing signature' });
  });

  it('rejects malformed signature header formats', async () => {
    const makeReq = (header: string) =>
      new Request(
        `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
        {
          method: 'POST',
          headers: {
            'x-signature': header,
            'x-request-id': TEST_REQUEST_ID,
          },
        },
      );

    await expect(
      authenticateMercadoPagoRequest(makeReq('invalid-format'), TEST_SECRET),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid signature header' });

    await expect(
      authenticateMercadoPagoRequest(makeReq('ts=12345,ts=67890'), TEST_SECRET),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid signature header' });
  });

  it('rejects expired signatures exceeding maximum allowed skew (> 5 minutes)', async () => {
    const now = 1700000000000;
    const sixMinutesAgo = now - 6 * 60 * 1000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      sixMinutesAgo,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
        },
      },
    );

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET, now),
    ).rejects.toMatchObject({ status: 401, message: 'Expired signature' });
  });

  it('verifies a valid HMAC-SHA256 signature and returns the signed payment notification', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}&type=payment`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type: 'payment', data: { id: TEST_PAYMENT_ID } }),
      },
    );

    const result = await authenticateMercadoPagoRequest(req, TEST_SECRET, now);
    expect(result).toEqual({ type: 'payment', paymentId: TEST_PAYMENT_ID });
  });

  it('rejects invalid signature when secret is incorrect or manifest was tampered', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      'wrong_secret_key',
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
        },
      },
    );

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET, now),
    ).rejects.toMatchObject({ status: 401, message: 'Invalid signature' });
  });

  it('rejects conflicting payment IDs between URL query and POST body with 400', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ type: 'payment', data: { id: 'different_id_99999' } }),
      },
    );

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET, now),
    ).rejects.toMatchObject({ status: 400, message: 'Conflicting payment IDs' });
  });

  it('rejects payloads exceeding the 16KB threshold with 413 Payload too large', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const largePayload = 'a'.repeat(17_000);
    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
          'content-length': '17000',
        },
        body: largePayload,
      },
    );

    await expect(
      authenticateMercadoPagoRequest(req, TEST_SECRET, now),
    ).rejects.toMatchObject({ status: 413, message: 'Payload too large' });
  });

  it('safely handles empty or whitespace-only bodies without error', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}&topic=payment`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
        },
        body: '   ',
      },
    );

    const result = await authenticateMercadoPagoRequest(req, TEST_SECRET, now);
    expect(result).toEqual({ type: 'payment', paymentId: TEST_PAYMENT_ID });
  });

  it('returns null for non-payment event types (e.g. merchant_order) for silent ack', async () => {
    const now = 1700000000000;
    const { signatureHeader } = await generateValidSignature(
      TEST_SECRET,
      TEST_PAYMENT_ID,
      TEST_REQUEST_ID,
      now,
    );

    const req = new Request(
      `https://api.vsm.test/functions/v1/mercadopago-webhook?data.id=${TEST_PAYMENT_ID}&topic=merchant_order`,
      {
        method: 'POST',
        headers: {
          'x-signature': signatureHeader,
          'x-request-id': TEST_REQUEST_ID,
        },
      },
    );

    const result = await authenticateMercadoPagoRequest(req, TEST_SECRET, now);
    expect(result).toBeNull();
  });
});
