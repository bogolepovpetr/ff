import fs from "node:fs";
import path from "node:path";

const SOURCE_DIR = path.join(process.cwd(), "data", "source");

function readJsonFile<T>(filename: string): T {
  const full = path.join(SOURCE_DIR, filename);
  const raw = fs.readFileSync(full, "utf8");
  return JSON.parse(raw) as T;
}

// --------------- Troops ---------------

export type Troop = {
  key: string;
  title: string;
  building: string;
  race?: string;
  atk?: number;
  def?: number;
  speed?: number;
  load?: number;
  time?: number;
  priceFood?: number;
  priceWood?: number;
  priceStone?: number;
  requiredBuildings?: Record<string, number>;
  requiredSkills?: Record<string, number>;
  tier?: number;
  power?: number;
  isScout?: boolean;
};

const EXCLUDED_RACES = new Set(["seal", "troll", "man"]);

export function getTroops(): Troop[] {
  return readJsonFile<Troop[]>("lists_troops.json");
}

export function getFilteredTroops(): Troop[] {
  return getTroops().filter((t) => !t.race || !EXCLUDED_RACES.has(t.race));
}

export type TroopGroup = {
  building: string;
  tier: number;
  title: string;
  troops: Troop[];
};

export function getTroopGroups(): Map<string, TroopGroup[]> {
  const troops = getFilteredTroops();
  const buildingMap = new Map<string, Map<number, Troop[]>>();

  for (const t of troops) {
    const tier = t.tier ?? 0;
    if (!buildingMap.has(t.building)) buildingMap.set(t.building, new Map());
    const tierMap = buildingMap.get(t.building)!;
    if (!tierMap.has(tier)) tierMap.set(tier, []);
    tierMap.get(tier)!.push(t);
  }

  const result = new Map<string, TroopGroup[]>();
  for (const [building, tierMap] of buildingMap) {
    const groups: TroopGroup[] = [];
    for (const [tier, items] of Array.from(tierMap.entries()).sort(
      ([a], [b]) => a - b,
    )) {
      const titleCounts = new Map<string, number>();
      for (const t of items) {
        titleCounts.set(t.title, (titleCounts.get(t.title) ?? 0) + 1);
      }
      const title = Array.from(titleCounts.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      groups.push({ building, tier, title, troops: items });
    }
    result.set(building, groups);
  }

  return result;
}

// --------------- Shop ---------------

export type ShopItem = {
  key: string;
  title: string;
  desc?: string;
  category: string;
  subCategory?: string;
  isStacked?: boolean;
  isArchived?: boolean;
  hours?: number;
  priceGem?: number;
  [k: string]: unknown;
};

export function getShopItems(): ShopItem[] {
  return readJsonFile<ShopItem[]>("lists_shop.json");
}

export function getActiveShopItems(): ShopItem[] {
  return getShopItems().filter((i) => !i.isArchived);
}

// --------------- Races ---------------

export type Race = {
  key: string;
  title: string;
  type: string;
  desc?: string;
  cBgContent?: string;
  cBgTitle?: string;
  bonusEnergy?: number;
  bonusBuilders?: number;
  bonusAcademics?: number;
  energyRegenInterval?: number;
  energyMax?: number;
};

export function getRaces(): Race[] {
  return readJsonFile<Race[]>("lists_races.json");
}

export function getPlayableRaces(): Race[] {
  return getRaces().filter((r) => r.type === "people");
}

// --------------- Buildings ---------------

export type BuildingLevel = {
  level: number;
  time?: number;
  power?: number;
  priceFood?: number;
  priceWood?: number;
  priceStone?: number;
  priceGem?: number;
  requiredBuildings?: Record<string, number>;
  [k: string]: unknown;
};

export type Building = {
  key: string;
  title: string;
  type?: string;
  desc?: string;
  levels: BuildingLevel[];
};

export function getBuildings(): Building[] {
  return readJsonFile<Building[]>("lists_buildings.json");
}

// --------------- Skills ---------------

export type SkillLevel = {
  level: number;
  time?: number;
  power?: number;
  priceFood?: number;
  priceWood?: number;
  priceStone?: number;
  priceGem?: number;
  requiredSkills?: Record<string, number>;
  requiredBuildings?: Record<string, number>;
  requiredFriends?: number;
  [k: string]: unknown;
};

export type Skill = {
  key: string;
  title: string;
  type?: string;
  desc?: string;
  tier?: number;
  levels: SkillLevel[];
};

export function getSkills(): Skill[] {
  return readJsonFile<Skill[]>("lists_skills.json");
}

// --------------- Heroes (Leads) ---------------

export type Lead = {
  key: string;
  title: string;
  desc?: string;
  tier: number;
  aspect?: string;
  priceGem?: number;
  cardCount?: number;
  cardPriceGem?: number;
  role?: string;
  blockedTimerInBuilding?: string;
  bonusPerLevel?: Record<string, number>;
};

export type LeadTier = {
  key: number;
  title: string;
  leadExpMultiplicator: number;
  leadStarsExpMultiplicator: number;
  chanceCardByPvpTargetLevel: Record<string, number>;
  rate: number;
  max: number;
};

export type LeadExp = {
  level: number;
  exp: number;
  rate: number;
  max: number;
  maxStar: number;
};

export function getLeads(): Lead[] {
  return readJsonFile<Lead[]>("lists_leads.json");
}

export function getLeadTiers(): LeadTier[] {
  return readJsonFile<LeadTier[]>("lists_lead_tiers.json");
}

export function getLeadExp(): LeadExp[] {
  return readJsonFile<LeadExp[]>("lists_lead_exp.json");
}

// --------------- Skill Tree ---------------

export type SkillTreeNode = {
  key: string;
  title: string;
  tier: number;
  maxLevel: number;
  desc?: string;
  type?: string;
  col: number;
  row: number;
  parents: string[];
};

export type SkillTreeData = {
  nodes: SkillTreeNode[];
  maxCols: number;
  maxRows: number;
};

export function getSkillTreeData(): Record<string, SkillTreeData> {
  const skills = getSkills();
  const byType = new Map<string, Skill[]>();
  for (const s of skills) {
    const t = s.type || "Other";
    const list = byType.get(t) ?? [];
    list.push(s);
    byType.set(t, list);
  }

  const result: Record<string, SkillTreeData> = {};

  for (const [type, typeSkills] of byType) {
    const parentMap = new Map<string, string[]>();
    for (const s of typeSkills) {
      const lvl1 = s.levels[0];
      const parents = lvl1?.requiredSkills ? Object.keys(lvl1.requiredSkills) : [];
      parentMap.set(s.key, parents.filter((p) => typeSkills.some((ts) => ts.key === p)));
    }

    const tierGroups = new Map<number, Skill[]>();
    for (const s of typeSkills) {
      const tier = s.tier ?? 0;
      const list = tierGroups.get(tier) ?? [];
      list.push(s);
      tierGroups.set(tier, list);
    }

    const sortedTiers = Array.from(tierGroups.keys()).sort((a, b) => a - b);
    const tierToRow = new Map<number, number>();
    sortedTiers.forEach((t, i) => tierToRow.set(t, i));

    let maxCols = 0;
    for (const [, items] of tierGroups) {
      if (items.length > maxCols) maxCols = items.length;
    }
    maxCols = Math.max(maxCols, 1);

    const nodes: SkillTreeNode[] = [];
    const nodeColMap = new Map<string, number>();

    for (const tierVal of sortedTiers) {
      const items = tierGroups.get(tierVal)!;
      const row = tierToRow.get(tierVal)!;
      const n = items.length;

      const parentAvgs: { skill: Skill; avg: number }[] = items.map((s) => {
        const pKeys = parentMap.get(s.key) ?? [];
        const pCols = pKeys.map((k) => nodeColMap.get(k)).filter((c): c is number => c !== undefined);
        const avg = pCols.length > 0 ? pCols.reduce((a, b) => a + b, 0) / pCols.length : -1;
        return { skill: s, avg };
      });

      parentAvgs.sort((a, b) => {
        if (a.avg >= 0 && b.avg >= 0) return a.avg - b.avg;
        if (a.avg >= 0) return -1;
        if (b.avg >= 0) return 1;
        return a.skill.title.localeCompare(b.skill.title);
      });

      const startCol = (maxCols - n) / 2;
      parentAvgs.forEach(({ skill: s }, idx) => {
        const col = startCol + idx;
        nodeColMap.set(s.key, col);
        nodes.push({
          key: s.key,
          title: s.title,
          tier: s.tier ?? 0,
          maxLevel: s.levels.length,
          desc: s.desc,
          type: s.type,
          col,
          row,
          parents: parentMap.get(s.key) ?? [],
        });
      });
    }

    result[type] = { nodes, maxCols, maxRows: sortedTiers.length };
  }

  return result;
}

// --------------- Clans ---------------

export type ClanLevel = {
  level: number;
  exp: number;
  members: number;
};

export function getClanLevels(): ClanLevel[] {
  return readJsonFile<ClanLevel[]>("lists_clan.json");
}

export type ClanRank = {
  key: string;
  title: string;
  points: number;
  isOwner?: boolean;
  isDeputy?: boolean;
};

export function getClanRanks(): ClanRank[] {
  return readJsonFile<ClanRank[]>("lists_clan_ranks.json");
}

export type ClanReward = {
  key: string;
  title: string;
  level: number;
  hours: number;
  food?: number;
  wood?: number;
  stone?: number;
  gem?: number;
};

export function getClanRewards(): ClanReward[] {
  return readJsonFile<ClanReward[]>("lists_clan_rewards.json");
}

// --------------- Referral ---------------

export type ReferralInviteTier = {
  from: number;
  to: number | null;
  per_friend_gems: number;
  per_friend_gems_premium: number;
};

export type ReferralInvite = {
  headline_ru: string;
  headline_en: string;
  max_per_friend_gems: number;
  friend_reward_gems: number;
  friend_reward_gems_premium: number;
  premium_multiplier: number;
  requirement_ru: string;
  requirement_en: string;
  tiers: ReferralInviteTier[];
};

export type ReferralRevshare = {
  share_percent: number;
  withdraw: {
    min_usdt: number;
    support_contact: string;
    note_ru: string;
    note_en: string;
  };
  convert: {
    min_stars: number;
    note_ru: string;
    note_en: string;
  };
};

export type ReferralData = {
  invite: ReferralInvite;
  revshare: ReferralRevshare;
};

export function getReferralData(): ReferralData {
  return readJsonFile<ReferralData>("lists_referral.json");
}

// --------------- WAR ---------------

export type WarTimelineEvent = {
  key: string;
  label_ru: string;
  label_en: string;
  at: string; // ISO string in UTC (Z)
};

export type WarSection = {
  title_ru: string;
  title_en: string;
  bullets_ru: string[];
  bullets_en: string[];
};

export type WarBuyback = {
  title_ru: string;
  title_en: string;
  rules_ru: string[];
  rules_en: string[];
  timeline_utc0: WarTimelineEvent[];
  fund_ru: string[];
  fund_en: string[];
};

export type WarWithdraw = {
  title_ru: string;
  title_en: string;
  bullets_ru: string[];
  bullets_en: string[];
  constraints: {
    min_balance_usdt: number;
    network_fee_usdt_max: number;
    payout_date_utc0: string; // YYYY-MM-DD
  };
};

export type WarData = {
  war: {
    season: {
      number: number;
      pool_usdt_current: number;
      pool_label_ru: string;
      pool_label_en: string;
    };
    token: string;
    usdt: string;
    earn: WarSection;
    buyback: WarBuyback;
    min_threshold: WarSection;
    seasons: WarSection;
    withdraw_usdt: WarWithdraw;
    important: WarSection;
  };
};

export function getWarData(): WarData {
  return readJsonFile<WarData>("lists_war.json");
}

// --------------- Quests ---------------

export type QuestMain = {
  key: string;
  type: string;
  data?: string;
  order: number;
  count: number;
  food?: number;
  wood?: number;
  stone?: number;
  gem?: number;
};

export type QuestSide = {
  key: string;
  type: string;
  data?: string;
  counts: number[];
  food?: number[];
  wood?: number[];
  stone?: number[];
  gem?: number[];
};

export type QuestDaily = {
  key: string;
  type: string;
  data?: string;
  count: number;
  food?: number;
  wood?: number;
  stone?: number;
  points: number;
};

export type QuestDailyReward = {
  key: string;
  points: number;
  food?: number;
  wood?: number;
  stone?: number;
  gem?: number;
  box?: string;
};

export type QuestBot = {
  key: string;
  title: string;
  reward: number;
  actionText: string;
  actionUrl: string;
  desc: string;
  isArchived?: boolean;
  checkType: string;
  checkData: string;
  dateStart?: string;
  dateEnd?: string;
};

export function getQuestsMain(): QuestMain[] {
  return readJsonFile<QuestMain[]>("lists_quests_main.json");
}

export function getQuestsSide(): QuestSide[] {
  return readJsonFile<QuestSide[]>("lists_quests_side.json");
}

export function getQuestsDaily(): QuestDaily[] {
  return readJsonFile<QuestDaily[]>("lists_quests_story_daily.json");
}

export function getQuestsDailyRewards(): QuestDailyReward[] {
  return readJsonFile<QuestDailyReward[]>("lists_quests_story_daily_rewards.json");
}

export function getQuestsBot(): QuestBot[] {
  return readJsonFile<QuestBot[]>("lists_quests_bot.json");
}

// --------------- Shared ---------------

export function indexByKey<T extends { key: string }>(
  items: T[],
): Map<string, T> {
  return new Map(items.map((it) => [it.key, it]));
}
