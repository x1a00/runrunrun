"use client";

import { countriesVisited, usStatesVisited, nycBoroughsVisited } from "@/lib/mock-data";
import { DataTable } from "@/components/primitives/data-table";
import type { GeoRow } from "@/types/activity";
import { formatNumber } from "@/lib/format";
import { toggleCity, toggleCountry, toggleState, useGeoFilter } from "@/lib/geo-filter";

// ISO 3166 alpha-2 → regional indicator emoji. Antarctica (AQ) has no flag,
// so we draw a snowflake there.
function codeToFlag(code?: string) {
  if (!code || code.length !== 2) return "";
  if (code.toUpperCase() === "AQ") return "\u2744\uFE0F";
  if (code === "??") return "";
  const cc = code.toUpperCase();
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 + (c.charCodeAt(0) - 65)),
  );
}

type Kind = "country" | "state" | "city";
type UnifiedRow = GeoRow & { level: 0 | 1 | 2; kind: Kind };

function buildRows(): UnifiedRow[] {
  const out: UnifiedRow[] = [];
  for (const c of countriesVisited) {
    out.push({ ...c, level: 0, kind: "country" });
    if (c.code === "US") {
      for (const s of usStatesVisited) {
        out.push({ ...s, level: 1, kind: "state" });
        if (s.code === "NY") {
          for (const b of nycBoroughsVisited) {
            out.push({ ...b, level: 2, kind: "city" });
          }
        }
      }
    }
  }
  return out;
}

export function Geography() {
  const filter = useGeoFilter();
  const rows = buildRows();
  const hasUnknown = countriesVisited.some((r) => r.code === "??");
  if (rows.length === 0) return null;

  const activeIdx = rows.findIndex((r) => {
    if (filter.kind === "country" && r.kind === "country") return r.code === filter.code;
    if (filter.kind === "state" && r.kind === "state") return r.code === filter.code;
    if (filter.kind === "city" && r.kind === "city") return r.code === filter.code;
    return false;
  });

  const columns = [
    {
      key: "name",
      header: "COUNTRY",
      cell: (r: UnifiedRow) => (
        <span
          className="inline-flex items-center gap-2"
          style={{ paddingLeft: r.level * 20 }}
        >
          {r.level === 0 ? (
            <span aria-hidden className="text-base leading-none">{codeToFlag(r.code)}</span>
          ) : (
            <span aria-hidden className="text-neutral-600">└</span>
          )}
          <span className={r.level === 0 ? "" : "text-neutral-400"}>{r.name}</span>
        </span>
      ),
    },
    {
      key: "days",
      header: "DAYS",
      align: "right" as const,
      cell: (r: UnifiedRow) => formatNumber(r.days),
    },
    {
      key: "km",
      header: "↓KM",
      align: "right" as const,
      cell: (r: UnifiedRow) => formatNumber(r.km, 1),
    },
  ];

  const onRowClick = (row: UnifiedRow) => {
    if (row.kind === "country") toggleCountry(row.code ?? "??", row.name);
    else if (row.kind === "state") toggleState(row.code ?? "", row.name);
    else toggleCity(row.code ?? "", row.name);
  };

  return (
    <section>
      <h2 className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-2">
        GEOGRAPHY
      </h2>
      <p className="text-center text-xs italic text-neutral-500 font-mono-tamzen mb-8">
        click any row to filter Notable Runs by that country, state, or borough
      </p>

      <div className="mb-8">
        <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
          COUNTRIES VISITED
        </h3>
        <div className="mx-auto max-w-3xl">
          <DataTable
            rows={rows}
            columns={columns}
            highlightedIndex={activeIdx}
            onRowClick={onRowClick}
          />
        </div>
        {hasUnknown ? (
          <p className="mx-auto max-w-3xl mt-3 text-xs font-mono-tamzen text-neutral-500 leading-relaxed">
            <span className="text-neutral-400">Unknown</span> &mdash; these are
            runs whose GPS center didn&rsquo;t fall inside any of the
            bounding-box regions this site knows about. Geolocation here is
            purely offline (coarse lat/lon boxes, no reverse-geocoding API), so
            anywhere outside the pre-configured countries lands in
            &ldquo;Unknown.&rdquo; Add the region to{" "}
            <code>src/lib/gpx-stats.ts</code> (search for <code>REGIONS</code>)
            to promote it.
          </p>
        ) : null}
      </div>
    </section>
  );
}
