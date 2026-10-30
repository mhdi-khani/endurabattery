-- Run AFTER 20261029000000_endura_initial.sql.
-- This migration is safe to re-run for its grants/seed values; use standard migration tooling.
-- is_admin() is security-definer and always returns false for an anonymous caller.
-- This EXECUTE privilege is needed because public product/settings RLS references it.
grant execute on function public.is_admin() to anon;

-- Keep browser grants minimal: RLS still applies after SQL GRANT checks.
revoke all on public.user_roles,public.products,public.site_settings,public.cms_articles,
 public.service_zones,public.agents,public.agent_users,public.agent_inventory,
 public.customer_profiles,public.customer_assets,public.customer_addresses,
 public.orders,public.order_items,public.order_assignments,public.payments,
 public.agent_settlements,public.support_tickets,public.audit_logs from anon,authenticated;

grant select on public.products,public.site_settings,public.cms_articles,public.service_zones to anon;
grant select,insert,update,delete on public.products,public.site_settings,public.cms_articles,public.service_zones to authenticated;
grant select on public.user_roles to authenticated;
grant select,insert,update,delete on public.agents to authenticated;
grant select on public.agent_users,public.agent_inventory to authenticated;
grant select,insert,update on public.customer_profiles to authenticated;
grant select,insert,update,delete on public.customer_assets,public.customer_addresses to authenticated;
grant select on public.orders,public.order_items,public.order_assignments,
 public.payments,public.agent_settlements to authenticated;
grant select,insert,update on public.support_tickets to authenticated;
grant select on public.audit_logs to authenticated;

-- Preserve older flat settings from starter-kit seed by wrapping it in a grouped value.
update public.site_settings
 set value=jsonb_build_object(
   'settings', value || jsonb_build_object('siteName', coalesce(value->>'siteName','Endura Battery')),
   'cms', jsonb_build_object('categoryText', '{}'::jsonb,
                              'footerAbout', 'Endura Battery؛ فروشگاه تخصصی باتری خودرو، UPS و سولار.')
 )
where key='public' and not(value ? 'settings');
insert into public.site_settings(key,value) values('public',
 jsonb_build_object('settings',jsonb_build_object(
   'siteName','Endura Battery',
   'heroTitle','انرژی مطمئن، برای هر مسیر',
   'heroSubtitle','خرید تخصصی باتری خودرو، UPS و سولار',
   'heroImage','assets/images/hero-art.svg',
   'heroButton','مشاهده محصولات',
   'heroLink','#/shop',
   'primaryColor','#087b6d',
   'announcement','خدمات ارسال و نصب متناسب با نوع محصول و منطقه',
   'deliveryFee',0,'installationFee',0,
   'onlinePaymentEnabled',false,'payOnDeliveryEnabled',false
 ),'cms',jsonb_build_object('categoryText','{}'::jsonb,
   'footerAbout','Endura Battery؛ فروشگاه تخصصی باتری خودرو، UPS و سولار.')))
on conflict(key) do nothing;

-- Sample educational content can be replaced/removed in Admin > Content.
insert into public.cms_articles(id,slug,title,status,data) values
 ('A1','car-battery-guide','راهنمای انتخاب باتری مناسب خودرو','published',
  '{"id":"A1","slug":"car-battery-guide","category":"راهنمای خرید","title":"راهنمای انتخاب باتری مناسب خودرو","excerpt":"نکات انتخاب باتری بر اساس خودرو، ابعاد و فناوری","icon":"🚗","body":"انتخاب باتری صرفاً براساس آمپرساعت کافی نیست. ابعاد، قطب‌بندی و فناوری موردنیاز خودرو را هم بررسی کنید."}'::jsonb),
 ('A2','ups-battery-guide','راهنمای خرید باتری UPS','published',
  '{"id":"A2","slug":"ups-battery-guide","category":"آموزش فنی","title":"راهنمای خرید باتری UPS","excerpt":"ولتاژ، ظرفیت و سازگاری با دستگاه UPS","icon":"🔌","body":"پیش از خرید، ولتاژ، مشخصات شارژر، ابعاد و ظرفیت مناسب سیستم را بررسی کنید."}'::jsonb),
 ('A3','solar-battery-guide','راهنمای انتخاب باتری سولار','published',
  '{"id":"A3","slug":"solar-battery-guide","category":"انرژی خورشیدی","title":"راهنمای انتخاب باتری سولار","excerpt":"شناخت ظرفیت ذخیره انرژی و فناوری باتری","icon":"☀️","body":"برای انتخاب باتری سولار، انرژی مورد نیاز، عمق دشارژ مجاز و سازگاری با اینورتر را بررسی کنید."}'::jsonb)
on conflict(id) do nothing;
