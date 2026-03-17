import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('Checking products table...')
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('specs, badges')
    .limit(1)
  
  if (productsError) {
    console.error('Error fetching specs/badges from products:', productsError.message)
  } else {
    console.log('Specs/Badges exist in products table.')
  }

  console.log('Checking product_attributes table...')
  const { data: attrData, error: attrError } = await supabase
    .from('product_attributes')
    .select('is_variant_capable, applicability')
    .limit(1)

  if (attrError) {
    console.error('Error fetching new columns from product_attributes:', attrError.message)
  } else {
    console.log('is_variant_capable/applicability exist in product_attributes table.')
  }
}

checkSchema()
