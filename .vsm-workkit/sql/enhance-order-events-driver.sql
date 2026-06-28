ALTER TABLE public.order_events ADD COLUMN driver_id uuid REFERENCES public.profiles(id);

CREATE OR REPLACE FUNCTION public.log_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Log if status changed OR driver_id changed
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.driver_id IS DISTINCT FROM OLD.driver_id THEN
    INSERT INTO public.order_events (order_id, previous_status, new_status, driver_id, updated_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.driver_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$function$;
