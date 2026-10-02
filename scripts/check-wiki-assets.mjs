#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { SYNC_FROM_MONO, RENAME_TO_WIKI, defaultMonoSchemaDir } from "./lib/sync-manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data", "source");
const IMG = path.join(ROOT, "public", "img");
const MONO = process.env.MONOREPO_SCHEMA ?? defaultMonoSchemaDir();
const MONO_IMG = path.resolve(MONO, "../../../../frontend/src/assets/img");

function hashFile(p) {
  return createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function stripResourceSuffix(key) {
  return key.replace(/_\d+$/, "");
}

function exists(rel) {
  return fs.existsSync(path.join(IMG, rel));
}

function monoImgCandidates(kind, key) {
  const base = stripResourceSuffix(key);
  if (kind === "building") {
    return [
      path.join(MONO_IMG, "_frog/buildings", `${base}.png`),
      path.join(MONO_IMG, "buildings", `${base}.png`),
    ];
  }
  if (kind === "hero") return [path.join(MONO_IMG, "leads", `${key}.png`)];
  if (kind === "troop") return [path.join(MONO_IMG, "troops", `${key}.png`)];
  if (kind === "skill") {
    return [
      path.join(MONO_IMG, "skills", `${key}.jpg`),
      path.join(MONO_IMG, "skills", `${key}.png`),
    ];
  }
  return [];
}

function copyIfMissing(kind, key) {
  const rel =
    kind === "building"
      ? `_frog/buildings/${stripResourceSuffix(key)}.png`
      : kind === "hero"
        ? `leads/${key}.png`
        : kind === "troop"
          ? `troops/${key}.png`
          : `skills/${key}.jpg`;
  if (exists(rel)) return null;
  for (const src of monoImgCandidates(kind, key)) {
    if (!fs.existsSync(src)) continue;
    const dest = path.join(IMG, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return rel;
  }
  return rel;
}

console.log("=== Data sync vs monorepo ===");
let dataOk = true;
for (const wikiFile of SYNC_FROM_MONO) {
  const monoFile = Object.entries(RENAME_TO_WIKI).find(([, v]) => v === wikiFile)?.[0] ?? wikiFile;
  const wikiPath = path.join(SOURCE, wikiFile);
  const monoPath = path.join(MONO, monoFile);
  if (!fs.existsSync(wikiPath)) {
    console.log(`MISSING wiki: ${wikiFile}`);
    dataOk = false;
    continue;
  }
  if (!fs.existsSync(monoPath)) {
    console.log(`MISSING mono: ${monoFile}`);
    dataOk = false;
    continue;
  }
  const wh = hashFile(wikiPath);
  const mh = hashFile(monoPath);
  if (wh !== mh) {
    console.log(`DIFF: ${wikiFile}`);
    dataOk = false;
  }
}
console.log(dataOk ? "All synced JSON files match monorepo." : "Some JSON files differ — run npm run sync:mono");

console.log("\n=== Image keys ===");
const buildings = readJson(path.join(SOURCE, "lists_buildings.json"));
const heroes = readJson(path.join(SOURCE, "lists_leads.json"));
const troops = readJson(path.join(SOURCE, "lists_troops.json"));
const skills = readJson(path.join(SOURCE, "lists_skills.json"));

const missing = { building: [], hero: [], troop: [], skill: [] };
const copied = [];

for (const b of buildings) {
  const rel = `_frog/buildings/${stripResourceSuffix(b.key)}.png`;
  if (!exists(rel)) {
    const r = copyIfMissing("building", b.key);
    if (r && exists(r)) copied.push(r);
    else missing.building.push(b.key);
  }
}
for (const h of heroes) {
  const rel = `leads/${h.key}.png`;
  if (!exists(rel)) {
    const r = copyIfMissing("hero", h.key);
    if (r && exists(r)) copied.push(r);
    else missing.hero.push(h.key);
  }
}
for (const t of troops) {
  const rel = `troops/${t.key}.png`;
  if (!exists(rel)) {
    const r = copyIfMissing("troop", t.key);
    if (r && exists(r)) copied.push(r);
    else missing.troop.push(t.key);
  }
}
for (const s of skills) {
  const relJ = `skills/${s.key}.jpg`;
  const relP = `skills/${s.key}.png`;
  if (!exists(relJ) && !exists(relP)) {
    const r = copyIfMissing("skill", s.key);
    if (r && (exists(relJ) || exists(relP))) copied.push(r);
    else missing.skill.push(s.key);
  }
}

if (copied.length) {
  console.log(`Copied ${copied.length} images from monorepo:`);
  for (const c of copied.slice(0, 20)) console.log(`  + ${c}`);
  if (copied.length > 20) console.log(`  ... and ${copied.length - 20} more`);
}

let imgOk = true;
for (const [kind, keys] of Object.entries(missing)) {
  if (keys.length === 0) continue;
  imgOk = false;
  console.log(`Missing ${kind} images (${keys.length}): ${keys.slice(0, 15).join(", ")}${keys.length > 15 ? "..." : ""}`);
}
if (imgOk && copied.length === 0) console.log("All entity image keys have files in public/img/");

process.exit(dataOk && imgOk ? 0 : 1);
