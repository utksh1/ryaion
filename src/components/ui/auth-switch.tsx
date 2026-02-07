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
        { Icon: Chrome, color: "#EA4335", title: "Google", provider: 'google' },
        { Icon: Facebook, color: "#1877F2", title: "Facebook", provider: 'facebook' },
        { Icon: Twitter, color: "#1DA1F2", title: "Twitter", provider: 'twitter' },
        { Icon: Linkedin, color: "#0A66C2", title: "LinkedIn", provider: 'linkedin' }
    ] as const;

    return (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden font-plus-jakarta antialiased p-4">
            {/* Return to Dashboard Button */}
            <button
                onClick={onBackToDashboard}
                className="absolute top-8 left-8 z-[210] flex items-center gap-2 text-white/40 hover:text-white transition-colors group px-4 py-2 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-bold tracking-widest uppercase">Return to Matrix</span>
            </button>

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
                            <CheckCircle2 className="w-24 h-24 text-market-green mb-6 filter drop-shadow-[0_0_15px_rgba(0,255,194,0.5)]" />
                        </motion.div>
                        <h2 className="text-4xl font-bricolage font-bold text-white mb-2 uppercase italic tracking-tighter">
                            {isLogin ? "Session Active" : "Identity Created"}
                        </h2>
                        <p className="text-gray-400 font-medium">Entering the Grid...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Auth Container - Extreme Glassmorphism */}
            <div className={`relative w-full max-w-[1100px] h-auto min-h-[650px] md:h-[650px] flex flex-col md:flex-row overflow-hidden rounded-[48px] border border-white/10 bg-white/[0.03] backdrop-blur-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] transition-all duration-700 ${isSuccess ? 'blur-md grayscale scale-95' : ''}`}>

                {/* Visual Area - Pure Glass */}
                <div
                    className={`relative w-full md:w-[45%] h-[200px] md:h-full bg-white/[0.02] transition-all duration-1000 ease-in-out z-20 overflow-hidden order-first ${isLogin ? 'md:translate-x-0' : 'md:translate-x-[122%]'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                    <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "login-msg" : "signup-msg"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center"
                            >
                                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 shadow-inner">
                                    {isLogin ? <User className="w-8 h-8 text-white/50" /> : <Lock className="w-8 h-8 text-white/50" />}
                                </div>
                                <h3 className="text-4xl font-bold mb-6 italic uppercase tracking-tighter font-bricolage leading-tight text-white drop-shadow-sm">
                                    {isLogin ? "Access Portal" : "Network Entry"}
                                </h3>
                                <p className="text-sm mb-12 font-medium text-white/40 leading-relaxed max-w-[280px]">
                                    {isLogin
                                        ? "Declare your credentials to access the encrypted market analytics grid."
                                        : "Initialize your node in the decentralized surveillance network."}
                                </p>
                                <button
                                    onClick={toggleAuth}
                                    className="px-12 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white rounded-2xl uppercase font-bold text-xs tracking-[0.2em] transition-all active:scale-95 text-white"
                                >
                                    {isLogin ? "Join Network" : "Identify Self"}
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Glass Glint Effect */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Form Area */}
                <div className="flex-1 relative h-full flex items-center justify-center p-8 z-10">
                    <div className="w-full max-w-[360px]">
                        <AnimatePresence mode="wait">
                            {isLogin ? (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-[42px] font-bold text-white mb-10 tracking-tighter uppercase italic font-bricolage text-center">Identity</h2>

                                    {errorMsg && (
                                        <div className="w-full flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-6 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form className="w-full space-y-4 mb-10" onSubmit={handleAuth}>
                                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex items-center transition-all focus-within:bg-white/[0.08] focus-within:border-white/20">
                                            <Mail className="w-5 h-5 text-gray-600 mr-4" />
                                            <input
                                                disabled={isLoading}
                                                required
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-base"
                                            />
                                        </div>

                                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex items-center transition-all focus-within:bg-white/[0.08] focus-within:border-white/20">
                                            <Lock className="w-5 h-5 text-gray-600 mr-4" />
                                            <input
                                                disabled={isLoading}
                                                required
                                                type="password"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-base"
                                            />
                                        </div>

                                        <button
                                            disabled={isLoading}
                                            type="submit"
                                            className="w-full bg-white text-black hover:bg-gray-100 rounded-2xl py-5 uppercase font-black text-sm transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Access"}
                                        </button>
                                    </form>

                                    <div className="w-full flex items-center gap-4 mb-8">
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Digital Signatures</span>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>

                                    <div className="flex gap-6">
                                        {socialIcons.map(({ Icon, color, provider }, idx) => (
                                            <div key={idx} onClick={() => handleSocialAuth(provider)} className="w-12 h-12 border border-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all active:scale-90 group">
                                                <Icon className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" style={{ color: color }} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className="text-[42px] font-bold text-white mb-10 tracking-tighter uppercase italic font-bricolage text-center">Presence</h2>

                                    {errorMsg && (
                                        <div className="w-full flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl mb-6 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {errorMsg}
                                        </div>
                                    )}

                                    <form className="w-full space-y-4 mb-10" onSubmit={handleAuth}>
                                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex items-center transition-all focus-within:bg-white/[0.08] focus-within:border-white/20">
                                            <User className="w-5 h-5 text-gray-600 mr-4" />
                                            <input
                                                disabled={isLoading}
                                                required
                                                type="text"
                                                placeholder="Node Username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-base"
                                            />
                                        </div>

                                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex items-center transition-all focus-within:bg-white/[0.08] focus-within:border-white/20">
                                            <Mail className="w-5 h-5 text-gray-600 mr-4" />
                                            <input
                                                disabled={isLoading}
                                                required
                                                type="email"
                                                placeholder="Email Registry"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-base"
                                            />
                                        </div>

                                        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 flex items-center transition-all focus-within:bg-white/[0.08] focus-within:border-white/20">
                                            <Lock className="w-5 h-5 text-gray-600 mr-4" />
                                            <input
                                                disabled={isLoading}
                                                required
                                                type="password"
                                                placeholder="Access Cipher"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-base"
                                            />
                                        </div>

                                        <button
                                            disabled={isLoading}
                                            type="submit"
                                            className="w-full bg-white text-black hover:bg-gray-100 rounded-2xl py-5 uppercase font-black text-sm transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Establish Node"}
                                        </button>
                                    </form>

                                    <div className="w-full flex items-center gap-4 mb-8">
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Connect Identity</span>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>

                                    <div className="flex gap-6">
                                        {socialIcons.map(({ Icon, color, provider }, idx) => (
                                            <div key={idx} onClick={() => handleSocialAuth(provider)} className="w-12 h-12 border border-white/5 rounded-2xl flex items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all active:scale-90 group">
                                                <Icon className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all opacity-50 group-hover:opacity-100" style={{ color: color }} />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Background Animation Layers */}
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[80%] rounded-full bg-white/10 blur-[120px]" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[60%] rounded-full bg-white/5 blur-[100px]" />
                </div>
            </div>

            {/* Mobile Switch Link */}
            <div className="fixed bottom-10 left-0 right-0 flex justify-center md:hidden pointer-events-none">
                <button
                    onClick={toggleAuth}
                    className="pointer-events-auto px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-[10px] font-black tracking-[0.3em] uppercase text-white shadow-2xl"
                >
                    {isLogin ? "Join Network" : "Identity Found"}
                </button>
            </div>
        </div>
    );
};
