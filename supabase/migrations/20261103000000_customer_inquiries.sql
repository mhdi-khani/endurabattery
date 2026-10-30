-- Endura V8: authenticated purchase enquiries, NOT ORDERS/PAYMENTS.
-- Run after original 20261029 migration. No public anonymous inserts or monetary records.
create table if not exists public.purchase_inquiries (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 phone text not null,
 email text not null,
 city text,
 product_summary text,
 service text,
 notes text,
 status text not null default 'new' check(status in ('new','contacted','closed')),
 created_at timestamptz not null default now()
);
alter table public.purchase_inquiries enable row level security;
grant select,insert on public.purchase_inquiries to authenticated;
drop policy if exists inquiries_customer_read on public.purchase_inquiries;
create policy inquiries_customer_read on public.purchase_inquiries for select to authenticated
 using(customer_id=(select auth.uid()) or (select public.is_admin()));
drop policy if exists inquiries_customer_insert on public.purchase_inquiries;
create policy inquiries_customer_insert on public.purchase_inquiries for insert to authenticated
 with check(customer_id=(select auth.uid()) and status='new');
-- Admin may read but cannot alter customer-submitted content without an explicit server workflow.
