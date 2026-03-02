import { fmt, color } from "./utils.js";
import { Sparkline } from "./Sparkline.jsx";

function StatBox({ label, value, valueColor }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1px" }}>{label}</span>
      <span style={{ fontSize: "12px", fontFamily: "var(--mono)", fontWeight: "700", color: valueColor || "var(--text2)" }}>{value}</span>
    </div>
  );
}

function DepthRow({ price, qty, side }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: side === "bid" ? "var(--green)" : "var(--red)", fontWeight: "700" }}>
        {fmt.price(price)}
      </span>
      <div style={{
        flex: 1,
        height: "3px",
        margin: "0 8px",
        background: side === "bid" ? "rgba(0,209,122,0.15)" : "rgba(255,61,87,0.15)",
        borderRadius: "2px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${Math.min(100, (qty / 2000) * 100)}%`,
          background: side === "bid" ? "var(--green)" : "var(--red)",
          borderRadius: "2px",
        }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--text3)", minWidth: "50px", textAlign: "right" }}>
        {qty?.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export function StockDetail({ stock, depth, history, onClose }) {
  if (!stock) return (
    <div style={{
      width: "280px",
      borderLeft: "1px solid var(--border)",
      background: "var(--surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <div style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: "11px", textAlign: "center", padding: "20px" }}>
        Click any stock<br />to see details
      </div>
    </div>
  );

  const isUp = (stock.changePercent ?? 0) >= 0;
  const d = depth || stock.depth || {};
  const spark = history || [];

  // Buy/Sell ratio bar
  const total = (stock.buyQty || 0) + (stock.sellQty || 0);
  const buyRatio = total ? ((stock.buyQty / total) * 100).toFixed(1) : 50;
  const sellRatio = total ? ((stock.sellQty / total) * 100).toFixed(1) : 50;

  return (
    <div style={{
      width: "280px",
      borderLeft: "1px solid var(--border)",
      background: "var(--surface)",
      overflow: "auto",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      animation: "slide-in 0.2s ease-out",
    }}>
      {/* Header */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", position: "relative" }}>
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "12px", right: "12px", background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
        >×</button>

        <div style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1.5px", marginBottom: "4px" }}>
          {stock.exchange} · {stock.sector}
        </div>
        <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--gold)", letterSpacing: "-0.5px" }}>{stock.symbol}</div>
        <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "12px" }}>{stock.name}</div>

        <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: "22px", fontWeight: "700", color: "var(--text)" }}>
            {fmt.price(stock.ltp)}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: "13px", fontWeight: "700",
            color: color.of(stock.changePercent),
          }}>
            {fmt.pct(stock.changePercent)}
          </span>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: "11px", color: color.of(stock.change) }}>
          {fmt.change(stock.change)} today
        </div>

        {/* Sparkline */}
        <div style={{ marginTop: "12px" }}>
          <Sparkline data={spark} width={246} height={48} positive={isUp} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <StatBox label="OPEN"       value={fmt.price(stock.open)} />
        <StatBox label="PREV CLOSE" value={fmt.price(stock.prevClose)} />
        <StatBox label="HIGH"       value={fmt.price(stock.high)}      valueColor="var(--green)" />
        <StatBox label="LOW"        value={fmt.price(stock.low)}       valueColor="var(--red)" />
        <StatBox label="VOLUME"     value={fmt.vol(stock.volume)} />
        <StatBox label="UPPER CIRC" value={fmt.price(stock.upperCircuit)} valueColor="var(--green)" />
        <StatBox label="LOWER CIRC" value={fmt.price(stock.lowerCircuit)} valueColor="var(--red)" />
      </div>

      {/* Buy/Sell pressure */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1.5px", marginBottom: "8px" }}>
          BUY / SELL PRESSURE
        </div>
        <div style={{ display: "flex", height: "6px", borderRadius: "4px", overflow: "hidden", marginBottom: "6px" }}>
          <div style={{ width: `${buyRatio}%`, background: "var(--green)" }} />
          <div style={{ width: `${sellRatio}%`, background: "var(--red)" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "10px", color: "var(--green)", fontFamily: "var(--mono)" }}>
            ▲ {buyRatio}% ({fmt.vol(stock.buyQty)})
          </span>
          <span style={{ fontSize: "10px", color: "var(--red)", fontFamily: "var(--mono)" }}>
            {sellRatio}% ({fmt.vol(stock.sellQty)}) ▼
          </span>
        </div>
      </div>

      {/* Market Depth */}
      {(d.bids?.length || d.asks?.length) && (
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1.5px", marginBottom: "10px" }}>
            MARKET DEPTH
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "9px", color: "var(--green)", fontFamily: "var(--mono)", letterSpacing: "1px" }}>BID (BUY)</span>
            <span style={{ fontSize: "9px", color: "var(--red)", fontFamily: "var(--mono)", letterSpacing: "1px" }}>ASK (SELL)</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <div>
              {(d.bids || []).map((b, i) => (
                <DepthRow key={i} price={b.price} qty={b.qty} side="bid" />
              ))}
            </div>
            <div>
              {(d.asks || []).map((a, i) => (
                <DepthRow key={i} price={a.price} qty={a.qty} side="ask" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
