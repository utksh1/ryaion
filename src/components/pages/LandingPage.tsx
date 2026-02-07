import { motion } from "framer-motion";
import { CyberButton } from "../ui/CyberButton";
import { GlassCard } from "../ui/GlassCard";
import Orb from "../ui/Orb/Orb";
import { ArrowRight, BarChart2, BrainCircuit, Zap } from "lucide-react";

interface LandingPageProps {
    onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col font-plus-jakarta overflow-hidden relative selection:bg-lavender/30">

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Orb
                    hue={270}
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    forceHoverState={true}
                    backgroundColor="#050507"
                />
            </div>

            {/* Gradient Overlays */}
            <div className="fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b from-[#050507]/0 via-[#050507]/50 to-[#050507] z-0 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#050507] via-[#050507]/80 to-transparent z-0 pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 md:px-12 flex justify-between items-center">
                <div className="text-2xl font-bricolage font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    RYAION
                </div>
                <div className="flex gap-4">
                    <button onClick={onGetStarted} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Login
                    </button>
                    <CyberButton onClick={onGetStarted} className="text-xs px-4 py-2 h-auto">
                        GET ACCESS
                    </CyberButton>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-80px]">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest text-lavender/80 mb-6 backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-market-green animate-pulse" />
                        SYSTEM ONLINE V1.0
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bricolage font-black tracking-tighter leading-[0.9] mb-6">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">MARKET</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-lavender via-white to-dusty-rose italic">INTELLIGENCE</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Decode the stock market with AI-driven insights.
                        Real-time analysis, competitive arena, and explainable outcomes.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                        <CyberButton
                            glow
                            className="text-lg px-8 py-4 h-auto min-w-[200px]"
                            onClick={onGetStarted}
                        >
                            ENTER MATRIX <ArrowRight className="ml-2 w-5 h-5" />
                        </CyberButton>

                        <button
                            onClick={() => window.open('https://github.com/your-repo', '_blank')}
                            className="px-8 py-4 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold tracking-wider"
                        >
                            VIEW DOCS
                        </button>
                    </div>
                </motion.div>

                {/* Feature Grid */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto w-full text-left"
                >
                    <FeatureCard
                        icon={<BrainCircuit className="text-lavender" />}
                        title="AI Stock Scoring"
                        desc="Probabilistic scoring 0-100 based on technicals, sentiment, and momentum."
                    />
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" />}
                        title="Stocks Arena"
                        desc="Head-to-head competitive analysis. See which stock wins the battle."
                    />
                    <FeatureCard
                        icon={<BarChart2 className="text-market-green" />}
                        title="Real-Time Data"
                        desc="Live market feeds and news sentiment analysis powered by edge functions."
                    />
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 text-center text-xs text-gray-600 font-mono">
                RYAION SYSTEMS © 2026 // ALL RIGHTS RESERVED
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <GlassCard className="p-6 hover:bg-white/5 transition-colors group cursor-default">
        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <h3 className="text-lg font-bold font-bricolage mb-2 text-gray-200">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </GlassCard>
);
