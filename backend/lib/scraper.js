const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Stock symbols mapping (NSE) - for reference
const STOCK_SYMBOLS = {
    'RELIANCE': 'RELIANCE',
    'TCS': 'TCS',
    'HDFCBANK': 'HDFCBANK',
    'INFY': 'INFY',
    'ICICIBANK': 'ICICIBANK',
    'HINDUNILVR': 'HINDUNILVR',
    'SBIN': 'SBIN',
    'BHARTIARTL': 'BHARTIARTL',
    'ITC': 'ITC',
    'KOTAKBANK': 'KOTAKBANK',
    'LT': 'LT',
    'AXISBANK': 'AXISBANK',
    'ASIANPAINT': 'ASIANPAINT',
    'MARUTI': 'MARUTI',
    'SUNPHARMA': 'SUNPHARMA',
    'TATAMOTORS': 'TATAMOTORS',
    'TATASTEEL': 'TATASTEEL',
    'WIPRO': 'WIPRO',
    'ZOMATO': 'ZOMATO',
    'PAYTM': 'PAYTM'
};

async function fetchStockPrice(symbol) {
    try {
        const cleanSymbol = symbol.toUpperCase().replace(':NSE', '');
        // Use Google Finance URL
        const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36' }
        });

        if (!response.ok) {
            console.error(`Status ${response.status} for ${symbol}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // 1. Get Price
        // Class 'YMlKec' is the main big price number
        const priceText = $('.YMlKec.fxKbKc').first().text();
        const price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;

        // 2. Get Change & Change Percent
        // Iterate all JwB6zf/P2Luy/jU41ci to find the "Main" change.
        // Usually the first one that looks like a number or % is the main stock's change.

        let change = 0;
        let changePercent = 0;

        const candidates = [];
        $('.JwB6zf, .P2Luy, .jU41ci').each((i, el) => {
            candidates.push($(el).text().trim());
        });

        // Strategy: Find first element with "%". 
        // Then check if the one before it is a number (absolute change).
        // Or checks if the element itself contains both (old format).

        const percentIndex = candidates.findIndex(t => t.includes('%') && t.length < 20); // Length check to avoid massive parent divs

        if (percentIndex !== -1) {
            const pText = candidates[percentIndex];

            // Case A: "(1.23%)"
            const matchA = pText.match(/\(([\+\-]?[\d\.]+)%\)/);
            // Case B: "1.23%"
            const matchB = pText.match(/([\+\-]?[\d\.]+)%/);

            if (matchA) changePercent = parseFloat(matchA[1]);
            else if (matchB) changePercent = parseFloat(matchB[1]);

            // Adjust sign if text explicitly has '-'
            if (pText.includes('-') && changePercent > 0) changePercent = -changePercent;

            // Absolute Change
            // Often it is the element immediately preceding the percent in the DOM (but we have flattened list)
            // Actually, in the list of candidates, it usually appears before.
            if (percentIndex > 0) {
                const prevText = candidates[percentIndex - 1];
                // Check if it looks like a number e.g. "+12.34" or "12.34"
                const absMatch = prevText.match(/([\+\-]?[\d,\.]+)/);
                if (absMatch && !prevText.includes('%')) {
                    change = parseFloat(absMatch[1].replace(/,/g, ''));
                }
            }

            // Fallback: If no previous absolute change found, maybe they are in same string
            if (change === 0) {
                const combinedMatch = pText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+)%\)/);
                if (combinedMatch) {
                    change = parseFloat(combinedMatch[1].replace(/,/g, ''));
                }
            }
        }

        return {
            symbol: cleanSymbol,
            price: price,
            change: change,
            changePercent: changePercent.toFixed(2) + '%', // Store as string with % for UI compatibility
            exchange: 'NSE',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return { symbol, price: 0, change: 0, changePercent: '0%', error: error.message };
    }
}

async function fetchMarketIndex(indexName) {
    try {
        let url;
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

        const html = await response.text();
        const $ = cheerio.load(html);

        const priceText = $('.YMlKec.fxKbKc').first().text();
        const price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;

        let change = 0;
        let changePercent = 0;

        const candidates = [];
        $('.JwB6zf, .P2Luy, .jU41ci').each((i, el) => {
            candidates.push($(el).text().trim());
        });

        const percentIndex = candidates.findIndex(t => t.includes('%') && t.length < 20);

        if (percentIndex !== -1) {
            const pText = candidates[percentIndex];
            const matchA = pText.match(/\(([\+\-]?[\d\.]+)%\)/);
            const matchB = pText.match(/([\+\-]?[\d\.]+)%/);

            if (matchA) changePercent = parseFloat(matchA[1]);
            else if (matchB) changePercent = parseFloat(matchB[1]);

            if (pText.includes('-') && changePercent > 0) changePercent = -changePercent;

            if (percentIndex > 0) {
                const prevText = candidates[percentIndex - 1];
                const absMatch = prevText.match(/([\+\-]?[\d,\.]+)/);
                if (absMatch && !prevText.includes('%')) {
                    change = parseFloat(absMatch[1].replace(/,/g, ''));
                }
            }
            if (change === 0) {
                const combinedMatch = pText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+)%\)/);
                if (combinedMatch) {
                    change = parseFloat(combinedMatch[1].replace(/,/g, ''));
                }
            }
        }

        return {
            index: cleanIndex,
            value: price,
            change: change,
            changePercent: changePercent.toFixed(2) + '%',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${indexName}:`, error.message);
        return { index: indexName, value: 0, change: 0, changePercent: '0%', error: error.message };
    }
}

async function fetchMultipleStocks(symbols) {
    // Sequential fetching to avoid rate limits
    const results = [];
    for (const symbol of symbols) {
        const data = await fetchStockPrice(symbol);
        if (data) results.push(data);
        // Small delay
        await new Promise(r => setTimeout(r, 500));
    }
    return results;
}

module.exports = {
    fetchStockPrice,
    fetchMarketIndex,
    fetchMultipleStocks,
    STOCK_SYMBOLS
};
