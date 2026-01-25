import type { ReactNode } from "react";
import { LiveTicker } from "../ui/LiveTicker";
import { PillBase } from "../ui/3d-adaptive-navigation-bar";
import Orb from "../ui/Orb/Orb";

interface AppLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
}

export const AppLayout = ({ children, activeTab, onNavigate }: AppLayoutProps) => {
    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col overflow-hidden relative font-plus-jakarta antialiased">
            {/* Immersive 3D Orb Background - Spans full screen */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.35]">
                <Orb
                    hue={270}
                    hoverIntensity={0.8}
                    rotateOnHover={true}
                    forceHoverState={false}
                    backgroundColor="#050507"
                />
            </div>

            {/* Subtle Gradient Glows for additional depth */}
            <div className="fixed top-[-15%] left-[-10%] w-[800px] h-[800px] bg-lavender/10 rounded-full blur-[160px] pointer-events-none z-0" />
            <div className="fixed bottom-[-20%] right-[-10%] w-[900px] h-[900px] bg-dusty-rose/5 rounded-full blur-[180px] pointer-events-none z-0" />

            {/* Premium Fixed Header - Aligning Logo, Navigation, and Status */}
            {activeTab !== 'login' && (
                <header className="fixed top-6 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 pointer-events-none">
                    {/* Left Branding */}
                    <div className="pointer-events-auto">
                        <h1 className="text-xl md:text-2xl font-bricolage font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/40">
                            RYAION <span className="text-lavender text-[10px] align-top opacity-80">BETA</span>
                        </h1>
                    </div>

                    {/* Center 3D Navigation Pill */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
                        <PillBase activeSection={activeTab} onSectionClick={onNavigate} />
                    </div>

                    {/* Right System Info */}
                    <div className="hidden md:flex gap-4 pointer-events-auto">
                        <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[9px] font-bold font-mono text-white/30 tracking-[0.2em]">
                            SYSTEM: ONLINE
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 md:p-8 pt-24 md:pt-28 pb-8 flex flex-col">
                <LiveTicker />

                {children}
            </main>
        </div>
    );
};
