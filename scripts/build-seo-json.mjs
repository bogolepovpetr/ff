#!/usr/bin/env node
// Merges the 4 SEO content blocks into data/seo-text.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load entity data to get keys for validation
const buildings = JSON.parse(fs.readFileSync(path.join(ROOT, "data/source/lists_buildings.json"), "utf8"));
const leads = JSON.parse(fs.readFileSync(path.join(ROOT, "data/source/lists_leads.json"), "utf8"));
const skills = JSON.parse(fs.readFileSync(path.join(ROOT, "data/source/lists_skills.json"), "utf8"));
const troops = JSON.parse(fs.readFileSync(path.join(ROOT, "data/source/lists_troops.json"), "utf8"));

const EXCLUDED_RACES = new Set(["seal", "troll", "man"]);

// Build troop group keys (building_tier)
const troopGroups = new Map();
for (const t of troops) {
  if (EXCLUDED_RACES.has(t.race)) continue;
  const gk = `${t.building}_${t.tier}`;
  if (!troopGroups.has(gk)) troopGroups.set(gk, t.title);
}

console.log(`Buildings: ${buildings.length}`);
console.log(`Heroes: ${leads.length}`);
console.log(`Skills: ${skills.length}`);
console.log(`Troop groups: ${troopGroups.size}`);

// If seo-text.json already exists, load it as base
const outPath = path.join(ROOT, "data", "seo-text.json");
let result = { buildings: {}, heroes: {}, skills: {}, troops: {}, hubs: {} };
if (fs.existsSync(outPath)) {
  result = JSON.parse(fs.readFileSync(outPath, "utf8"));
}

// Helper to generate fallback entries for missing keys
function fallbackEntry(title, category) {
  return {
    en: {
      loreQuote: `${title} plays a vital role in your kingdom's growth. Master it to gain the upper hand against your rivals.`,
      seoDescription: `${title} guide for FOMO Fighters. Full stats, costs, and progression details for this ${category} in the 4X mobile strategy game.`
    },
    ru: {
      loreQuote: `${title} играет важную роль в развитии вашего королевства. Освойте его, чтобы получить преимущество над соперниками.`,
      seoDescription: `Гайд по ${title} в FOMO Fighters. Полная информация о характеристиках, стоимости и прогрессии в мобильной 4X-стратегии.`
    }
  };
}

// Verify all entity keys are present, add fallbacks for missing ones
for (const b of buildings) {
  if (!result.buildings[b.key]) {
    console.log(`  MISSING building: ${b.key} — adding fallback`);
    result.buildings[b.key] = fallbackEntry(b.title, "building");
  }
}
for (const h of leads) {
  if (!result.heroes[h.key]) {
    console.log(`  MISSING hero: ${h.key} — adding fallback`);
    result.heroes[h.key] = fallbackEntry(h.title, "hero");
  }
}
for (const s of skills) {
  if (!result.skills[s.key]) {
    console.log(`  MISSING skill: ${s.key} — adding fallback`);
    result.skills[s.key] = fallbackEntry(s.title, "skill");
  }
}
for (const [gk, title] of troopGroups) {
  if (!result.troops[gk]) {
    console.log(`  MISSING troop: ${gk} — adding fallback`);
    result.troops[gk] = fallbackEntry(title, "troop");
  }
}

// Count totals
let totalStrings = 0;
for (const cat of ["buildings", "heroes", "skills", "troops"]) {
  for (const entry of Object.values(result[cat])) {
    totalStrings += 4; // en.loreQuote, en.seoDescription, ru.loreQuote, ru.seoDescription
  }
}
for (const entry of Object.values(result.hubs)) {
  totalStrings += 2; // en.seoDescription, ru.seoDescription
}

console.log(`\nTotal strings: ${totalStrings}`);
console.log(`Writing to ${outPath}`);

fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log("Done!");
