
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

async function verifyMigrationPersistence() {
    const productNames = [
        'Box Mod 150W TC',
        'Paletas CBD Sandía x5',
        'Chocolate Dark THC 10mg x4',
        'Pod Mod AIO 60W',
        'E-Liquid Berry Mix 100ml 6mg',
        'Nic Salt Tabaco Clásico 30ml 50mg',
        'E-Liquid Frutas Tropicales 60ml 6mg'
    ];

    console.log('--- AUDITORÍA POST-APLICACIÓN SQL (FASE 2B) ---');
    
    for (const name of productNames) {
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, tags, specs, badges, section')
            .eq('name', name);

        if (error) {
            console.error(`Error al obtener ${name}:`, error);
            continue;
        }

        if (products && products.length > 0) {
            const p = products[0];
            console.log(`\nPRODUCTO: ${p.name}`);
            console.log(`ID: ${p.id}`);
            console.log(`SPECS: ${JSON.stringify(p.specs)}`);
            console.log(`TAGS: ${JSON.stringify(p.tags)}`);
            
            // Verificación de normalización
            const expectedKeys = ['potencia', 'nicotina', 'ratio_vg_pg', 'conector', 'dosis_por_porcion'];
            const foundKeys = Object.keys(p.specs || {}).filter(k => expectedKeys.includes(k));
            if (foundKeys.length > 0) {
                console.log(`✅ Normalización detectada: ${foundKeys.join(', ')}`);
            } else if (Object.keys(p.specs || {}).length > 0) {
                console.log(`⚠️ Specs detectadas pero no coinciden con las claves de migración: ${Object.keys(p.specs).join(', ')}`);
            } else {
                console.log(`❌ No se detectaron specs para este producto.`);
            }
        } else {
            console.log(`\nPRODUCTO NO ENCONTRADO: ${name}`);
        }
    }
}

verifyMigrationPersistence();
