import { getTroopGroups, getPlayableRaces } from "@/lib/data";
import { getLore } from "@/lib/lore";
import { tierColor, buildingName, troopTypeName } from "@/lib/format";
import TroopsPageClient from "@/components/wiki/troops-page-client";

const BUILDING_ORDER = [
  "barracks",
  "archery_range",
  "stable",
  "siege_workshop",
  "scout_camp",
];

export default async function TroopsIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lore = getLore("troops", lang);
  const groups = getTroopGroups();

  const orderedBuildings = BUILDING_ORDER.filter((b) => groups.has(b));

  const groupsByBuilding: Record<string, ReturnType<typeof getTroopGroups> extends Map<string, infer V> ? V : never> = {};
  for (const b of orderedBuildings) {
    groupsByBuilding[b] = groups.get(b)!;
  }

  const buildingLabels: Record<string, string> = {};
  for (const b of orderedBuildings) {
    buildingLabels[b] = buildingName(b, lang);
  }

  const allTiers = new Set<number>();
  for (const tiers of groups.values()) {
    for (const g of tiers) allTiers.add(g.tier);
  }
  const tierLabels: Record<number, ReturnType<typeof tierColor>> = {};
  for (const t of allTiers) {
    tierLabels[t] = tierColor(t);
  }

  const troopTypeLabels: Record<string, string> = {};
  for (const tiers of groups.values()) {
    for (const g of tiers) {
      if (!(g.title in troopTypeLabels)) {
        troopTypeLabels[g.title] = troopTypeName(g.title, lang);
      }
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-red-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {lore.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {lore.intro}
        </p>
      </div>

      <TroopsPageClient
        lang={lang}
        buildingOrder={orderedBuildings}
        groupsByBuilding={groupsByBuilding}
        buildingLabels={buildingLabels}
        tierLabels={tierLabels}
        troopTypeLabels={troopTypeLabels}
        races={getPlayableRaces().map((r) => ({ key: r.key, title: r.title, desc: r.desc }))}
      />
    </div>
  );
}
