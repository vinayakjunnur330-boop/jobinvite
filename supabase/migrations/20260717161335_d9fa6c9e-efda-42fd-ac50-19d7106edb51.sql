
-- Extend profiles with self-serve apply fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS years_experience int;

-- Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id text NOT NULL,
  job_title text NOT NULL,
  company text NOT NULL,
  cover_note text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own applications" ON public.job_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users insert own applications" ON public.job_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own applications" ON public.job_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own applications" ON public.job_applications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Alert preferences (one row per user)
CREATE TABLE IF NOT EXISTS public.job_alert_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  industries text[] NOT NULL DEFAULT '{}',
  arrangements text[] NOT NULL DEFAULT '{}',
  employment_types text[] NOT NULL DEFAULT '{}',
  experience_levels text[] NOT NULL DEFAULT '{}',
  min_salary int NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'weekly',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_alert_preferences TO authenticated;
GRANT ALL ON public.job_alert_preferences TO service_role;
ALTER TABLE public.job_alert_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alerts" ON public.job_alert_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON public.job_alert_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.job_alert_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated-at trigger fn (shared)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_job_applications_updated ON public.job_applications;
CREATE TRIGGER trg_job_applications_updated BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS trg_job_alerts_updated ON public.job_alert_preferences;
CREATE TRIGGER trg_job_alerts_updated BEFORE UPDATE ON public.job_alert_preferences
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
