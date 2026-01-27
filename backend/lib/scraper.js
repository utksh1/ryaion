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
        // Remove :NSE suffix if present, as it's added in the URL construction
        const cleanSymbol = symbol.toUpperCase().replace(':NSE', '');
        const url = `https://www.google.com/finance/quote/${cleanSymbol}:NSE`;

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const priceElement = $('[data-last-price]');
        const price = priceElement.attr('data-last-price') || $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        return {
            symbol: cleanSymbol,
            price: parseFloat(price.replace(/[₹,]/g, '')) || 0,
            change: changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0,
            changePercent: changeMatch ? changeMatch[2] : '0%',
            exchange: 'NSE',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return { symbol, error: error.message };
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
            throw new Error('Unknown index');
        }

        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        const price = $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        return {
            index: cleanIndex,
            value: parseFloat(price.replace(/[₹,]/g, '')) || 0,
            change: changeMatch ? parseFloat(changeMatch[1].replace(/,/g, '')) : 0,
            changePercent: changeMatch ? changeMatch[2] : '0%',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${indexName}:`, error.message);
        return { index: indexName, error: error.message };
    }
}

async function fetchMultipleStocks(symbols) {
    return Promise.all(symbols.map(symbol => fetchStockPrice(symbol)));
}

module.exports = {
    fetchStockPrice,
    fetchMarketIndex,
    fetchMultipleStocks,
    STOCK_SYMBOLS
};
