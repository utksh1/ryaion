import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { useState, useEffect } from "react";
import { Swords, Trophy, Zap, ChevronDown, Activity, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { fetchLiveStock, fetchAllStocks, type LiveStockData } from "../../services/marketDataService";
import { chatWithAI } from "../../services/aiService";

interface Fighter {
    symbol: string;
    name: string;
    aura: number;
    stats: {
        price: number;
        pe: number;
        growth: number;
        rsi: number;
        volatility: number;
    };
}

export const BattleArena = () => {
    const [battleState, setBattleState] = useState<'IDLE' | 'FIGHTING' | 'FINISHED'>('IDLE');
    const [winner, setWinner] = useState<string | null>(null);
    const [aiVerdict, setAiVerdict] = useState<string>("");

    const [fighter1, setFighter1] = useState<Fighter | null>(null);
    const [fighter2, setFighter2] = useState<Fighter | null>(null);
    const [availableStocks, setAvailableStocks] = useState<LiveStockData[]>([]);
    const [showSelector, setShowSelector] = useState<{ active: boolean, side: 1 | 2 }>({ active: false, side: 1 });
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const init = async () => {
            const stocks = await fetchAllStocks();
            setAvailableStocks(stocks);

            // Set defaults if possible
            if (stocks.length >= 2) {
                const f1 = await selectFighter(stocks[0].symbol);
                const f2 = await selectFighter(stocks[1].symbol);
                if (f1) setFighter1(f1);
                if (f2) setFighter2(f2);
            }
        };
        init();
    }, []);

    const selectFighter = async (symbol: string): Promise<Fighter | null> => {
        const stock = await fetchLiveStock(symbol);
        if (!stock) return null;

        // Mocking some advanced stats for the clash
        return {
            symbol: stock.symbol,
            name: stock.name,
            aura: calculateAura(stock),
            stats: {
                price: stock.price,
                pe: symbol === 'ZOMATO' ? 120 : 15 + Math.random() * 20,
                growth: stock.changePercent,
                rsi: 45 + Math.random() * 30,
                volatility: 1.2 + Math.random() * 0.8
            }
        };
    };

    const calculateAura = (stock: LiveStockData) => {
        let score = 50 + (stock.changePercent * 8);
        return Math.min(100, Math.max(10, Math.round(score)));
    };

    const handleSelect = async (symbol: string) => {
        const f = await selectFighter(symbol);
        if (f) {
            if (showSelector.side === 1) setFighter1(f);
            else setFighter2(f);
        }
        setShowSelector({ active: false, side: 1 });
        setSearchQuery("");
        setWinner(null);
        setBattleState('IDLE');
    };

    const startBattle = async () => {
        if (!fighter1 || !fighter2) return;
        setBattleState('FIGHTING');
        setWinner(null);

        // Get AI Prediction from Backend
        const predictionPrompt = `
        Predict the winner of a 24-hour trading battle between ${fighter1.symbol} and ${fighter2.symbol}.
        ${fighter1.symbol} Stats: RSI ${fighter1.stats.rsi.toFixed(1)}, Trend ${fighter1.stats.growth.toFixed(2)}%, PE ${fighter1.stats.pe}.
        ${fighter2.symbol} Stats: RSI ${fighter2.stats.rsi.toFixed(1)}, Trend ${fighter2.stats.growth.toFixed(2)}%, PE ${fighter2.stats.pe}.
        Winner is likely the one with better technical momentum (RSI near 50-60 is healthy, >70 overbought).
        Respond with: Winner: [SYMBOL]. Reason: [1 sentence max].
        `;

        try {
            const result = await chatWithAI([{ role: 'user', content: predictionPrompt }]);

            setTimeout(() => {
                const winnerSymbol = result.includes(fighter2.symbol) ? fighter2.symbol : fighter1.symbol;
                setWinner(winnerSymbol);
                setAiVerdict(result);
                setBattleState('FINISHED');
            }, 3000);
        } catch (e) {
            // Fallback to Aura if AI fails
            setTimeout(() => {
                setWinner(fighter1.aura > fighter2.aura ? fighter1.symbol : fighter2.symbol);
                setAiVerdict("Neural link failure. Winner determined via technical aura levels.");
                setBattleState('FINISHED');
            }, 3000);
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative p-4 max-w-7xl mx-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lavender/5 blur-[120px] rounded-full animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 relative z-10"
            >
                <h2 className="text-5xl font-bricolage font-black tracking-tighter flex items-center justify-center gap-6">
                    <motion.div
                        animate={battleState === 'FIGHTING' ? { rotate: [0, -20, 20, 0], scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        <Swords size={56} className="text-lavender drop-shadow-[0_0_15px_rgba(151,117,250,0.5)]" />
                    </motion.div>
                    BATTLE ARENA
                    <motion.div
                        animate={battleState === 'FIGHTING' ? { rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                        <Swords size={56} className="text-lavender scale-x-[-1] drop-shadow-[0_0_15px_rgba(151,117,250,0.5)]" />
                    </motion.div>
                </h2>
                <p className="text-gray-500 font-medium tracking-widest text-xs mt-2 uppercase">Neural-Link Stock Clash Environment</p>
            </motion.div>

            {/* Battle Stage */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full relative z-10">
                {/* Fighter 1 */}
                <FighterCard
                    fighter={fighter1}
                    isWinner={winner === fighter1?.symbol}
                    state={battleState}
                    onSelect={() => setShowSelector({ active: true, side: 1 })}
                />

                {/* VS Center */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative group">
                        <AnimatePresence mode="wait">
                            {battleState === 'IDLE' && (
                                <motion.div
                                    key="vs"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    className="w-20 h-20 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center justify-center text-xl font-black font-bricolage italic text-white/40 group-hover:text-lavender group-hover:border-lavender/40 transition-all duration-300"
                                >
                                    VS
                                </motion.div>
                            )}
                            {battleState === 'FIGHTING' && (
                                <motion.div
                                    key="fighting"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: [1, 1.5, 1], opacity: 1 }}
                                    transition={{ repeat: Infinity, duration: 0.4 }}
                                    className="w-20 h-20 flex items-center justify-center"
                                >
                                    <Zap size={64} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                                </motion.div>
                            )}
                            {battleState === 'FINISHED' && (
                                <motion.div
                                    key="finished"
                                    initial={{ scale: 0, y: 50 }}
                                    animate={{ scale: 1.2, y: 0 }}
                                    className="w-20 h-20 bg-market-green/20 rounded-full border border-market-green/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,194,0.2)]"
                                >
                                    <Trophy size={40} className="text-market-green" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Fighter 2 */}
                <FighterCard
                    fighter={fighter2}
                    isWinner={winner === fighter2?.symbol}
                    state={battleState}
                    reversed
                    onSelect={() => setShowSelector({ active: true, side: 2 })}
                />
            </div>

            {/* AI Verdict */}
            <AnimatePresence>
                {battleState === 'FINISHED' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 rounded-xl bg-lavender/5 border border-lavender/20 max-w-2xl text-center backdrop-blur-md"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Activity size={16} className="text-lavender" />
                            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-lavender/60">Neural Analysis Report</span>
                        </div>
                        <p className="text-sm font-medium text-white tracking-wide italic">
                            "{aiVerdict}"
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Control Panel */}
            <div className="mt-12 flex gap-4">
                {battleState === 'IDLE' && (
                    <CyberButton
                        glow
                        disabled={!fighter1 || !fighter2 || fighter1.symbol === fighter2.symbol}
                        onClick={startBattle}
                        className="text-xl px-16 py-8 h-auto"
                    >
                        INITIATE NEURAL CLASH
                    </CyberButton>
                )}
                {battleState === 'FINISHED' && (
                    <CyberButton variant="secondary" onClick={() => { setBattleState('IDLE'); setWinner(null); }} className="px-12 py-4">
                        RESET ENIVORNMENT
                    </CyberButton>
                )}
            </div>

            {/* Stock Selector Overlay */}
            <AnimatePresence>
                {showSelector.active && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-black/40" onClick={() => { setShowSelector({ ...showSelector, active: false }); setSearchQuery(""); }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0a0a0b] border border-white/10 p-2 rounded-2xl w-full max-w-md shadow-3xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/5 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-white">Select Neural Processor {showSelector.side}</h3>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                        {availableStocks.filter(s =>
                                            s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            s.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length} Assets
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lavender transition-colors" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Filter by identifier or neural signature..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-lavender/40 focus:bg-lavender/5 transition-all"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
                                {availableStocks
                                    .filter(s =>
                                        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        s.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map(s => (
                                        <button
                                            key={s.symbol}
                                            onClick={() => handleSelect(s.symbol)}
                                            className="w-full text-left p-4 hover:bg-lavender/10 rounded-xl transition-all border border-transparent hover:border-lavender/20 group flex justify-between items-center"
                                        >
                                            <div>
                                                <div className="font-bold group-hover:text-lavender transition-colors">{s.symbol}</div>
                                                <div className="text-[10px] text-gray-500 uppercase">{s.name}</div>
                                            </div>
                                            <div className={cn("text-xs font-bold px-2 py-0.5 rounded border",
                                                s.changePercent > 0 ? "text-market-green border-market-green/20 bg-market-green/5" : "text-market-red border-market-red/20 bg-market-red/5"
                                            )}>
                                                {s.changePercent > 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FighterCard = ({ fighter, isWinner, state, reversed = false, onSelect }: { fighter: Fighter | null, isWinner: boolean, state: string, reversed?: boolean, onSelect: () => void }) => {
    if (!fighter) {
        return (
            <div onClick={onSelect} className="w-80 h-[480px] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-lavender/40 hover:bg-lavender/5 transition-all group">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ChevronDown className="text-gray-500" />
                </div>
                <div className="text-gray-500 font-bold uppercase tracking-widest text-xs">Load Asset Processor</div>
            </div>
        );
    }

    return (
        <GlassCard
            className={cn(
                "w-80 h-[500px] p-6 flex flex-col transition-all duration-700 relative overflow-hidden",
                state === 'FINISHED' && isWinner ? "border-market-green bg-market-green/5 ring-4 ring-market-green/20 scale-105 z-20" : "border-white/10",
                state === 'FINISHED' && !isWinner ? "opacity-30 grayscale blur-[2px] scale-95" : "hover:border-lavender/40",
                state === 'FIGHTING' ? "animate-shake" : ""
            )}
        >
            {/* Selection Trigger */}
            <button
                onClick={onSelect}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors z-10"
            >
                <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Header */}
            <div className={cn("mb-8", reversed ? "text-right" : "text-left")}>
                <h3 className="text-4xl font-black font-bricolage tracking-tighter text-white">{fighter.symbol}</h3>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">{fighter.name}</div>
                <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-mono tracking-tighter text-lavender font-bold">₹{fighter.stats.price.toLocaleString()}</span>
                    <span className={cn("text-[10px] font-bold", fighter.stats.growth > 0 ? "text-market-green" : "text-market-red")}>
                        {fighter.stats.growth > 0 ? '▲' : '▼'}{Math.abs(fighter.stats.growth).toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* Stats Clash Grid */}
            <div className="flex-1 space-y-4">
                <StatBar label="Neural Momentum" value={fighter.stats.rsi} color="bg-lavender" subText={`RSI ${fighter.stats.rsi.toFixed(1)}`} />
                <StatBar label="Market Multiplier" value={Math.min(100, fighter.stats.pe)} color="bg-market-green" subText={`PE ${fighter.stats.pe.toFixed(0)}`} />
                <StatBar label="Signal Gravity" value={Math.min(100, 100 / fighter.stats.volatility)} color="bg-orange-400" subText={`Risk ${fighter.stats.volatility.toFixed(1)}`} />
            </div>

            {/* Aura Level UI */}
            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] uppercase font-black tracking-[0.3em] text-white/40">Neural Integrity</span>
                    <span className="text-sm font-black font-mono text-white">{fighter.aura}%</span>
                </div>
                <div className="h-8 w-full bg-black/40 rounded-lg p-1.5 border border-white/5 relative group overflow-hidden">
                    <motion.div
                        className={cn("h-full rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                            isWinner || state !== 'FINISHED' ? "bg-gradient-to-r from-sangria-red to-lavender" : "bg-gray-600")}
                        initial={{ width: 0 }}
                        animate={{ width: `${fighter.aura}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                    />

                    {/* Inner scanline effect */}
                    <motion.div
                        className="absolute inset-0 bg-white/10 w-4 pointer-events-none"
                        animate={{ x: [0, 200, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </div>
            </div>

            {/* Winner Badge */}
            <AnimatePresence>
                {state === 'FINISHED' && isWinner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute -top-4 -right-4 bg-market-green text-black font-black text-[10px] px-3 py-1 rounded-full shadow-lg rotate-12 z-30"
                    >
                        CHAMPION
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
};

const StatBar = ({ label, value, color, subText }: { label: string, value: number, color: string, subText: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-white/30">
            <span>{label}</span>
            <span className="text-white/60">{subText}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                className={cn("h-full", color)}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay: 0.2 }}
            />
        </div>
    </div>
);
