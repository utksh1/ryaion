import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchMarketIndices, fetchMultipleStocks, type MarketIndex, type LiveStockData } from "../../services/marketDataService";

export const LiveTicker = () => {
    const [indices, setIndices] = useState<MarketIndex[]>([]);
    const [stocks, setStocks] = useState<LiveStockData[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [indexData, stockData] = await Promise.all([
                    fetchMarketIndices(),
                    fetchMultipleStocks(['RELIANCE', 'TCS', 'INFY', 'ZOMATO', 'HDFCBANK'])
                ]);
                setIndices(indexData);
                setStocks(stockData);
            } catch (error) {
                console.error('Ticker error:', error);
            }
        };

        loadData();
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    // Build ticker items
    const tickerItems = [
        ...indices.map(i => ({
            text: `${i.name}: ${i.value.toLocaleString()} ${i.change >= 0 ? '▲' : '▼'} ${Math.abs(i.changePercent).toFixed(2)}%`,
            positive: i.change >= 0
        })),
        ...stocks.map(s => ({
            text: `${s.symbol}: ₹${s.price.toLocaleString()} ${s.change >= 0 ? '▲' : '▼'} ${Math.abs(s.changePercent).toFixed(2)}%`,
            positive: s.change >= 0
        })),
        { text: "MARKET: LIVE", positive: null as boolean | null },
        { text: `UPDATED: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, positive: null as boolean | null }
    ];

    return (
        <div className="w-full bg-black/40 border-b border-white/5 overflow-hidden py-2 mb-4 relative flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-obsidian-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-obsidian-black to-transparent z-10" />

            <motion.div
                className="flex gap-8 whitespace-nowrap"
                animate={{ x: [0, -1500] }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
                {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
                    <span key={i} className="text-xs font-mono text-gray-400 font-bold flex items-center gap-2">
                        {item.positive === true ? (
                            <span className="w-1.5 h-1.5 bg-dusty-rose rounded-full animate-pulse" />
                        ) : item.positive === false ? (
                            <span className="w-1.5 h-1.5 bg-deep-teal rounded-full" />
                        ) : (
                            <span className="w-1.5 h-1.5 bg-lavender rounded-full" />
                        )}
                        {item.text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
};
