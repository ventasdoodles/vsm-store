import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = 'https://qofovxaxvptemivpvtka.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

async function debugEdge() {
  console.log("Calling Edge Function for POLICY_INQUIRY...");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/customer-intelligence`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'concierge_chat',
      query: '¿Cómo funcionan sus envíos?',
      customerContext: { id: 'test-user' }
    })
  });

  const data = await res.json();
  console.log("RESPONSE DATA:");
  console.log(JSON.stringify(data, null, 2));
}

debugEdge();
