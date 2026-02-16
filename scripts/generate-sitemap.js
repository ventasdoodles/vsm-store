import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// Load environment variables
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const DOMAIN = 'https://vsm-store.pages.dev'; // Adjust if custom domain exists

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
        '/?section=420'
    ];

    let urls = staticRoutes.map(route => ({
        loc: `${DOMAIN}${route}`,
        changefreq: 'daily',
        priority: route === '' ? '1.0' : '0.8'
    }));

    // 2. Products
    const { data: products, error: productError } = await supabase
        .from('products')
        .select('slug, section, updated_at')
        .eq('is_active', true);

    if (productError) console.error('Error fetching products:', productError);
    else {
        products.forEach(p => {
            urls.push({
                loc: `${DOMAIN}/${p.section}/${p.slug}`, // Assuming route is /:section/:slug (need to verify this logic matches App.tsx)
                lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.9'
            });
        });
    }

    // 3. Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('slug, section, updated_at')
        .eq('is_active', true);

    if (catError) console.error('Error fetching categories:', catError);
    else {
        categories.forEach(c => {
            urls.push({
                loc: `${DOMAIN}/${c.section}/${c.slug}`, // Need to verify category route structure
                lastmod: c.updated_at ? new Date(c.updated_at).toISOString() : new Date().toISOString(),
                changefreq: 'weekly',
                priority: '0.8'
            });
        });
    }

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

    const publicPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(publicPath, sitemap);
    console.log(`Sitemap generated with ${urls.length} URLs at ${publicPath}`);
}

generateSitemap();
