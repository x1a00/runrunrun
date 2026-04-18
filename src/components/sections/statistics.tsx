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
          title="ANNUAL MILEAGE"
          caption="a slight dip in the last few years, because work and life sometimes gets in the way"
        >
          <BarChart
            data={annualMileage.map((a) => ({ label: String(a.year), value: a.miles }))}
            yTicks={[0, 600, 1200, 1800, 2400, 3000]}
            xAxisLabel="streak year"
            yAxisLabel="miles"
          />
        </ChartCard>

        <ChartCard
          title="WORKOUT ACTIVITY BY TIME"
          caption="definitely a morning runner! with the occasional 0:01 run to be sure I get one in that day"
        >
          <PolarClock data={workoutByTime} />
        </ChartCard>

        <ChartCard
          title="AVERAGE DAILY MILEAGE BY DAY"
          caption="used to do my long runs on saturdays, switched to wednesdays more recently"
        >
          <RadarChart
            data={avgByWeekday}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          />
        </ChartCard>

        <ChartCard
          title="TREADMILL VS OUTDOOR"
          caption="i'll always run outside when I can — the treadmill is a tool, not a preference"
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
          caption={'i call the one-milers "streak savers", those have unfortunately become more frequent lately'}
        >
          <BarChart
            data={runDistances.map((b) => ({ label: b.label, value: b.count }))}
            yTicks={[0, 300, 600, 900, 1200, 1500]}
          />
        </ChartCard>

        <ChartCard
          title="PACE DISTRIBUTION"
          caption="pretty much the easy pace I revert to these days"
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

        <ChartCard title="HEART RATE ZONES" caption="most of my runs are easy ones, as they should">
          <HorizontalBars data={heartRateZones.map((z) => ({ label: z.label, sub: z.bpm, value: z.count }))} />
        </ChartCard>

        <ChartCard
          title="EQUIPMENT"
          caption="retired shoes, stacked by lifetime mileage"
        >
          <HorizontalBars data={equipment.map((e) => ({ label: e.model, value: e.miles }))} height={220} />
        </ChartCard>
      </div>

      <div className="grid gap-12 md:grid-cols-2 mb-16">
        <ChartCard
          title="TEMPERATURE"
          caption="i prefer running in the 40s, but unfortunately don't control the weather"
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

        <ChartCard title="WEATHER CONDITIONS" caption="rain or shine!">
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
