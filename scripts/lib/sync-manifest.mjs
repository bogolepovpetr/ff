import { fileURLToPath } from "node:url";
import path from "node:path";

export const RENAME_TO_WIKI = {
  "lists_lead.json": "lists_leads.json",
  "lists_lead_tier.json": "lists_lead_tiers.json",
  "lists_lead_star.json": "lists_lead_stars.json",
};

export const SKIP_WIKI_ONLY = new Set([
  "lists_referral.json",
  "lists_war.json",
  "lists_quests_bot.json",
  "lists_vip_wiki.json",
  "lists_arena_wiki.json",
]);

export const SYNC_FROM_MONO = [
  "lists_troops.json",
  "lists_buildings.json",
  "lists_skills.json",
  "lists_leads.json",
  "lists_lead_tiers.json",
  "lists_lead_stars.json",
  "lists_lead_exp.json",
  "lists_shop.json",
  "lists_races.json",
  "lists_clan.json",
  "lists_clan_ranks.json",
  "lists_clan_rewards.json",
  "lists_quests_main.json",
  "lists_quests_side.json",
  "lists_quests_story_daily.json",
  "lists_quests_story_daily_rewards.json",
  "lists_vip_pass.json",
  "lists_vip_streak.json",
  "lists_vip_time.json",
  "lists_battlepass.json",
  "lists_battlepass_topup.json",
  "lists_arena_pvp.json",
];

export function monoFileName(wikiFile) {
  return Object.entries(RENAME_TO_WIKI).find(([, v]) => v === wikiFile)?.[0] ?? wikiFile;
}

export function defaultMonoSchemaDir() {
  const libDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(libDir, "../../../../monorepo/backend/src/DB/Schema");
}
