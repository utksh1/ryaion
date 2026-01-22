import { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { CyberButton } from '../ui/CyberButton';
import { analyzeStock, type OracleAnalysis } from '../../services/aiService';
import { Loader2, BrainCircuit, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OracleViewProps {
    onClose: () => void;
}

export const OracleView = ({ onClose }: OracleViewProps) => {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OracleAnalysis | null>(null);

    const handleAnalyze = async () => {
        if (!search) return;
        setLoading(true);
        setResult(null);
        try {
            const data = await analyzeStock(search.toUpperCase());
            setResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <GlassCard className="w-full max-w-2xl h-auto min-h-[500px] border-dusty-rose/30 flex flex-col relative overflow-hidden bg-black/90">
                {/* Background Grid Animation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(207,152,147,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(207,152,147,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white z-20">
                    <X size={24} />
                </button>

                <div className="p-8 relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-dusty-rose/10 rounded-full flex items-center justify-center mb-4 border border-dusty-rose/30">
                        <BrainCircuit size={32} className="text-dusty-rose animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-bricolage font-bold text-center mb-2">
                        AI ORACLE <span className="text-dusty-rose">V3.0</span>
                    </h2>
                    <p className="text-gray-400 text-center mb-2 max-w-sm">
                        Enter a stock symbol for neural decoding. Powered by Nemotron AI.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-lavender mb-6">
                        <Sparkles size={12} />
                        <span>Real AI Analysis</span>
                    </div>

                    <div className="flex gap-2 w-full max-w-md mb-8">
                        <input
                            type="text"
                            placeholder="ex. RELIANCE, ZOMATO, TCS"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex-1 text-white placeholder:text-gray-600 focus:outline-none focus:border-dusty-rose/50 font-mono uppercase"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        />
                        <CyberButton onClick={handleAnalyze} glow disabled={loading} className="min-w-[120px]">
                            {loading ? <Loader2 className="animate-spin" /> : 'DECODE'}
                        </CyberButton>
                    </div>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full bg-white/5 rounded-xl border border-white/10 p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">THE VERDICT</div>
                                        <div className={cn(
                                            "text-4xl font-bricolage font-bold",
                                            result.verdict === 'BUY' ? 'text-dusty-rose' :
                                                result.verdict === 'SELL' ? 'text-deep-teal' : 'text-lavender'
                                        )}>
                                            {result.verdict}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 mb-1">RISK LEVEL</div>
                                        <div className={cn("font-mono font-bold",
                                            result.riskScore === 'LOW' ? 'text-dusty-rose' :
                                                result.riskScore === 'HIGH' ? 'text-deep-teal' : 'text-lavender'
                                        )}>
                                            {result.riskScore}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded-lg border border-white/5 mb-4">
                                    <p className="text-gray-300 italic text-lg leading-relaxed">"{result.summary}"</p>
                                </div>

                                <ul className="space-y-2">
                                    {result.signals.map((sig, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                                            <span className="w-1.5 h-1.5 bg-dusty-rose rounded-full" />
                                            {sig}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </GlassCard>
        </div>
    );
};
