-- Explicitly restrict UPDATE/DELETE on contact_submissions to prevent
-- users (or admins via the Data API as authenticated) from tampering
-- with submission records. Only service_role may modify/delete.
REVOKE UPDATE, DELETE ON public.contact_submissions FROM authenticated, anon;

CREATE POLICY "No user updates on contact submissions"
  ON public.contact_submissions
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "No user deletes on contact submissions"
  ON public.contact_submissions
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated, anon
  USING (false);