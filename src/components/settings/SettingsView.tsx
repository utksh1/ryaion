
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { CyberButton } from "../ui/CyberButton";
import { User, Bell, Shield, Palette, Zap, Globe, Trash2, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export const SettingsView = () => {
    const [userEmail, setUserEmail] = useState("Loading user data...");

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                setUserEmail(user.email);
            } else {
                setUserEmail("Guest User");
            }
        };
        getUser();
    }, []);

    const Toggle = ({ active }: { active?: boolean }) => (
        <div className={`w-10 h-5 rounded-full relative transition-colors ${active ? 'bg-lavender' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full transition-all ${active ? 'left-5' : 'left-0.5'}`} />
        </div>
    );

    const SettingRow = ({ icon: Icon, title, desc, active = false }: any) => (
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-wide text-gray-200">{title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{desc}</p>
                </div>
            </div>
            <Toggle active={active} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-8 max-w-5xl mx-auto text-white h-full"
        >
            <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lavender/10 blur-[80px] rounded-full pointer-events-none -mt-32 -mr-32" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-lavender/20 to-dusty-rose/20 border border-white/10 flex items-center justify-center shadow-2xl">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bricolage font-bold uppercase tracking-tighter">
                            User <span className="text-lavender">Profile</span>
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase tracking-widest">
                                Verified
                            </span>
                            <span className="text-sm text-gray-400">{userEmail}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex gap-3">
                        <CyberButton variant="ghost" className="border-white/10">Edit Profile</CyberButton>
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Appearance */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-dusty-rose" />
                        INTERFACE PREFERENCES
                    </h3>
                    <div className="space-y-3">
                        <SettingRow icon={Zap} title="Reduced Motion" desc="Disable heavy animations" />
                        <SettingRow icon={Smartphone} title="Adaptive Density" desc="Optimize for current viewport" active={true} />
                        <SettingRow icon={Palette} title="High Contrast" desc="Enhance visual borders" />
                    </div>
                </GlassCard>

                {/* Notifications */}
                <GlassCard className="p-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-lavender" />
                        NEURAL ALERTS
                    </h3>
                    <div className="space-y-3">
                        <SettingRow icon={Globe} title="Market Volatility" desc="Alert on >5% moves" active={true} />
                        <SettingRow icon={Shield} title="Security Events" desc="Login attempts & API usage" active={true} />
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-6 border-red-500/20 bg-red-950/5">
                <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    DANGER ZONE
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-300">Deactivate Account</p>
                        <p className="text-xs text-gray-500">This action cannot be undone. All trading data will be wiped.</p>
                    </div>
                    <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </button>
                </div>
            </GlassCard>

        </motion.div>
    );
};
