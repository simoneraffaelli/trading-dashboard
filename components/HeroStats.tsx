"use client";

import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";
import StatusPill from "./StatusPill";
import { useOverview } from "@/lib/hooks";

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function HeroStats() {
  const { data, isLoading } = useOverview();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/[0.02] sm:h-32" />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Balance",
      value: data.balance_usd,
      prefix: "$",
      decimals: 2,
      large: true,
    },
    {
      label: "Cumulative P&L",
      value: data.cumulative_pnl_usd,
      prefix: "$",
      colorize: true,
      decimals: 2,
      large: true,
    },
    {
      label: "Today P&L",
      value: data.today_pnl_usd,
      prefix: "$",
      colorize: true,
      decimals: 2,
    },
    {
      label: "Total Trades",
      value: data.total_trades,
      decimals: 0,
    },
    {
      label: "Open",
      value: data.open_positions,
      decimals: 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Mode + assets row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill
          label={data.paper_mode ? "Paper Trading" : "Live Trading"}
          variant={data.paper_mode ? "paper" : "live"}
        />
        {data.assets.map((a) => (
          <StatusPill key={a} label={a} variant="neutral" />
        ))}
      </div>

      {/* Stat cards — first two span full width on mobile */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {stats.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={s.large ? "col-span-1 sm:col-span-1" : ""}
          >
            <GlassCard className="flex h-full flex-col justify-between p-4 sm:p-5">
              <span className="section-label">{s.label}</span>
              <div className="mt-2 sm:mt-3">
                {s.value !== null && s.value !== undefined ? (
                  <AnimatedCounter
                    value={s.value}
                    prefix={s.prefix}
                    decimals={s.decimals ?? 2}
                    colorize={s.colorize}
                    className={
                      s.large
                        ? "text-3xl font-black tracking-[-0.02em] sm:text-4xl lg:text-5xl"
                        : "text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl"
                    }
                  />
                ) : (
                  <span className="text-3xl font-black text-slate-600 sm:text-4xl lg:text-5xl">
                    —
                  </span>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
