import type { Troop } from "@/lib/data";
import { buildingName, troopTypeName, raceName } from "@/lib/format";

/** Combat training buildings in UI order (barracks → … → scouts). */
export const BATTLE_SIM_BUILDING_ORDER = [
  "barracks",
  "archery_range",
  "stable",
  "siege_workshop",
  "scout_camp",
] as const;

export type BattleSimTierOption = {
  tier: number;
  key: string;
  label: string;
};

export type BattleSimBuildingSlots = {
  buildingKey: string;
  buildingLabel: string;
  tiers: BattleSimTierOption[];
};

export type BattleSimRaceLayout = {
  raceKey: string;
  raceLabel: string;
  buildings: BattleSimBuildingSlots[];
};

/**
 * One troop key per (race, building, tier) for the battle sim grid.
 */
export function buildBattleSimLayouts(
  troops: Troop[],
  lang: string,
): BattleSimRaceLayout[] {
  const byRace = new Map<string, Map<string, Map<number, Troop>>>();

  for (const t of troops) {
    if (!t.race) continue;
    if (!byRace.has(t.race)) byRace.set(t.race, new Map());
    const bm = byRace.get(t.race)!;
    if (!bm.has(t.building)) bm.set(t.building, new Map());
    const tm = bm.get(t.building)!;
    const tier = t.tier ?? 1;
    if (!tm.has(tier)) tm.set(tier, t);
  }

  const raceKeys = Array.from(byRace.keys()).sort();
  const layouts: BattleSimRaceLayout[] = [];

  for (const raceKey of raceKeys) {
    const bm = byRace.get(raceKey)!;
    const buildings: BattleSimBuildingSlots[] = [];

    for (const buildingKey of BATTLE_SIM_BUILDING_ORDER) {
      const tm = bm.get(buildingKey);
      if (!tm || tm.size === 0) continue;

      const tiers: BattleSimTierOption[] = Array.from(tm.entries())
        .sort(([a], [b]) => a - b)
        .map(([tier, troop]) => ({
          tier,
          key: troop.key,
          label: troopTypeName(troop.title, lang),
        }));

      buildings.push({
        buildingKey,
        buildingLabel: buildingName(buildingKey, lang),
        tiers,
      });
    }

    layouts.push({
      raceKey,
      raceLabel: raceName(raceKey, lang),
      buildings,
    });
  }

  return layouts;
}
