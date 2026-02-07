import { Router } from 'express';
import { getMarketData, fetchLiveStock, fetchStockHistory } from '../services/marketService';

const router = Router();

// GET /stocks/{symbol}/live
router.get('/:symbol/live', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stock = await fetchLiveStock(symbol);

        if (stock) {
            res.json(stock);
        } else {
            res.status(404).json({ error: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch live stock data' });
    }
});

// GET /stocks/{symbol}
router.get('/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const stock = await fetchLiveStock(symbol); // Using live data for details too for now

        if (stock) {
            res.json({
                symbol: stock.symbol,
                name: stock.name,
                sector: "Technology", // Mock
                exchange: "NSE",      // Mock
                price: stock.price,
                change: stock.change,
                // indicators: indicators // Phase 7 Requirement - TODO: Fetch from AI Service
            });
        } else {
            res.status(404).json({ error: 'Stock not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

// GET /stocks/{symbol}/chart
router.get('/:symbol/chart', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { timeframe } = req.query; // e.g., '1D'

        // Fetch real history from DB
        const candles = await fetchStockHistory(symbol, 100);

        if (candles.length > 0) {
            res.json({ candles });
        } else {
            // Fallback for demo if DB empty: generate based on live price
            const stock = await fetchLiveStock(symbol);
            const basePrice = stock?.price || 100;
            const mockCandles = Array.from({ length: 20 }, (_, i) => ({
                t: new Date(Date.now() - (20 - i) * 3600000).toISOString(),
                o: basePrice, h: basePrice * 1.01, l: basePrice * 0.99, c: basePrice
            }));
            res.json({ candles: mockCandles });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stock history' });
    }
});

export default router;
