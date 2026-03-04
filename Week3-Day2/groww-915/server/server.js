const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

// ── Stock data ──────────────────────────────────────────────────────────────
const stocks = {
  RELIANCE:  { symbol: "RELIANCE",  name: "Reliance Industries",  price: 2940.50, sector: "Energy",  marketCap: 1988000 },
  TCS:       { symbol: "TCS",       name: "Tata Consultancy",     price: 3875.20, sector: "IT",      marketCap: 1402000 },
  HDFCBANK:  { symbol: "HDFCBANK",  name: "HDFC Bank",            price: 1680.75, sector: "Bank",    marketCap: 1278000 },
  INFY:      { symbol: "INFY",      name: "Infosys",              price: 1582.40, sector: "IT",      marketCap:  655000 },
  WIPRO:     { symbol: "WIPRO",     name: "Wipro",                price:  468.90, sector: "IT",      marketCap:  242000 },
  SBIN:      { symbol: "SBIN",      name: "State Bank of India",  price:  812.30, sector: "Bank",    marketCap:  725000 },
  ICICIBANK: { symbol: "ICICIBANK", name: "ICICI Bank",           price: 1245.60, sector: "Bank",    marketCap:  876000 },
  TATAMOTORS:{ symbol: "TATAMOTORS",name: "Tata Motors",          price:  965.40, sector: "Auto",    marketCap:  352000 },
  MARUTI:    { symbol: "MARUTI",    name: "Maruti Suzuki",        price:12340.00, sector: "Auto",    marketCap:  372000 },
  HCLTECH:   { symbol: "HCLTECH",   name: "HCL Technologies",     price: 1623.50, sector: "IT",      marketCap:  440000 },
  BAJFINANCE:{ symbol: "BAJFINANCE",name: "Bajaj Finance",        price: 6820.00, sector: "Finance", marketCap:  411000 },
  AXISBANK:  { symbol: "AXISBANK",  name: "Axis Bank",            price: 1102.30, sector: "Bank",    marketCap:  339000 },
  SUNPHARMA: { symbol: "SUNPHARMA", name: "Sun Pharmaceuticals",  price: 1456.80, sector: "Pharma",  marketCap:  350000 },
  ULTRACEMCO:{ symbol: "ULTRACEMCO",name: "UltraTech Cement",     price: 9870.00, sector: "Cement",  marketCap:  285000 },
  NTPC:      { symbol: "NTPC",      name: "NTPC Limited",         price:  348.60, sector: "Power",   marketCap:  337000 },
  ONGC:      { symbol: "ONGC",      name: "Oil & Natural Gas",    price:  267.40, sector: "Energy",  marketCap:  337000 },
  LT:        { symbol: "LT",        name: "Larsen & Toubro",      price: 3456.70, sector: "Infra",   marketCap:  474000 },
  ASIANPAINT:{ symbol: "ASIANPAINT",name: "Asian Paints",         price: 2876.50, sector: "FMCG",    marketCap:  275000 },
  HINDUNILVR:{ symbol: "HINDUNILVR",name: "Hindustan Unilever",   price: 2312.00, sector: "FMCG",    marketCap:  543000 },
  KOTAKBANK: { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank",  price: 1876.40, sector: "Bank",    marketCap:  373000 },
};

// Initialise OHLCV for each stock
Object.values(stocks).forEach((s) => {
  s.open = s.price;
  s.prevClose = s.price;
  s.high = s.price;
  s.low = s.price;
  s.volume = Math.floor(Math.random() * 2000000) + 500000;
  s.change = 0;
  s.changePercent = 0;
});

// ── Order book simulation ───────────────────────────────────────────────────
function generateOrderBook(basePrice) {
  const bids = [];
  const asks = [];
  for (let i = 0; i < 5; i++) {
    bids.push({ price: parseFloat((basePrice - (i + 1) * 0.25).toFixed(2)), qty: Math.floor(Math.random() * 500) + 100 });
    asks.push({ price: parseFloat((basePrice + (i + 1) * 0.25).toFixed(2)), qty: Math.floor(Math.random() * 500) + 100 });
  }
  return { bids, asks };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function randomBetween(min, max) { return Math.random() * (max - min) + min; }

function updateStockPrice(stock) {
  const changePercent = randomBetween(-0.004, 0.004);
  stock.price = parseFloat((stock.price * (1 + changePercent)).toFixed(2));
  if (stock.price > stock.high) stock.high = stock.price;
  if (stock.price < stock.low)  stock.low  = stock.price;
  stock.change = parseFloat((stock.price - stock.prevClose).toFixed(2));
  stock.changePercent = parseFloat(((stock.change / stock.prevClose) * 100).toFixed(2));
  stock.volume += Math.floor(randomBetween(0, 800));
}

// ── Broadcast helper ─────────────────────────────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  server.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg);
  });
}

// ── Connection handler ───────────────────────────────────────────────────────
server.on("connection", (client) => {
  console.log("Client connected. Total:", server.clients.size);

  client.send(JSON.stringify({ type: "HELLO", message: "Connected to Groww-915 Server" }));

  // Full snapshot immediately
  Object.values(stocks).forEach((s) => {
    client.send(JSON.stringify({ type: "STOCK_UPDATE", stock: s }));
  });

  // Send order book for first stock
  const firstSymbol = Object.keys(stocks)[0];
  client.send(JSON.stringify({
    type: "ORDER_BOOK",
    symbol: firstSymbol,
    ...generateOrderBook(stocks[firstSymbol].price),
  }));

  // PING/PONG heartbeat
  client.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "PING") {
        client.send(JSON.stringify({ type: "PONG", ts: msg.ts }));
      }
      if (msg.type === "SUBSCRIBE_ORDER_BOOK" && msg.symbol && stocks[msg.symbol]) {
        client.send(JSON.stringify({
          type: "ORDER_BOOK",
          symbol: msg.symbol,
          ...generateOrderBook(stocks[msg.symbol].price),
        }));
      }
    } catch {}
  });

  client.on("close", () => console.log("Client left. Total:", server.clients.size));
});

// ── Tick engine ──────────────────────────────────────────────────────────────
setInterval(() => {
  if (server.clients.size === 0) return;
  const symbols = Object.keys(stocks);
  const toUpdate = symbols.sort(() => Math.random() - 0.5).slice(0, 5);
  toUpdate.forEach((sym) => {
    updateStockPrice(stocks[sym]);
    broadcast({ type: "STOCK_UPDATE", stock: stocks[sym] });
  });
}, 800);

// ── Order book tick ──────────────────────────────────────────────────────────
setInterval(() => {
  if (server.clients.size === 0) return;
  const symbols = Object.keys(stocks);
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  broadcast({ type: "ORDER_BOOK", symbol: sym, ...generateOrderBook(stocks[sym].price) });
}, 2000);

console.log("🚀 Groww-915 server running on ws://localhost:8080");
