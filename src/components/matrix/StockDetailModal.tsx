import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { X, TrendingUp, TrendingDown, Calendar, Activity } from "lucide-react";
import type { LiveStockData } from "../../services/marketDataService";
import { TradingViewChart } from "./TradingViewChart";
import { analyzeStock, type AIAnalysisResult } from "../../services/aiAnalyticsService";

interface StockDetailModalProps {
    stock: LiveStockData | null;
    onClose: () => void;
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [errorAI, setErrorAI] = useState<string | null>(null);

    const handleRunAnalysis = async () => {
        if (!stock) return;
        setLoadingAI(true);
        setErrorAI(null);
        try {
            const result = await analyzeStock(stock.symbol);
            setAnalysis(result);
        } catch (err: any) {
            console.error(err);
            setErrorAI(err.message || "Failed to link with Neural Engine");
        } finally {
            setLoadingAI(false);
        }
    };

    // Reset analysis when stock changes
    useEffect(() => {
        setAnalysis(null);
    }, [stock?.symbol]);

    if (!stock) return null;

    const isPositive = stock.changePercent >= 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    className="w-full max-w-7xl h-full max-h-[92vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GlassCard className="relative overflow-hidden flex flex-col h-full rounded-2xl border-white/10 shadow-3xl">
                        {/* Header - More Compact & Efficient */}
                        <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-black/40">
                            <div>
                                <h2 className="text-3xl font-bold font-bricolage text-white flex items-center gap-3">
                                    {stock.symbol}
                                    <span className="text-sm font-normal text-white/40 tracking-widest border border-white/10 px-2 py-0.5 rounded uppercase">
                                        Equity
                                    </span>
                                </h2>
                                <p className="text-sm text-white/60 mt-1">{stock.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <CyberButton
                                    className="text-xs px-3 py-1 bg-market-green/20 text-market-green border-market-green/50 hover:bg-market-green/30"
                                    onClick={() => alert(`Simulated Trade for ${stock.symbol} initiated.`)}
                                >
                                    SIMULATE TRADE
                                </CyberButton>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-y-auto px-6 py-4 space-y-6">
                            {/* TradingView Advanced Chart */}
                            <div className="flex flex-col gap-2">
                                <div className="rounded-xl bg-[#131722] border border-white/5 overflow-hidden h-[65vh] relative shadow-2xl">
                                    <TradingViewChart symbol={stock.symbol} />
                                </div>
                            </div>

                            {/* Key Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Price</div>
                                    <div className="text-2xl font-mono font-bold text-white">₹{stock.price.toLocaleString()}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">24h Change</div>
                                    <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${isPositive ? "text-market-green" : "text-market-red"}`}>
                                        {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                        {stock.changePercent.toFixed(2)}%
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">High</div>
                                    <div className="text-2xl font-mono font-bold text-white">₹{stock.high.toLocaleString()}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                    <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Low</div>
                                    <div className="text-2xl font-mono font-bold text-white">₹{stock.low.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* AI INTELLIGENCE LAYER */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-lavender/5 to-black/50 border border-lavender/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <Activity size={100} />
                                </div>

                                <h3 className="text-lg font-bricolage text-lavender mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-lavender rounded-full animate-pulse" />
                                    AI NEURAL DIAGNOSTICS
                                </h3>

                                {errorAI && (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <p className="text-xs text-market-red font-bold mb-2 uppercase tracking-widest">{errorAI}</p>
                                        <CyberButton variant="ghost" className="text-[10px] scale-75" onClick={handleRunAnalysis}>
                                            RETRY LINK
                                        </CyberButton>
                                    </div>
                                )}

                                {!analysis && !loadingAI && !errorAI && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <CyberButton glow onClick={handleRunAnalysis}>
                                            INITIALIZE DIAGNOSTICS
                                        </CyberButton>
                                        <p className="text-xs text-white/30 mt-3 tracking-widest uppercase">Awaiting Neural Link...</p>
                                    </div>
                                )}

                                {loadingAI && (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <div className="w-8 h-8 border-2 border-lavender border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-xs text-lavender animate-pulse tracking-widest uppercase">Processing Market Signals...</p>
                                    </div>
                                )}

                                {analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                    >
                                        {/* Score */}
                                        <div className="flex flex-col gap-2">
                                            <div className="text-xs text-white/40 uppercase tracking-wider">Neural Score</div>
                                            <div className="text-4xl font-black font-bricolage text-white">
                                                {analysis.ai_score}<span className="text-lg text-white/30">/100</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${analysis.ai_score > 60 ? 'bg-market-green' : analysis.ai_score < 40 ? 'bg-market-red' : 'bg-yellow-500'}`}
                                                    style={{ width: `${analysis.ai_score}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Sentiment */}
                                        <div className="flex flex-col gap-2">
                                            <div className="text-xs text-white/40 uppercase tracking-wider">Market Sentiment</div>
                                            <div className={`text-xl font-bold px-3 py-1 rounded border self-start ${analysis.sentiment === 'BULLISH' ? 'bg-market-green/10 border-market-green text-market-green' :
                                                analysis.sentiment === 'BEARISH' ? 'bg-market-red/10 border-market-red text-market-red' :
                                                    'bg-white/10 border-white/20 text-white'
                                                }`}>
                                                {analysis.sentiment}
                                            </div>
                                            <div className="text-[10px] text-white/40">Confidence: {analysis.confidence}%</div>
                                        </div>

                                        {/* Reason */}
                                        <div className="flex flex-col gap-2">
                                            <div className="text-xs text-white/40 uppercase tracking-wider">Primary Intelligence</div>
                                            <p className="text-sm text-white/80 leading-relaxed italic">
                                                "{analysis.reason}"
                                            </p>
                                        </div>

                                        {/* Technicals Row */}
                                        <div className="md:col-span-3 grid grid-cols-4 gap-2 mt-2 pt-4 border-t border-white/5">
                                            <div className="text-center p-2 rounded bg-black/20">
                                                <div className="text-[9px] text-white/30 uppercase">RSI (14)</div>
                                                <div className="font-mono text-sm">{analysis.indicators.rsi.toFixed(2)}</div>
                                            </div>
                                            <div className="text-center p-2 rounded bg-black/20">
                                                <div className="text-[9px] text-white/30 uppercase">MACD</div>
                                                <div className="font-mono text-sm">{analysis.indicators.macd.MACD.toFixed(2)}</div>
                                            </div>
                                            <div className="text-center p-2 rounded bg-black/20">
                                                <div className="text-[9px] text-white/30 uppercase">SMA (50)</div>
                                                <div className="font-mono text-sm">{analysis.indicators.sma50?.toFixed(2) || 'N/A'}</div>
                                            </div>
                                            <div className="text-center p-2 rounded bg-black/20">
                                                <div className="text-[9px] text-white/30 uppercase">Signal</div>
                                                <div className="font-mono text-sm">{analysis.indicators.macd.signal.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Footer / Meta */}
                            <div className="text-[10px] text-white/30 text-center flex items-center justify-center gap-2">
                                <Calendar size={12} />
                                Last Updated: {new Date(stock.timestamp).toLocaleString()}
                            </div>

                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
