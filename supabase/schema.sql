-- ==========================================================
-- MORYA LUXE SUPPLY - ENTERPRISE DATABASE SCHEMA (SUPABASE)
-- Run this in your Supabase SQL Editor to initialize tables
-- ==========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  brand text not null,
  category text not null,
  category_name text not null,
  description text,
  retail_mrp numeric(10,2) not null,
  wholesale_price numeric(10,2) not null,
  moq integer default 1,
  tier_pricing jsonb default '[]'::jsonb,
  in_stock boolean default true,
  stock_count integer default 0,
  rating numeric(3,2) default 5.0,
  reviews_count integer default 0,
  badge text,
  image_url text not null,
  features text[] default '{}',
  specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  salon_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  gstin text,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  wholesale_savings numeric(10,2) default 0,
  shipping numeric(10,2) default 0,
  gst_amount numeric(10,2) default 0,
  grand_total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('razorpay', 'whatsapp')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'cod_requested')),
  razorpay_order_id text,
  razorpay_payment_id text,
  order_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. BULK INQUIRIES & SALON SETUP LEADS
create table if not exists public.bulk_inquiries (
  id uuid default uuid_generate_v4() primary key,
  salon_name text not null,
  contact_person text not null,
  phone text not null,
  email text,
  city text not null,
  state text not null,
  requirement_type text not null,
  estimated_budget text,
  message text,
  status text default 'new' check (status in ('new', 'contacted', 'quote_sent', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for blazing fast lookups
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_orders_phone on public.orders(phone);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_inquiries_created on public.bulk_inquiries(created_at desc);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.bulk_inquiries enable row level security;

-- Drop legacy permissive policies if re-running this script
drop policy if exists "Allow public read-only access to products" on public.products;
drop policy if exists "Allow public insert into orders" on public.orders;
drop policy if exists "Allow read orders by id" on public.orders;
drop policy if exists "Allow public insert into bulk_inquiries" on public.bulk_inquiries;

-- Public can read products (catalog)
create policy "Allow public read-only access to products"
  on public.products for select
  using (true);

-- Orders: NO public read or insert — all writes via service role (API routes)
-- Service role bypasses RLS automatically.

-- Public can submit bulk inquiries only
create policy "Allow public insert into bulk_inquiries"
  on public.bulk_inquiries for insert
  with check (true);

-- ==========================================================
-- PHASE 1: ADMIN PANEL MIGRATION (run after base schema)
-- ==========================================================

-- 4. CATEGORIES TABLE
create table if not exists public.categories (
  id text primary key,
  slug text unique not null,
  name text not null,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.categories (id, slug, name, sort_order) values
  ('clippers-trimmers', 'clippers-trimmers', 'Clippers & Trimmers', 1),
  ('shears-scissors', 'shears-scissors', 'Shears & Scissors', 2),
  ('chairs-furniture', 'chairs-furniture', 'Chairs & Furniture', 3),
  ('haircare-styling', 'haircare-styling', 'Haircare & Styling', 4),
  ('beard-shaving', 'beard-shaving', 'Beard & Shaving', 5),
  ('sanitization-hygiene', 'sanitization-hygiene', 'Sanitization & Hygiene', 6)
on conflict (id) do nothing;

-- 5. ADMIN USERS (RLS allowlist — keep in sync with ADMIN_EMAILS env)
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.admin_users (email) values ('hubmorya@gmail.com')
on conflict (email) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

alter table public.categories enable row level security;

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Admin insert categories" on public.categories;
drop policy if exists "Admin update categories" on public.categories;
drop policy if exists "Admin delete categories" on public.categories;

create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Admin insert categories"
  on public.categories for insert
  with check (public.is_admin());

create policy "Admin update categories"
  on public.categories for update
  using (public.is_admin());

create policy "Admin delete categories"
  on public.categories for delete
  using (public.is_admin());

drop policy if exists "Admin insert products" on public.products;
drop policy if exists "Admin update products" on public.products;
drop policy if exists "Admin delete products" on public.products;

create policy "Admin insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admin update products"
  on public.products for update
  using (public.is_admin());

create policy "Admin delete products"
  on public.products for delete
  using (public.is_admin());

drop policy if exists "Admin read orders" on public.orders;

create policy "Admin read orders"
  on public.orders for select
  using (public.is_admin());

drop policy if exists "Admin read bulk_inquiries" on public.bulk_inquiries;

create policy "Admin read bulk_inquiries"
  on public.bulk_inquiries for select
  using (public.is_admin());

-- STORAGE: Create bucket "product-images" in Supabase Dashboard > Storage.
-- Settings: public bucket, allowed MIME types image/jpeg, image/png, image/webp.
-- Authenticated admins (is_admin) can upload; public read for catalog images.
-- Example policy (run in Storage > Policies after bucket creation):
--   SELECT: allow public (true)
--   INSERT/UPDATE/DELETE: auth.role() = 'authenticated' AND public.is_admin()
