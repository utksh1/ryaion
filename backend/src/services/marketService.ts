import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface StockData {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    timestamp: string;
}

// Mock Data as Fallback
const MOCK_STOCKS: StockData[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2450.00, change: 15.00, changePercent: 0.61, volume: 5000000, high: 2460, low: 2440, timestamp: new Date().toISOString() },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3500.00, change: -20.00, changePercent: -0.57, volume: 1200000, high: 3520, low: 3480, timestamp: new Date().toISOString() },
    { symbol: 'INFY', name: 'Infosys Ltd', price: 1420.00, change: -10.00, changePercent: -0.70, volume: 3000000, high: 1435, low: 1410, timestamp: new Date().toISOString() },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1600.00, change: 5.00, changePercent: 0.31, volume: 4500000, high: 1610, low: 1590, timestamp: new Date().toISOString() },
    { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 985.00, change: 25.00, changePercent: 2.6, volume: 8000000, high: 990, low: 960, timestamp: new Date().toISOString() }
];

export const getMarketData = async (): Promise<StockData[]> => {
    try {
        // Try fetching from Supabase 'stock_prices' table
        const { data, error } = await supabase.from('stock_prices').select('*');

        if (!error && data && data.length > 0) {
            return data.map((d: any) => ({
                symbol: d.symbol,
                name: d.symbol, // We could join with 'stocks' table for names, but for now symbol is fine
                price: d.price,
                change: d.change,
                changePercent: parseFloat((d.change_percent || '0').replace('%', '')),
                volume: d.volume || 0,
                high: d.high || d.price,
                low: d.low || d.price,
                timestamp: d.last_updated
            }));
        }

        console.warn("Supabase empty/error, falling back to Mock");
        return MOCK_STOCKS.map(s => ({
            ...s,
            price: s.price + (Math.random() * 10 - 5), // Add some jitter
            timestamp: new Date().toISOString()
        }));

    } catch (error) {
        console.error("Error fetching market data:", error);
        return MOCK_STOCKS;
    }
};

export const fetchLiveStock = async (symbol: string): Promise<StockData | null> => {
    const data = await getMarketData();
    const stock = data.find(s => s.symbol === symbol.toUpperCase());

    if (stock) return stock;

    // Fallback if not in mock data
    return {
        symbol: symbol.toUpperCase(),
        price: 1000 + Math.random() * 100,
        change: 10,
        changePercent: 1.0,
        volume: 100000,
        high: 1050,
        low: 990,
        timestamp: new Date().toISOString()
    };
};

export const fetchMarketIndices = async () => {
    return [
        { name: "NIFTY 50", value: 19800 + Math.random() * 100, change: 0.5 },
        { name: "SENSEX", value: 66000 + Math.random() * 200, change: 0.4 }
    ];
};

export const fetchStockHistory = async (symbol: string, limit: number = 50): Promise<any[]> => {
    try {
        console.log(`📈 Fetching real history for ${symbol} from Yahoo Finance...`);
        const yahooSymbol = `${symbol.toUpperCase()}.NS`;
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=5d&interval=30m`);

        if (!response.ok) {
            console.error(`Yahoo History API failed: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        const result = data.chart?.result?.[0];

        if (!result || !result.timestamp) {
            console.warn(`No history found for ${symbol}`);
            return [];
        }

        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];

        // Map Yahoo format to our Candle format
        const candles = timestamps.map((t: number, i: number) => ({
            t: new Date(t * 1000).toISOString(),
            o: quotes.open[i] || quotes.close[i],
            h: quotes.high[i] || quotes.close[i],
            l: quotes.low[i] || quotes.close[i],
            c: quotes.close[i],
            v: quotes.volume[i] || 0
        })).filter((c: any) => c.c !== null); // Filter out any null price points

        return candles.slice(-limit); // Return last N records
    } catch (err) {
        console.error(`Error fetching history for ${symbol}:`, err);
        return [];
    }
};
