import dotenv from 'dotenv'
dotenv.config()
async function test() {
  const res = await fetch('https://cvvlorbiwtuhkxolhfie.supabase.co/functions/v1/customer-intelligence', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ action: 'concierge_chat', query: 'hola' })
  })
  console.log('STATUS:', res.status)
  console.log('RESPONSE:', await res.text())
}
test()
