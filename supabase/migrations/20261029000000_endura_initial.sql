-- Endura Battery / Supabase: starter schema 1.0 (2026-10-29)
-- IMPORTANT: Run exactly once; either with Supabase GitHub migrations or SQL Editor, not both.
-- Public site can read *published* catalog data. Only designated administrators can write it.
-- Orders and money-moving actions are NOT directly writable from the browser.

create extension if not exists pgcrypto;

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','operations','finance','agent')),
  primary key (user_id, role)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
   select 1 from public.user_roles r
   where r.user_id = (select auth.uid()) and r.role = 'admin'
 );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.products (
 id text primary key,
 sku text not null unique,
 name text not null,
 brand text not null,
 category text not null check (category in ('light','heavy','ups','solar')),
 price numeric(16,2) check (price is null or price >= 0),
 status text not null default 'draft' check (status in ('active','draft','inactive')),
 image_url text,
 data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category, status);
create index products_brand_idx on public.products(brand);

create table public.site_settings (
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
create table public.cms_articles (
 id text primary key,
 slug text not null unique,
 title text not null,
 status text not null default 'draft' check (status in ('draft','published','archived')),
 data jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
create table public.service_zones (
 id text primary key,
 city text not null,
 delivery boolean not null default false,
 install boolean not null default false,
 active boolean not null default false,
 data jsonb not null default '{}'::jsonb
);

create table public.agents (
 id text primary key,
 name text not null,
 city text,
 status text not null default 'pending',
 data jsonb not null default '{}'::jsonb
);
create table public.agent_users (
 agent_id text not null references public.agents(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check (role in ('owner','manager','member','installer')),
 primary key (agent_id,user_id)
);
create or replace function public.is_agent_for(p_agent_id text)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (select 1 from public.agent_users au
 where au.agent_id = p_agent_id and au.user_id = (select auth.uid()));
$$;
revoke all on function public.is_agent_for(text) from public;
grant execute on function public.is_agent_for(text) to authenticated;

create table public.agent_inventory (
 agent_id text not null references public.agents(id),
 product_id text not null references public.products(id),
 available integer not null default 0 check (available >= 0),
 reserved integer not null default 0 check (reserved >= 0 and reserved <= available),
 updated_at timestamptz not null default now(),
 primary key(agent_id,product_id)
);

create table public.customer_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 phone text,
 email text,
 updated_at timestamptz not null default now()
);
create table public.customer_assets (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 asset_type text not null check (asset_type in ('light','heavy','ups','solar')),
 name text not null,
 data jsonb not null default '{}'::jsonb
);
create table public.customer_addresses (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id) on delete cascade,
 title text,
 city text not null,
 address text not null,
 data jsonb not null default '{}'::jsonb
);

create table public.orders (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid references auth.users(id),
 customer_snapshot jsonb not null default '{}'::jsonb,
 payment_method text not null check (payment_method in ('online','cod')),
 payment_status text not null default 'unpaid',
 order_status text not null default 'sourcing',
 sourcing_status text not null default 'pending',
 total_amount numeric(16,2) not null check (total_amount >= 0),
 currency text not null default 'IRR',
 address_snapshot jsonb not null default '{}'::jsonb,
 service_snapshot jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create table public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 product_id text references public.products(id),
 product_snapshot jsonb not null,
 quantity integer not null check (quantity > 0),
 unit_price numeric(16,2) not null check (unit_price >= 0)
);
create table public.order_assignments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 agent_id text not null references public.agents(id),
 status text not null default 'offered',
 created_at timestamptz not null default now()
);
create table public.payments (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id),
 method text not null,
 status text not null default 'pending',
 amount numeric(16,2) not null check (amount >= 0),
 provider_reference text,
 created_at timestamptz not null default now()
);
create table public.agent_settlements (
 id uuid primary key default gen_random_uuid(),
 agent_id text not null references public.agents(id),
 status text not null default 'pending',
 amount numeric(16,2) not null default 0,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table public.support_tickets (
 id uuid primary key default gen_random_uuid(),
 customer_id uuid not null references auth.users(id),
 order_id uuid references public.orders(id),
 subject text not null,
 message text not null,
 status text not null default 'open',
 created_at timestamptz not null default now()
);
create table public.audit_logs (
 id bigint generated always as identity primary key,
 actor_id uuid,
 action text not null,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

-- Explicit RLS and policies: never publish unrestricted writes.
do $$ declare tab text; begin
 foreach tab in array array[
 'user_roles','products','site_settings','cms_articles','service_zones',
 'agents','agent_users','agent_inventory','customer_profiles',
 'customer_assets','customer_addresses','orders','order_items',
 'order_assignments','payments','agent_settlements','support_tickets','audit_logs'
 ] loop
  execute format('alter table public.%I enable row level security', tab);
 end loop;
end $$;

create policy products_read on public.products for select to anon, authenticated
 using(status = 'active' or (select public.is_admin()));
create policy products_admin_write on public.products for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));

-- PUBLIC site settings only. Never store payment credentials or private keys here.
create policy settings_read on public.site_settings for select to anon, authenticated
 using(key = 'public' or (select public.is_admin()));
create policy settings_admin_write on public.site_settings for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));

create policy articles_read on public.cms_articles for select to anon, authenticated
 using(status = 'published' or (select public.is_admin()));
create policy articles_admin_write on public.cms_articles for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));

create policy zones_read on public.service_zones for select to anon, authenticated
 using(active = true or (select public.is_admin()));
create policy zones_admin_write on public.service_zones for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));

create policy user_roles_self on public.user_roles for select to authenticated
 using(user_id = (select auth.uid()) or (select public.is_admin()));
-- No public/normal-user policies for creating or elevating roles.

create policy agents_read on public.agents for select to authenticated
 using((select public.is_admin()) or (select public.is_agent_for(id)));
create policy agents_admin_write on public.agents for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
create policy agent_users_read on public.agent_users for select to authenticated
 using(user_id = (select auth.uid()) or (select public.is_admin()));
create policy agent_users_admin_write on public.agent_users for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
create policy inventory_read on public.agent_inventory for select to authenticated
 using((select public.is_admin()) or (select public.is_agent_for(agent_id)));
create policy inventory_admin_write on public.agent_inventory for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
-- Agents will update inventory later via a server-side validated RPC / Edge Function.

create policy profiles_self_read on public.customer_profiles for select to authenticated
 using(id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_self_insert on public.customer_profiles for insert to authenticated
 with check(id = (select auth.uid()));
create policy profiles_self_update on public.customer_profiles for update to authenticated
 using(id = (select auth.uid())) with check(id = (select auth.uid()));

create policy assets_self on public.customer_assets for all to authenticated
 using(customer_id = (select auth.uid()) or (select public.is_admin()))
 with check(customer_id = (select auth.uid()) or (select public.is_admin()));
create policy addresses_self on public.customer_addresses for all to authenticated
 using(customer_id = (select auth.uid()) or (select public.is_admin()))
 with check(customer_id = (select auth.uid()) or (select public.is_admin()));

-- Order creation, order financial totals, payments and settlement changes MUST occur
-- through validated server-side operations, NOT direct browser INSERT/UPDATE.
create policy orders_read on public.orders for select to authenticated
 using(customer_id = (select auth.uid()) or (select public.is_admin()) or
   exists(select 1 from public.order_assignments oa
    where oa.order_id = id and (select public.is_agent_for(oa.agent_id))));
create policy order_items_read on public.order_items for select to authenticated
 using(exists(select 1 from public.orders o where o.id = order_id));
create policy assignments_read on public.order_assignments for select to authenticated
 using((select public.is_admin()) or (select public.is_agent_for(agent_id)));
create policy payments_read on public.payments for select to authenticated
 using((select public.is_admin()) or exists(select 1 from public.orders o where o.id = order_id));
create policy settlements_read on public.agent_settlements for select to authenticated
 using((select public.is_admin()) or (select public.is_agent_for(agent_id)));

create policy tickets_read on public.support_tickets for select to authenticated
 using(customer_id = (select auth.uid()) or (select public.is_admin()));
create policy tickets_customer_create on public.support_tickets for insert to authenticated
 with check(customer_id = (select auth.uid()) and status = 'open');
create policy tickets_admin_update on public.support_tickets for update to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
create policy audit_admin_read on public.audit_logs for select to authenticated
 using((select public.is_admin()));

-- Public product/hero/blog images; uploads restricted to approved admins.
insert into storage.buckets(id,name,public)
 values('endura-public','endura-public',true)
 on conflict (id) do nothing;
create policy endura_storage_upload on storage.objects for insert to authenticated
 with check(bucket_id='endura-public' and (select public.is_admin()));
create policy endura_storage_modify on storage.objects for update to authenticated
 using(bucket_id='endura-public' and (select public.is_admin()))
 with check(bucket_id='endura-public' and (select public.is_admin()));
create policy endura_storage_delete on storage.objects for delete to authenticated
 using(bucket_id='endura-public' and (select public.is_admin()));
