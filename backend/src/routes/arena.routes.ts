import { Router } from 'express';

const router = Router();

// POST /arena/compare
router.post('/compare', (req, res) => {
    const { stock_a, stock_b, horizon } = req.body;

    // Mock logic
    const scoreA = Math.floor(Math.random() * 100);
    const scoreB = Math.floor(Math.random() * 100);
    const winner = scoreA > scoreB ? stock_a : stock_b;

    res.json({
        winner: winner,
        reason: `${winner} shows better momentum and risk indicators for ${horizon} horizon.`,
        scores: {
            [stock_a]: scoreA,
            [stock_b]: scoreB
        }
    });
});

export default router;
