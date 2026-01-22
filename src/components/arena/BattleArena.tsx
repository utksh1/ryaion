import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { useState } from "react";
import { Swords, Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface Fighter {
    symbol: string;
    aura: number;
    stats: {
        price: string;
        pe: number;
        growth: string;
    };
}

export const BattleArena = () => {
    const [battleState, setBattleState] = useState<'IDLE' | 'FIGHTING' | 'FINISHED'>('IDLE');
    const [winner, setWinner] = useState<string | null>(null);

    const fighter1: Fighter = {
        symbol: "ZOMATO",
        aura: 95,
        stats: { price: "₹185", pe: 120, growth: "+45%" }
    };

    const fighter2: Fighter = {
        symbol: "PAYTM",
        aura: 30,
        stats: { price: "₹420", pe: -15, growth: "-12%" }
    };

    const startBattle = () => {
        setBattleState('FIGHTING');
        setTimeout(() => {
            setBattleState('FINISHED');
            setWinner(fighter1.aura > fighter2.aura ? fighter1.symbol : fighter2.symbol);
        }, 3000);
    };

    return (
        <div className="h-full flex flex-col items-center justify-center relative p-8">
            <h2 className="text-4xl font-bricolage font-bold mb-8 flex items-center gap-4">
                <Swords size={48} className="text-sangria-red" />
                BATTLE ARENA
                <Swords size={48} className="text-sangria-red scale-x-[-1]" />
            </h2>

            {/* Battle Stage */}
            <div className="flex items-center justify-center gap-12 w-full max-w-5xl">
                {/* Fighter 1 */}
                <FighterCard fighter={fighter1} isWinner={winner === fighter1.symbol} state={battleState} />

                {/* VS / Result */}
                <div className="flex flex-col items-center z-10">
                    {battleState === 'IDLE' && (
                        <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-white/20 flex items-center justify-center text-2xl font-bold font-bricolage italic">
                            VS
                        </div>
                    )}

                    {battleState === 'FIGHTING' && (
                        <div className="w-24 h-24 rounded-full flex items-center justify-center">
                            <Zap size={48} className="text-yellow-400 animate-spin" />
                        </div>
                    )}

                    {battleState === 'FINISHED' && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1.5 }}
                            className="text-market-green font-bold text-lg"
                        >
                            <Trophy size={48} />
                        </motion.div>
                    )}
                </div>

                {/* Fighter 2 */}
                <FighterCard fighter={fighter2} isWinner={winner === fighter2.symbol} state={battleState} reversed />
            </div>

            <div className="mt-12">
                {battleState === 'IDLE' && (
                    <CyberButton glow onClick={startBattle} className="text-xl px-12 py-6">
                        INITIATE CLASH
                    </CyberButton>
                )}
                {battleState === 'FINISHED' && (
                    <CyberButton variant="secondary" onClick={() => { setBattleState('IDLE'); setWinner(null); }}>
                        RESET ARENA
                    </CyberButton>
                )}
            </div>
        </div>
    );
};

const FighterCard = ({ fighter, isWinner, state, reversed = false }: { fighter: Fighter, isWinner: boolean, state: string, reversed?: boolean }) => {
    return (
        <GlassCard className={cn(
            "w-80 h-96 p-6 flex flex-col items-center justify-between border-2 transition-all duration-500",
            state === 'FINISHED' && isWinner ? "border-market-green bg-market-green/10 shadow-[0_0_50px_rgba(0,255,194,0.3)] scale-110" : "border-white/10",
            state === 'FINISHED' && !isWinner ? "opacity-50 grayscale scale-90" : "",
            reversed ? "items-end text-right" : "items-start text-left"
        )}>
            <div>
                <h3 className="text-3xl font-bricolage font-bold">{fighter.symbol}</h3>
                <div className="text-sm text-gray-400 mt-1 font-mono">{fighter.stats.price}</div>
            </div>

            {/* Energy Bar visual */}
            <div className="w-full flex-1 flex flex-col justify-center gap-4 py-4">
                <div className="space-y-1 w-full">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>GROWTH</span>
                        <span className={parseFloat(fighter.stats.growth) > 0 ? "text-green-400" : "text-red-400"}>
                            {fighter.stats.growth}
                        </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 w-3/4" />
                    </div>
                </div>

                <div className="space-y-1 w-full">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>P/E RATIO</span>
                        <span>{fighter.stats.pe}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white/30 w-1/2" />
                    </div>
                </div>
            </div>

            <div className="w-full">
                <div className="text-xs text-center text-gray-500 mb-2">AURA LEVEL</div>
                <div className="h-6 w-full bg-black/50 rounded overflow-hidden relative">
                    <motion.div
                        className={cn("h-full", isWinner || state !== 'FINISHED' ? "bg-sangria-red" : "bg-gray-600")}
                        initial={{ width: 0 }}
                        animate={{ width: `${fighter.aura}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
                <div className="text-center font-bold mt-1">{fighter.aura}/100</div>
            </div>
        </GlassCard>
    );
};
