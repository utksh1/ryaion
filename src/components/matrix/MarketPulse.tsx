import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fetchMarketIndices, type MarketIndex } from "../../services/marketDataService";

export function MarketPulse() {
    const [indices, setIndices] = useState<MarketIndex[]>([]);

    useEffect(() => {
        const loadIndices = async () => {
            const data = await fetchMarketIndices();
            setIndices(data);
        };
        loadIndices();
        const interval = setInterval(loadIndices, 30000);
        return () => clearInterval(interval);
    }, []);

    if (indices.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-4 mb-6">
            {indices.map((index) => {
                const isPositive = index.change >= 0;
                return (
                    <motion.div
                        key={index.name}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md"
                    >
                        <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-market-green/20 text-market-green' : 'bg-market-red/20 text-market-red'}`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold font-mono">
                                {index.name}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-white font-mono leading-none">
                                    {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                                <span className={`text-[10px] font-bold ${isPositive ? 'text-market-green' : 'text-market-red'}`}>
                                    {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden md:flex ml-auto items-center gap-2 px-4 py-2 border border-lavender/20 rounded-xl bg-lavender/5"
            >
                <div className="w-2 h-2 bg-market-green rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] text-lavender font-bold uppercase tracking-widest">
                    Live NSE Stream Connected
                </span>
            </motion.div>
        </div>
    );
}
