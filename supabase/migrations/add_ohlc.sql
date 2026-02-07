-- Add OHLC columns to stock_prices table
ALTER TABLE public.stock_prices 
ADD COLUMN IF NOT EXISTS "open" DECIMAL,
ADD COLUMN IF NOT EXISTS "high" DECIMAL,
ADD COLUMN IF NOT EXISTS "low" DECIMAL,
ADD COLUMN IF NOT EXISTS "close" DECIMAL;

-- Add index for performance if querying history
CREATE INDEX IF NOT EXISTS idx_stock_prices_open ON public.stock_prices("open");
