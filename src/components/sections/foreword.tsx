import { readFileSync } from "node:fs";
import { join } from "node:path";

// Foreword copy lives in content/foreword.md at the repo root so it can
// be edited without touching JSX. Server component reads it at build time;
// each push rebuilds the static export with the latest text.
//
// Markdown support here is intentionally minimal: paragraphs split on blank
// lines, `inline code` → <code>. If you need headings, lists, or links,
// swap to a proper markdown lib (e.g. `marked`).
const FOREWORD_PATH = join(process.cwd(), "content", "foreword.md");
const raw = readFileSync(FOREWORD_PATH, "utf8").trim();

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={i} className="mx-1">
          {p.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export function Foreword() {
  const paragraphs = raw.split(/\n\s*\n/);
  return (
    <section className="text-center mb-16">
      <h2 className="font-sans text-xl font-medium uppercase tracking-wide text-neutral-100 mb-8">
        FOREWORD
      </h2>
      <div className="mx-auto max-w-2xl text-left space-y-4 text-sm leading-6 font-mono-tamzen text-neutral-300">
        {paragraphs.map((p, i) => (
          <p key={i}>{renderInline(p)}</p>
        ))}
      </div>
    </section>
  );
}
