import { useState, useEffect } from "react";
import { GlassCard } from "../ui/GlassCard";
import { SentimentBadge } from "./SentimentBadge";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { supabase } from "../../lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
    id: string;
    title: string;
    source: string;
    published_at: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    impact_score: number;
    url: string;
}

export const NewsFeed = () => {
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase
                .from('market_news')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) {
                console.error("Error fetching news:", error);
            } else if (data) {
                setNews(data);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Newspaper className="text-blue-400" size={20} />
                <h2 className="text-xl font-bricolage font-bold text-white">MARKET PULSE</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {news.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <GlassCard className="p-4 hover:bg-white/5 transition-colors group cursor-pointer border-white/5">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                        <span className="text-blue-400 font-bold">{item.source}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatDistanceToNow(new Date(item.published_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm leading-snug mb-2 group-hover:text-blue-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <SentimentBadge sentiment={item.sentiment} score={item.impact_score} />
                                </div>
                                <ExternalLink size={16} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
