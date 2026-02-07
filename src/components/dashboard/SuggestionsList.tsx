import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { SuggestionCard, type Suggestion } from "./SuggestionCard";
import { Sparkles } from "lucide-react";

export const SuggestionsList = () => {
    // Fetch from Supabase
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSuggestions = async () => {
            const { data, error } = await supabase
                .from('ai_suggestions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching suggestions:", error);
            } else if (data) {
                // Map DB snake_case to CamelCase if necessary, but we aligned types mostly.
                // Except created_at is strictly string in our type.
                setSuggestions(data as Suggestion[]);
            }
            setLoading(false);
        };
        loadSuggestions();
    }, []);

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="text-market-green" size={20} />
                <h2 className="text-xl font-bricolage font-bold text-white">AI WATCHLIST</h2>
                <div className="ml-auto flex items-center gap-2 text-xs font-mono text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-market-green animate-pulse"></span>
                    LIVE
                </div>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-40 w-full bg-white/5 animate-pulse rounded-xl border border-white/5" />
                    ))
                ) : (
                    suggestions.map((suggestion, index) => (
                        <SuggestionCard key={suggestion.id} suggestion={suggestion} delay={index * 0.1} />
                    ))
                )}
            </div>
        </div>
    );
};
