import { createHash } from "node:crypto";
import { SYNC_FROM_MONO } from "./sync-manifest.mjs";

const FILE_LABELS = {
  "lists_buildings.json": { en: "Buildings", ru: "Здания", entityEn: "building", entityRu: "здание" },
  "lists_leads.json": { en: "Heroes", ru: "Герои", entityEn: "hero", entityRu: "герой" },
  "lists_troops.json": { en: "Troops", ru: "Войска", entityEn: "troop", entityRu: "войско" },
  "lists_skills.json": { en: "Skills", ru: "Навыки", entityEn: "skill", entityRu: "навык" },
  "lists_shop.json": { en: "Shop", ru: "Магазин", entityEn: "shop item", entityRu: "товар" },
  "lists_races.json": { en: "Races", ru: "Расы", entityEn: "race", entityRu: "раса" },
  "lists_clan.json": { en: "Clans", ru: "Кланы", entityEn: "clan setting", entityRu: "настройка клана" },
  "lists_clan_ranks.json": { en: "Clan ranks", ru: "Ранги кланов", entityEn: "clan rank", entityRu: "ранг клана" },
  "lists_clan_rewards.json": { en: "Clan rewards", ru: "Награды кланов", entityEn: "clan reward", entityRu: "награда клана" },
  "lists_lead_tiers.json": { en: "Hero tiers", ru: "Тиры героев", entityEn: "hero tier", entityRu: "тир героя" },
  "lists_lead_stars.json": { en: "Hero stars", ru: "Звёзды героев", entityEn: "star rank", entityRu: "звёздный ранг" },
  "lists_lead_exp.json": { en: "Hero EXP", ru: "Опыт героев", entityEn: "EXP row", entityRu: "строка опыта" },
  "lists_quests_main.json": { en: "Main quests", ru: "Основные квесты", entityEn: "main quest", entityRu: "основной квест" },
  "lists_quests_side.json": { en: "Side quests", ru: "Побочные квесты", entityEn: "side quest", entityRu: "побочный квест" },
  "lists_quests_story_daily.json": { en: "Daily story quests", ru: "Ежедневные сюжетные квесты", entityEn: "daily quest", entityRu: "ежедневный квест" },
  "lists_quests_story_daily_rewards.json": { en: "Daily quest rewards", ru: "Награды ежедневных квестов", entityEn: "daily reward", entityRu: "награда" },
  "lists_vip_pass.json": { en: "VIP levels", ru: "VIP-уровни", entityEn: "VIP level", entityRu: "VIP-уровень" },
  "lists_vip_streak.json": { en: "VIP chest streak", ru: "VIP-стрик сундука", entityEn: "streak day", entityRu: "день стрика" },
  "lists_vip_time.json": { en: "VIP time packs", ru: "VIP-время", entityEn: "VIP time pack", entityRu: "пак VIP-времени" },
  "lists_battlepass.json": { en: "Dawn Fund", ru: "Фонд Рассвета", entityEn: "Dawn Fund tier", entityRu: "уровень Фонда Рассвета" },
  "lists_battlepass_topup.json": { en: "Dawn Fund top-ups", ru: "Докупки Фонда Рассвета", entityEn: "top-up", entityRu: "докупка" },
  "lists_arena_pvp.json": { en: "Arena PvP", ru: "Арена PvP", entityEn: "arena floor", entityRu: "этаж арены" },
};

const MAX_NAMED = 5;
const MAX_CHANGES = 20;

function stableJson(value) {
  return JSON.stringify(value);
}

function hashJson(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function readJson(raw) {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function indexByKey(items, keyField = "key") {
  const map = new Map();
  if (!Array.isArray(items)) return map;
  for (const item of items) {
    if (item && item[keyField] != null) {
      map.set(String(item[keyField]), item);
    }
  }
  return map;
}

function displayName(item) {
  return item?.title ?? item?.name ?? item?.key ?? "?";
}

function pluralEn(word, n) {
  if (n === 1) return word;
  const irregular = { hero: "heroes", building: "buildings", troop: "troops" };
  if (irregular[word]) return irregular[word];
  if (word.endsWith("y") && !word.endsWith("ay") && !word.endsWith("ey")) {
    return `${word.slice(0, -1)}ies`;
  }
  return `${word}s`;
}

function diffKeyedFile(file, before, after) {
  const label = FILE_LABELS[file];
  if (!label) return [];

  const prev = indexByKey(before);
  const next = indexByKey(after);
  const changes = [];

  const added = [];
  for (const [key, item] of next) {
    if (!prev.has(key)) added.push(displayName(item));
  }

  const removed = [];
  for (const [key, item] of prev) {
    if (!next.has(key)) removed.push(displayName(item));
  }

  let modified = 0;
  for (const [key, item] of next) {
    const old = prev.get(key);
    if (old && hashJson(old) !== hashJson(item)) modified++;
  }

  if (added.length > 0) {
    const names = added.slice(0, MAX_NAMED).join(", ");
    const more = added.length > MAX_NAMED ? ` (+${added.length - MAX_NAMED})` : "";
    changes.push({
      en: `New ${pluralEn(label.entityEn, added.length)}: ${names}${more}`,
      ru: `${label.ru}: добавлено — ${names}${more}`,
    });
  }

  if (removed.length > 0) {
    const names = removed.slice(0, MAX_NAMED).join(", ");
    const more = removed.length > MAX_NAMED ? ` (+${removed.length - MAX_NAMED})` : "";
    changes.push({
      en: `Removed ${pluralEn(label.entityEn, removed.length)}: ${names}${more}`,
      ru: `Удалены: ${names}${more}`,
    });
  }

  if (modified > 0) {
    changes.push({
      en: `Updated ${modified} ${label.en.toLowerCase()} ${modified === 1 ? "entry" : "entries"}`,
      ru: `Обновлено ${modified} ${label.ru.toLowerCase()}`,
    });
  }

  return changes;
}

function diffWholeFile(file, before, after) {
  const label = FILE_LABELS[file];
  if (!label) return [];
  if (hashJson(before) === hashJson(after)) return [];
  return [{
    en: `Updated ${label.en.toLowerCase()} data`,
    ru: `Обновлены данные: ${label.ru}`,
  }];
}

function diffFile(file, beforeRaw, afterRaw) {
  const before = readJson(beforeRaw);
  const after = readJson(afterRaw);
  if (beforeRaw == null && afterRaw == null) return [];
  if (beforeRaw == null && afterRaw != null) {
    const label = FILE_LABELS[file];
    return [{
      en: `Added ${label?.en ?? file} data`,
      ru: `Добавлены данные: ${label?.ru ?? file}`,
    }];
  }
  if (hashJson(before) === hashJson(after)) return [];

  if (Array.isArray(before) && Array.isArray(after)) {
    const hasKeys = after.some((x) => x?.key != null) || before.some((x) => x?.key != null);
    if (hasKeys) return diffKeyedFile(file, before, after);
  }

  return diffWholeFile(file, before, after);
}

export function diffSourceSnapshots(beforeByFile, afterByFile, files = SYNC_FROM_MONO) {
  const changes = [];
  for (const file of files) {
    changes.push(...diffFile(file, beforeByFile[file], afterByFile[file]));
  }
  return changes.slice(0, MAX_CHANGES);
}

export function bumpPatchVersion(version) {
  const m = String(version).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return `${version}.1`;
  return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function buildPatchEntry(changes, { version, date, monorepoCommit }) {
  const patchNotesEn = changes.map((c) => c.en).join("; ");
  return {
    gameVersion: version,
    dataUpdated: date,
    patchNotes: patchNotesEn,
    sourceMonorepoCommit: monorepoCommit ?? undefined,
    patches: [{
      version,
      date,
      changes,
      ...(monorepoCommit ? { monorepoCommit: monorepoCommit.slice(0, 12) } : {}),
    }],
  };
}

export function applyPatchToVersion(current, patchEntry) {
  const merged = {
    ...current,
    gameVersion: patchEntry.gameVersion,
    dataUpdated: patchEntry.dataUpdated,
    patchNotes: patchEntry.patchNotes,
    sourceMonorepoCommit: patchEntry.sourceMonorepoCommit ?? current.sourceMonorepoCommit,
    patches: [
      ...(patchEntry.patches ?? []),
      ...(current.patches ?? []),
    ],
  };
  return merged;
}
