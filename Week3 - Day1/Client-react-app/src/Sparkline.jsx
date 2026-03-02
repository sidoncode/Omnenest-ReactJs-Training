export function Sparkline({ data = [], width = 80, height = 28, positive }) {
  if (data.length < 2) return <svg width={width} height={height} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M${pts.join(" L")}`;
  const areaD = `M0,${height} L${pts.join(" L")} L${width},${height} Z`;

  const stroke = positive ? "#00D17A" : "#FF3D57";
  const fill   = positive ? "rgba(0,209,122,0.12)" : "rgba(255,61,87,0.12)";

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.3" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${positive})`} />
      <path d={pathD} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
