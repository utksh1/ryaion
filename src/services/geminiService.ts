import { GoogleGenAI } from "@google/genai";
import type { Stock, AIAnalysis, NewsItem } from "../types";

console.log("GeminiService: Module loading...");

// API Configuration & Error State
let _ai: GoogleGenAI | null = null;
let _apiKeyConfigured = false;
let _lastError: string | null = null;

export const isApiKeyConfigured = (): boolean => {
    const apiKey = import.meta.env.VITE_API_KEY || '';
    _apiKeyConfigured = apiKey.length > 0 && apiKey !== 'your_gemini_api_key_hereAIzaSyCrX3fTM_yOhT4w8my9sLUO46MpGjM89QA';
    return _apiKeyConfigured;
};

/**
 * Get the last API error message (if any)
 */
export const getLastError = (): string | null => _lastError;

/**
 * Clear the last error
 */
export const clearLastError = () => { _lastError = null; };

const getAi = () => {
    if (_ai) return _ai;

    const apiKey = import.meta.env.VITE_API_KEY || '';

    if (!isApiKeyConfigured()) {
        const errorMsg = "Gemini API key is not configured. Please add VITE_API_KEY to your .env file.";
        console.warn(`GeminiService: ${errorMsg}`);
        _lastError = errorMsg;
        throw new Error(errorMsg);
    }

    try {
        _ai = new GoogleGenAI({ apiKey });
        console.log("GeminiService: GoogleGenAI client initialized successfully");
        _lastError = null;
        return _ai;
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Failed to initialize Gemini API";
        console.error("GeminiService: Initialization failed", e);
        _lastError = errorMsg;
        throw new Error(errorMsg);
    }
}

export const getStockAnalysis = async (stock: Stock): Promise<AIAnalysis> => {
    console.log(`GeminiService: Analyzing stock ${stock.symbol}`);

    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `Act as a senior stock analyst. Analyze ${stock.symbol} (${stock.name}) based on this data: Price: ₹${stock.price}, Change: ${stock.change} (${stock.changePercent}%), PE: ${stock.peRatio}, Sector: ${stock.sector}.
                Provide a JSON response with this structure:
                {
                  "verdict": "Buy" | "Hold" | "Sell" | "Watch",
                  "summary": "2 sentence expert summary",
                  "pros": ["point 1", "point 2", "point 3"],
                  "cons": ["point 1", "point 2", "point 3"],
                  "riskLevel": "Low" | "Medium" | "High",
                  "targetPrice": "Expected price in 1 year"
                }
                Do not include markdown code blocks.`
                }]
            } as any,
        });

        const text = response.text;
        console.log("GeminiService: Analysis response received");
        return JSON.parse(text || '{}');
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Stock analysis failed", errorMsg);
        _lastError = `Analysis failed: ${errorMsg}`;

        return {
            verdict: 'Hold',
            summary: 'AI analysis temporarily unavailable. Please configure your Gemini API key or try again later.',
            pros: ['Manual analysis recommended'],
            cons: ['AI insights unavailable'],
            riskLevel: 'Medium',
            targetPrice: 'N/A'
        };
    }
};

export const compareStocks = async (stocks: Stock[]): Promise<string> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `Act as a senior portfolio manager. Compare these stocks: ${stocks.map(s => `${s.symbol} (₹${s.price})`).join(', ')}.
                Which one is a better buy right now and why?
                Keep the answer under 100 words, punchy and direct.`
                }]
            } as any,
        });
        return response.text || "Comparison unavailable.";
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Stock comparison failed", errorMsg);
        _lastError = `Comparison failed: ${errorMsg}`;
        return "⚠️ AI comparison temporarily unavailable. Please configure your Gemini API key in the .env file to enable this feature.";
    }
};

export const getMarketNews = async (): Promise<NewsItem> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `Generate a brief "Market Pulse" news summary for the Indian stock market today.
                Include 3 likely news sources (just names).
                Make it sound professional but exciting.
                JSON format: { "text": "...", "sources": [{ "title": "Source 1", "uri": "#" }] }`
                }]
            } as any,
        });

        const text = response.text;
        return JSON.parse(text || '{}');
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Market news failed", errorMsg);
        _lastError = `News fetch failed: ${errorMsg}`;
        return {
            text: "⚠️ AI-powered market news is currently unavailable. Please configure your Gemini API key to access real-time market insights.",
            sources: []
        };
    }
};

export const askRya = async (query: string): Promise<{ text: string, sources: any[] }> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `You are Rya, an AI financial assistant. Answer this user query: "${query}".
                Keep it short (max 2 sentences). Be helpful and smart.`
                }]
            } as any,
        });
        return { text: response.text || "I didn't catch that.", sources: [] };
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Rya query failed", errorMsg);
        _lastError = `Rya query failed: ${errorMsg}`;
        return {
            text: "⚠️ I'm currently offline. Please configure the Gemini API key to chat with me.",
            sources: []
        };
    }
};

export const getStockVibe = async (stock: Stock): Promise<{ vibe: string, score: number, hypeReason: string }> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `Analyze the "vibe" or sentiment of ${stock.symbol}.
                    Return JSON: { "vibe": "Electric" | "Gloomy" | "Steady", "score": 0-100, "hypeReason": "Short reason" }`
                }]
            } as any,
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Stock vibe failed", errorMsg);
        _lastError = `Vibe analysis failed: ${errorMsg}`;
        return { vibe: 'Offline', score: 50, hypeReason: 'AI unavailable - configure API key' };
    }
};

export interface MarketVibeResponse {
    text: string;
    score: number;
    sources: { uri: string }[];
}

export const getMarketVibeCheck = async (): Promise<MarketVibeResponse> => {
    try {
        const ai = getAi();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-lite-preview-02-05',
            contents: {
                role: 'user',
                parts: [{
                    text: `What is the overall market vibe today in India?
                    Return JSON: { "text": "Short summary", "score": 0-100 (hype level), "sources": [{"uri": "#"}] }`
                }]
            } as any,
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        console.error("GeminiService: Market vibe check failed", errorMsg);
        _lastError = `Market vibe failed: ${errorMsg}`;
        return {
            text: "⚠️ AI market analysis unavailable. Configure Gemini API key for real-time insights.",
            score: 50,
            sources: []
        };
    }
};
