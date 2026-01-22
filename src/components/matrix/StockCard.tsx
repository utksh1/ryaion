import { GlassCard } from "../ui/GlassCard";
import type { StockData } from "../../data/mockMarketData";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface StockCardProps {
    stock: StockData;
}

export const StockCard = ({ stock }: StockCardProps) => {
    const isPositive = stock.change >= 0;

    const sentimentColors = {
        fomo: "text-yellow-400 border-yellow-400/20 shadow-yellow-400/10",
        panic: "text-red-500 border-red-500/20 shadow-red-500/10",
        neutral: "text-gray-400 border-gray-400/20",
        hype: "text-market-green border-market-green/20 shadow-green-500/20"
    };

    return (
        <GlassCard hoverEffect className={cn(
            "p-4 border-l-4 transition-all duration-300",
            isPositive ? "border-l-dusty-rose" : "border-l-deep-teal"
        )}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-lg font-bricolage tracking-tight">{stock.symbol}</h4>
                    <div className="text-xs text-gray-400 truncate w-full">{stock.name}</div>
                </div>
                <div className={cn(
                    "text-xs font-bold px-2 py-1 rounded bg-white/5 border",
                    sentimentColors[stock.sentiment]
                )}>
                    {stock.sentiment.toUpperCase()}
                </div>
            </div>

            <div className="flex items-end justify-between mt-4">
                <div>
                    <div className="text-2xl font-bold font-mono">
                        ₹{stock.price.toLocaleString()}
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-bold",
                        isPositive ? "text-dusty-rose" : "text-deep-teal"
                    )}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{stock.change > 0 && '+'}{stock.change} ({stock.changePercent}%)</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    <div className="text-xs text-gray-500 font-mono">AURA SCORE</div>
                    <div className="text-sm font-bold text-white flex items-center gap-1">
                        <Activity size={12} className="text-lavender" />
                        {stock.aura}
                    </div>
                </div>
            </div>

            {/* Mini Chart Visualization (Placeholder for sparkline) */}
            <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={cn("h-full", isPositive ? "bg-dusty-rose" : "bg-deep-teal")}
                    style={{ width: `${Math.abs(stock.changePercent) * 20}%` }} // Dynamic width for effect
                />
            </div>
        </GlassCard>
    );
};
