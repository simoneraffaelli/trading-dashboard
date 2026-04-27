# Architecture Overview

This document describes the architecture of the **Trading Dashboard**, a real-time Next.js frontend that visualizes performance data from a Python-based autonomous trading bot.

---

## High-Level Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
│                                                                  │
│   Next.js App (React 19 + Tailwind v4 + Framer Motion)          │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  page.tsx                                                │   │
│   │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐   │   │
│   │  │  NavBar   │ │ HeroPnl  │ │StatsRow │ │MetricCards │   │   │
│   │  └──────────┘ └──────────┘ └─────────┘ └────────────┘   │   │
│   │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐   │   │
│   │  │ EquityChart   │ │ ActiveTrades │ │ TradeHistory   │   │   │
│   │  └──────────────┘ └──────────────┘ └────────────────┘   │   │
│   └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                  React Query (polling)                            │
│                              │                                   │
│                    fetch("/api/...")                              │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTP
┌──────────────────────────────┴───────────────────────────────────┐
│              Next.js Server (API Route Proxy)                     │
│                                                                   │
│    app/api/[...path]/route.ts                                     │
│    Proxies dashboard routes, adding X-API-Key when required       │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTP + X-API-Key header
┌──────────────────────────────┴───────────────────────────────────┐
│                  FastAPI Backend (port 8099)                       │
│                                                                   │
│    /api/health            → unauthenticated health check          │
│    /api/diagnostics/collectors → collector freshness diagnostics  │
│    /api/overview          → bot state + balance + P&L             │
│    /api/trades/active     → currently open positions              │
│    /api/trades/history    → closed trades with pagination         │
│    /api/trades/export     → NDJSON trade log download             │
│    /api/metrics           → aggregated performance metrics        │
│    /api/equity-curve      → timestamped equity points             │
│    /api/daily-pnl         → per-day P&L breakdown                 │
│                                                                   │
│    Reads from: logs/trades.jsonl, bot runtime state               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer        | Technology                          | Purpose                                    |
| ------------ | ----------------------------------- | ------------------------------------------ |
| Framework    | **Next.js 16** (App Router)         | File-based routing, SSR, API proxy         |
| Runtime      | **React 19**                        | UI rendering                               |
| Bundler      | **Turbopack**                       | Fast dev builds                            |
| Styling      | **Tailwind CSS v4**                 | Utility-first CSS with `@theme inline`     |
| Fonts        | **Inter** + **JetBrains Mono**      | Sans + monospace via `next/font/google`    |
| Animation    | **Framer Motion 12**                | Layout transitions, spring counters, hover |
| Charts       | **lightweight-charts v5**           | TradingView AreaSeries equity chart        |
| Data Fetching| **@tanstack/react-query 5**         | Caching, polling, deduplication            |
| Icons        | **lucide-react**                    | SVG icon set                               |
| Backend      | **FastAPI** (Python)                | REST API serving trade data                |
| Deployment   | **Standalone** (`output: "standalone"`) | Docker / Coolify ready                 |

---

## Directory Structure

```
trading-dashboard/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout: fonts, Providers wrapper
│   ├── page.tsx                # Main page: assembles all sections
│   ├── globals.css             # Design tokens, Tailwind config, base styles
│   ├── providers.tsx           # React Query provider
│   └── api/
│       └── [...path]/
│           └── route.ts        # Catch-all API proxy → FastAPI backend
│
├── components/                 # React components (all "use client")
│   ├── NavBar.tsx              # Sticky top nav: brand, uptime, LIVE/PAPER pill
│   ├── HeroPnl.tsx             # Giant cumulative P&L hero with animated glow
│   ├── StatsRow.tsx            # 4-stat grid: balance, active, win rate, drawdown
│   ├── MetricCards.tsx         # Colored metric cards: Sharpe, PF, hold time, total
│   ├── EquityChart.tsx         # TradingView area chart with peak/low/return stats
│   ├── ActiveTrades.tsx        # Open positions list with asset icons
│   ├── TradeHistory.tsx        # Closed trades list with win/loss indicators
│   ├── AnimatedCounter.tsx     # Spring-animated number display
│   ├── MeshGradient.tsx        # Canvas-based animated background gradient
│   └── GlassCard.tsx           # Reusable glass-morphism card (legacy)
│
├── lib/                        # Shared utilities
│   ├── types.ts                # TypeScript interfaces for all API responses
│   ├── api.ts                  # Thin fetch wrapper (apiFetch<T>)
│   └── hooks.ts                # React Query hooks with polling intervals
│
├── public/                     # Static assets
├── .env.local                  # DASHBOARD_API_BASE_URL and DASHBOARD_API_KEY
├── next.config.ts              # Next.js config (standalone output)
├── tsconfig.json               # TypeScript config
├── tailwind + postcss          # PostCSS config for Tailwind v4
└── package.json                # Dependencies and scripts
```

---

## Data Flow

### 1. API Proxy Pattern

The client never talks directly to the Python backend. All requests go through a **server-side catch-all route** at `app/api/[...path]/route.ts`:

```
Browser → GET /api/overview → Next.js route handler → GET ${DASHBOARD_API_BASE_URL}/api/overview (+ X-API-Key header when required) → JSON response
```

This pattern:
- **Hides the API key** from the client (stored only in `.env.local` server-side)
- **Avoids CORS** issues between the frontend and backend
- **Enables deployment** where the backend is on a private network

The route handler proxies these upstream endpoints:
- `/api/health`
- `/api/diagnostics/collectors`
- `/api/overview`
- `/api/trades/active`
- `/api/trades/history`
- `/api/trades/export`
- `/api/metrics`
- `/api/equity-curve`
- `/api/daily-pnl`

### 2. Polling via React Query

Each data hook in `lib/hooks.ts` wraps a `useQuery` call with a specific polling interval:

| Hook               | Endpoint              | Interval | Purpose                      |
| ------------------ | --------------------- | -------- | ---------------------------- |
| `useOverview()`    | `/api/overview`       | 5 s      | Balance, P&L, bot state      |
| `useActiveTrades()`| `/api/trades/active`  | 5 s      | Open positions               |
| `useTradeHistory()`| `/api/trades/history` | 30 s     | Closed trades (paginated)    |
| `useMetrics()`     | `/api/metrics`        | 30 s     | Win rate, Sharpe, PF, etc.   |
| `useEquityCurve()` | `/api/equity-curve`   | 60 s     | Chart data points            |
| `useDailyPnl()`    | `/api/daily-pnl`      | 60 s     | Daily breakdown (unused atm) |

React Query handles caching (`staleTime: 4s`), deduplication, retries (2), and refetch-on-focus automatically via the `QueryClient` configured in `providers.tsx`.

---

## Component Architecture

### Page Layout (`page.tsx`)

The main page is a single vertically-stacked layout wrapped in Framer Motion stagger animations:

```
MeshGradient        (fixed canvas background, client-only)
NavBar              (sticky top, z-50)
  └─ main (max-w-1400px, centered)
     ├── HeroPnl         → Giant P&L number with glow
     ├── StatsRow         → 4-column stat grid
     ├── MetricCards      → 4 colored metric cards
     ├── EquityChart      → TradingView area chart
     └── grid (lg:2-col)
         ├── ActiveTrades → Open positions
         └── TradeHistory → Closed trades
```

Each section is wrapped in a `<motion.section variants={fadeUp}>` for staggered fade-in-up on page load.

### Client-Only Components

Two components use `dynamic(() => import(...), { ssr: false })` because they depend on browser APIs:

- **MeshGradient** — uses `<canvas>` with `requestAnimationFrame`
- **EquityChart** — uses `lightweight-charts` which requires the DOM

### Shared Primitives

- **AnimatedCounter** — Spring-based number interpolation using `framer-motion`'s `useSpring` + `useTransform`. Shared by HeroPnl, StatsRow, and MetricCards.
- **`.card` CSS class** — Standard card styling (background, border, border-radius, hover) defined in `globals.css`. Used by EquityChart, ActiveTrades, TradeHistory.
- **`.label` CSS class** — Tiny uppercase tracking label. Used consistently across all sections.

---

## Design System

Defined as CSS custom properties in `globals.css`:

| Token                | Value                        | Usage                       |
| -------------------- | ---------------------------- | --------------------------- |
| `--background`       | `#07070a`                    | Page background             |
| `--foreground`       | `#e2e8f0`                    | Default text                |
| `--accent`           | `#00d4ff` (cyan)             | Primary accent, links, glow |
| `--accent2`          | `#7c3aed` (violet)           | Secondary accent, gradients |
| `--card`             | `#0e0e12`                    | Card backgrounds            |
| `--card-border`      | `rgba(255,255,255,0.06)`     | Subtle card borders         |
| `--card-border-hover`| `rgba(0,212,255,0.15)`       | Hover state border glow     |
| `--muted`            | `#64748b`                    | Muted/secondary text        |
| `--positive`         | `#22c55e`                    | Profit, wins                |
| `--negative`         | `#ef4444`                    | Loss, drawdown              |

Typography: **Inter** for UI text, **JetBrains Mono** for numerical values and code.

The visual aesthetic is dark-mode only with glass-morphism cards, animated canvas mesh gradient background, and cyan/violet accent colors.

---

## Environment Configuration

| Variable | Required | Example | Description |
| -------- | -------- | ------- | ----------- |
| `DASHBOARD_API_BASE_URL` | Yes | `http://127.0.0.1:8099` | FastAPI backend base URL without a trailing slash |
| `DASHBOARD_API_KEY` | Required for protected routes | (empty) | API key sent as `X-API-Key` except for `/api/health` |

Set in `.env.local` (gitignored). In production, set as environment variables in the deployment platform.

---

## Build & Deployment

```bash
# Development
npm run dev            # Starts Turbopack dev server on :3000

# Production build
npm run build          # Creates standalone output in .next/standalone
npm run start          # Starts the production server

# Docker (Coolify-compatible)
# The `output: "standalone"` config generates a self-contained server.js
# that includes only the needed node_modules, ready for a minimal Docker image.
```

The standalone build produces:
```
.next/standalone/
├── server.js          # Entry point (node server.js)
├── node_modules/      # Pruned dependencies
└── .next/static/      # Static assets (copy to public/)
```

---

## API Contract

All endpoints return JSON. The TypeScript interfaces in `lib/types.ts` mirror the backend's response shapes exactly:

- **`Overview`** — Balance, cumulative P&L, today P&L, open positions, paper mode, uptime
- **`ActiveTradesResponse`** — List of open trades with entry price, size, stop loss, confidence
- **`TradeHistoryResponse`** — Paginated closed trades with P&L, direction, timestamps
- **`Metrics`** — Aggregated stats: win rate, Sharpe, profit factor, drawdown, streaks
- **`EquityCurveResponse`** — Array of `{timestamp, cumulative_pnl, trade_pnl}` points
- **`DailyPnlResponse`** — Array of `{date, pnl_usd, trade_count}` entries
