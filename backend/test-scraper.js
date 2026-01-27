
const { fetchStockPrice } = require('./lib/scraper');

async function test() {
    console.log("Testing FIXED scraper...");

    // Test a stock (Reliance)
    const reliance = await fetchStockPrice('RELIANCE');
    console.log("RELIANCE:", reliance);

    // Test a stock with positive change (check logic)
    // We can't guarantee market state, but let's check basic parsing
    const zomato = await fetchStockPrice('ZOMATO');
    console.log("ZOMATO:", zomato);
}

test();
