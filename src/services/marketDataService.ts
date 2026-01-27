
import { supabase } from '../lib/supabaseClient';

export interface LiveStockData {
    symbol: string;
    name: string; // We might need to map this if it's not in DB
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: string;
    timestamp: string;
}

export interface MarketIndex {
    name: string;
    value: number;
    change: number;
    changePercent: number;
}

// Map symbols to full names (DB only stores symbols)
const STOCK_NAMES: Record<string, string> = {
    'RELIANCE': 'Reliance Industries',
    'TCS': 'Tata Consultancy Services',
    'HDFCBANK': 'HDFC Bank',
    'INFY': 'Infosys Ltd',
    'ICICIBANK': 'ICICI Bank',
    'TATAMOTORS': 'Tata Motors',
    'ZOMATO': 'Zomato Ltd',
    'WIPRO': 'Wipro Ltd',
    'SBIN': 'State Bank of India',
    'BHARTIARTL': 'Bharti Airtel',
    'ITC': 'ITC Limited'
};

// Fetch live stock from Supabase
export async function fetchLiveStock(symbol: string): Promise<LiveStockData | null> {
    try {
        const { data, error } = await supabase
            .from('stock_prices')
            .select('*')
            .eq('symbol', symbol.toUpperCase())
            .single();

        if (error || !data) return null;

        return {
            symbol: data.symbol,
            name: STOCK_NAMES[data.symbol] || data.symbol,
            price: data.price,
            change: data.change,
            changePercent: parseFloat((data.change_percent || '0').replace('%', '')),
            high: data.price, // DB doesn't have high/low yet
            low: data.price,  // DB doesn't have high/low yet
            volume: '0',      // DB doesn't have volume yet
            timestamp: data.last_updated
        };
    } catch (err) {
        console.error("Error fetching stock:", symbol, err);
        return null;
    }
}

// Fetch multiple stocks from Supabase
export async function fetchMultipleStocks(symbols: string[]): Promise<LiveStockData[]> {
    try {
        const { data, error } = await supabase
            .from('stock_prices')
            .select('*')
            .in('symbol', symbols.map(s => s.toUpperCase()));

        if (error || !data) {
            console.error("Supabase stock fetch error:", error);
            return [];
        }

        return data.map((d: any) => ({
            symbol: d.symbol,
            name: STOCK_NAMES[d.symbol] || d.symbol,
            price: d.price,
            change: d.change,
            changePercent: parseFloat((d.change_percent || '0').replace('%', '')),
            high: d.price,
            low: d.price,
            volume: '0',
            timestamp: d.last_updated
        }));
    } catch (err) {
        console.error("Error fetching stocks:", err);
        return [];
    }
}

// Fetch all tracked stocks
export async function fetchAllStocks(): Promise<LiveStockData[]> {
    try {
        const { data, error } = await supabase.from('stock_prices').select('*');
        if (error || !data) return [];

        return data.map((d: any) => ({
            symbol: d.symbol,
            name: STOCK_NAMES[d.symbol] || d.symbol,
            price: d.price,
            change: d.change,
            changePercent: parseFloat((d.change_percent || '0').replace('%', '')),
            high: d.price,
            low: d.price,
            volume: '0',
            timestamp: d.last_updated
        }));
    } catch (err) {
        return [];
    }
}

// Fetch market indices from Supabase
export async function fetchMarketIndices(): Promise<MarketIndex[]> {
    try {
        const { data, error } = await supabase
            .from('market_indices')
            .select('*');

        if (error || !data) {
            console.error("Supabase index fetch error:", error);
            return [];
        }

        return data.map((d: any) => ({
            name: d.symbol, // We stored 'NIFTY50' in 'symbol' column
            value: d.value,
            change: d.change,
            changePercent: parseFloat((d.change_percent || '0').replace('%', ''))
        }));
    } catch (err) {
        console.error("Error fetching indices:", err);
        return [];
    }
}


// Get market context for AI
export async function getMarketContext(): Promise<string> {
    const [indices, stocks] = await Promise.all([
        fetchMarketIndices(),
        fetchMultipleStocks(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS'])
    ]);

    const indexContext = indices
        .map(i => `${i.name}: ${i.value.toLocaleString()} (${i.change >= 0 ? '+' : ''}${i.changePercent}%)`)
        .join(', ');

    const stockContext = stocks
        .map(s => `${s.symbol}: ₹${s.price} (${s.change >= 0 ? '+' : ''}${s.changePercent}%)`)
        .join(', ');

    return `Current Market Data:
Indices: ${indexContext}
Top Stocks: ${stockContext}
Timestamp: ${new Date().toLocaleTimeString('en-IN')} IST`;
}

// Calculate sentiment
export function calculateMarketSentiment(stocks: LiveStockData[]): {
    label: string;
    value: number;
    trend: 'bullish' | 'bearish' | 'neutral';
} {
    if (stocks.length === 0) {
        return { label: 'LOADING...', value: 50, trend: 'neutral' };
    }

    const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;

    if (avgChange > 1) {
        return { label: 'BULLISH MOMENTUM', value: Math.min(95, 75 + avgChange * 5), trend: 'bullish' };
    } else if (avgChange > 0) {
        return { label: 'MILD OPTIMISM', value: 55 + avgChange * 10, trend: 'bullish' };
    } else if (avgChange > -1) {
        return { label: 'NEUTRAL DRIFT', value: 45 + avgChange * 10, trend: 'neutral' };
    } else {
        return { label: 'BEARISH PRESSURE', value: Math.max(10, 45 + avgChange * 5), trend: 'bearish' };
    }
}
