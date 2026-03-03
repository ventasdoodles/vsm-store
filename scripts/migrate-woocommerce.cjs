/**
 * ══════════════════════════════════════════════════════════════
 *  WooCommerce → VSM Store  —  Migrador de Productos
 * ══════════════════════════════════════════════════════════════
 *
 * USO:
 *   node scripts/migrate-woocommerce.js  ruta/al/archivo.csv  [seccion]
 *
 *   - ruta/al/archivo.csv  : Export de WooCommerce (Products → Export → CSV)
 *   - seccion (opcional)   : 'vape' | '420'  (default: 'vape')
 *
 * QUÉ HACE:
 *   1. Lee el CSV de WooCommerce (cualquier formato: Products Export,
 *      WP All Import, o WooCommerce default).
 *   2. Extrae SOLO lo que necesitamos:
 *      - Nombre, descripción, descripción corta
 *      - Precio regular, precio de oferta
 *      - SKU, stock
 *      - Categorías (crea árbol jerárquico automáticamente)
 *      - Tags
 *      - Imágenes (URLs)
 *   3. Genera DOS archivos SQL listos para correr en Supabase:
 *      - migrate_categories.sql  → INSERT de categorías con parent_id
 *      - migrate_products.sql    → INSERT de productos ya mapeados
 *
 * MAPEO DE COLUMNAS (WooCommerce → VSM Store):
 * ┌──────────────────────────────┬────────────────────────────────┐
 * │ WooCommerce CSV              │ VSM Store (products)           │
 * ├──────────────────────────────┼────────────────────────────────┤
 * │ Name / post_title            │ name                           │
 * │ (auto-generated)             │ slug                           │
 * │ Description / post_content   │ description                    │
 * │ Short description / post_exc │ short_description              │
 * │ Regular price                │ compare_at_price               │
 * │ Sale price / Price           │ price                          │
 * │ SKU                          │ sku                            │
 * │ Stock                        │ stock                          │
 * │ Categories                   │ category_id (→ lookup)         │
 * │ Tags                         │ tags (text[])                  │
 * │ Images                       │ images (text[])                │
 * │ Published (1/0)              │ is_active                      │
 * │ Is featured? (1/0)           │ is_featured                    │
 * └──────────────────────────────┴────────────────────────────────┘
 *
 * NOTAS IMPORTANTES:
 *   - El script NO sube nada a la DB directamente. Genera .sql para revisión.
 *   - Las imágenes quedan como URLs externas (de WordPress). Después se pueden
 *     descargar y subir al Storage de Supabase con otro script.
 *   - Productos variables de WooCommerce (variaciones) se ignoran —
 *     solo se toman productos simples (Type = "simple" o row sin parent).
 *   - Categorías jerárquicas ("Líquidos > Sales" en Woo) se mapean
 *     automáticamente a parent_id en VSM Store.
 */

const fs = require('fs');
const path = require('path');

// ─── CLI Args ───
const csvPath = process.argv[2];
const section = process.argv[3] || 'vape';

if (!csvPath) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  WooCommerce → VSM Store Migrador                          ║
╠══════════════════════════════════════════════════════════════╣
║  Uso:                                                       ║
║    node scripts/migrate-woocommerce.js <archivo.csv> [sec]  ║
║                                                             ║
║  Ejemplos:                                                  ║
║    node scripts/migrate-woocommerce.js products.csv vape    ║
║    node scripts/migrate-woocommerce.js export.csv 420       ║
║                                                             ║
║  El CSV debe ser un export de WooCommerce (Products).       ║
║  Genera migrate_categories.sql y migrate_products.sql       ║
╚══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
}

if (!['vape', '420'].includes(section)) {
    console.error(`❌ Sección inválida: "${section}". Debe ser "vape" o "420".`);
    process.exit(1);
}

// ─── CSV Parser (robusto, soporta comillas, saltos de línea, etc.) ───
function parseCSV(text) {
    const rows = [];
    let current = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        const next = text[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                field += '"';
                i++; // skip escaped quote
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                field += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                current.push(field);
                field = '';
            } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
                current.push(field);
                field = '';
                if (current.length > 1 || current[0] !== '') {
                    rows.push(current);
                }
                current = [];
                if (ch === '\r') i++; // skip \n after \r
            } else {
                field += ch;
            }
        }
    }
    // Last field/row
    if (field || current.length > 0) {
        current.push(field);
        rows.push(current);
    }
    return rows;
}

// ─── Normalize column names ───
// Soporta headers en inglés Y español (WooCommerce ES/MX)
const COLUMN_ALIASES = {
    name: ['name', 'post_title', 'product name', 'title', 'nombre'],
    description: ['description', 'post_content', 'product description', 'descripcion', 'descripción'],
    short_description: ['short description', 'post_excerpt', 'short_description', 'descripcion corta', 'descripción corta'],
    regular_price: ['regular price', 'regular_price', 'precio regular', 'precio normal', '_regular_price'],
    sale_price: ['sale price', 'sale_price', 'precio oferta', 'precio rebajado', '_sale_price', 'price'],
    sku: ['sku', '_sku', 'codigo'],
    stock: ['stock', '_stock', 'stock quantity', 'quantity', 'inventario'],
    categories: ['categories', 'category', 'categorias', 'categorías', 'product categories', 'tax:product_cat'],
    tags: ['tags', 'product tags', 'etiquetas', 'tax:product_tag'],
    images: ['images', 'image', 'imagenes', 'imágenes', 'product images', 'image url', 'product gallery'],
    published: ['published', 'post_status', 'status', 'publicado'],
    featured: ['is featured?', 'featured', 'is_featured', 'destacado', '¿está destacado?'],
    type: ['type', 'product type', 'tipo'],
    id: ['id', 'product id', 'post_id'],
    parent: ['parent', 'parent_id', 'superior'],
    brand: ['brand', 'marca', 'marcas', 'brands'],
    attribute1_name: ['nombre del atributo 1', 'attribute 1 name'],
    attribute1_values: ['valor(es) del atributo 1', 'attribute 1 value(s)'],
};

function resolveColumns(headers) {
    const map = {};
    const normalized = headers.map(h => h.toLowerCase().trim().replace(/[\u200B-\u200D\uFEFF]/g, ''));

    for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
        const idx = normalized.findIndex(h => aliases.includes(h));
        if (idx !== -1) {
            map[key] = idx;
        }
    }
    return map;
}

// ─── Slug generator ───
function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 100);
}

// ─── Title Case converter ───
// "VAPORESSO TARGET 80 3000 MAH MOD" → "Vaporesso Target 80 3000 Mah Mod"
// Respeta siglas comunes del mundo vape/tech que deben quedar en MAYÚSCULAS
const KEEP_UPPER = new Set([
    'USB', 'AIO', 'KIT', 'MOD', 'LED', 'VTC5', 'VTC6', 'MAH', 'OHM',
    'FC', 'TFT', 'OLED', 'PC', 'DNA', 'RDA', 'RTA', 'RDTA', 'MTL',
    'DTL', 'DL', 'TC', 'VW', 'VV', 'SS', 'NI', 'TI', 'ML', 'MG',
    'CBD', 'THC', 'HHC', 'VSM', 'DHL', 'ESD', 'RPM', 'LP', 'GT',
    'II', 'III', 'IV', 'V2', 'V3', 'X2', 'SE', 'PRO', 'MAX', 'PLUS',
    'NEW', 'MINI', 'LITE', 'NANO', 'XT', 'XL', 'GT', 'GX', 'TX',
    'MVP', 'DNP', 'UB', 'PCTG', 'SMOK', 'TPD', 'POD', 'SUB',
    'COLORS', 'EDITION', 'SERIES',
]);

function toTitleCase(text) {
    if (!text) return text;
    return text
        .split(/\s+/)
        .map(word => {
            const upper = word.toUpperCase();
            // Keep known acronyms/terms in uppercase
            if (KEEP_UPPER.has(upper)) return upper;
            // Keep alphanumeric codes like "80W", "200W", "21700", "18650" as-is
            if (/^\d+\w?$/.test(word) || /^\d+[A-Za-z]+\d*$/.test(word)) return word.toUpperCase();
            // Special combo like "B100", "B80" — keep uppercase
            if (/^[A-Za-z]\d+/.test(word)) return word.toUpperCase();
            // "+", "-", connectors — keep
            if (word === '+' || word === '-' || word === '&') return word;
            // Title case: first letter upper, rest lower
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');
}

// ─── Escape SQL string ───
function esc(str) {
    if (str === null || str === undefined) return 'NULL';
    return `'${String(str).replace(/'/g, "''")}'`;
}

// ─── HTML → plain text (Woo descriptions are HTML) ───
function stripHTML(html) {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ─── Parse WooCommerce category paths ───
// Woo exports categories as: "Líquidos > Sales, Hardware > Mods"
// We need to build a tree with parent_id
function parseCategoryPaths(catString) {
    if (!catString) return [];
    // Split by comma (multiple categories)
    return catString.split(',').map(path => {
        // Split by > (hierarchy)
        return path.split('>').map(s => s.trim()).filter(Boolean);
    }).filter(arr => arr.length > 0);
}

// ═══════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════

console.log('');
console.log('  ⚡ WooCommerce → VSM Store Migrador');
console.log('  ════════════════════════════════════');
console.log(`  📂 Archivo: ${csvPath}`);
console.log(`  🏷️  Sección: ${section}`);
console.log('');

// 1. Read & parse CSV
const raw = fs.readFileSync(csvPath, 'utf-8');
const rows = parseCSV(raw);

if (rows.length < 2) {
    console.error('❌ El CSV está vacío o no tiene datos.');
    process.exit(1);
}

const headers = rows[0];
const colMap = resolveColumns(headers);
const dataRows = rows.slice(1);

console.log(`  📊 Filas detectadas: ${dataRows.length}`);
console.log(`  📋 Columnas mapeadas:`);
for (const [key, idx] of Object.entries(colMap)) {
    console.log(`     ${key} → col[${idx}] = "${headers[idx]}"`);
}

const missingCritical = [];
if (colMap.name === undefined) missingCritical.push('name');

if (missingCritical.length > 0) {
    console.error(`\n  ❌ Columnas críticas no encontradas: ${missingCritical.join(', ')}`);
    console.error(`     Headers del CSV: ${headers.join(', ')}`);
    console.error('     Verifica que el export de WooCommerce incluya estas columnas.\n');
    process.exit(1);
}

// ─── Helper to get a field from a row ───
function getField(row, key) {
    const idx = colMap[key];
    if (idx === undefined || idx >= row.length) return '';
    return (row[idx] || '').trim();
}

// 2. First pass — separate parents, variations, and simple products
const parentMap = new Map();  // WooCommerce ID → parent row data
const variationsByParent = new Map(); // WooCommerce parent ID → [variation rows]
const simpleProducts = [];

for (const row of dataRows) {
    const type = getField(row, 'type').toLowerCase();
    const id = getField(row, 'id');
    const parentId = getField(row, 'parent');
    const name = getField(row, 'name');

    if (!name) continue;

    if (type === 'variable') {
        parentMap.set(id, row);
    } else if (type === 'variation') {
        // WooCommerce Superior field can be "id:188" or just "188"
        let pid = parentId.replace(/^id:/i, '').trim();
        if (!variationsByParent.has(pid)) variationsByParent.set(pid, []);
        variationsByParent.get(pid).push(row);
    } else if (type === 'simple' || type === '') {
        simpleProducts.push(row);
    }
    // Skip grouped, external, etc.
}

console.log(`\n  📦 Desglose por tipo:`);
console.log(`     🔲 Simple: ${simpleProducts.length}`);
console.log(`     🔀 Variable (padres): ${parentMap.size}`);
console.log(`     🎨 Variaciones: ${[...variationsByParent.values()].reduce((s, v) => s + v.length, 0)}`);

// 3. Build category tree
const categoryMap = new Map();
let catCounter = 0;

function ensureCategory(pathArr) {
    let parentSlug = null;
    let lastSlug = null;

    for (let i = 0; i < pathArr.length; i++) {
        const name = toTitleCase(pathArr[i]);
        const slug = slugify(name);
        const fullKey = parentSlug ? `${parentSlug}/${slug}` : slug;

        if (!categoryMap.has(fullKey)) {
            catCounter++;
            categoryMap.set(fullKey, {
                varName: `cat_${catCounter}`,
                name,
                slug,
                section,
                parentKey: parentSlug ? (i === 1 ? slugify(pathArr[0]) : pathArr.slice(0, i).map(slugify).join('/')) : null,
            });
        }
        parentSlug = fullKey;
        lastSlug = fullKey;
    }
    return lastSlug;
}

// 4. Process all products into final list
const products = [];

function processRow(row, overrides) {
    const get = (key) => overrides?.[key] ?? getField(row, key);

    const name = toTitleCase(get('name'));
    if (!name) return null;

    // Prices
    const regularPrice = parseFloat(get('regular_price')) || 0;
    const salePrice = parseFloat(get('sale_price')) || 0;
    let price = salePrice > 0 ? salePrice : regularPrice;
    let compareAtPrice = salePrice > 0 && regularPrice > salePrice ? regularPrice : null;
    if (price <= 0 && regularPrice > 0) price = regularPrice;

    // SKU
    const sku = get('sku') || null;

    // Stock
    const stockRaw = get('stock');
    const stock = stockRaw ? parseInt(stockRaw, 10) : 0;

    // Description (strip HTML)
    const description = stripHTML(get('description')) || null;
    const shortDescription = stripHTML(get('short_description')) || null;

    // Categories
    const catPaths = parseCategoryPaths(get('categories'));
    let categoryKey = null;
    for (const catPath of catPaths) {
        categoryKey = ensureCategory(catPath);
    }

    // Tags — also include brand as tag if available
    const tagsRaw = get('tags');
    const tags = tagsRaw
        ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
        : [];
    const brand = get('brand');
    if (brand && !tags.includes(brand)) tags.push(brand);

    // Images
    const imagesRaw = get('images');
    const images = imagesRaw
        ? imagesRaw.split(',').map(url => url.trim()).filter(u => u.startsWith('http'))
        : [];

    // Published
    const pubRaw = get('published').toLowerCase();
    const isActive = pubRaw === '1' || pubRaw === 'publish' || pubRaw === 'published' || pubRaw === '';

    // Featured
    const featRaw = get('featured').toLowerCase();
    const isFeatured = featRaw === '1' || featRaw === 'yes' || featRaw === 'true';

    // Slug
    const slug = slugify(name);

    // Attribute (e.g., colors) — store as tag or in description
    const attr1Name = get('attribute1_name');
    const attr1Values = get('attribute1_values');

    return {
        name,
        slug,
        description,
        shortDescription,
        price,
        compareAtPrice,
        sku,
        stock: isNaN(stock) ? 0 : stock,
        section,
        categoryKey,
        tags,
        images,
        isActive,
        isFeatured,
        colors: attr1Name && attr1Name.toLowerCase().includes('color') ? attr1Values : null,
    };
}

// Process simple products directly
for (const row of simpleProducts) {
    const product = processRow(row);
    if (product && product.price > 0) products.push(product);
}

// Process variable products: merge parent metadata + first variation's price
for (const [parentId, parentRow] of parentMap) {
    const variations = variationsByParent.get(parentId) || [];

    // Get price from first variation (or lowest price)
    let bestPrice = 0;
    let bestSalePrice = 0;
    let totalStock = 0;
    const colorNames = [];

    for (const vRow of variations) {
        const regPrice = parseFloat(getField(vRow, 'regular_price')) || 0;
        const salPrice = parseFloat(getField(vRow, 'sale_price')) || 0;
        const vStock = parseInt(getField(vRow, 'stock'), 10) || 0;
        const vName = getField(vRow, 'name');
        totalStock += vStock;

        // Use variation with lowest regular price (or first)
        if (bestPrice === 0 || (regPrice > 0 && regPrice < bestPrice)) {
            bestPrice = regPrice;
            bestSalePrice = salPrice;
        }

        // Extract color from variation name: "PRODUCT NAME - COLOR"
        const dashIdx = vName.lastIndexOf(' - ');
        if (dashIdx > 0) {
            colorNames.push(toTitleCase(vName.substring(dashIdx + 3).trim()));
        }
    }

    // Merge: parent metadata + variation pricing
    const product = processRow(parentRow, {
        regular_price: String(bestPrice),
        sale_price: bestSalePrice > 0 ? String(bestSalePrice) : '',
        stock: String(totalStock),
    });

    if (product) {
        // Override price if still 0 from parent (parent rows often have no price)
        if (product.price <= 0) product.price = bestPrice;
        if (product.price <= 0 && variations.length > 0) {
            // Fallback: just grab the first variation's regular price
            product.price = parseFloat(getField(variations[0], 'regular_price')) || 0;
        }

        // Append color info to description
        if (colorNames.length > 0) {
            const colorLine = `\nColores disponibles: ${colorNames.join(', ')}`;
            product.description = product.description
                ? product.description + colorLine
                : colorLine;
            // Also add colors as a tag
            product.tags.push('multi-color');
        }

        if (product.price > 0) products.push(product);
    }
}

// If a variable product had no matching parent ID, process orphan variations as standalone
for (const [parentId, varRows] of variationsByParent) {
    if (parentMap.has(parentId)) continue; // already handled
    for (const vRow of varRows) {
        const product = processRow(vRow);
        if (product && product.price > 0) products.push(product);
    }
}

let skipped = dataRows.length - products.length - [...variationsByParent.values()].reduce((s, v) => s + v.length, 0) + [...variationsByParent.values()].filter((_, i) => {
    // This is approximate; orphan variations counted above
    return true;
}).length;
// Simplified count
skipped = dataRows.length - products.length;

console.log(`\n  ✅ Productos finales para migrar: ${products.length}`);
console.log(`  📁 Categorías detectadas: ${categoryMap.size}`);

// ═══════════════════════════════════════════════════════
//  GENERATE SQL — Categories
// ═══════════════════════════════════════════════════════

let catSQL = `-- ============================================================
-- VSM Store — Migración de Categorías desde WooCommerce
-- Generado: ${new Date().toISOString().slice(0, 10)}
-- Sección: ${section}
-- Total: ${categoryMap.size} categorías
-- ============================================================
-- INSTRUCCIONES:
--   1. Revisa los nombres y slugs generados
--   2. Ejecuta este SQL en Supabase SQL Editor
--   3. Después ejecuta migrate_products.sql
-- ============================================================

DO $$
DECLARE
`;

// Declare variables
for (const [, cat] of categoryMap) {
    catSQL += `  ${cat.varName} UUID;\n`;
}

catSQL += `BEGIN\n\n`;

// Insert categories in order (parents first)
const inserted = new Set();
function insertCat(key) {
    if (inserted.has(key)) return;
    const cat = categoryMap.get(key);
    if (!cat) return;
    // Insert parent first
    if (cat.parentKey) {
        insertCat(cat.parentKey);
    }
    const parentVar = cat.parentKey ? categoryMap.get(cat.parentKey)?.varName : null;

    catSQL += `  -- ${cat.name}${cat.parentKey ? ` (hijo de ${categoryMap.get(cat.parentKey)?.name})` : ''}\n`;
    catSQL += `  INSERT INTO categories (name, slug, section, parent_id, is_active)\n`;
    catSQL += `  VALUES (${esc(cat.name)}, ${esc(cat.slug)}, ${esc(section)}, ${parentVar || 'NULL'}, true)\n`;
    catSQL += `  ON CONFLICT (slug, section) DO UPDATE SET name = EXCLUDED.name\n`;
    catSQL += `  RETURNING id INTO ${cat.varName};\n\n`;

    inserted.add(key);
}

for (const key of categoryMap.keys()) {
    insertCat(key);
}

catSQL += `  RAISE NOTICE 'Categorías migradas: ${categoryMap.size}';\n`;
catSQL += `END $$;\n`;

// ═══════════════════════════════════════════════════════
//  GENERATE SQL — Products
// ═══════════════════════════════════════════════════════

// Deduplicate slugs
const slugCount = new Map();
for (const p of products) {
    const count = slugCount.get(p.slug) || 0;
    if (count > 0) {
        p.slug = `${p.slug}-${count + 1}`;
    }
    slugCount.set(p.slug, count + 1);
}

let prodSQL = `-- ============================================================
-- VSM Store — Migración de Productos desde WooCommerce
-- Generado: ${new Date().toISOString().slice(0, 10)}
-- Sección: ${section}
-- Total: ${products.length} productos
-- ============================================================
-- INSTRUCCIONES:
--   1. Asegúrate de haber ejecutado migrate_categories.sql PRIMERO
--   2. Revisa los datos generados
--   3. Ejecuta este SQL en Supabase SQL Editor
-- ============================================================

`;

for (const p of products) {
    // Resolve category_id via subquery
    let catSubquery;
    if (p.categoryKey) {
        const cat = categoryMap.get(p.categoryKey);
        catSubquery = `(SELECT id FROM categories WHERE slug = ${esc(cat?.slug)} AND section = ${esc(section)} LIMIT 1)`;
    } else {
        catSubquery = `(SELECT id FROM categories WHERE section = ${esc(section)} LIMIT 1)`;
    }

    // Tags as PostgreSQL text array
    const tagsArr = p.tags.length > 0
        ? `ARRAY[${p.tags.map(t => esc(t)).join(', ')}]::TEXT[]`
        : `'{}'::TEXT[]`;

    // Images as PostgreSQL text array
    const imagesArr = p.images.length > 0
        ? `ARRAY[${p.images.map(u => esc(u)).join(', ')}]::TEXT[]`
        : `'{}'::TEXT[]`;

    prodSQL += `INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, images, is_active, is_featured, status)\n`;
    prodSQL += `VALUES (\n`;
    prodSQL += `  ${esc(p.name)},\n`;
    prodSQL += `  ${esc(p.slug)},\n`;
    prodSQL += `  ${esc(p.description)},\n`;
    prodSQL += `  ${esc(p.shortDescription)},\n`;
    prodSQL += `  ${p.price},\n`;
    prodSQL += `  ${p.compareAtPrice !== null ? p.compareAtPrice : 'NULL'},\n`;
    prodSQL += `  ${p.stock},\n`;
    prodSQL += `  ${p.sku ? esc(p.sku) : 'NULL'},\n`;
    prodSQL += `  ${esc(p.section)},\n`;
    prodSQL += `  ${catSubquery},\n`;
    prodSQL += `  ${tagsArr},\n`;
    prodSQL += `  ${imagesArr},\n`;
    prodSQL += `  ${p.isActive},\n`;
    prodSQL += `  ${p.isFeatured},\n`;
    prodSQL += `  'active'\n`;
    prodSQL += `);\n\n`;
}

prodSQL += `-- ════════════════════════════════════════════════════\n`;
prodSQL += `-- Resumen: ${products.length} productos insertados\n`;
prodSQL += `-- ════════════════════════════════════════════════════\n`;

// ═══════════════════════════════════════════════════════
//  WRITE OUTPUT FILES
// ═══════════════════════════════════════════════════════

const outDir = path.dirname(csvPath);
const catFile = path.join(outDir, 'migrate_categories.sql');
const prodFile = path.join(outDir, 'migrate_products.sql');

fs.writeFileSync(catFile, catSQL, 'utf-8');
fs.writeFileSync(prodFile, prodSQL, 'utf-8');

console.log(`\n  ════════════════════════════════════════════════════`);
console.log(`  📦 Archivos generados:`);
console.log(`     📁 ${catFile}`);
console.log(`     📁 ${prodFile}`);
console.log(`  ════════════════════════════════════════════════════`);
console.log(`\n  📋 Siguiente paso:`);
console.log(`     1. Abre ${catFile} y revisa las categorías`);
console.log(`     2. Ejecuta en Supabase SQL Editor`);
console.log(`     3. Después ejecuta ${prodFile}`);
console.log(`     4. Verifica en /admin/products que todo esté OK`);
console.log(`\n  💡 Las imágenes quedan como URLs de WordPress.`);
console.log(`     Para migrarlas al Storage de Supabase,`);
console.log(`     se puede hacer un script adicional después.\n`);
