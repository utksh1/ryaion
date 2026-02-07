import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

    // 2. Seed Stocks & Prices (Relational)
    console.log('📈 Seeding Stocks & Prices...');

    // 2a. Seed Master 'stocks' table
    const stockMap = new Map(); // Symbol -> UUID

    for (const symbol of TRACKED_SYMBOLS) {
        const { data: stockData, error: stockError } = await supabase
            .from('stocks')
            .upsert({
                symbol: symbol,
                name: symbol, // In real app, map to full name
                exchange: 'NSE',
                sector: 'Technology' // Placeholder
            }, { onConflict: 'symbol' })
            .select() // Return data so we get the ID
            .single();

        if (stockError) {
            console.error(`❌ Error seeding stock master ${symbol}:`, stockError.message);
        } else if (stockData) {
            stockMap.set(symbol, stockData.id);
        }
    }

    // 2b. Seed 'stock_prices' (Time Series / Latest)
    // Note: Schema defines stock_prices as time-series. For seeding "latest", we just insert one recent record.
    for (const symbol of TRACKED_SYMBOLS) {
        const stockId = stockMap.get(symbol);
        if (!stockId) {
            console.warn(`⚠️ Skipping price for ${symbol} (No Stock ID)`);
            continue;
        }

        const base = BASE_PRICES[symbol] || 1000;
        const data = generateRandomVariation(base);

        const { error } = await supabase
            .from('stock_prices')
            .upsert({
                stock_id: stockId, // FK
                symbol: symbol,
                price: data.price,
                change: data.change,
                change_percent: parseFloat(data.changePercent.replace('%', '')),
                open: data.price * 0.99,
                high: data.price * 1.01,
                low: data.price * 0.98,
                close: data.price,
                volume: Math.floor(Math.random() * 1000000),
                last_updated: new Date()
            }, { onConflict: 'symbol' }); // Assuming we want one "latest" row for this mock script. 
        // If stock_prices is truly history, we might remove onConflict or use a composite key (stock_id, timestamp).
        // But for the app to show "latest", upserting on symbol (if unique index exists) is convenient.
        // My schema added `idx_stock_prices_symbol` but not UNIQUE constraint.
        // So UPSERT might fail if no unique constraint or just INSERT duplicates.
        // Let's check schema: `id` is PK. No unique on symbol.
        // So `upsert` with `onConflict: symbol` FAILs if `symbol` is not unique/constraint.
        // I should just INSERT for history, OR delete previous for "mocking current state".
        // To keep it clean for the user seeing "current" state, I'll delete old first.

        if (error) {
            // If onConflict fails because no constraint, we might need another strategy.
            // For now, let's catch it.
            console.error(`❌ Error seeding price ${symbol}:`, error.message);
            // Fallback: Delete and Insert
            await supabase.from('stock_prices').delete().eq('symbol', symbol);
            await supabase.from('stock_prices').insert({
                stock_id: stockId,
                symbol: symbol,
                price: data.price,
                change: data.change,
                change_percent: parseFloat(data.changePercent.replace('%', '')),
                last_updated: new Date()
            });
        } else {
            console.log(`✅ Seeded price for ${symbol}: ${data.price}`);
        }
    }

    // 3. Seed AI Suggestions
    console.log('🤖 Seeding AI Suggestions...');
    const suggestions = [
        {
            symbol: 'TATAMOTORS',
            name: 'Tata Motors Ltd',
            price: '₹985.40',
            change: '+2.5%',
            action: 'BUY',
            ai_score: 92,
            confidence: 88,
            risk_level: 'MED',
            target_price: 1100.00,
            reason: 'Strong EV sales growth and breakout pattern observed on weekly charts. Momentum indicators show bullish divergence.'
        },
        {
            symbol: 'INFY',
            name: 'Infosys Ltd',
            price: '₹1,420.00',
            change: '-1.2%',
            action: 'HOLD',
            ai_score: 60,
            confidence: 65,
            risk_level: 'LOW',
            target_price: 1450.00,
            reason: 'Consolidating near support levels. Waiting for Q3 results guidance before aggressive entry.'
        },
        {
            symbol: 'ADANIENT',
            name: 'Adani Enterprises',
            price: '₹3,150.75',
            change: '-4.8%',
            action: 'SELL',
            ai_score: 35,
            confidence: 72,
            risk_level: 'HIGH',
            target_price: 2800.00,
            reason: 'Negative news flow impacting sentiment. Technical breakdown below 50-day EMA suggests potential downside.'
        }
    ];

    // Clear existing suggestions first to avoid duplicates/stale data
    await supabase.from('ai_suggestions').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    const { error: suggestionError } = await supabase.from('ai_suggestions').insert(suggestions);
    if (suggestionError) console.error('❌ Error seeding suggestions:', suggestionError.message);
    else console.log(`✅ Seeded ${suggestions.length} AI suggestions`);


    // 4. Seed Market News
    console.log('📰 Seeding Market News...');
    const news = [
        {
            title: 'RBI likely to keep repo rate unchanged in upcoming policy meet',
            source: 'Economic Times',
            published_at: new Date(Date.now() - 10 * 60000).toISOString(), // 10 mins ago
            sentiment: 'NEUTRAL',
            impact_score: 50,
            url: '#'
        },
        {
            title: 'Tata Motors Q3 profit jumps 120% on strong JLR sales',
            source: 'Moneycontrol',
            published_at: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
            sentiment: 'POSITIVE',
            impact_score: 92,
            url: '#'
        },
        {
            title: 'Global tech stocks slide as inflation fears resurface',
            source: 'Bloomberg',
            published_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
            sentiment: 'NEGATIVE',
            impact_score: 75,
            url: '#'
        }
    ];

    // Clear existing news
    await supabase.from('market_news').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error: newsError } = await supabase.from('market_news').insert(news);
    if (newsError) console.error('❌ Error seeding news:', newsError.message);
    else console.log(`✅ Seeded ${news.length} news items`);

    console.log('✨ Mock data seeding complete.');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedMockData().catch(console.error);
}

export { seedMockData };
