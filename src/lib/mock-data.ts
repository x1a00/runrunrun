import type {
  AnnualMileage,
  GeoRow,
  HistogramBucket,
  NotableRun,
  NotableRunCategory,
  StreakStats,
  StreakYearHeatmap,
} from "@/types/activity";

// Numbers below mirror what nodaysoff.run displayed on capture day (2026-04-17).
// Mock data — no real backend; scalar values match the target for visual parity.

export const streakStats: StreakStats = {
  startDate: "2015-07-11",
  endDate: "2026-02-23",
  totalDays: 3881,
  totalMiles: 13454,
  totalHours: 2088,
  totalElevationFt: 257000,
  years: 10,
  months: 7,
  days: 13,
};

// -- Notable Runs ---------------------------------------------------------

const usny = { country: "United States", countryCode: "US", region: "NY", city: "New York" };
const usbk = { country: "United States", countryCode: "US", region: "NY", city: "Brooklyn" };
const usco = { country: "United States", countryCode: "US", region: "CO", city: "Denver" };
const ussd = { country: "United States", countryCode: "US", region: "CA", city: "San Diego" };
const fr = { country: "France", countryCode: "FR", city: "Perpignan" };

function mockProfile(distance: number): NotableRun["profile"] {
  const points = Math.max(12, Math.round(distance * 2));
  return Array.from({ length: points }, (_, i) => {
    const mile = (i / (points - 1)) * distance;
    const ft = 80 + 60 * Math.sin(i * 0.7) + 30 * Math.cos(i * 0.3);
    const paceSecPerMi = 8 * 60 + Math.round(90 * Math.sin(i * 0.5));
    return { mile, ft, paceSecPerMi };
  });
}

const longest: NotableRun[] = [
  { rank: 1, date: "Nov 22, 2017", distanceMi: 33.67, durationSec: 24418, paceSecPerMi: 725, elevationFt: 1798, tempF: 49, weather: "clouds", title: "Perpignan - Cascastel", location: fr, profile: mockProfile(33.67) },
  { rank: 2, date: "Jun 27, 2020", distanceMi: 31.72, durationSec: 22870, paceSecPerMi: 721, elevationFt: 2104, tempF: 62, weather: "clear", title: "Summer 50K", location: usco, profile: mockProfile(31.72) },
  { rank: 3, date: "Aug 27, 2019", distanceMi: 30.96, durationSec: 21980, paceSecPerMi: 710, elevationFt: 1450, tempF: 71, weather: "clear", title: "End-of-Summer Long Run", location: usny, profile: mockProfile(30.96) },
  { rank: 4, date: "Apr 9, 2017", distanceMi: 26.95, durationSec: 19230, paceSecPerMi: 713, elevationFt: 980, tempF: 54, weather: "clouds", title: "Central Park Marathon", location: usny, profile: mockProfile(26.95) },
  { rank: 5, date: "Nov 23, 2025", distanceMi: 26.25, durationSec: 18510, paceSecPerMi: 705, elevationFt: 1320, tempF: 42, weather: "clouds", title: "Thanksgiving Prep", location: usco, profile: mockProfile(26.25) },
  { rank: 6, date: "Nov 4, 2017", distanceMi: 22.19, durationSec: 16130, paceSecPerMi: 727, elevationFt: 720, tempF: 45, weather: "clear", title: "Autumn Trail", location: usny, profile: mockProfile(22.19) },
  { rank: 7, date: "Feb 18, 2017", distanceMi: 22.02, durationSec: 16030, paceSecPerMi: 728, elevationFt: 690, tempF: 32, weather: "snow", title: "Snowy Winter Long Run", location: usny, profile: mockProfile(22.02) },
  { rank: 8, date: "Oct 28, 2017", distanceMi: 21.95, durationSec: 15820, paceSecPerMi: 720, elevationFt: 810, tempF: 52, weather: "clouds", title: "Fall Classic", location: usny, profile: mockProfile(21.95) },
  { rank: 9, date: "Mar 22, 2026", distanceMi: 21.39, durationSec: 12960, paceSecPerMi: 606, elevationFt: 1293, tempF: 73, weather: "clear", title: "Long Brooklyn Loop", location: usbk, gpxId: "long-brooklyn", gpxPath: "/gpx/long-brooklyn.gpx", profile: mockProfile(21.39) },
  { rank: 10, date: "Aug 5, 2019", distanceMi: 20.07, durationSec: 14310, paceSecPerMi: 713, elevationFt: 540, tempF: 74, weather: "clear", title: "Summer 20-Miler", location: usny, profile: mockProfile(20.07) },
];

// Personal Bests: distance-category records. The San Diego GPX slots in as the
// half-marathon PB since it's a clean 13 mi with a full trace.
const personalBests: NotableRun[] = [
  { rank: 1, date: "May 4, 2019", distanceMi: 3.11, durationSec: 1135, paceSecPerMi: 365, elevationFt: 45, tempF: 58, weather: "clear", title: "5K PB · Central Park", location: usny, profile: mockProfile(3.11) },
  { rank: 2, date: "Sep 12, 2018", distanceMi: 6.21, durationSec: 2340, paceSecPerMi: 377, elevationFt: 78, tempF: 64, weather: "clouds", title: "10K PB · Prospect Park", location: usbk, profile: mockProfile(6.21) },
  { rank: 3, date: "Jun 10, 2019", distanceMi: 10, durationSec: 3910, paceSecPerMi: 391, elevationFt: 120, tempF: 66, weather: "clear", title: "10-Mile PB", location: usny, profile: mockProfile(10) },
  { rank: 4, date: "Feb 28, 2026", distanceMi: 12.98, durationSec: 9420, paceSecPerMi: 726, elevationFt: 374, tempF: 62, weather: "clear", title: "San Diego Afternoon", location: ussd, gpxId: "san-diego-afternoon", gpxPath: "/gpx/san-diego-afternoon.gpx", profile: mockProfile(12.98) },
  { rank: 5, date: "Nov 3, 2019", distanceMi: 26.2, durationSec: 10980, paceSecPerMi: 419, elevationFt: 410, tempF: 47, weather: "clouds", title: "NYC Marathon", location: usny, profile: mockProfile(26.2) },
];

const elevation: NotableRun[] = longest
  .slice()
  .sort((a, b) => b.elevationFt - a.elevationFt)
  .map((r, i) => ({ ...r, rank: i + 1 }));

const races: NotableRun[] = longest.slice(0, 6).map((r, i) => ({ ...r, rank: i + 1, title: `Race #${i + 1}` }));
const busRunBus: NotableRun[] = longest.slice(0, 5).map((r, i) => ({ ...r, rank: i + 1, title: `Bus-Run-Bus ${i + 1}` }));
const weeklyHalf: NotableRun[] = longest.slice(0, 8).map((r, i) => ({
  ...r,
  rank: i + 1,
  distanceMi: 13.1 + i * 0.02,
  title: `Weekly Half ${i + 1}`,
}));

export const notableRuns: Record<NotableRunCategory, NotableRun[]> = {
  longest,
  "personal-bests": personalBests,
  elevation,
  races,
  "bus-run-bus": busRunBus,
  "weekly-half": weeklyHalf,
};

// -- Statistics ----------------------------------------------------------

export const annualMileage: AnnualMileage[] = [
  { year: 1, miles: 1632 },
  { year: 2, miles: 1322 },
  { year: 3, miles: 1500 },
  { year: 4, miles: 1202 },
  { year: 5, miles: 1564 },
  { year: 6, miles: 2103 },
  { year: 7, miles: 1236 },
  { year: 8, miles: 888 },
  { year: 9, miles: 575 },
  { year: 10, miles: 609 },
  { year: 11, miles: 824 },
];

// Polar activity-by-time of day — 24 hourly bins, pct of runs
export const workoutByTime: number[] = [
  0.5, 0.3, 0.2, 0.4, 0.8, 3.1,
  8.2, 11.4, 12.8, 10.1, 6.2, 4.0,
  3.2, 2.9, 3.0, 3.4, 3.8, 4.5,
  4.2, 3.5, 3.1, 2.8, 1.9, 1.0,
];

// Radar: average daily mileage by weekday (M T W T F S S — 7 points)
export const avgByWeekday: number[] = [3.2, 2.9, 3.6, 3.1, 2.8, 4.2, 4.8];

export const runDistances: HistogramBucket[] = [
  { label: "1mi", count: 1368 },
  { label: "2mi", count: 802 },
  { label: "3mi", count: 510 },
  { label: "4mi", count: 525 },
  { label: "5-6mi", count: 598 },
  { label: "7-8mi", count: 180 },
  { label: "9-10mi", count: 58 },
  { label: "11-12mi", count: 42 },
  { label: "13-14mi", count: 94 },
  { label: "15-25mi", count: 35 },
  { label: "26+mi", count: 5 },
];

export const treadmillVsOutdoor = { treadmill: 412, outdoor: 3469 };

export const paceDistribution = {
  meanSec: 9 * 60 + 27,
  medianSec: 9 * 60 + 29,
  bins: Array.from({ length: 60 }, (_, i) => {
    const x = (i - 30) / 8;
    return Math.round(400 * Math.exp(-x * x));
  }),
  axisLabels: ["5:00/mi", "6:00/mi", "7:00/mi", "8:00/mi", "9:00/mi", "10:00/mi", "11:00/mi", "12:00/mi"],
};

export const heartRateZones = [
  { label: "Recovery", bpm: "<120bpm", count: 1040 },
  { label: "Easy", bpm: "120-140bpm", count: 2151 },
  { label: "Tempo", bpm: "140-160bpm", count: 528 },
  { label: "Threshold", bpm: "160-175bpm", count: 132 },
  { label: "VO2 Max", bpm: ">175bpm", count: 30 },
];

export const temperatureBuckets: HistogramBucket[] = [
  { label: "Frigid", count: 62 },
  { label: "Very Cold", count: 159 },
  { label: "Cold", count: 403 },
  { label: "Cool", count: 682 },
  { label: "Mild", count: 912 },
  { label: "Comfortable", count: 835 },
  { label: "Warm", count: 477 },
  { label: "Hot", count: 103 },
  { label: "Very Hot", count: 6 },
];

export const temperatureRanges: string[] = [
  "< 20°F",
  "20-29°F",
  "30-39°F",
  "40-49°F",
  "50-59°F",
  "60-69°F",
  "70-79°F",
  "80-89°F",
  "≥ 90°F",
];

export const weatherConditions: { label: string; icon: string; count: number }[] = [
  { label: "Clear", icon: "sun", count: 1734 },
  { label: "Clouds", icon: "cloud", count: 1271 },
  { label: "Rain", icon: "cloud-rain", count: 457 },
  { label: "Snow", icon: "snowflake", count: 84 },
  { label: "Fog", icon: "cloud-fog", count: 42 },
  { label: "Storm", icon: "cloud-lightning", count: 18 },
];

export const equipment: { model: string; miles: number }[] = [
  { model: "Nike Pegasus 38", miles: 842 },
  { model: "Asics Nimbus 24", miles: 710 },
  { model: "Saucony Endorphin Speed", miles: 655 },
  { model: "New Balance 1080v11", miles: 612 },
  { model: "Hoka Clifton 8", miles: 510 },
  { model: "Brooks Ghost 14", miles: 480 },
  { model: "Nike Vomero 16", miles: 415 },
];

// -- Geography -----------------------------------------------------------

export const countriesVisited: GeoRow[] = [
  { name: "United States", code: "US", days: 3341, miles: 11490.1 },
  { name: "France", code: "FR", days: 111, miles: 378.6 },
  { name: "Israel", code: "IL", days: 9, miles: 48.0 },
  { name: "Denmark", code: "DK", days: 5, miles: 32.3 },
  { name: "Morocco", code: "MA", days: 7, miles: 31.4 },
  { name: "Japan", code: "JP", days: 21, miles: 27.6 },
  { name: "United Kingdom", code: "GB", days: 10, miles: 21.8 },
  { name: "Sweden", code: "SE", days: 1, miles: 20.0 },
  { name: "Argentina", code: "AR", days: 10, miles: 20.0 },
  { name: "Iceland", code: "IS", days: 4, miles: 18.4 },
  { name: "Canada", code: "CA", days: 6, miles: 17.9 },
  { name: "Spain", code: "ES", days: 5, miles: 14.5 },
  { name: "Italy", code: "IT", days: 4, miles: 11.8 },
  { name: "Germany", code: "DE", days: 3, miles: 8.9 },
  { name: "Portugal", code: "PT", days: 2, miles: 6.2 },
  { name: "Antarctica", code: "AQ", days: 1, miles: 3.1 },
];

export const usStatesVisited: GeoRow[] = [
  { name: "Colorado", code: "CO", days: 1821, miles: 5267.1 },
  { name: "California", code: "CA", days: 733, miles: 3043.5 },
  { name: "New York", code: "NY", days: 697, miles: 2832.9 },
  { name: "Washington", code: "WA", days: 45, miles: 155.8 },
  { name: "Nevada", code: "NV", days: 10, miles: 61.5 },
  { name: "Texas", code: "TX", days: 5, miles: 19.3 },
  { name: "Utah", code: "UT", days: 2, miles: 18.8 },
  { name: "New Mexico", code: "NM", days: 2, miles: 17.1 },
  { name: "Vermont", code: "VT", days: 2, miles: 16.1 },
  { name: "South Carolina", code: "SC", days: 6, miles: 15.4 },
  { name: "Ohio", code: "OH", days: 2, miles: 12.9 },
  { name: "Arizona", code: "AZ", days: 2, miles: 8.7 },
  { name: "Massachusetts", code: "MA", days: 1, miles: 6.5 },
  { name: "Oregon", code: "OR", days: 1, miles: 5.8 },
  { name: "Florida", code: "FL", days: 2, miles: 5.1 },
  { name: "Illinois", code: "IL", days: 1, miles: 4.6 },
  { name: "Montana", code: "MT", days: 1, miles: 3.7 },
  { name: "Wyoming", code: "WY", days: 1, miles: 2.9 },
];

// -- Daily Log heatmaps ---------------------------------------------------

function seededRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function buildYearCells(yearNumber: number, startYear: number, totalMiles: number, inProgress = false) {
  // Simulate daily miles across exactly 365 days (avg-day * variance).
  const rng = seededRng(yearNumber * 9973);
  const days = 365;
  const avg = totalMiles / (inProgress ? 240 : days);
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.UTC(startYear, 6, 1));
    d.setUTCDate(d.getUTCDate() + i);
    // Some weekly rhythm: long runs on saturdays, shorter midweek
    const dow = d.getUTCDay();
    const bias = dow === 6 ? 1.7 : dow === 0 ? 1.2 : 0.75;
    const noise = 0.4 + rng() * 1.4;
    const miles =
      inProgress && i > 240 ? 0 : Math.max(0.5, +(avg * bias * noise).toFixed(2));
    return { date: d.toISOString().slice(0, 10), miles };
  });
  return cells;
}

export const streakYears: StreakYearHeatmap[] = annualMileage
  .slice()
  .reverse()
  .map((a) => {
    const startYear = 2014 + a.year; // Year 1 => 2015, Year 11 => 2025
    const inProgress = a.year === 11;
    return {
      yearNumber: a.year,
      label: `Jul ${startYear} - Jul ${startYear + 1}`,
      totalMiles: a.miles,
      avgPerDay: +(a.miles / (inProgress ? 240 : 365)).toFixed(1),
      inProgress,
      cells: buildYearCells(a.year, startYear, a.miles, inProgress),
    };
  });
