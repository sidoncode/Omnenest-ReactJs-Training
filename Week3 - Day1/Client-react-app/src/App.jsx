import { useState, useMemo } from "react";
import { useMarketFeed } from "./useMarketFeed.js";
import { IndexBar }    from "./IndexBar.jsx";
import { StockTable }  from "./StockTable.jsx";
import { StockDetail } from "./StockDetail.jsx";
import { FeedLog }     from "./FeedLog.jsx";

export default function App() {
  const { connected, stocks, indices, depth, history, log } = useMarketFeed();

  const [selected,  setSelected]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [sortBy,    setSortBy]    = useState("symbol");
  const [sortDir,   setSortDir]   = useState(1);
  const [showLog,   setShowLog]   = useState(false);
  const [filterSec, setFilterSec] = useState("ALL");

  // Unique sectors
  const sectors = useMemo(() => {
    const s = new Set(Object.values(stocks).map(s => s.sector).filter(Boolean));
    return ["ALL", ...Array.from(s).sort()];
  }, [stocks]);

  // Filtered + sorted stock list
  const stockList = useMemo(() => {
    const q = search.toUpperCase();
    return Object.values(stocks)
      .filter(s => {
        const matchSearch = s.symbol.includes(q) || (s.name || "").toUpperCase().includes(q);
        const matchSector = filterSec === "ALL" || s.sector === filterSec;
        return matchSearch && matchSector;
      })
      .sort((a, b) => {
        const va = a[sortBy] ?? 0;
        const vb = b[sortBy] ?? 0;
        if (typeof va === "string") return va.localeCompare(vb) * sortDir;
        return (va - vb) * sortDir;
      });
  }, [stocks, search, filterSec, sortBy, sortDir]);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => -d);
    else { setSortBy(col); setSortDir(1); }
  };

  // Summary stats
  const gainers  = Object.values(stocks).filter(s => (s.changePercent ?? 0) > 0).length;
  const losers   = Object.values(stocks).filter(s => (s.changePercent ?? 0) < 0).length;
  const total    = Object.keys(stocks).length;

  const selectedStock = selected ? stocks[selected] : null;
  const selectedDepth = selected ? depth[selected] : null;
  const selectedHist  = selected ? history[selected] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        height: "52px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ fontFamily: "var(--sans)", fontWeight: "800", fontSize: "18px", letterSpacing: "-0.5px" }}>
            <span style={{ color: "var(--green)" }}>groww</span>
            <span style={{ color: "var(--border2)", fontSize: "11px", marginLeft: "8px", fontWeight: "400", fontFamily: "var(--mono)" }}>
              DEV FEED
            </span>
          </div>

          {/* Live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: connected ? "var(--green)" : "var(--red)",
              boxShadow: connected ? "0 0 6px var(--green)" : "0 0 6px var(--red)",
              animation: connected ? "pulse-dot 2s infinite" : "none",
            }} />
            <span style={{ fontSize: "10px", fontFamily: "var(--mono)", color: connected ? "var(--green)" : "var(--red)" }}>
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Pill label={`${total} stocks`}   color="var(--text3)" />
          <Pill label={`▲ ${gainers}`}      color="var(--green)" bg="var(--green-dim)" />
          <Pill label={`▼ ${losers}`}       color="var(--red)"   bg="var(--red-dim)"   />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol or name…"
            style={{
              background: "var(--bg)", border: "1px solid var(--border2)",
              color: "var(--text)", padding: "6px 12px", borderRadius: "6px",
              fontSize: "12px", width: "200px", outline: "none",
              fontFamily: "var(--mono)",
            }}
          />
          <button
            onClick={() => setShowLog(l => !l)}
            style={{
              background: showLog ? "var(--gold-dim)" : "var(--bg)",
              border: `1px solid ${showLog ? "rgba(255,184,0,0.3)" : "var(--border2)"}`,
              color: showLog ? "var(--gold)" : "var(--text3)",
              padding: "6px 12px", borderRadius: "6px",
              fontSize: "11px", cursor: "pointer", fontFamily: "var(--mono)",
            }}
          >
            {showLog ? "✕ Log" : "⚡ Log"}
          </button>
        </div>
      </header>

      {/* ── Index Bar ──────────────────────────────────────────────────── */}
      <IndexBar indices={indices} />

      {/* ── Sector Filter Bar ──────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        gap: "6px",
        padding: "8px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        overflowX: "auto",
        flexShrink: 0,
      }}>
        {sectors.map(sec => (
          <button
            key={sec}
            onClick={() => setFilterSec(sec)}
            style={{
              padding: "3px 12px",
              borderRadius: "20px",
              border: `1px solid ${filterSec === sec ? "var(--gold)" : "var(--border)"}`,
              background: filterSec === sec ? "var(--gold-dim)" : "transparent",
              color: filterSec === sec ? "var(--gold)" : "var(--text3)",
              fontSize: "10px",
              fontFamily: "var(--mono)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.5px",
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <StockTable
          stocks={stockList}
          history={history}
          selected={selected}
          onSelect={setSelected}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
        <StockDetail
          stock={selectedStock}
          depth={selectedDepth}
          history={selectedHist}
          onClose={() => setSelected(null)}
        />
        {showLog && <FeedLog log={log} />}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{
        padding: "5px 20px",
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        justifyContent: "space-between",
        fontSize: "9px",
        color: "var(--text3)",
        fontFamily: "var(--mono)",
        flexShrink: 0,
      }}>
        <span>{stockList.length} of {total} instruments shown · {Object.keys(indices).length} indices</span>
        <span>ws://localhost:8080 · DATA IS SIMULATED · DEV ONLY</span>
      </footer>
    </div>
  );
}

function Pill({ label, color: clr, bg }) {
  return (
    <div style={{
      padding: "3px 10px", borderRadius: "20px",
      background: bg || "transparent",
      border: `1px solid ${clr}44`,
      color: clr, fontSize: "10px",
      fontFamily: "var(--mono)", fontWeight: "700",
    }}>
      {label}
    </div>
  );
}
