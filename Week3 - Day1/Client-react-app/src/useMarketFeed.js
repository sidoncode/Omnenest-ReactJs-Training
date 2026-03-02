import { useState, useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:8080";
const MAX_HISTORY = 60; // keep last 60 price points per stock for sparkline

export function useMarketFeed() {
  const [connected, setConnected]   = useState(false);
  const [stocks, setStocks]         = useState({});
  const [indices, setIndices]       = useState({});
  const [depth, setDepth]           = useState({});
  const [history, setHistory]       = useState({}); // symbol → [ltp, ...]
  const [log, setLog]               = useState([]);
  const wsRef                       = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    setLog(l => [{ msg, type, ts: Date.now() }, ...l].slice(0, 80));
  }, []);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      try { ws = new WebSocket(WS_URL); } catch { return; }
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        addLog("Connected to ws://localhost:8080", "success");
      };

      ws.onclose = () => {
        setConnected(false);
        addLog("Disconnected — retrying in 2s", "warn");
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => addLog("Connection error", "error");

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);

          if (msg.type === "CONNECTED") {
            addLog(msg.message, "success");
          }

          if (msg.type === "SNAPSHOT" || msg.type === "QUOTE") {
            setStocks(prev => {
              const existing = prev[msg.symbol];
              return { ...prev, [msg.symbol]: { ...msg.data, _prev: existing?.ltp } };
            });
            // Track price history for sparkline
            setHistory(prev => {
              const arr = prev[msg.symbol] || [];
              const next = [...arr, msg.data.ltp].slice(-MAX_HISTORY);
              return { ...prev, [msg.symbol]: next };
            });
          }

          if (msg.type === "INDEX") {
            setIndices(prev => ({ ...prev, [msg.symbol]: msg.data }));
          }

          if (msg.type === "DEPTH") {
            setDepth(prev => ({ ...prev, [msg.symbol]: msg.data }));
          }

        } catch {}
      };
    };

    connect();
    return () => { clearTimeout(reconnectTimer); ws?.close(); };
  }, []);

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  return { connected, stocks, indices, depth, history, log, send };
}
