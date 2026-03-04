# Groww-915 — Live Trading Dashboard

A production-grade real-time stock market dashboard built with:
- **WebSocket server** (Node.js + ws)
- **React 18 + TypeScript** frontend
- **Zustand** global state management
- **Domain-Driven Design** folder structure

## 📁 Project Structure

```
groww-915/
├── server/               ← Node.js WebSocket server
│   ├── server.js         ← 20 stocks, price ticker, order book, heartbeat
│   └── package.json
│
└── client/               ← React TSX application
    ├── src/
    │   ├── app/          ← App bootstrap
    │   ├── store/        ← Zustand slices (market, portfolio, ui)
    │   ├── shared/
    │   │   ├── types/    ← TypeScript interfaces
    │   │   ├── utils/    ← formatPrice, formatPercent, getColor…
    │   │   ├── hooks/    ← useWebSocket, useFlash
    │   │   ├── components/ ← Header, NotificationStack
    │   │   └── styles/   ← globals.css (CSS variables, animations)
    │   ├── services/
    │   │   └── websocket/ ← messageParser, reconnectStrategy
    │   ├── features/
    │   │   ├── dashboard/     ← StockRow, StockTable, WatchlistPage
    │   │   ├── stock-details/ ← StockDetail side panel
    │   │   ├── portfolio-overview/ ← P&L, holdings
    │   │   └── order-book/    ← OrderBookPage, depth chart
    │   ├── widgets/
    │   │   ├── ChartContainer/Sparkline.tsx
    │   │   ├── MarketDepth/OrderBook.tsx
    │   │   └── LiveTicker/EventFeed.tsx
    │   └── pages/        ← DashboardPage (root layout)
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

## 🚀 Setup

### Step 1 — Start the server

```bash
cd server
npm install
npm start
```
Server starts on `ws://localhost:8080`

### Step 2 — Start the React app

```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173`

**Both terminals must be running simultaneously.**

## ✨ Features

| Feature | Description |
|---|---|
| **Live prices** | 20 Indian stocks update every 800ms via WebSocket |
| **Flash animation** | Rows flash green ↑ / red ↓ on every price tick |
| **Sparklines** | SVG mini-charts show last 60 price movements |
| **Order Book** | Real-time bid/ask depth with animated depth bars |
| **Portfolio** | P&L tracking with demo holdings, live unrealised gains |
| **Watchlist** | Add/remove stocks, card-grid layout |
| **Event Feed** | Live WebSocket event log with PING/PONG heartbeat |
| **Reconnect** | Exponential backoff + zombie detection |
| **Search + Sort** | Filter by symbol/name/sector, sort any column |
| **Notifications** | Toast stack for user actions |

## 🧠 Key Concepts Used

- **WebSocket lifecycle** — onopen, onmessage, onclose, onerror
- **Exponential backoff** — 1s → 2s → 4s → 8s → max 30s
- **Heartbeat (PING/PONG)** — detects zombie connections
- **Zustand** — global state without prop drilling
- **useMemo + useCallback** — prevents unnecessary re-renders
- **React.memo** — memoised components (StockRow, Sparkline…)
- **useRef** — stores previous price for flash direction

## 📌 NOTE
All prices are randomly simulated. Do not use for real trading decisions.
