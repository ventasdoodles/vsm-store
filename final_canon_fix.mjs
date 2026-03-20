import { readFileSync, writeFileSync } from 'fs';

const buf = readFileSync('AI_CONTEXT.md');
let content = buf.toString('utf8');

// Normalize line endings to LF for processing
content = content.replace(/\r\n/g, '\n');

const lines = content.split('\n');

// 1. Reconcile Scripts
let scriptsIdx = lines.findIndex(l => l.includes('├── scripts/'));
let migrationsIdx = lines.findIndex(l => l.includes('├── supabase/'));
if (scriptsIdx !== -1 && migrationsIdx !== -1) {
    const newScripts = [
        '├── scripts/                         # 8 scripts de utilidad + admin/ (3)',
        '│   ├── generate-sitemap.js          # [Phase 1] Sitemap generator',
        '│   ├── migrate-woocommerce.cjs      # [Phase 1] Woo CSV \u2192 SQL',
        '│   ├── simulate_cesarin.ts          # [Phase 3.4A] Simulator CLI',
        '│   ├── check-integrity.mjs          # [Phase 2] Integrity auditor',
        '│   ├── fix_css_phase2.mjs           # [Phase 2] CSS cleanup',
        '│   ├── fix_css_phase3.mjs           # [Phase 3.1] CSS cleanup',
        '│   ├── fix_css_violations.mjs       # [Phase 3.1] CSS violations',
        '│   ├── fix_encoding.mjs             # [Phase 3.4A] Encoding fix',
        '│   └── admin/                       # [Phase 2] Cleanup Scripts (3 archivos)',
        '│       ├── tag-discovery.ts',
        '│       ├── tag-migration.ts',
        '│       └── verify-phase-2b.ts',
        '│'
    ];
    lines.splice(scriptsIdx, migrationsIdx - scriptsIdx, ...newScripts);
}

// 2. Reconcile Types (to ensure 11 files listing)
let typesIdx = lines.findIndex(l => l.includes('├── types/'));
let libIdx = lines.findIndex(l => l.includes('├── lib/'));
if (typesIdx !== -1 && libIdx !== -1) {
   const newTypes = [
        '│   ├── types/                       # Tipos de dominio (11 archivos)',
        '│   │   ├── product.ts               # Product, Section, ProductStatus',
        '│   │   ├── category.ts              # Category, CategoryWithChildren',
        '│   │   ├── cart.ts                  # CartItem (con variant_id/name), Order',
        '│   │   ├── order.ts                 # OrderItem (con variant_id/name), OrderRecord',
        '│   │   ├── customer.ts              # CustomerProfile, CustomerTier',
        '│   │   ├── testimonial.ts           # Testimonial',
        '│   │   ├── variant.ts               # ProductAttribute, ProductVariant',
        '│   │   ├── ai-capsule.ts            # AI State & Session persistence',
        '│   │   ├── cesarin.ts               # Simulation types for E2E validation',
        '│   │   ├── constants.ts             # Domain constants',
        '│   │   └── collection.ts            # Dynamic filters and groupings'
   ];
   lines.splice(typesIdx, libIdx - typesIdx, ...newTypes);
}

// 3. Reconcile Services
let servicesIdx = lines.findIndex(l => l.includes('├── services/'));
let treeEndIdx = -1;
for (let i = servicesIdx; i < lines.length; i++) {
    if (lines[i].trim() === '```') {
        treeEndIdx = i;
        break;
    }
}
if (servicesIdx !== -1 && treeEndIdx !== -1) {
    const newServices = [
        '├── services/                    # Capa de datos (44 services: 25 storefront + 19 admin)',
        '│   ├── products.service.ts      # Storefront: CRUD + Smart Upselling',
        '│   ├── orders.service.ts        # Storefront: Checkout & tracking',
        '│   ├── concierge.service.ts     # AI Chat (Consolidado)',
        '│   ├── auth.service.ts          # Auth: Login/Profile/Reset',
        '│   ├── loyalty.service.ts       # Loyalty: Points & Tiers',
        '│   ├── ...                      # 19 additional storefront services',
        '│   ├── admin/                   # 18 archivos (17 services + barrel)',
        '│   │   ├── admin-pilot-ops.service.ts',
        '│   │   ├── admin-auth.service.ts',
        '│   │   ├── admin-products.service.ts',
        '│   │   ├── admin-orders.service.ts',
        '│   │   ├── admin-customers.service.ts',
        '│   │   ├── admin-dashboard.service.ts',
        '│   │   └── ... (11 adicionales)',
        '│   └── payments/',
        '│       └── mercadopago.service.ts'
    ];
    lines.splice(servicesIdx, treeEndIdx - servicesIdx, ...newServices);
}

// 4. Remove any last-residue of ¿Quién es responsable? or other junk
let finalContent = lines.join('\n');
finalContent = finalContent.replace(/\u00BFQu\u00E9 es esto\?/g, '');
finalContent = finalContent.replace(/\u00BFQui\u00E9n es responsable\?/g, '');

writeFileSync('AI_CONTEXT.md', finalContent, 'utf8');
console.log('Wave 193 Final Canon Reconciliation SUCCESSFUL');
