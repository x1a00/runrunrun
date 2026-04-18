import { countriesVisited, usStatesVisited } from "@/lib/mock-data";
import { DataTable } from "@/components/primitives/data-table";
import type { GeoRow } from "@/types/activity";
import { formatNumber } from "@/lib/format";

const cols = [
  { key: "name", header: "COUNTRY", cell: (r: GeoRow) => r.name },
  { key: "days", header: "DAYS", align: "right" as const, cell: (r: GeoRow) => formatNumber(r.days) },
  { key: "miles", header: "↓MILES", align: "right" as const, cell: (r: GeoRow) => formatNumber(r.miles, 1) },
];
const stateCols = [{ ...cols[0], header: "STATE" }, cols[1], cols[2]];

export function Geography() {
  const half = Math.ceil(usStatesVisited.length / 2);
  const left = usStatesVisited.slice(0, half);
  const right = usStatesVisited.slice(half);
  return (
    <section>
      <h2 className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-8">
        GEOGRAPHY
      </h2>

      <div className="mb-16">
        <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
          COUNTRIES VISITED
        </h3>
        <p className="text-center text-xs italic text-neutral-500 font-mono-tamzen mb-4">
          been lucky to run on all seven continents, including antarctica!
        </p>
        <div className="mx-auto max-w-3xl">
          <DataTable rows={countriesVisited} columns={cols} />
        </div>
      </div>

      <div className="mb-16">
        <h3 className="text-center font-sans text-lg font-bold text-neutral-100 mb-1">
          US STATES VISITED
        </h3>
        <p className="text-center text-xs italic text-neutral-500 font-mono-tamzen mb-4">
          18 of 50 states visited, still a few to go
        </p>
        <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
          <DataTable rows={left} columns={stateCols} />
          <DataTable rows={right} columns={stateCols} />
        </div>
      </div>
    </section>
  );
}
