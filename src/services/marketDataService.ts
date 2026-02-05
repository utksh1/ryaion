
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

        if (error || !data) {
            console.warn("Supabase fetchStock/fetchMultipleStocks failed, using mock data");
            const mock = getMockStocks().find(s => s.symbol === symbol.toUpperCase());
            return mock || null;
        }

        return {
            symbol: data.symbol,
            name: STOCK_NAMES[data.symbol] || data.symbol,
            price: data.price,
            change: data.change,
            changePercent: parseFloat((data.change_percent || '0').replace('%', '')),
            high: data.price,
            low: data.price,
            volume: '0',
            timestamp: data.last_updated
        };
    } catch (err) {
        console.error("Error fetching stock:", symbol, err);
        const mock = getMockStocks().find(s => s.symbol === symbol.toUpperCase());
        return mock || null;
    }
}

// Fetch multiple stocks from Supabase
export async function fetchMultipleStocks(symbols: string[]): Promise<LiveStockData[]> {
    try {
        const { data, error } = await supabase
            .from('stock_prices')
            .select('*')
            .in('symbol', symbols.map(s => s.toUpperCase()));

        if (error || !data || data.length === 0) {
            console.warn("Supabase fetchMultipleStocks failed/empty, using mock data");
            return getMockStocks().filter(s => symbols.includes(s.symbol));
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
        return getMockStocks().filter(s => symbols.includes(s.symbol));
    }
}

// Fetch all tracked stocks
export async function fetchAllStocks(): Promise<LiveStockData[]> {
    try {
        const { data, error } = await supabase.from('stock_prices').select('*');
        if (error || !data || data.length === 0) {
            console.warn("No data from Supabase, using mock data");
            return getMockStocks();
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
        console.error("Fetch failed, using mock data", err);
        return getMockStocks();
    }
}

// Fallback Mock Data
function getMockStocks(): LiveStockData[] {
    return [
        { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2518.54, change: 12.5, changePercent: 0.5, high: 2530, low: 2500, volume: '1.2M', timestamp: new Date().toISOString() },
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3525.96, change: -15.2, changePercent: -0.43, high: 3550, low: 3510, volume: '800K', timestamp: new Date().toISOString() },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1618.79, change: 8.4, changePercent: 0.52, high: 1625, low: 1610, volume: '2.5M', timestamp: new Date().toISOString() },
        { symbol: 'INFY', name: 'Infosys Ltd', price: 1426.76, change: -5.6, changePercent: -0.39, high: 1440, low: 1420, volume: '1.5M', timestamp: new Date().toISOString() },
        { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 961.2, change: 4.1, changePercent: 0.43, high: 965, low: 955, volume: '1.8M', timestamp: new Date().toISOString() },
        { symbol: 'SBIN', name: 'State Bank of India', price: 603.41, change: 2.3, changePercent: 0.38, high: 608, low: 598, volume: '3.2M', timestamp: new Date().toISOString() },
        { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 98.34, change: 1.2, changePercent: 1.23, high: 100, low: 96, volume: '5.5M', timestamp: new Date().toISOString() },
        { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 640.33, change: 5.8, changePercent: 0.91, high: 645, low: 635, volume: '2.1M', timestamp: new Date().toISOString() }
    ];
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
        console.error("Error fetching indices, using mock:", err);
        return getMockIndices();
    }
}

function getMockIndices(): MarketIndex[] {
    return [
        { name: 'NIFTY50', value: 19427, change: 120.5, changePercent: 0.62 },
        { name: 'SENSEX', value: 66170.84, change: 350.2, changePercent: 0.53 }
    ];
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
