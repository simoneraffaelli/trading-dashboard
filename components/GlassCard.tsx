"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { type ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-2xl
        border border-white/[0.06]
        bg-white/[0.03] backdrop-blur-xl
        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        ${glow ? "ring-1 ring-cyan-400/20" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Inner highlight border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/[0.04]" />
      {children}
    </motion.div>
  );
}
