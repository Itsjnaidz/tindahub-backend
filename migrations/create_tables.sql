-- ==========================================
-- 0. CLEAN SLATE: DROP ALL EXISTING TABLES
-- ==========================================
-- Drop all uppercase variants just in case
drop table if exists "PAYMENT" cascade;
drop table if exists "DELIVERY" cascade;
drop table if exists "ORDER_ITEM" cascade;
drop table if exists "ORDER" cascade;
drop table if exists "CART_ITEM" cascade;
drop table if exists "CART" cascade;
drop table if exists "PRODUCT" cascade;
drop table if exists "CATEGORY" cascade;
drop table if exists "WITHDRAWAL" cascade;
drop table if exists "MERCHANT_WALLET" cascade;
drop table if exists "STORE" cascade;
drop table if exists "NOTIFICATION" cascade;
drop table if exists "OTP" cascade;
drop table if exists "USER" cascade;

-- Drop all lowercase variants to reset
drop table if exists payments cascade;
drop table if exists deliveries cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists cart_items cascade;
drop table if exists carts cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists withdrawals cascade;
drop table if exists merchant_wallets cascade;
drop table if exists stores cascade;
drop table if exists notifications cascade;
drop table if exists otps cascade;
drop table if exists users cascade;

-- Enable UUID extension safely
create extension if not exists "uuid-ossp";


-- ==========================================
-- 1. USER & AUTHENTICATION (3 Tables)
-- ==========================================

create table users (
    id uuid primary key default gen_random_uuid(),
    phone_number varchar unique,
    name varchar,
    role varchar,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table otps (
    id uuid primary key default gen_random_uuid(),
    phone_number varchar,
    code varchar not null,
    expires_at timestamp with time zone not null,
    used boolean default false
);

create table notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    type varchar not null,
    message text not null,
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 2. STORE & WALLET DETAILS (3 Tables)
-- ==========================================

create table stores (
    id uuid primary key default gen_random_uuid(),
    merchant_id uuid references users(id) on delete cascade,
    name varchar not null,
    slug varchar unique,
    logo_url varchar,
    is_live boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table merchant_wallets (
    id uuid primary key default gen_random_uuid(),
    merchant_id uuid references users(id) on delete cascade,
    available_balance decimal(12,2) default 0.00 not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table withdrawals (
    id uuid primary key default gen_random_uuid(),
    merchant_id uuid references users(id) on delete set null,
    amount decimal(12,2) not null,
    payout_method varchar not null,
    status varchar not null,
    requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);


-- ==========================================
-- 3. PRODUCT CATALOG (2 Tables)
-- ==========================================

create table categories (
    id uuid primary key default gen_random_uuid(),
    name varchar not null
);

create table products (
    id uuid primary key default gen_random_uuid(),
    store_id uuid references stores(id) on delete cascade,
    category_id uuid references categories(id) on delete set null,
    name varchar not null,
    price decimal(10,2) not null,
    image_url varchar,
    description text,
    stock_quantity int default 0 not null,
    is_active boolean default true not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);


-- ==========================================
-- 4. CART SYSTEM (2 Tables)
-- ==========================================

create table carts (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table cart_items (
    id uuid primary key default gen_random_uuid(),
    cart_id uuid references carts(id) on delete cascade,
    product_id uuid references products(id) on delete cascade,
    quantity int default 1 not null
);


-- ==========================================
-- 5. ORDERS & CHECKOUT (4 Tables)
-- ==========================================

create table orders (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid references users(id) on delete set null,
    store_id uuid references stores(id) on delete set null,
    status varchar not null,
    total_amount decimal(10,2) not null,
    delivery_address text not null,
    payment_method varchar not null,
    cancel_reason text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

create table order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    quantity int not null,
    unit_price decimal(10,2) not null
);

create table deliveries (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    provider varchar,
    pickup_address text,
    dropoff_address text,
    rider_name varchar,
    tracking_url varchar,
    estimated_fee decimal(10,2),
    status varchar not null,
    booked_at timestamp with time zone,
    completed_at timestamp with time zone
);

create table payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references orders(id) on delete cascade,
    method varchar not null,
    status varchar not null,
    amount decimal(10,2) not null,
    reference_number varchar,
    paid_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 6. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ==========================================
alter table users enable row level security;
alter table stores enable row level security;
alter table products enable row level security;


-- ==========================================
-- 7. SECURITY POLICIES (Updated for Lowercase)
-- ==========================================

-- --- USERS POLICIES ---
create policy "Allow user inserts"
  on users for insert
  with check ( auth.uid() = id );

create policy "Allow user select"
  on users for select
  using ( auth.uid() = id );

create policy "Allow user updates"
  on users for update
  using ( auth.uid() = id );

-- --- STORES POLICIES ---
create policy "Allow merchant store inserts"
  on stores for insert
  with check ( auth.uid() = merchant_id );

create policy "Allow merchant store select"
  on stores for select
  using ( auth.uid() = merchant_id );

create policy "Allow merchant store updates"
  on stores for update
  using ( auth.uid() = merchant_id );

-- --- PRODUCTS POLICIES ---
create policy "Allow everyone to read products"
  on products for select
  using (true);

create policy "Allow merchants to insert products"
  on products for insert
  with check (
    exists (
      select 1 from stores
      where stores.id = store_id 
      and stores.merchant_id = auth.uid()
    )
  );