"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./api";
import type {
  Overview,
  ActiveTradesResponse,
  TradeHistoryResponse,
  Metrics,
  EquityCurveResponse,
  DailyPnlResponse,
} from "./types";

export function useOverview() {
  return useQuery<Overview>({
    queryKey: ["overview"],
    queryFn: () => apiFetch<Overview>("overview"),
    refetchInterval: 5_000,
  });
}

export function useActiveTrades() {
  return useQuery<ActiveTradesResponse>({
    queryKey: ["active-trades"],
    queryFn: () => apiFetch<ActiveTradesResponse>("trades/active"),
    refetchInterval: 5_000,
  });
}

export function useTradeHistory(limit = 50) {
  return useQuery<TradeHistoryResponse>({
    queryKey: ["trade-history", limit],
    queryFn: () =>
      apiFetch<TradeHistoryResponse>(`trades/history?limit=${limit}`),
    refetchInterval: 30_000,
  });
}

export function useMetrics() {
  return useQuery<Metrics>({
    queryKey: ["metrics"],
    queryFn: () => apiFetch<Metrics>("metrics"),
    refetchInterval: 30_000,
  });
}

export function useEquityCurve() {
  return useQuery<EquityCurveResponse>({
    queryKey: ["equity-curve"],
    queryFn: () => apiFetch<EquityCurveResponse>("equity-curve"),
    refetchInterval: 60_000,
  });
}

export function useDailyPnl() {
  return useQuery<DailyPnlResponse>({
    queryKey: ["daily-pnl"],
    queryFn: () => apiFetch<DailyPnlResponse>("daily-pnl"),
    refetchInterval: 60_000,
  });
}

export function useHeartbeat() {
  return useQuery<{ status: string; timestamp: string }>({
    queryKey: ["heartbeat"],
    queryFn: () => apiFetch<{ status: string; timestamp: string }>("health"),
    refetchInterval: 10_000,
    retry: 0,
  });
}
