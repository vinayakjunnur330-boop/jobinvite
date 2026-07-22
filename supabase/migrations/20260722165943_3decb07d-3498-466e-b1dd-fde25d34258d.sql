
CREATE TABLE IF NOT EXISTS public.otp_challenges (
  email TEXT PRIMARY KEY,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.otp_challenges TO service_role;

ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON public.otp_challenges
  TO service_role USING (true) WITH CHECK (true);
