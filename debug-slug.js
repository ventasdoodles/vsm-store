
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvvlorbiwtuhkxolhfie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2dmxvcmJpd3R1aGt4b2xoZmllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3OTYyMzMsImV4cCI6MjA4NjM3MjIzM30.lbMH9nsICPoSb5hdo1TuRcU0ZMNucl7dPFzRiSq8D2E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    const categoryId = 'f9964ddf-c1fb-4a4d-9a54-d1bcd7d120c3';
    
    console.log('--- Checking Products for Category ID:', categoryId, '---');
    const { data: prods, error: prodsErr } = await supabase
        .from('products')
        .select('id, name, slug, section, is_active, status, stock, category_id')
        .eq('category_id', categoryId);
    
    if (prodsErr) console.error('Prods Error:', prodsErr);
    else {
        console.log('Products Count:', prods.length);
        console.log('Products:', prods.map(p => ({ 
            name: p.name, 
            active: p.is_active, 
            status: p.status, 
            stock: p.stock,
            section: p.section 
        })));
    }

    console.log('\n--- Checking Child Categories ---');
    const { data: children, error: childErr } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('parent_id', categoryId);
    
    if (childErr) console.error('Child Error:', childErr);
    else console.log('Children:', children);
}

debug();
