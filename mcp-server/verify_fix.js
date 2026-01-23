
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Copy of the fixed function from index.js
async function fetchStockPrice(symbol) {
    try {
        const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
        // console.log(`Fetching ${url}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract price data
        const priceElement = $('[data-last-price]');
        const price = priceElement.attr('data-last-price') || $('div.YMlKec.fxKbKc').first().text();

        const changeElement = $('div.JwB6zf');
        const changeText = changeElement.first().text() || '';

        // Parse change values
        const changeMatch = changeText.match(/([\+\-]?[\d,\.]+)\s*\(([\+\-]?[\d\.]+%)\)/);

        if (changeMatch) {
            return {
                symbol: symbol,
                price: parseFloat(price.replace(/[₹,]/g, '')) || 0,
                change: parseFloat(changeMatch[1].replace(/,/g, '')),
                changePercent: changeMatch[2],
                method: 'direct_parse'
            };
        }

        // Fallback: Calculate from Previous Close
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
            method: 'calculated_fallback'
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return { error: error.message };
    }
}

async function main() {
    console.log('Verifying scraper fix on live data...');
    const result = await fetchStockPrice('RELIANCE');
    console.log(JSON.stringify(result, null, 2));
}

main();
