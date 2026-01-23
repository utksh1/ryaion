
import { db } from "../lib/firebase";
import { ref, onValue } from "firebase/database";

export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: string;
    exchange: string;
    timestamp: string;
}

export interface MarketIndex {
    index: string;
    value: number;
    change: number;
    changePercent: string;
    timestamp: string;
}

export interface MarketData {
    indices: {
        nifty: MarketIndex;
        sensex: MarketIndex;
    };
    topStocks: StockData[];
    timestamp: string;
}

// Subscribe to real-time market data
export function subscribeToMarketData(callback: (data: MarketData | null) => void) {
    const marketRef = ref(db, 'market');
    return onValue(marketRef, (snapshot) => {
        const data = snapshot.val();
        callback(data);
    });
}
