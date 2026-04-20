"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useTradeHistory, useMetrics } from "@/lib/hooks";

const PAGE_SIZE = 10;

export default function TradeHistory() {
  const { data, isLoading } = useTradeHistory(50);
  const { data: metrics } = useMetrics();
  const [page, setPage] = useState(0);

  const wins = metrics ? Math.round(metrics.win_rate * metrics.total_trades) : 0;
  const losses = metrics ? metrics.total_trades - wins : 0;

  const totalPages = data ? Math.ceil(data.trades.length / PAGE_SIZE) : 0;
  const paged = data ? data.trades.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) : [];

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="label">Trade History</p>
          <h2 className="mt-0.5 text-base font-bold text-white">
            {data ? `${data.total} Trades` : "Loading..."}
          </h2>
        </div>
        {metrics && (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {wins}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
              <XCircle className="h-3.5 w-3.5" />
              {losses}
            </span>
          </div>
        )}
      </div>

      {/* Trade list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-white/[0.03] animate-pulse bg-white/[0.02]" />
            ))}
          </div>
        )}

        {data &&
          paged.map((trade, i) => {
            const isWin = trade.pnl_usd > 0;
            const isLong = trade.direction === "LONG";
            return (
              <motion.div
                key={`${trade.asset}-${trade.closed_at}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between border-b border-white/[0.03] px-5 py-3 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  {/* Win/Loss indicator */}
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      isWin
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {isWin ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">
                        {trade.asset}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                          isLong ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {isLong ? (
                          <ArrowUpRight className="h-2.5 w-2.5" />
                        ) : (
                          <ArrowDownRight className="h-2.5 w-2.5" />
                        )}
                        {trade.direction}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {new Date(trade.closed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <span className="mx-1 text-slate-700">&middot;</span>
                      {(() => {
                        const ms =
                          new Date(trade.closed_at).getTime() -
                          new Date(trade.opened_at).getTime();
                        const m = Math.round(ms / 60000);
                        const h = Math.floor(m / 60);
                        return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
                      })()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-mono text-sm font-bold ${
                      isWin ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isWin ? "+" : ""}${trade.pnl_usd.toFixed(2)}
                  </p>
                  <p
                    className={`font-mono text-[11px] ${
                      isWin ? "text-emerald-400/60" : "text-red-400/60"
                    }`}
                  >
                    {isWin ? "+" : ""}
                    {(trade.pnl_pct * 100).toFixed(2)}%
                  </p>
                </div>
              </motion.div>
            );
          })}
      </div>

      {/* Footer with pagination */}
      {data && (
        <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
          <p className="text-xs text-slate-500">
            {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, data.trades.length)} of {data.trades.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[3rem] text-center text-xs text-slate-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
