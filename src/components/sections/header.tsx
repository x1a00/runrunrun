import { streakStats } from "@/lib/mock-data";
import { siteContent } from "@/lib/content";

export function Header() {
  // subtitle: explicit string in YAML → use it (empty string = hide)
  //           key absent → auto-generate from streak dates
  const { subtitle } = siteContent.header;
  let subtitleText: string | null = null;
  if (subtitle === undefined) {
    const start = new Date(streakStats.startDate + "T00:00:00Z").toLocaleDateString(
      "en-US",
      { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
    );
    const end = new Date(streakStats.endDate + "T00:00:00Z").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    subtitleText = `runs logged from ${start} to ${end}`;
  } else if (subtitle.trim() !== "") {
    subtitleText = subtitle;
  }

  return (
    <div className="text-center mb-8">
      <h1 className="font-sans text-5xl md:text-6xl font-bold tracking-tight text-neutral-100">
        {siteContent.header.name}
      </h1>
      {subtitleText ? (
        <p className="mt-2 text-sm font-mono-tamzen text-neutral-400">{subtitleText}</p>
      ) : null}
    </div>
  );
}
