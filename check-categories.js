// test.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase
        .from('store_settings')
        .select('featured_categories')
        .eq('id', '1') // Assuming id is '1' based on constants
        .single();

    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data.featured_categories, null, 2));
    }
}
check();
