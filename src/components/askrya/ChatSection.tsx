import { useState, useRef, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Send, Loader2, Sparkles, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askRya, type ChatMessage } from "../../services/aiService";
import { cn } from "../../lib/utils";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'rya';
}

export const ChatSection = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "I'm Rya. Market's open, what's the move?", sender: 'rya' }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getContext = (): ChatMessage[] => {
        return messages.slice(-8).map(m => ({
            role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: m.text
        }));
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await askRya(inputValue, getContext());
            const ryaMsg: Message = {
                id: Date.now() + 1,
                text: response,
                sender: 'rya'
            };
            setMessages(prev => [...prev, ryaMsg]);
        } catch (error) {
            const errorMsg: Message = {
                id: Date.now() + 1,
                text: "Connection issues rn. Try again in a sec.",
                sender: 'rya'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GlassCard className="flex flex-col h-[450px] border-lavender/20 bg-gradient-to-b from-white/[0.03] to-black/40 backdrop-blur-3xl overflow-hidden group">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-lavender/10 flex items-center justify-center border border-lavender/20">
                            <Bot className="w-6 h-6 text-lavender" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050507] animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bricolage font-bold text-white tracking-tight leading-none mb-1">ASK RYA</h3>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-lavender/60" />
                            <span className="text-[10px] text-gray-500 font-mono font-bold tracking-tighter uppercase">Neural Intelligence v4.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex gap-3",
                                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                                msg.sender === 'user' ? 'bg-lavender/20' : 'bg-white/5'
                            )}>
                                {msg.sender === 'user' ? <User className="w-4 h-4 text-lavender" /> : <Bot className="w-4 h-4 text-gray-400" />}
                            </div>
                            <div className={cn(
                                "max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                                msg.sender === 'user'
                                    ? 'bg-lavender text-white rounded-tr-none'
                                    : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'
                            )}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="bg-white/5 p-3.5 rounded-2xl rounded-tl-none border border-white/5">
                            <Loader2 className="w-4 h-4 animate-spin text-lavender" />
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 pt-2 bg-white/[0.01]">
                <div className="relative group/input">
                    <input
                        type="text"
                        placeholder="Analyze market sentiment..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-lavender/50 focus:bg-white/[0.08] transition-all text-white placeholder:text-gray-600 shadow-inner"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-lavender text-white rounded-xl hover:bg-lavender/80 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center shadow-lg"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-[10px] text-center text-gray-600 mt-4 font-medium tracking-tight uppercase">
                    Rya may provide imprecise data // Verify with your analyst
                </p>
            </div>
        </GlassCard>
    );
};
