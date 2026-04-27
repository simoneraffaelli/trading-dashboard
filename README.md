# SIZIX

Real-time performance dashboard for an AI-powered autonomous trading bot. Built with **Next.js 16**, **Tailwind CSS v4**, and **Framer Motion** — designed as a dark, cinematic monitoring interface.

---

## What It Does

Connects to a FastAPI backend that runs an autonomous crypto trading system and displays:

- **Live P&L** — giant animated cumulative profit/loss hero
- **Key Stats** — balance, active positions, win rate, max drawdown
- **Performance Metrics** — Sharpe ratio, profit factor, avg hold time, total trades
- **Equity Curve** — interactive TradingView chart with peak/lowest/period return
- **Active Positions** — open trades with direction, entry price, confidence, elapsed time
- **Trade History** — closed trades with win/loss indicators, P&L, and duration

All data is polled automatically (5s–60s intervals) with zero page reloads.

---

## Tech Stack

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Framework | Next.js 16 (App Router)       |
| UI        | React 19 + Tailwind CSS v4    |
| Animation | Framer Motion 12              |
| Charts    | lightweight-charts v5         |
| Data      | @tanstack/react-query 5       |
| Icons     | lucide-react                  |
| Backend   | FastAPI (Python, separate repo)|
| Fonts     | Inter + JetBrains Mono        |

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- The FastAPI trading bot backend running on port `8099`

### Setup

```bash
# Clone and install
git clone <repo-url> trading-dashboard
cd trading-dashboard
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local:
#   DASHBOARD_API_BASE_URL=http://127.0.0.1:8099
#   DASHBOARD_API_KEY=your-api-key
```

### Run

```bash
npm run dev          # → http://localhost:3000
```

### Build for Production

```bash
npm run build        # Standalone output for Docker/Coolify
npm run start        # Start production server
```

---

## Project Structure

```
app/
  layout.tsx           Root layout (fonts, providers)
  page.tsx             Main page (assembles all sections)
  globals.css          Design tokens + base styles
  providers.tsx        React Query provider
  api/[...path]/       Catch-all proxy → FastAPI backend

components/
  NavBar.tsx           Sticky nav: brand, uptime, LIVE/PAPER pill
  HeroPnl.tsx          Giant P&L display with animated glow
  StatsRow.tsx         4-column key metrics grid
  MetricCards.tsx      Colored performance cards
  EquityChart.tsx      TradingView area chart + stats
  ActiveTrades.tsx     Open positions list
  TradeHistory.tsx     Closed trades with win/loss indicators
  AnimatedCounter.tsx  Spring-animated numbers
  MeshGradient.tsx     Canvas background animation

lib/
  types.ts             TypeScript interfaces
  api.ts               Fetch wrapper
  hooks.ts             React Query hooks (polling)
```

---

## Architecture

The frontend never talks directly to the Python backend. All API calls go through a **server-side proxy route** (`app/api/[...path]/route.ts`) that forwards the full dashboard API surface, injects `X-API-Key` for protected routes, and streams upstream responses through unchanged. This keeps credentials server-side and avoids CORS.

See [ARCHITECTURE.md](ARCHITECTURE.md) for a detailed architecture overview including data flow diagrams, component hierarchy, design system tokens, and deployment details.

---

## Environment Variables

| Variable | Description | Example |
| -------- | ----------- | ------- |
| `DASHBOARD_API_BASE_URL` | FastAPI backend base URL without a trailing slash | `http://127.0.0.1:8099` |
| `DASHBOARD_API_KEY` | API key for protected backend endpoints | (required except `/api/health`) |

---

## License

Private project. All rights reserved.
