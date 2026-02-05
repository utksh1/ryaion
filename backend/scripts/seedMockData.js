const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('../lib/supabase');

const TRACKED_SYMBOLS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'ITC', 'BHARTIARTL', 'TATAMOTORS', 'ZOMATO'
];

const TRACKED_INDICES = ['NIFTY50', 'SENSEX'];

// Base prices for mock data generation (approximate values)
const BASE_PRICES = {
    'RELIANCE': 2500,
    'TCS': 3500,
    'HDFCBANK': 1600,
    'INFY': 1400,
    'ICICIBANK': 950,
    'SBIN': 600,
    'ITC': 450,
    'BHARTIARTL': 900,
    'TATAMOTORS': 650,
    'ZOMATO': 100,
    'NIFTY50': 19500,
    'SENSEX': 65000
};

function generateRandomVariation(basePrice) {
    const variationPercent = (Math.random() * 4 - 2) / 100; // -2% to +2%
    const currentPrice = basePrice * (1 + variationPercent);
    const change = currentPrice - basePrice;

    return {
        price: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: (variationPercent * 100).toFixed(2) + '%'
    };
}

async function seedMockData() {
    console.log('🌱 Seeding mock data...');

    // 1. Seed Indices
    console.log('📊 Seeding Indices...');
    for (const index of TRACKED_INDICES) {
        const base = BASE_PRICES[index] || 10000;
        const data = generateRandomVariation(base);

        const { error } = await supabase
            .from('market_indices')
            .upsert({
                symbol: index,
                value: data.price,
                change: data.change,
                change_percent: data.changePercent,
                last_updated: new Date()
            }, { onConflict: 'symbol' });

        if (error) console.error(`❌ Error seeding ${index}:`, error.message);
        else console.log(`✅ Seeded ${index}: ${data.price}`);
    }

    // 2. Seed Stocks
    console.log('📈 Seeding Stocks...');
    for (const symbol of TRACKED_SYMBOLS) {
        const base = BASE_PRICES[symbol] || 1000;
        const data = generateRandomVariation(base);

        const { error } = await supabase
            .from('stock_prices')
            .upsert({
                symbol: symbol,
                price: data.price,
                change: data.change,
                change_percent: data.changePercent,
                exchange: 'NSE',
                last_updated: new Date()
            }, { onConflict: 'symbol' });

        if (error) console.error(`❌ Error seeding ${symbol}:`, error.message);
        else console.log(`✅ Seeded ${symbol}: ${data.price}`);
    }

    console.log('✨ Mock data seeding complete.');
}

// Run if called directly
if (require.main === module) {
    seedMockData().catch(console.error);
}

module.exports = { seedMockData };
