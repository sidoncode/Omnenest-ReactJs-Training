export const fmt = {
  price: (n) =>
    n != null
      ? `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—",

  change: (n) =>
    n != null ? (n >= 0 ? `+${n.toFixed(2)}` : `${n.toFixed(2)}`) : "—",

  pct: (n) =>
    n != null ? (n >= 0 ? `+${n.toFixed(2)}%` : `${n.toFixed(2)}%`) : "—",

  vol: (n) => {
    if (!n) return "—";
    if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
    return n.toLocaleString("en-IN");
  },

  idx: (n) =>
    n != null
      ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : "—",

  time: (ts) => new Date(ts).toLocaleTimeString("en-IN", { hour12: false }),
};

export const color = {
  gain:   "#00D17A",
  loss:   "#FF3D57",
  neutral:"#8090A0",
  of: (n) => (n == null ? "#8090A0" : n >= 0 ? "#00D17A" : "#FF3D57"),
  bg: (n) => (n == null ? "transparent" : n >= 0 ? "rgba(0,209,122,0.08)" : "rgba(255,61,87,0.08)"),
  border: (n) => (n == null ? "#1C2530" : n >= 0 ? "rgba(0,209,122,0.2)" : "rgba(255,61,87,0.2)"),
};
