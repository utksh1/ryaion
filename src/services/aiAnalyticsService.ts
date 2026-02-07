const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';
const API_URL = `${BASE_URL}/api/v1`;

export interface AIAnalysisResult {
    symbol: string;
    ai_score: number;
    sentiment: string;
    confidence: number;
    reason: string;
    reasons: string[];
    indicators: {
        rsi: number;
        sma50: number;
        sma200: number;
        macd: { MACD: number; signal: number; histogram: number; };
    };
}

export const analyzeStock = async (symbol: string): Promise<AIAnalysisResult> => {
    const response = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
    });

    if (!response.ok) {
        throw new Error('AI Analysis failed');
    }

    return response.json();
};
