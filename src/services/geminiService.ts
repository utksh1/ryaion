export interface OracleAnalysis {
    verdict: 'BUY' | 'SELL' | 'WATCH';
    riskScore: 'LOW' | 'MED' | 'HIGH';
    summary: string; // "Massive main-character energy..."
    signals: string[]; // Bullish/Bearish points
}

export const analyzeStock = async (symbol: string): Promise<OracleAnalysis> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock responses based on symbol
    if (symbol === 'RELIANCE') {
        return {
            verdict: 'BUY',
            riskScore: 'LOW',
            summary: "Absolute unit of a stock. Oil margins are thick, retail is booming. Main character energy confirmed.",
            signals: ["Jio subscriber growth > population of small countries", "Retail footprint expanding like a virus (the good kind)"]
        };
    }

    if (symbol === 'HDFCBANK') {
        return {
            verdict: 'WATCH',
            riskScore: 'MED',
            summary: "Currently in its flop era but redemption arc is loading. Merger pains are real.",
            signals: ["NIMs are squeezed tight", "Deposit growth is sluggish"]
        };
    }

    return {
        verdict: 'BUY',
        riskScore: 'HIGH',
        summary: "High risk, high reward. It's giving volatility. Ape in only if you have diamond hands.",
        signals: ["Volume spike incoming", "Technicals screaming breakout"]
    };
};
