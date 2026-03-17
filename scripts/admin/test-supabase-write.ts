
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function testUpdate() {
    const testId = '366d0c92-353d-4952-b88d-7df230b91d22'; // ID de Box Mod 150W TC (asumido o buscado)
    
    console.log('Probando actualización directa...');
    
    // Primero buscamos el ID real por nombre
    const { data: p } = await supabase.from('products').select('id').eq('name', 'Box Mod 150W TC').single();
    if (!p) {
        console.error('No se encontró el producto');
        return;
    }
    
    console.log(`ID encontrado: ${p.id}`);
    
    const { data, error } = await supabase
        .from('products')
        .update({ specs: { "Prueba": "Exitosa" } })
        .eq('id', p.id)
        .select();
    
    if (error) {
        console.error('Error de Supabase:', error.message);
    } else {
        console.log('Update exitoso:', JSON.stringify(data));
    }
}

testUpdate();
