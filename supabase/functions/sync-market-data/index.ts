// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid stock symbols to track
const STOCK_SYMBOLS = [
    'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK',
    'SBIN', 'ITC', 'BHARTIARTL', 'TATAMOTORS', 'ZOMATO'
];

// Helper: Scrape specific stock
async function fetchStockPrice(symbol: string) {
    try {
        const cleanSymbol = symbol.toUpperCase().replace(':NSE', '');
        const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        const priceElement = $('[data-last-price]');
        const priceText = priceElement.attr('data-last-price') || $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        const price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;

        return {
            symbol: cleanSymbol,
            price: price,
            change: changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0,
            changePercent: changeMatch ? changeMatch[2] : '0%',
            exchange: 'NSE',
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return null;
    }
}

// Helper: Scrape Market Index
async function fetchMarketIndex(indexName: string) {
    try {
        let url = '';
        const cleanIndex = indexName.toUpperCase();
        if (cleanIndex === 'NIFTY50' || cleanIndex === 'NIFTY') {
            url = 'https://www.google.com/finance/quote/NIFTY_50:INDEXNSE';
        } else if (cleanIndex === 'SENSEX') {
            url = 'https://www.google.com/finance/quote/SENSEX:INDEXBOM';
        } else {
            return null;
        }

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const price = $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        return {
            symbol: cleanIndex,
            value: parseFloat(price.replace(/[₹,]/g, '')) || 0,
            change: changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0,
            changePercent: changeMatch ? changeMatch[2] : '0%',
        };
    } catch (error) {
        console.error(`Error fetching index ${indexName}:`, error.message);
        return null;
    }
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client
        // Auth is automatically handled by the edge function runtime via Deno.env
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const results = [];

        // 1. Sync Indices (NIFTY/SENSEX)
        const INDICES = ['NIFTY50', 'SENSEX'];
        for (const index of INDICES) {
            const data = await fetchMarketIndex(index);

            if (data) {
                const { error } = await supabaseClient
                    .from('market_indices')
                    .upsert({
                        symbol: data.symbol,
                        value: data.value,
                        change: data.change,
                        change_percent: data.changePercent,
                        last_updated: new Date()
                    }, { onConflict: 'symbol' });

                if (error) {
                    console.error(`DB Update Error for ${index}:`, error);
                    results.push({ symbol: index, status: 'failed_db', error: error.message });
                } else {
                    results.push({ symbol: index, price: data.value, status: 'updated' });
                }
            }
        }

        // 2. Sync Stocks
        for (const symbol of STOCK_SYMBOLS) {
            const data = await fetchStockPrice(symbol);

            if (data) {
                const { error } = await supabaseClient
                    .from('stock_prices')
                    .upsert({
                        symbol: data.symbol,
                        price: data.price,
                        change: data.change,
                        change_percent: data.changePercent,
                        exchange: data.exchange,
                        last_updated: new Date()
                    }, { onConflict: 'symbol' });

                if (error) {
                    console.error(`DB Update Error for ${symbol}:`, error);
                    results.push({ symbol: symbol, status: 'failed_db', error: error.message });
                } else {
                    results.push({ symbol: data.symbol, price: data.price, status: 'updated' });
                }
            } else {
                results.push({ symbol: symbol, status: 'failed_scrape' });
            }
        }

        return new Response(
            JSON.stringify({ success: true, results }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        );
    }
});
