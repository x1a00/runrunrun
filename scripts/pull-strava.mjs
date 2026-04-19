#!/usr/bin/env node
// Pull all "Long Run" activities (workout_type === 2) from Strava,
// reconstruct GPX from streams, write to public/gpx/, then run the
// processing step so the site picks them up.
//
// Requires .env.local with:
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   STRAVA_ACCESS_TOKEN
//   STRAVA_REFRESH_TOKEN
//
// The script auto-refreshes the access token when needed and rewrites
// .env.local in place with the new token pair (Strava rotates both on
// refresh).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENV_PATH = join(ROOT, ".env.local");
const GPX_DIR = join(ROOT, "public", "gpx");

// ──────────────────────────────────────────────────────────────── env ──
function parseEnv(src) {
  const env = {};
  for (const line of src.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function writeEnv(env, originalSrc) {
  // Preserve comments & unknown lines; rewrite matching keys in place.
  const lines = originalSrc.split(/\r?\n/);
  const seen = new Set();
  const out = lines.map((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=/);
    if (!m) return line;
    const k = m[1];
    if (!(k in env)) return line;
    seen.add(k);
    return `${k}=${env[k]}`;
  });
  for (const [k, v] of Object.entries(env)) {
    if (!seen.has(k)) out.push(`${k}=${v}`);
  }
  writeFileSync(ENV_PATH, out.join("\n"));
}

if (!existsSync(ENV_PATH)) {
  console.error("Missing .env.local. See README.");
  process.exit(1);
}

const envSrc = readFileSync(ENV_PATH, "utf8");
const env = parseEnv(envSrc);
const need = [
  "STRAVA_CLIENT_ID",
  "STRAVA_CLIENT_SECRET",
  "STRAVA_ACCESS_TOKEN",
  "STRAVA_REFRESH_TOKEN",
];
for (const k of need) {
  if (!env[k]) {
    console.error(`Missing ${k} in .env.local`);
    process.exit(1);
  }
}

// ────────────────────────────────────────────────────────────── auth ──
async function strava(path, { method = "GET", token, body, qs } = {}) {
  const url = new URL(`https://www.strava.com${path}`);
  if (qs) for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, String(v));
  const headers = { Authorization: `Bearer ${token}` };
  if (body) headers["Content-Type"] = "application/x-www-form-urlencoded";
  const res = await fetch(url, { method, headers, body });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Strava ${method} ${path} → ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function refreshTokenIfNeeded() {
  // Quick probe with current access token
  try {
    await strava("/api/v3/athlete", { token: env.STRAVA_ACCESS_TOKEN });
    return env.STRAVA_ACCESS_TOKEN;
  } catch (e) {
    if (e.status !== 401) throw e;
  }
  console.log("• access token expired, refreshing...");
  const body = new URLSearchParams({
    client_id: env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: env.STRAVA_REFRESH_TOKEN,
  });
  const res = await fetch("https://www.strava.com/api/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Refresh failed ${res.status}: ${await res.text()}`);
  }
  const j = await res.json();
  env.STRAVA_ACCESS_TOKEN = j.access_token;
  env.STRAVA_REFRESH_TOKEN = j.refresh_token;
  writeEnv(env, envSrc);
  console.log("• token refreshed, .env.local updated");
  return j.access_token;
}

// ─────────────────────────────────────────────────── fetch activities ──
async function listAllRuns(token) {
  const all = [];
  let page = 1;
  while (true) {
    console.log(`• listing page ${page}...`);
    const chunk = await strava("/api/v3/athlete/activities", {
      token,
      qs: { per_page: 200, page },
    });
    all.push(...chunk);
    if (chunk.length < 200) break;
    page++;
  }
  console.log(`• found ${all.length} total activities`);
  return all;
}

async function fetchStreams(id, token) {
  return strava(`/api/v3/activities/${id}/streams`, {
    token,
    qs: {
      keys: "latlng,altitude,time,heartrate",
      key_by_type: true,
    },
  });
}

// ──────────────────────────────────────────────────────────── GPX out ──
function escXml(s) {
  return String(s).replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" }[c]),
  );
}

function buildGpx({ id, name, startDate, streams }) {
  const latlng = streams.latlng?.data ?? [];
  const alt = streams.altitude?.data ?? [];
  const tsec = streams.time?.data ?? [];
  const hr = streams.heartrate?.data ?? [];
  if (!latlng.length) return null;
  const start = new Date(startDate).getTime();
  const pts = latlng.map(([lat, lon], i) => {
    const t = new Date(start + (tsec[i] ?? i) * 1000).toISOString();
    const ele = alt[i];
    const h = hr[i];
    let ext = "";
    if (h != null) {
      ext = `<extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>${h}</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>`;
    }
    return (
      `      <trkpt lat="${lat}" lon="${lon}">` +
      (ele != null ? `<ele>${ele}</ele>` : "") +
      `<time>${t}</time>` +
      ext +
      `</trkpt>`
    );
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="pull-strava.mjs"',
    '  xmlns="http://www.topografix.com/GPX/1/1"',
    '  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">',
    `  <metadata><name>${escXml(name)}</name><time>${new Date(startDate).toISOString()}</time></metadata>`,
    `  <trk><name>${escXml(name)}</name><type>running</type>`,
    "    <trkseg>",
    ...pts,
    "    </trkseg>",
    "  </trk>",
    "</gpx>",
    "",
  ].join("\n");
}

function slugify(s, id) {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "run"}-${id}.gpx`;
}

// ───────────────────────────────────────────────────────────── main ──
(async () => {
  if (!existsSync(GPX_DIR)) mkdirSync(GPX_DIR, { recursive: true });
  const token = await refreshTokenIfNeeded();

  const acts = await listAllRuns(token);
  // Keep a run if either condition holds:
  //   • workout_type === 2 (Strava "Long Run" tag)  — 0|null=Default, 1=Race, 2=Long Run, 3=Workout
  //   • distance >= 20_000 meters (any run 20 km or longer, even if untagged)
  const LONG_KM = 20;
  const longRuns = acts.filter(
    (a) =>
      a.type === "Run" &&
      (a.workout_type === 2 || (a.distance ?? 0) >= LONG_KM * 1000),
  );
  const taggedCount = longRuns.filter((a) => a.workout_type === 2).length;
  const distCount = longRuns.length - taggedCount;
  console.log(
    `• ${longRuns.length} qualifying runs (${taggedCount} tagged Long Run, ${distCount} untagged but >= ${LONG_KM} km)`,
  );

  if (!longRuns.length) {
    console.log("\nNo qualifying runs found.");
    return;
  }

  let written = 0;
  let skipped = 0;
  for (const a of longRuns) {
    const filename = slugify(a.name, a.id);
    const dest = join(GPX_DIR, filename);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }
    console.log(`• fetching streams for "${a.name}" (${a.id})...`);
    try {
      const streams = await fetchStreams(a.id, token);
      const gpx = buildGpx({
        id: a.id,
        name: a.name,
        startDate: a.start_date,
        streams,
      });
      if (!gpx) {
        console.log(`  ↳ no GPS data, skipping`);
        continue;
      }
      writeFileSync(dest, gpx);
      written++;
      console.log(`  ↳ wrote ${filename}`);
    } catch (e) {
      console.error(`  ↳ failed: ${e.message}`);
    }
    // Rate-limit: stay well under 100/15min
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n${written} new GPX files, ${skipped} already present`);

  if (written > 0) {
    console.log("• running process-gpx.mjs...");
    const r = spawnSync("node", [join(ROOT, "scripts", "process-gpx.mjs")], {
      stdio: "inherit",
      cwd: ROOT,
    });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
