-- STAB merch store: initial schema
-- Run this in the Supabase SQL editor, or `supabase db push` if linked.

create type product_type as enum ('apparel', 'accessory', 'music');
create type order_status as enum ('pending', 'half_paid', 'paid', 'fulfilled', 'cancelled', 'refunded');
create type payment_method as enum ('gcash', 'bank_transfer', 'paypal');
create type payment_type as enum ('full', 'down');
create type shipping_method as enum ('pickup', 'maxim_lalamove', 'jnt', 'international');

create table products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  type        product_type not null default 'apparel',
  price_cents integer not null check (price_cents >= 0),
  images      text[] not null default '{}',
  active      boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products (id) on delete cascade,
  label       text not null,
  sku         text,
  dimensions  text,
  price_cents integer check (price_cents >= 0),
  stock       integer not null default 0 check (stock >= 0),
  sort_order  integer not null default 0
);
create index variants_product_id_idx on variants (product_id);

-- Short human-friendly order ref: STB-0001, STB-0002, …
create sequence order_ref_seq start 1;

create table orders (
  id              uuid primary key default gen_random_uuid(),
  ref             text not null unique default 'STB-' || lpad(nextval('order_ref_seq')::text, 4, '0'),
  name            text not null,
  email           text not null,
  phone           text not null,
  social_handle   text,
  payment_method  payment_method not null,
  payment_type    payment_type not null default 'full',
  proof_of_payment text,
  shipping_method shipping_method not null,
  address         jsonb,
  status          order_status not null default 'pending',
  total_cents     integer not null default 0 check (total_cents >= 0),
  created_at      timestamptz not null default now()
);

create table order_items (
  id               uuid primary key default gen_random_uuid(),
  order_id         uuid not null references orders (id) on delete cascade,
  variant_id       uuid references variants (id) on delete set null,
  title            text not null,
  variant_label    text,
  image            text,
  qty              integer not null check (qty > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0)
);
create index order_items_order_id_idx on order_items (order_id);

-- Stock decrement helper used by the checkout server action
create or replace function decrement_stock(variant uuid, qty int)
returns void language sql as $$
  update variants
  set stock = greatest(stock - qty, 0)
  where id = variant;
$$;

-- Private bucket for proof-of-payment screenshots.
-- Anyone can upload; only the service role (admin) can read.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false);

create policy "anyone can upload payment proof"
  on storage.objects for insert
  with check (bucket_id = 'payment-proofs');

-- Public bucket for product images. Anyone can read; only the
-- authenticated admin session can upload/delete.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

create policy "authenticated admin can manage product images"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

-- RLS: storefront reads are public, everything else is service-role only.
alter table products enable row level security;
alter table variants enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "public read active products"
  on products for select
  using (active = true);

create policy "public read variants of active products"
  on variants for select
  using (exists (
    select 1 from products p
    where p.id = variants.product_id and p.active = true
  ));
