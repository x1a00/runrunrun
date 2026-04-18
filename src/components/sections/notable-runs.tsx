"use client";

import { useRef, useState } from "react";
import { Cloud, Sun, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/primitives/data-table";
import { notableRuns, streakStats } from "@/lib/mock-data";
import type { NotableRun, NotableRunCategory, WeatherCondition } from "@/types/activity";
import { formatDuration, formatKm, formatNumber, formatPace } from "@/lib/format";
import { gpxTracks } from "@/lib/gpx-processed";
import { GpxMap } from "@/components/charts/gpx-map";
import { GpxElevation } from "@/components/charts/gpx-elevation";

const TABS: { id: NotableRunCategory; label: string; caption: string }[] = [
  { id: "longest", label: "Longest Runs", caption: "runs ranked by distance" },
  { id: "personal-bests", label: "Personal Bests", caption: "fastest pace per race distance" },
  { id: "elevation", label: "Biggest Elevation Gain", caption: "most vert in a single run" },
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
  const visibleTabs = TABS.filter((t) => (notableRuns[t.id] ?? []).length > 0);
  const [category, setCategory] = useState<NotableRunCategory>(
    visibleTabs[0]?.id ?? "longest",
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const rows = notableRuns[category] ?? [];
  const tab = visibleTabs.find((t) => t.id === category) ?? visibleTabs[0];
  const selected = rows[selectedIdx] ?? rows[0];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (!visibleTabs.length || !selected) {
    return (
      <section className="mb-16" aria-labelledby="notable-runs-heading">
        <h2
          id="notable-runs-heading"
          className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100"
        >
          NOTABLE RUNS
        </h2>
        <p className="text-center text-sm font-mono-tamzen text-neutral-500 mt-4">
          No GPX files loaded. Drop .gpx files into public/gpx/ and run
          <code className="mx-1">node scripts/process-gpx.mjs</code>.
        </p>
      </section>
    );
  }

  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % visibleTabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + visibleTabs.length) % visibleTabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = visibleTabs.length - 1;
    setCategory(visibleTabs[next].id);
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
        {visibleTabs.map((t, i) => {
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
                cell: (r: NotableRun) => formatKm(r.distanceKm, 2),
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
          </svg>
        )}
      </div>
    </div>
  );
}

function ElevationPanel({ run }: { run: NotableRun }) {
  const track = run.gpxId ? gpxTracks[run.gpxId] : undefined;
  if (!track) return <div />;
  return (
    <div className="flex flex-col font-mono-tamzen text-xs text-neutral-400">
      <GpxElevation track={track} />
      <div className="mt-2 text-neutral-500">
        Elevation · mean pace {formatPace(run.paceSecPerKm)}/km
      </div>
    </div>
  );
}

// ISO 3166 alpha-2 → regional indicator emoji (AQ has no flag → snowflake).
function codeToFlag(code?: string) {
  if (!code || code.length !== 2) return "";
  if (code.toUpperCase() === "AQ") return "\u2744\uFE0F";
  if (code === "??") return "";
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  );
}

function DetailsPanel({ run }: { run: NotableRun }) {
  const Icon = WEATHER_ICON[run.weather];
  const flag = codeToFlag(run.location.countryCode);
  return (
    <div className="flex flex-col items-start gap-4 font-mono-tamzen text-sm">
      <h3 className="font-sans text-lg font-bold text-neutral-100">
        {run.title ?? `${formatKm(run.distanceKm, 2)}`}
      </h3>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        <Stat label="KM" value={formatNumber(run.distanceKm, 2)} />
        <Stat label="MOVING" value={formatDuration(run.movingSec)} />
        <Stat label="PER KM" value={formatPace(run.paceSecPerKm)} />
        <Stat label="M CLIMBED" value={formatNumber(run.elevationM)} />
      </div>
      {run.weather ? (
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs uppercase text-neutral-500">{run.weather}</div>
          </div>
          <Icon className="text-neutral-300" size={20} />
        </div>
      ) : null}
      <div>
        <div className="font-sans text-lg font-bold text-neutral-100 flex items-center gap-2">
          {flag ? <span aria-hidden className="text-base">{flag}</span> : null}
          <span>{run.location.city ?? run.location.country}</span>
        </div>
        <div className="text-xs uppercase text-neutral-500">
          {run.location.region ? `${run.location.region} · ` : ""}
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

function daysSinceStart(date: string): number {
  const start = new Date(streakStats.startDate + "T00:00:00Z").getTime();
  const t = new Date(date).getTime();
  return Math.floor((t - start) / 86_400_000);
}
