import type { QuestMain, QuestSide, QuestDaily } from "./data";
import { formatCost } from "./format";
import { useT } from "@/lib/i18n";

const B: Record<string, { en: string; ru: string }> = {
  castle:         { en: "Castle",          ru: "Замок" },
  barracks:       { en: "Barracks",        ru: "Казармы" },
  archery_range:  { en: "Archery Range",   ru: "Стрельбище" },
  stable:         { en: "Stable",          ru: "Конюшня" },
  siege_workshop: { en: "Siege Workshop",  ru: "Осадная мастерская" },
  scout_camp:     { en: "Scout Camp",      ru: "Лагерь разведчиков" },
  farm_1:         { en: "Farm",            ru: "Ферма" },
  farm_2:         { en: "Farm",            ru: "Ферма" },
  farm_3:         { en: "Farm",            ru: "Ферма" },
  lumber_mill_1:  { en: "Lumber Mill",     ru: "Лесопилка" },
  lumber_mill_2:  { en: "Lumber Mill",     ru: "Лесопилка" },
  lumber_mill_3:  { en: "Lumber Mill",     ru: "Лесопилка" },
  quarry_1:       { en: "Quarry",          ru: "Каменоломня" },
  quarry_2:       { en: "Quarry",          ru: "Каменоломня" },
  quarry_3:       { en: "Quarry",          ru: "Каменоломня" },
  academy:        { en: "Academy",         ru: "Академия" },
  stash:          { en: "Stash",           ru: "Тайник" },
  market:         { en: "Market",          ru: "Рынок" },
  storage:        { en: "Storage",         ru: "Хранилище" },
};

const R: Record<string, { en: string; ru: string }> = {
  food:  { en: "Food",  ru: "Еда" },
  wood:  { en: "Wood",  ru: "Дерево" },
  stone: { en: "Stone", ru: "Камень" },
  gem:   { en: "Gems",  ru: "Гемы" },
};

const T: Record<string, { en: string; ru: string }> = {
  oasis:  { en: "oasis",           ru: "оазисов" },
  camp:   { en: "camps",           ru: "лагерей" },
  people: { en: "players",         ru: "игроков" },
};

function bName(key: string, lang: string): string {
  const e = B[key];
  if (e) return lang === "ru" ? e.ru : e.en;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function rName(key: string, lang: string): string {
  const e = R[key];
  return e ? (lang === "ru" ? e.ru : e.en) : key;
}

function tName(key: string, lang: string): string {
  const e = T[key];
  return e ? (lang === "ru" ? e.ru : e.en) : key;
}

function n(v: number): string {
  return formatCost(v);
}

// ─── Main quest description ───

export function describeMainQuest(q: QuestMain, lang: string): string {
  const t = useT(lang);
  switch (q.type) {
    case "build":
      return t("questFormat.main.build")
        .replace("{building}", bName(q.data!, lang))
        .replace("{level}", String(q.count));
    case "trainTotal":
      return t("questFormat.main.trainTotal").replace("{count}", n(q.count));
    case "attack":
      return t("questFormat.main.attack")
        .replace("{count}", n(q.count))
        .replace("{target}", tName(q.data!, lang));
    case "power":
      return t("questFormat.main.power").replace("{count}", n(q.count));
    case "resourceBuy":
      return t("questFormat.main.resourceBuy")
        .replace("{count}", n(q.count))
        .replace("{resource}", rName(q.data!, lang));
    case "research":
      return t("questFormat.main.research")
        .replace("{building}", bName(q.data!, lang))
        .replace("{level}", String(q.count));
    case "clan":
      return t("questFormat.main.clan").replace("{count}", n(q.count));
    default:
      return q.key;
  }
}

// ─── Side quest description ───

export function describeSideQuest(q: QuestSide, lang: string): string {
  const t = useT(lang);
  switch (q.type) {
    case "build":
      return t("questFormat.side.build").replace("{building}", bName(q.data!, lang));
    case "trainBuilding":
      return t("questFormat.side.trainBuilding").replace("{building}", bName(q.data!, lang));
    case "resourceClaim":
      return t("questFormat.side.resourceClaim").replace("{resource}", rName(q.data!, lang));
    case "resourceBuy":
      return t("questFormat.side.resourceBuy").replace("{resource}", rName(q.data!, lang));
    case "resourceLoot":
      return t("questFormat.side.resourceLoot").replace("{resource}", rName(q.data!, lang));
    case "attack":
      return t("questFormat.side.attack").replace("{target}", tName(q.data!, lang));
    case "killPoints":
      return t("questFormat.side.killPoints");
    case "research":
      return t("questFormat.side.research").replace("{building}", bName(q.data!, lang));
    case "clan":
      return t("questFormat.side.clan");
    default:
      return q.key;
  }
}

// ─── Daily quest description ───

export function describeDailyQuest(q: QuestDaily, lang: string): string {
  const t = useT(lang);
  switch (q.type) {
    case "resourceClaim":
      return t("questFormat.daily.resourceClaim")
        .replace("{count}", n(q.count))
        .replace("{resource}", rName(q.data!, lang));
    case "trainBuilding":
      return t("questFormat.daily.trainBuilding")
        .replace("{count}", n(q.count))
        .replace("{building}", bName(q.data!, lang));
    case "resourceLoot":
      return t("questFormat.daily.resourceLoot")
        .replace("{count}", n(q.count))
        .replace("{resource}", rName(q.data!, lang));
    case "attack":
      return t("questFormat.daily.attack")
        .replace("{count}", n(q.count))
        .replace("{target}", tName(q.data!, lang));
    case "pvp":
      return t("questFormat.daily.pvp").replace("{count}", n(q.count));
    case "skills":
      return t("questFormat.daily.skills").replace("{count}", String(q.count));
    case "buildings":
      return t("questFormat.daily.buildings").replace("{count}", String(q.count));
    case "clan":
      return t("questFormat.daily.clan").replace("{count}", n(q.count));
    case "resourceBuy":
      return t("questFormat.daily.resourceBuy")
        .replace("{count}", n(q.count))
        .replace("{resource}", rName(q.data!, lang));
    default:
      return q.key;
  }
}

// ─── Reward formatting ───

export type RewardPart = { res: string; amount: string };

export function formatReward(
  food?: number,
  wood?: number,
  stone?: number,
  gem?: number,
): RewardPart[] {
  const parts: RewardPart[] = [];
  if (food) parts.push({ res: "food", amount: n(food) });
  if (wood) parts.push({ res: "wood", amount: n(wood) });
  if (stone) parts.push({ res: "stone", amount: n(stone) });
  if (gem) parts.push({ res: "gem", amount: n(gem) });
  return parts;
}

// ─── Side quest categories ───

export type SideCategory = "building" | "training" | "combat" | "economy" | "research" | "social";

const CATEGORY_MAP: Record<string, SideCategory> = {
  build: "building",
  trainBuilding: "training",
  attack: "combat",
  killPoints: "combat",
  resourceClaim: "economy",
  resourceBuy: "economy",
  resourceLoot: "economy",
  research: "research",
  clan: "social",
};

export function sideCategory(type: string): SideCategory {
  return CATEGORY_MAP[type] ?? "economy";
}

const CAT_LABELS: Record<SideCategory, { en: string; ru: string }> = {
  building: { en: "Building", ru: "Строительство" },
  training: { en: "Training", ru: "Обучение" },
  combat:   { en: "Combat",   ru: "Боевые" },
  economy:  { en: "Economy",  ru: "Экономика" },
  research: { en: "Research", ru: "Исследования" },
  social:   { en: "Social",   ru: "Клан" },
};

export function categoryLabel(cat: SideCategory, lang: string): string {
  const e = CAT_LABELS[cat];
  return lang === "ru" ? e.ru : e.en;
}
