import { Router } from 'express';
import { fetchMarketIndices } from '../services/marketService';

const router = Router();

// GET /market/overview
router.get('/overview', async (req, res) => {
    try {
        const indices = await fetchMarketIndices();
        res.json({
            market_status: "OPEN", // Mock
            indices: indices
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch market overview' });
    }
});

export default router;
