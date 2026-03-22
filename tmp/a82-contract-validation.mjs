import { z } from 'zod';

// Schema WITH the fix
const productSearchToolSchema_FIXED = z.object({
    query: z.string(),
    is_ambiguous: z.boolean().default(false),
    requires_semantic_expansion: z.boolean(),
});

// Schema WITHOUT the fix (original)
const productSearchToolSchema_ORIGINAL = z.object({
    query: z.string(),
    is_ambiguous: z.boolean(),
    requires_semantic_expansion: z.boolean(),
});

function check(label, schema, input, expectPass) {
    const r = schema.safeParse(input);
    const pass = r.success === expectPass;
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${label}`);
    if (r.success) {
        console.log(`       → is_ambiguous=${r.data.is_ambiguous}`);
    } else {
        console.log(`       → ${r.error.errors.map(e => e.message + '@' + e.path.join('.')).join(', ')}`);
    }
    return pass;
}

let ok = true;

console.log('\n── BROKEN BEFORE A82 (must now PASS) ──');
ok &= check('Guardrail injection WITH is_ambiguous: true',
    productSearchToolSchema_FIXED,
    { query: 'algo frutal barato', is_ambiguous: true, requires_semantic_expansion: true }, true);
ok &= check('.default(false) recovers missing is_ambiguous from old injection',
    productSearchToolSchema_FIXED,
    { query: 'recomiendame algo suave y rico', requires_semantic_expansion: true }, true);
ok &= check('Open-ended Analyst output missing is_ambiguous (example 5 pattern)',
    productSearchToolSchema_FIXED,
    { query: 'algo barato y frutal', requires_semantic_expansion: true }, true);

const dt = productSearchToolSchema_FIXED.safeParse({ query: 'test', requires_semantic_expansion: false });
const defaultOk = dt.success && dt.data.is_ambiguous === false;
console.log(`[${defaultOk ? 'PASS' : 'FAIL'}] .default(false) produces false (not true) when field absent`);
ok &= defaultOk;

console.log('\n── ALREADY WORKING (must still PASS) ──');
ok &= check('Specific product lookup: waka somatch mb6000',
    productSearchToolSchema_FIXED,
    { query: 'waka somatch mb6000', is_ambiguous: false, requires_semantic_expansion: false }, true);
ok &= check('Corrected few-shot open-ended (is_ambiguous: true)',
    productSearchToolSchema_FIXED,
    { query: 'vapes', is_ambiguous: true, requires_semantic_expansion: true }, true);

console.log('\n── REGRESSION PROOF (original schema still fails same input) ──');
ok &= check('ORIGINAL schema: missing is_ambiguous → FAIL (confirms fix was needed)',
    productSearchToolSchema_ORIGINAL,
    { query: 'algo frutal barato', requires_semantic_expansion: true }, false);

console.log(`\n${ ok ? '✓ 7/7 PASS — A82 capsule contract integrity confirmed.' : '✗ FAILURE — review required.' }`);
process.exit(ok ? 0 : 1);
