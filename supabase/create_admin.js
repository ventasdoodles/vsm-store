import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email: 'ventasdoodles@gmail.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { name: 'Admin VSM' },
    app_metadata: { role: 'admin' }
  });

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
        console.log('User already exists. Updating password...');
        const { data: listData } = await supabase.auth.admin.listUsers();
        const existing = listData.users.find(u => u.email === 'ventasdoodles@gmail.com');
        if (existing) {
             await supabase.auth.admin.updateUserById(existing.id, { password: 'password123', app_metadata: { role: 'admin' } });
             console.log('Password updated and admin role set.');
             await promote(existing.id);
        }
    } else {
        console.error('Error creating user:', error);
    }
  } else {
    console.log('User created:', user.user.id);
    await promote(user.user.id);
  }
}

async function promote(userId) {
  const { error: dbError } = await supabase.from('admin_users').insert({
    user_id: userId,
    email: 'ventasdoodles@gmail.com',
    role: 'super_admin'
  });
  
  if (dbError) {
    console.log('Note on admin_users table:', dbError.message);
  } else {
    console.log('Promoted to super_admin in admin_users table.');
  }
}

main();
