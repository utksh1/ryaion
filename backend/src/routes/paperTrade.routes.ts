import { Router } from 'express';

const router = Router();

// POST /paper-trade
router.post('/', (req, res) => {
    const { symbol, type, quantity } = req.body;
    // In real app, save to DB
    res.json({
        message: `Paper trade executed: ${type} ${quantity} of ${symbol}`,
        id: "mock-trade-id-123"
    });
});

// GET /paper-trade/portfolio
router.get('/portfolio', (req, res) => {
    res.json({
        holdings: [
            { symbol: "TCS", quantity: 10, avg_price: 3500, ltp: 3550, pnl: 500 },
            { symbol: "INFY", quantity: 50, avg_price: 1400, ltp: 1420, pnl: 1000 }
        ],
        cash_balance: 1000000,
        total_value: 1001500
    });
});

export default router;
