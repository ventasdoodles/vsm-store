-- 1. Add Status Columns to Customer Profiles
-- status enum: active, suspended, banned
alter table public.customer_profiles 
add column if not exists account_status text default 'active' check (account_status in ('active', 'suspended', 'banned')),
add column if not exists suspension_end timestamp with time zone;

-- 2. Create User Notifications Table
create table if not exists public.user_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text default 'info' check (type in ('info', 'warning', 'alert', 'success')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. RLS for Notifications
alter table public.user_notifications enable row level security;

-- Users can view their own notifications
create policy "Users can view own notifications"
  on public.user_notifications for select
  using ( auth.uid() = user_id );

-- Users can mark their own notifications as read (update is_read)
create policy "Users can update own notifications"
  on public.user_notifications for update
  using ( auth.uid() = user_id );

-- Admins can insert notifications for any user
create policy "Admins can insert notifications"
  on public.user_notifications for insert
  with check ( exists (select 1 from public.admin_users where id = auth.uid()) );

-- Admins can view all notifications (optional, for history)
create policy "Admins can view all notifications"
  on public.user_notifications for select
  using ( exists (select 1 from public.admin_users where id = auth.uid()) );
