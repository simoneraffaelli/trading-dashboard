"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useEffect, useState } from "react";

import { useHeartbeat, useOverview, useRuntimeStatus } from "@/lib/hooks";
import { resolveRuntimePill } from "@/lib/runtime-pill";
import { formatUptime } from "@/lib/utils";

const PILL_STYLES = {
  live: {
    container: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-500",
    halo: "bg-emerald-400",
  },
  paper: {
    container: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-500",
    halo: "bg-amber-400",
  },
  stopped: {
    container: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-500",
    halo: "bg-red-400",
  },
  offline: {
    container: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-500",
    halo: "bg-red-400",
  },
  unknown: {
    container: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    dot: "bg-slate-500",
    halo: "bg-slate-400",
  },
} as const;

export default function NavBar() {
  const { data } = useOverview();
  const { isError: botOffline } = useHeartbeat();
  const {
    data: runtimeStatus,
    isError: runtimeStatusError,
  } = useRuntimeStatus();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const initialId = setTimeout(tick, 0);
    const intervalId = setInterval(tick, 1000);

    return () => {
      clearTimeout(initialId);
      clearInterval(intervalId);
    };
  }, []);

  const startMs = data?.bot_started_at
    ? new Date(data.bot_started_at).getTime()
    : null;
  const elapsed = startMs !== null && now !== null ? now - startMs : null;
  const isOnline = !botOffline;
  const pill = resolveRuntimePill({
    heartbeatError: botOffline,
    runtimeStatus: runtimeStatus?.status,
    runtimeMode: runtimeStatus?.mode,
    runtimeQueryError: runtimeStatusError,
  });
  const pillStyles = PILL_STYLES[pill.tone];

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

        {/* Right: uptime + mode */}
        <div className="flex items-center gap-4">
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
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${pillStyles.container}`}
          >
            <span className="relative flex h-2 w-2">
              {pill.animate ? (
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pillStyles.halo}`}
                />
              ) : null}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${pillStyles.dot}`}
              />
            </span>
            {pill.label}
          </span>
        </div>
      </div>
    </motion.nav>
  );
}
