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

-- Public can read products
create policy "Allow public read-only access to products"
  on public.products for select
  using (true);

-- Public can insert orders (for checkout)
create policy "Allow public insert into orders"
  on public.orders for insert
  with check (true);

-- Public can read their own order by ID
create policy "Allow read orders by id"
  on public.orders for select
  using (true);

-- Public can insert bulk inquiries
create policy "Allow public insert into bulk_inquiries"
  on public.bulk_inquiries for insert
  with check (true);
