import type { GpxTrack } from "@/lib/gpx-processed";

interface GpxElevationProps {
  track: GpxTrack;
  width?: number;
  height?: number;
}

export function GpxElevation({ track, width = 360, height = 100 }: GpxElevationProps) {
  const { points, stats } = track;
  const usable = points.filter((p) => p.ele != null) as (typeof points[number] & { ele: number })[];
  if (usable.length < 2) return null;
  const maxMi = stats.distanceMi || usable[usable.length - 1].mi || 1;
  const elevations = usable.map((p) => p.ele);
  const minEle = Math.min(...elevations);
  const maxEle = Math.max(...elevations);
  const eleRange = Math.max(1, maxEle - minEle);

  const pad = 18;
  const plotW = width;
  const plotH = height - pad;

  const line = usable
    .map((p, i) => {
      const x = (p.mi / maxMi) * plotW;
      const y = plotH - ((p.ele - minEle) / eleRange) * (plotH * 0.85);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${line} L${plotW},${plotH} L0,${plotH} Z`;
  const midMi = Math.round(maxMi / 2);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <path d={area} fill="#1a1a1a" />
      <path d={line} stroke="#ededed" strokeWidth={1} fill="none" />
      <text
        x={0}
        y={plotH - ((maxEle - minEle) / eleRange) * (plotH * 0.85) - 4}
        className="fill-neutral-500 font-tamzen-sm"
        fontSize={9}
      >
        {Math.round(maxEle)}ft
      </text>
      <text x={0} y={plotH + 14} className="fill-neutral-500 font-tamzen-sm" fontSize={9}>0mi</text>
      <text x={plotW / 2} y={plotH + 14} textAnchor="middle" className="fill-neutral-500 font-tamzen-sm" fontSize={9}>
        {midMi}mi
      </text>
      <text x={plotW} y={plotH + 14} textAnchor="end" className="fill-neutral-500 font-tamzen-sm" fontSize={9}>
        {maxMi.toFixed(1)}mi
      </text>
    </svg>
  );
}
