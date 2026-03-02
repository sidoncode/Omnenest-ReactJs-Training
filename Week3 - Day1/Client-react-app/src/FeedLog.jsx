import { fmt } from "./utils.js";

const typeColor = {
  success: "var(--green)",
  warn:    "var(--gold)",
  error:   "var(--red)",
  info:    "var(--text3)",
};

export function FeedLog({ log }) {
  return (
    <div style={{
      width: "240px",
      borderLeft: "1px solid var(--border)",
      background: "var(--surface)",
      overflow: "auto",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", letterSpacing: "1.5px" }}>
        FEED LOG
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "8px" }}>
        {log.map((entry, i) => (
          <div key={i} style={{ marginBottom: "4px", display: "flex", gap: "6px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "9px", color: "var(--text3)", fontFamily: "var(--mono)", flexShrink: 0, paddingTop: "1px" }}>
              {fmt.time(entry.ts)}
            </span>
            <span style={{ fontSize: "10px", fontFamily: "var(--mono)", color: typeColor[entry.type] || "var(--text3)", wordBreak: "break-word" }}>
              {entry.msg}
            </span>
          </div>
        ))}
        {log.length === 0 && (
          <div style={{ color: "var(--text3)", fontFamily: "var(--mono)", fontSize: "10px", padding: "8px" }}>
            No logs yet…
          </div>
        )}
      </div>
    </div>
  );
}
