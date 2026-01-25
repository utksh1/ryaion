import { useState } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { GlassCard } from "./components/ui/GlassCard";
import { CyberButton } from "./components/ui/CyberButton";
import { NeuralGrid } from "./components/matrix/NeuralGrid";
import { HypeMeter } from "./components/matrix/HypeMeter";
import { OracleView } from "./components/oracle/OracleView";
import { BattleArena } from "./components/arena/BattleArena";
import { PortfolioVault } from "./components/vault/PortfolioVault";
import { AskRya } from "./components/askrya/AskRya";
import { AuthSwitch } from "./components/ui/auth-switch";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const [activeTab, setActiveTab] = useState("matrix");
  const [showOracleModal, setShowOracleModal] = useState(false);

  // When Oracle tab is clicked, we might want a full view or modal.
  // Requirement says "Advisor Node", implies a full view.
  // But my previous OracleView was a modal. I'll make it a modal for now or handle 'oracle' tab to open modal.
  const handleNavigate = (tab: string) => {
    if (tab === 'oracle') {
      setShowOracleModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <AppLayout activeTab={activeTab} onNavigate={handleNavigate}>
      <AskRya />
      <AnimatePresence mode="wait">
        {/* Oracle Modal Overlay */}
        {showOracleModal && <OracleView onClose={() => setShowOracleModal(false)} />}

        {/* Views */}
        {activeTab === 'matrix' && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full text-white"
          >
            {/* Left Col - Market Matrix */}
            <div className="md:col-span-8 flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-2xl font-bricolage text-white tracking-tight flex items-center gap-2">
                    <span className="text-lavender">///</span> MARKET SURVEILLANCE
                  </h2>
                  <CyberButton variant="ghost" className="text-xs border border-white/10">View Full Matrix</CyberButton>
                </div>
                <NeuralGrid />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 h-[200px]">
                  <h3 className="text-lg font-bold mb-2 text-dusty-rose">Top Gainers</h3>
                  <div className="text-xs text-gray-400">Mock Data Module - Pending</div>
                </GlassCard>
                <GlassCard className="p-6 h-[200px]">
                  <h3 className="text-lg font-bold mb-2 text-deep-teal">Top Losers</h3>
                  <div className="text-xs text-gray-400">Mock Data Module - Pending</div>
                </GlassCard>
              </div>
            </div>

            {/* Right Col - Intelligence & Hype */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <HypeMeter />

              <GlassCard className="p-6 flex-1 min-h-[400px] bg-gradient-to-b from-white/5 to-black/40 border-lavender/20">
                <h3 className="text-xl font-bricolage mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-market-green rounded-full animate-ping" />
                  AI ORACLE
                </h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} onClick={() => setShowOracleModal(true)} className="p-4 rounded-xl bg-black/40 border border-white/5 text-sm hover:border-lavender/50 transition-colors cursor-pointer group">
                      <div className="flex justify-between mb-2">
                        <span className="font-bold tracking-wider">TATASTEEL</span>
                        <span className="text-dusty-rose text-xs font-bold border border-dusty-rose/20 px-2 py-0.5 rounded bg-dusty-rose/5">BULLISH</span>
                      </div>
                      <p className="text-gray-400 text-xs italic group-hover:text-gray-300">"Main character energy. Steel cycle looking feral."</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <CyberButton glow className="w-full" onClick={() => setShowOracleModal(true)}>Ask Oracle</CyberButton>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}

        {activeTab === 'arena' && (
          <motion.div
            key="arena"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-full"
          >
            <BattleArena />
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="h-full"
          >
            <PortfolioVault />
          </motion.div>
        )}

        {activeTab === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="h-full flex items-center justify-center"
          >
            <AuthSwitch />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
