"use client";

import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import { useDailyPnl } from "@/lib/hooks";

export default function DailyHeatmap() {
  const { data, isLoading } = useDailyPnl();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
          Daily P&L
        </h2>
        <div className="h-32 animate-pulse rounded-2xl bg-white/[0.02]" />
      </div>
    );
  }

  const maxAbs = Math.max(
    ...data.days.map((d) => Math.abs(d.pnl_usd)),
    0.01
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
        Daily P&L
      </h2>
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {data.days.map((day, i) => {
            const intensity = Math.min(Math.abs(day.pnl_usd) / maxAbs, 1);
            const isPositive = day.pnl_usd >= 0;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative"
              >
                <div
                  className="flex h-11 w-14 flex-col items-center justify-center rounded-lg border border-white/[0.04] cursor-default transition-transform hover:scale-110 sm:h-12 sm:w-16"
                  style={{
                    backgroundColor: isPositive
                      ? `rgba(34, 197, 94, ${0.1 + intensity * 0.4})`
                      : `rgba(239, 68, 68, ${0.1 + intensity * 0.4})`,
                  }}
                >
                  <span className="text-[9px] text-slate-400 sm:text-[10px]">
                    {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold sm:text-xs ${
                      isPositive ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}${day.pnl_usd.toFixed(2)}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 whitespace-nowrap shadow-lg">
                    {day.trade_count} trade{day.trade_count !== 1 ? "s" : ""}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
