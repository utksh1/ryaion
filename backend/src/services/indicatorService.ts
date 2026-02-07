import { RSI, SMA, MACD } from 'technicalindicators';

/**
 * Calculates Simple Moving Average (SMA)
 * @param prices Array of prices
 * @param period The period for SMA
 */
export const calculateSMA = (prices: number[], period: number): number[] => {
    return SMA.calculate({ period, values: prices });
};

/**
 * Calculates Relative Strength Index (RSI)
 * @param prices Array of prices
 * @param period RSI period (default 14)
 */
export const calculateRSI = (prices: number[], period: number = 14): number[] => {
    return RSI.calculate({ period, values: prices });
};

/**
 * Calculates MACD
 * @param prices Array of prices
 */
export const calculateMACD = (prices: number[]) => {
    return MACD.calculate({
        values: prices,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });
};

export interface TechnicalIndicators {
    rsi: number;
    sma50: number;
    sma200: number;
    macd: {
        value: number;
        signal: number;
        histogram: number;
    }
}
