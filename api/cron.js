
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const FIREBASE_DB_URL = "https://mcp-backend-bc92f-default-rtdb.asia-southeast1.firebasedatabase.app";
const FIREBASE_SECRET = "7Nakzp6MlLCEg5eoewnj9rZWyHb6Y63y2B9jRQce";

async function fetchStockPrice(symbol) {
    try {
        const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
        // console.log(`Fetching ${symbol}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const priceElement = $('[data-last-price]');
        const price = priceElement.attr('data-last-price') || $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        if (changeMatch) {
            return {
                symbol: symbol,
                price: parseFloat(price.replace(/[₹,]/g, '')) || 0,
                change: parseFloat(changeMatch[1].replace(/,/g, '')),
                changePercent: changeMatch[2],
                exchange: 'NSE',
                timestamp: new Date().toISOString()
            };
        }

        // Fallback logic
        const currentPrice = parseFloat(price.replace(/[₹,]/g, '')) || 0;
        const prevCloseLabel = $('div:contains("Previous close")').last();
        let calculatedChange = 0;
        let calculatedChangePercent = '0%';

        if (prevCloseLabel.length > 0) {
            const prevCloseText = prevCloseLabel.parent().siblings().first().text();
            const prevClose = parseFloat(prevCloseText.replace(/[₹,]/g, '')) || 0;
            if (prevClose > 0 && currentPrice > 0) {
                calculatedChange = currentPrice - prevClose;
                const percent = (calculatedChange / prevClose) * 100;
                calculatedChangePercent = `${calculatedChange >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
            }
        }

        return {
            symbol: symbol,
            price: currentPrice,
            change: parseFloat(calculatedChange.toFixed(2)),
            changePercent: calculatedChangePercent,
            exchange: 'NSE',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return null;
    }
}

async function fetchMarketIndex(indexName) {
    try {
        let url;
        if (indexName === 'NIFTY50' || indexName === 'NIFTY') {
            url = 'https://www.google.com/finance/quote/NIFTY_50:INDEXNSE';
        } else if (indexName === 'SENSEX') {
            url = 'https://www.google.com/finance/quote/SENSEX:INDEXBOM';
        } else {
            return null;
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        const price = $('div.YMlKec.fxKbKc').first().text();
        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        let indexValue = parseFloat(price.replace(/[₹,]/g, '')) || 0;
        let change = 0;
        let changePercent = '0%';

        if (changeMatch) {
            change = parseFloat(changeMatch[1].replace(/,/g, ''));
            changePercent = changeMatch[2];
        } else {
            const prevCloseLabel = $('div:contains("Previous close")').last();
            if (prevCloseLabel.length > 0) {
                const prevCloseText = prevCloseLabel.parent().siblings().first().text();
                const prevClose = parseFloat(prevCloseText.replace(/[₹,]/g, '')) || 0;
                if (prevClose > 0 && indexValue > 0) {
                    change = indexValue - prevClose;
                    const percent = (change / prevClose) * 100;
                    changePercent = `${change >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
                }
            }
        }

        return {
            index: indexName,
            value: indexValue,
            change: parseFloat(change.toFixed(2)),
            changePercent: changePercent,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${indexName}:`, error.message);
        return null;
    }
}

async function handler(request, response) {
    console.log('Starting market data update...');

    const symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'HINDUNILVR', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'ZOMATO', 'PAYTM'];

    const [nifty, sensex, stocks] = await Promise.all([
        fetchMarketIndex('NIFTY50'),
        fetchMarketIndex('SENSEX'),
        Promise.all(symbols.map(s => fetchStockPrice(s)))
    ]);

    const marketData = {
        indices: {
            nifty,
            sensex
        },
        topStocks: stocks.filter(s => s !== null),
        timestamp: new Date().toISOString()
    };

    console.log(`Fetched data. indices: ${Object.keys(marketData.indices).length}, stocks: ${marketData.topStocks.length}`);

    const putUrl = `${FIREBASE_DB_URL}/market.json?auth=${FIREBASE_SECRET}`;

    try {
        console.log(`Writing to: ${FIREBASE_DB_URL}...`);
        const putResponse = await fetch(putUrl, {
            method: 'PUT',
            body: JSON.stringify(marketData),
            headers: { 'Content-Type': 'application/json' }
        });

        if (putResponse.ok) {
            console.log('VICTORY: Data successfully written to Firebase!');
            if (response) response.status(200).json({ success: true, data: marketData });
        } else {
            console.error('FAILURE: Firebase write failed', await putResponse.text());
            if (response) response.status(500).json({ error: 'Failed to write to Firebase' });
        }
    } catch (err) {
        console.error('ERROR:', err);
        if (response) response.status(500).json({ error: err.message });
    }
}

// Self-invocation wrapper for local testing
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    handler(null, {
        status: (code) => ({ json: (data) => console.log(`[Response ${code}]`, data) })
    });
}

export default handler;
