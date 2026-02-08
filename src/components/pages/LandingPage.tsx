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
            {/* Background Orb */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <Orb
                    hue={270}
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    forceHoverState={true}
                />
            </div>

            {/* Unified Background Vignette */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(5,5,7,0)_0%,#050507_100%)]" />
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40 bg-gradient-to-b from-transparent via-[#050507]/20 to-[#050507]" />

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 md:px-12 flex justify-between items-center">
                <div className="text-4xl md:text-4xl font-bricolage font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                    RYAION
                </div>
                <div className="flex gap-4">
                    <CyberButton onClick={onGetStarted} className="text-lg px-10 py-3.5 h-auto">
                        GET ACCESS
                    </CyberButton>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono tracking-widest text-white mb-8 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        SYSTEM ONLINE V1.0
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bricolage font-black tracking-tighter leading-[0.8] mb-10 pb-2">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">MARKET</span>
                        <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-lavender via-white to-dusty-rose italic pb-1">INTELLIGENCE</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed opacity-80 font-medium">
                        Decode the stock market with AI-driven insights.
                        Real-time analysis, competitive arena, and explainable outcomes.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <CyberButton
                            glow
                            className="text-xl px-10 py-5 h-auto min-w-[260px]"
                            onClick={onGetStarted}
                        >
                            ENTER MATRIX <ArrowRight className="ml-2 w-6 h-6" />
                        </CyberButton>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-6xl mx-auto w-full text-left"
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
    <GlassCard className="p-8 hover:bg-white/5 transition-all group cursor-default">
        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500 [&>svg]:w-8 [&>svg]:h-8">
            {icon}
        </div>
        <h3 className="text-xl font-bold font-bricolage mb-3 text-gray-200 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-base text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{desc}</p>
    </GlassCard>
);
