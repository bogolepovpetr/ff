import type { QuestMain, QuestSide, QuestDaily } from "./data";
import { formatCost } from "./format";

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
  const ru = lang === "ru";
  switch (q.type) {
    case "build":
      return ru
        ? `Улучшить ${bName(q.data!, lang)} до ур. ${q.count}`
        : `Upgrade ${bName(q.data!, lang)} to Lv.${q.count}`;
    case "trainTotal":
      return ru
        ? `Обучить ${n(q.count)} войск`
        : `Train ${n(q.count)} troops`;
    case "attack":
      return ru
        ? `Атаковать ${n(q.count)} ${tName(q.data!, lang)}`
        : `Attack ${n(q.count)} ${tName(q.data!, lang)}`;
    case "power":
      return ru
        ? `Достичь ${n(q.count)} силы`
        : `Reach ${n(q.count)} power`;
    case "resourceBuy":
      return ru
        ? `Купить ${n(q.count)} ${rName(q.data!, lang)} на рынке`
        : `Buy ${n(q.count)} ${rName(q.data!, lang)} at market`;
    case "research":
      return ru
        ? `Исследовать ${bName(q.data!, lang)} до ур. ${q.count}`
        : `Research ${bName(q.data!, lang)} to Lv.${q.count}`;
    case "clan":
      return ru
        ? `Пожертвовать ${n(q.count)} клану`
        : `Donate ${n(q.count)} to clan`;
    default:
      return q.key;
  }
}

// ─── Side quest description ───

export function describeSideQuest(q: QuestSide, lang: string): string {
  const ru = lang === "ru";
  switch (q.type) {
    case "build":
      return ru
        ? `Улучшить ${bName(q.data!, lang)}`
        : `Upgrade ${bName(q.data!, lang)}`;
    case "trainBuilding":
      return ru
        ? `Обучить войска в ${bName(q.data!, lang)}`
        : `Train troops in ${bName(q.data!, lang)}`;
    case "resourceClaim":
      return ru
        ? `Собрать ${rName(q.data!, lang)}`
        : `Collect ${rName(q.data!, lang)}`;
    case "resourceBuy":
      return ru
        ? `Купить ${rName(q.data!, lang)} на рынке`
        : `Buy ${rName(q.data!, lang)} at market`;
    case "resourceLoot":
      return ru
        ? `Награбить ${rName(q.data!, lang)}`
        : `Loot ${rName(q.data!, lang)}`;
    case "attack":
      return ru
        ? `Атаковать ${tName(q.data!, lang)}`
        : `Attack ${tName(q.data!, lang)}`;
    case "killPoints":
      return ru ? "Набрать очки убийств" : "Earn kill points";
    case "research":
      return ru
        ? `Исследовать ${bName(q.data!, lang)}`
        : `Research ${bName(q.data!, lang)}`;
    case "clan":
      return ru ? "Пожертвовать клану" : "Donate to clan";
    default:
      return q.key;
  }
}

// ─── Daily quest description ───

export function describeDailyQuest(q: QuestDaily, lang: string): string {
  const ru = lang === "ru";
  switch (q.type) {
    case "resourceClaim":
      return ru
        ? `Собрать ${n(q.count)} ${rName(q.data!, lang)}`
        : `Collect ${n(q.count)} ${rName(q.data!, lang)}`;
    case "trainBuilding":
      return ru
        ? `Обучить ${n(q.count)} войск в ${bName(q.data!, lang)}`
        : `Train ${n(q.count)} troops in ${bName(q.data!, lang)}`;
    case "resourceLoot":
      return ru
        ? `Награбить ${n(q.count)} ${rName(q.data!, lang)}`
        : `Loot ${n(q.count)} ${rName(q.data!, lang)}`;
    case "attack":
      return ru
        ? `Атаковать ${n(q.count)} ${tName(q.data!, lang)}`
        : `Attack ${n(q.count)} ${tName(q.data!, lang)}`;
    case "pvp":
      return ru
        ? `Набрать ${n(q.count)} очков убийств`
        : `Earn ${n(q.count)} kill points`;
    case "skills":
      return ru
        ? `Завершить ${q.count} исследование`
        : `Complete ${q.count} research`;
    case "buildings":
      return ru
        ? `Завершить ${q.count} улучшение здания`
        : `Complete ${q.count} building upgrade`;
    case "clan":
      return ru
        ? `Пожертвовать ${n(q.count)} клану`
        : `Donate ${n(q.count)} to clan`;
    case "resourceBuy":
      return ru
        ? `Купить ${n(q.count)} ${rName(q.data!, lang)} на рынке`
        : `Buy ${n(q.count)} ${rName(q.data!, lang)} at market`;
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
