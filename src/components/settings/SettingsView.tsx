import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { User, Bell, Shield, Palette, Zap, Globe, Trash2, Smartphone, Edit3, Save, X, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export const SettingsView = () => {
    const [userEmail, setUserEmail] = useState("");
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Profile State
    const [profile, setProfile] = useState({
        full_name: "",
        username: "",
        risk_profile: "moderate",
        trading_style: "swing",
        avatar_url: ""
    });

    // Preferences State
    const [prefs, setPrefs] = useState({
        reducedMotion: false,
        adaptiveDensity: true,
        highContrast: false,
        volatilityAlerts: true,
        securityAlerts: true
    });

    useEffect(() => {
        const loadUserData = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email || "");

                // Load additional profile data from 'users' table
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data && !error) {
                    setProfile({
                        full_name: data.full_name || user.user_metadata?.full_name || "",
                        username: data.username || "",
                        risk_profile: data.risk_profile || "moderate",
                        trading_style: data.trading_style || "swing",
                        avatar_url: data.avatar_url || user.user_metadata?.avatar_url || ""
                    });
                }
            }
            setIsLoading(false);
        };
        loadUserData();
    }, []);

    const handleSaveProfile = async () => {
        if (!userId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .upsert({
                    id: userId,
                    email: userEmail,
                    full_name: profile.full_name,
                    username: profile.username,
                    risk_profile: profile.risk_profile,
                    trading_style: profile.trading_style,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
                setIsEditing(false);
            }, 2000);
        } catch (err) {
            console.error("Error saving profile:", err);
            alert("Failed to save profile. Check connection.");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePref = (key: keyof typeof prefs) => {
        setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const Toggle = ({ active, onClick }: { active?: boolean, onClick: () => void }) => (
        <div
            onClick={onClick}
            className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${active ? 'bg-lavender shadow-[0_0_10px_rgba(105,104,166,0.5)]' : 'bg-white/10'}`}
        >
            <div className={`absolute top-0.5 bottom-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${active ? 'left-5' : 'left-0.5'}`} />
        </div>
    );

    const SettingRow = ({ icon: Icon, title, desc, active, onToggle }: any) => (
        <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-lavender transition-colors" />
                </div>
                <div>
                    <h4 className="font-bold text-sm tracking-wide text-gray-200">{title}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{desc}</p>
                </div>
            </div>
            <Toggle active={active} onClick={onToggle} />
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-lavender" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 max-w-5xl mx-auto text-white h-full pb-20 mt-10"
        >
            {/* Profile Section */}
            <GlassCard className="p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-lavender/10 blur-[100px] rounded-full pointer-events-none -mt-48 -mr-48 group-hover:bg-lavender/20 transition-all duration-700" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-lavender/30 to-dusty-rose/30 border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-white/50" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <AnimatePresence mode="wait">
                            {!isEditing ? (
                                <motion.div
                                    key="view"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                >
                                    <h2 className="text-4xl font-bricolage font-bold uppercase tracking-tighter italic">
                                        {profile.full_name || "Alpha Node"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender to-dusty-rose text-3xl">@{profile.username || "unset"}</span>
                                    </h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                                        <span className="px-3 py-1 bg-market-green/10 border border-market-green/20 text-market-green text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(0,255,194,0.1)]">
                                            ACTIVE OPERATOR
                                        </span>
                                        <span className="text-sm font-medium text-white/40 font-mono tracking-wider">{userEmail}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4 justify-center md:justify-start">
                                        <div className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-[9px] font-bold uppercase text-gray-500 uppercase tracking-wider">Risk: {profile.risk_profile}</div>
                                        <div className="px-3 py-1 bg-white/5 rounded-md border border-white/10 text-[9px] font-bold uppercase text-gray-500 uppercase tracking-wider">Style: {profile.trading_style}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="edit"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
                                >
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-lavender uppercase tracking-widest ml-1">Legal Name</label>
                                        <input
                                            value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-lavender/50 transition-all font-medium text-sm text-white"
                                            placeholder="Enter your full legal name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-lavender uppercase tracking-widest ml-1">Grid Alias</label>
                                        <input
                                            value={profile.username}
                                            onChange={e => setProfile({ ...profile, username: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-lavender/50 transition-all font-medium text-sm text-white"
                                            placeholder="Choose a unique username"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-lavender uppercase tracking-widest ml-1">Risk Tolerance</label>
                                        <select
                                            value={profile.risk_profile}
                                            onChange={e => setProfile({ ...profile, risk_profile: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-lavender/50 transition-all font-medium text-sm text-white appearance-none cursor-pointer"
                                        >
                                            <option value="conservative" className="bg-[#050508]">Conservative / Capital Preservation</option>
                                            <option value="moderate" className="bg-[#050508]">Moderate / Balanced Growth</option>
                                            <option value="aggressive" className="bg-[#050508]">Aggressive / High Volatility</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-lavender uppercase tracking-widest ml-1">Execution Style</label>
                                        <select
                                            value={profile.trading_style}
                                            onChange={e => setProfile({ ...profile, trading_style: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-lavender/50 transition-all font-medium text-sm text-white appearance-none cursor-pointer"
                                        >
                                            <option value="day" className="bg-[#050508]">Day Trading / Scalping</option>
                                            <option value="swing" className="bg-[#050508]">Swing Trading / Multi-day</option>
                                            <option value="position" className="bg-[#050508]">Position / Long-term Investor</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-[10px] font-black text-lavender uppercase tracking-widest ml-1">Primary Market Focus</label>
                                        <select
                                            value={(profile as any).market_focus || "NSE"}
                                            onChange={e => setProfile({ ...profile, market_focus: e.target.value } as any)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-lavender/50 transition-all font-medium text-sm text-white appearance-none cursor-pointer"
                                        >
                                            <option value="NSE" className="bg-[#050508]">NSE - National Stock Exchange (India)</option>
                                            <option value="BSE" className="bg-[#050508]">BSE - Bombay Stock Exchange (India)</option>
                                            <option value="NASDAQ" className="bg-[#050508]">NASDAQ / NYSE (Global/US)</option>
                                            <option value="CRYPTO" className="bg-[#050508]">Digital Assets / Crypto Market</option>
                                        </select>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-row md:flex-col gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-2 transition-all active:scale-95 group"
                            >
                                <Edit3 className="w-4 h-4 group-hover:text-lavender transition-colors" />
                                <span className="text-xs font-bold uppercase tracking-widest">Edit Node</span>
                            </button>
                        ) : (
                            <>
                                <button
                                    disabled={isSaving}
                                    onClick={handleSaveProfile}
                                    className="px-6 py-3 bg-lavender text-white rounded-2xl flex items-center gap-2 transition-all active:scale-95 hover:shadow-[0_0_20px_rgba(105,104,166,0.4)] disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
                                    <span className="text-xs font-bold uppercase tracking-widest">{saveSuccess ? "Stored" : "Sync Data"}</span>
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 bg-market-red/10 text-market-red border border-market-red/20 rounded-2xl flex items-center gap-2 transition-all hover:bg-market-red/20 active:scale-95"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Abort</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Appearance */}
                <GlassCard className="p-8">
                    <h3 className="text-lg font-bricolage font-bold mb-6 flex items-center gap-3 tracking-wider italic">
                        <Palette className="w-5 h-5 text-dusty-rose" />
                        INTERFACE PREFERENCES
                    </h3>
                    <div className="space-y-4">
                        <SettingRow
                            icon={Zap}
                            title="Reduced Motion"
                            desc="Disable heavy animations"
                            active={prefs.reducedMotion}
                            onToggle={() => togglePref('reducedMotion')}
                        />
                        <SettingRow
                            icon={Smartphone}
                            title="Adaptive Density"
                            desc="Optimize for current viewport"
                            active={prefs.adaptiveDensity}
                            onToggle={() => togglePref('adaptiveDensity')}
                        />
                        <SettingRow
                            icon={Palette}
                            title="High Contrast"
                            desc="Enhance visual borders"
                            active={prefs.highContrast}
                            onToggle={() => togglePref('highContrast')}
                        />
                    </div>
                </GlassCard>

                {/* Notifications */}
                <GlassCard className="p-8">
                    <h3 className="text-lg font-bricolage font-bold mb-6 flex items-center gap-3 tracking-wider italic">
                        <Bell className="w-5 h-5 text-lavender" />
                        NEURAL ALERTS
                    </h3>
                    <div className="space-y-4">
                        <SettingRow
                            icon={Globe}
                            title="Market Volatility"
                            desc="Alert on >5% moves"
                            active={prefs.volatilityAlerts}
                            onToggle={() => togglePref('volatilityAlerts')}
                        />
                        <SettingRow
                            icon={Shield}
                            title="Security Events"
                            desc="Login attempts & API usage"
                            active={prefs.securityAlerts}
                            onToggle={() => togglePref('securityAlerts')}
                        />
                    </div>
                </GlassCard>
            </div>

            {/* Danger Zone */}
            <GlassCard className="p-8 border-market-red/20 bg-market-red/[0.02]">
                <h3 className="text-lg font-bricolage font-bold mb-6 text-market-red flex items-center gap-3 italic">
                    <Shield className="w-5 h-5" />
                    DANGER ZONE
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-gray-200">Deactivate Node Registry</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-lg">This action cannot be undone. All trading history, neural connections, and portfolio data will be wiped from the grid permanently.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (window.confirm("ARE YOU SURE? THIS WILL PERMANENTLY ERASE YOUR NODE DATA.")) {
                                alert("Account deletion initiated. (Mock)");
                            }
                        }}
                        className="px-8 py-4 bg-market-red/10 hover:bg-market-red border border-market-red/20 text-market-red hover:text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] transition-all active:scale-95 flex items-center gap-3 group"
                    >
                        <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                        ERASE IDENTITY
                    </button>
                </div>
            </GlassCard>
        </motion.div>
    );
};
