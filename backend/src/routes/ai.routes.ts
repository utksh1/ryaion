import { Router } from 'express';
import { analyzeStack } from '../services/aiAgentService';
import { chatWithGenAiAgent } from '../services/genAiAgentService';

const router = Router();

// POST /ai/chat (Proxy for Gemini)
router.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const response = await chatWithGenAiAgent(messages);
        res.json({ content: response });
    } catch (error: any) {
        console.error("Chat Route Error:", error);
        res.status(500).json({ error: error.message || 'AI chat failed' });
    }
});

// POST /ai/analyze
router.post('/analyze', async (req, res) => {
    try {
        const { symbol, horizon } = req.body;
        if (!symbol) {
            return res.status(400).json({ error: 'Symbol is required' });
        }

        const result = await analyzeStack(symbol);
        // Extend result with horizon specific logic if needed
        res.json({
            ...result,
            horizon: horizon || 'swing',
            expected_move: (Math.random() * 5).toFixed(2) // Mock
        });
    } catch (error) {
        res.status(500).json({ error: 'AI analysis failed' });
    }
});

// GET /ai/suggestions
router.get('/suggestions', async (req, res) => {
    const { horizon } = req.query;
    // Mock suggestions
    const suggestions = [
        { symbol: "INFY", ai_score: 85, confidence: 78 },
        { symbol: "TCS", ai_score: 82, confidence: 75 },
        { symbol: "ITC", ai_score: 70, confidence: 60 }
    ];
    res.json(suggestions);
});

export default router;
