import { siteContent } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="text-center mt-16 text-xs font-mono-tamzen text-neutral-500 space-y-1">
      {siteContent.footer.map((line, i) => {
        if (line.url && line.linkText) {
          // Inline link: plain prefix + underlined linkText only
          return (
            <p key={i}>
              {line.text}
              <a
                href={line.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-300"
              >
                {line.linkText}
              </a>
            </p>
          );
        }
        if (line.url) {
          // Whole line is a link
          return (
            <p key={i}>
              <a
                href={line.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-neutral-300"
              >
                {line.text}
              </a>
            </p>
          );
        }
        return <p key={i}>{line.text}</p>;
      })}
    </footer>
  );
}
