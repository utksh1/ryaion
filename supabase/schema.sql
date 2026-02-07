-- AI Suggestions Table (Keep for backward compatibility or migrate to ai_analysis)
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    change TEXT NOT NULL,
    action TEXT CHECK (action IN ('BUY', 'SELL', 'HOLD')) NOT NULL,
    ai_score INTEGER NOT NULL, -- 0-100 Quality Score
    confidence INTEGER NOT NULL, -- 0-100 Model Certainty
    risk_level TEXT CHECK (risk_level IN ('LOW', 'MED', 'HIGH')) NOT NULL,
    target_price DECIMAL, -- AI predicted target
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Market News Table (Keep for backward compatibility)
CREATE TABLE IF NOT EXISTS public.market_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('POSITIVE', 'NEGATIVE', 'NEUTRAL')) NOT NULL,
    impact_score INTEGER NOT NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 1. Users (Extends Supabase Auth if needed, or standalone profile)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY, -- Link to Supabase Auth
    email TEXT,
    risk_profile TEXT CHECK (risk_profile IN ('low', 'medium', 'high')),
    trading_style TEXT CHECK (trading_style IN ('intraday', 'swing', 'long')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Stocks (Master Table)
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    exchange TEXT,
    sector TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Stock Prices (Time Series)
CREATE TABLE IF NOT EXISTS public.stock_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID REFERENCES public.stocks(id) NOT NULL,
    symbol TEXT NOT NULL, -- Denormalized for easier querying
    price DECIMAL NOT NULL,
    change DECIMAL,
    change_percent DECIMAL,
    open DECIMAL,
    high DECIMAL,
    low DECIMAL,
    close DECIMAL,
    volume BIGINT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Technical Indicators
CREATE TABLE IF NOT EXISTS public.technical_indicators (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID REFERENCES public.stocks(id) NOT NULL,
    timeframe TEXT NOT NULL, -- '1D', '1W', etc.
    rsi DECIMAL,
    macd DECIMAL,
    ema DECIMAL,
    sma DECIMAL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AI Analysis (More formal structure than suggestions)
CREATE TABLE IF NOT EXISTS public.ai_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID REFERENCES public.stocks(id) NOT NULL,
    ai_score INTEGER NOT NULL,
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) NOT NULL,
    confidence DECIMAL NOT NULL,
    horizon TEXT CHECK (horizon IN ('intraday', 'swing', 'long')),
    expected_move DECIMAL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. News Sentiment (Formal structure)
CREATE TABLE IF NOT EXISTS public.news_sentiment (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_id UUID REFERENCES public.stocks(id),
    headline TEXT NOT NULL,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')) NOT NULL,
    impact_score DECIMAL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Stocks Arena (Comparisons)
CREATE TABLE IF NOT EXISTS public.stocks_arena (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stock_a_id UUID REFERENCES public.stocks(id) NOT NULL,
    stock_b_id UUID REFERENCES public.stocks(id) NOT NULL,
    winner_stock_id UUID REFERENCES public.stocks(id),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Watchlists
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    stock_id UUID REFERENCES public.stocks(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, stock_id)
);

-- 9. Paper Trades
CREATE TABLE IF NOT EXISTS public.paper_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    stock_id UUID REFERENCES public.stocks(id) NOT NULL,
    trade_type TEXT CHECK (trade_type IN ('buy', 'sell')) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. AI Performance Logs
CREATE TABLE IF NOT EXISTS public.ai_performance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ai_analysis_id UUID REFERENCES public.ai_analysis(id) NOT NULL,
    actual_move DECIMAL,
    result TEXT CHECK (result IN ('correct', 'incorrect')),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stocks_arena ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (Simplistic for now: Public Read, Auth Write/Read Own)
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read stocks" ON public.stocks FOR SELECT USING (true);
CREATE POLICY "Allow public read stock_prices" ON public.stock_prices FOR SELECT USING (true);
CREATE POLICY "Allow public read ai_analysis" ON public.ai_analysis FOR SELECT USING (true);
CREATE POLICY "Allow public read news_sentiment" ON public.news_sentiment FOR SELECT USING (true);
CREATE POLICY "Allow public read stocks_arena" ON public.stocks_arena FOR SELECT USING (true);
CREATE POLICY "Allow public read watchlists" ON public.watchlists FOR SELECT USING (true);

-- Authenticated users can manage their own data
CREATE POLICY "Users can manage own watchlist" ON public.watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own paper trades" ON public.paper_trades FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol ON public.stock_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_prices_last_updated ON public.stock_prices(last_updated DESC);

