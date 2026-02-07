import { Router } from 'express';

const router = Router();

// GET /performance/ai
router.get('/ai', (req, res) => {
    res.json({
        accuracy: 72,
        total_predictions: 543,
        profitable_trades: 380
    });
});

export default router;
