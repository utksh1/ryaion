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
                        className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-colors cursor-default"
                    >
                        <div className={`p-2 rounded-xl ${isPositive ? 'bg-market-green/20 text-market-green' : 'bg-market-red/20 text-market-red'}`}>
                            {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] text-white/40 uppercase tracking-[0.2em] font-black font-mono">
                                {index.name}
                            </span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-xl font-black text-white font-mono leading-none">
                                    {index.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </span>
                                <span className={`text-xs font-black ${isPositive ? 'text-market-green' : 'text-market-red'}`}>
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
                className="hidden lg:flex ml-auto items-center gap-3 px-5 py-2.5 border border-lavender/30 rounded-2xl bg-lavender/10 shadow-[0_0_20px_rgba(165,164,226,0.1)]"
            >
                <div className="w-2.5 h-2.5 bg-market-green rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                <span className="text-[11px] text-lavender font-black uppercase tracking-[0.2em]">
                    REAL-TIME NSE STREAM ACTIVE
                </span>
            </motion.div>
        </div>
    );
}
