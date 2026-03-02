import { fmt, color } from "./utils.js";

export function IndexBar({ indices }) {
  const list = Object.values(indices);
  if (!list.length) return (
    <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: "11px" }}>
      Waiting for index data…
    </div>
  );

  return (
    <div style={{
      display: "flex",
      gap: "8px",
      padding: "10px 20px",
      borderBottom: "1px solid var(--border)",
      background: "var(--surface)",
      overflowX: "auto",
      flexShrink: 0,
    }}>
      {list.map(idx => {
        const isUp = (idx.changePercent ?? 0) >= 0;
        return (
          <div key={idx.symbol} style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 16px",
            borderRadius: "8px",
            background: color.bg(idx.changePercent),
            border: `1px solid ${color.border(idx.changePercent)}`,
            minWidth: "170px",
            flexShrink: 0,
            gap: "2px",
          }}>
            <span style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1.5px" }}>
              {idx.symbol}
            </span>
            <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--text)", fontFamily: "var(--mono)", letterSpacing: "-0.5px" }}>
              {fmt.idx(idx.value)}
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: color.of(idx.changePercent), fontFamily: "var(--mono)", fontWeight: "700" }}>
                {fmt.pct(idx.changePercent)}
              </span>
              <span style={{ fontSize: "10px", color: "var(--text3)", fontFamily: "var(--mono)" }}>
                {fmt.change(idx.change)}
              </span>
            </div>
            {idx.advances != null && (
              <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                <span style={{ fontSize: "9px", color: "var(--green)", fontFamily: "var(--mono)" }}>▲{idx.advances}</span>
                <span style={{ fontSize: "9px", color: "var(--red)", fontFamily: "var(--mono)" }}>▼{idx.declines}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
