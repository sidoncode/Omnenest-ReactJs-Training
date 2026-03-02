# Groww-like Local WebSocket Market Feed

A dev-only mock WebSocket server that simulates Groww's real-time market data format.

## Quick Start

### 1. Start the WebSocket Server

```bash
cd server
npm install
npm start
```

Server runs on `ws://localhost:8080`

### 2. Test with CLI client

```bash
cd server
node test-client.js
```

### 3. React Dashboard (optional)

The `client/src/App.jsx` is a drop-in React component.
Create a Vite/CRA project and copy it in, or use with your existing Groww915 project:

```bash
# With Vite
npm create vite@latest client -- --template react
cd client
npm install
# Copy App.jsx into src/
npm run dev
```

---

## WebSocket Protocol

### Connect
```
ws://localhost:8080
```

### Server → Client Messages

| type | description |
|------|-------------|
| `CONNECTED` | Welcome message with available symbols |
| `SNAPSHOT` | Full quote on initial connect |
| `QUOTE` | Real-time price tick |
| `INDEX` | Index update (NIFTY50, SENSEX, etc.) |
| `DEPTH` | Market depth (bid/ask) update |

**Quote message shape:**
```json
{
  "type": "QUOTE",
  "symbol": "TCS",
  "exchange": "NSE",
  "timestamp": 1706000000000,
  "data": {
    "symbol": "TCS",
    "name": "Tata Consultancy",
    "ltp": 3875.20,
    "open": 3850.00,
    "high": 3910.50,
    "low": 3840.20,
    "prevClose": 3860.00,
    "change": 15.20,
    "changePercent": 0.39,
    "volume": 1234567,
    "buyQty": 23400,
    "sellQty": 18700,
    "upperCircuit": 4246.00,
    "lowerCircuit": 3474.00,
    "depth": {
      "bids": [{ "price": 3874.50, "qty": 850 }, ...],
      "asks": [{ "price": 3875.50, "qty": 1200 }, ...]
    }
  }
}
```

**Index message shape:**
```json
{
  "type": "INDEX",
  "symbol": "NIFTY50",
  "timestamp": 1706000000000,
  "data": {
    "value": 22450.50,
    "change": 125.30,
    "changePercent": 0.56,
    "open": 22350.0,
    "high": 22500.0,
    "low": 22280.0,
    "advances": 28,
    "declines": 20,
    "unchanged": 2
  }
}
```

### Client → Server Messages

```json
// Subscribe to specific symbols
{ "type": "SUBSCRIBE", "symbols": ["TCS", "RELIANCE"] }

// Unsubscribe
{ "type": "UNSUBSCRIBE", "symbols": ["TCS"] }

// Ping
{ "type": "PING" }
```

---

## Instruments

**15 NSE Stocks:** RELIANCE, TCS, HDFCBANK, INFY, WIPRO, SBIN, ICICIBANK, BAJFINANCE, TATAMOTORS, ADANIENT, HCLTECH, MARUTI, ASIANPAINT, KOTAKBANK, LTIM

**4 Indices:** NIFTY50, SENSEX, BANKNIFTY, NIFTYMID

## Tick Rates
- Stock quotes: ~400ms (3-5 random stocks per tick)
- Indices: 1500ms
- Market depth: 800ms (1 random stock)

---

## Integrating with Groww915 React App

```js
// In your existing project
const ws = new WebSocket("ws://localhost:8080");

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "QUOTE") {
    // update your Zustand store
    useMarketStore.getState().updateQuote(msg.symbol, msg.data);
  }
};
```
