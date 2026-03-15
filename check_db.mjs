import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkData() {
  console.log('Checking database content...');
  
  const { count: profilesCount, error: profilesError } = await supabase
    .from('customer_profiles')
    .select('*', { count: 'exact', head: true });
    
  if (profilesError) console.error('Profiles Error:', profilesError);
  else console.log('customer_profiles count:', profilesCount);

  const { count: ordersCount, error: ordersError } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });
    
  if (ordersError) console.error('Orders Error:', ordersError);
  else console.log('orders count:', ordersCount);

  const { data: viewData, error: viewError } = await supabase
    .from('customer_intelligence_360')
    .select('*')
    .limit(1);
    
  if (viewError) console.error('View Error (customer_intelligence_360):', viewError);
  else console.log('customer_intelligence_360 data sample:', viewData);
}

checkData();
