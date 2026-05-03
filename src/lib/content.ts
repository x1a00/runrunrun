import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

export interface FooterLine {
  text: string;
  url?: string;
  /** If set, only this portion is underlined/linked; `text` renders as plain prefix. */
  linkText?: string;
}

export interface SiteContent {
  header: {
    name: string;
    /** Subtitle below the title. "" = hidden. Omit key = auto date range. */
    subtitle?: string;
  };
  foreword: string[];
  sections?: {
    daily_log?: {
      /** Italic line below "DAILY LOG". "" = hidden. */
      subtitle?: string;
    };
    notable_runs?: {
      captions?: {
        longest?: string;
        personal_bests?: string;
        elevation?: string;
      };
    };
  };
  footer: FooterLine[];
}

const CONTENT_PATH = join(process.cwd(), "content", "site.yaml");

function loadContent(): SiteContent {
  const raw = readFileSync(CONTENT_PATH, "utf8");
  const parsed = yaml.load(raw);
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("content/site.yaml must be a YAML object");
  }
  return parsed as SiteContent;
}

export const siteContent: SiteContent = loadContent();
