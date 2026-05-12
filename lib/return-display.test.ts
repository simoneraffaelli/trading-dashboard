import { describe, expect, it } from "vitest";

import {
  formatSignedPercent,
  formatTradeProxyLabel,
  getReturnBasisMeta,
} from "./return-display";

describe("getReturnBasisMeta", () => {
  it("formats paper-balance return basis details with the fixed reference balance", () => {
    expect(
      getReturnBasisMeta(
        "realized_closed_pnl_on_fixed_paper_balance",
        10000
      )
    ).toEqual({
      label: "Paper Balance Basis",
      detail: "Realized closed PnL on fixed paper balance $10,000.00",
      toneClassName: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    });
  });

  it("formats live-equity return basis details with the baseline balance", () => {
    expect(getReturnBasisMeta("live_total_equity_history", 1000)).toEqual({
      label: "Live Equity Basis",
      detail: "Live equity history from baseline $1,000.00",
      toneClassName: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    });
  });

  it("marks fallback trade return basis as a proxy", () => {
    expect(getReturnBasisMeta("trade_compounded_proxy", null)).toEqual({
      label: "Trade Proxy Basis",
      detail: "Fallback compounded trade proxy when exact account basis is unavailable",
      toneClassName: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    });
  });
});

describe("trade proxy formatting", () => {
  it("formats signed percentages for valid numeric values", () => {
    expect(formatSignedPercent(10)).toBe("+10.00%");
    expect(formatSignedPercent(-3.456)).toBe("-3.46%");
  });

  it("returns null for missing or invalid trade proxy values", () => {
    expect(formatSignedPercent(null)).toBeNull();
    expect(formatSignedPercent(undefined)).toBeNull();
  });

  it("builds a trade proxy label only when a valid value is present", () => {
    expect(formatTradeProxyLabel(1.25)).toBe("Trade Proxy +1.25%");
    expect(formatTradeProxyLabel(null)).toBeNull();
  });
});