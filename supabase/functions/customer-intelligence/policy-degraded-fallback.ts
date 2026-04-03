import { compactCesarinResponseText } from './persona.ts';

type PolicyFallbackStrategy =
    | 'policy_context'
    | 'trusted_rule_shipping'
    | 'trusted_rule_payment'
    | 'store_hours_limit'
    | 'generic_policy_limit';

export type DegradedPolicyFallback = {
    text: string;
    strategy: PolicyFallbackStrategy;
};

const NO_POLICY_OUTPUT_PATTERNS = [
    /^no se consultaron/i,
    /^no se encontro/i,
    /^no se encontró/i,
    /^sin coincidencias/i,
    /^error:/i,
];

function normalize(input: string): string {
    return input
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function extractPolicyLines(output: string): string[] {
    return output
        .split(/\n+/)
        .map((line) => line.replace(/^\[[^\]]+\]\s*/, '').trim())
        .filter((line) => line.length > 0)
        .filter((line) => !NO_POLICY_OUTPUT_PATTERNS.some((pattern) => pattern.test(line)));
}

function detectPolicyFamily(normalizedQuery: string): 'store_hours' | 'shipping' | 'payment' | 'generic' {
    if (/(a que hora|cuando abren|cuando cierran|abren hoy|cierran hoy|horario|hora de apertura|hora de cierre|abierto hoy)/.test(normalizedQuery)) {
        return 'store_hours';
    }

    if (/(envio|envios|envian|mandan|dhl|paqueteria|sucursal|mexico)/.test(normalizedQuery)) {
        return 'shipping';
    }

    if (/(tarjeta|pago|pagos|transferencia|deposito|depositos)/.test(normalizedQuery)) {
        return 'payment';
    }

    return 'generic';
}

function getFamilyKeywords(family: ReturnType<typeof detectPolicyFamily>): string[] {
    switch (family) {
        case 'store_hours':
            return ['horario', 'abren', 'cierran', 'apertura', 'cierre', 'hora'];
        case 'shipping':
            return ['envio', 'envios', 'dhl', 'sucursal', 'paqueteria', 'mexico'];
        case 'payment':
            return ['pago', 'pagos', 'tarjeta', 'transferencia', 'deposito', 'depositos', 'bancario'];
        default:
            return [];
    }
}

function compactPolicyAnswer(lines: string[]): string {
    return compactCesarinResponseText(lines.slice(0, 2).join(' '));
}

function getRelevantPolicyLines(lines: string[], family: ReturnType<typeof detectPolicyFamily>): string[] {
    const keywords = getFamilyKeywords(family);
    if (keywords.length === 0) return lines;

    const relevant = lines.filter((line) => {
        const normalizedLine = normalize(line);
        return keywords.some((keyword) => normalizedLine.includes(keyword));
    });

    return relevant;
}

export function buildDegradedPolicyInquiryFallback(input: {
    query: string;
    policyOutput?: string | null;
    policyMatchCount?: number | null;
}): DegradedPolicyFallback {
    const normalizedQuery = normalize(input.query || '');
    const family = detectPolicyFamily(normalizedQuery);
    const policyLines = extractPolicyLines(input.policyOutput || '');

    if ((input.policyMatchCount || 0) > 0 && policyLines.length > 0) {
        const relevantLines = getRelevantPolicyLines(policyLines, family);
        if (relevantLines.length > 0) {
            return {
                text: compactPolicyAnswer(relevantLines),
                strategy: 'policy_context',
            };
        }
    }

    if ((input.policyMatchCount || 0) > 0 && policyLines.length > 0 && family === 'generic') {
        return {
            text: compactPolicyAnswer(policyLines),
            strategy: 'policy_context',
        };
    }

    if (family === 'payment') {
        return {
            text: 'Por ahora manejamos solo transferencia o deposito bancario.',
            strategy: 'trusted_rule_payment',
        };
    }

    if (family === 'shipping') {
        return {
            text: 'Manejamos envios por DHL Express a sucursal. Si quieres, te confirmo el alcance exacto para tu zona.',
            strategy: 'trusted_rule_shipping',
        };
    }

    if (family === 'store_hours') {
        return {
            text: 'Ahorita no traigo el horario exacto confirmado en sistema. Si te urge, te lo confirmo por WhatsApp.',
            strategy: 'store_hours_limit',
        };
    }

    return {
        text: 'Ahorita no traigo esa politica confirmada en sistema. Si te urge, te lo confirmo por WhatsApp.',
        strategy: 'generic_policy_limit',
    };
}
