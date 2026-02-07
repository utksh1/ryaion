
import { useState } from "react";
import type { ReactNode } from "react";
import { LiveTicker } from "../ui/LiveTicker";
import { PillBase } from "../ui/3d-adaptive-navigation-bar";
import Orb from "../ui/Orb/Orb";
import { User, LogOut, Settings } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../lib/supabaseClient";

interface AppLayoutProps {
    children: ReactNode;
    activeTab: string;
    onNavigate: (tab: string) => void;
    isLoggedIn?: boolean;
}

export const AppLayout = ({ children, activeTab, onNavigate, isLoggedIn = false }: AppLayoutProps) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowProfileMenu(false);
    };

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
                        <h1 className="text-2xl md:text-4xl font-bricolage font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/40">
                            RYAION
                        </h1>
                    </div>


                    {/* Center 3D Navigation Pill */}
                    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
                        <PillBase activeSection={activeTab} onSectionClick={onNavigate} isLoggedIn={isLoggedIn} />
                    </div>

                    {/* Right System Info or Profile */}
                    <div className="hidden md:flex gap-4 pointer-events-auto items-center relative">
                        {isLoggedIn ? (
                            <div className="relative">
                                <div
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all cursor-pointer group shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 z-50 relative"
                                >
                                    <User className="w-5 h-5 text-white/70 group-hover:text-white" />
                                </div>

                                <AnimatePresence>
                                    {showProfileMenu && (
                                        <>
                                            {/* Backdrop to close menu on click outside */}
                                            <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />

                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute right-0 top-14 w-48 bg-[#0a0a12]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                            >
                                                <div className="p-3 border-b border-white/5">
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account</p>

                                                    <div
                                                        onClick={() => {
                                                            onNavigate('settings');
                                                            setShowProfileMenu(false);
                                                        }}
                                                        className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors text-sm text-gray-300 hover:text-white"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        <span>Settings</span>
                                                    </div>

                                                </div>
                                                <div className="p-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-2 p-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg cursor-pointer transition-colors text-sm text-left"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>Log out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-[9px] font-bold font-mono text-white/30 tracking-[0.2em]">
                                SYSTEM: ONLINE
                            </div>
                        )}
                    </div>
                </header>
            )}


            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative z-10 p-4 md:p-8 pt-24 md:pt-28 pb-8 flex flex-col">
                {activeTab !== 'login' && <LiveTicker />}

                {children}
            </main>
        </div>
    );
};

