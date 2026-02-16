-- Create table for Admin Notes (Hidden from user)
create table if not exists public.admin_customer_notes (
  customer_id uuid references public.customer_profiles(id) on delete cascade primary key,
  tags text[] default array[]::text[],
  custom_fields jsonb default '{}'::jsonb,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS: Only Admin can view/edit
alter table public.admin_customer_notes enable row level security;

create policy "Admins can view all notes"
  on public.admin_customer_notes for select
  using ( exists (select 1 from public.admin_users where id = auth.uid()) );

create policy "Admins can insert notes"
  on public.admin_customer_notes for insert
  with check ( exists (select 1 from public.admin_users where id = auth.uid()) );

create policy "Admins can update notes"
  on public.admin_customer_notes for update
  using ( exists (select 1 from public.admin_users where id = auth.uid()) );

-- Storage Bucket for Evidence
insert into storage.buckets (id, name, public)
values ('customer-evidence', 'customer-evidence', false)
on conflict (id) do nothing;

-- Storage Policy: Admin only
create policy "Admins can upload evidence"
  on storage.objects for insert
  with check ( bucket_id = 'customer-evidence' and exists (select 1 from public.admin_users where id = auth.uid()) );

create policy "Admins can view evidence"
  on storage.objects for select
  using ( bucket_id = 'customer-evidence' and exists (select 1 from public.admin_users where id = auth.uid()) );
