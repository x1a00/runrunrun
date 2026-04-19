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

const countryCols = [
  {
    key: "name",
    header: "COUNTRY",
    cell: (r: GeoRow) => (
      <span className="inline-flex items-center gap-2">
        <span aria-hidden className="text-base leading-none">{codeToFlag(r.code)}</span>
        <span>{r.name}</span>
      </span>
    ),
  },
  { key: "days", header: "DAYS", align: "right" as const, cell: (r: GeoRow) => formatNumber(r.days) },
  { key: "km", header: "↓KM", align: "right" as const, cell: (r: GeoRow) => formatNumber(r.km, 1) },
];
const stateCols = [
  { key: "name", header: "STATE", cell: (r: GeoRow) => r.name },
  countryCols[1],
  countryCols[2],
];

const boroughCols = [
  { key: "name", header: "BOROUGH", cell: (r: GeoRow) => r.name },
  countryCols[1],
  countryCols[2],
];

export function Geography() {
  const filter = useGeoFilter();
  const half = Math.ceil(usStatesVisited.length / 2);
  const left = usStatesVisited.slice(0, half);
  const right = usStatesVisited.slice(half);
  const hasCountries = countriesVisited.length > 0;
  const hasStates = usStatesVisited.length > 0;
  const hasBoroughs = nycBoroughsVisited.length > 0;
  const hasUnknown = countriesVisited.some((r) => r.code === "??");
  if (!hasCountries && !hasStates && !hasBoroughs) return null;

  const activeCountryIdx = (rows: GeoRow[]) =>
    filter.kind === "country"
      ? rows.findIndex((r) => r.code === filter.code)
      : -1;
  const activeStateIdx = (rows: GeoRow[]) =>
    filter.kind === "state"
      ? rows.findIndex((r) => r.code === filter.code)
      : -1;
  const activeCityIdx = (rows: GeoRow[]) =>
    filter.kind === "city"
      ? rows.findIndex((r) => r.code === filter.code)
      : -1;

  return (
    <section>
      <h2 className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-2">
        GEOGRAPHY
      </h2>
      <p className="text-center text-xs italic text-neutral-500 font-mono-tamzen mb-8">
        click any row to filter Notable Runs by that country or state
      </p>

      {hasCountries ? (
        <div className="mb-8">
          <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
            COUNTRIES VISITED
          </h3>
          <div className="mx-auto max-w-3xl">
            <DataTable
              rows={countriesVisited}
              columns={countryCols}
              highlightedIndex={activeCountryIdx(countriesVisited)}
              onRowClick={(row) => toggleCountry(row.code ?? "??", row.name)}
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
      ) : null}

      {hasStates ? (
        <div className="mb-8">
          <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
            US STATES VISITED
          </h3>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            <DataTable
              rows={left}
              columns={stateCols}
              highlightedIndex={activeStateIdx(left)}
              onRowClick={(row) => toggleState(row.code ?? "", row.name)}
            />
            <DataTable
              rows={right}
              columns={stateCols}
              highlightedIndex={activeStateIdx(right)}
              onRowClick={(row) => toggleState(row.code ?? "", row.name)}
            />
          </div>
        </div>
      ) : null}

      {hasBoroughs ? (
        <div className="mb-16">
          <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
            NYC BOROUGHS VISITED
          </h3>
          <div className="mx-auto max-w-3xl">
            <DataTable
              rows={nycBoroughsVisited}
              columns={boroughCols}
              highlightedIndex={activeCityIdx(nycBoroughsVisited)}
              onRowClick={(row) => toggleCity(row.code ?? "", row.name)}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
