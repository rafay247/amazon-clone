-- Amazon.clone schema. Catalog lives in the app (src/data/products.json);
-- the database holds everything that belongs to a user.

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- addresses ----------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  full_name text not null,
  phone text not null default '',
  line1 text not null,
  line2 text not null default '',
  city text not null,
  state text not null default '',
  zip text not null,
  country text not null default 'United States',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user on public.addresses (user_id);
alter table public.addresses enable row level security;
create policy "own addresses" on public.addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- cart (synced from the client when signed in) ----------
create table if not exists public.cart_items (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  product_id int not null,
  qty int not null check (qty between 1 and 30),
  saved boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
alter table public.cart_items enable row level security;
create policy "own cart" on public.cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- orders ----------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  number text not null unique,
  status text not null default 'placed' check (status in ('placed', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null,
  tax numeric(10, 2) not null,
  total numeric(10, 2) not null,
  address jsonb not null,
  payment jsonb not null,
  delivery_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists orders_user on public.orders (user_id, created_at desc);
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);
-- Only cancelling is allowed from the client side.
create policy "own orders cancel" on public.orders for update
  using (auth.uid() = user_id and status = 'placed') with check (status = 'cancelled');

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders on delete cascade,
  product_id int not null,
  title text not null,
  slug text not null,
  image text not null,
  price numeric(10, 2) not null,
  qty int not null check (qty > 0)
);
create index if not exists order_items_order on public.order_items (order_id);
alter table public.order_items enable row level security;
create policy "own order items read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- Orders are created in one transaction by the server, with prices it computed from the catalog.
-- security definer so order rows can't be inserted directly by clients (no insert policy above).
create or replace function public.place_order(p_order jsonb, p_items jsonb) returns table (id uuid, number text)
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_number text;
begin
  if v_uid is null then raise exception 'not signed in'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'empty order'; end if;
  v_number := lpad((floor(random() * 900) + 100)::text, 3, '0') || '-' ||
              lpad(floor(random() * 10000000)::text, 7, '0') || '-' ||
              lpad(floor(random() * 10000000)::text, 7, '0');
  insert into orders (user_id, number, subtotal, shipping, tax, total, address, payment, delivery_date)
  values (v_uid, v_number, (p_order->>'subtotal')::numeric, (p_order->>'shipping')::numeric,
          (p_order->>'tax')::numeric, (p_order->>'total')::numeric, p_order->'address',
          p_order->'payment', (p_order->>'delivery_date')::date)
  returning orders.id into v_id;
  insert into order_items (order_id, product_id, title, slug, image, price, qty)
  select v_id, (i->>'product_id')::int, i->>'title', i->>'slug', i->>'image', (i->>'price')::numeric, (i->>'qty')::int
  from jsonb_array_elements(p_items) i;
  delete from cart_items where user_id = v_uid and saved = false;
  return query select v_id, v_number;
end $$;
revoke all on function public.place_order(jsonb, jsonb) from public, anon;
grant execute on function public.place_order(jsonb, jsonb) to authenticated;

-- ---------- reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id int not null,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 5000),
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product on public.reviews (product_id, created_at desc);
alter table public.reviews enable row level security;
create policy "reviews are public" on public.reviews for select using (true);
create policy "own reviews write" on public.reviews for insert with check (auth.uid() = user_id and verified = false);
create policy "own reviews update" on public.reviews for update using (auth.uid() = user_id) with check (verified = false);
create policy "own reviews delete" on public.reviews for delete using (auth.uid() = user_id);
