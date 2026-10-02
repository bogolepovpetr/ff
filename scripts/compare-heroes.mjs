#!/usr/bin/env node
import fs from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultMonoSchemaDir } from "./lib/sync-manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIKI = path.join(ROOT, "data", "source", "lists_leads.json");
const MONO = path.join(defaultMonoSchemaDir(), "lists_lead.json");
const MONOREPO = path.resolve(MONO, "../../../..");

function load(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function gitShow(ref, file) {
  try {
    return JSON.parse(
      execSync(`git show ${ref}:${file}`, { cwd: MONOREPO, encoding: "utf8" }),
    );
  } catch {
    return null;
  }
}

const wiki = load(WIKI);
const local = fs.existsSync(MONO) ? load(MONO) : null;
const origin = gitShow("origin/master", "backend/src/DB/Schema/lists_lead.json");

console.log(`wiki: ${wiki.length}, local mono: ${local?.length ?? "n/a"}, origin/master: ${origin?.length ?? "n/a"}`);

function diffSets(a, b, labelA, labelB) {
  const mapB = new Map(b.map((h) => [h.key, h]));
  const out = [];
  for (const h of a) {
    const o = mapB.get(h.key);
    if (!o) out.push(`only in ${labelA}: ${h.key}`);
    else if (JSON.stringify(h) !== JSON.stringify(o)) {
      const fields = [];
      for (const k of new Set([...Object.keys(h), ...Object.keys(o)])) {
        if (JSON.stringify(h[k]) !== JSON.stringify(o[k])) fields.push(`${k}: ${JSON.stringify(h[k])} → ${JSON.stringify(o[k])}`);
      }
      out.push(`${h.key}: ${fields.slice(0, 4).join("; ")}`);
    }
  }
  for (const h of b) {
    if (!a.find((x) => x.key === h.key)) out.push(`only in ${labelB}: ${h.key}`);
  }
  return out;
}

if (origin) {
  console.log("\n=== wiki vs origin/master ===");
  const d = diffSets(wiki, origin, "wiki", "origin");
  console.log(d.length ? d.join("\n") : "identical");
}

if (local) {
  console.log("\n=== wiki vs local mono ===");
  const d = diffSets(wiki, local, "wiki", "local");
  console.log(d.length ? d.join("\n") : "identical");

  if (origin) {
    console.log("\n=== local mono vs origin/master ===");
    const d2 = diffSets(local, origin, "local", "origin");
    console.log(d2.length ? d2.join("\n") : "identical");
  }
}
