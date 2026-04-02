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

// --------------- Race names ---------------

const RACE_NAMES: Record<string, { en: string; ru: string }> = {
  cat:  { en: "Cat",  ru: "Коты" },
  dog:  { en: "Dog",  ru: "Псы" },
  frog: { en: "Frog", ru: "Лягушки" },
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
