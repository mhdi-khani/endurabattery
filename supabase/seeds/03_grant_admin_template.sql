-- Use only in Supabase Dashboard > SQL Editor after creating an Auth user.
-- Replace admin@example.com with the exact email shown in Authentication > Users.
-- DO NOT run this with an unrecognized email.
DO $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
   RAISE EXCEPTION 'Admin email not found in Authentication > Users. Replace admin@example.com first.';
 END IF;
END $$;
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@example.com'
ON CONFLICT(user_id, role) DO NOTHING;

-- Verify:
SELECT u.email, r.role
FROM auth.users u JOIN public.user_roles r ON r.user_id=u.id
WHERE r.role='admin';
