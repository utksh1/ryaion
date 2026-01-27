/**
 * Market Data Synchronization Service
 * 
 * Scrapes live stock data and updates the Supabase database.
 * This can be run as a cron job or triggered manually.
 */


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { supabase } = require('../lib/supabase');
const { fetchStockPrice, fetchMarketIndex, STOCK_SYMBOLS } = require('../lib/scraper');

// List of symbols to track (you can expand this list)
// Using object keys from our constant or defining a specific monitoring list
const TRACKED_SYMBOLS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'ITC', 'BHARTIARTL', 'TATAMOTORS', 'ZOMATO'
];

const TRACKED_INDICES = ['NIFTY50', 'SENSEX'];

async function syncMarketData() {
    console.log(`[${new Date().toISOString()}] Starting market data sync...`);

    // 1. Sync Indices
    for (const indexName of TRACKED_INDICES) {
        try {
            console.log(`Fetching index: ${indexName}...`);
            const data = await fetchMarketIndex(indexName);

            if (data.error) {
                console.error(`Failed to scrape ${indexName}: ${data.error}`);
                continue;
            }

            // Upsert into Supabase
            const { error } = await supabase
                .from('market_indices')
                .upsert({
                    symbol: indexName, // Using 'symbol' column for index name for consistency or strictly use 'index_name'
                    value: data.value,
                    change: data.change,
                    change_percent: data.changePercent,
                    last_updated: new Date()
                }, { onConflict: 'symbol' }); // Assumption: 'symbol' is the unique key

            if (error) console.error(`Supabase error for ${indexName}:`, error.message);
            else console.log(`Updated ${indexName}: ${data.value}`);

        } catch (err) {
            console.error(`Unexpected error for ${indexName}:`, err);
        }
    }

    // 2. Sync Stocks
    for (const symbol of TRACKED_SYMBOLS) {
        try {
            console.log(`Fetching stock: ${symbol}...`);
            const data = await fetchStockPrice(symbol);

            if (data.error) {
                console.error(`Failed to scrape ${symbol}: ${data.error}`);
                continue;
            }

            // Upsert into Supabase
            const { error } = await supabase
                .from('stock_prices')
                .upsert({
                    symbol: data.symbol,
                    price: data.price,
                    change: data.change,
                    change_percent: data.changePercent,
                    exchange: data.exchange,
                    last_updated: new Date()
                }, { onConflict: 'symbol' });

            if (error) console.error(`Supabase error for ${symbol}:`, error.message);
            else console.log(`Updated ${symbol}: ${data.price}`);

        } catch (err) {
            console.error(`Unexpected error for ${symbol}:`, err);
        }
    }

    console.log(`[${new Date().toISOString()}] Sync complete.`);
}

// Run immediately if called directly
if (require.main === module) {
    syncMarketData()
        .then(() => process.exit(0))
        .catch(err => {
            console.error("Fatal error:", err);
            process.exit(1);
        });
}

module.exports = { syncMarketData };
