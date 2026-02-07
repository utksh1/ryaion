import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export const GlassCard = ({ children, className, hoverEffect = false, onClick }: GlassCardProps) => {
    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "relative backdrop-blur-24 bg-white/5 border border-white/10 rounded-xl overflow-hidden shadow-lg",
                hoverEffect && "hover:bg-white/10 transition-colors duration-300 group",
                className
            )}
        >
            {/* Scan-line overlay effect (optional, enabled by default style if needed) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 ease-in-out" />

            {children}
        </motion.div>
    );
};
