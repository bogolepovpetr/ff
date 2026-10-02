import { createHash } from "node:crypto";
import { SYNC_FROM_MONO } from "./sync-manifest.mjs";

const FILE_LABELS = {
  "lists_buildings.json": { en: "Buildings", ru: "Здания" },
  "lists_leads.json": { en: "Heroes", ru: "Герои" },
  "lists_troops.json": { en: "Troops", ru: "Войска" },
  "lists_skills.json": { en: "Skills", ru: "Навыки" },
  "lists_shop.json": { en: "Shop", ru: "Магазин" },
  "lists_races.json": { en: "Races", ru: "Расы" },
  "lists_clan.json": { en: "Clans", ru: "Кланы" },
  "lists_clan_ranks.json": { en: "Clan ranks", ru: "Ранги кланов" },
  "lists_clan_rewards.json": { en: "Clan rewards", ru: "Награды кланов" },
  "lists_lead_tiers.json": { en: "Hero tiers", ru: "Тиры героев" },
  "lists_lead_stars.json": { en: "Hero star ranks", ru: "Звёздные ранги героев" },
  "lists_lead_exp.json": { en: "Hero EXP", ru: "Опыт героев" },
  "lists_quests_main.json": { en: "Main quests", ru: "Основные квесты" },
  "lists_quests_side.json": { en: "Side quests", ru: "Побочные квесты" },
  "lists_quests_story_daily.json": { en: "Daily quests", ru: "Ежедневные квесты" },
  "lists_quests_story_daily_rewards.json": { en: "Daily quest rewards", ru: "Награды ежедневных квестов" },
  "lists_vip_pass.json": { en: "VIP", ru: "VIP" },
  "lists_vip_streak.json": { en: "VIP chest streak", ru: "VIP-стрик сундука" },
  "lists_vip_time.json": { en: "VIP time", ru: "VIP-время" },
  "lists_battlepass.json": { en: "Dawn Fund", ru: "Фонд Рассвета" },
  "lists_battlepass_topup.json": { en: "Dawn Fund top-ups", ru: "Докупки Фонда Рассвета" },
  "lists_arena_pvp.json": { en: "Arena PvP", ru: "Арена PvP" },
};

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

function indexByKey(items) {
  const map = new Map();
  if (!Array.isArray(items)) return map;
  for (const item of items) {
    if (item?.key != null) map.set(String(item.key), item);
  }
  return map;
}

function playerName(item) {
  const title = item?.title ?? item?.name;
  if (!title) return null;
  if (/\{[^}]+\}/.test(title)) return null;
  if (/^[a-z][a-z0-9_]*$/i.test(title) && title.includes("_")) return null;
  return title;
}

function describeQuest(item) {
  const { type, data, count } = item ?? {};
  if (type === "attack" && data === "journey_total") {
    return count === 1 ? "complete 1 journey attack" : `complete ${count} journey attacks`;
  }
  if (type === "scout" && data === "people") {
    return count === 1 ? "scout 1 player city" : `scout ${count} player cities`;
  }
  if (type === "attack" && data === "people") {
    return count === 1 ? "attack 1 player city" : `attack ${count} player cities`;
  }
  if (type === "attack" && data === "camp") {
    return count === 1 ? "attack 1 camp" : `attack ${count} camps`;
  }
  if (type === "pvp" && data === "killPoints") {
    return `earn ${count} kill points in PvP`;
  }
  if (type === "resourceClaim") return `claim ${count} ${data}`;
  if (type === "resourceLoot") return `loot ${count} ${data}`;
  if (type === "trainBuilding") return `train ${count} troops in ${String(data).replace(/_/g, " ")}`;
  if (type === "skills") return `complete ${count} research`;
  if (type === "buildings") return `upgrade ${count} buildings`;
  if (type === "clan") return `clan donate ${count}`;
  return null;
}

function diffSection(file, before, after) {
  const label = FILE_LABELS[file];
  if (!label || !Array.isArray(before) || !Array.isArray(after)) return null;

  const prev = indexByKey(before);
  const next = indexByKey(after);
  const added = [];
  const removed = [];
  let modified = 0;

  for (const [key, item] of next) {
    if (!prev.has(key)) {
      const name = playerName(item) ?? describeQuest(item);
      added.push(name ?? `[internal:${key}]`);
    }
  }
  for (const [key, item] of prev) {
    if (!next.has(key)) {
      const name = playerName(item) ?? describeQuest(item);
      removed.push(name ?? `[internal:${key}]`);
    }
  }
  for (const [key, item] of next) {
    const old = prev.get(key);
    if (old && hashJson(old) !== hashJson(item)) modified++;
  }

  if (added.length === 0 && removed.length === 0 && modified === 0) return null;

  return {
    file,
    areaEn: label.en,
    areaRu: label.ru,
    added,
    removed,
    modified,
  };
}

export function buildChangeDigest(beforeByFile, afterByFile, files = SYNC_FROM_MONO) {
  const sections = [];
  for (const file of files) {
    const before = readJson(beforeByFile[file]);
    const after = readJson(afterByFile[file]);
    if (before == null && after == null) continue;
    if (hashJson(before) === hashJson(after)) continue;
    const section = diffSection(file, before ?? [], after ?? []);
    if (section) sections.push(section);
  }
  return { sections };
}

export function fallbackPlayerChanges(digest) {
  const changes = [];

  for (const s of digest.sections) {
    const namedAdded = s.added.filter((x) => !x.startsWith("[internal:"));
    const internalAdded = s.added.length - namedAdded.length;
    const isQuestFile = s.file.includes("quest");

    if (isQuestFile && internalAdded + s.removed.length + s.modified > 0) {
      const total = s.added.length + s.removed.length + s.modified;
      if (s.file.includes("story_daily")) {
        changes.push({
          en: "Daily quests refreshed (new journey, scout and PvP tasks)",
          ru: "Обновлены ежедневные квесты (походы, разведка, PvP)",
        });
        continue;
      }
      if (s.modified >= 30) {
        changes.push({
          en: `Main quest line rebalanced (${s.modified} updates)`,
          ru: `Перебалансированы основные квесты (${s.modified} правок)`,
        });
        continue;
      }
      if (total >= 10) {
        changes.push({
          en: `${s.areaEn} updated`,
          ru: `Обновлены: ${s.areaRu}`,
        });
        continue;
      }
    }

    if (namedAdded.length > 0 && namedAdded.length <= 5 && s.file === "lists_buildings.json") {
      changes.push({
        en: `New buildings: ${namedAdded.join(", ")}`,
        ru: `Новые здания: ${namedAdded.map((n) => (n === "Adventure Hall" ? "Центр приключений" : n === "Arena" ? "Арена" : n)).join(", ")}`,
      });
    } else if (namedAdded.length > 5 && s.file === "lists_leads.json") {
      changes.push({
        en: `${namedAdded.length} new heroes added to the roster`,
        ru: `Добавлено ${namedAdded.length} новых героев`,
      });
    } else if (namedAdded.length > 0 && namedAdded.length <= 5) {
      changes.push({
        en: `New in ${s.areaEn.toLowerCase()}: ${namedAdded.join(", ")}`,
        ru: `${s.areaRu}: ${namedAdded.join(", ")}`,
      });
    } else if (namedAdded.length > 5) {
      changes.push({
        en: `${namedAdded.length} new ${s.areaEn.toLowerCase()} items`,
        ru: `${s.areaRu}: ${namedAdded.length} новых позиций`,
      });
    } else if (internalAdded > 0) {
      changes.push({
        en: `${s.areaEn} expanded (${internalAdded} new tasks)`,
        ru: `${s.areaRu}: ${internalAdded} новых заданий`,
      });
    }

    if (s.removed.length > 0 && !isQuestFile) {
      changes.push({
        en: `Removed outdated ${s.areaEn.toLowerCase()} items`,
        ru: `Убраны устаревшие позиции (${s.areaRu.toLowerCase()})`,
      });
    }

    if (s.modified > 0 && !isQuestFile) {
      changes.push({
        en: s.modified >= 15
          ? `${s.areaEn} balance update`
          : `Tweaked ${s.modified} ${s.areaEn.toLowerCase()} values`,
        ru: s.modified >= 15
          ? `Баланс: ${s.areaRu}`
          : `Мелкие правки (${s.areaRu.toLowerCase()}, ${s.modified})`,
      });
    }
  }

  return dedupeChanges(changes).slice(0, 8);
}

function dedupeChanges(changes) {
  const seen = new Set();
  return changes.filter((c) => {
    const k = c.en;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
