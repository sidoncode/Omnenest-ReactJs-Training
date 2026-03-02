/**
 * CLI test client — run: node test-client.js
 * Connects, logs 20 messages, then exits
 */
const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");
let count = 0;

ws.on("open", () => {
  console.log("[OPEN] Connected to ws://localhost:8080\n");
  // Subscribe to specific symbols
  ws.send(JSON.stringify({ type: "SUBSCRIBE", symbols: ["TCS", "RELIANCE", "INFY"] }));
});

ws.on("message", (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.type === "QUOTE" || msg.type === "SNAPSHOT") {
    console.log(`[${msg.type}] ${msg.symbol} | LTP: ₹${msg.data.ltp} | Chng: ${msg.data.changePercent}%`);
  } else if (msg.type === "INDEX") {
    console.log(`[INDEX] ${msg.symbol} | Val: ${msg.data.value} | Chng: ${msg.data.changePercent}%`);
  } else if (msg.type === "DEPTH") {
    console.log(`[DEPTH] ${msg.symbol} | Best Bid: ₹${msg.data.bids?.[0]?.price} | Best Ask: ₹${msg.data.asks?.[0]?.price}`);
  } else {
    console.log(`[${msg.type}]`, JSON.stringify(msg).slice(0, 120));
  }

  if (++count >= 25) {
    console.log("\n[DONE] Received 25 messages. Closing.");
    ws.close();
  }
});

ws.on("close", () => console.log("[CLOSED]"));
ws.on("error", (e) => console.error("[ERROR]", e.message));
