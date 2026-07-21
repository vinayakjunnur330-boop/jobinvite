
CREATE TABLE IF NOT EXISTS public.magic_link_requests (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS magic_link_requests_email_created_idx ON public.magic_link_requests (email, created_at DESC);
CREATE INDEX IF NOT EXISTS magic_link_requests_ip_created_idx ON public.magic_link_requests (ip, created_at DESC);
GRANT ALL ON public.magic_link_requests TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.magic_link_requests_id_seq TO service_role;
ALTER TABLE public.magic_link_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON public.magic_link_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
