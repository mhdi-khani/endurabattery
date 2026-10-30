-- Set upgraded illustrated hero only if previous stock artwork was still configured.
update public.site_settings set value=jsonb_set(value,'{settings,heroImage}',to_jsonb('assets/images/hero-nexus-scene.svg'::text),true) where key='public' and value->'settings'->>'heroImage' in ('assets/images/hero-art.svg','');
