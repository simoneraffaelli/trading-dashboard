"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useActiveTrades } from "@/lib/hooks";
import type { ActiveTrade } from "@/lib/types";

function AssetIcon({ asset }: { asset: string }) {
  const letter = asset.charAt(0);
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
      <span className="text-sm font-bold text-cyan-400">{letter}</span>
    </div>
  );
}

function TradeRow({ trade, index }: { trade: ActiveTrade; index: number }) {
  const isLong = trade.direction === "LONG";
  const elapsed = Math.round(
    (Date.now() - new Date(trade.opened_at).getTime()) / 60_000
  );
  const hours = Math.floor(elapsed / 60);
  const mins = elapsed % 60;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3.5 transition-colors hover:border-white/[0.08]"
    >
      <div className="flex items-center gap-3">
        <AssetIcon asset={trade.asset} />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{trade.asset}</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                isLong ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isLong ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trade.direction}
            </span>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400">
              {(trade.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Entry: ${trade.entry_price.toLocaleString()}
            <span className="mx-1.5 text-slate-700">|</span>
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm font-bold text-white">
          ${trade.size_usd.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

export default function ActiveTrades() {
  const { data, isLoading } = useActiveTrades();

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="label">Active Positions</p>
          <h2 className="mt-0.5 text-base font-bold text-white">
            {data ? `${data.count} Open Trade${data.count !== 1 ? "s" : ""}` : "Loading..."}
          </h2>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-2 p-4">
        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />
            ))}
          </div>
        )}

        {data && data.trades.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-slate-500">No open positions</p>
          </div>
        )}

        {data &&
          data.trades.map((t, i) => (
            <TradeRow
              key={`${t.asset}-${t.opened_at}`}
              trade={t}
              index={i}
            />
          ))}
      </div>
    </div>
  );
}
