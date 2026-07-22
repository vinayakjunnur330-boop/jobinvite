
-- Resume analyses
CREATE TABLE public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_name text NOT NULL,
  overall_score int NOT NULL DEFAULT 0,
  ats_score int NOT NULL DEFAULT 0,
  sections jsonb NOT NULL DEFAULT '{}'::jsonb,
  strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
  weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggestions jsonb NOT NULL DEFAULT '[]'::jsonb,
  suggested_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resume_analyses TO authenticated;
GRANT ALL ON public.resume_analyses TO service_role;
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own resume analyses select" ON public.resume_analyses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own resume analyses insert" ON public.resume_analyses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own resume analyses delete" ON public.resume_analyses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Assessment results (personality, technical, aptitude, career-fit, interview)
CREATE TABLE public.assessment_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('personality','technical','aptitude','career_fit','interview')),
  score int NOT NULL DEFAULT 0,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own assessments select" ON public.assessment_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own assessments insert" ON public.assessment_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own assessments delete" ON public.assessment_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX resume_analyses_user_created ON public.resume_analyses(user_id, created_at DESC);
CREATE INDEX assessment_results_user_kind_created ON public.assessment_results(user_id, kind, created_at DESC);
