import { Router } from 'express';

const router = Router();

// POST /watchlist
router.post('/', (req, res) => {
    // In real app, getUser from Auth middleware and save to DB
    const { symbol } = req.body;
    res.json({ message: `Added ${symbol} to watchlist` });
});

// GET /watchlist
router.get('/', (req, res) => {
    // Return mock watchlist
    res.json([
        { symbol: "TATAMOTORS", added_at: new Date().toISOString() },
        { symbol: "ZOMATO", added_at: new Date().toISOString() }
    ]);
});

export default router;
