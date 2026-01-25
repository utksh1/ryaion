import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Mail, Facebook, Twitter, Linkedin, Chrome, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

interface AuthSwitchProps {
    onSuccess?: () => void;
    onBackToDashboard?: () => void;
}

export const AuthSwitch = ({ onSuccess, onBackToDashboard }: AuthSwitchProps) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const toggleAuth = () => {
        if (isLoading || isSuccess) return;
        setIsLogin(!isLogin);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsLoading(false);
        setIsSuccess(true);

        // Final redirect delay
        setTimeout(() => {
            onSuccess?.();
            setIsSuccess(false);
        }, 1500);
    };

    const socialIcons = [
        { Icon: Chrome, color: "#EA4335", title: "Google" },
        { Icon: Facebook, color: "#1877F2", title: "Facebook" },
        { Icon: Twitter, color: "#1DA1F2", title: "Twitter" },
        { Icon: Linkedin, color: "#0A66C2", title: "LinkedIn" }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a12] flex overflow-hidden font-plus-jakarta antialiased">
            {/* Return to Dashboard Button */}
            <button
                onClick={onBackToDashboard}
                className="absolute top-8 left-8 z-[210] flex items-center gap-2 text-white/40 hover:text-white transition-colors group px-4 py-2 rounded-full border border-white/5 hover:border-white/10 hover:bg-white/5"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="text-xs font-bold tracking-widest uppercase">Return to Matrix</span>
            </button>

            {/* Ambient Background Glows - Lavender Dusk */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6968A6]/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#CF9893]/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Success Overlay */}
            <AnimatePresence>
                {isSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[200] bg-[#0a0a12]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        >
                            <CheckCircle2 className="w-24 h-24 text-market-green mb-6 filter drop-shadow-[0_0_15px_rgba(0,255,194,0.5)]" />
                        </motion.div>
                        <h2 className="text-4xl font-bricolage font-bold text-white mb-2 uppercase italic tracking-tighter">
                            {isLogin ? "Session Initialized" : "Account Created"}
                        </h2>
                        <p className="text-gray-400 font-medium">Entering the Grid...</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Container */}
            <div className={`relative w-full h-full flex items-center justify-center transition-all duration-700 ${isSuccess ? 'blur-md grayscale scale-95' : ''}`}>

                {/* Sign Up Form Section */}
                <div className={`absolute w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out ${!isLogin ? 'left-0 opacity-100' : 'left-[-50%] opacity-0 pointer-events-none'}`}>
                    <form className="w-full max-w-[400px] flex flex-col items-center" onSubmit={handleAuth}>
                        <h2 className="text-[52px] font-bold text-white mb-12 tracking-tighter uppercase italic font-bricolage">Sign up</h2>

                        <div className="w-full bg-white/5 border border-white/10 rounded-[55px] px-8 py-4 flex items-center mb-4 transition-all focus-within:bg-white/10 focus-within:border-[#6968A6]/50">
                            <User className="w-5 h-5 text-gray-500 mr-4" />
                            <input disabled={isLoading} required type="text" placeholder="Username" className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-lg" />
                        </div>

                        <div className="w-full bg-white/5 border border-white/10 rounded-[55px] px-8 py-4 flex items-center mb-4 transition-all focus-within:bg-white/10 focus-within:border-[#6968A6]/50">
                            <Mail className="w-5 h-5 text-gray-500 mr-4" />
                            <input disabled={isLoading} required type="email" placeholder="Email" className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-lg" />
                        </div>

                        <div className="w-full bg-white/5 border border-white/10 rounded-[55px] px-8 py-4 flex items-center mb-6 transition-all focus-within:bg-white/10 focus-within:border-[#6968A6]/50">
                            <Lock className="w-5 h-5 text-gray-500 mr-4" />
                            <input disabled={isLoading} required type="password" placeholder="Password" className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-lg" />
                        </div>

                        <button disabled={isLoading} type="submit" className="w-[180px] bg-[#6968A6] text-white rounded-[49px] py-4 uppercase font-bold text-base hover:bg-[#5a5991] transition-all mb-10 shadow-[0_0_20px_rgba(105,104,166,0.4)] active:scale-95 tracking-wide flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
                        </button>

                        <p className="text-[15px] text-gray-400 mb-6 font-medium">Or sign up with social platforms</p>

                        <div className="flex gap-4">
                            {socialIcons.map(({ Icon, color }, idx) => (
                                <div key={idx} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:border-[#6968A6]/50 hover:bg-white/5 transition-all active:scale-90">
                                    <Icon className="w-5 h-5" style={{ color: color }} />
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                {/* Sign In Form Section */}
                <div className={`absolute w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out ${isLogin ? 'right-0 opacity-100' : 'right-[-50%] opacity-0 pointer-events-none'}`}>
                    <form className="w-full max-w-[400px] flex flex-col items-center" onSubmit={handleAuth}>
                        <h2 className="text-[52px] font-bold text-white mb-12 tracking-tighter uppercase italic font-bricolage">Sign in</h2>

                        <div className="w-full bg-white/5 border border-white/10 rounded-[55px] px-8 py-4 flex items-center mb-4 transition-all focus-within:bg-white/10 focus-within:border-[#6968A6]/50">
                            <User className="w-5 h-5 text-gray-500 mr-4" />
                            <input disabled={isLoading} required type="text" placeholder="Username" className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-lg" />
                        </div>

                        <div className="w-full bg-white/5 border border-white/10 rounded-[55px] px-8 py-4 flex items-center mb-8 transition-all focus-within:bg-white/10 focus-within:border-[#6968A6]/50">
                            <Lock className="w-5 h-5 text-gray-500 mr-4" />
                            <input disabled={isLoading} required type="password" placeholder="Password" className="bg-transparent border-none outline-none w-full text-white placeholder:text-gray-600 font-medium text-lg" />
                        </div>

                        <button disabled={isLoading} type="submit" className="w-[180px] bg-[#6968A6] text-white rounded-[49px] py-4 uppercase font-bold text-base hover:bg-[#5a5991] transition-all mb-10 shadow-[0_0_20px_rgba(105,104,166,0.4)] active:scale-95 tracking-wide flex items-center justify-center gap-2">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                        </button>

                        <p className="text-[15px] text-gray-400 mb-6 font-medium">Or sign in with social platforms</p>

                        <div className="flex gap-4">
                            {socialIcons.map(({ Icon, color }, idx) => (
                                <div key={idx} className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center cursor-pointer hover:border-[#6968A6]/50 hover:bg-white/5 transition-all active:scale-90">
                                    <Icon className="w-5 h-5" style={{ color: color }} />
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
            </div>

            {/* Sliding Panel - Desktop Only */}
            <div
                className={`hidden lg:flex absolute top-0 w-1/2 h-full bg-[#6968A6] transition-all duration-1000 ease-in-out z-50 flex-col items-center justify-center px-16 text-white text-center shadow-[-20px_0_40px_rgba(0,0,0,0.3)] ${isSuccess ? 'scale-105 opacity-0' : ''}`}
                style={{
                    left: isLogin ? '0' : '50%',
                    borderRadius: isLogin ? '0 15% 45% 0 / 0 50% 50% 0' : '15% 0 0 45% / 50% 0 0 50%',
                }}
            >
                {/* Panel Pattern/Glow Overlay - Using Dusk color for warmth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,152,147,0.15)_0%,transparent_70%)] pointer-events-none" />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? "login-panel" : "signup-panel"}
                        initial={{ opacity: 0, x: isLogin ? -80 : 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 80 : -80 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center relative z-10"
                    >
                        <h3 className="text-[40px] font-bold mb-6 italic leading-snug tracking-tighter uppercase font-bricolage">
                            {isLogin ? "New here?" : "One of us?"}
                        </h3>
                        <p className="text-[16px] mb-12 font-medium opacity-80 leading-relaxed max-w-[380px]">
                            {isLogin
                                ? "Join us today and discover a world of possibilities. Create your account in seconds!"
                                : "Welcome back! Sign in to continue your journey with us."}
                        </p>
                        <button
                            onClick={toggleAuth}
                            className="px-14 py-3 border-2 border-white rounded-[49px] uppercase font-bold text-sm tracking-wider transition-all hover:bg-white hover:text-[#6968A6] active:scale-95 disabled:opacity-50"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Toggle Overlay */}
            <div className={`lg:hidden absolute bottom-10 left-0 right-0 flex justify-center z-50 p-4 transition-opacity ${isSuccess ? 'opacity-0' : ''}`}>
                <button
                    onClick={toggleAuth}
                    className="w-full max-w-[300px] py-4 bg-[#6968A6] text-white rounded-full font-bold shadow-[0_0_30px_rgba(105,104,166,0.5)]"
                >
                    {isLogin ? "SWITCH TO SIGN UP" : "SWITCH TO SIGN IN"}
                </button>
            </div>
        </div>
    );
};
