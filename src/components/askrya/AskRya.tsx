import { useState, useRef, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { askRya, type ChatMessage } from "../../services/aiService";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'rya';
}

export const AskRya = () => {
    const [isOpen, setIsOpen] = useState(false);
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
    }, [messages, isOpen]);

    // Convert messages to API format
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
        <div className="fixed bottom-24 md:bottom-8 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto mb-4 w-[350px] md:w-[400px]"
                    >
                        <GlassCard className="flex flex-col h-[500px] border-lavender/30 shadow-[0_0_50px_rgba(105,104,166,0.2)] bg-black/60 backdrop-blur-xl">
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                                    <span className="font-bricolage font-bold text-lavender">ASK RYA</span>
                                    <span className="text-[10px] text-gray-500 font-mono">AI POWERED</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/[0.02] backdrop-blur-sm">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                                            max-w-[80%] p-3 rounded-xl text-sm
                                            ${msg.sender === 'user'
                                                ? 'bg-lavender text-white rounded-br-none'
                                                : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}
                                        `}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/10 p-3 rounded-xl rounded-bl-none border border-white/5">
                                            <Loader2 size={16} className="animate-spin text-lavender" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask about IPOs, trends..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 text-sm focus:outline-none focus:border-lavender/50 text-white"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className="p-2 bg-lavender text-white rounded-lg hover:bg-[#5a5996] transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-14 h-14 rounded-full bg-lavender text-white flex items-center justify-center shadow-[0_0_20px_rgba(105,104,166,0.6)] border-2 border-white/10 hover:border-white/30 z-50 relative"
            >
                {isOpen ? <X size={24} /> : <Bot size={28} />}

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black animate-pulse" />
                )}
            </motion.button>
        </div>
    );
};
