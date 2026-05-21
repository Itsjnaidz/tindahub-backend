-- Supabase/Postgres schema for TindaHub backend

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  phone text UNIQUE NOT NULL,
  name text,
  email text,
  role text DEFAULT 'customer',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS otp_requests (
  phone text PRIMARY KEY,
  otp text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  address text NOT NULL,
  contact_phone text NOT NULL,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image text,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY,
  customer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  shipping_address jsonb NOT NULL,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivery_status text DEFAULT 'pending',
  cancellation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number text NOT NULL,
  carrier text NOT NULL,
  estimated_delivery timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY,
  type text NOT NULL,
  recipient text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  reference text,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now()
);
