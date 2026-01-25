import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Mail, Facebook, Twitter, Linkedin, Chrome } from "lucide-react";

export const AuthSwitch = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuth = () => setIsLogin(!isLogin);

    // Social icon colors matching the mockup
    const socialIcons = [
        { Icon: Chrome, color: "#EA4335", title: "Google" },
        { Icon: Facebook, color: "#1877F2", title: "Facebook" },
        { Icon: Twitter, color: "#1DA1F2", title: "Twitter" },
        { Icon: Linkedin, color: "#0A66C2", title: "LinkedIn" }
    ];

    return (
        <div className="fixed inset-0 z-[100] bg-white flex overflow-hidden font-sans">
            {/* Form Container */}
            <div className="relative w-full h-full flex items-center justify-center">

                {/* Sign Up Form Section */}
                <div className={`absolute w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out ${!isLogin ? 'left-0 opacity-100' : 'left-[-50%] opacity-0 pointer-events-none'}`}>
                    <form className="w-full max-w-[400px] flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
                        <h2 className="text-[52px] font-bold text-[#333] mb-12">Sign up</h2>

                        <div className="w-full bg-[#f0f0f0] rounded-[55px] px-8 py-4 flex items-center mb-4 border-2 border-transparent focus-within:bg-white focus-within:border-[#7366FF] transition-all">
                            <User className="w-5 h-5 text-[#aaa] mr-4" />
                            <input type="text" placeholder="Username" className="bg-transparent border-none outline-none w-full text-[#444] placeholder:text-[#aaa] font-medium text-lg" />
                        </div>

                        <div className="w-full bg-[#f0f0f0] rounded-[55px] px-8 py-4 flex items-center mb-4 border-2 border-transparent focus-within:bg-white focus-within:border-[#7366FF] transition-all">
                            <Mail className="w-5 h-5 text-[#aaa] mr-4" />
                            <input type="email" placeholder="Email" className="bg-transparent border-none outline-none w-full text-[#444] placeholder:text-[#aaa] font-medium text-lg" />
                        </div>

                        <div className="w-full bg-[#f0f0f0] rounded-[55px] px-8 py-4 flex items-center mb-6 border-2 border-transparent focus-within:bg-white focus-within:border-[#7366FF] transition-all">
                            <Lock className="w-5 h-5 text-[#aaa] mr-4" />
                            <input type="password" placeholder="Password" className="bg-transparent border-none outline-none w-full text-[#444] placeholder:text-[#aaa] font-medium text-lg" />
                        </div>

                        <button className="w-[180px] bg-[#7366FF] text-white rounded-[49px] py-4 uppercase font-bold text-base hover:bg-[#5f52eb] transition-all mb-10 shadow-lg active:scale-95 tracking-wide">
                            Sign up
                        </button>

                        <p className="text-[15px] text-[#444] mb-6 font-medium">Or sign up with social platforms</p>

                        <div className="flex gap-4">
                            {socialIcons.map(({ Icon, color }, idx) => (
                                <div key={idx} className="w-12 h-12 border border-[#ddd] rounded-full flex items-center justify-center cursor-pointer hover:border-[#7366FF] hover:bg-[#f8f8f8] transition-all active:scale-90">
                                    <Icon className="w-5 h-5" style={{ color: color }} />
                                </div>
                            ))}
                        </div>
                    </form>
                </div>

                {/* Sign In Form Section */}
                <div className={`absolute w-full lg:w-1/2 h-full flex flex-col items-center justify-center p-8 transition-all duration-1000 ease-in-out ${isLogin ? 'right-0 opacity-100' : 'right-[-50%] opacity-0 pointer-events-none'}`}>
                    <form className="w-full max-w-[400px] flex flex-col items-center" onSubmit={(e) => e.preventDefault()}>
                        <h2 className="text-[52px] font-bold text-[#333] mb-12">Sign in</h2>

                        <div className="w-full bg-[#f0f0f0] rounded-[55px] px-8 py-4 flex items-center mb-4 border-2 border-transparent focus-within:bg-white focus-within:border-[#7366FF] transition-all">
                            <User className="w-5 h-5 text-[#aaa] mr-4" />
                            <input type="text" placeholder="Email" className="bg-transparent border-none outline-none w-full text-[#444] placeholder:text-[#aaa] font-medium text-lg" />
                        </div>

                        <div className="w-full bg-[#f0f0f0] rounded-[55px] px-8 py-4 flex items-center mb-8 border-2 border-transparent focus-within:bg-white focus-within:border-[#7366FF] transition-all">
                            <Lock className="w-5 h-5 text-[#aaa] mr-4" />
                            <input type="password" placeholder="Password" className="bg-transparent border-none outline-none w-full text-[#444] placeholder:text-[#aaa] font-medium text-lg" />
                        </div>

                        <button className="w-[180px] bg-[#7366FF] text-white rounded-[49px] py-4 uppercase font-bold text-base hover:bg-[#5f52eb] transition-all mb-10 shadow-lg active:scale-95 tracking-wide">
                            Login
                        </button>

                        <p className="text-[15px] text-[#444] mb-6 font-medium">Or sign in with social platforms</p>

                        <div className="flex gap-4">
                            {socialIcons.map(({ Icon, color }, idx) => (
                                <div key={idx} className="w-12 h-12 border border-[#ddd] rounded-full flex items-center justify-center cursor-pointer hover:border-[#7366FF] hover:bg-[#f8f8f8] transition-all active:scale-90">
                                    <Icon className="w-5 h-5" style={{ color: color }} />
                                </div>
                            ))}
                        </div>
                    </form>
                </div>
            </div>

            {/* Sliding Panel - Desktop Only */}
            <div
                className={`hidden lg:flex absolute top-0 w-1/2 h-full bg-[#7366FF] transition-all duration-1000 ease-in-out z-50 flex-col items-center justify-center px-16 text-white text-center shadow-[-20px_0_40px_rgba(0,0,0,0.1)]`}
                style={{
                    left: isLogin ? '0' : '50%',
                    borderRadius: isLogin ? '0 15% 45% 0 / 0 50% 50% 0' : '15% 0 0 45% / 50% 0 0 50%',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isLogin ? "login-panel" : "signup-panel"}
                        initial={{ opacity: 0, x: isLogin ? -80 : 80 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 80 : -80 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <h3 className="text-[40px] font-bold mb-6 italic leading-snug">
                            {isLogin ? "New here?" : "One of us?"}
                        </h3>
                        <p className="text-[16px] mb-12 font-medium opacity-90 leading-relaxed max-w-[380px]">
                            {isLogin
                                ? "Join us today and discover a world of possibilities. Create your account in seconds!"
                                : "Welcome back! Sign in to continue your journey with us."}
                        </p>
                        <button
                            onClick={toggleAuth}
                            className="px-14 py-3 border-2 border-white rounded-[49px] uppercase font-bold text-sm tracking-wider transition-all hover:bg-white hover:text-[#7366FF] active:scale-95"
                        >
                            {isLogin ? "Sign up" : "Sign in"}
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Mobile Toggle Overlay */}
            <div className="lg:hidden absolute bottom-10 left-0 right-0 flex justify-center z-50 p-4">
                <button
                    onClick={toggleAuth}
                    className="w-full max-w-[300px] py-4 bg-[#7366FF] text-white rounded-full font-bold shadow-2xl"
                >
                    {isLogin ? "SWITCH TO SIGN UP" : "SWITCH TO SIGN IN"}
                </button>
            </div>
        </div>
    );
};
