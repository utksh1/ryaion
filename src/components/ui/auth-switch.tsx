import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Mail, Facebook, Twitter, Linkedin, Chrome, Loader2, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface AuthSwitchProps {
    onSuccess?: () => void;
    onBackToDashboard?: () => void;
}

export const AuthSwitch = ({ onSuccess, onBackToDashboard }: AuthSwitchProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const toggleAuth = () => {
        if (isLoading || isSuccess) return;
        setIsLogin(!isLogin);
        setErrorMsg(null);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username,
                        }
                    }
                });
                if (error) throw error;
            }

            setIsLoading(false);
            setIsSuccess(true);

            setTimeout(() => {
                onSuccess?.();
                setIsSuccess(false);
            }, 1500);

        } catch (error: any) {
            setIsLoading(false);
            console.error("Auth error:", error);
            setErrorMsg(error.message || "Authentication failed");
        }
    };

    const handleSocialAuth = async (provider: 'google' | 'facebook' | 'twitter' | 'linkedin') => {
        setIsLoading(true);
        setErrorMsg(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setIsLoading(false);
            console.error("Social auth error:", error);
            setErrorMsg(error.message || `Failed to sign in with ${provider}`);
        }
    };

    const socialIcons = [
        { Icon: Chrome, color: "white", title: "Google", provider: 'google' },
        { Icon: Facebook, color: "white", title: "Facebook", provider: 'facebook' },
        { Icon: Twitter, color: "white", title: "Twitter", provider: 'twitter' },
        { Icon: Linkedin, color: "white", title: "LinkedIn", provider: 'linkedin' }
    ] as const;

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 font-plus-jakarta antialiased selection:bg-white selection:text-black">
            {/* Background Glows */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lavender/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full" />
            </div>

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBackToDashboard}
                className="absolute top-8 left-8 z-[210] flex items-center gap-2 text-white/40 hover:text-white transition-all group"
            >
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/5 group-hover:border-white/30 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black tracking-widest uppercase">Esc Protocol</span>
            </motion.button>

            {/* Main Content */}
            <div className="relative w-full max-w-[500px] flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {/* Header Section */}
                    <motion.div
                        key={isLogin ? 'login-head' : 'signup-head'}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-center mb-12 relative"
                    >
                        <h1 className="text-7xl font-bricolage font-black italic tracking-tighter text-white mb-2 drop-shadow-2xl">
                            {isLogin ? "IDENTITY" : "PRESENCE"}
                        </h1>

                        {/* The Overlay Ribbon Style Text */}
                        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-full pointer-events-none">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-block text-3xl font-bricolage font-black italic tracking-tighter text-white/90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                                style={{ transform: 'skewX(-10deg)' }}
                            >
                                {isLogin ? "ACCESS PORTAL" : "NETWORK ENTRY"}
                            </motion.span>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Form Container */}
                <motion.div
                    layout
                    className="w-full bg-white/[0.03] border border-white/10 backdrop-blur-[40px] rounded-[40px] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden"
                >
                    {/* Inner Glass Glow */}
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-white/5 blur-[60px] pointer-events-none" />

                    <form onSubmit={handleAuth} className="space-y-4 relative z-10">
                        {errorMsg && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-4 text-[11px] font-bold uppercase tracking-wider"
                            >
                                <AlertCircle size={14} />
                                {errorMsg}
                            </motion.div>
                        )}

                        {!isLogin && (
                            <div className="group relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    required
                                    type="text"
                                    placeholder="Node Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                                />
                            </div>
                        )}

                        <div className="group relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                required
                                type="email"
                                placeholder={isLogin ? "Email Address" : "Email Registry"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                            />
                        </div>

                        <div className="group relative">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
                                <Lock size={18} />
                            </div>
                            <input
                                required
                                type="password"
                                placeholder={isLogin ? "Security Cipher" : "Access Cipher"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                            />
                            {/* Floating Lock Icon Style */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                                <Lock size={14} className="text-white" />
                            </div>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-16 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "INITIALIZE LOGIN" : "ESTABLISH NODE")}
                            </button>

                            <button
                                type="button"
                                onClick={toggleAuth}
                                className="w-full h-16 bg-white/5 border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all uppercase italic"
                            >
                                {isLogin ? "Identify Self" : "Verify Credentials"}
                            </button>
                        </div>
                    </form>

                    {/* Description Text */}
                    <p className="mt-8 text-center text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                        {isLogin
                            ? "Declare your credentials to access the encrypted market analytics grid."
                            : "Initialize your node in the decentralized surveillance network."}
                    </p>

                    {/* Social Footer */}
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Connect Identity</p>
                        <div className="flex justify-center gap-4">
                            {socialIcons.map(({ Icon, provider }, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSocialAuth(provider)}
                                    className="w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-90 group"
                                >
                                    <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <CheckCircle2 className="w-32 h-32 text-white mb-8 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                        </motion.div>
                        <h2 className="text-5xl font-bricolage font-black text-white mb-2 uppercase italic tracking-tighter">
                            PROTOCOL SYNCED
                        </h2>
                        <p className="text-white/40 font-bold tracking-[0.2em] uppercase text-xs">Entering the Grid...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
