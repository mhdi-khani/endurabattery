-- Endura V4: promote the official Nexus Grid identity defaults without overwriting customized uploaded campaigns.
-- Run once AFTER prior migrations. Public site_settings is a nested {settings:...,cms:...} JSONB document.
update public.site_settings
set value = jsonb_set(
  jsonb_set(value,'{settings,primaryColor}',to_jsonb('#8056CF'::text),true),
  '{settings,heroImage}',
  to_jsonb(
    case when coalesce(value->'settings'->>'heroImage','') in
      ('','assets/images/hero-art.svg','assets/images/hero-endura-scene.svg','assets/images/hero-nexus-scene.svg')
      then 'assets/images/hero-nexus-scene.svg'
      else value->'settings'->>'heroImage'
    end),true)
where key='public';
