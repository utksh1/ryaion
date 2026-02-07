const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log("Loading env from:", envPath);
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "Found" : "Missing");
console.log("Supabase Key:", supabaseKey ? "Found" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    try {
        console.log("Fetching stocks...");
        const { data: stocks, error } = await supabase.from('stock_prices').select('*');
        if (error) {
            console.error("Fetch Error:", error);
            return;
        }
        console.log(`Fetched ${stocks.length} stocks.`);

        if (stocks.length === 0) {
            console.warn("No stocks found!");
            return;
        }

        const updates = stocks.map(stock => ({
            ...stock,
            price: stock.price + 1, // Force +1 change
            last_updated: new Date().toISOString()
        }));

        console.log("Updating stocks...");
        const { error: updateError } = await supabase.from('stock_prices').upsert(updates);

        if (updateError) {
            console.error("Update Error:", updateError);
        } else {
            console.log("✅ Successfully updated stocks.");
        }

    } catch (err) {
        console.error("Exception:", err);
    }
}

testUpdate();
