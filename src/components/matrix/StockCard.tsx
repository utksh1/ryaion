import { GlassCard } from "../ui/GlassCard";
import type { StockData } from "../../data/mockMarketData";
import { cn } from "../../lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface StockCardProps {
    stock: StockData;
    onClick?: () => void;
}

export const StockCard = ({ stock, onClick }: StockCardProps) => {
    const isPositive = stock.change >= 0;

    const sentimentColors = {
        fomo: "text-yellow-400 border-yellow-400/20 shadow-yellow-400/10",
        panic: "text-red-500 border-red-500/20 shadow-red-500/10",
        neutral: "text-gray-400 border-gray-400/20",
        hype: "text-market-green border-market-green/20 shadow-green-500/20"
    };

    return (
        <GlassCard
            hoverEffect
            onClick={onClick}
            className={cn(
                "p-6 border-l-4 transition-all duration-300 cursor-pointer overflow-hidden group",
                isPositive ? "border-l-dusty-rose" : "border-l-deep-teal"
            )}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="font-bold text-xl font-bricolage tracking-tighter group-hover:text-white transition-colors">{stock.symbol}</h4>
                    <div className="text-sm text-gray-500 truncate w-full group-hover:text-gray-400 transition-colors">{stock.name}</div>
                </div>
                <div className={cn(
                    "text-[10px] font-black px-2.5 py-1 rounded bg-white/5 border tracking-widest",
                    sentimentColors[stock.sentiment]
                )}>
                    {stock.sentiment.toUpperCase()}
                </div>
            </div>

            <div className="flex items-end justify-between mt-6">
                <div>
                    <div className="text-3xl font-black font-mono tracking-tighter group-hover:scale-105 transition-transform origin-left">
                        ₹{stock.price.toLocaleString()}
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 text-sm font-bold mt-1",
                        isPositive ? "text-dusty-rose" : "text-deep-teal"
                    )}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        <span>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <div className="text-[10px] text-gray-500 font-mono tracking-tighter">AURA SCORE</div>
                    <div className="text-lg font-black text-white flex items-center gap-1.5">
                        <Activity size={16} className="text-lavender" />
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
