"use client";

import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";
import { useOverview, useMetrics } from "@/lib/hooks";
import { formatTradeProxyLabel, getReturnBasisMeta } from "@/lib/return-display";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function StatsRow() {
  const { data: overview } = useOverview();
  const { data: metrics } = useMetrics();
  const returnBasisMeta = overview
    ? getReturnBasisMeta(
        overview.cumulative_return_basis,
        overview.cumulative_return_reference_balance_usd
      )
    : null;
  const tradeProxyLabel = formatTradeProxyLabel(
    overview?.trade_compounded_return_pct
  );

  const stats = [
    {
      label: "Balance",
      value: overview?.balance_usd,
      prefix: "$",
      decimals: 2,
      hint: overview?.balance_usd != null ? "Current account balance" : undefined,
    },
    {
      label: "Win Rate",
      value: metrics ? metrics.win_rate * 100 : undefined,
      suffix: "%",
      decimals: 1,
      hint: metrics
        ? `${metrics.long_win_rate * 100}% long / ${metrics.short_win_rate * 100}% short`
        : undefined,
    },
    {
      label: "Max Drawdown",
      value: metrics?.max_drawdown_pct,
      suffix: "%",
      decimals: 2,
      hint: "Computed from the return curve",
    },
    {
      label: "Total Return",
      value: overview?.cumulative_return_pct,
      suffix: "%",
      decimals: 2,
      hint: returnBasisMeta?.label,
      detail: overview && returnBasisMeta ? tradeProxyLabel ?? undefined : undefined,
    },
  ];

  return (
    <motion.div
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] lg:grid-cols-4"
    >
      {stats.map((s) => (
        <motion.div
          key={s.label}
          variants={item}
          className="bg-[#07070a] p-5 sm:p-6"
        >
          <p className="label">{s.label}</p>
          <div className="mt-2">
            {s.value !== null && s.value !== undefined ? (
              <AnimatedCounter
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
                className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
              />
            ) : (
              <span className="text-2xl font-extrabold text-slate-600">—</span>
            )}
          </div>
          {(s.hint || s.detail) && (
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              {s.hint && <p>{s.hint}</p>}
              {s.detail && <p className="font-mono text-slate-400">{s.detail}</p>}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
