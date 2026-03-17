
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from the project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeTags() {
    const { data: products, error } = await supabase
        .from('products')
        .select('name, tags, badges, section, specs')
        .limit(100);

    if (error) {
        console.error('Error fetching products:', error);
        return;
    }

    const allTags = new Set<string>();
    const techPatterns = [/mg$/, /ml$/, /%\s*[a-zA-Z]*$/, /watts?$/i, /ohm$/i, /g$/, /puffs$/i, /nic$/i];
    const contaminatedProducts: any[] = [];

    products.forEach(p => {
        const productContamination: string[] = [];
        (p.tags || []).forEach((tag: string) => {
            allTags.add(tag);
            if (techPatterns.some(pattern => pattern.test(tag.toLowerCase()))) {
                productContamination.push(tag);
            }
        });
        if (productContamination.length > 0) {
            contaminatedProducts.push({
                name: p.name,
                tags: p.tags,
                contaminated: productContamination
            });
        }
    });

    console.log('--- ALL UNIQUE TAGS ---');
    console.log(Array.from(allTags).sort());
    console.log('\n--- CONTAMINATED PRODUCTS (Technical tags) ---');
    contaminatedProducts.forEach(cp => {
        console.log(`[${cp.name}]: ${cp.contaminated.join(', ')}`);
    });
}

analyzeTags();
