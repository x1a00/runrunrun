export function Foreword() {
  return (
    <section className="text-center mb-16">
      <h2 className="font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-8">
        FOREWORD
      </h2>
      <div className="mx-auto max-w-2xl text-left space-y-4 text-sm leading-6 font-mono-tamzen text-neutral-300">
        <p>
          A running log, derived directly from GPX files. Everything on this page —
          totals, paces, distances, maps, elevation — is computed from the raw tracks
          dropped into <code className="mx-1">public/gpx/</code>. No hand-entered
          numbers, no placeholder history.
        </p>
        <p>
          Moving time is computed with an auto-pause rule: samples more than 15
          seconds apart or slower than 0.4 m/s are excluded from the denominator.
          Pace is reported in minutes per kilometer. Elevation is summed from
          positive deltas along the track.
        </p>
        <p>
          To extend the log, drop additional <code className="mx-1">.gpx</code> files
          into <code className="mx-1">public/gpx/</code> and run{" "}
          <code className="mx-1">node scripts/process-gpx.mjs</code>. All analytics
          sections on this page will update automatically.
        </p>
      </div>
    </section>
  );
}
