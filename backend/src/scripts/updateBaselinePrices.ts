import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const REAL_PRICES = [
    { symbol: 'RELIANCE', price: 1450.80, change: 7.40, change_percent: '+0.51%' },
    { symbol: 'TCS', price: 2941.60, change: -49.90, change_percent: '-1.67%' },
    { symbol: 'HDFCBANK', price: 941.10, change: 0.10, change_percent: '+0.01%' },
    { symbol: 'INFY', price: 1507.10, change: -13.05, change_percent: '-0.86%' },
    { symbol: 'ICICIBANK', price: 1245.30, change: 8.90, change_percent: '+0.72%' },
    { symbol: 'SBIN', price: 825.40, change: 3.20, change_percent: '+0.39%' },
    { symbol: 'BHARTIARTL', price: 1580.20, change: 15.60, change_percent: '+1.00%' },
    { symbol: 'TATAMOTORS', price: 924.50, change: -2.10, change_percent: '-0.23%' },
    { symbol: 'ZOMATO', price: 283.55, change: -3.30, change_percent: '-1.15%' },
    { symbol: 'ITC', price: 512.30, change: 1.20, change_percent: '+0.23%' }
];

async function updatePrices() {
    console.log("Updating stock prices to real 2026 baseline...");

    for (const stock of REAL_PRICES) {
        const { error } = await supabase
            .from('stock_prices')
            .update({
                price: stock.price,
                change: stock.change,
                change_percent: stock.change_percent,
                last_updated: new Date().toISOString()
            })
            .eq('symbol', stock.symbol);

        if (error) {
            console.error(`Failed to update ${stock.symbol}:`, error.message);
        } else {
            console.log(`✅ Updated ${stock.symbol} to ₹${stock.price}`);
        }
    }
    console.log("Done!");
}

updatePrices();
