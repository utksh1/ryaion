#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Stock symbols mapping (NSE)
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

// Fetch stock data from Google Finance
async function fetchStockPrice(symbol) {
    try {
        const url = `https://www.google.com/finance/quote/${symbol}:NSE`;
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
        // Parse change values
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
            exchange: 'NSE',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        return {
            symbol: symbol,
            price: 0,
            change: 0,
            changePercent: '0%',
            exchange: 'NSE',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Fetch market indices
async function fetchMarketIndex(indexName) {
    try {
        let url;
        if (indexName === 'NIFTY50' || indexName === 'NIFTY') {
            url = 'https://www.google.com/finance/quote/NIFTY_50:INDEXNSE';
        } else if (indexName === 'SENSEX') {
            url = 'https://www.google.com/finance/quote/SENSEX:INDEXBOM';
        } else {
            throw new Error('Unknown index');
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
            // Fallback for indices
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
        return {
            index: indexName,
            value: 0,
            change: 0,
            changePercent: '0%',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

// Fetch multiple stocks
async function fetchMultipleStocks(symbols) {
    const results = await Promise.all(
        symbols.map(symbol => fetchStockPrice(symbol.toUpperCase()))
    );
    return results;
}

// Create MCP Server
const server = new Server(
    {
        name: 'ryaion-market-data',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'get_stock_price',
                description: 'Get real-time price for an Indian stock (NSE). Returns current price, change, and percentage change.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        symbol: {
                            type: 'string',
                            description: 'Stock symbol (e.g., RELIANCE, TCS, INFY, ZOMATO)'
                        }
                    },
                    required: ['symbol']
                }
            },
            {
                name: 'get_market_index',
                description: 'Get real-time value of Indian market indices (NIFTY50 or SENSEX)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        index: {
                            type: 'string',
                            enum: ['NIFTY50', 'SENSEX'],
                            description: 'Market index name'
                        }
                    },
                    required: ['index']
                }
            },
            {
                name: 'get_multiple_stocks',
                description: 'Get real-time prices for multiple Indian stocks at once',
                inputSchema: {
                    type: 'object',
                    properties: {
                        symbols: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of stock symbols'
                        }
                    },
                    required: ['symbols']
                }
            },
            {
                name: 'get_market_overview',
                description: 'Get a complete market overview including both indices and top stocks',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        ]
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'get_stock_price': {
                const data = await fetchStockPrice(args.symbol.toUpperCase());
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2)
                        }
                    ]
                };
            }

            case 'get_market_index': {
                const data = await fetchMarketIndex(args.index.toUpperCase());
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2)
                        }
                    ]
                };
            }

            case 'get_multiple_stocks': {
                const data = await fetchMultipleStocks(args.symbols);
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(data, null, 2)
                        }
                    ]
                };
            }

            case 'get_market_overview': {
                const [nifty, sensex, stocks] = await Promise.all([
                    fetchMarketIndex('NIFTY50'),
                    fetchMarketIndex('SENSEX'),
                    fetchMultipleStocks(['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK'])
                ]);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                indices: { nifty, sensex },
                                topStocks: stocks,
                                timestamp: new Date().toISOString()
                            }, null, 2)
                        }
                    ]
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: error.message })
                }
            ],
            isError: true
        };
    }
});

// Start server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Ryaion Market Data MCP Server running on stdio');
}

main().catch(console.error);
