-- ENDURA BATTERY V3: vehicle model catalog + product-vehicle join table.
-- Apply AFTER initial schema and catalog CMS migration.
-- Vehicle records and initial *candidate* relations are imported by separate seed (04).
create table if not exists public.vehicle_models (
 id text primary key,
 brand text not null,
 model text not null,
 voltage smallint,
 data jsonb not null default '{}'::jsonb,
 source_url text,
 updated_at timestamptz not null default now()
);
create index if not exists vehicle_models_brand_idx on public.vehicle_models(brand,model);
create table if not exists public.vehicle_battery_fitments (
 vehicle_id text not null references public.vehicle_models(id) on delete cascade,
 product_id text not null references public.products(id) on delete cascade,
 match_basis text not null default 'نیازمند تأیید فنی',
 status text not null default 'candidate' check(status in ('candidate','verified','rejected')),
 updated_at timestamptz not null default now(),
 primary key(vehicle_id,product_id)
);
create index if not exists vehicle_fitments_product_idx on public.vehicle_battery_fitments(product_id);
alter table public.vehicle_models enable row level security;
alter table public.vehicle_battery_fitments enable row level security;
drop policy if exists vehicle_catalog_read on public.vehicle_models;
create policy vehicle_catalog_read on public.vehicle_models for select to anon,authenticated using(true);
drop policy if exists vehicle_catalog_admin_write on public.vehicle_models;
create policy vehicle_catalog_admin_write on public.vehicle_models for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
drop policy if exists vehicle_fitment_read on public.vehicle_battery_fitments;
create policy vehicle_fitment_read on public.vehicle_battery_fitments for select to anon,authenticated
 using(status <> 'rejected' or (select public.is_admin()));
drop policy if exists vehicle_fitment_admin_write on public.vehicle_battery_fitments;
create policy vehicle_fitment_admin_write on public.vehicle_battery_fitments for all to authenticated
 using((select public.is_admin())) with check((select public.is_admin()));
revoke all on public.vehicle_models, public.vehicle_battery_fitments from anon, authenticated;
grant select on public.vehicle_models, public.vehicle_battery_fitments to anon,authenticated;
grant insert,update,delete on public.vehicle_models, public.vehicle_battery_fitments to authenticated;
comment on table public.vehicle_battery_fitments is 'Initial links are candidate matches by capacity, voltage, case; verify physical fit, polarity, start-stop technology and year before approval.';
