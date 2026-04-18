interface PolarClockProps {
  data: number[]; // length 24
  width?: number;
  height?: number;
}

// 24-hour polar histogram: angle = hour (12 at top, clockwise), radius = value.
export function PolarClock({ data, width = 300, height = 300 }: PolarClockProps) {
  const cx = width / 2;
  const cy = height / 2;
  const rMax = Math.min(width, height) / 2 - 30;
  const max = Math.max(...data);
  const rings = [0.33, 0.66, 1];
  const path = data
    .map((v, i) => {
      const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
      const r = (v / max) * rMax;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {rings.map((t, i) => (
        <circle key={i} cx={cx} cy={cy} r={rMax * t} fill="none" stroke="#222" strokeWidth={0.5} />
      ))}
      {rings.map((t, i) => {
        const v = ((max * t) / max) * 100;
        return (
          <text
            key={`t${i}`}
            x={cx + 2}
            y={cy - rMax * t - 2}
            className="fill-neutral-500 font-tamzen-sm"
            fontSize={9}
          >
            {v.toFixed(0)}%
          </text>
        );
      })}
      {[0, 6, 12, 18].map((h) => {
        const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * (rMax + 14);
        const y = cy + Math.sin(angle) * (rMax + 14);
        const label = h === 0 ? "12am" : h === 6 ? "6am" : h === 12 ? "12pm" : "6pm";
        return (
          <text key={h} x={x} y={y} textAnchor="middle" className="fill-neutral-500 font-tamzen-sm" fontSize={9}>
            {label}
          </text>
        );
      })}
      {[3, 9, 15, 21].map((h) => {
        const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * (rMax + 14);
        const y = cy + Math.sin(angle) * (rMax + 14);
        const label = h === 3 ? "3am" : h === 9 ? "9am" : h === 15 ? "3pm" : "9pm";
        return (
          <text key={h} x={x} y={y} textAnchor="middle" className="fill-neutral-600 font-tamzen-sm" fontSize={8}>
            {label}
          </text>
        );
      })}
      <path d={path} fill="#ededed" opacity={0.9} />
    </svg>
  );
}
