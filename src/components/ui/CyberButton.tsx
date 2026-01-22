import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";

interface CyberButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    glow?: boolean;
}

export const CyberButton = ({
    children,
    className,
    variant = 'primary',
    glow = false,
    ...props
}: CyberButtonProps) => {
    const variants = {
        primary: "bg-lavender text-white hover:bg-[#5a5996] border-none",
        secondary: "bg-transparent border border-dusty-rose text-dusty-rose hover:bg-dusty-rose/10",
        ghost: "bg-transparent text-gray-400 hover:text-white"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
                "px-6 py-3 rounded-lg font-bold tracking-wide uppercase text-sm transition-all duration-300 relative overflow-hidden",
                variants[variant],
                glow && "shadow-[0_0_15px_rgba(105,104,166,0.5)] hover:shadow-[0_0_25px_rgba(105,104,166,0.8)]",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 justify-center">{children}</span>
        </motion.button>
    );
};
