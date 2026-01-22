import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { useState } from "react";
import { TrendingUp, Wallet, DollarSign, History } from "lucide-react";
import { cn } from "../../lib/utils";

interface Holding {
    symbol: string;
    qty: number;
    avgPrice: number;
    ltp: number;
}

export const PortfolioVault = () => {
    // Mock Holdings
    const [holdings] = useState<Holding[]>([
        { symbol: "RELIANCE", qty: 25, avgPrice: 2450, ltp: 2980.50 },
        { symbol: "ZOMATO", qty: 1000, avgPrice: 110, ltp: 185.50 },
        { symbol: "HDFCBANK", qty: 50, avgPrice: 1600, ltp: 1450.75 },
    ]);

    const cashBalance = 1000000; // 10L
    const totalInvested = holdings.reduce((acc, h) => acc + (h.qty * h.avgPrice), 0);
    const currentValue = holdings.reduce((acc, h) => acc + (h.qty * h.ltp), 0);
    const totalPnL = currentValue - totalInvested;
    const pnlPercent = (totalPnL / totalInvested) * 100;

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-3xl font-bricolage text-white">THE VAULT</h2>
                <div className="text-sm font-mono text-gray-400">SIMULATED PORTFOLIO</div>
            </div>

            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-6 border-l-4 border-l-white/20">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <Wallet size={16} /> CASH BALANCE
                    </div>
                    <div className="text-2xl font-mono font-bold">₹{cashBalance.toLocaleString()}</div>
                </GlassCard>

                <GlassCard className="p-6 border-l-4 border-l-white/20">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <DollarSign size={16} /> INVESTED VALUE
                    </div>
                    <div className="text-2xl font-mono font-bold">₹{totalInvested.toLocaleString()}</div>
                </GlassCard>

                <GlassCard className={cn(
                    "p-6 border-l-4",
                    totalPnL >= 0 ? "border-l-market-green" : "border-l-sangria-red"
                )}>
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <TrendingUp size={16} /> TOTAL P&L
                    </div>
                    <div className={cn(
                        "text-2xl font-mono font-bold",
                        totalPnL >= 0 ? "text-market-green" : "text-sangria-red"
                    )}>
                        {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString()}
                        <span className="text-sm ml-2 opacity-80">({pnlPercent.toFixed(2)}%)</span>
                    </div>
                </GlassCard>
            </div>

            {/* Holdings Table */}
            <GlassCard className="flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><History size={16} /> ACTIVE POSITIONS</h3>
                    <CyberButton variant="ghost" className="text-xs">VIEW HISTORY</CyberButton>
                </div>

                <div className="overflow-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 text-xs font-mono text-gray-400">
                            <tr>
                                <th className="p-4">SYMBOL</th>
                                <th className="p-4">QTY</th>
                                <th className="p-4">AVG. PRICE</th>
                                <th className="p-4">LTP</th>
                                <th className="p-4 text-right">P&L</th>
                                <th className="p-4 text-center">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {holdings.map((h) => {
                                const pnl = (h.ltp - h.avgPrice) * h.qty;
                                const isProfitable = pnl >= 0;

                                return (
                                    <tr key={h.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4 font-bold">{h.symbol}</td>
                                        <td className="p-4 font-mono">{h.qty}</td>
                                        <td className="p-4 font-mono">₹{h.avgPrice}</td>
                                        <td className="p-4 font-mono">₹{h.ltp}</td>
                                        <td className={cn("p-4 font-mono font-bold text-right", isProfitable ? "text-market-green" : "text-sangria-red")}>
                                            {isProfitable ? '+' : ''}{pnl.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 justify-center">
                                                <button className="text-xs bg-market-green/20 text-market-green px-2 py-1 rounded hover:bg-market-green/40">BUY</button>
                                                <button className="text-xs bg-sangria-red/20 text-sangria-red px-2 py-1 rounded hover:bg-sangria-red/40">SELL</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};
