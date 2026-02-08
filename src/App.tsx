
import { useState, useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { GlassCard } from "./components/ui/GlassCard";
import { CyberButton } from "./components/ui/CyberButton";
import { MarketPulse } from "./components/matrix/MarketPulse";
import { NeuralGrid } from "./components/matrix/NeuralGrid";
import { HypeMeter } from "./components/matrix/HypeMeter";
import { OracleView } from "./components/oracle/OracleView";
import { BattleArena } from "./components/arena/BattleArena";
import { PortfolioVault } from "./components/vault/PortfolioVault";
import { AskRya } from "./components/askrya/AskRya";
import { AuthSwitch } from "./components/ui/auth-switch";
import { StockDetailModal } from "./components/matrix/StockDetailModal";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "./lib/supabaseClient";


import { fetchAllStocks, fetchApifyFinanceData, saveStocksToSupabase, subscribeToMarketUpdates, type LiveStockData } from "./services/marketDataService";
import { SettingsView } from "./components/settings/SettingsView";
import { LandingPage } from "./components/pages/LandingPage";


function App() {
  const [activeTab, setActiveTab] = useState("landing"); // Default to landing
  const [showOracleModal, setShowOracleModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [marketData, setMarketData] = useState<LiveStockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<LiveStockData | null>(null);

  useEffect(() => {
    // 1. Initial Session Check (and hash cleanup for OAuth)
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasSession = !!session;
      setIsLoggedIn(hasSession);

      if (hasSession) {
        if (activeTab === 'landing' || activeTab === 'login') {
          setActiveTab("matrix");
        }
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    initAuth();

    // 2. Global Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);

      // Redirect to matrix on sign in or if landing/login while authed
      if (event === 'SIGNED_IN' || (loggedIn && (activeTab === 'landing' || activeTab === 'login'))) {
        setActiveTab("matrix");
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      if (event === 'SIGNED_OUT') {
        setActiveTab("landing");
      }
    });

    const loadMarketData = async () => {
      const apifyData = await fetchApifyFinanceData();
      if (apifyData.length > 0) {
        setMarketData(apifyData);
        saveStocksToSupabase(apifyData);
      } else {
        const data = await fetchAllStocks();
        setMarketData(data);
      }
    };

    loadMarketData();
    const interval = setInterval(loadMarketData, 15000);

    const unsubscribeSocket = subscribeToMarketUpdates((updatedStock) => {
      setMarketData(prevData => {
        const index = prevData.findIndex(s => s.symbol === updatedStock.symbol);
        if (index !== -1) {
          const newData = [...prevData];
          newData[index] = { ...newData[index], ...updatedStock, history: newData[index].history };
          return newData;
        }
        return prevData;
      });
    });

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
      unsubscribeSocket();
    };
  }, [activeTab]);

  // Derive Gainers and Losers
  const gainers = [...marketData].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const losers = [...marketData].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);


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

  const handleStockClick = async (stock: LiveStockData) => {
    // Show modal immediately with current data
    setSelectedStock(stock);
    // Fetch full data (with history) in background to populate chart
    const { fetchLiveStock } = await import("./services/marketDataService");
    const fullStock = await fetchLiveStock(stock.symbol);
    if (fullStock) {
      setSelectedStock(fullStock);
    }
  };

  if (activeTab === 'landing') {
    return <LandingPage onGetStarted={() => setActiveTab('login')} />;
  }

  return (
    <AppLayout activeTab={activeTab} onNavigate={handleNavigate} isLoggedIn={isLoggedIn}>
      <AskRya />
      <StockDetailModal stock={selectedStock} onClose={() => setSelectedStock(null)} />

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
              <MarketPulse />

              {/* Minimal 3D Hero Section */}
              <GlassCard className="relative h-[160px] md:h-[180px] overflow-hidden flex items-center justify-center border-white/5 shadow-lg bg-white/[0.01] backdrop-blur-2xl">
                <div className="relative z-10 text-center px-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <h2 className="text-2xl md:text-[36px] font-bricolage font-black uppercase tracking-tighter italic text-white mb-1.5 leading-none">
                      Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender via-white/70 to-dusty-rose">Surveillance</span>
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-[8px] md:text-[9px] font-bold tracking-[0.4em] text-white/15 uppercase">
                      <span className="flex items-center gap-1.5">Pulse Monitor <span className="w-1 h-1 bg-lavender rounded-full opacity-30" /></span>
                      <span className="flex items-center gap-1.5">Neural Analysis <span className="w-1 h-1 bg-dusty-rose rounded-full opacity-30" /></span>
                      <span className="flex items-center gap-1.5">Alpha Node</span>
                    </div>
                  </motion.div>
                </div>
              </GlassCard>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-bold font-bricolage text-white tracking-widest uppercase opacity-50 flex items-center gap-2">
                    <span className="text-lavender">///</span> SENSORY GRID
                  </h2>
                  <CyberButton variant="ghost" className="text-[10px] border border-white/5 opacity-40">Matrix Config</CyberButton>
                </div>
                <NeuralGrid onStockClick={handleStockClick} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard className="p-6 min-h-[200px]">
                  <h3 className="text-lg font-bold mb-4 text-market-green flex items-center gap-2">
                    <span className="text-xs tracking-widest bg-market-green/10 px-2 py-0.5 rounded">TOP GAINERS</span>
                  </h3>
                  <div className="space-y-3">
                    {gainers.length > 0 ? (
                      gainers.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors"
                          onClick={() => handleStockClick(stock)}
                        >
                          <div>
                            <div className="font-bold text-sm tracking-wider">{stock.symbol}</div>
                            <div className="text-[10px] text-gray-500">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-market-green font-bold text-sm">+{stock.changePercent.toFixed(2)}%</div>
                            <div className="text-[10px] text-gray-400">₹{stock.price.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 italic py-4 text-center">Loading market data...</div>
                    )}
                  </div>
                </GlassCard>
                <GlassCard className="p-6 min-h-[200px]">
                  <h3 className="text-lg font-bold mb-4 text-market-red flex items-center gap-2">
                    <span className="text-xs tracking-widest bg-market-red/10 px-2 py-0.5 rounded">TOP LOSERS</span>
                  </h3>
                  <div className="space-y-3">
                    {losers.length > 0 ? (
                      losers.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0 hover:bg-white/5 p-2 rounded cursor-pointer transition-colors"
                          onClick={() => handleStockClick(stock)}
                        >
                          <div>
                            <div className="font-bold text-sm tracking-wider">{stock.symbol}</div>
                            <div className="text-[10px] text-gray-500">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-market-red font-bold text-sm">{stock.changePercent.toFixed(2)}%</div>
                            <div className="text-[10px] text-gray-400">₹{stock.price.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-500 italic py-4 text-center">Loading market data...</div>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Right Col - Intelligence & Hype */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <HypeMeter />


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
            <AuthSwitch
              onSuccess={() => handleNavigate('matrix')}
              onBackToDashboard={() => setActiveTab('landing')}
            />
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-full"
          >
            <SettingsView />
          </motion.div>
        )}

      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
