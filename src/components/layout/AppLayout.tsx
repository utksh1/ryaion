import type { ReactNode } from "react";
import { LiveTicker } from "../ui/LiveTicker";
import { PillBase } from "../ui/3d-adaptive-navigation-bar";

interface AppLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
}

export const AppLayout = ({ children, activeTab, onNavigate }: AppLayoutProps) => {
    return (
        <div className="min-h-screen bg-obsidian-black text-white flex flex-col overflow-hidden relative font-outfit">
            {/* Gradient Background Blobs - Lavender Dusk */}
            <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-lavender/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-deep-teal/20 rounded-full blur-[150px] pointer-events-none" />

            {/* Premium 3D Navigation Bar (Top Centered) */}
            {activeTab !== 'login' && (
                <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
                    <PillBase activeSection={activeTab} onSectionClick={onNavigate} />
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 md:p-8 pt-24 md:pt-28 pb-8 flex flex-col">
                {/* Header / Ticker Area */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bricolage font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Ryaion <span className="text-lavender text-lg align-top">BETA</span>
                        </h1>
                    </div>
                    <div className="hidden md:flex gap-4">
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
