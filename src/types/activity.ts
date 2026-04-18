// Domain types for the no-days-off clone. All distances in MILES, elevation in FEET,
// pace as seconds per mile.

export interface ActivityLocation {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

export type WeatherCondition =
  | "clear"
  | "clouds"
  | "rain"
  | "snow"
  | "fog"
  | "thunderstorm";

export interface Activity {
  id: string;
  date: string; // ISO YYYY-MM-DD
  distanceMi: number;
  durationSec: number;
  elevationFt?: number;
  paceSecPerMi?: number;
  avgHeartRate?: number;
  tempF?: number;
  weather?: WeatherCondition;
  shoe?: string;
  location: ActivityLocation;
  gpxPath?: string;
  photoPaths?: string[];
  notes?: string;
  treadmill?: boolean;
}

export interface NotableRun {
  rank: number;
  date: string;
  distanceMi: number;
  durationSec: number;
  paceSecPerMi: number;
  elevationFt: number;
  tempF: number;
  weather: WeatherCondition;
  title?: string;
  location: ActivityLocation;
  gpxPath?: string;
  /** Key into `gpxTracks` when this run has a real GPS trace. */
  gpxId?: string;
  // Small elevation+pace profile series (sampled every ~0.5 mi)
  profile?: { mile: number; ft: number; paceSecPerMi: number }[];
}

export type NotableRunCategory =
  | "longest"
  | "personal-bests"
  | "elevation"
  | "races"
  | "bus-run-bus"
  | "weekly-half";

export interface StreakStats {
  startDate: string;
  endDate: string;
  totalDays: number;
  totalMiles: number;
  totalHours: number;
  totalElevationFt: number;
  years: number;
  months: number;
  days: number;
}

export interface AnnualMileage {
  year: number;
  miles: number;
}

export interface HistogramBucket {
  label: string;
  count: number;
}

export interface GeoRow {
  name: string;
  code?: string;
  days: number;
  miles: number;
}

export interface HeatmapCell {
  date: string;
  miles: number;
}

export interface StreakYearHeatmap {
  yearNumber: number;
  label: string;
  totalMiles: number;
  avgPerDay: number;
  inProgress?: boolean;
  cells: HeatmapCell[];
}
