
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT private.has_role(_user_id, 'admin'::public.app_role) $$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;

DO $$
DECLARE
  r record;
  new_qual text;
  new_check text;
  cmd text;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname, pol.polname, pol.polcmd,
           pg_get_expr(pol.polqual, pol.polrelid) AS qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS wcheck
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND (COALESCE(pg_get_expr(pol.polqual, pol.polrelid),'') ~ '(is_admin|has_role)'
        OR COALESCE(pg_get_expr(pol.polwithcheck, pol.polrelid),'') ~ '(is_admin|has_role)')
  LOOP
    new_qual := regexp_replace(COALESCE(r.qual,'true'), 'public\.(is_admin|has_role)', 'private.\1', 'g');
    new_qual := regexp_replace(new_qual, '(?<!\.)\y(is_admin|has_role)\y', 'private.\1', 'g');
    new_check := regexp_replace(COALESCE(r.wcheck,''), 'public\.(is_admin|has_role)', 'private.\1', 'g');
    new_check := regexp_replace(new_check, '(?<!\.)\y(is_admin|has_role)\y', 'private.\1', 'g');
    EXECUTE format('DROP POLICY %I ON %I.%I', r.polname, r.nspname, r.relname);
    cmd := CASE r.polcmd WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT' WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' ELSE 'ALL' END;
    IF r.wcheck IS NOT NULL THEN
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO authenticated USING (%s) WITH CHECK (%s)',
        r.polname, r.nspname, r.relname, cmd, new_qual, new_check);
    ELSE
      EXECUTE format('CREATE POLICY %I ON %I.%I FOR %s TO authenticated USING (%s)',
        r.polname, r.nspname, r.relname, cmd, new_qual);
    END IF;
  END LOOP;
END $$;

DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
