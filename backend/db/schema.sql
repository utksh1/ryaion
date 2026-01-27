-- Create a table for Stock Prices
create table if not exists stock_prices (
  id uuid default uuid_generate_v4() primary key,
  symbol text not null unique,
  price numeric,
  change numeric,
  change_percent text,
  exchange text,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- Create a table for Market Indices (Nifty, Sensex)
create table if not exists market_indices (
  id uuid default uuid_generate_v4() primary key,
  symbol text not null unique, -- using 'symbol' to store index name like 'NIFTY50'
  value numeric,
  change numeric,
  change_percent text,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table stock_prices enable row level security;
alter table market_indices enable row level security;

-- Policy: Allow anonymous users to SELECT (read) data
create policy "Public can read stock prices" 
  on stock_prices for select 
  using ( true );

create policy "Public can read market indices" 
  on market_indices for select 
  using ( true );

-- Policy: Allow Service Role (Backend) to INSERT/UPDATE (write) data
-- The service_role key bypasses RLS automatically, but explicit policies can be safer in some setups.
-- For standard Supabase setup, service_role bypasses RLS, so write policies for it aren't strictly mandatory if RLS is on.
-- However, we MUST ensure no random public user can write.
