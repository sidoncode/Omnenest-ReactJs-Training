/**
 * Groww-like WebSocket Market Data Server
 * Dev/local mock server for real-time market data simulation
 * Port: 8080
 */

const WebSocket = require("ws");

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

// ─── Mock Instruments ────────────────────────────────────────────────────────
const STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", exchange: "NSE", sector: "Energy", basePrice: 2940.5 },
  { symbol: "TCS",      name: "Tata Consultancy",    exchange: "NSE", sector: "IT",     basePrice: 3875.2 },
  { symbol: "HDFCBANK", name: "HDFC Bank",           exchange: "NSE", sector: "Bank",   basePrice: 1680.75 },
  { symbol: "INFY",     name: "Infosys",             exchange: "NSE", sector: "IT",     basePrice: 1582.4 },
  { symbol: "WIPRO",    name: "Wipro",               exchange: "NSE", sector: "IT",     basePrice: 468.9 },
  { symbol: "SBIN",     name: "State Bank of India", exchange: "NSE", sector: "Bank",   basePrice: 812.3 },
  { symbol: "ICICIBANK",name: "ICICI Bank",          exchange: "NSE", sector: "Bank",   basePrice: 1245.6 },
  { symbol: "BAJFINANCE",name:"Bajaj Finance",       exchange: "NSE", sector: "NBFC",   basePrice: 6780.0 },
  { symbol: "TATAMOTORS",name:"Tata Motors",         exchange: "NSE", sector: "Auto",   basePrice: 965.4 },
  { symbol: "ADANIENT", name: "Adani Enterprises",   exchange: "NSE", sector: "Conglomerate", basePrice: 2456.8 },
  { symbol: "HCLTECH",  name: "HCL Technologies",    exchange: "NSE", sector: "IT",     basePrice: 1623.5 },
  { symbol: "MARUTI",   name: "Maruti Suzuki",       exchange: "NSE", sector: "Auto",   basePrice: 12340.0 },
  { symbol: "ASIANPAINT",name:"Asian Paints",        exchange: "NSE", sector: "FMCG",   basePrice: 2890.5 },
  { symbol: "KOTAKBANK", name:"Kotak Mahindra Bank", exchange: "NSE", sector: "Bank",   basePrice: 1876.4 },
  { symbol: "LTIM",     name: "LTIMindtree",         exchange: "NSE", sector: "IT",     basePrice: 5234.0 },
];

const INDICES = [
  { symbol: "NIFTY50",  name: "NIFTY 50",      baseValue: 22450.5 },
  { symbol: "SENSEX",   name: "BSE SENSEX",    baseValue: 73856.2 },
  { symbol: "BANKNIFTY",name: "BANK NIFTY",    baseValue: 48320.0 },
  { symbol: "NIFTYMID", name: "NIFTY MIDCAP",  baseValue: 49680.0 },
];

// ─── State ────────────────────────────────────────────────────────────────────
const state = {
  stocks: {},
  indices: {},
  subscribers: new Map(), // ws → Set<symbol>
};

// Initialize prices
STOCKS.forEach(s => {
  state.stocks[s.symbol] = {
    ...s,
    ltp: s.basePrice,
    open: s.basePrice * (1 + randomBetween(-0.02, 0.02)),
    high: s.basePrice * (1 + randomBetween(0, 0.04)),
    low: s.basePrice * (1 - randomBetween(0, 0.04)),
    prevClose: s.basePrice * (1 + randomBetween(-0.03, 0.03)),
    volume: Math.floor(randomBetween(100000, 5000000)),
    totalTradedValue: 0,
    buyQty: Math.floor(randomBetween(1000, 50000)),
    sellQty: Math.floor(randomBetween(1000, 50000)),
    upperCircuit: +(s.basePrice * 1.1).toFixed(2),
    lowerCircuit: +(s.basePrice * 0.9).toFixed(2),
    depth: generateDepth(s.basePrice),
    lastUpdated: Date.now(),
  };
});

INDICES.forEach(i => {
  state.indices[i.symbol] = {
    ...i,
    value: i.baseValue,
    open: i.baseValue * (1 + randomBetween(-0.01, 0.01)),
    high: i.baseValue * (1 + randomBetween(0, 0.02)),
    low:  i.baseValue * (1 - randomBetween(0, 0.02)),
    prevClose: i.baseValue * (1 + randomBetween(-0.02, 0.02)),
    advances: Math.floor(randomBetween(20, 35)),
    declines: Math.floor(randomBetween(10, 30)),
    unchanged: Math.floor(randomBetween(0, 5)),
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function generateDepth(price) {
  const bids = [];
  const asks = [];
  for (let i = 1; i <= 5; i++) {
    bids.push({ price: +(price - i * 0.5).toFixed(2), qty: Math.floor(randomBetween(100, 2000)) });
    asks.push({ price: +(price + i * 0.5).toFixed(2), qty: Math.floor(randomBetween(100, 2000)) });
  }
  return { bids, asks };
}

function tickStock(symbol) {
  const s = state.stocks[symbol];
  const delta = randomBetween(-0.003, 0.003); // ±0.3% per tick
  const newLtp = +(s.ltp * (1 + delta)).toFixed(2);

  // Keep within circuit limits
  const ltp = Math.min(Math.max(newLtp, s.lowerCircuit), s.upperCircuit);

  s.ltp = ltp;
  s.high = Math.max(s.high, ltp);
  s.low  = Math.min(s.low, ltp);
  s.volume += Math.floor(randomBetween(0, 500));
  s.totalTradedValue = +(s.ltp * s.volume / 1000).toFixed(0); // in crores approx
  s.change = +(s.ltp - s.prevClose).toFixed(2);
  s.changePercent = +((s.change / s.prevClose) * 100).toFixed(2);
  s.buyQty  = Math.floor(randomBetween(500, 80000));
  s.sellQty = Math.floor(randomBetween(500, 80000));
  s.depth   = generateDepth(ltp);
  s.lastUpdated = Date.now();

  return s;
}

function tickIndex(symbol) {
  const idx = state.indices[symbol];
  const delta = randomBetween(-0.002, 0.002);
  idx.value = +(idx.value * (1 + delta)).toFixed(2);
  idx.high  = Math.max(idx.high, idx.value);
  idx.low   = Math.min(idx.low, idx.value);
  idx.change = +(idx.value - idx.prevClose).toFixed(2);
  idx.changePercent = +((idx.change / idx.prevClose) * 100).toFixed(2);
  // shuffle advance/decline slightly
  const movement = Math.round(randomBetween(-2, 2));
  idx.advances = Math.max(0, Math.min(50, idx.advances + movement));
  idx.declines = Math.max(0, Math.min(50, 50 - idx.advances));
  return idx;
}

// ─── Message Builder (Groww-like envelope) ────────────────────────────────────
function buildQuoteMessage(symbol, data, type = "QUOTE") {
  return JSON.stringify({
    type,
    symbol,
    exchange: data.exchange || "NSE",
    timestamp: Date.now(),
    data,
  });
}

function buildIndexMessage(symbol, data) {
  return JSON.stringify({
    type: "INDEX",
    symbol,
    timestamp: Date.now(),
    data,
  });
}

function buildFullSnapshot(ws) {
  // Send all subscribed stocks + all indices on connect
  const symbols = state.subscribers.get(ws) || new Set(Object.keys(state.stocks));
  symbols.forEach(sym => {
    if (state.stocks[sym]) {
      ws.send(buildQuoteMessage(sym, state.stocks[sym], "SNAPSHOT"));
    }
  });
  Object.keys(state.indices).forEach(sym => {
    ws.send(buildIndexMessage(sym, state.indices[sym]));
  });
}

// ─── WebSocket Logic ──────────────────────────────────────────────────────────
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[+] Client connected: ${ip}  (total: ${wss.clients.size})`);

  state.subscribers.set(ws, new Set(Object.keys(state.stocks)));

  // Send welcome + snapshot
  ws.send(JSON.stringify({
    type: "CONNECTED",
    message: "Groww-like Market Feed (DEV)",
    serverTime: Date.now(),
    availableSymbols: Object.keys(state.stocks),
    availableIndices: Object.keys(state.indices),
  }));

  buildFullSnapshot(ws);

  // Handle subscription messages from client
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === "SUBSCRIBE" && Array.isArray(msg.symbols)) {
        const subs = state.subscribers.get(ws);
        msg.symbols.forEach(s => subs.add(s));
        ws.send(JSON.stringify({ type: "SUBSCRIBED", symbols: [...subs] }));
        console.log(`  → Subscribed: ${msg.symbols.join(", ")}`);
      }

      if (msg.type === "UNSUBSCRIBE" && Array.isArray(msg.symbols)) {
        const subs = state.subscribers.get(ws);
        msg.symbols.forEach(s => subs.delete(s));
        ws.send(JSON.stringify({ type: "UNSUBSCRIBED", symbols: msg.symbols }));
      }

      if (msg.type === "PING") {
        ws.send(JSON.stringify({ type: "PONG", ts: Date.now() }));
      }

    } catch (e) {
      console.error("Bad message from client:", e.message);
    }
  });

  ws.on("close", () => {
    state.subscribers.delete(ws);
    console.log(`[-] Client disconnected (total: ${wss.clients.size})`);
  });

  ws.on("error", (err) => console.error("WS Error:", err.message));
});

// ─── Tick Engine ──────────────────────────────────────────────────────────────
// Stocks: every 400ms, pick random 3-5 stocks to update
setInterval(() => {
  if (wss.clients.size === 0) return;

  // Pick random stocks to tick
  const symbols = Object.keys(state.stocks);
  const count = Math.floor(randomBetween(3, 6));
  const chosen = [];
  while (chosen.length < count) {
    const s = symbols[Math.floor(Math.random() * symbols.length)];
    if (!chosen.includes(s)) chosen.push(s);
  }

  chosen.forEach(sym => {
    const updated = tickStock(sym);
    const msg = buildQuoteMessage(sym, updated);

    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        const subs = state.subscribers.get(ws);
        if (!subs || subs.has(sym)) {
          ws.send(msg);
        }
      }
    });
  });
}, 400);

// Indices: every 1.5s
setInterval(() => {
  if (wss.clients.size === 0) return;

  Object.keys(state.indices).forEach(sym => {
    const updated = tickIndex(sym);
    const msg = buildIndexMessage(sym, updated);

    wss.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    });
  });
}, 1500);

// Market depth update: every 800ms for random stock
setInterval(() => {
  if (wss.clients.size === 0) return;
  const symbols = Object.keys(state.stocks);
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  const s = state.stocks[sym];
  s.depth = generateDepth(s.ltp);

  const msg = JSON.stringify({
    type: "DEPTH",
    symbol: sym,
    timestamp: Date.now(),
    data: s.depth,
  });

  wss.clients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      const subs = state.subscribers.get(ws);
      if (!subs || subs.has(sym)) ws.send(msg);
    }
  });
}, 800);

console.log(`
╔══════════════════════════════════════════════════════╗
║   Groww-like Market WebSocket Server (DEV)           ║
║   ws://localhost:${PORT}                               ║
║                                                      ║
║   Stocks  : ${STOCKS.length} NSE instruments                    ║
║   Indices : ${INDICES.length} (NIFTY50, SENSEX, BANKNIFTY...)   ║
║   Tick    : ~400ms stocks | 1.5s indices             ║
╚══════════════════════════════════════════════════════╝
`);
