#!/usr/bin/env node

require('dotenv').config();

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { fetchStockPrice, fetchMarketIndex, fetchMultipleStocks } = require('./lib/scraper');

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
                const data = await fetchStockPrice(args.symbol);
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
                const data = await fetchMarketIndex(args.index);
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
