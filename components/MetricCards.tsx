"use client";

import { motion } from "framer-motion";
import { Proportions, TrendingUp, TrendingDown, Scale, Clock, Crosshair, Layers2, TrendingUpDown } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { useMetrics } from "@/lib/hooks";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface MetricDef {
  label: string;
  value: number | undefined;
  suffix?: string;
  decimals: number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string; // tailwind classes for bg + text
}

export default function MetricCards() {
  const { data, isLoading } = useMetrics();

  const cards: MetricDef[] = [
    {
      label: "Sharpe Ratio",
      value: data?.sharpe,
      decimals: 2,
      description: "Risk-adjusted performance",
      icon: Proportions,
      color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    },
    {
      label: "Profit Factor",
      value: data?.profit_factor,
      decimals: 2,
      description: "Gain vs loss ratio",
      icon: Scale,
      color: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
    {
      label: "Best Trade",
      value: data?.best_trade_usd,
      suffix: "$",
      decimals: 2,
      description: "Best trade in USD",
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    },
    {
      label: "Worst Trade",
      value: data?.worst_trade_usd,
      suffix: "$",
      decimals: 2,
      description: "Worst trade in USD",
      icon: TrendingDown,
      color: "bg-red-500/10 text-red-400 border-red-500/20",
    },
    {
      label: "Avg Hold Time",
      value: data?.avg_hold_time_minutes,
      suffix: "m",
      decimals: 0,
      description: "Average position duration",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Avg Trade Size",
      value: data?.avg_trade_size_usd,
      suffix: "$",
      decimals: 2,
      description: "Average position size",
      icon: Layers2,
      color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      label: "Current Streak",
      value: data?.current_streak,
      decimals: 0,
      description: `Current ${data?.streak_type} streak`,
      icon: TrendingUpDown,
      color: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    },
    {
      label: "Total Trades",
      value: data?.total_trades,
      decimals: 0,
      description: data
        ? `${data.long_trades} longs / ${data.short_trades} shorts`
        : "—",
      icon: Crosshair,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    }
  ];

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <p className="label">Performance Metrics</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.03]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="label">Performance Metrics</p>
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={item}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`rounded-2xl border p-5 ${c.color}`}
            >
              <Icon className="mb-3 h-5 w-5 opacity-60" />
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-60">
                {c.label}
              </p>
              <div className="mt-1">
                {c.value !== undefined ? (
                  <AnimatedCounter
                    value={c.value}
                    suffix={c.suffix}
                    decimals={c.decimals}
                    className="text-2xl font-black tracking-tight sm:text-3xl"
                  />
                ) : (
                  <span className="text-2xl font-black text-white/30">—</span>
                )}
              </div>
              <p className="mt-1.5 text-xs opacity-50">{c.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
