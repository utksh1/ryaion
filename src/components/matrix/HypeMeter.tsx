import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import { fetchAllStocks, calculateMarketSentiment } from "../../services/marketDataService";

export const HypeMeter = () => {
    const [sentiment, setSentiment] = useState({
        label: "LOADING...",
        value: 50,
        trend: 'neutral' as 'bullish' | 'bearish' | 'neutral'
    });

    useEffect(() => {
        const updateSentiment = async () => {
            try {
                const stocks = await fetchAllStocks();
                if (stocks.length > 0) {
                    const newSentiment = calculateMarketSentiment(stocks);
                    setSentiment(newSentiment);
                }
            } catch (error) {
                console.error('Sentiment error:', error);
            }
        };

        updateSentiment();
        const interval = setInterval(updateSentiment, 30000);
        return () => clearInterval(interval);
    }, []);

    const colorMap = {
        bullish: { text: "text-dusty-rose", bar: "bg-dusty-rose" },
        bearish: { text: "text-deep-teal", bar: "bg-deep-teal" },
        neutral: { text: "text-lavender", bar: "bg-lavender" }
    };

    const colors = colorMap[sentiment.trend];

    return (
        <GlassCard className="p-6 relative overflow-visible">
            <div className="absolute top-3 right-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            </div>

            <h3 className="text-sm font-mono text-gray-400 mb-1">MARKET SENTIMENT</h3>
            <div className={cn("text-2xl font-bricolage font-bold mb-4", colors.text)}>
                {sentiment.label}
            </div>

            {/* Meter Bar */}
            <div className="h-4 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    className={cn("h-full relative", colors.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${sentiment.value}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_white]" />
                </motion.div>

                {/* Ticks */}
                <div className="absolute inset-0 flex justify-between px-1">
                    {[0, 25, 50, 75, 100].map(tick => (
                        <div key={tick} className="h-full w-[1px] bg-black/20" />
                    ))}
                </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-2">
                <span>BEARISH</span>
                <span>NEUTRAL</span>
                <span>BULLISH</span>
            </div>
        </GlassCard>
    );
};
