import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

export type ManualDoc = {
  frontmatter: Record<string, unknown>;
  html: string;
};

export function getManualDoc(opts: {
  lang: string;
  entity: "buildings" | "troops" | "skills" | "pages";
  key: string;
}): ManualDoc | null {
  const full = path.join(process.cwd(), "content", opts.lang, opts.entity, `${opts.key}.md`);
  if (!fs.existsSync(full)) return null;

  const raw = fs.readFileSync(full, "utf8");
  const parsed = matter(raw);
  const html = marked.parse(parsed.content) as string;

  return { frontmatter: parsed.data as Record<string, unknown>, html };
}

