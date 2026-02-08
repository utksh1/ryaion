import { useEffect, useState } from "react";
import { fetchAllStocks, type LiveStockData } from "../../services/marketDataService";
import { StockCard } from "./StockCard";
import { motion } from "framer-motion";

interface NeuralGridProps {
    onStockClick?: (stock: LiveStockData) => void;
}

export const NeuralGrid = ({ onStockClick }: NeuralGridProps) => {
    const [stocks, setStocks] = useState<LiveStockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadStocks = async () => {
            try {
                const data = await fetchAllStocks();
                if (data.length > 0) {
                    setStocks(data);
                    setError(null);
                } else {
                    setError('No stock data available');
                }
            } catch (err) {
                setError('Failed to load stocks');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadStocks();
        const interval = setInterval(loadStocks, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8">
            {stocks.map((stock, i) => (
                <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <StockCard
                        onClick={() => onStockClick?.(stock)}
                        stock={{
                            id: stock.symbol,
                            symbol: stock.symbol,
                            name: stock.name,
                            price: stock.price,
                            change: stock.change,
                            changePercent: stock.changePercent,
                            sentiment: stock.changePercent > 1.5 ? 'hype' :
                                stock.changePercent > 0.5 ? 'fomo' :
                                    stock.changePercent > -0.5 ? 'neutral' : 'panic',
                            aura: Math.round(Math.min(100, Math.max(10, 50 + stock.changePercent * 15))),
                            marketCap: '-',
                            volume: stock.volume
                        }} />
                </motion.div>
            ))}
        </div>
    );
};
