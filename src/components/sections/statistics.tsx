import { ChartCard } from "@/components/primitives/chart-card";
import { BarChart } from "@/components/charts/bar-chart";
import { PolarClock } from "@/components/charts/polar-clock";
import { RadarChart } from "@/components/charts/radar-chart";
import { DensityChart } from "@/components/charts/density-chart";
import { HorizontalBars } from "@/components/charts/horizontal-bars";
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
  LucideIcon,
} from "lucide-react";
import {
  annualMileage,
  avgByWeekday,
  equipment,
  heartRateZones,
  paceDistribution,
  runDistances,
  temperatureBuckets,
  temperatureRanges,
  treadmillVsOutdoor,
  weatherConditions,
  workoutByTime,
} from "@/lib/mock-data";
import { formatPace } from "@/lib/format";

const WEATHER_ICONS: Record<string, LucideIcon> = {
  sun: Sun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  snowflake: CloudSnow,
  "cloud-fog": CloudFog,
  "cloud-lightning": CloudLightning,
};

export function Statistics() {
  return (
    <section className="mb-16">
      <h2 className="text-center font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-8">
        STATISTICS
      </h2>

      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4 mb-16">
        <ChartCard
          title="ANNUAL DISTANCE"
          caption="kilometers logged per streak year"
        >
          <BarChart
            data={annualMileage.map((a) => ({ label: String(a.year), value: a.km }))}
            xAxisLabel="streak year"
            yAxisLabel="km"
          />
        </ChartCard>

        <ChartCard
          title="WORKOUT ACTIVITY BY TIME"
          caption="distribution of start times across the day"
        >
          <PolarClock data={workoutByTime} />
        </ChartCard>

        <ChartCard
          title="AVERAGE DAILY DISTANCE BY DAY"
          caption="kilometers by day of week"
        >
          <RadarChart
            data={avgByWeekday}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </ChartCard>

        <ChartCard
          title="TREADMILL VS OUTDOOR"
          caption="split between outdoor and treadmill runs"
        >
          <HorizontalBars
            data={[
              { label: "Outdoor", value: treadmillVsOutdoor.outdoor },
              { label: "Treadmill", value: treadmillVsOutdoor.treadmill },
            ]}
            height={120}
          />
        </ChartCard>
      </div>

      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4 mb-16">
        <ChartCard
          title="RUN DISTANCES"
          caption="count of runs bucketed by distance"
        >
          <BarChart
            data={runDistances.map((b) => ({ label: b.label, value: b.count }))}
            yTicks={[0, 300, 600, 900, 1200, 1500]}
          />
        </ChartCard>

        <ChartCard
          title="PACE DISTRIBUTION"
          caption="distribution of average pace across runs"
        >
          <DensityChart
            bins={paceDistribution.bins}
            axisLabels={paceDistribution.axisLabels}
            meanBin={Math.round(paceDistribution.bins.length * 0.55)}
            medianBin={Math.round(paceDistribution.bins.length * 0.5)}
            meanLabel={`mean: ${formatPace(paceDistribution.meanSec)}`}
            medianLabel={`median: ${formatPace(paceDistribution.medianSec)}`}
          />
        </ChartCard>

        <ChartCard title="HEART RATE ZONES" caption="count of runs by average heart rate zone">
          <HorizontalBars data={heartRateZones.map((z) => ({ label: z.label, sub: z.bpm, value: z.count }))} />
        </ChartCard>

        <ChartCard
          title="EQUIPMENT"
          caption="retired shoes, stacked by lifetime distance"
        >
          <HorizontalBars data={equipment.map((e) => ({ label: e.model, value: e.km }))} height={220} />
        </ChartCard>
      </div>

      <div className="grid gap-12 md:grid-cols-2 mb-16">
        <ChartCard
          title="TEMPERATURE"
          caption="count of runs bucketed by ambient temperature"
        >
          <BarChart
            data={temperatureBuckets.map((b) => ({
              label: b.label,
              value: b.count,
            }))}
            yTicks={[0, 250, 500, 750, 1000]}
            width={540}
          />
          <div className="grid grid-cols-9 gap-1 text-[9px] font-mono-tamzen text-neutral-500 mt-1 w-full">
            {temperatureRanges.map((r) => (
              <div key={r} className="text-center">
                {r}
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="WEATHER CONDITIONS" caption="count of runs by weather condition">
          <div className="flex items-end justify-around gap-3 w-full max-w-md">
            {weatherConditions.map((w) => {
              const Icon = WEATHER_ICONS[w.icon] ?? Cloud;
              const max = Math.max(...weatherConditions.map((x) => x.count));
              const h = (w.count / max) * 140;
              return (
                <div key={w.label} className="flex flex-col items-center gap-2">
                  <div className="font-mono-tamzen text-[10px] text-neutral-400">{w.count}</div>
                  <div style={{ height: h }} className="w-10 bg-neutral-200" />
                  <Icon size={16} className="text-neutral-300" />
                  <div className="font-mono-tamzen text-[10px] text-neutral-500 uppercase">
                    {w.label}
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </section>
  );
}
