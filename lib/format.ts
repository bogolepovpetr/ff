export function formatCost(v?: number): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

export function formatTime(seconds?: number): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

export function joinReqs(
  req?: Record<string, number>,
  nameMap?: Map<string, string>,
): string | null {
  if (!req || Object.keys(req).length === 0) return null;
  return Object.entries(req)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, lvl]) => {
      const display = nameMap?.get(k) ?? k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return `${display} Lv.${lvl}`;
    })
    .join(", ");
}

// --------------- Tier colours ---------------

export const TIER_COLORS: Record<number, { border: string; bg: string; text: string; badge: string }> = {
  1: { border: "border-zinc-300",    bg: "bg-zinc-100",     text: "text-zinc-600",    badge: "bg-zinc-200 text-zinc-700" },
  2: { border: "border-emerald-400", bg: "bg-emerald-50",   text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-800" },
  3: { border: "border-blue-400",    bg: "bg-blue-50",      text: "text-blue-700",    badge: "bg-blue-100 text-blue-800" },
  4: { border: "border-violet-400",  bg: "bg-violet-50",    text: "text-violet-700",  badge: "bg-violet-100 text-violet-800" },
  5: { border: "border-amber-400",   bg: "bg-amber-50",     text: "text-amber-700",   badge: "bg-amber-100 text-amber-800" },
};

export function tierColor(tier: number) {
  return TIER_COLORS[tier] ?? TIER_COLORS[1];
}

// --------------- Building names ---------------

const BUILDING_NAMES: Record<string, { en: string; ru: string }> = {
  archery_range:  { en: "Archery Range",    ru: "Стрельбище" },
  barracks:       { en: "Barracks",         ru: "Казармы" },
  stable:         { en: "Stable",           ru: "Конюшня" },
  siege_workshop: { en: "Siege Workshop",   ru: "Осадная мастерская" },
  scout_camp:     { en: "Scout Camp",       ru: "Лагерь разведчиков" },
};

export function buildingName(key: string, lang: string): string {
  const entry = BUILDING_NAMES[key];
  if (!entry) return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return lang === "ru" ? entry.ru : entry.en;
}

// --------------- Hero tier names ---------------

const HERO_TIER_NAMES: Record<number, { en: string; ru: string }> = {
  1: { en: "Common",  ru: "Обычный" },
  2: { en: "Rare",    ru: "Редкий" },
  3: { en: "Epic",    ru: "Эпический" },
  4: { en: "Legend",   ru: "Легендарный" },
  5: { en: "Mythic",  ru: "Мифический" },
};

export function heroTierName(tier: number, lang: string): string {
  const entry = HERO_TIER_NAMES[tier];
  return entry ? (lang === "ru" ? entry.ru : entry.en) : `Tier ${tier}`;
}

// --------------- Role names ---------------

const ROLE_NAMES: Record<string, { en: string; ru: string }> = {
  castle: { en: "Castle / Economy", ru: "Замок / Экономика" },
  def:    { en: "Defense",          ru: "Оборона" },
  attack: { en: "Attack",           ru: "Атака" },
  war:    { en: "War",              ru: "Война" },
};

export function roleName(role: string, lang: string): string {
  const entry = ROLE_NAMES[role];
  return entry ? (lang === "ru" ? entry.ru : entry.en) : role;
}

export function humanizeBonus(key: string): string {
  return key
    .replace(/^bonus/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

const LEAGUE_LABELS: Record<string, { en: string; ru: string }> = {
  newbie:   { en: "Newbie",   ru: "Новичок" },
  bronze:   { en: "Bronze",   ru: "Бронза" },
  silver:   { en: "Silver",   ru: "Серебро" },
  gold:     { en: "Gold",     ru: "Золото" },
  platinum: { en: "Platinum", ru: "Платина" },
  diamond:  { en: "Diamond",  ru: "Алмаз" },
  emerald:  { en: "Emerald",  ru: "Изумруд" },
};

export function leagueLabel(league: string, lang: string): string {
  const entry = LEAGUE_LABELS[league];
  if (!entry) return league.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return lang === "ru" ? entry.ru : entry.en;
}

const VIP_PERM_LABELS: Record<string, { en: string; ru: string }> = {
  permVipBadge:   { en: "VIP badge",       ru: "VIP-значок" },
  permCollectAll: { en: "Collect all",     ru: "Собрать всё" },
  permVipFrame:   { en: "VIP frame",       ru: "VIP-рамка" },
  permVipSkin:    { en: "VIP city skin",   ru: "VIP-скин города" },
};

export function vipPermLabels(row: Record<string, unknown>, lang: string): string[] {
  const out: string[] = [];
  for (const [key, labels] of Object.entries(VIP_PERM_LABELS)) {
    if (row[key]) out.push(lang === "ru" ? labels.ru : labels.en);
  }
  return out;
}

export type RewardEntry = {
  key: string;
  amount: number;
  kind: "resource" | "other";
};

const RESOURCE_KEYS = new Set(["food", "wood", "stone", "gem"]);

export function parseRewardDict(dict?: Record<string, number | string>): RewardEntry[] {
  if (!dict) return [];
  return Object.entries(dict).map(([key, val]) => {
    const amount = typeof val === "number" ? val : Number(val) || 0;
    return {
      key,
      amount,
      kind: RESOURCE_KEYS.has(key) ? "resource" as const : "other" as const,
    };
  });
}

export function rewardKeyLabel(key: string, lang: string): string {
  if (RESOURCE_KEYS.has(key)) return key;
  const labels: Record<string, { en: string; ru: string }> = {
    war: { en: "War points", ru: "War-очки" },
    lead_exp: { en: "Hero XP", ru: "Опыт героя" },
    lead_card: { en: "Hero cards", ru: "Карты героя" },
  };
  if (labels[key]) return lang === "ru" ? labels[key].ru : labels[key].en;
  if (key.startsWith("box_")) {
    const name = key.replace(/^box_/, "").replace(/_/g, " ");
    return lang === "ru" ? `Сундук: ${name}` : `Box: ${name}`;
  }
  return key.replace(/_/g, " ");
}

export function extractVipBonuses(row: Record<string, unknown>): { key: string; value: number }[] {
  return Object.entries(row)
    .filter(([k, v]) => k.startsWith("bonus") && typeof v === "number" && v !== 0)
    .map(([key, value]) => ({ key, value: value as number }));
}

const BONUS_LABELS: Record<string, { en: string; ru: string }> = {
  bonusRateFoodPH: { en: "Food production", ru: "Производство еды" },
  bonusRateWoodPH: { en: "Wood production", ru: "Производство дерева" },
  bonusRateStonePH: { en: "Stone production", ru: "Производство камня" },
  bonusRateFoodStorageLimit: { en: "Food storage", ru: "Склад еды" },
  bonusRateWoodStorageLimit: { en: "Wood storage", ru: "Склад дерева" },
  bonusRateStoneStorageLimit: { en: "Stone storage", ru: "Склад камня" },
  bonusRateLoad: { en: "Troop load", ru: "Грузоподъёмность" },
  bonusRateSpeed: { en: "March speed", ru: "Скорость марша" },
  bonusRateBuildTimeSpeedIncrease: { en: "Build speed", ru: "Скорость строительства" },
  bonusRateResearchTimeSpeedIncrease: { en: "Research speed", ru: "Скорость исследований" },
  bonusRateTrainTimeSpeedIncrease: { en: "Training speed", ru: "Скорость обучения" },
  bonusRateAtk: { en: "Attack", ru: "Атака" },
  bonusRateDef: { en: "Defense", ru: "Защита" },
  bonusArmyCapacityBarracks: { en: "Barracks capacity", ru: "Вместимость казарм" },
  bonusArmyCapacityArcheryRange: { en: "Archery capacity", ru: "Вместимость стрельбища" },
  bonusArmyCapacityStable: { en: "Stable capacity", ru: "Вместимость конюшни" },
  bonusArmyCapacitySiegeWorkshop: { en: "Siege capacity", ru: "Вместимость осадной мастерской" },
  bonusArmyCapacityScoutCamp: { en: "Scout capacity", ru: "Вместимость разведчиков" },
  bonusHospitalHealDiscount: { en: "Hospital heal discount", ru: "Скидка на лечение" },
  bonusHospitalCapacity: { en: "Hospital capacity", ru: "Вместимость госпиталя" },
  bonusHospitalHealTimeDivisor: { en: "Hospital heal time", ru: "Время лечения" },
  bonusMarketSlotCount: { en: "Market slots", ru: "Слоты рынка" },
  bonusMarketPurchaseCount: { en: "Market purchases", ru: "Покупки на рынке" },
  bonusBuilders: { en: "Builders", ru: "Строители" },
  bonusAcademics: { en: "Researchers", ru: "Учёные" },
  bonusBuildDiscount: { en: "Build discount", ru: "Скидка на строительство" },
  bonusResearchDiscount: { en: "Research discount", ru: "Скидка на исследования" },
  bonusTrainDiscount: { en: "Training discount", ru: "Скидка на обучение" },
  bonusFriends: { en: "Friend slots", ru: "Слоты друзей" },
  bonusEnergy: { en: "Energy", ru: "Энергия" },
  bonusLimitDailyPurchase: { en: "Daily purchase limit", ru: "Лимит покупок в день" },
};

export function bonusLabel(key: string, lang: string): string {
  const entry = BONUS_LABELS[key];
  if (entry) return lang === "ru" ? entry.ru : entry.en;
  return humanizeBonus(key);
}

export type VipUnlock = {
  key: string;
  label: string;
  kind: "new" | "upgrade";
  value: number;
  prevValue?: number;
};

export function extractVipNewUnlocks(
  current: Record<string, unknown>,
  previous: Record<string, unknown> | null,
  lang: string,
): VipUnlock[] {
  const curr = extractVipBonuses(current);
  const prevMap = new Map(
    previous ? extractVipBonuses(previous).map((b) => [b.key, b.value]) : [],
  );
  const out: VipUnlock[] = [];
  for (const b of curr) {
    const prevVal = prevMap.get(b.key);
    if (prevVal === undefined) {
      out.push({ key: b.key, label: bonusLabel(b.key, lang), kind: "new", value: b.value });
    } else if (b.value > prevVal) {
      out.push({
        key: b.key,
        label: bonusLabel(b.key, lang),
        kind: "upgrade",
        value: b.value,
        prevValue: prevVal,
      });
    }
  }
  return out;
}

export function extractVipNewPerms(
  current: Record<string, unknown>,
  previous: Record<string, unknown> | null,
  lang: string,
): string[] {
  const curr = vipPermLabels(current, lang);
  if (!previous) return curr;
  const prev = new Set(vipPermLabels(previous, lang));
  return curr.filter((p) => !prev.has(p));
}

// --------------- Race names ---------------

const RACE_NAMES: Record<string, { en: string; ru: string }> = {
  elf:   { en: "Elf",   ru: "Эльфы" },
  human: { en: "Human", ru: "Люди" },
  demon: { en: "Demon", ru: "Демоны" },
};

export function raceName(key: string, lang: string): string {
  const entry = RACE_NAMES[key];
  if (!entry) return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return lang === "ru" ? entry.ru : entry.en;
}

// --------------- Troop type names ---------------

const TROOP_TYPE_NAMES: Record<string, { en: string; ru: string }> = {
  clubman:     { en: "Clubman",     ru: "Дубинщик" },
  swordsman:   { en: "Swordsman",   ru: "Мечник" },
  pikeman:     { en: "Pikeman",     ru: "Копейщик" },
  knight:      { en: "Knight",      ru: "Рыцарь" },
  paladin:     { en: "Paladin",     ru: "Паладин" },
  slinger:     { en: "Slinger",     ru: "Пращник" },
  archer:      { en: "Archer",      ru: "Лучник" },
  crossbowman: { en: "Crossbowman", ru: "Арбалетчик" },
  longbowman:  { en: "Longbowman",  ru: "Стрелок" },
  musketeer:   { en: "Musketeer",   ru: "Мушкетёр" },
  horseman:    { en: "Horseman",    ru: "Всадник" },
  light_cavalry: { en: "Light Cavalry", ru: "Лёгкая кавалерия" },
  heavy_cavalry: { en: "Heavy Cavalry", ru: "Тяжёлая кавалерия" },
  lancer:      { en: "Lancer",      ru: "Улан" },
  cataphract:  { en: "Cataphract",  ru: "Катафракт" },
  ballista:    { en: "Ballista",    ru: "Баллиста" },
  catapult:    { en: "Catapult",    ru: "Катапульта" },
  siege_tower: { en: "Siege Tower", ru: "Осадная башня" },
  battering_ram: { en: "Battering Ram", ru: "Таран" },
  trebuchet:   { en: "Trebuchet",   ru: "Требюше" },
  scout:       { en: "Scout",       ru: "Разведчик" },
};

export function troopTypeName(title: string, lang: string): string {
  if (lang !== "ru") return title;
  const key = title.toLowerCase().replace(/\s+/g, "_");
  const entry = TROOP_TYPE_NAMES[key];
  return entry ? entry.ru : title;
}
