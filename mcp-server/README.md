# Ryaion Market Data MCP Server

An MCP (Model Context Protocol) server that scrapes live Indian stock market data from Google Finance.

## Installation

```bash
cd mcp-server
npm install
```

## Available Tools

| Tool | Description |
|------|-------------|
| `get_stock_price` | Get real-time price for a single NSE stock |
| `get_market_index` | Get NIFTY50 or SENSEX index value |
| `get_multiple_stocks` | Get prices for multiple stocks at once |
| `get_market_overview` | Get indices + top 5 stocks in one call |

## Usage with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "ryaion-market-data": {
      "command": "node",
      "args": ["/Users/Apple/Desktop/Projectss/ryaion/mcp-server/index.js"]
    }
  }
}
```

## Supported Stocks

RELIANCE, TCS, HDFCBANK, INFY, ICICIBANK, HINDUNILVR, SBIN, BHARTIARTL, ITC, KOTAKBANK, LT, AXISBANK, ASIANPAINT, MARUTI, SUNPHARMA, TATAMOTORS, TATASTEEL, WIPRO, ZOMATO, PAYTM

## Example Responses

### Stock Price
```json
{
  "symbol": "RELIANCE",
  "price": 2980.50,
  "change": 45.20,
  "changePercent": "+1.54%",
  "exchange": "NSE",
  "timestamp": "2025-01-22T01:30:00.000Z"
}
```

### Market Index
```json
{
  "index": "NIFTY50",
  "value": 21950.00,
  "change": 150.25,
  "changePercent": "+0.69%",
  "timestamp": "2025-01-22T01:30:00.000Z"
}
```
