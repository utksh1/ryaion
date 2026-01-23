import { useEffect, useState } from "react";
// import { subscribeToMarketData } from "../../services/firebaseMarketService"; // Disabled for local dev
import { type LiveStockData } from "../../services/marketDataService";
import { StockCard } from "./StockCard";
import { motion } from "framer-motion";

export const NeuralGrid = () => {
    const [stocks, setStocks] = useState<LiveStockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocalData = async () => {
            try {
                const res = await fetch('/market-data.json');
                if (!res.ok) throw new Error('Failed to fetch local data');
                const data = await res.json();

                if (data && data.topStocks) {
                    const formattedStocks: LiveStockData[] = data.topStocks.map((s: any) => ({
                        symbol: s.symbol,
                        name: s.symbol,
                        price: s.price,
                        change: s.change,
                        changePercent: parseFloat(String(s.changePercent).replace('%', '')),
                        volume: '0',
                        high: 0,
                        low: 0,
                        timestamp: new Date().toISOString()
                    }));
                    setStocks(formattedStocks);
                    setLoading(false);
                    setError(null);
                }
            } catch (err) {
                console.error('Polling error:', err);
                // Don't show error to user immediately to avoid flickering, just log
            }
        };

        fetchLocalData(); // Initial fetch
        const interval = setInterval(fetchLocalData, 2000); // Poll every 2 seconds for "live" feel
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (error || stocks.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>{error || 'No data available'}</p>
                <p className="text-xs mt-2">Retrying in 30 seconds...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stocks.map((stock, i) => (
                <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <StockCard stock={{
                        id: stock.symbol,
                        symbol: stock.symbol,
                        name: stock.name,
                        price: stock.price,
                        change: stock.change,
                        changePercent: stock.changePercent,
                        sentiment: stock.changePercent > 1.5 ? 'hype' :
                            stock.changePercent > 0.5 ? 'fomo' :
                                stock.changePercent > -0.5 ? 'neutral' : 'panic',
                        aura: Math.min(100, Math.max(10, 50 + stock.changePercent * 15)),
                        marketCap: '-',
                        volume: stock.volume
                    }} />
                </motion.div>
            ))}
        </div>
    );
};
