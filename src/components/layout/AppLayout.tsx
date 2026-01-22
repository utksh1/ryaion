import type { ReactNode } from "react";
import { LiveTicker } from "../ui/LiveTicker";
import { cn } from "../../lib/utils";
import { LayoutDashboard, Zap, Shield, MonitorPlay } from "lucide-react";

interface AppLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
}

export const AppLayout = ({ children, activeTab, onNavigate }: AppLayoutProps) => {
    const navItems = [
        { icon: LayoutDashboard, label: "Matrix", id: "matrix" },
        { icon: Zap, label: "Oracle", id: "oracle" }, // Opens modal usually, but we can make it a view
        { icon: MonitorPlay, label: "Arena", id: "arena" },
        { icon: Shield, label: "Vault", id: "vault" },
    ];

    return (
        <div className="min-h-screen bg-obsidian-black text-white flex flex-col md:flex-row overflow-hidden relative font-outfit">
            {/* Gradient Background Blobs - Lavender Dusk */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lavender/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-deep-teal/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Cyber Sidebar (Desktop) / Bottom Bar (Mobile) */}
            <nav className="z-50 md:w-24 md:h-screen md:border-r border-white/10 bg-black/40 backdrop-blur-md flex md:flex-col items-center justify-between py-6 fixed bottom-0 w-full md:relative md:top-0 border-t md:border-t-0 px-6 md:px-0">
                <div className="hidden md:block w-10 h-10 bg-lavender rounded-full shadow-[0_0_15px_rgba(105,104,166,0.8)] mb-10" />

                <div className="flex md:flex-col gap-8 mx-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={cn(
                                "p-3 rounded-xl transition-all duration-300 group relative",
                                activeTab === item.id ? "text-lavender bg-white/5" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <item.icon className="w-6 h-6" />
                            <span className="absolute left-14 bg-black border border-white/10 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                                {item.label}
                            </span>
                            {activeTab === item.id && (
                                <div className="absolute inset-0 border border-lavender/50 rounded-xl shadow-[0_0_10px_rgba(105,104,166,0.3)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="hidden md:block w-8 h-8 rounded-full border border-white/20" /> {/* User Profile */}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 md:p-8 pb-24 md:pb-8 flex flex-col">
                {/* Header / Ticker Area */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bricolage font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Ryaion <span className="text-lavender text-lg align-top">BETA</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex gap-4">
                        {/* Future search or status items */}
                        <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-mono text-gray-400">
                            SYSTEM: ONLINE
                        </div>
                    </div>
                </header>

                <LiveTicker />

                {children}
            </main>
        </div>
    );
};
