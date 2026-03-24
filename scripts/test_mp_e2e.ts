import { existsSync } from 'node:fs';
import process from 'node:process';

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

interface CliOptions {
    help: boolean;
    paymentId?: string;
    waitMs?: number;
    webhookUrl?: string;
}

interface MercadoPagoPayment {
    id: number | string;
    external_reference?: string | null;
    status: string;
    transaction_amount?: number | null;
}

interface ExpectedOrderState {
    orderStatus: string;
    paymentStatus: string;
}

const DEFAULT_WEBHOOK_URL = 'http://127.0.0.1:54321/functions/v1/mercadopago-webhook';
const DEFAULT_WAIT_MS = 8000;
const ENV_FILES = ['.env.test', '.env.local', '.env'];

for (const envFile of ENV_FILES) {
    if (existsSync(envFile)) {
        loadEnv({ path: envFile, quiet: true });
    }
}

function parseCliArgs(argv: string[]): CliOptions {
    const options: CliOptions = { help: false };

    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        const nextArg = argv[index + 1];

        if (arg === '--help' || arg === '-h') {
            options.help = true;
            continue;
        }

        if (arg === '--payment-id' && nextArg) {
            options.paymentId = nextArg;
            index += 1;
            continue;
        }

        if (arg.startsWith('--payment-id=')) {
            options.paymentId = arg.slice('--payment-id='.length);
            continue;
        }

        if (arg === '--webhook-url' && nextArg) {
            options.webhookUrl = nextArg;
            index += 1;
            continue;
        }

        if (arg.startsWith('--webhook-url=')) {
            options.webhookUrl = arg.slice('--webhook-url='.length);
            continue;
        }

        if (arg === '--wait-ms' && nextArg) {
            options.waitMs = Number(nextArg);
            index += 1;
            continue;
        }

        if (arg.startsWith('--wait-ms=')) {
            options.waitMs = Number(arg.slice('--wait-ms='.length));
        }
    }

    return options;
}

function printUsage(): void {
    console.log(`
Uso:
  npm run test:mp:e2e -- --payment-id=123456789

Opciones:
  --payment-id   Payment ID real de Mercado Pago Sandbox.
  --webhook-url  URL del webhook local. Default: ${DEFAULT_WEBHOOK_URL}
  --wait-ms      Tiempo total de espera para validar la mutacion en DB. Default: ${DEFAULT_WAIT_MS}

Variables soportadas:
  MERCADOPAGO_ACCESS_TOKEN
  SUPABASE_URL o VITE_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY o VITE_SUPABASE_SERVICE_ROLE_KEY
  MP_E2E_PAYMENT_ID
  MP_E2E_WEBHOOK_URL
  MP_E2E_WAIT_MS
`.trim());
}

function requireEnv(name: string, value?: string): string {
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function resolveExpectedState(paymentStatus: string): ExpectedOrderState {
    if (paymentStatus === 'approved') {
        return { paymentStatus: 'paid', orderStatus: 'processing' };
    }

    if (paymentStatus === 'rejected' || paymentStatus === 'cancelled') {
        return { paymentStatus: 'failed', orderStatus: 'cancelled' };
    }

    if (paymentStatus === 'refunded') {
        return { paymentStatus: 'refunded', orderStatus: 'cancelled' };
    }

    return { paymentStatus: 'pending', orderStatus: 'pending' };
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function fetchMercadoPagoPayment(accessToken: string, paymentId: string): Promise<MercadoPagoPayment> {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mercado Pago payment lookup failed (${response.status}): ${errorText}`);
    }

    return response.json() as Promise<MercadoPagoPayment>;
}

async function main(): Promise<void> {
    const cli = parseCliArgs(process.argv.slice(2));
    if (cli.help) {
        printUsage();
        return;
    }

    const accessToken = requireEnv('MERCADOPAGO_ACCESS_TOKEN', process.env.MERCADOPAGO_ACCESS_TOKEN);
    const supabaseUrl = requireEnv('SUPABASE_URL', process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL);
    const serviceRoleKey = requireEnv(
        'SUPABASE_SERVICE_ROLE_KEY',
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
    );
    const paymentId = cli.paymentId ?? process.env.MP_E2E_PAYMENT_ID;
    const webhookUrl = cli.webhookUrl ?? process.env.MP_E2E_WEBHOOK_URL ?? DEFAULT_WEBHOOK_URL;
    const waitMs = cli.waitMs ?? Number(process.env.MP_E2E_WAIT_MS ?? DEFAULT_WAIT_MS);

    if (!paymentId) {
        throw new Error('Missing payment id. Use --payment-id=123456789 or set MP_E2E_PAYMENT_ID.');
    }

    if (!Number.isFinite(waitMs) || waitMs <= 0) {
        throw new Error(`Invalid wait time: ${waitMs}`);
    }

    const payment = await fetchMercadoPagoPayment(accessToken, paymentId);
    const orderId = payment.external_reference?.trim();

    if (!orderId) {
        throw new Error(`Payment ${paymentId} does not contain external_reference. The webhook cannot resolve an order without it.`);
    }

    const expectedState = resolveExpectedState(payment.status);
    const amount = Number(payment.transaction_amount ?? 1);
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(`Invalid transaction_amount received from Mercado Pago: ${payment.transaction_amount}`);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    console.log(`[1/4] Payment loaded: id=${payment.id} status=${payment.status} external_reference=${orderId}`);

    const { data: existingOrder, error: existingOrderError } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .maybeSingle();

    if (existingOrderError) {
        throw new Error(`Unable to inspect existing order ${orderId}: ${existingOrderError.message}`);
    }

    if (existingOrder) {
        throw new Error(
            `Order ${orderId} already exists in the database. Use a sandbox payment tied to a clean local DB so the script can seed a fresh order row.`,
        );
    }

    const { data: seededOrder, error: insertError } = await supabase
        .from('orders')
        .insert({
            id: orderId,
            items: [
                {
                    product_id: 'mp-e2e-item',
                    name: 'Mercado Pago E2E Test Item',
                    price: amount,
                    quantity: 1,
                },
            ],
            subtotal: amount,
            shipping_cost: 0,
            discount: 0,
            total: amount,
            status: 'confirmed',
            payment_method: 'mercadopago',
            payment_status: 'pending',
            tracking_notes: `MP E2E seed for payment ${paymentId}`,
            whatsapp_sent: false,
        })
        .select('id, order_number, status, payment_status')
        .single();

    if (insertError) {
        throw new Error(`Unable to seed test order ${orderId}: ${insertError.message}`);
    }

    console.log(
        `[2/4] Seed order created: id=${seededOrder.id} order_number=${seededOrder.order_number} baseline=${seededOrder.status}/${seededOrder.payment_status}`,
    );

    const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            type: 'payment',
            data: {
                id: String(payment.id),
            },
        }),
    });
    const webhookBody = await webhookResponse.text();

    console.log(`[3/4] Webhook response: ${webhookResponse.status} ${webhookBody.trim() || '<empty>'}`);

    const pollDeadline = Date.now() + waitMs;
    let observedOrder: {
        id: string;
        status: string;
        payment_status: string;
        mp_payment_id: string | null;
        updated_at: string;
    } | null = null;

    while (Date.now() <= pollDeadline) {
        const { data, error } = await supabase
            .from('orders')
            .select('id, status, payment_status, mp_payment_id, updated_at')
            .eq('id', orderId)
            .single();

        if (error) {
            throw new Error(`Unable to reload order ${orderId}: ${error.message}`);
        }

        observedOrder = data;

        const paymentMatched = observedOrder.mp_payment_id === String(payment.id);
        const statusMatched = observedOrder.status === expectedState.orderStatus;
        const paymentStatusMatched = observedOrder.payment_status === expectedState.paymentStatus;

        if (paymentMatched && statusMatched && paymentStatusMatched) {
            break;
        }

        await sleep(1000);
    }

    if (!observedOrder) {
        throw new Error(`Order ${orderId} could not be observed after webhook execution.`);
    }

    const validationPassed =
        observedOrder.status === expectedState.orderStatus &&
        observedOrder.payment_status === expectedState.paymentStatus &&
        observedOrder.mp_payment_id === String(payment.id);

    console.log(
        `[4/4] Observed order state: status=${observedOrder.status} payment_status=${observedOrder.payment_status} mp_payment_id=${observedOrder.mp_payment_id ?? 'null'} updated_at=${observedOrder.updated_at}`,
    );

    if (!validationPassed) {
        throw new Error(
            `Webhook validation failed. Expected status=${expectedState.orderStatus}, payment_status=${expectedState.paymentStatus}, mp_payment_id=${payment.id}.`,
        );
    }

    console.log(`PASS: Mercado Pago webhook updated order ${orderId} as expected.`);
}

main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
});
