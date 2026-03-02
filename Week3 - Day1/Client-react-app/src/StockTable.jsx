import { useRef, useEffect, useState } from "react";
import { fmt, color } from "./utils.js";
import { Sparkline } from "./Sparkline.jsx";

const COLS = [
  { key: "symbol",        label: "SYMBOL",  align: "left"  },
  { key: "ltp",          label: "LTP",     align: "right" },
  { key: "changePercent",label: "CHNG %",  align: "right" },
  { key: "change",       label: "CHNG",    align: "right" },
  { key: "volume",       label: "VOLUME",  align: "right" },
  { key: "high",         label: "HIGH",    align: "right" },
  { key: "low",          label: "LOW",     align: "right" },
  { key: "_spark",       label: "TREND",   align: "center", noSort: true },
];

function FlashRow({ stock, history, selected, onClick }) {
  const prevLtp = useRef(stock.ltp);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (stock.ltp === prevLtp.current) return;
    const dir = stock.ltp > prevLtp.current ? "row-flash-up" : "row-flash-down";
    prevLtp.current = stock.ltp;
    setFlashClass(dir);
    const t = setTimeout(() => setFlashClass(""), 700);
    return () => clearTimeout(t);
  }, [stock.ltp]);

  const isUp = (stock.changePercent ?? 0) >= 0;
  const spark = history || [];

  return (
    <tr
      className={flashClass}
      onClick={onClick}
      style={{
        cursor: "pointer",
        borderBottom: "1px solid var(--border)",
        background: selected ? "rgba(255,184,0,0.06)" : "transparent",
        outline: selected ? "1px solid rgba(255,184,0,0.3)" : "none",
        outlineOffset: "-1px",
        transition: "background 0.2s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "var(--surface2)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {/* Symbol */}
      <td style={{ padding: "10px 14px" }}>
        <div style={{ fontWeight: "700", fontSize: "13px", color: "var(--text)" }}>{stock.symbol}</div>
        <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "1px" }}>{stock.sector} · {stock.exchange}</div>
      </td>

      {/* LTP */}
      <td style={{ padding: "10px 14px", textAlign: "right", fontFamily: "var(--mono)", fontWeight: "700", fontSize: "14px", color: "var(--text)" }}>
        {fmt.price(stock.ltp)}
      </td>

      {/* Change % */}
      <td style={{ padding: "10px 14px", textAlign: "right" }}>
        <span style={{
          display: "inline-block",
          padding: "3px 8px",
          borderRadius: "5px",
          background: color.bg(stock.changePercent),
          border: `1px solid ${color.border(stock.changePercent)}`,
          color: color.of(stock.changePercent),
          fontFamily: "var(--mono)",
          fontSize: "11px",
          fontWeight: "700",
        }}>
          {fmt.pct(stock.changePercent)}
        </span>
      </td>

      {/* Change abs */}
      <td style={{ padding: "10px 14px", textAlign: "right", color: color.of(stock.change), fontFamily: "var(--mono)", fontSize: "12px" }}>
        {fmt.change(stock.change)}
      </td>

      {/* Volume */}
      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--text2)", fontFamily: "var(--mono)", fontSize: "11px" }}>
        {fmt.vol(stock.volume)}
      </td>

      {/* High */}
      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--green)", fontFamily: "var(--mono)", fontSize: "11px" }}>
        {fmt.price(stock.high)}
      </td>

      {/* Low */}
      <td style={{ padding: "10px 14px", textAlign: "right", color: "var(--red)", fontFamily: "var(--mono)", fontSize: "11px" }}>
        {fmt.price(stock.low)}
      </td>

      {/* Sparkline */}
      <td style={{ padding: "10px 14px", textAlign: "center" }}>
        <Sparkline data={spark} width={72} height={24} positive={isUp} />
      </td>
    </tr>
  );
}

export function StockTable({ stocks, history, selected, onSelect, sortBy, sortDir, onSort }) {
  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--surface)" }}>
          <tr style={{ borderBottom: "1px solid var(--border2)" }}>
            {COLS.map(col => (
              <th
                key={col.key}
                onClick={() => !col.noSort && onSort(col.key)}
                style={{
                  padding: "9px 14px",
                  textAlign: col.align,
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  fontWeight: "700",
                  fontFamily: "var(--mono)",
                  color: sortBy === col.key ? "var(--gold)" : "var(--text3)",
                  cursor: col.noSort ? "default" : "pointer",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                {col.label}
                {!col.noSort && sortBy === col.key && (
                  <span style={{ marginLeft: "4px" }}>{sortDir > 0 ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stocks.map(s => (
            <FlashRow
              key={s.symbol}
              stock={s}
              history={history[s.symbol]}
              selected={selected === s.symbol}
              onClick={() => onSelect(s.symbol === selected ? null : s.symbol)}
            />
          ))}
          {stocks.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", padding: "60px", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: "12px" }}>
                No stocks match your search
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
