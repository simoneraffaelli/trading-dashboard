import type { CumulativeReturnBasis } from "./types";

export interface ReturnBasisMeta {
  label: string;
  detail: string;
  toneClassName: string;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function formatUsd(amount: number) {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatSignedPercent(value: number | null | undefined) {
  if (!isFiniteNumber(value)) {
    return null;
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatTradeProxyLabel(value: number | null | undefined) {
  const formattedPercent = formatSignedPercent(value);

  if (!formattedPercent) {
    return null;
  }

  return `Trade Proxy ${formattedPercent}`;
}

export function getReturnBasisMeta(
  basis: CumulativeReturnBasis,
  referenceBalanceUsd: number | null
): ReturnBasisMeta {
  switch (basis) {
    case "realized_closed_pnl_on_fixed_paper_balance": {
      const detail =
        referenceBalanceUsd !== null
          ? `Realized closed PnL on fixed paper balance $${formatUsd(referenceBalanceUsd)}`
          : "Realized closed PnL on fixed paper balance";

      return {
        label: "Paper Balance Basis",
        detail,
        toneClassName: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      };
    }

    case "live_total_equity_history": {
      const detail =
        referenceBalanceUsd !== null
          ? `Live equity history from baseline $${formatUsd(referenceBalanceUsd)}`
          : "Live equity history baseline";

      return {
        label: "Live Equity Basis",
        detail,
        toneClassName: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
      };
    }

    case "trade_compounded_proxy":
    default:
      return {
        label: "Trade Proxy Basis",
        detail: "Fallback compounded trade proxy when exact account basis is unavailable",
        toneClassName: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      };
  }
}