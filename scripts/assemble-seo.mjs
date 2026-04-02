#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Read partial JSON files and merge
const parts = [];
for (const f of fs.readdirSync(path.join(ROOT, "data", "seo-parts"))) {
  if (f.endsWith(".json")) {
    parts.push(JSON.parse(fs.readFileSync(path.join(ROOT, "data", "seo-parts", f), "utf8")));
  }
}

const result = { buildings: {}, heroes: {}, skills: {}, troops: {}, hubs: {} };
for (const p of parts) {
  for (const key of Object.keys(result)) {
    if (p[key]) Object.assign(result[key], p[key]);
  }
}

fs.writeFileSync(path.join(ROOT, "data", "seo-text.json"), JSON.stringify(result, null, 2), "utf8");
console.log("Merged", parts.length, "parts into data/seo-text.json");
let count = 0;
for (const cat of ["buildings", "heroes", "skills", "troops"]) count += Object.keys(result[cat]).length;
count += Object.keys(result.hubs).length;
console.log("Total entries:", count);
