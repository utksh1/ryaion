// AI Configuration (Proxied through backend for security)
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3001';
const BACKEND_URL = `${BASE_URL}/api/v1`;
const API_URL = `${BACKEND_URL}/ai/chat`;

import { getMarketContext } from './marketDataService';

export interface OracleAnalysis {
    verdict: 'BUY' | 'SELL' | 'WATCH';
    riskScore: 'LOW' | 'MED' | 'HIGH';
    summary: string;
    signals: string[];
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

// Generic chat completion
export const chatWithAI = async (messages: ChatMessage[]): Promise<string> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages })
        });

        if (!response.ok) {
            throw new Error(`AI Gateway Error: ${response.status}`);
        }

        const data = await response.json();
        return data.content || 'No response from AI.';
    } catch (error) {
        console.error('AI Chat Error:', error);
        return "Intelligence system link disrupted. Please try again.";
    }
};

// Stock Analysis via AI Oracle with live market data
export const analyzeStock = async (symbol: string): Promise<OracleAnalysis> => {
    // Get live market context
    const marketContext = await getMarketContext();

    const systemPrompt = `You are Rya, a professional financial analyst AI specializing in Indian equities. Your analysis is data-driven, concise, and actionable.

${marketContext}

Rules:
- Use professional financial terminology
- Be direct and confident in your assessments
- Focus on Indian market context (NSE/BSE, Nifty 50, Sensex)
- No emojis or casual language
- Provide clear, actionable insights
- Reference the live market data provided above when relevant`;

    const userPrompt = `Analyze the Indian stock ${symbol}. Consider the current market conditions. Respond ONLY with valid JSON in this exact format:
{
  "verdict": "BUY" or "SELL" or "WATCH",
  "riskScore": "LOW" or "MED" or "HIGH",
  "summary": "One paragraph professional analysis (max 100 words)",
  "signals": ["Signal 1", "Signal 2", "Signal 3"]
}`;

    try {
        const response = await chatWithAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]);

        // Try to parse JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                verdict: parsed.verdict || 'WATCH',
                riskScore: parsed.riskScore || 'MED',
                summary: parsed.summary || 'Analysis unavailable.',
                signals: parsed.signals || []
            };
        }

        // Fallback if JSON parsing fails
        return {
            verdict: 'WATCH',
            riskScore: 'MED',
            summary: response.slice(0, 200),
            signals: ['Analysis format error - showing raw response']
        };
    } catch (error) {
        console.error('Stock analysis error:', error);
        return {
            verdict: 'WATCH',
            riskScore: 'HIGH',
            summary: 'Unable to analyze this stock at the moment. Please try again.',
            signals: ['API connection issue']
        };
    }
};

// Conversational AI for Ask Rya with live market context
export const askRya = async (question: string, context: ChatMessage[] = []): Promise<string> => {
    // Get live market context
    const marketContext = await getMarketContext();

    const systemPrompt = `You are Rya, a professional financial advisor AI for Ryaion, an Indian stock market intelligence platform.

${marketContext}

Your communication style:
- Professional and articulate
- Direct and confident without hedging
- No emojis or casual slang
- Concise responses (2-4 sentences unless explaining complex concepts)
- Use proper financial terminology
- Reference the live market data above when answering questions about current prices or market conditions

Your expertise:
- Indian equity markets (NSE, BSE)
- SEBI regulations and compliance
- IPO analysis and market trends
- Portfolio strategy and risk assessment
- Sectoral analysis and economic indicators

Always provide context-aware, actionable insights using the real-time market data provided.`;

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...context.slice(-6),
        { role: 'user', content: question }
    ];

    return chatWithAI(messages);
};
