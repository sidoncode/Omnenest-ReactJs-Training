import { useState, useEffect, useRef, useCallback } from "react";

// ── WebSocket hook ────────────────────────────────────────────────────────────
function useMarketFeed(url = "ws://localhost:8080") {
  const [connected, setConnected] = useState(false);
  const [stocks, setStocks] = useState({});
  const [indices, setIndices] = useState({});
  const [depth, setDepth] = useState({});
  const [log, setLog] = useState([]);
  const wsRef = useRef(null);

  const addLog = (msg) => setLog(l => [{ msg, ts: Date.now() }, ...l].slice(0, 50));

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => { setConnected(true); addLog("Connected to feed"); };
      ws.onclose = () => {
        setConnected(false);
        addLog("Disconnected — reconnecting in 2s…");
        reconnectTimer = setTimeout(connect, 2000);
      };
      ws.onerror = () => addLog("Connection error");

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          switch (msg.type) {
            case "CONNECTED":
              addLog(`Server: ${msg.message}`);
              break;
            case "SNAPSHOT":
            case "QUOTE":
              setStocks(prev => ({ ...prev, [msg.symbol]: msg.data }));
              break;
            case "INDEX":
              setIndices(prev => ({ ...prev, [msg.symbol]: msg.data }));
              break;
            case "DEPTH":
              setDepth(prev => ({ ...prev, [msg.symbol]: msg.data }));
              break;
            default: break;
          }
        } catch {}
      };
    };

    connect();
    return () => { clearTimeout(reconnectTimer); ws?.close(); };
  }, [url]);

  const subscribe = useCallback((symbols) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "SUBSCRIBE", symbols }));
    }
  }, []);

  return { connected, stocks, indices, depth, log, subscribe };
}

// ── Formatting ────────────────────────────────────────────────────────────────
const fmt = {
  price: (n) => n ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—",
  change: (n) => n != null ? (n >= 0 ? `+${n.toFixed(2)}` : `${n.toFixed(2)}`) : "—",
  pct: (n) => n != null ? (n >= 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`) : "—",
  vol: (n) => n ? (n >= 1e7 ? `${(n/1e7).toFixed(2)}Cr` : n >= 1e5 ? `${(n/1e5).toFixed(2)}L` : n.toLocaleString("en-IN")) : "—",
  idx: (n) => n ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "—",
};

const up   = (n) => n >= 0;
const clr  = (n) => n >= 0 ? "#00C87C" : "#FF4D4D";
const bg   = (n) => n >= 0 ? "rgba(0,200,124,0.08)" : "rgba(255,77,77,0.08)";

// ── Components ────────────────────────────────────────────────────────────────
function IndexBar({ indices }) {
  return (
    <div style={{ display: "flex", gap: "2px", padding: "10px 20px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", overflowX: "auto" }}>
      {Object.values(indices).map(idx => (
        <div key={idx.symbol} style={{
          padding: "6px 20px",
          borderRadius: "6px",
          background: bg(idx.changePercent),
          border: `1px solid ${clr(idx.changePercent)}22`,
          minWidth: "160px",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: "10px", color: "#666", fontFamily: "monospace", letterSpacing: "1px" }}>{idx.symbol}</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#fff", fontFamily: "'DM Mono', monospace" }}>
            {fmt.idx(idx.value)}
          </div>
          <div style={{ fontSize: "12px", color: clr(idx.changePercent), fontFamily: "monospace" }}>
            {fmt.change(idx.change)} ({fmt.pct(idx.changePercent)})
          </div>
        </div>
      ))}
    </div>
  );
}

function StockRow({ stock, selected, onClick }) {
  const isUp = up(stock.changePercent);
  return (
    <tr
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: selected ? "rgba(255,184,0,0.08)" : "transparent",
        borderBottom: "1px solid #111",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#141414"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      <td style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: "700", color: "#fff", fontSize: "13px" }}>{stock.symbol}</div>
        <div style={{ color: "#555", fontSize: "10px" }}>{stock.sector}</div>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: "600", color: "#fff", fontSize: "14px" }}>
        {fmt.price(stock.ltp)}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right" }}>
        <span style={{
          padding: "2px 8px", borderRadius: "4px",
          background: bg(stock.changePercent),
          color: clr(stock.changePercent),
          fontFamily: "monospace", fontSize: "12px", fontWeight: "600",
        }}>
          {fmt.pct(stock.changePercent)}
        </span>
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", color: clr(stock.changePercent), fontFamily: "monospace", fontSize: "12px" }}>
        {fmt.change(stock.change)}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", color: "#555", fontFamily: "monospace", fontSize: "11px" }}>
        {fmt.vol(stock.volume)}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", color: "#444", fontFamily: "monospace", fontSize: "11px" }}>
        {fmt.price(stock.high)}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "right", color: "#444", fontFamily: "monospace", fontSize: "11px" }}>
        {fmt.price(stock.low)}
      </td>
    </tr>
  );
}

function DepthTable({ symbol, stock, depth }) {
  if (!stock) return null;
  const d = depth[symbol] || stock.depth;
  return (
    <div style={{ padding: "16px", borderTop: "1px solid #1a1a1a" }}>
      <div style={{ marginBottom: "12px" }}>
        <div style={{ color: "#888", fontSize: "10px", letterSpacing: "1px", marginBottom: "4px" }}>SELECTED</div>
        <div style={{ color: "#FFB800", fontSize: "20px", fontWeight: "800" }}>{stock.symbol}</div>
        <div style={{ color: "#555", fontSize: "11px" }}>{stock.name}</div>
        <div style={{ marginTop: "8px", display: "flex", gap: "12px" }}>
          <Stat label="LTP"   val={fmt.price(stock.ltp)} color="#fff" />
          <Stat label="CHNG"  val={fmt.pct(stock.changePercent)} color={clr(stock.changePercent)} />
        </div>
        <div style={{ marginTop: "8px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Stat label="OPEN"  val={fmt.price(stock.open)} />
          <Stat label="HIGH"  val={fmt.price(stock.high)} color="#00C87C" />
          <Stat label="LOW"   val={fmt.price(stock.low)} color="#FF4D4D" />
          <Stat label="PREV"  val={fmt.price(stock.prevClose)} />
          <Stat label="VOL"   val={fmt.vol(stock.volume)} />
          <Stat label="BUY Q" val={fmt.vol(stock.buyQty)} color="#00C87C" />
          <Stat label="SELL Q"val={fmt.vol(stock.sellQty)} color="#FF4D4D" />
        </div>
      </div>
      {d && (
        <div>
          <div style={{ color: "#555", fontSize: "10px", letterSpacing: "1px", marginBottom: "8px" }}>MARKET DEPTH</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              <div style={{ color: "#00C87C", fontSize: "10px", marginBottom: "4px" }}>BID (BUY)</div>
              {(d.bids || []).map((b, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace", marginBottom: "2px" }}>
                  <span style={{ color: "#00C87C" }}>{fmt.price(b.price)}</span>
                  <span style={{ color: "#555" }}>{b.qty.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#FF4D4D", fontSize: "10px", marginBottom: "4px" }}>ASK (SELL)</div>
              {(d.asks || []).map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "monospace", marginBottom: "2px" }}>
                  <span style={{ color: "#FF4D4D" }}>{fmt.price(a.price)}</span>
                  <span style={{ color: "#555" }}>{a.qty.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val, color = "#666" }) {
  return (
    <div>
      <div style={{ color: "#444", fontSize: "9px", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ color, fontSize: "12px", fontFamily: "monospace", fontWeight: "600" }}>{val}</div>
    </div>
  );
}

function ConnectionBadge({ connected }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: connected ? "#00C87C" : "#FF4D4D",
        boxShadow: connected ? "0 0 8px #00C87C" : "0 0 8px #FF4D4D",
        animation: connected ? "pulse 2s infinite" : "none",
      }} />
      <span style={{ fontSize: "11px", color: connected ? "#00C87C" : "#FF4D4D", fontFamily: "monospace" }}>
        {connected ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { connected, stocks, indices, depth, log } = useMarketFeed("ws://localhost:8080");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortDir, setSortDir] = useState(1);
  const [showLog, setShowLog] = useState(false);

  const stockList = Object.values(stocks);

  const filtered = stockList
    .filter(s => s.symbol.includes(search.toUpperCase()) || (s.name || "").toUpperCase().includes(search.toUpperCase()))
    .sort((a, b) => {
      const va = a[sortBy] ?? 0;
      const vb = b[sortBy] ?? 0;
      return typeof va === "string" ? va.localeCompare(vb) * sortDir : (va - vb) * sortDir;
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => -d);
    else { setSortBy(col); setSortDir(1); }
  };

  const selectedStock = selected ? stocks[selected] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        th { user-select: none; cursor: pointer; }
        th:hover { color: #FFB800 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid #1a1a1a", background: "#0d0d0d" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontWeight: "900", fontSize: "18px", letterSpacing: "-0.5px" }}>
            <span style={{ color: "#00C87C" }}>groww</span>
            <span style={{ color: "#333", fontSize: "12px", marginLeft: "8px", fontWeight: "400" }}>dev feed</span>
          </div>
          <ConnectionBadge connected={connected} />
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol…"
            style={{ background: "#141414", border: "1px solid #222", color: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", width: "160px", outline: "none" }}
          />
          <button
            onClick={() => setShowLog(l => !l)}
            style={{ background: "#141414", border: "1px solid #222", color: "#888", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}
          >
            {showLog ? "Hide Log" : "Feed Log"}
          </button>
        </div>
      </div>

      {/* Index bar */}
      <IndexBar indices={indices} />

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Stock table */}
        <div style={{ flex: 1, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead style={{ position: "sticky", top: 0, background: "#0d0d0d", zIndex: 10 }}>
              <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                {[
                  ["symbol","SYMBOL"],["ltp","LTP"],["changePercent","%CHNG"],["change","CHNG"],
                  ["volume","VOL"],["high","HIGH"],["low","LOW"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    style={{ padding: "8px 12px", textAlign: key === "symbol" ? "left" : "right", color: sortBy === key ? "#FFB800" : "#444", fontSize: "10px", letterSpacing: "1px", fontWeight: "600" }}
                  >
                    {label} {sortBy === key ? (sortDir > 0 ? "↑" : "↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <StockRow
                  key={s.symbol}
                  stock={s}
                  selected={selected === s.symbol}
                  onClick={() => setSelected(s.symbol === selected ? null : s.symbol)}
                />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "#333", padding: "40px", fontFamily: "monospace" }}>No results</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Right panel: depth or log */}
        {(selectedStock || showLog) && (
          <div style={{ width: "260px", borderLeft: "1px solid #1a1a1a", overflow: "auto", background: "#0d0d0d", flexShrink: 0 }}>
            {selectedStock && <DepthTable symbol={selected} stock={selectedStock} depth={depth} />}
            {showLog && (
              <div style={{ padding: "12px", borderTop: selectedStock ? "1px solid #1a1a1a" : "none" }}>
                <div style={{ color: "#555", fontSize: "10px", letterSpacing: "1px", marginBottom: "8px" }}>FEED LOG</div>
                {log.map((l, i) => (
                  <div key={i} style={{ fontSize: "10px", fontFamily: "monospace", color: "#444", marginBottom: "3px", wordBreak: "break-all" }}>
                    <span style={{ color: "#333" }}>{new Date(l.ts).toLocaleTimeString()} </span>
                    {l.msg}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "6px 20px", borderTop: "1px solid #111", background: "#0d0d0d", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#333", fontFamily: "monospace" }}>
        <span>{filtered.length} instruments · {Object.keys(indices).length} indices</span>
        <span>ws://localhost:8080 · DEV ONLY · data is simulated</span>
      </div>
    </div>
  );
}
