"use client";

import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import HeroPnl from "@/components/HeroPnl";
import StatsRow from "@/components/StatsRow";
import MetricCards from "@/components/MetricCards";
import ActiveTrades from "@/components/ActiveTrades";
import TradeHistory from "@/components/TradeHistory";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useHeartbeat } from "@/lib/hooks";
import { WifiOff } from "lucide-react";

const MeshGradient = dynamic(() => import("@/components/MeshGradient"), {
  ssr: false,
});
const EquityChart = dynamic(() => import("@/components/EquityChart"), {
  ssr: false,
});

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Home() {
  const { isError: botOffline } = useHeartbeat();

  return (
    <>
      <MeshGradient />

      {/* ── Top nav ── */}
      <NavBar />

      {/* ── Offline banner ── */}
      <AnimatePresence>
        {botOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b border-red-500/20 bg-red-500/[0.08]"
          >
            <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 py-3 sm:px-8 lg:px-10">
              <WifiOff className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs text-red-300/90">
                <span className="font-semibold text-red-300">Bot unreachable</span>
                {" — "}the trading API is not responding. Data shown below may be stale.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ErrorBoundary>
      <motion.main
        variants={stagger}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-[1400px] px-5 pb-16 pt-6 sm:px-8 lg:px-10"
      >
        {/* ── Hero: giant cumulative P&L ── */}
        <motion.section variants={fadeUp}>
          <HeroPnl />
        </motion.section>

        {/* ── Key stats row ── */}
        <motion.section variants={fadeUp} className="mt-10">
          <StatsRow />
        </motion.section>

        {/* ── Metric cards ── */}
        <motion.section variants={fadeUp} className="mt-10">
          <MetricCards />
        </motion.section>

        {/* ── Equity chart ── */}
        <motion.section variants={fadeUp} className="mt-10">
          <EquityChart />
        </motion.section>

        {/* ── Two-column: Active Positions + Trade History ── */}
        <motion.section variants={fadeUp} className="mt-10">
          <div className="grid gap-6 lg:grid-cols-2">
            <ActiveTrades />
            <TradeHistory />
          </div>
        </motion.section>
      </motion.main>
      </ErrorBoundary>
    </>
  );
}
