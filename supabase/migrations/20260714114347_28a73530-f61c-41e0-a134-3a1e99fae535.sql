-- Revoke public EXECUTE on all SECURITY DEFINER functions so they are not
-- callable by anon or authenticated roles via the Data API / RPC.
-- Trigger functions (handle_new_user, set_updated_at, update_updated_at_column)
-- are invoked by triggers under the table owner and need no client EXECUTE.
-- has_role and has_active_subscription run inside RLS policies as SECURITY
-- DEFINER; policy evaluation does not require the caller to hold EXECUTE
-- because they are invoked from within owner-defined policy expressions.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;