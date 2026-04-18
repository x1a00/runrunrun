"use client";

import { useRef, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/primitives/data-table";
import { notableRuns } from "@/lib/mock-data";
import type { NotableRun, NotableRunCategory, WeatherCondition } from "@/types/activity";
import { formatDuration, formatMiles, formatNumber, formatPace } from "@/lib/format";
import { gpxTracks } from "@/lib/gpx-processed";
import { GpxMap } from "@/components/charts/gpx-map";
import { GpxElevation } from "@/components/charts/gpx-elevation";

const TABS: { id: NotableRunCategory; label: string; caption: string }[] = [
  { id: "longest", label: "Longest Runs", caption: "my longest runs throughout the streak" },
  { id: "personal-bests", label: "Personal Bests", caption: "fastest times per race distance" },
  { id: "elevation", label: "Biggest Elevation Gain", caption: "most vert in a single day" },
  { id: "races", label: "Races", caption: "official race results" },
  { id: "bus-run-bus", label: "Bus Run Bus", caption: "transit-assisted long routes" },
  { id: "weekly-half", label: "Weekly Half Marathon", caption: "the half-marathon-a-week streak inside the streak" },
];

const WEATHER_ICON: Record<WeatherCondition, React.ComponentType<{ className?: string; size?: number }>> = {
  clear: Sun,
  clouds: Cloud,
  rain: CloudRain,
  snow: CloudSnow,
  fog: CloudFog,
  thunderstorm: CloudLightning,
};

export function NotableRuns() {
  const [category, setCategory] = useState<NotableRunCategory>("longest");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rows = notableRuns[category];
  const tab = TABS.find((t) => t.id === category)!;
  const selected = rows[selectedIdx] ?? rows[0];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    setCategory(TABS[next].id);
    setSelectedIdx(0);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="mb-16" aria-labelledby="notable-runs-heading">
      <h2
        id="notable-runs-heading"
        className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100"
      >
        NOTABLE RUNS
      </h2>
      <div
        role="tablist"
        aria-label="Notable run categories"
        className="flex flex-wrap gap-2 mt-4 mb-4 justify-center"
      >
        {TABS.map((t, i) => {
          const active = category === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={active}
              aria-controls={`tabpanel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => {
                setCategory(t.id);
                setSelectedIdx(0);
              }}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "px-3 py-1 text-sm font-mono-tamzen transition-colors cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
                active
                  ? "bg-white text-neutral-900"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <p className="text-center text-xs italic text-neutral-500 font-mono-tamzen mb-6">
        {tab.caption}
      </p>
      <div
        id={`tabpanel-${category}`}
        role="tabpanel"
        aria-labelledby={`tab-${category}`}
        className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-1">
          <DataTable
            rows={rows}
            highlightedIndex={selectedIdx}
            onRowClick={(_, i) => setSelectedIdx(i)}
            columns={[
              { key: "rank", header: "RANK", cell: (r: NotableRun) => `#${r.rank}` },
              { key: "date", header: "DATE", cell: (r: NotableRun) => r.date },
              {
                key: "distance",
                header: "DISTANCE",
                align: "right",
                cell: (r: NotableRun) => formatMiles(r.distanceMi, 2),
              },
            ]}
          />
        </div>
        <MapPanel run={selected} />
        <ElevationPanel run={selected} />
        <DetailsPanel run={selected} />
      </div>
    </section>
  );
}

function MapPanel({ run }: { run: NotableRun }) {
  const track = run.gpxId ? gpxTracks[run.gpxId] : undefined;
  return (
    <div className="flex flex-col font-mono-tamzen text-xs text-neutral-400">
      <div className="flex justify-between mb-2">
        <span>DAY {daysSinceStart(run.date)}</span>
        <span>{run.date.toUpperCase()}</span>
      </div>
      <div className="relative aspect-square w-full bg-neutral-950 border border-neutral-900 overflow-hidden">
        {track ? (
          <GpxMap track={track} width={200} height={200} />
        ) : (
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
          <rect width="200" height="200" fill="#0d0d0d" />
          {/* Faux street grid */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`h${i}`} x1={0} x2={200} y1={20 + i * 18} y2={20 + i * 18} stroke="#1a1a1a" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={`v${i}`} x1={20 + i * 18} x2={20 + i * 18} y1={0} y2={200} stroke="#1a1a1a" strokeWidth={0.5} />
          ))}
          <path
            d={traceFromProfile(run)}
            stroke="#ededed"
            strokeWidth={1.6}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        )}
      </div>
    </div>
  );
}

function ElevationPanel({ run }: { run: NotableRun }) {
  const track = run.gpxId ? gpxTracks[run.gpxId] : undefined;
  if (track) {
    return (
      <div className="flex flex-col font-mono-tamzen text-xs text-neutral-400">
        <GpxElevation track={track} />
        <div className="mt-2 text-neutral-500">
          Elevation · mean pace {formatPace(run.paceSecPerMi)}/mi
        </div>
      </div>
    );
  }
  const profile = run.profile ?? [];
  const w = 360;
  const h = 100;
  if (!profile.length) return <div />;
  const maxFt = Math.max(...profile.map((p) => p.ft), 1);
  const maxMi = Math.max(...profile.map((p) => p.mile), 1);
  const elePath = profile
    .map((p, i) => {
      const x = (p.mile / maxMi) * w;
      const y = h - (p.ft / maxFt) * (h * 0.85);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="flex flex-col font-mono-tamzen text-xs text-neutral-400">
      <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full h-auto">
        <path d={`${elePath} L${w},${h} L0,${h} Z`} fill="#1a1a1a" />
        <path d={elePath} stroke="#ededed" strokeWidth={1} fill="none" />
        {[0, Math.round(maxMi / 2), Math.round(maxMi)].map((mi, i) => (
          <text
            key={i}
            x={(mi / maxMi) * w}
            y={h + 14}
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
            className="fill-neutral-500"
            fontSize={9}
          >
            {mi}mi
          </text>
        ))}
      </svg>
      <div className="mt-2 text-neutral-500">
        Elevation · mean pace {formatPace(run.paceSecPerMi)}/mi
      </div>
    </div>
  );
}

function DetailsPanel({ run }: { run: NotableRun }) {
  const Icon = WEATHER_ICON[run.weather];
  return (
    <div className="flex flex-col items-start gap-4 font-mono-tamzen text-sm">
      <h3 className="font-sans text-lg font-bold text-neutral-100">
        {run.title ?? `${formatMiles(run.distanceMi, 2)}`}
      </h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <Stat label="MILES" value={formatNumber(run.distanceMi, 1)} />
        <Stat label="TIME" value={formatDuration(run.durationSec)} />
        <Stat label="PER MILE" value={formatPace(run.paceSecPerMi)} />
        <Stat label="FT CLIMBED" value={formatNumber(run.elevationFt)} />
      </div>
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xl font-sans font-bold text-neutral-100">{run.tempF}°F</div>
          <div className="text-xs uppercase text-neutral-500">CLOUDS</div>
        </div>
        <Icon className="text-neutral-300" size={20} />
      </div>
      <div>
        <div className="font-sans text-lg font-bold text-neutral-100">
          {run.location.city ?? run.location.country}
        </div>
        <div className="text-xs uppercase text-neutral-500">
          {run.location.country.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-sans font-bold text-neutral-100">{value}</div>
      <div className="text-xs uppercase text-neutral-500">{label}</div>
    </div>
  );
}

// Deterministic pseudo-map path derived from the elevation profile
function traceFromProfile(run: NotableRun): string {
  const p = run.profile ?? [];
  if (!p.length) return "";
  return p
    .map((pt, i) => {
      const x = 30 + ((i / (p.length - 1)) * 140);
      const y = 30 + (Math.sin(i * 0.4) + Math.cos(i * 0.7)) * 30 + (pt.ft / 200);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function daysSinceStart(date: string): number {
  const start = new Date("2015-07-11T00:00:00Z").getTime();
  const d = new Date(date + "T00:00:00Z").getTime();
  if (Number.isNaN(d)) {
    // date is like "Nov 22, 2017"
    const t = new Date(date).getTime();
    return Math.floor((t - start) / 86400000);
  }
  return Math.floor((d - start) / 86400000);
}
