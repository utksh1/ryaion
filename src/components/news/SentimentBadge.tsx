import { cn } from "../../lib/utils";
import { Smile, Frown, Meh } from "lucide-react";

type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

interface SentimentBadgeProps {
    sentiment: Sentiment;
    score?: number; // 0 to 100
    className?: string;
}

export const SentimentBadge = ({ sentiment, score, className }: SentimentBadgeProps) => {
    const config = {
        POSITIVE: {
            color: "text-market-green",
            bg: "bg-market-green/10",
            border: "border-market-green/30",
            icon: Smile,
            label: "BULLISH"
        },
        NEGATIVE: {
            color: "text-sangria-red",
            bg: "bg-sangria-red/10",
            border: "border-sangria-red/30",
            icon: Frown,
            label: "BEARISH"
        },
        NEUTRAL: {
            color: "text-gray-400",
            bg: "bg-gray-400/10",
            border: "border-gray-400/30",
            icon: Meh,
            label: "NEUTRAL"
        }
    };

    const { color, bg, border, icon: Icon, label } = config[sentiment];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn("px-2.5 py-1 rounded border text-xs font-bold flex items-center gap-1.5", color, bg, border)}>
                <Icon size={14} />
                <span>{label}</span>
            </div>
            {score !== undefined && (
                <div className="text-xs font-mono text-gray-500">
                    {score}/100
                </div>
            )}
        </div>
    );
};
