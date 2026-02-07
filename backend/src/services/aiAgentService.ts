import { createClient } from '@supabase/supabase-js';
import { calculateRSI, calculateSMA, calculateMACD } from './indicatorService';
import { chatWithGenAiAgent } from './genAiAgentService';
// Note: Environment variables are loaded in server.ts

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const analyzeStack = async (symbol: string) => {
    // 1. Fetch real history from Yahoo Finance for analysis
    console.log(`🧠 AI Agent: Fetching real history for ${symbol} analysis...`);
    const yahooSymbol = `${symbol.toUpperCase()}.NS`;
    let prices: number[] = [];

    try {
        const fetchResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=60d&interval=1d`);

        if (!fetchResponse.ok) {
            console.error(`❌ Yahoo Analysis API Error [${symbol}]: ${fetchResponse.statusText}`);
            return { symbol, ai_score: 50, sentiment: 'NEUTRAL', confidence: 0, reason: 'Market API Error' };
        }

        const data: any = await fetchResponse.json();
        const result = data.chart?.result?.[0];

        if (!result || !result.timestamp || result.timestamp.length < 14) {
            console.warn(`⚠️ Insufficient history for ${symbol} (Found ${result?.timestamp?.length || 0} points).`);
            return { symbol, ai_score: 50, sentiment: 'NEUTRAL', confidence: 0, reason: 'Insufficient History' };
        }

        const quotes = result.indicators.quote[0];
        prices = quotes.close.filter((p: any) => p !== null);

        if (prices.length < 14) {
            return { symbol, ai_score: 50, sentiment: 'NEUTRAL', confidence: 0, reason: 'Insufficient Valid Data' };
        }
    } catch (fetchError: any) {
        console.error(`❌ AI Analysis Fetch Exception [${symbol}]:`, fetchError.message);
        return { symbol, ai_score: 50, sentiment: 'NEUTRAL', confidence: 0, reason: 'Internal Engine Error' };
    }

    // 2. Calculate Indicators
    const rsiValues = calculateRSI(prices, 14);
    const sma50Values = calculateSMA(prices, 50);
    const sma200Values = calculateSMA(prices, 200);
    const macdValues = calculateMACD(prices);

    // Get latest values
    const currentRSI = rsiValues[rsiValues.length - 1] || 50;
    const currentSMA50 = sma50Values[sma50Values.length - 1] || 0;
    const currentSMA200 = sma200Values[sma200Values.length - 1] || 0;
    const currentMACD = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };

    // 3. Rule-Based Base Score
    let score = 50;
    let ruleReasons: string[] = [];
    let confidence = 50;

    if (currentRSI < 30) { score += 20; ruleReasons.push("Oversold condition"); confidence += 10; }
    else if (currentRSI > 70) { score -= 20; ruleReasons.push("Overbought condition"); confidence += 10; }

    if (currentSMA50 > currentSMA200 && currentSMA200 > 0) { score += 15; ruleReasons.push("Bullish Trend (Golden Cross)"); confidence += 15; }
    else if (currentSMA50 < currentSMA200 && currentSMA200 > 0) { score -= 15; ruleReasons.push("Bearish Trend (Death Cross)"); confidence += 15; }

    if (currentMACD && (currentMACD.MACD ?? 0) > (currentMACD.signal ?? 0)) { score += 10; ruleReasons.push("Bullish Momentum (MACD)"); confidence += 5; }
    else { score -= 10; ruleReasons.push("Bearish Momentum (MACD)"); confidence += 5; }

    score = Math.max(0, Math.min(100, score));

    // 4. Generate AI Summary using Gemini
    let aiSummary = "Market analysis based on technical indicators suggests careful observation.";
    try {
        const prompt = `Act as Rya, a professional financial analyst for the Indian stock market.
Analyze ${symbol} with these metrics:
- Current Price Trend: ${score > 50 ? 'Positive' : 'Negative'}
- RSI (14): ${currentRSI.toFixed(1)}
- Technical Signal: ${ruleReasons.join(", ")}
- Overall Neural Score: ${score}/100

Provide a concise, professional financial outlook (max 40 words) for an investor. Focus on Indian market context.`;

        const response = await chatWithGenAiAgent([
            { role: 'system', content: "You are Rya, a professional Indian stock market analyst." },
            { role: 'user', content: prompt }
        ]);
        if (response) aiSummary = response.trim();
    } catch (aiErr) {
        console.error("Gemini Analysis Insight Error:", aiErr);
    }

    // Determine Sentiment Category
    let sentiment = "NEUTRAL";
    if (score >= 75) sentiment = "BULLISH";
    else if (score >= 60) sentiment = "MILDLY BULLISH";
    else if (score <= 25) sentiment = "BEARISH";
    else if (score <= 40) sentiment = "MILDLY BEARISH";

    // 5. Save Analysis to DB
    const analysisRecord = {
        symbol,
        score: Math.round(score),
        sentiment,
        confidence: Math.round(confidence),
        summary: aiSummary,
        reasons: ruleReasons,
        indicators: {
            rsi: currentRSI,
            sma50: currentSMA50,
            sma200: currentSMA200,
            macd: currentMACD
        }
    };

    await supabase.from('ai_analysis').upsert({
        ...analysisRecord,
        created_at: new Date().toISOString()
    }, { onConflict: 'symbol' } as any);

    return {
        ...analysisRecord,
        ai_score: analysisRecord.score,
        reason: analysisRecord.summary
    };
};
