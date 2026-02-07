import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { cn } from "../../lib/utils";

export interface Suggestion {
    id: string;
    symbol: string;
    name: string;
    price: string;
    change: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    ai_score: number;
    confidence: number;
    risk_level: 'LOW' | 'MED' | 'HIGH';
    target_price: number;
    reason: string;
    created_at?: string;
}

interface SuggestionCardProps {
    suggestion: Suggestion;
    delay?: number;
}

export const SuggestionCard = ({ suggestion, delay = 0 }: SuggestionCardProps) => {
    const isBullish = suggestion.action === 'BUY';
    const accentColor = isBullish ? "text-market-green" : suggestion.action === 'SELL' ? "text-sangria-red" : "text-yellow-400";
    const bgAccent = isBullish ? "bg-market-green/10" : suggestion.action === 'SELL' ? "bg-sangria-red/10" : "bg-yellow-400/10";
    const borderAccent = isBullish ? "border-market-green/30" : suggestion.action === 'SELL' ? "border-sangria-red/30" : "border-yellow-400/30";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
        >
            <GlassCard className={cn("p-5 border-l-4 relative overflow-hidden group hover:bg-white/5 transition-all", borderAccent)}>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold font-bricolage">{suggestion.symbol}</h3>
                            <span className="text-xs text-gray-400 font-mono">{suggestion.name}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="font-mono text-lg">{suggestion.price}</span>
                            <span className={cn("text-xs flex items-center", parseFloat(suggestion.change) >= 0 ? "text-market-green" : "text-sangria-red")}>
                                {parseFloat(suggestion.change) >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                                {suggestion.change}
                            </span>
                        </div>
                    </div>

                    <div className={cn("px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5", bgAccent, accentColor, borderAccent)}>
                        {suggestion.action === 'BUY' && <CheckCircle size={12} />}
                        {suggestion.action === 'SELL' && <AlertTriangle size={12} />}
                        {suggestion.action}
                    </div>
                </div>

                <div className="flex gap-4 mb-4 text-xs font-mono text-gray-400 bg-white/5 p-2 rounded">
                    <div>
                        <span className="block text-[10px] opacity-70">AI SCORE</span>
                        <span className="text-white font-bold text-sm">{suggestion.ai_score}/100</span>
                    </div>
                    <div>
                        <span className="block text-[10px] opacity-70">TARGET</span>
                        <span className="text-white font-bold text-sm">₹{suggestion.target_price}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{suggestion.reason}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-t border-white/10 pt-3">
                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span>CONFIDENCE</span>
                            <span className="text-white font-bold">{suggestion.confidence}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span>RISK</span>
                            <span className={cn(
                                "font-bold",
                                suggestion.risk_level === 'LOW' ? "text-market-green" : suggestion.risk_level === 'HIGH' ? "text-sangria-red" : "text-yellow-400"
                            )}>{suggestion.risk_level}</span>
                        </div>
                    </div>

                    <CyberButton variant="ghost" className="h-8 text-xs hover:pl-4 transition-all group/btn">
                        DETAILS <ArrowRight size={12} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                    </CyberButton>
                </div>
            </GlassCard>
        </motion.div>
    );
};
