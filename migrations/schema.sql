-- ==========================================
-- TINDAHUB DATABASE COMPLETE RESTORATION SQL
-- ==========================================
-- Run this script in your Supabase SQL Editor to restore all 14 tables,
-- relations, constraints, default values, and permissions.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up any existing broken tables to avoid conflicts
DROP TABLE IF EXISTS public.logs_audit CASCADE;
DROP TABLE IF EXISTS public.merchant_analytics CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;
DROP TABLE IF EXISTS public.otp_requests CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Table: users

CREATE TABLE public.users (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
phone TEXT UNIQUE NOT NULL,
name TEXT,
email TEXT,
role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'merchant', 'admin')),
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table: otp_requests

CREATE TABLE public.otp_requests (
phone TEXT PRIMARY KEY,
otp TEXT NOT NULL,
expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table: stores

CREATE TABLE public.stores (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
name TEXT NOT NULL,
description TEXT,
address TEXT NOT NULL,
contact_phone TEXT NOT NULL,
email TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE
);

-- 4. Table: categories

CREATE TABLE public.categories (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
name TEXT NOT NULL,
description TEXT,
icon TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table: products

CREATE TABLE public.products (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
name TEXT NOT NULL,
description TEXT,
category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
price NUMERIC NOT NULL CHECK (price >= 0),
stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
image TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. Table: cart_items

CREATE TABLE public.cart_items (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Table: orders

CREATE TABLE public.orders (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
customer_id UUID NOT NULL REFERENCES public.users(id),
merchant_id UUID NOT NULL REFERENCES public.users(id),
items JSONB NOT NULL,
shipping_address TEXT NOT NULL,
total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed')),
cancellation_reason TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE
);

-- 8. Table: deliveries

CREATE TABLE public.deliveries (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
tracking_number TEXT NOT NULL,
carrier TEXT NOT NULL,
estimated_delivery TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Table: notifications

CREATE TABLE public.notifications (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
type TEXT NOT NULL, -- e.g., 'sms'
recipient TEXT NOT NULL,
message TEXT NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Table: transactions

CREATE TABLE public.transactions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
amount NUMERIC NOT NULL CHECK (amount >= 0),
payment_method TEXT NOT NULL, -- e.g., 'gcash', 'maya'
status TEXT NOT NULL DEFAULT 'completed',
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Table: wallets

CREATE TABLE public.wallets (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
merchant_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
balance NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
updated_at TIMESTAMP WITH TIME ZONE
);

-- 12. Table: wallet_transactions

CREATE TABLE public.wallet_transactions (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
merchant_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
type TEXT NOT NULL CHECK (type IN ('credit', 'withdrawal')),
amount NUMERIC NOT NULL CHECK (amount > 0),
status TEXT NOT NULL DEFAULT 'completed',
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Table: merchant_analytics

CREATE TABLE public.merchant_analytics (
merchant_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
total_sales NUMERIC NOT NULL DEFAULT 0 CHECK (total_sales >= 0),
total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
customer_count INTEGER NOT NULL DEFAULT 0 CHECK (customer_count >= 0)
);

-- 14. Table: logs_audit

CREATE TABLE public.logs_audit (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
event_type TEXT NOT NULL,
actor_id UUID,
payload JSONB,
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================
-- SECTION 2: ACCESS PERMISSIONS & PRIVILEGES
-- =============================================================
-- Grant standard API access permissions to default database client roles

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure default grants apply to any tables created automatically in the future
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- =============================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS) & INITIAL SECURITY POLICIES
-- =============================================================

-- Enable RLS on all tables to ensure platform-level tenant safety
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_audit ENABLE ROW LEVEL SECURITY;

-- RE-CREATE ACADEMIC SPECIFICATION POLICIES:

-- 1. Users policies
CREATE POLICY "Enable read access for all authenticated users"
ON public.users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable update for owners"
ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Enable service role bypass for custom signups"
ON public.users FOR ALL TO service_role USING (true);

-- 2. OTP Requests (Only accessible by backend service role bypassing policies)
CREATE POLICY "Restrict otp visibility to service_role"
ON public.otp_requests FOR ALL TO service_role USING (true);

-- 3. Stores policies
CREATE POLICY "Enable public store read"
ON public.stores FOR SELECT USING (true);

CREATE POLICY "Restrict store modifications to owners"
ON public.stores FOR ALL TO authenticated USING (auth.uid() = merchant_id);

-- 4. Categories policies
CREATE POLICY "Enable public category read"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Restrict category modifications to creator"
ON public.categories FOR ALL TO authenticated USING (auth.uid() = merchant_id);

-- 5. Products policies
CREATE POLICY "Enable public product read for active items"
ON public.products FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "Restrict product modifications to merchant owner"
ON public.products FOR ALL TO authenticated USING (auth.uid() = merchant_id);

-- 6. Cart Items policies
CREATE POLICY "Isolate cart access strictly to owner"
ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 7. Orders policies
CREATE POLICY "Allow customers to access their orders"
ON public.orders FOR SELECT TO authenticated USING (auth.uid() = customer_id);

CREATE POLICY "Allow merchants to access customer orders"
ON public.orders FOR SELECT TO authenticated USING (auth.uid() = merchant_id);

CREATE POLICY "Allow service_role full management"
ON public.orders FOR ALL TO service_role USING (true);

-- 8. Deliveries policies
CREATE POLICY "Participating transactional member access"
ON public.deliveries FOR ALL TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.orders
WHERE orders.id = deliveries.order_id
AND (orders.customer_id = auth.uid() OR orders.merchant_id = auth.uid())
)
);

-- 9. Notifications policies (Controlled strictly by service backend)
CREATE POLICY "Service backend notification read/write"
ON public.notifications FOR ALL TO service_role USING (true);

-- 10. Transactions policies
CREATE POLICY "Billing parties access control"
ON public.transactions FOR SELECT TO authenticated
USING (
EXISTS (
SELECT 1 FROM public.orders
WHERE orders.id = transactions.order_id
AND (orders.customer_id = auth.uid() OR orders.merchant_id = auth.uid())
)
);

-- 11. Wallets policies
CREATE POLICY "Merchant wallet balance access"
ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = merchant_id);

CREATE POLICY "Service backend processing update permissions"
ON public.wallets FOR ALL TO service_role USING (true);

-- 12. Wallet Transactions policies
CREATE POLICY "Isolate trace lookup access to balance owners"
ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = merchant_id);

CREATE POLICY "Service backend wallet logs insertion"
ON public.wallet_transactions FOR ALL TO service_role USING (true);

-- 13. Merchant Analytics policies
CREATE POLICY "Restrict analytics dashboards to store merchants"
ON public.merchant_analytics FOR SELECT TO authenticated USING (auth.uid() = merchant_id);

CREATE POLICY "Service backend updating analytics background computations"
ON public.merchant_analytics FOR ALL TO service_role USING (true);

-- 14. Logs Audit policies (Admins only via backend service role keys)
CREATE POLICY "Administrative audit access"
ON public.logs_audit FOR ALL TO service_role USING (true);

-- =============================================================
-- SECTION 4: REFRESH POSTGREST SCHEMA CACHE MAP
-- =============================================================
NOTIFY pgrst, 'reload schema';