-- Beheerportaal ANET (in het Supabase-project "trainingcoach"; alles heeft het voorvoegsel anet_
-- zodat het volledig los staat van de trainingcoach-tabellen): producten, voorraad, bestellingen en beheerders.
-- Productteksten zijn alleen Nederlands (MVP-beslissing).

-- ─────────────────────────────────────────────────────────────
-- Beheerders
-- ─────────────────────────────────────────────────────────────
create table public.anet_admin_emails (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.anet_admin_emails enable row level security;

-- Alleen een ingelogde gebruiker met bevestigd e-mailadres dat op de lijst staat is beheerder.
create or replace function public.anet_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.anet_admin_emails a on a.email = lower(u.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.anet_is_admin() from public;
grant execute on function public.anet_is_admin() to anon, authenticated;

create policy "beheerders lezen beheerderslijst" on public.anet_admin_emails
  for select to authenticated using (public.anet_is_admin());

-- ─────────────────────────────────────────────────────────────
-- Hulpfunctie: updated_at bijhouden
-- ─────────────────────────────────────────────────────────────
create or replace function public.anet_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Producten
-- ─────────────────────────────────────────────────────────────
create table public.anet_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Verplicht
  name text not null check (length(trim(name)) > 0),
  short_description text not null check (length(trim(short_description)) > 0),
  price_cents integer not null check (price_cents > 0),
  stock integer not null default 0 check (stock >= 0),
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  -- Weergave
  sort_order integer not null default 0,
  is_visible boolean not null default false,
  is_example boolean not null default false,
  badge text,
  -- Optioneel: alleen getoond als ingevuld
  tagline text,
  size text,
  compare_at_price_cents integer check (compare_at_price_cents is null or compare_at_price_cents > 0),
  story text,
  facts jsonb not null default '[]'::jsonb check (jsonb_typeof(facts) = 'array'),
  contents jsonb not null default '[]'::jsonb check (jsonb_typeof(contents) = 'array'),
  about_title text,
  about_body text,
  ingredients text,
  allergens text,
  origin text,
  storage text,
  packaging text,
  usage jsonb not null default '[]'::jsonb check (jsonb_typeof(usage) = 'array'),
  tip text,
  faq jsonb not null default '[]'::jsonb check (jsonb_typeof(faq) = 'array'),
  -- Intern
  weight_grams integer check (weight_grams is null or weight_grams > 0),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Een zichtbaar product heeft minimaal één foto.
  constraint anet_zichtbaar_product_heeft_foto check (not is_visible or jsonb_array_length(images) >= 1)
);
create index anet_products_sort_idx on public.anet_products (sort_order, created_at);
create trigger anet_products_updated_at before update on public.anet_products
  for each row execute function public.anet_set_updated_at();

alter table public.anet_products enable row level security;
create policy "iedereen ziet zichtbare producten" on public.anet_products
  for select to anon, authenticated using (is_visible or public.anet_is_admin());
create policy "beheerders voegen producten toe" on public.anet_products
  for insert to authenticated with check (public.anet_is_admin());
create policy "beheerders wijzigen producten" on public.anet_products
  for update to authenticated using (public.anet_is_admin()) with check (public.anet_is_admin());
create policy "beheerders verwijderen producten" on public.anet_products
  for delete to authenticated using (public.anet_is_admin());

-- Volgorde in één keer opslaan: ids in de gewenste volgorde.
create or replace function public.anet_reorder_products(ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.anet_is_admin() then
    raise exception 'Geen toegang' using errcode = '42501';
  end if;
  update public.anet_products p
     set sort_order = x.pos
    from unnest(ids) with ordinality as x(id, pos)
   where p.id = x.id;
end;
$$;
revoke all on function public.anet_reorder_products(uuid[]) from public;
grant execute on function public.anet_reorder_products(uuid[]) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Bestellingen
-- ─────────────────────────────────────────────────────────────
create type public.anet_order_status as enum (
  'aangemaakt',
  'betaald',
  'in_behandeling',
  'klaar_voor_verzending',
  'verzonden',
  'geannuleerd'
);

create table public.anet_orders (
  id uuid primary key default gen_random_uuid(),
  order_number integer generated always as identity (start with 1001) unique,
  status public.anet_order_status not null default 'aangemaakt',
  is_test boolean not null default false,
  -- Klantgegevens (zoals ingevuld bij het bestellen)
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  first_name text not null,
  last_name text not null,
  phone text,
  company_name text,
  street text not null,
  house_number text not null,
  house_number_addition text,
  postal_code text not null,
  city text not null,
  country text not null default 'NL',
  customer_note text,
  newsletter_opt_in boolean not null default false,
  -- Bedragen in eurocenten
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  -- Betaling en verzending
  payment_provider text,
  payment_id text,
  paid_at timestamptz,
  shipped_at timestamptz,
  track_and_trace text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index anet_orders_status_idx on public.anet_orders (status, created_at desc);
create trigger anet_orders_updated_at before update on public.anet_orders
  for each row execute function public.anet_set_updated_at();

create table public.anet_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.anet_orders (id) on delete cascade,
  product_id uuid references public.anet_products (id) on delete set null,
  product_name text not null,
  product_slug text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity between 1 and 99)
);
create index anet_order_items_order_idx on public.anet_order_items (order_id);
create index anet_order_items_product_idx on public.anet_order_items (product_id);

create table public.anet_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.anet_orders (id) on delete cascade,
  status public.anet_order_status not null,
  note text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index anet_order_events_order_idx on public.anet_order_events (order_id, created_at);

alter table public.anet_orders enable row level security;
alter table public.anet_order_items enable row level security;
alter table public.anet_order_events enable row level security;

create policy "beheerders lezen bestellingen" on public.anet_orders
  for select to authenticated using (public.anet_is_admin());
create policy "beheerders wijzigen bestellingen" on public.anet_orders
  for update to authenticated using (public.anet_is_admin()) with check (public.anet_is_admin());
create policy "beheerders verwijderen bestellingen" on public.anet_orders
  for delete to authenticated using (public.anet_is_admin());
create policy "beheerders lezen orderregels" on public.anet_order_items
  for select to authenticated using (public.anet_is_admin());
create policy "beheerders lezen orderhistorie" on public.anet_order_events
  for select to authenticated using (public.anet_is_admin());

-- Statuswijzigingen: historie, tijdstempels en voorraad bij annuleren.
create or replace function public.anet_orders_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.anet_order_events (order_id, status) values (new.id, new.status);
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'betaald' and new.paid_at is null then
      new.paid_at = now();
    end if;
    if new.status = 'verzonden' and new.shipped_at is null then
      new.shipped_at = now();
    end if;

    -- Annuleren geeft de voorraad terug; heropenen haalt hem weer af.
    if new.status = 'geannuleerd' and old.status <> 'geannuleerd' then
      update public.anet_products p
         set stock = p.stock + i.quantity
        from public.anet_order_items i
       where i.order_id = new.id and i.product_id = p.id;
    elsif old.status = 'geannuleerd' and new.status <> 'geannuleerd' then
      begin
        update public.anet_products p
           set stock = p.stock - i.quantity
          from public.anet_order_items i
         where i.order_id = new.id and i.product_id = p.id;
      exception when check_violation then
        raise exception 'Onvoldoende voorraad om deze bestelling te heropenen';
      end;
    end if;

    insert into public.anet_order_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end;
$$;

create trigger anet_orders_status_insert after insert on public.anet_orders
  for each row execute function public.anet_orders_status_change();
create trigger anet_orders_status_update before update of status on public.anet_orders
  for each row execute function public.anet_orders_status_change();

-- Bestelling aanmaken: prijzen en voorraad worden hier (op de server) bepaald.
-- Voorlopig alleen voor beheerders (testbestellingen). Bij de Mollie-koppeling
-- roept de edge function dit aan met de service-rol.
create or replace function public.anet_create_order(customer jsonb, items jsonb, test boolean default false)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal integer := 0;
  v_shipping integer := 0;
  v_item jsonb;
  v_product public.anet_products%rowtype;
  v_qty integer;
begin
  if coalesce(auth.role(), '') <> 'service_role' and not public.anet_is_admin() then
    raise exception 'Geen toegang' using errcode = '42501';
  end if;
  if jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'De bestelling bevat geen producten';
  end if;

  insert into public.anet_orders (
    is_test, email, first_name, last_name, phone, company_name, street, house_number,
    house_number_addition, postal_code, city, country, customer_note, newsletter_opt_in,
    subtotal_cents, shipping_cents, total_cents
  ) values (
    test,
    lower(trim(customer->>'email')),
    trim(customer->>'first_name'),
    trim(customer->>'last_name'),
    nullif(trim(customer->>'phone'), ''),
    nullif(trim(customer->>'company_name'), ''),
    trim(customer->>'street'),
    trim(customer->>'house_number'),
    nullif(trim(customer->>'house_number_addition'), ''),
    upper(replace(trim(customer->>'postal_code'), ' ', '')),
    trim(customer->>'city'),
    'NL',
    nullif(trim(customer->>'customer_note'), ''),
    coalesce((customer->>'newsletter_opt_in')::boolean, false),
    0, 0, 0
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 99 then
      raise exception 'Ongeldig aantal';
    end if;

    select * into v_product from public.anet_products
     where id = (v_item->>'product_id')::uuid and is_visible
     for update;
    if not found then
      raise exception 'Product niet gevonden';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Onvoldoende voorraad voor %', v_product.name;
    end if;

    update public.anet_products set stock = stock - v_qty where id = v_product.id;
    insert into public.anet_order_items (order_id, product_id, product_name, product_slug, unit_price_cents, quantity)
    values (v_order_id, v_product.id, v_product.name, v_product.slug, v_product.price_cents, v_qty);
    v_subtotal := v_subtotal + v_product.price_cents * v_qty;
  end loop;

  update public.anet_orders
     set subtotal_cents = v_subtotal,
         shipping_cents = v_shipping,
         total_cents = v_subtotal + v_shipping
   where id = v_order_id;

  return v_order_id;
end;
$$;
revoke all on function public.anet_create_order(jsonb, jsonb, boolean) from public;
grant execute on function public.anet_create_order(jsonb, jsonb, boolean) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- Opslag voor productfoto's
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anet-product-images', 'anet-product-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "anet: beheerders uploaden productfoto's" on storage.objects
  for insert to authenticated with check (bucket_id = 'anet-product-images' and public.anet_is_admin());
create policy "anet: beheerders wijzigen productfoto's" on storage.objects
  for update to authenticated using (bucket_id = 'anet-product-images' and public.anet_is_admin());
create policy "anet: beheerders verwijderen productfoto's" on storage.objects
  for delete to authenticated using (bucket_id = 'anet-product-images' and public.anet_is_admin());
