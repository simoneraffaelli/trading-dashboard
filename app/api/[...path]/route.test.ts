import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "./route";

const originalBaseUrl = process.env.DASHBOARD_API_BASE_URL;
const originalApiKey = process.env.DASHBOARD_API_KEY;

const endpointCases = [
  {
    path: "overview",
    payload: {
      balance_usd: 1100,
      cumulative_pnl_usd: 100,
      cumulative_return_pct: 10,
      trade_compounded_return_pct: 12,
      cumulative_return_basis: "live_total_equity_history",
      cumulative_return_reference_balance_usd: 1000,
      today_pnl_usd: 25,
      total_trades: 4,
      open_positions: 1,
      assets: ["BTCUSD"],
      paper_mode: false,
      bot_started_at: "2026-05-12T00:00:00.000Z",
      timestamp: "2026-05-12T12:00:00.000Z",
    },
  },
  {
    path: "runtime/status",
    payload: {
      status: "running",
      mode: "live",
      service: "auto-trading.service",
      active_state: "active",
      timestamp: "2026-05-12T12:00:00.000Z",
    },
  },
  {
    path: "metrics",
    payload: {
      total_trades: 4,
      long_trades: 3,
      short_trades: 1,
      win_rate: 0.75,
      long_win_rate: 0.67,
      short_win_rate: 1,
      profit_factor: null,
      profit_factor_state: "unbounded",
      profit_factor_display: "∞",
      sharpe: 1.2,
      max_drawdown_pct: 3.5,
      avg_hold_time_minutes: 45,
      avg_trade_size_usd: 250,
      cumulative_pnl_usd: 100,
      cumulative_return_pct: 10,
      trade_compounded_return_pct: 12,
      cumulative_return_basis: "live_total_equity_history",
      cumulative_return_reference_balance_usd: 1000,
      best_trade_usd: 60,
      worst_trade_usd: -20,
      avg_win_usd: 40,
      avg_loss_usd: -20,
      current_streak: 3,
      streak_type: "win",
      trades_per_day: 1.33,
      assets_traded: ["BTCUSD", "ETHUSD"],
    },
  },
  {
    path: "equity-curve",
    payload: {
      curve: [
        {
          timestamp: "2026-05-12T00:00:00.000Z",
          cumulative_pnl: 0,
          trade_pnl: 0,
          cumulative_return_pct: 0,
          trade_compounded_return_pct: null,
          balance_usd: 1000,
          available_balance_usd: 1000,
          event_reason: "api_read",
          trade_id: null,
          asset: null,
        },
      ],
    },
  },
] as const;

describe("dashboard API proxy", () => {
  beforeEach(() => {
    process.env.DASHBOARD_API_BASE_URL = "https://backend.example";
    process.env.DASHBOARD_API_KEY = "secret-key";
  });

  afterEach(() => {
    process.env.DASHBOARD_API_BASE_URL = originalBaseUrl;
    process.env.DASHBOARD_API_KEY = originalApiKey;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(endpointCases)(
    "proxies $path without caching and preserves the upstream body",
    async ({ path, payload }) => {
      const fetchMock = vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=60",
          },
        })
      );

      vi.stubGlobal("fetch", fetchMock);

      const response = await GET(
        new NextRequest(`http://localhost:3000/api/${path}`),
        { params: Promise.resolve({ path: path.split("/") }) }
      );

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
      const headers = requestInit?.headers as Headers;

      expect(String(upstreamUrl)).toBe(`https://backend.example/api/${path}`);
      expect(requestInit?.cache).toBe("no-store");
      expect(headers.get("X-API-Key")).toBe("secret-key");
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.headers.get("Pragma")).toBe("no-cache");
      expect(response.headers.get("Expires")).toBe("0");
      expect(await response.json()).toEqual(payload);
    }
  );

  it("proxies health without attaching X-API-Key", async () => {
    delete process.env.DASHBOARD_API_KEY;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "ok",
          timestamp: "2026-05-12T12:00:00.000Z",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("http://localhost:3000/api/health"),
      { params: Promise.resolve({ path: ["health"] }) }
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    const headers = requestInit?.headers as Headers;

    expect(String(upstreamUrl)).toBe("https://backend.example/api/health");
    expect(headers.get("X-API-Key")).toBeNull();
    expect(await response.json()).toEqual({
      status: "ok",
      timestamp: "2026-05-12T12:00:00.000Z",
    });
  });
});