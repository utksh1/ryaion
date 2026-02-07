import { useEffect, useRef } from "react";

interface TradingViewChartProps {
    symbol: string;
}

declare global {
    interface Window {
        TradingView: any;
    }
}

export function TradingViewChart({ symbol }: TradingViewChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const containerId = `tv-chart-${symbol.toLowerCase()}-${Math.random().toString(36).substring(7)}`;
        if (containerRef.current) {
            containerRef.current.id = containerId;
        }

        const loadWidget = () => {
            if (window.TradingView && containerRef.current) {
                new window.TradingView.widget({
                    "autosize": true,
                    "symbol": `NSE:${symbol.toUpperCase()}`,
                    "interval": "D",
                    "timezone": "Asia/Kolkata",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#131722",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": containerId,
                    "studies": [
                        "MASimple@tv-basicstudies",
                        "RSI@tv-basicstudies",
                        "MACD@tv-basicstudies"
                    ],
                    "show_popup_button": true,
                    "popup_width": "1000",
                    "popup_height": "650"
                });
            }
        };

        if (!window.TradingView) {
            const script = document.createElement('script');
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = loadWidget;
            document.head.appendChild(script);
        } else {
            loadWidget();
        }

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [symbol]);

    return (
        <div
            ref={containerRef}
            className="tradingview-widget-container"
            style={{ height: "100%", width: "100%" }}
        />
    );
}
