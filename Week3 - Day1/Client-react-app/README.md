# Groww Dev Dashboard — React UI

A full-featured React dashboard connecting to your local WebSocket server.

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dashboard (make sure WS server is running first!)
npm run dev

# Open: http://localhost:3000
```

## Features

- **Live price ticking** with green/red flash animations on price change
- **Sparkline charts** per stock showing recent price trend
- **Index bar** — NIFTY50, SENSEX, BANKNIFTY, NIFTYMID
- **Market Depth** panel — bid/ask with visual bar chart
- **Buy/Sell pressure** ratio bar
- **Sector filter** — filter stocks by IT, Bank, Auto, etc.
- **Sortable columns** — click any header to sort
- **Search** — by symbol or company name
- **Feed log** — live WebSocket event log
- **Auto-reconnect** — reconnects automatically if server restarts

## File Structure

```
groww-dashboard/
  src/
    App.jsx          ← Main app, layout + state
    useMarketFeed.js ← WebSocket hook
    StockTable.jsx   ← Sortable table with flash rows
    StockDetail.jsx  ← Right panel: stats, depth, sparkline
    IndexBar.jsx     ← Top index cards
    FeedLog.jsx      ← Live event log
    Sparkline.jsx    ← SVG mini chart
    utils.js         ← Formatting helpers
    index.css        ← Global styles + CSS vars
  index.html
  vite.config.js
  package.json
```

## Requires
WebSocket server running on `ws://localhost:8080`
See the `groww-market-ws` server folder.
