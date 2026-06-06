import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetArg = process.argv[2] ?? 'dist/sitemap.xml';
const outputPath = path.resolve(__dirname, '..', targetArg);
const projectRoot = path.resolve(__dirname, '..');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://vsmstore.com'; // Adjust if custom domain exists

// Codex Cloud can resolve some providers poorly over IPv6; prefer IPv4 when available.
dns.setDefaultResultOrder('ipv4first');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function pushUrl(urls, route, overrides = {}) {
    const loc = `${DOMAIN}${route}`;

    if (urls.some(url => url.loc === loc)) {
        return;
    }

    urls.push({
        loc,
        changefreq: 'daily',
        priority: route === '' ? '1.0' : '0.8',
        ...overrides,
    });
}

function readLocalCategories() {
    const categoriesPath = path.join(projectRoot, 'categories.json');

    if (!fs.existsSync(categoriesPath)) {
        return [];
    }

    try {
        const raw = fs.readFileSync(categoriesPath);
        const looksLikeUtf16Le = raw.length > 1 && (
            (raw[0] === 0xFF && raw[1] === 0xFE) ||
            raw[1] === 0
        );
        const content = looksLikeUtf16Le
            ? raw.toString('utf16le').replace(/^\uFEFF/, '')
            : raw.toString('utf8').replace(/^\uFEFF/, '');

        return JSON.parse(content);
    } catch (error) {
        console.warn('Unable to parse local categories fallback:', error);
        return [];
    }
}

async function generateSitemap() {
    console.log('Generating sitemap...');

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/buscar',
        '/login',
        '/signup',
        '/contact',
        '/?section=vape',
        '/?section=420',
        '/nuevo',
        '/mas-vendidos',
        '/ofertas',
        '/legal/terms',
        '/legal/privacy',
        '/privacy',
        '/vape',
        '/420',
        '/checkout',
        '/rastreo',
    ];

    const urls = [];
    staticRoutes.forEach(route => pushUrl(urls, route));

    // 2. Products
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('slug, section, updated_at')
        .eq('is_active', true);

    if (productError) console.error('Error fetching products:', productError);
    else {
        products.forEach(p => {
            pushUrl(urls, `/${p.section}/${p.slug}`, {
                lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.9',
            });
        });
    }

    // 3. Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('slug, section, created_at')
        .eq('is_active', true);

    if (catError) console.error('Error fetching categories:', catError);
    else {
        categories.forEach(c => {
            pushUrl(urls, `/${c.section}/${c.slug}`, {
                lastmod: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.8',
            });
        });
    }

    // 4. Local fallback categories keep the sitemap useful in offline cloud environments.
    readLocalCategories().forEach(category => {
        if (!category?.slug || !category?.section) {
            return;
        }

        pushUrl(urls, `/${category.section}/${category.slug}`, {
            changefreq: 'weekly',
            priority: '0.8',
        });
    });

    // Generate XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, sitemap);
    console.log(`Sitemap generated with ${urls.length} URLs at ${outputPath}`);
}

generateSitemap();
