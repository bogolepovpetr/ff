#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultMonoSchemaDir } from "./lib/sync-manifest.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(ROOT, "data", "source");
const IMG = path.join(ROOT, "public", "img");
const MONO = process.env.MONOREPO_SCHEMA ?? defaultMonoSchemaDir();
const MONO_IMG = path.resolve(MONO, "../../../../frontend/src/assets/img");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function stripResourceSuffix(key) {
  return key.replace(/_\d+$/, "");
}

function exists(rel) {
  return fs.existsSync(path.join(IMG, rel));
}

function findMono(relPaths) {
  for (const rel of relPaths) {
    const abs = path.join(MONO_IMG, rel);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function copy(rel, src) {
  const dest = path.join(IMG, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return rel;
}

function syncBuilding(key) {
  const rel = `_frog/buildings/${stripResourceSuffix(key)}.png`;
  if (exists(rel)) return null;
  const src = findMono([`_frog/buildings/${stripResourceSuffix(key)}.png`]);
  return src ? copy(rel, src) : rel;
}

function syncHero(key) {
  const rel = `leads/${key}.png`;
  if (exists(rel)) return null;
  const src = findMono([`leads/${key}.png`]);
  return src ? copy(rel, src) : rel;
}

function syncTroop(key) {
  const rel = `troops/${key}.png`;
  if (exists(rel)) return null;
  const src = findMono([`troops/${key}.png`]);
  return src ? copy(rel, src) : rel;
}

function syncSkill(key) {
  if (exists(`skills/${key}.jpg`) || exists(`skills/${key}.png`)) return null;
  const src = findMono([`skills/${key}.jpg`, `skills/${key}.png`]);
  if (!src) return `skills/${key}.jpg`;
  const ext = path.extname(src);
  return copy(`skills/${key}${ext}`, src);
}

const copied = [];
const missing = [];

for (const b of readJson(path.join(SOURCE, "lists_buildings.json"))) {
  const r = syncBuilding(b.key);
  if (!r) continue;
  if (exists(r)) copied.push(r);
  else missing.push(`building:${b.key}`);
}
for (const h of readJson(path.join(SOURCE, "lists_leads.json"))) {
  const r = syncHero(h.key);
  if (!r) continue;
  if (exists(r)) copied.push(r);
  else missing.push(`hero:${h.key}`);
}
for (const t of readJson(path.join(SOURCE, "lists_troops.json"))) {
  const r = syncTroop(t.key);
  if (!r) continue;
  if (exists(r)) copied.push(r);
  else missing.push(`troop:${t.key}`);
}
for (const s of readJson(path.join(SOURCE, "lists_skills.json"))) {
  const r = syncSkill(s.key);
  if (!r) continue;
  if (exists(r) || exists(`skills/${s.key}.png`)) copied.push(r);
  else missing.push(`skill:${s.key}`);
}

console.log(`Copied ${copied.length} images`);
for (const c of copied) console.log(`  + ${c}`);
if (missing.length) {
  console.log(`Still missing ${missing.length}:`);
  for (const m of missing.slice(0, 20)) console.log(`  - ${m}`);
  process.exit(1);
}
