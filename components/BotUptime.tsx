"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useOverview } from "@/lib/hooks";

function formatUptime(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0 || days > 0) parts.push(`${hours % 24}h`);
  parts.push(`${minutes % 60}m`);
  parts.push(`${seconds % 60}s`);

  return parts.join(" ");
}

export default function BotUptime() {
  const { data } = useOverview();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!data?.bot_started_at) return null;

  const startMs = new Date(data.bot_started_at).getTime();
  const elapsed = now - startMs;
  const elapsedDays = elapsed / (1000 * 60 * 60 * 24);
  const pnlPerDay = elapsedDays > 0 ? data.cumulative_pnl_usd / elapsedDays : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-baseline gap-x-5 gap-y-1"
    >
      <div className="flex items-baseline gap-2">
        <span className="section-label">Running</span>
        <span className="font-mono text-base font-semibold tabular-nums tracking-tight text-slate-200 sm:text-lg">
          {formatUptime(elapsed)}
        </span>
      </div>

      <span className="hidden text-slate-700 sm:inline">/</span>

      <div className="flex items-baseline gap-2">
        <span className="section-label">Avg / Day</span>
        <span
          className={`font-mono text-base font-bold tabular-nums tracking-tight sm:text-lg ${
            pnlPerDay >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {pnlPerDay >= 0 ? "+" : ""}${pnlPerDay.toFixed(2)}
        </span>
      </div>
    </motion.div>
  );
}
