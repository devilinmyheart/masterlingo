ALTER TABLE public.contact_submissions ADD COLUMN name TEXT;
ALTER TABLE public.contact_submissions ADD COLUMN email TEXT;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$function$;

CREATE TRIGGER contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();