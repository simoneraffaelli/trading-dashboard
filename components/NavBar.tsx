"use client";

import { motion } from "framer-motion";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { useOverview, useHeartbeat } from "@/lib/hooks";
import { formatUptime } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { data } = useOverview();
  const { isError: botOffline, failureCount } = useHeartbeat();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const startMs = data?.bot_started_at
    ? new Date(data.bot_started_at).getTime()
    : null;
  const elapsed = startMs ? now - startMs : null;

  const isLive = data ? !data.paper_mode : false;
  const isOnline = !botOffline;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070a]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-10">
        {/* Left: brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            SIZIX
          </span>
        </div>

        {/* Right: connection status + uptime + mode */}
        <div className="flex items-center gap-4">
          {/* Connection indicator */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium ${
              isOnline ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isOnline ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isOnline ? "Online" : "Offline"}
            </span>
          </span>

          {/* Uptime */}
          {isOnline && elapsed !== null && (
            <span className="hidden text-xs text-slate-500 sm:block">
              Uptime{" "}
              <span className="font-mono font-medium text-slate-300">
                {formatUptime(elapsed)}
              </span>
            </span>
          )}

          {/* Mode pill */}
          {isOnline ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                isLive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLive
                      ? "animate-ping bg-emerald-400"
                      : "animate-pulse bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    isLive ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              {isLive ? "LIVE" : "PAPER"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              OFFLINE
            </span>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
