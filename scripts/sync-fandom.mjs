#!/usr/bin/env node
/**
 * Sync FomoFighters game data to Fandom wiki.
 *
 * Usage:
 *   node scripts/sync-fandom.mjs              # push pages + images
 *   SKIP_IMAGES=1 node scripts/sync-fandom.mjs  # pages only
 *
 * Environment variables (set in .env.fandom or export):
 *   FANDOM_WIKI     – wiki subdomain, e.g. "fomofighters"
 *   FANDOM_USER     – bot username
 *   FANDOM_PASS     – bot password from Special:BotPasswords
 *   DRY_RUN         – "1" to only print pages without pushing
 *   SKIP_EXISTING   – "1" to skip pages that already exist
 *   SKIP_IMAGES     – "1" to skip image uploads
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "data", "source");
const IMG = path.join(ROOT, "public", "img");

const envFile = path.join(ROOT, ".env.fandom");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const WIKI = process.env.FANDOM_WIKI || "fomofighters";
const USER = process.env.FANDOM_USER;
const PASS = process.env.FANDOM_PASS;
const DRY = process.env.DRY_RUN === "1";
const SKIP_EXISTING = process.env.SKIP_EXISTING === "1";
const SKIP_IMAGES = process.env.SKIP_IMAGES === "1";
const API = `https://${WIKI}.fandom.com/api.php`;

if (!DRY && (!USER || !PASS)) {
  console.error("ERROR: Set FANDOM_USER and FANDOM_PASS (or DRY_RUN=1)");
  process.exit(1);
}

// ─── JSON loaders ───────────────────────────────────────────────────────────
function load(name) {
  return JSON.parse(fs.readFileSync(path.join(SOURCE, name), "utf8"));
}

const EXCLUDED_RACES = new Set(["seal", "troll", "man"]);

const buildings = load("lists_buildings.json");
const allTroops = load("lists_troops.json").filter(
  (t) => !t.race || !EXCLUDED_RACES.has(t.race),
);
const skills = load("lists_skills.json");
const leads = load("lists_leads.json");
const leadTiers = load("lists_lead_tiers.json");
const leadExp = load("lists_lead_exp.json");
const clanLevels = load("lists_clan.json");
const clanRanks = load("lists_clan_ranks.json");
const clanRewards = load("lists_clan_rewards.json");
const referralData = JSON.parse(fs.readFileSync(path.join(SOURCE, "lists_referral.json"), "utf8"));
const warData = JSON.parse(fs.readFileSync(path.join(SOURCE, "lists_war.json"), "utf8"));
const questsDaily = load("lists_quests_story_daily.json");
const questsDailyRewards = load("lists_quests_story_daily_rewards.json");
const questsMain = load("lists_quests_main.json");
const questsSide = load("lists_quests_side.json");
const questsBot = load("lists_quests_bot.json");
const version = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data", "version.json"), "utf8"),
);

// ─── MediaWiki API ──────────────────────────────────────────────────────────
let cookies = {};
function cookieHeader() {
  return Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
}
function parseCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const [k, v] = pair.split("=");
    if (k && v !== undefined) cookies[k.trim()] = v.trim();
  }
}
async function mwGet(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ format: "json", ...params }))
    url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Cookie: cookieHeader() } });
  parseCookies(res);
  return res.json();
}
async function mwPost(params) {
  const body = new URLSearchParams({ format: "json", ...params });
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookieHeader() },
    body,
  });
  parseCookies(res);
  return res.json();
}
async function login() {
  const tok = await mwGet({ action: "query", meta: "tokens", type: "login" });
  const res = await mwPost({
    action: "login", lgname: USER, lgpassword: PASS, lgtoken: tok.query.tokens.logintoken,
  });
  if (res.login?.result !== "Success") {
    console.error("Login failed:", JSON.stringify(res.login));
    process.exit(1);
  }
  console.log(`Logged in as ${res.login.lgusername}`);
}
let csrfToken = null;
async function getCsrf() {
  if (csrfToken) return csrfToken;
  const tok = await mwGet({ action: "query", meta: "tokens" });
  csrfToken = tok.query.tokens.csrftoken;
  return csrfToken;
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function pageExists(title) {
  const res = await mwGet({ action: "query", titles: title, prop: "revisions", rvprop: "size" });
  const pages = res.query?.pages ?? {};
  return !Object.keys(pages).some((id) => id === "-1");
}

async function editPage(title, text, summary, attempt = 1) {
  if (DRY) { console.log(`[DRY] ${title} (${text.length} chars)`); return; }
  try {
    const token = await getCsrf();
    const res = await mwPost({ action: "edit", title, text, summary, bot: "true", token });
    if (res.edit?.result === "Success") {
      console.log(`  OK  ${title}`);
    } else if (res.error?.code === "ratelimited" && attempt <= 5) {
      const wait = attempt * 15000;
      console.log(`  RATE-LIMITED on ${title}, retrying in ${wait / 1000}s...`);
      await sleep(wait);
      return editPage(title, text, summary, attempt + 1);
    } else {
      console.error(`  FAIL ${title}:`, JSON.stringify(res));
    }
  } catch (err) {
    if (attempt <= 5) {
      const wait = attempt * 10000;
      console.log(`  NET-ERR on ${title} (attempt ${attempt}): ${err.message}. Retrying in ${wait / 1000}s...`);
      await sleep(wait);
      csrfToken = null;
      return editPage(title, text, summary, attempt + 1);
    }
    console.error(`  FAIL ${title}: network error after ${attempt} attempts:`, err.message);
  }
  await sleep(8000);
}

// ─── Image upload ───────────────────────────────────────────────────────────
async function uploadImage(filename, filePath, attempt = 1) {
  if (DRY) { console.log(`[DRY-IMG] ${filename}`); return; }
  if (!fs.existsSync(filePath)) { console.log(`  SKIP (not found) ${filePath}`); return; }

  try {
    const token = await getCsrf();
    const form = new FormData();
    form.append("action", "upload");
    form.append("filename", filename);
    form.append("format", "json");
    form.append("token", token);
    form.append("ignorewarnings", "true");
    form.append("comment", "Auto-upload from game data");

    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1);
    const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
    form.append("file", new Blob([fileData], { type: mime }), filename);

    const res = await fetch(API, {
      method: "POST",
      headers: { Cookie: cookieHeader() },
      body: form,
    });
    parseCookies(res);
    const json = await res.json();

    if (json.upload?.result === "Success") {
      console.log(`  IMG OK  ${filename}`);
    } else if (json.upload?.result === "Warning") {
      console.log(`  IMG WARN ${filename}: ${JSON.stringify(json.upload.warnings)}`);
    } else if (json.error?.code === "ratelimited" && attempt <= 5) {
      const wait = attempt * 15000;
      console.log(`  IMG RATE-LIMITED ${filename}, retrying in ${wait / 1000}s...`);
      await sleep(wait);
      return uploadImage(filename, filePath, attempt + 1);
    } else {
      console.error(`  IMG FAIL ${filename}:`, JSON.stringify(json));
    }
  } catch (err) {
    if (attempt <= 5) {
      const wait = attempt * 10000;
      console.log(`  IMG NET-ERR ${filename} (attempt ${attempt}): ${err.message}. Retrying in ${wait / 1000}s...`);
      await sleep(wait);
      csrfToken = null;
      return uploadImage(filename, filePath, attempt + 1);
    }
    console.error(`  IMG FAIL ${filename}: network error after ${attempt} attempts:`, err.message);
  }
  await sleep(5000);
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
function fmtTime(s) {
  if (!s) return "\u2014";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), sec = s % 60;
  if (m < 60) return sec ? `${m}m ${sec}s` : `${m}m`;
  const h = Math.floor(m / 60), rm = m % 60;
  if (h < 24) return rm ? `${h}h ${rm}m` : `${h}h`;
  const d = Math.floor(h / 24), rh = h % 24;
  return rh ? `${d}d ${rh}h` : `${d}d`;
}
function fmtCost(v) { return v ? v.toLocaleString("en-US") : "\u2014"; }
function costStr(obj) {
  const p = [];
  if (obj.priceFood) p.push(`{{Res|food}} ${fmtCost(obj.priceFood)}`);
  if (obj.priceWood) p.push(`{{Res|wood}} ${fmtCost(obj.priceWood)}`);
  if (obj.priceStone) p.push(`{{Res|stone}} ${fmtCost(obj.priceStone)}`);
  if (obj.priceGem) p.push(`{{Res|gem}} ${fmtCost(obj.priceGem)}`);
  return p.join(" ") || "\u2014";
}
function reqStr(reqs) {
  if (!reqs || !Object.keys(reqs).length) return "\u2014";
  return Object.entries(reqs).map(([k, v]) => `[[${titleCase(k)}]] Lv.${v}`).join(", ");
}
function titleCase(s) { return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function humanizeBonus(key) { return key.replace(/^bonus/, "").replace(/([A-Z])/g, " $1").trim(); }
function stripSuffix(key) { return key.replace(/_\d+$/, ""); }

const TIER_LABELS = { 1: "Common", 2: "Rare", 3: "Epic", 4: "Legend", 5: "Mythic" };
const TIER_COLORS = { 1: "#9ca3af", 2: "#22c55e", 3: "#8b5cf6", 4: "#f59e0b", 5: "#ef4444" };
const ROLE_LABELS = { castle: "Castle / Economy", def: "Defense", attack: "Attack", war: "War" };
const BUILDING_LABELS = {
  barracks: "Barracks", archery_range: "Archery Range", stable: "Stable",
  siege_workshop: "Siege Workshop", scout_camp: "Scout Camp",
};

// ─── Quest description helpers ──────────────────────────────────────────────
const QB = {
  castle: "Castle", barracks: "Barracks", archery_range: "Archery Range",
  stable: "Stable", siege_workshop: "Siege Workshop", scout_camp: "Scout Camp",
  farm_1: "Farm", farm_2: "Farm", farm_3: "Farm",
  lumber_mill_1: "Lumber Mill", lumber_mill_2: "Lumber Mill", lumber_mill_3: "Lumber Mill",
  quarry_1: "Quarry", quarry_2: "Quarry", quarry_3: "Quarry",
  academy: "Academy", stash: "Stash", market: "Market", storage: "Storage",
};
const QR = { food: "Food", wood: "Wood", stone: "Stone", gem: "Gems" };
const QT = { oasis: "oasis", camp: "camps", people: "players" };
function qb(k) { return QB[k] || titleCase(k); }
function qr(k) { return QR[k] || k; }
function qt(k) { return QT[k] || k; }

function describeDaily(q) {
  const c = fmtCost(q.count);
  switch (q.type) {
    case "resourceClaim": return `Collect ${c} ${qr(q.data)}`;
    case "trainBuilding": return `Train ${c} troops in ${qb(q.data)}`;
    case "resourceLoot": return `Loot ${c} ${qr(q.data)}`;
    case "attack": return `Attack ${c} ${qt(q.data)}`;
    case "pvp": return `Earn ${c} kill points`;
    case "skills": return `Complete ${q.count} research`;
    case "buildings": return `Complete ${q.count} building upgrade`;
    case "clan": return `Donate ${c} to clan`;
    case "resourceBuy": return `Buy ${c} ${qr(q.data)} at market`;
    default: return q.key;
  }
}
function describeMain(q) {
  const c = fmtCost(q.count);
  switch (q.type) {
    case "build": return `Upgrade [[${qb(q.data)}]] to Lv.${q.count}`;
    case "trainTotal": return `Train ${c} troops`;
    case "attack": return `Attack ${c} ${qt(q.data)}`;
    case "power": return `Reach ${c} power`;
    case "resourceBuy": return `Buy ${c} ${qr(q.data)} at [[Market]]`;
    case "research": return `Research [[${qb(q.data)}]] to Lv.${q.count}`;
    case "clan": return `Donate ${c} to clan`;
    default: return q.key;
  }
}
function describeSide(q) {
  switch (q.type) {
    case "build": return `Upgrade ${qb(q.data)}`;
    case "trainBuilding": return `Train troops in ${qb(q.data)}`;
    case "resourceClaim": return `Collect ${qr(q.data)}`;
    case "resourceBuy": return `Buy ${qr(q.data)} at market`;
    case "resourceLoot": return `Loot ${qr(q.data)}`;
    case "attack": return `Attack ${qt(q.data)}`;
    case "killPoints": return "Earn kill points";
    case "research": return `Research ${qb(q.data)}`;
    case "clan": return "Donate to clan";
    default: return q.key;
  }
}
function rewardStr(obj) {
  const p = [];
  if (obj.food) p.push(`{{Res|food}} ${fmtCost(obj.food)}`);
  if (obj.wood) p.push(`{{Res|wood}} ${fmtCost(obj.wood)}`);
  if (obj.stone) p.push(`{{Res|stone}} ${fmtCost(obj.stone)}`);
  if (obj.gem) p.push(`{{Res|gem}} ${fmtCost(obj.gem)}`);
  return p.join(" ") || "\u2014";
}

// ─── Image file names on Fandom ─────────────────────────────────────────────
function buildingImg(key) { return `Building_${stripSuffix(key)}.png`; }
function heroImg(key) { return `Hero_${key}.png`; }
function skillImg(key) { return `Skill_${key}.jpg`; }
function troopImg(key) { return `Troop_${key}.png`; }
function resIcon(name) { return `Icon_${name}.png`; }

// ─── Templates & CSS ────────────────────────────────────────────────────────

function resTemplateWikitext() {
  return `<includeonly>[[File:Icon_{{{1}}}.png|16px|link=]]</includeonly><noinclude>
Resource icon template. Usage: <code>{{Res|food}}</code>, <code>{{Res|wood}}</code>, <code>{{Res|stone}}</code>, <code>{{Res|gem}}</code>.
[[Category:Templates]]
</noinclude>`;
}

function infoboxBuildingTemplate() {
  return `<includeonly><infobox>
<title source="name"><default>Unknown Building</default></title>
<image source="image"><default>Building_{{{key|unknown}}}.png</default></image>
<data source="type"><label>Type</label></data>
<data source="max_level"><label>Max Level</label></data>
<data source="max_power"><label>Max Power</label></data>
</infobox></includeonly><noinclude>Portable Infobox for buildings. [[Category:Templates]]</noinclude>`;
}

function infoboxHeroTemplate() {
  return `<includeonly><infobox>
<title source="name"><default>Unknown Hero</default></title>
<image source="image"><default>Hero_{{{key|unknown}}}.png</default></image>
<data source="tier"><label>Tier</label></data>
<data source="aspect"><label>Aspect</label></data>
<data source="role"><label>Role</label></data>
<data source="price_gem"><label>Gem Cost</label></data>
<data source="card_count"><label>Cards Needed</label></data>
</infobox></includeonly><noinclude>Portable Infobox for heroes. [[Category:Templates]]</noinclude>`;
}

function infoboxTroopTemplate() {
  return `<includeonly><infobox>
<title source="name"><default>Unknown Troop</default></title>
<data source="building"><label>Building</label></data>
<data source="tier"><label>Tier</label></data>
<data source="power"><label>Power</label></data>
</infobox></includeonly><noinclude>Portable Infobox for troops. [[Category:Templates]]</noinclude>`;
}

function infoboxSkillTemplate() {
  return `<includeonly><infobox>
<title source="name"><default>Unknown Skill</default></title>
<image source="image"><default>Skill_{{{key|unknown}}}.jpg</default></image>
<data source="type"><label>Type</label></data>
<data source="tier"><label>Tier</label></data>
<data source="max_level"><label>Max Level</label></data>
</infobox></includeonly><noinclude>Portable Infobox for skills. [[Category:Templates]]</noinclude>`;
}

function commonCss() {
  return `/* FomoFighters Wiki Custom Styles */

/* Portable Infobox theming */
.portable-infobox {
  border: 2px solid #d4a853 !important;
  border-radius: 10px !important;
  overflow: hidden;
  background: linear-gradient(135deg, #1e1b2e 0%, #2a2545 100%) !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.portable-infobox .pi-title {
  background: transparent !important;
  color: #fbbf24 !important;
  font-size: 20px !important;
  font-weight: 700 !important;
  text-align: center;
  padding: 12px 16px 6px !important;
}
.portable-infobox .pi-image img {
  border-radius: 8px;
}
.portable-infobox .pi-image {
  display: flex;
  justify-content: center;
  padding: 12px !important;
  background: rgba(255,255,255,0.04);
}
.portable-infobox .pi-data {
  border-color: rgba(255,255,255,0.08) !important;
}
.portable-infobox .pi-data-label {
  color: #a8a4b5 !important;
  font-weight: 600 !important;
  font-size: 12px !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.portable-infobox .pi-data-value {
  color: #f0eef5 !important;
  font-weight: 500 !important;
}

/* Wikitable styling */
.wikitable {
  border-radius: 6px;
  overflow: hidden;
}
.wikitable th {
  background: #1e1b2e !important;
  color: #fbbf24 !important;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 10px 12px !important;
  border-color: #2a2545 !important;
}
.wikitable td {
  padding: 8px 12px !important;
  font-size: 13px;
}
.wikitable tr:nth-child(even) td {
  background: #f9fafb;
}

/* Page heading */
.page-header__title {
  color: #1e1b2e;
}

/* Hide category breadcrumbs on all pages */
.page-header__categories {
  display: none !important;
}

/* Fix nav card images to consistent size */
.ff-nav-card img {
  width: 32px !important;
  height: 32px !important;
  object-fit: contain;
}
`;
}

// ─── Wikitext generators ────────────────────────────────────────────────────

function buildingWikitext(b) {
  const maxLvl = b.levels[b.levels.length - 1];
  let wt = `{{Infobox building|key=${stripSuffix(b.key)}|name=${b.title}|image=Building_${stripSuffix(b.key)}.png|type=${b.type || "\u2014"}|max_level=${b.levels.length}|max_power=${maxLvl?.power ?? "\u2014"}}}\n\n`;
  wt += `'''${b.title}''' is a${b.type ? ` ${b.type}` : ""} building in FomoFighters.\n`;
  if (b.desc) wt += `\n''${b.desc}''\n`;
  wt += `\n== Progression ==\n`;
  wt += `{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Level !! Cost !! Time !! Power !! Requirements\n`;
  for (const lvl of b.levels) {
    wt += `|-\n| ${lvl.level} || ${costStr(lvl)} || ${fmtTime(lvl.time)} || ${lvl.power ?? "\u2014"} || ${reqStr(lvl.requiredBuildings)}\n`;
  }
  wt += `|}\n`;
  wt += `\n[[Category:Buildings]]\n`;
  if (b.type) wt += `[[Category:${b.type} Buildings]]\n`;
  return wt;
}

function troopGroupWikitext(buildingKey, tier, troops) {
  const bLabel = BUILDING_LABELS[buildingKey] || titleCase(buildingKey);
  const sample = troops[0];
  let wt = `{{Infobox troop|name=${sample.title}|building=${bLabel}|tier=${tier}|power=${sample.power ?? "\u2014"}}}\n\n`;
  wt += `'''${sample.title}''' is a Tier ${tier} troop trained in the [[${bLabel}]].\n\n`;
  if (sample.requiredSkills && Object.keys(sample.requiredSkills).length) {
    const sk = Object.keys(sample.requiredSkills)[0];
    wt += `Unlocked by researching [[${titleCase(sk)}]].\n\n`;
  }
  wt += `== Race Comparison ==\n`;
  wt += `{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Race !! Title !! ATK !! DEF !! Speed !! Load !! Power !! Time !! Cost\n`;
  for (const t of troops.sort((a, b) => (a.race ?? "").localeCompare(b.race ?? ""))) {
    const cost = [];
    if (t.priceFood) cost.push(`{{Res|food}} ${fmtCost(t.priceFood)}`);
    if (t.priceWood) cost.push(`{{Res|wood}} ${fmtCost(t.priceWood)}`);
    if (t.priceStone) cost.push(`{{Res|stone}} ${fmtCost(t.priceStone)}`);
    wt += `|-\n| ${titleCase(t.race ?? "\u2014")} || ${t.title} || ${t.atk ?? "\u2014"} || ${t.def ?? "\u2014"} || ${t.speed ?? "\u2014"} || ${t.load ?? "\u2014"} || ${t.power ?? "\u2014"} || ${fmtTime(t.time)} || ${cost.join(" ") || "\u2014"}\n`;
  }
  wt += `|}\n`;
  if (sample.requiredBuildings && Object.keys(sample.requiredBuildings).length) {
    wt += `\n== Requirements ==\n${reqStr(sample.requiredBuildings)}\n`;
  }
  wt += `\n[[Category:Troops]]\n[[Category:Tier ${tier}]]\n[[Category:${bLabel}]]\n`;
  return wt;
}

function troopsHubWikitext() {
  const BUILDING_ORDER = ["barracks", "archery_range", "stable", "siege_workshop", "scout_camp"];
  const byBuilding = new Map();
  for (const t of allTroops) {
    if (!byBuilding.has(t.building)) byBuilding.set(t.building, new Map());
    const tm = byBuilding.get(t.building);
    const tier = t.tier ?? 0;
    if (!tm.has(tier)) tm.set(tier, []);
    tm.get(tier).push(t);
  }

  let wt = `'''Troops''' are the military units of FomoFighters. Train them in various buildings to build your army.\n\n`;

  const orderedBuildings = BUILDING_ORDER.filter((b) => byBuilding.has(b));
  for (const bKey of orderedBuildings) {
    const tierMap = byBuilding.get(bKey);
    const bLabel = BUILDING_LABELS[bKey] || titleCase(bKey);
    wt += `== ${bLabel} ==\n`;
    wt += `{| class="wikitable" style="width:100%; text-align:center"\n`;
    wt += `|-\n! style="width:50px" | !! Name !! Tier !! ATK !! DEF !! Time !! Power !! Cost\n`;

    for (const tier of Array.from(tierMap.keys()).sort((a, b) => a - b)) {
      const troops = tierMap.get(tier);
      const sample = troops[0];
      const tierLabel = TIER_LABELS[tier] || `Tier ${tier}`;
      const tierColor = TIER_COLORS[tier] || "#6b7280";
      const cost = [];
      if (sample.priceFood) cost.push(`{{Res|food}} ${fmtCost(sample.priceFood)}`);
      if (sample.priceWood) cost.push(`{{Res|wood}} ${fmtCost(sample.priceWood)}`);
      if (sample.priceStone) cost.push(`{{Res|stone}} ${fmtCost(sample.priceStone)}`);
      wt += `|-\n`;
      wt += `| [[File:${troopImg(sample.key)}|40px]] `;
      wt += `|| '''[[${sample.title}]]''' `;
      wt += `|| style="color:${tierColor}; font-weight:bold" | ${tierLabel} `;
      wt += `|| ${sample.atk ?? "\u2014"} `;
      wt += `|| ${sample.def ?? "\u2014"} `;
      wt += `|| ${fmtTime(sample.time)} `;
      wt += `|| ${sample.power ?? "\u2014"} `;
      wt += `|| ${cost.join(" ") || "\u2014"}\n`;
    }
    wt += `|}\n\n`;
  }
  wt += `[[Category:Troops]]\n`;
  return wt;
}

function skillWikitext(s) {
  let wt = `{{Infobox skill|key=${s.key}|name=${s.title}|image=Skill_${s.key}.jpg|type=${s.type || "\u2014"}|tier=${s.tier ?? "\u2014"}|max_level=${s.levels.length}}}\n\n`;
  wt += `'''${s.title}''' is a${s.type ? ` ${s.type}` : ""} skill in FomoFighters.\n`;
  if (s.desc) wt += `\n''${s.desc}''\n`;

  const effectKeys = new Set();
  for (const lvl of s.levels) for (const k of Object.keys(lvl)) if (k.startsWith("bonus")) effectKeys.add(k);
  const effects = Array.from(effectKeys).sort();

  wt += `\n== Progression ==\n{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Level !! Cost !! Time !! Power`;
  for (const e of effects) wt += ` !! ${humanizeBonus(e)}`;
  wt += ` !! Requirements\n`;
  for (const lvl of s.levels) {
    const allReqs = [];
    if (lvl.requiredBuildings) allReqs.push(reqStr(lvl.requiredBuildings));
    if (lvl.requiredSkills) allReqs.push(reqStr(lvl.requiredSkills));
    if (lvl.requiredFriends) allReqs.push(`${lvl.requiredFriends} friends`);
    const reqFinal = allReqs.filter((r) => r !== "\u2014").join("; ") || "\u2014";
    wt += `|-\n| ${lvl.level} || ${costStr(lvl)} || ${fmtTime(lvl.time)} || ${lvl.power ?? "\u2014"}`;
    for (const e of effects) wt += ` || ${typeof lvl[e] === "number" ? lvl[e].toLocaleString("en-US") : "\u2014"}`;
    wt += ` || ${reqFinal}\n`;
  }
  wt += `|}\n\n[[Category:Skills]]\n`;
  if (s.type) wt += `[[Category:${s.type} Skills]]\n`;
  return wt;
}

function heroWikitext(h) {
  const tierLabel = TIER_LABELS[h.tier] || `Tier ${h.tier}`;
  const roleLabel = ROLE_LABELS[h.role] || titleCase(h.role ?? "Unknown");
  const tierInfo = leadTiers.find((t) => t.key === h.tier);
  const mult = tierInfo?.leadExpMultiplicator ?? 1;
  const bonusEntries = h.bonusPerLevel ? Object.entries(h.bonusPerLevel) : [];

  let wt = `{{Infobox hero|key=${h.key}|name=${h.title}|image=Hero_${h.key}.png|tier=${tierLabel}|tier_num=${h.tier}|aspect=${titleCase(h.aspect ?? "\u2014")}|role=${roleLabel}|price_gem=${h.priceGem ?? "\u2014"}|card_count=${h.cardCount ?? "\u2014"}}}\n\n`;
  wt += `'''${h.title}''' is a ${tierLabel} hero in FomoFighters. Max level: '''50'''.\n`;
  if (h.desc) wt += `\n''${h.desc}''\n`;

  if (h.blockedTimerInBuilding) {
    wt += `\n== Special ==\nWhen assigned, blocks timers in: ${h.blockedTimerInBuilding.split(",").map((b) => `[[${BUILDING_LABELS[b.trim()] || titleCase(b.trim())}]]`).join(", ")}\n`;
  }

  if (bonusEntries.length > 0) {
    wt += `\n== Bonuses per Level ==\n{| class="wikitable"\n|-\n! Bonus !! Per Level\n`;
    for (const [k, v] of bonusEntries) wt += `|-\n| ${humanizeBonus(k)} || +${v}\n`;
    wt += `|}\n`;
  }

  wt += `\n== Level Progression ==\n`;
  if (mult > 1) wt += `''EXP multiplier for ${tierLabel} tier: x${mult}''\n\n`;
  wt += `{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Level !! EXP`;
  for (const [k] of bonusEntries) wt += ` !! ${humanizeBonus(k)}`;
  wt += `\n`;
  for (const e of leadExp) {
    const actualExp = e.exp * mult;
    wt += `|-\n| ${e.level} || ${fmtCost(actualExp)}`;
    for (const [, v] of bonusEntries) {
      const total = +(v * e.level).toFixed(2);
      wt += ` || +${total % 1 === 0 ? total : total.toFixed(2).replace(/0+$/, "")}`;
    }
    wt += `\n`;
  }
  wt += `|}\n`;

  wt += `\n[[Category:Heroes]]\n[[Category:${tierLabel} Heroes]]\n[[Category:${titleCase(h.aspect ?? "Unknown")} Aspect]]\n`;
  return wt;
}

function mainPageWikitext() {
  let wt = `__NOTOC__\n`;

  // Banner
  wt += `{| style="width:100%; border:2px solid #d4a853; border-radius:12px; background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%); color:white; text-align:center; margin-bottom:16px;"\n`;
  wt += `|-\n`;
  wt += `| style="font-size:32px; font-weight:bold; color:#fbbf24; padding:16px 0 4px;" | FOMO Fighters Wiki\n`;
  wt += `|-\n`;
  wt += `| style="color:#d4d4d8; padding-bottom:16px;" | ''The comprehensive guide to FOMO Fighters \u2014 v${version.gameVersion}''\n`;
  wt += `|}\n\n`;

  // Two-column layout: main content left, sidebar right
  wt += `{| style="width:100%;"\n|-\n`;
  wt += `| style="vertical-align:top; width:75%; padding-right:20px;" |\n`;

  // Nav cards (all icons fixed to 32px)
  wt += `{| style="width:100%; text-align:center; margin-bottom:16px;"\n`;
  wt += `|-\n`;
  const cards = [
    { border: "#93c5fd", bg: "#dbeafe", icon: "Building_castle.png", label: "Buildings" },
    { border: "#fca5a5", bg: "#fee2e2", icon: "Building_barracks.png", label: "Troops" },
    { border: "#c4b5fd", bg: "#ede9fe", icon: "Building_academy.png", label: "Skills" },
    { border: "#fcd34d", bg: "#fef3c7", icon: "Hero_athena.png", label: "Heroes" },
    { border: "#34d399", bg: "#d1fae5", icon: "Icon_gem.png", label: "WAR" },
    { border: "#60a5fa", bg: "#dbeafe", icon: "Icon_gem.png", label: "Clans" },
    { border: "#f472b6", bg: "#fce7f3", icon: "Icon_gem.png", label: "Referral System" },
    { border: "#6ee7b7", bg: "#d1fae5", icon: "Icon_gem.png", label: "Quests" },
  ];
  for (const c of cards) {
    wt += `| style="width:20%; padding:6px;" |\n`;
    wt += `{| style="width:100%; border:2px solid ${c.border}; border-radius:10px; background:${c.bg};"\n|-\n`;
    wt += `| style="padding:12px; font-weight:bold; font-size:14px;" | [[File:${c.icon}|32px]] <br/> [[${c.label}]]\n|}\n`;
  }
  wt += `|}\n\n`;

  // Getting Started cards
  wt += `== Getting Started ==\n`;
  wt += `{| style="width:100%; border-spacing:10px;"\n`;
  wt += `|-\n`;

  const steps = [
    { n: 1, title: "Build Your Base", desc: "Upgrade your [[Castle]] and resource buildings to unlock mechanics and speed up progression.", link: "Buildings" },
    { n: 2, title: "Build an Army", desc: "Train troops and use them in activities\u2014PvE and clan wars are driven by army power.", link: "Troops" },
    { n: 3, title: "Upgrade Skills", desc: "The [[Academy]] unlocks tiers and grants economy/combat bonuses\u2014one of the biggest multipliers.", link: "Skills" },
    { n: 4, title: "Join a Clan", desc: "[[Clans]] add levels, ranks, rewards, and unlock [[Clan War|clan wars]] with $WAR.", link: "Clans" },
    { n: 5, title: "Invite Friends", desc: "[[Referral System|Referrals]] give you rewards for invites and rev share\u2014one of the best gem sources.", link: "Referral System" },
    { n: 6, title: "Earn WAR Points", desc: "The main seasonal goal is to accumulate [[$WAR|WAR]] through clan wars and take part in the buyback.", link: "WAR" },
  ];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    wt += `| style="width:50%; vertical-align:top; border:1px solid #e5e7eb; border-radius:10px; padding:16px; background:#fafafa;" |\n`;
    wt += `{| style="width:100%;"\n|-\n`;
    wt += `| style="width:36px; vertical-align:top;" |\n`;
    wt += `{| style="background:#fbbf24; color:white; border-radius:50%; width:28px; height:28px; text-align:center; font-weight:bold; line-height:28px;"\n|-\n| ${s.n}\n|}\n`;
    wt += `| style="vertical-align:top;" |\n`;
    wt += `'''${s.title}'''\n\n`;
    wt += `${s.desc}\n\n`;
    wt += `[[${s.link}|\u2192 ${s.link}]]\n|}\n`;
    if (i % 2 === 1 && i < steps.length - 1) wt += `|-\n`;
  }
  wt += `|}\n\n`;

  wt += `----\n''Data updated: ${version.dataUpdated} \u2014 Game version ${version.gameVersion}''\n\n`;

  // Right sidebar column: social links
  wt += `| style="vertical-align:top; width:25%;" |\n`;
  wt += `{| style="width:100%; border:2px solid #d4a853; border-radius:12px; background:#1e1b2e; color:white; text-align:center;"\n`;
  wt += `|-\n| style="padding:14px 12px 8px; font-size:16px; font-weight:bold; color:#fbbf24;" | Community\n`;
  wt += `|-\n| style="padding:8px 12px 14px;" |\n`;
  wt += `[https://t.me/fomofighters \u2708\uFE0F Telegram Channel]\n\n`;
  wt += `Join our community for news,<br/>guides, and game updates!\n`;
  wt += `|}\n`;

  wt += `|}\n`;

  wt += `[[Category:FomoFighters Wiki]]\n`;
  return wt;
}

function questsHubWikitext() {
  let wt = `'''Quests''' reward resources, gems, and items.\n\n`;
  wt += `* [[Daily Quests]] \u2014 Reset daily. Earn activity points.\n`;
  wt += `* [[Main Quests]] \u2014 Story progression tied to Castle upgrades.\n`;
  wt += `* [[Side Quests]] \u2014 Milestone-based goals.\n\n`;
  wt += `[[Category:Quests]]\n`;
  return wt;
}

function dailyQuestsWikitext() {
  let wt = `'''Daily Quests''' reset every day at 00:00 UTC.\n\n`;
  wt += `== Objectives ==\n{| class="wikitable sortable" style="width:100%; text-align:center"\n`;
  wt += `|-\n! Objective !! Points !! Reward\n`;
  for (const q of questsDaily)
    wt += `|-\n| style="text-align:left" | ${describeDaily(q)} || +${q.points} || ${rewardStr(q)}\n`;
  wt += `|}\n\n== Point Rewards ==\n{| class="wikitable" style="text-align:center"\n|-\n! Points !! Reward\n`;
  for (const r of questsDailyRewards) {
    const extra = r.box ? ` + ${titleCase(r.box.replace(/_/g, " "))}` : "";
    wt += `|-\n| ${r.points} || ${rewardStr(r)}${extra}\n`;
  }
  wt += `|}\n\n[[Category:Quests]]\n`;
  return wt;
}

function mainQuestsWikitext() {
  const sorted = [...questsMain].sort((a, b) => a.order - b.order);
  const chapters = new Map();
  for (const q of sorted) {
    let ch = 1;
    if (q.type === "build" && q.data === "castle") ch = q.count;
    else {
      const prev = sorted.filter((p) => p.order < q.order && p.type === "build" && p.data === "castle");
      ch = prev.length ? prev[prev.length - 1].count : 1;
    }
    if (!chapters.has(ch)) chapters.set(ch, []);
    chapters.get(ch).push(q);
  }
  let wt = `'''Main Quests''' are the story progression in FomoFighters.\n\n`;
  for (const [castle, quests] of chapters) {
    wt += `== Castle Level ${castle} ==\n{| class="wikitable" style="width:100%"\n|-\n! # !! Objective !! Reward\n`;
    for (let i = 0; i < quests.length; i++)
      wt += `|-\n| ${i + 1} || ${describeMain(quests[i])} || ${rewardStr(quests[i])}\n`;
    wt += `|}\n\n`;
  }
  wt += `[[Category:Quests]]\n`;
  return wt;
}

function sideQuestsWikitext() {
  let wt = `'''Side Quests''' are milestone-based objectives with increasing rewards.\n\n`;
  for (const sq of questsSide) {
    wt += `== ${describeSide(sq)} ==\n{| class="wikitable sortable" style="width:100%; text-align:center"\n`;
    wt += `|-\n! # !! Target !! Reward\n`;
    for (let i = 0; i < sq.counts.length; i++) {
      const rw = [];
      if (sq.food?.[i]) rw.push(`{{Res|food}} ${fmtCost(sq.food[i])}`);
      if (sq.wood?.[i]) rw.push(`{{Res|wood}} ${fmtCost(sq.wood[i])}`);
      if (sq.stone?.[i]) rw.push(`{{Res|stone}} ${fmtCost(sq.stone[i])}`);
      if (sq.gem?.[i]) rw.push(`{{Res|gem}} ${fmtCost(sq.gem[i])}`);
      wt += `|-\n| ${i + 1} || ${fmtCost(sq.counts[i])} || ${rw.join(" ") || "\u2014"}\n`;
    }
    wt += `|}\n\n`;
  }
  wt += `[[Category:Quests]]\n`;
  return wt;
}

// ─── Clans wikitext ─────────────────────────────────────────────────────────

function clansHubWikitext() {
  let wt = `'''Clans''' are player-run groups. Joining a clan unlocks clan wars, periodic resource rewards, and social features.\n\n`;
  wt += `* [[Clan Levels]] — Experience thresholds and member caps\n`;
  wt += `* [[Clan Ranks]] — Ranks and promotion thresholds\n`;
  wt += `* [[Clan Rewards]] — Periodic resource rewards by clan level\n`;
  wt += `* [[Clan War]] — Rules, rewards, and loss calculations\n\n`;
  wt += `== Quick Overview ==\n`;
  wt += `* Max clan level: '''${clanLevels.length}''' (from levels data) / rewards up to level '''${clanRewards.length}'''\n`;
  wt += `* Max members at top level: '''${clanLevels[clanLevels.length - 1]?.members ?? "?"}'''\n\n`;
  wt += `[[Category:Clans]]\n`;
  return wt;
}

function clanLevelsWikitext() {
  let wt = `'''Clan Levels''' determine the member cap and unlock higher [[Clan Rewards|rewards]].\n\n`;
  wt += `{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Level !! EXP Required !! Max Members\n`;
  for (const cl of clanLevels) {
    wt += `|-\n| ${cl.level} || ${fmtCost(cl.exp)} || ${cl.members}\n`;
  }
  wt += `|}\n\n[[Category:Clans]]\n`;
  return wt;
}

function clanRanksWikitext() {
  let wt = `'''Clan Ranks''' define authority and are based on donation points.\n\n`;
  wt += `{| class="wikitable" style="text-align:center"\n`;
  wt += `|-\n! Rank !! Threshold (Points)\n`;
  for (const r of clanRanks) {
    const threshold = r.isOwner || r.isDeputy ? "\u2014" : fmtCost(r.points);
    wt += `|-\n| '''${r.title}''' || ${threshold}\n`;
  }
  wt += `|}\n\n`;
  wt += `'''Founder''' and '''Deputy''' are assigned manually by the clan leader.\n\n`;
  wt += `[[Category:Clans]]\n`;
  return wt;
}

function clanRewardsWikitext() {
  let wt = `'''Clan Rewards''' are periodic resource gifts based on the clan's level.\n\n`;
  wt += `{| class="wikitable sortable" style="text-align:center"\n`;
  wt += `|-\n! Level !! Interval !! {{Res|food}} Food !! {{Res|wood}} Wood !! {{Res|stone}} Stone !! {{Res|gem}} Gems\n`;
  for (const r of clanRewards) {
    wt += `|-\n| ${r.level} || ${r.hours}h || ${r.food ? fmtCost(r.food) : "\u2014"} || ${r.wood ? fmtCost(r.wood) : "\u2014"} || ${r.stone ? fmtCost(r.stone) : "\u2014"} || ${r.gem ? fmtCost(r.gem) : "\u2014"}\n`;
  }
  wt += `|}\n\n[[Category:Clans]]\n`;
  return wt;
}

function clanWarWikitext() {
  let wt = `'''Clan War''' is the core competitive mode. Clans fight each other, and participants earn '''$WAR''' tokens.\n\n`;
  wt += `== Outcomes ==\n`;
  wt += `{| class="wikitable" style="text-align:center"\n`;
  wt += `|-\n! Outcome !! $WAR !! Stars !! EXP !! Chests\n`;
  wt += `|-\n| style="background:#d1fae5" | '''Win''' || Yes || Yes || Yes || Yes\n`;
  wt += `|-\n| style="background:#fee2e2" | '''Loss''' || Partial || \u2014 || Partial || \u2014\n`;
  wt += `|-\n| style="background:#fef3c7" | '''Surrender (<50%)''' || \u2014 || \u2014 || \u2014 || \u2014\n`;
  wt += `|}\n\n`;
  wt += `== Loss Calculation ==\n`;
  wt += `When your clan loses, your troops suffer casualties based on the power gap:\n`;
  wt += `* 20% base loss rate for the losing side\n`;
  wt += `* Troops in the [[Hospital]] can be healed\n`;
  wt += `* If you surrender before reaching 50% power, you forfeit all rewards\n\n`;
  wt += `For full information on $WAR tokens, see [[WAR]].\n\n`;
  wt += `[[Category:Clans]]\n[[Category:WAR]]\n`;
  return wt;
}

// ─── Referral wikitext ──────────────────────────────────────────────────────

function referralHubWikitext() {
  const inv = referralData.invite;
  const rev = referralData.revshare;
  let wt = `'''Referral System''' rewards players for inviting friends. There are two reward tracks:\n\n`;
  wt += `* [[Referral Gems|Gems for Friends]] — earn gems for each friend you invite\n`;
  wt += `* [[Referral Revshare|Revenue Share (USDT)]] — earn ${rev.share_percent}% of your friends' purchases\n\n`;
  wt += `== Gems for Friends ==\n`;
  wt += `Invite friends and earn up to '''${fmtCost(inv.max_per_friend_gems)} gems''' per friend (premium: up to ${fmtCost(inv.max_per_friend_gems * inv.premium_multiplier)}).\n\n`;
  wt += `${inv.requirement_en}\n\n`;
  wt += `== Revenue Share ==\n`;
  wt += `Earn '''${rev.share_percent}%''' of your friends' gem purchases as USDT. Minimum withdrawal: '''${rev.withdraw.min_usdt} USDT'''.\n\n`;
  wt += `[[Category:Referral]]\n`;
  return wt;
}

function referralGemsWikitext() {
  const inv = referralData.invite;
  let wt = `'''Gems for Friends''' — earn gems by inviting players to FomoFighters.\n\n`;
  wt += `${inv.requirement_en}\n\n`;
  wt += `== Reward Tiers ==\n`;
  wt += `{| class="wikitable" style="text-align:center"\n`;
  wt += `|-\n! Friends !! {{Res|gem}} per Friend !! {{Res|gem}} per Friend (Premium)\n`;
  for (const t of inv.tiers) {
    const range = t.to ? `${t.from}\u2013${t.to}` : `${t.from}+`;
    wt += `|-\n| ${range} || ${fmtCost(t.per_friend_gems)} || ${fmtCost(t.per_friend_gems_premium)}\n`;
  }
  wt += `|}\n\n`;
  wt += `Your invited friend also receives '''${fmtCost(inv.friend_reward_gems)} gems''' (premium: ${fmtCost(inv.friend_reward_gems_premium)}).\n\n`;
  wt += `[[Category:Referral]]\n`;
  return wt;
}

function referralRevshareWikitext() {
  const rev = referralData.revshare;
  let wt = `'''Revenue Share (USDT)''' — earn real money from your referrals' purchases.\n\n`;
  wt += `== How It Works ==\n`;
  wt += `* You receive '''${rev.share_percent}%''' of all gem purchases made by players you referred.\n`;
  wt += `* Minimum withdrawal: '''${rev.withdraw.min_usdt} USDT'''\n`;
  wt += `* Contact: <code>${rev.withdraw.support_contact}</code>\n\n`;
  wt += `${rev.withdraw.note_en}\n\n`;
  wt += `== Convert to In-Game Balance ==\n`;
  wt += `* Minimum: '''${rev.convert.min_stars} Stars'''\n`;
  wt += `* ${rev.convert.note_en}\n\n`;
  wt += `[[Category:Referral]]\n`;
  return wt;
}

// ─── WAR wikitext ───────────────────────────────────────────────────────────

function warPageWikitext() {
  const w = warData.war;
  let wt = `'''$WAR''' is the main seasonal goal of FomoFighters. Players earn $WAR tokens through [[Clan War|clan wars]] and exchange them for USDT during the buyback event.\n\n`;
  wt += `'''Current season: ${w.season.number}''' — ${w.season.pool_label_en}: '''${fmtCost(w.season.pool_usdt_current)} USDT'''\n\n`;

  wt += `== ${w.earn.title_en} ==\n`;
  for (const b of w.earn.bullets_en) wt += `* ${b}\n`;

  wt += `\n== ${w.buyback.title_en} ==\n`;
  for (const b of w.buyback.rules_en) wt += `* ${b}\n`;
  wt += `\n=== Timeline ===\n`;
  wt += `{| class="wikitable"\n|-\n! Event !! Date (UTC)\n`;
  for (const t of w.buyback.timeline_utc0) {
    const d = new Date(t.at);
    const dateStr = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
    wt += `|-\n| ${t.label_en} || ${dateStr}\n`;
  }
  wt += `|}\n`;

  wt += `\n=== Buyback Fund ===\n`;
  for (const b of w.buyback.fund_en) wt += `* ${b}\n`;

  wt += `\n== ${w.min_threshold.title_en} ==\n`;
  for (const b of w.min_threshold.bullets_en) wt += `* ${b}\n`;

  wt += `\n== ${w.seasons.title_en} ==\n`;
  for (const b of w.seasons.bullets_en) wt += `* ${b}\n`;

  wt += `\n== ${w.withdraw_usdt.title_en} ==\n`;
  for (const b of w.withdraw_usdt.bullets_en) wt += `* ${b}\n`;
  wt += `\n{| class="wikitable"\n|-\n! Parameter !! Value\n`;
  wt += `|-\n| Min balance || ${w.withdraw_usdt.constraints.min_balance_usdt} USDT\n`;
  wt += `|-\n| Max network fee || ${w.withdraw_usdt.constraints.network_fee_usdt_max} USDT\n`;
  wt += `|-\n| Est. payout date || ${w.withdraw_usdt.constraints.payout_date_utc0}\n`;
  wt += `|}\n`;

  wt += `\n== ${w.important.title_en} ==\n`;
  for (const b of w.important.bullets_en) wt += `* ${b}\n`;

  wt += `\n[[Category:WAR]]\n`;
  return wt;
}

// ─── Collect images to upload ───────────────────────────────────────────────

function collectImages() {
  const imgs = [];

  for (const res of ["food", "wood", "stone", "gem"]) {
    const p = path.join(IMG, "icon", `${res}.png`);
    if (fs.existsSync(p)) imgs.push({ name: resIcon(res), path: p });
  }

  const seenBuildings = new Set();
  for (const b of buildings) {
    const base = stripSuffix(b.key);
    if (seenBuildings.has(base)) continue;
    seenBuildings.add(base);
    const p = path.join(IMG, "_frog", "buildings", `${base}.png`);
    if (fs.existsSync(p)) imgs.push({ name: buildingImg(b.key), path: p });
  }

  for (const h of leads) {
    const p = path.join(IMG, "leads", `${h.key}.png`);
    if (fs.existsSync(p)) imgs.push({ name: heroImg(h.key), path: p });
  }

  const seenSkills = new Set();
  for (const s of skills) {
    if (seenSkills.has(s.key)) continue;
    seenSkills.add(s.key);
    const p = path.join(IMG, "skills", `${s.key}.jpg`);
    if (fs.existsSync(p)) imgs.push({ name: skillImg(s.key), path: p });
  }

  const seenTroops = new Set();
  for (const t of allTroops) {
    if (seenTroops.has(t.key)) continue;
    seenTroops.add(t.key);
    const p = path.join(IMG, "troops", `${t.key}.png`);
    if (fs.existsSync(p)) imgs.push({ name: troopImg(t.key), path: p });
  }

  return imgs;
}

// ─── Build page list ────────────────────────────────────────────────────────

function buildPages() {
  const pages = [];

  pages.push({ title: "MediaWiki:Mainpage", text: "FomoFighters Wiki" });
  pages.push({ title: "MediaWiki:Common.css", text: commonCss() });
  pages.push({ title: "Template:Res", text: resTemplateWikitext() });
  pages.push({ title: "Template:Infobox_building", text: infoboxBuildingTemplate() });
  pages.push({ title: "Template:Infobox_hero", text: infoboxHeroTemplate() });
  pages.push({ title: "Template:Infobox_troop", text: infoboxTroopTemplate() });
  pages.push({ title: "Template:Infobox_skill", text: infoboxSkillTemplate() });

  pages.push({ title: "FomoFighters_Wiki", text: mainPageWikitext() });
  pages.push({ title: "Quests", text: questsHubWikitext() });
  pages.push({ title: "Daily_Quests", text: dailyQuestsWikitext() });
  pages.push({ title: "Main_Quests", text: mainQuestsWikitext() });
  pages.push({ title: "Side_Quests", text: sideQuestsWikitext() });

  let buildingsHub = `__NOTOC__\n'''Buildings''' are the structures that form your city. Building the city, training an army, researching technologies \u2014 all that you do here will decide the future of your kingdom.\n\n`;
  const buildingsByType = new Map();
  for (const b of buildings) {
    const t = b.type || "Other";
    if (!buildingsByType.has(t)) buildingsByType.set(t, []);
    buildingsByType.get(t).push(b);
  }
  for (const [type, items] of buildingsByType) {
    buildingsHub += `== ${type} ==\n`;
    buildingsHub += `<gallery widths="130" spacing="small" captionalign="center" bordersize="none">\n`;
    for (const b of items) {
      buildingsHub += `${buildingImg(b.key)}|'''[[${b.title}]]'''\n`;
    }
    buildingsHub += `</gallery>\n\n`;
  }
  buildingsHub += `[[Category:Buildings]]\n`;
  pages.push({ title: "Buildings", text: buildingsHub });

  for (const b of buildings) pages.push({ title: b.title, text: buildingWikitext(b) });

  pages.push({ title: "Troops", text: troopsHubWikitext() });

  const troopByBT = new Map();
  for (const t of allTroops) {
    const key = `${t.building}|${t.tier ?? 0}`;
    if (!troopByBT.has(key)) troopByBT.set(key, []);
    troopByBT.get(key).push(t);
  }
  for (const [key, troops] of troopByBT) {
    const [bKey, tier] = key.split("|");
    pages.push({ title: troops[0].title, text: troopGroupWikitext(bKey, parseInt(tier), troops) });
  }

  let skillsHub = `__NOTOC__\n'''Skills''' (Technologies) are researched in the [[Academy]]. They provide economic and military bonuses and unlock higher-tier troops.\n\n`;
  const byType = new Map();
  for (const s of skills) { const t = s.type || "Other"; if (!byType.has(t)) byType.set(t, []); byType.get(t).push(s); }
  for (const [type, items] of byType) {
    skillsHub += `== ${type} Technology ==\n`;
    const byTier = new Map();
    for (const s of items) { const t = s.tier ?? 0; if (!byTier.has(t)) byTier.set(t, []); byTier.get(t).push(s); }
    for (const tier of Array.from(byTier.keys()).sort((a, b) => a - b)) {
      skillsHub += `=== Tier ${tier} ===\n`;
      skillsHub += `<gallery widths="110" spacing="small" captionalign="center" bordersize="none">\n`;
      for (const s of byTier.get(tier)) {
        skillsHub += `${skillImg(s.key)}|'''[[${s.title}]]'''\n`;
      }
      skillsHub += `</gallery>\n\n`;
    }
  }
  skillsHub += `[[Category:Skills]]\n`;
  pages.push({ title: "Skills", text: skillsHub });

  for (const s of skills) pages.push({ title: s.title, text: skillWikitext(s) });

  let heroesHub = `'''Heroes''' are legendary commanders.\n\n`;
  const heroByTier = new Map();
  for (const h of leads) { if (!heroByTier.has(h.tier)) heroByTier.set(h.tier, []); heroByTier.get(h.tier).push(h); }
  for (const tier of Array.from(heroByTier.keys()).sort()) {
    const label = TIER_LABELS[tier] || `Tier ${tier}`;
    heroesHub += `== ${label} ==\n`;
    heroesHub += `{| class="wikitable" style="width:100%"\n|-\n! style="width:50px" | !! Name !! Role !! Aspect\n`;
    for (const h of heroByTier.get(tier)) {
      heroesHub += `|-\n| [[File:${heroImg(h.key)}|40px]] || '''[[${h.title}]]''' || ${ROLE_LABELS[h.role] || h.role} || ${titleCase(h.aspect ?? "\u2014")}\n`;
    }
    heroesHub += `|}\n\n`;
  }
  heroesHub += `[[Category:Heroes]]\n`;
  pages.push({ title: "Heroes", text: heroesHub });

  for (const h of leads) pages.push({ title: h.title, text: heroWikitext(h) });

  // ── Clans ──
  pages.push({ title: "Clans", text: clansHubWikitext() });
  pages.push({ title: "Clan_Levels", text: clanLevelsWikitext() });
  pages.push({ title: "Clan_Ranks", text: clanRanksWikitext() });
  pages.push({ title: "Clan_Rewards", text: clanRewardsWikitext() });
  pages.push({ title: "Clan_War", text: clanWarWikitext() });

  // ── Referral ──
  pages.push({ title: "Referral_System", text: referralHubWikitext() });
  pages.push({ title: "Referral_Gems", text: referralGemsWikitext() });
  pages.push({ title: "Referral_Revshare", text: referralRevshareWikitext() });

  // ── WAR ──
  pages.push({ title: "WAR", text: warPageWikitext() });

  return pages;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFomoFighters \u2192 Fandom Sync`);
  console.log(`Wiki: ${WIKI}.fandom.com | Dry: ${DRY} | Skip existing: ${SKIP_EXISTING} | Skip images: ${SKIP_IMAGES}\n`);

  if (!DRY) { await login(); console.log(); }

  const summary = `Auto-sync v${version.gameVersion} (${version.dataUpdated})`;

  if (!SKIP_IMAGES) {
    const images = collectImages();
    console.log(`Uploading ${images.length} images...\n`);
    for (let i = 0; i < images.length; i++) {
      await uploadImage(images[i].name, images[i].path);
      if ((i + 1) % 10 === 0) console.log(`  ... ${i + 1}/${images.length} images done`);
    }
    console.log(`\nImage upload complete.\n`);
  }

  const pages = buildPages();
  console.log(`Syncing ${pages.length} pages...\n`);

  let done = 0, skipped = 0;
  for (const page of pages) {
    if (!DRY && SKIP_EXISTING) {
      if (await pageExists(page.title)) { skipped++; done++; continue; }
    }
    await editPage(page.title, page.text, summary);
    done++;
    if (done % 10 === 0) console.log(`  ... ${done}/${pages.length} pages (${skipped} skipped)`);
  }

  console.log(`\nDone: ${done} pages, ${skipped} skipped.`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
