A running log, derived directly from GPX files. Everything on this page — totals, paces, distances, maps, elevation — is computed from the raw tracks dropped into `public/gpx/`. No hand-entered numbers, no placeholder history.

Moving time is computed with an auto-pause rule: samples more than 15 seconds apart or slower than 0.4 m/s are excluded from the denominator. Pace is reported in minutes per kilometer. Elevation is summed from positive deltas along the track.

To extend the log, drop additional `.gpx` files into `public/gpx/` and run `node scripts/process-gpx.mjs`. All analytics sections on this page will update automatically.
