import fs from "node:fs";
import path from "node:path";

interface SeoEntry {
  loreQuote: string;
  seoDescription: string;
  seoTitle?: string;
}

interface LangEntry {
  en: SeoEntry;
  ru: SeoEntry;
}

interface SeoTextData {
  buildings: Record<string, LangEntry>;
  heroes: Record<string, LangEntry>;
  skills: Record<string, LangEntry>;
  troops: Record<string, LangEntry>;
  hubs: Record<string, { en: { seoDescription: string }; ru: { seoDescription: string } }>;
}

let _cache: SeoTextData | null = null;

function load(): SeoTextData {
  if (_cache) return _cache;
  const p = path.join(process.cwd(), "data", "seo-text.json");
  _cache = JSON.parse(fs.readFileSync(p, "utf8")) as SeoTextData;
  return _cache;
}

export function getSeoText(
  category: "buildings" | "heroes" | "skills" | "troops",
  key: string,
  lang: string,
): SeoEntry | null {
  const data = load();
  const bucket = data[category];
  if (!bucket) return null;
  const entry = bucket[key];
  if (!entry) return null;
  return lang === "ru" ? entry.ru : entry.en;
}

export function getHubSeo(
  hub: string,
  lang: string,
): { seoDescription: string } | null {
  const data = load();
  const entry = data.hubs?.[hub];
  if (!entry) return null;
  return lang === "ru" ? entry.ru : entry.en;
}
