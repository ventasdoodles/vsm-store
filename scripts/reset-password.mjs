import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
async function reset() {
  const { data, error } = await supabase.auth.admin.updateUserById('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', { password: 'password123' });
  if (error) console.error(error);
  else console.log('Password reset successfully for carlos@vsm.store (password123)');
}
reset();