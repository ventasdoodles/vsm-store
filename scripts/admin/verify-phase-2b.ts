
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Credenciales de Supabase no encontradas en .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
    const productNames = [
        'Box Mod 150W TC',
        'Paletas CBD Sandía x5',
        'E-Liquid Berry Mix 100ml 6mg',
        'Nic Salt Tabaco Clásico 30ml 50mg',
        'Mod Regulado 80W Compact'
    ];

    console.log('--- VERIFICACIÓN DE DATOS POST-MIGRACIÓN ---');
    
    for (const name of productNames) {
        const { data: products, error } = await supabase
            .from('products')
            .select('name, tags, specs, badges, section')
            .eq('name', name);

        if (error) {
            console.error(`Error al obtener ${name}:`, error);
            continue;
        }

        if (products && products.length > 0) {
            const p = products[0];
            console.log(`\nPRODUCTO: ${p.name}`);
            console.log(`SECCIÓN: ${p.section}`);
            console.log(`TAGS ACTUALES: ${JSON.stringify(p.tags)}`);
            console.log(`SPECS ACTUALES: ${JSON.stringify(p.specs)}`);
            console.log(`BADGES ACTUALES: ${JSON.stringify(p.badges)}`);
        } else {
            console.log(`\nPRODUCTO NO ENCONTRADO: ${name}`);
        }
    }
}

verifyMigration();
