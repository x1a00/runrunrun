#!/usr/bin/env node
// Preprocess GPX files under public/gpx into a compact TypeScript module
// at src/lib/gpx-processed.ts. Downsamples to ~500 points per track and
// computes aggregate stats in METRIC UNITS ONLY:
//   - distance in kilometers
//   - elevation gain in meters
//   - pace as seconds per kilometer (using MOVING time, not total elapsed)
//   - duration is MOVING time (stops are excluded)
//
// Moving-time rule: a pair of adjacent trackpoints counts as "moving" iff
// the time gap is ≤ MAX_SAMPLE_GAP_SEC AND the average speed between them is
// ≥ MIN_MOVING_MPS. This mirrors Strava-style auto-pause.
//
// Usage: node scripts/process-gpx.mjs

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const GPX_DIR = join(ROOT, "public", "gpx");
const OUT = join(ROOT, "src", "lib", "gpx-processed.ts");

const TARGET_POINTS = 500;
const MAX_SAMPLE_GAP_SEC = 15; // bigger gaps → treat as paused
const MIN_MOVING_MPS = 0.4; // below ~1.4 km/h → not moving

function haversineKm(a, b) {
  const R = 6371.0088; // km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function parseTrkpts(xml) {
  // Robust enough for Strava-exported GPX 1.1.
  const pts = [];
  const re = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)">([\s\S]*?)<\/trkpt>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    const body = m[3];
    const ele = matchFloat(body, /<ele>([^<]+)<\/ele>/);
    const time = matchStr(body, /<time>([^<]+)<\/time>/);
    const hr = matchFloat(body, /<gpxtpx:hr>([^<]+)<\/gpxtpx:hr>/);
    pts.push({ lat, lon, ele, time, hr });
  }
  return pts;
}

function matchFloat(s, re) {
  const m = s.match(re);
  return m ? parseFloat(m[1]) : null;
}
function matchStr(s, re) {
  const m = s.match(re);
  return m ? m[1] : null;
}

function downsample(points, target) {
  if (points.length <= target) return points.slice();
  const step = points.length / target;
  const out = [];
  for (let i = 0; i < target; i++) out.push(points[Math.floor(i * step)]);
  out.push(points[points.length - 1]); // keep endpoint
  return out;
}

function aggregate(points, gpxName) {
  let totalKm = 0;
  let movingSec = 0;
  let cumKmAt = [0];
  let gainM = 0;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const segKm = haversineKm(a, b);
    totalKm += segKm;
    cumKmAt.push(totalKm);

    // Moving time
    if (a.time && b.time) {
      const dt = (Date.parse(b.time) - Date.parse(a.time)) / 1000;
      if (dt > 0 && dt <= MAX_SAMPLE_GAP_SEC) {
        const mps = (segKm * 1000) / dt;
        if (mps >= MIN_MOVING_MPS) {
          movingSec += dt;
        }
      }
      // Gaps > MAX_SAMPLE_GAP_SEC are treated as paused, skipped.
    }

    // Elevation gain (meters of positive delta)
    if (b.ele != null && a.ele != null) {
      const dEle = b.ele - a.ele;
      if (dEle > 0) gainM += dEle;
    }
  }

  const t0 = points[0].time ? Date.parse(points[0].time) : null;
  const t1 = points[points.length - 1].time ? Date.parse(points[points.length - 1].time) : null;
  const elapsedSec = t0 && t1 ? Math.round((t1 - t0) / 1000) : null;

  // Avg HR
  const hrs = points.map((p) => p.hr).filter((v) => typeof v === "number");
  const avgHr = hrs.length ? Math.round(hrs.reduce((a, b) => a + b, 0) / hrs.length) : null;

  const movingSecRounded = Math.round(movingSec);
  const paceSecPerKm =
    movingSecRounded > 0 && totalKm > 0.1 ? Math.round(movingSecRounded / totalKm) : null;

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const bbox = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };

  return {
    name: gpxName,
    distanceKm: +totalKm.toFixed(3),
    movingSec: movingSecRounded,
    elapsedSec,
    paceSecPerKm,
    elevationM: Math.round(gainM),
    avgHr,
    startTime: points[0]?.time ?? null,
    endTime: points[points.length - 1]?.time ?? null,
    bbox,
    cumKmAt,
  };
}

function processFile(path, id) {
  const xml = readFileSync(path, "utf8");
  const name = matchStr(xml, /<trk>\s*<name>([^<]+)<\/name>/) ?? id;
  const all = parseTrkpts(xml);
  if (!all.length) throw new Error(`No trkpt in ${path}`);
  const aggAll = aggregate(all, name);
  const sampled = downsample(all, TARGET_POINTS);
  // Recompute cumulative km for sampled array so index aligns with sampled points
  const cumKm = [0];
  for (let i = 1; i < sampled.length; i++) {
    cumKm.push(cumKm[i - 1] + haversineKm(sampled[i - 1], sampled[i]));
  }
  return {
    id,
    name: aggAll.name,
    stats: aggAll,
    rawPointCount: all.length,
    points: sampled.map((p, i) => ({
      lat: +p.lat.toFixed(6),
      lon: +p.lon.toFixed(6),
      ele: p.ele != null ? +p.ele.toFixed(1) : null,
      hr: p.hr ?? null,
      km: +cumKm[i].toFixed(3),
    })),
  };
}

// Cross-source dedup. Two tracks with start times within ±DEDUP_WINDOW_SEC of
// each other AND similar distance are treated as the same activity.
//
// Ranking tiebreakers (lower is better):
//   1. Prefer Strava-pull filenames (id ends with /-\d{8,}$/) — canonical source.
//   2. Prefer the track with more raw points (higher fidelity).
//   3. Alphabetical id, for stable output.
const DEDUP_WINDOW_SEC = 120;   // start-time jitter across sources
const DEDUP_DIST_TOL = 0.5;     // km difference treated as "same run"

function isStravaId(id) {
  return /-\d{8,}$/.test(id);
}

function dedupe(tracks) {
  const byTime = [];
  for (const t of tracks) {
    if (!t.stats.startTime) {
      byTime.push({ ts: null, track: t });
      continue;
    }
    byTime.push({ ts: Date.parse(t.stats.startTime) / 1000, track: t });
  }
  // Sort by start time so adjacent entries can be compared linearly.
  byTime.sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));

  const kept = [];
  const dropped = [];
  const clusters = []; // each: array of entries

  for (const entry of byTime) {
    const last = clusters[clusters.length - 1];
    if (
      last &&
      entry.ts != null &&
      last[0].ts != null &&
      Math.abs(entry.ts - last[0].ts) <= DEDUP_WINDOW_SEC &&
      Math.abs(entry.track.stats.distanceKm - last[0].track.stats.distanceKm) <= DEDUP_DIST_TOL
    ) {
      last.push(entry);
    } else {
      clusters.push([entry]);
    }
  }

  for (const cluster of clusters) {
    if (cluster.length === 1) {
      kept.push(cluster[0].track);
      continue;
    }
    const ranked = cluster.slice().sort((a, b) => {
      const sa = isStravaId(a.track.id) ? 0 : 1;
      const sb = isStravaId(b.track.id) ? 0 : 1;
      if (sa !== sb) return sa - sb;
      const pa = a.track.rawPointCount ?? 0;
      const pb = b.track.rawPointCount ?? 0;
      if (pa !== pb) return pb - pa;
      return a.track.id < b.track.id ? -1 : 1;
    });
    kept.push(ranked[0].track);
    for (const r of ranked.slice(1)) dropped.push({ kept: ranked[0].track.id, dropped: r.track.id });
  }

  return { kept, dropped };
}

function main() {
  const files = readdirSync(GPX_DIR).filter((f) => f.toLowerCase().endsWith(".gpx"));
  if (!files.length) {
    console.error("No .gpx files found in public/gpx/");
    process.exit(1);
  }
  const allTracks = files.map((f) => {
    const id = f.replace(/\.gpx$/i, "");
    console.log(`Processing ${f}...`);
    return processFile(join(GPX_DIR, f), id);
  });
  const { kept: tracks, dropped } = dedupe(allTracks);
  if (dropped.length) {
    console.log(`\nDeduped ${dropped.length} duplicate track(s):`);
    for (const d of dropped) console.log(`  ${d.dropped} → matches ${d.kept} (skipped)`);
    console.log("");
  }

  const header = `// AUTO-GENERATED by scripts/process-gpx.mjs — do not edit.
// Run: node scripts/process-gpx.mjs
// All values are metric. Duration is MOVING time (stops excluded).

export interface GpxPoint {
  lat: number;
  lon: number;
  ele: number | null;   // meters above sea level
  hr: number | null;
  km: number;           // cumulative km from start
}

export interface GpxStats {
  name: string;
  distanceKm: number;
  movingSec: number;              // active moving seconds (auto-pause)
  elapsedSec: number | null;      // wall-clock seconds start→end
  paceSecPerKm: number | null;    // movingSec / distanceKm
  elevationM: number;             // positive delta sum, meters
  avgHr: number | null;
  startTime: string | null;
  endTime: string | null;
  bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number };
  cumKmAt: number[];
}

export interface GpxTrack {
  id: string;
  name: string;
  stats: GpxStats;
  points: GpxPoint[];
}

export const gpxTracks: Record<string, GpxTrack> = ${JSON.stringify(
    Object.fromEntries(
      tracks.map(({ id, name, stats, points }) => [id, { id, name, stats, points }]),
    ),
    null,
    2,
  )};
`;

  writeFileSync(OUT, header);
  console.log(`Wrote ${OUT} (${tracks.length} tracks)`);
  for (const t of tracks) {
    const pace = t.stats.paceSecPerKm
      ? `${Math.floor(t.stats.paceSecPerKm / 60)}:${String(t.stats.paceSecPerKm % 60).padStart(2, "0")}/km`
      : "?";
    console.log(
      `  ${t.id}: ${t.points.length} pts, ${t.stats.distanceKm.toFixed(2)} km, moving ${Math.round(t.stats.movingSec / 60)}min (elapsed ${Math.round((t.stats.elapsedSec ?? 0) / 60)}min), +${t.stats.elevationM}m, ${pace}`,
    );
  }
}

main();
