"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { useOverview } from "@/lib/hooks";

export default function HeroPnl() {
  const { data, isLoading } = useOverview();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-48 animate-pulse rounded bg-white/[0.04]" />
        <div className="h-24 w-80 animate-pulse rounded-2xl bg-white/[0.04] sm:h-32 sm:w-[500px]" />
        <div className="h-4 w-72 animate-pulse rounded bg-white/[0.04]" />
      </div>
    );
  }

  const pnl = data.cumulative_pnl_usd;
  const isPositive = pnl >= 0;

  return (
    <div>
      <p className="label">Cumulative Profit & Loss</p>

      {/* Giant P&L number with accent highlight */}
      <div className="relative mt-3 inline-block">
        {/* Glow background block */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="absolute -inset-x-4 -inset-y-2 origin-left rounded-2xl sm:-inset-x-6 sm:-inset-y-3"
          style={{
            background: isPositive
              ? "linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.08) 100%)"
              : "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
          }}
        />

        <div className="relative flex items-baseline">
          <span className="text-2xl font-black text-white/40 sm:text-4xl">
            {isPositive ? "+" : "-"}$
          </span>
          <AnimatedCounter
            value={Math.abs(pnl)}
            decimals={2}
            className="text-[clamp(3rem,10vw,7rem)] font-black leading-none tracking-[-0.04em] text-white"
          />
        </div>
      </div>

      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-500">
        AI-powered autonomous trading system trying to maximize PnL with algorithmic precision.
      </p>
    </div>
  );
}
