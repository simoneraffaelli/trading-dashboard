export type CumulativeReturnBasis =
  | "realized_closed_pnl_on_fixed_paper_balance"
  | "live_total_equity_history"
  | "trade_compounded_proxy";

export type ProfitFactorState =
  | "finite"
  | "unbounded"
  | "unavailable";

export type RuntimeStatusState = "running" | "stopped" | "unknown";

export type RuntimeMode = "paper" | "live" | null;

export interface RuntimeStatusResponse {
  status: RuntimeStatusState;
  mode: RuntimeMode;
  service: string;
  active_state: string;
  timestamp: string;
}

// ─── Overview ──────────────────────────────────────────
export interface Overview {
  balance_usd: number | null;
  cumulative_pnl_usd: number;
  cumulative_return_pct: number;
  trade_compounded_return_pct: number;
  cumulative_return_basis: CumulativeReturnBasis;
  cumulative_return_reference_balance_usd: number | null;
  today_pnl_usd: number;
  total_trades: number;
  open_positions: number;
  assets: string[];
  paper_mode: boolean;
  bot_started_at: string | null;
  timestamp: string;
}

// ─── Active Trade ──────────────────────────────────────
export interface ActiveTrade {
  asset: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  size_usd: number;
  size_coins: number;
  stop_loss: number;
  confidence: number;
  opened_at: string;
  paper: boolean;
}

export interface ActiveTradesResponse {
  trades: ActiveTrade[];
  count: number;
}

// ─── Closed Trade ──────────────────────────────────────
export interface ClosedTrade {
  asset: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  exit_price: number;
  size_usd: number;
  pnl_usd: number;
  pnl_pct: number;
  close_reason: string;
  opened_at: string;
  closed_at: string;
  confidence: number;
  paper: boolean;
}

export interface TradeHistoryResponse {
  trades: ClosedTrade[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Metrics ───────────────────────────────────────────
export interface Metrics {
  total_trades: number;
  long_trades: number;
  short_trades: number;
  win_rate: number;
  long_win_rate: number;
  short_win_rate: number;
  profit_factor: number | null;
  profit_factor_state: ProfitFactorState;
  profit_factor_display: string;
  sharpe: number;
  max_drawdown_pct: number;
  avg_hold_time_minutes: number;
  avg_trade_size_usd: number;
  cumulative_pnl_usd: number;
  cumulative_return_pct: number;
  trade_compounded_return_pct: number;
  cumulative_return_basis: CumulativeReturnBasis;
  cumulative_return_reference_balance_usd: number | null;
  best_trade_usd: number;
  worst_trade_usd: number;
  avg_win_usd: number;
  avg_loss_usd: number;
  current_streak: number;
  streak_type: "win" | "loss" | "none";
  trades_per_day: number;
  assets_traded: string[];
}

// ─── Equity Curve ──────────────────────────────────────
export interface EquityPoint {
  timestamp: string;
  cumulative_pnl: number;
  trade_pnl: number;
  cumulative_return_pct: number;
  trade_compounded_return_pct: number | null;
  balance_usd?: number | null;
  available_balance_usd?: number | null;
  event_reason?: string | null;
  trade_id?: string | number | null;
  asset?: string | null;
}

export interface EquityCurveResponse {
  curve: EquityPoint[];
}

// ─── Daily P&L ─────────────────────────────────────────
export interface DailyPnl {
  date: string;
  pnl_usd: number;
  trade_count: number;
}

export interface DailyPnlResponse {
  days: DailyPnl[];
}
