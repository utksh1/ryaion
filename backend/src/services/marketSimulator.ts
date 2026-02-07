import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const UPDATE_INTERVAL_MS = 30000; // 30 seconds for real data sync

const TICKERS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'BHARTIARTL', 'TATAMOTORS', 'ZOMATO', 'ITC'
];

export const startMarketSimulation = (io: Server) => {
    console.log("🚀 Starting Real-Time Market Sync (Fetching from Yahoo Finance)...");

    // Initial sync
    updateMarketPrices(io);

    // Regular sync
    setInterval(() => updateMarketPrices(io), UPDATE_INTERVAL_MS);
};

const INDICES = [
    { symbol: '^NSEI', name: 'NIFTY 50' },
    { symbol: '^BSESN', name: 'SENSEX' },
    { symbol: '^NSEBANK', name: 'NIFTY BANK' }
];

const updateMarketPrices = async (io: Server) => {
    try {
        console.log("🔄 Fetching live data from Yahoo Finance...");

        // 1. Update Stocks
        const stockUpdates = await Promise.all(TICKERS.map(async (symbol) => {
            try {
                const yahooSymbol = `${symbol}.NS`;
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`);
                if (!response.ok) return null;
                const data = await response.json();
                const meta = data.chart?.result?.[0]?.meta;
                if (!meta) return null;

                const price = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose;
                const change = price - prevClose;
                const changePct = (change / prevClose) * 100;

                return {
                    symbol: symbol,
                    price: parseFloat(price.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    change_percent: changePct.toFixed(2) + '%',
                    exchange: "NSE",
                    last_updated: new Date().toISOString()
                };
            } catch (err) {
                return null;
            }
        }));

        // 2. Update Indices
        const indexUpdates = await Promise.all(INDICES.map(async (index) => {
            try {
                const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${index.symbol}`);
                if (!response.ok) return null;
                const data = await response.json();
                const meta = data.chart?.result?.[0]?.meta;
                if (!meta) return null;

                const price = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose;
                const change = price - prevClose;
                const changePct = (change / prevClose) * 100;

                return {
                    symbol: index.name, // Save as 'NIFTY 50', etc.
                    value: parseFloat(price.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    change_percent: changePct.toFixed(2) + '%',
                    last_updated: new Date().toISOString()
                };
            } catch (err) {
                return null;
            }
        }));

        const validStocks = stockUpdates.filter(Boolean);
        const validIndices = indexUpdates.filter(Boolean);

        // Broadcast & Save Stocks
        if (validStocks.length > 0) {
            validStocks.forEach(stock => io.emit('price_update', stock));
            await supabase.from('stock_prices').upsert(validStocks, { onConflict: 'symbol' });
        }

        // Save Indices
        if (validIndices.length > 0) {
            await supabase.from('market_indices').upsert(validIndices, { onConflict: 'symbol' });
        }

        console.log(`✅ Sync Complete: ${validStocks.length} stocks, ${validIndices.length} indices.`);
    } catch (err) {
        console.error("❌ Market Sync Exception:", err);
    }
};
