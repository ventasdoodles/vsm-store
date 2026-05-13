REVOKE ALL ON FUNCTION public.cancel_admin_unpaid_order_with_audit(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_admin_unpaid_order_with_audit(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.cancel_admin_unpaid_order_with_audit(uuid, text) FROM service_role;
GRANT EXECUTE ON FUNCTION public.cancel_admin_unpaid_order_with_audit(uuid, text) TO authenticated;
