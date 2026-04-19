import { siteContent } from "@/lib/content";

export function SiteFooter() {
  const { label, url } = siteContent.footer;
  return (
    <footer className="text-center mt-16 text-xs font-mono-tamzen text-neutral-500">
      <p>
        Cloned from{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-neutral-300"
        >
          {label}
        </a>
      </p>
    </footer>
  );
}
