
const { fetchStockPrice } = require('./lib/scraper');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function test() {
    const url = `https://www.google.com/finance/quote/500570:BOM`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const $ = cheerio.load(html);
    console.log("Title:", $('title').text());
    console.log("Price:", $('.YMlKec.fxKbKc').first().text());
}
test();
