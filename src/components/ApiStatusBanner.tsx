import React, { useEffect, useState } from 'react';
import { isApiKeyConfigured } from '../services/geminiService';

/**
 * API Status Banner - Shows when Gemini API is not configured
 * Displays at the top of the app with instructions
 */
const ApiStatusBanner: React.FC = () => {
    const [isConfigured, setIsConfigured] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const configured = isApiKeyConfigured();
        setIsConfigured(configured);

        // Check if user previously dismissed the banner
        const dismissed = localStorage.getItem('api-banner-dismissed');
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('api-banner-dismissed', 'true');
    };

    const handleConfigure = () => {
        window.open('https://makersuite.google.com/app/apikey', '_blank');
    };

    if (isConfigured || isDismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-[#A42420] to-[#6E1916] border-b border-white/10 relative z-50 animate-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-circle text-2xl text-white animate-pulse"></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
                            ⚠️ AI Features Offline
                        </h3>
                        <p className="text-xs text-white/80 font-medium">
                            Configure your Gemini API key to unlock AI-powered stock analysis, market insights, and the Rya assistant.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                        onClick={handleConfigure}
                        className="px-6 py-2 bg-white text-[#A42420] rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-100 transition-all hover:scale-105"
                    >
                        <i className="fas fa-key mr-2"></i>
                        Get API Key
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                        title="Dismiss"
                    >
                        <i className="fas fa-times text-white text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiStatusBanner;
