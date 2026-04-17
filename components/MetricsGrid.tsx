"use client";

import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import AnimatedCounter from "./AnimatedCounter";
import { useMetrics } from "@/lib/hooks";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function MetricsGrid() {
  const { data, isLoading } = useMetrics();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
          Performance
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.02]" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: "Win Rate",
      value: data.win_rate * 100,
      suffix: "%",
      decimals: 1,
      colorize: true,
    },
    {
      label: "Sharpe",
      value: data.sharpe,
      decimals: 2,
    },
    {
      label: "Profit Factor",
      value: data.profit_factor,
      decimals: 2,
    },
    {
      label: "Max Drawdown",
      value: data.max_drawdown_pct,
      suffix: "%",
      decimals: 2,
      negative: true,
    },
    {
      label: "Avg Hold",
      value: data.avg_hold_time_minutes,
      suffix: "m",
      decimals: 0,
    },
    {
      label: "Best Trade",
      value: data.best_trade_usd,
      prefix: "$",
      decimals: 2,
      colorize: true,
    },
    {
      label: "Worst Trade",
      value: data.worst_trade_usd,
      prefix: "$",
      decimals: 2,
      colorize: true,
    },
    {
      label: "Long WR",
      value: data.long_win_rate * 100,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Short WR",
      value: data.short_win_rate * 100,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Streak",
      value: data.current_streak,
      suffix: ` ${data.streak_type}`,
      decimals: 0,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
        Performance
      </h2>
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.04 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {metrics.map((m) => (
          <motion.div key={m.label} variants={item} transition={{ duration: 0.45, ease: "easeOut" }}>
            <GlassCard className="flex h-full flex-col justify-between p-4">
              <span className="section-label">{m.label}</span>
              <div className="mt-2">
                <AnimatedCounter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                  decimals={m.decimals}
                  colorize={m.colorize}
                  className={`text-xl font-black tracking-[-0.02em] sm:text-2xl ${
                    m.negative ? "text-red-400" : ""
                  }`}
                />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
