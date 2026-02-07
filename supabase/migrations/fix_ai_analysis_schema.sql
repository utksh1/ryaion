-- Drop the mismatched table if it exists (from schema.sql)
DROP TABLE IF EXISTS public.ai_analysis CASCADE;

-- Create AI Analysis Table (Correct Version with Symbol)
CREATE TABLE public.ai_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    score INTEGER NOT NULL, -- 0 to 100
    sentiment TEXT NOT NULL, -- BULLISH, BEARISH, NEUTRAL
    confidence INTEGER NOT NULL, -- 0 to 100
    summary TEXT, -- Short reason/summary
    reasons TEXT[], -- Array of detailed reasons
    indicators JSONB, -- Store snapshot of RSI, MACD, etc. used for this analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(symbol)
);

-- Add index for quick lookup by symbol
CREATE INDEX IF NOT EXISTS idx_ai_analysis_symbol ON public.ai_analysis(symbol);

-- Add index for sorting by time
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON public.ai_analysis(created_at DESC);
