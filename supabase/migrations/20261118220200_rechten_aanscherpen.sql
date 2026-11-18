-- Functies die niet zonder inloggen aangeroepen mogen worden.
revoke execute on function public.anet_create_order(jsonb, jsonb, boolean) from anon;
revoke execute on function public.anet_reorder_products(uuid[]) from anon;
revoke execute on function public.anet_orders_status_change() from anon, authenticated, public;
revoke execute on function public.anet_set_updated_at() from anon, authenticated, public;
