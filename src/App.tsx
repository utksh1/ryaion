
import { useState, useEffect } from "react";
import { AppLayout } from "./components/layout/AppLayout";
import { GlassCard } from "./components/ui/GlassCard";
import { CyberButton } from "./components/ui/CyberButton";
import { MarketPulse } from "./components/matrix/MarketPulse";
import { NeuralGrid } from "./components/matrix/NeuralGrid";
import { OracleView } from "./components/oracle/OracleView";
import { BattleArena } from "./components/arena/BattleArena";
import { PortfolioVault } from "./components/vault/PortfolioVault";
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
            className="w-full flex flex-col gap-8 text-white"
          >
            <div className="flex flex-col gap-8 w-full">
              <MarketPulse />



              <div className="flex flex-col gap-4 px-6 md:px-12">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-2xl font-black font-bricolage text-white tracking-[0.3em] uppercase opacity-60 flex items-center gap-3">
                    <span className="text-lavender">///</span> SENSORY GRID
                  </h2>
                  <CyberButton variant="ghost" className="text-xs border border-white/10 opacity-50 px-6">Matrix Configuration</CyberButton>
                </div>
                <NeuralGrid onStockClick={handleStockClick} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 px-6 md:px-12">
                <GlassCard className="p-8 min-h-[300px] border-market-green/10 bg-market-green/[0.01]">
                  <h3 className="text-2xl font-black mb-6 text-market-green flex items-center gap-3">
                    <span className="text-xs tracking-[0.4em] bg-market-green/20 px-3 py-1 rounded-full text-white font-mono">NODE ALPHA: GAINERS</span>
                  </h3>
                  <div className="space-y-4">
                    {gainers.length > 0 ? (
                      gainers.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0 hover:bg-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                          onClick={() => handleStockClick(stock)}
                        >
                          <div className="flex flex-col">
                            <div className="font-black text-lg tracking-widest font-mono">{stock.symbol}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-market-green font-black text-2xl">+{stock.changePercent.toFixed(2)}%</div>
                            <div className="text-sm text-gray-400 font-mono">₹{stock.price.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic py-8 text-center font-mono">INITIALIZING DATA STREAMS...</div>
                    )}
                  </div>
                </GlassCard>

                <GlassCard className="p-8 min-h-[300px] border-market-red/10 bg-market-red/[0.01]">
                  <h3 className="text-2xl font-black mb-6 text-market-red flex items-center gap-3">
                    <span className="text-xs tracking-[0.4em] bg-market-red/20 px-3 py-1 rounded-full text-white font-mono">NODE OMEGA: LOSERS</span>
                  </h3>
                  <div className="space-y-4">
                    {losers.length > 0 ? (
                      losers.map((stock) => (
                        <div
                          key={stock.symbol}
                          className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0 hover:bg-white/5 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.01]"
                          onClick={() => handleStockClick(stock)}
                        >
                          <div className="flex flex-col">
                            <div className="font-black text-lg tracking-widest font-mono">{stock.symbol}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-market-red font-black text-2xl">{stock.changePercent.toFixed(2)}%</div>
                            <div className="text-sm text-gray-400 font-mono">₹{stock.price.toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500 italic py-8 text-center font-mono">INITIALIZING DATA STREAMS...</div>
                    )}
                  </div>
                </GlassCard>
              </div>
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
