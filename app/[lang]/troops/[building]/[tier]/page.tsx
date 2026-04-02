import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getTroopGroups, getSkills, getBuildings, indexByKey } from "@/lib/data";
import { getGameVersion } from "@/lib/version";
import {
  tierColor,
  buildingName,
  formatTime,
  formatCost,
  raceName,
  troopTypeName,
} from "@/lib/format";
import { troopImage } from "@/lib/images";
import TroopRacePanel from "@/components/wiki/troop-race-panel";
import PatchBadge from "@/components/wiki/patch-badge";

function buildRaceLabels(troops: { race?: string }[], lang: string): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const t of troops) {
    if (t.race && !(t.race in labels)) {
      labels[t.race] = raceName(t.race, lang);
    }
  }
  return labels;
}

export default async function TroopTierPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; building: string; tier: string }>;
  searchParams: Promise<{ race?: string }>;
}) {
  const { lang, building, tier: tierStr } = await params;
  const { race: initialRace } = await searchParams;
  const tier = parseInt(tierStr, 10);
  if (isNaN(tier)) notFound();

  const groups = getTroopGroups();
  const buildingGroups = groups.get(building);
  if (!buildingGroups) notFound();

  const group = buildingGroups.find((g) => g.tier === tier);
  if (!group) notFound();

  const tc = tierColor(tier);
  const bName = buildingName(building, lang);
  const troopName = troopTypeName(group.title, lang);

  const allSkills = getSkills();
  const allBuildings = getBuildings();
  const skillMap = indexByKey(allSkills);
  const ver = getGameVersion();

  const unlockedBySkill = allSkills.find((s) => {
    for (const t of group.troops) {
      if (t.requiredSkills && Object.prototype.hasOwnProperty.call(t.requiredSkills, s.key)) {
        return true;
      }
    }
    return false;
  });

  const troopsForPanel = group.troops
    .slice()
    .sort((a, b) => (a.race ?? "").localeCompare(b.race ?? ""));

  const statKeys: { key: keyof (typeof group.troops)[0]; label: string; labelRu: string }[] = [
    { key: "atk", label: "ATK", labelRu: "АТК" },
    { key: "def", label: "DEF", labelRu: "ЗАЩ" },
    { key: "speed", label: "Speed", labelRu: "Скорость" },
    { key: "load", label: "Load", labelRu: "Нагрузка" },
    { key: "time", label: "Train Time", labelRu: "Время" },
    { key: "power", label: "Power", labelRu: "Мощь" },
    { key: "priceFood", label: "Food", labelRu: "Еда" },
    { key: "priceWood", label: "Wood", labelRu: "Дерево" },
    { key: "priceStone", label: "Stone", labelRu: "Камень" },
  ];

  const buildingNameMap = new Map<string, string>();
  for (const b of allBuildings) buildingNameMap.set(b.key, buildingName(b.key, lang));
  const skillNameMap = new Map<string, string>();
  for (const s of allSkills) skillNameMap.set(s.key, s.title);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs — simplified: Troops > Troop name */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/troops`} className="hover:text-amber-700 hover:underline">
          {lang === "ru" ? "Войска" : "Troops"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{troopName}</span>
      </nav>

      {/* Building title bar + tier selector */}
      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h1 className="text-xl font-bold text-slate-900">{bName}</h1>
          <p className="text-xs text-zinc-400">
            {lang === "ru" ? "Тренировка" : "Training"}
          </p>
        </div>

        {/* Tier selector strip */}
        <div className="overflow-x-auto scrollbar-none px-4 py-5">
          <div className="flex items-end justify-center gap-2 sm:gap-3" style={{ minWidth: "min-content" }}>
            {buildingGroups
              .slice()
              .sort((a, b) => a.tier - b.tier)
              .map((g) => {
                const gtc = tierColor(g.tier);
                const isActive = g.tier === tier;
                const raceTroop = (initialRace
                  ? g.troops.find((t) => t.race === initialRace)
                  : null) ?? g.troops[0];
                return (
                  <div key={g.tier} className="flex shrink-0 flex-col items-center gap-1">
                    <Link
                      href={`/${lang}/troops/${building}/${g.tier}${initialRace ? `?race=${initialRace}` : ""}`}
                      className={`relative flex flex-col items-center rounded-xl border-2 p-1.5 transition-all sm:p-2 ${
                        isActive
                          ? `${gtc.border} ${gtc.bg} shadow-lg ring-2 ring-offset-1 ${gtc.border.replace("border-", "ring-")}`
                          : `border-zinc-200 bg-white hover:${gtc.bg} hover:shadow-md`
                      }`}
                      style={{ width: 70 }}
                    >
                      {raceTroop?.key ? (
                        <img
                          src={troopImage(raceTroop.key)}
                          alt={troopTypeName(g.title, lang)}
                          className={`h-9 w-9 shrink-0 rounded-lg object-contain sm:h-10 sm:w-10 ${isActive ? "ring-2 ring-white" : ""}`}
                        />
                      ) : null}
                      <span className={`mt-1 text-[10px] font-bold ${isActive ? gtc.text : "text-zinc-400"}`}>
                        T{g.tier}
                      </span>
                      <span className={`truncate text-center text-[9px] leading-tight sm:text-[10px] ${isActive ? gtc.text : "text-zinc-500"}`} style={{ maxWidth: 60 }}>
                        {troopTypeName(g.title, lang)}
                      </span>
                    </Link>
                    {isActive && (
                      <div className={`h-0 w-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent ${gtc.border.replace("border-", "border-t-")}`} />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      {/* Unlock note */}
      {unlockedBySkill && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {lang === "ru" ? "Открывается после изучения " : "It is unlocked upon research of the "}
          <Link
            href={`/${lang}/skills/${unlockedBySkill.key}`}
            className="font-semibold text-amber-900 underline decoration-amber-400 hover:text-amber-700"
          >
            {unlockedBySkill.title}
          </Link>
          {lang === "ru" ? " технологии." : " technology."}
        </div>
      )}

      {/* Troop info panel with race selector */}
      <div className={`rounded-xl border-2 ${tc.border} bg-white overflow-hidden`}>
        <div className={`${tc.bg} px-5 py-3`}>
          <h2 className={`text-lg font-bold ${tc.text}`}>{troopName}</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tc.badge}`}>
            {lang === "ru" ? "Тир" : "Tier"} {tier}
          </span>
        </div>

        <TroopRacePanel
          troops={troopsForPanel}
          tierColors={tc}
          lang={lang}
          raceLabels={buildRaceLabels(troopsForPanel, lang)}
          initialRace={initialRace}
        />
      </div>

      {/* Race comparison table */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === "ru" ? "Сравнение по расам" : "Race Comparison"}
          </h2>
          <p className="text-xs text-zinc-400">
            {lang === "ru"
              ? "Характеристики одного юнита данного тира"
              : "Per-unit stats for this tier"}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5">{lang === "ru" ? "Раса" : "Race"}</th>
                <th className="px-4 py-2.5">{lang === "ru" ? "Название" : "Title"}</th>
                {statKeys.map((s) => (
                  <th key={s.key} className="px-4 py-2.5">
                    {lang === "ru" ? s.labelRu : s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {troopsForPanel.map((t, i) => (
                <tr
                  key={t.key}
                  className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-4 py-2 font-semibold capitalize text-zinc-800">
                    {raceName(t.race ?? "—", lang)}
                  </td>
                  <td className="px-4 py-2 text-zinc-600">{t.title}</td>
                  {statKeys.map((s) => {
                    const val = t[s.key];
                    let display: string;
                    if (s.key === "time") {
                      display = formatTime(val as number | undefined);
                    } else if (
                      s.key === "priceFood" ||
                      s.key === "priceWood" ||
                      s.key === "priceStone"
                    ) {
                      display = formatCost(val as number | undefined);
                    } else {
                      display =
                        typeof val === "number"
                          ? val.toLocaleString("en-US")
                          : "—";
                    }

                    const allVals = group.troops
                      .map((tr) => tr[s.key])
                      .filter((v): v is number => typeof v === "number");
                    const max = Math.max(...allVals);
                    const isMax =
                      typeof val === "number" &&
                      val === max &&
                      allVals.length > 1 &&
                      new Set(allVals).size > 1;

                    return (
                      <td
                        key={s.key}
                        className={`px-4 py-2 ${isMax ? "font-bold text-emerald-700" : "text-zinc-700"}`}
                      >
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Requirements with clickable links */}
      {group.troops[0]?.requiredBuildings &&
        Object.keys(group.troops[0].requiredBuildings).length > 0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-lg font-bold text-slate-800">
              {lang === "ru" ? "Требования" : "Requirements"}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
              {Object.entries(group.troops[0].requiredBuildings).map(
                ([bld, lvl]) => (
                  <Link
                    key={bld}
                    href={`/${lang}/buildings/${bld}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1 transition-colors hover:border-amber-300 hover:bg-amber-50"
                  >
                    {buildingNameMap.get(bld) ?? bld}{" "}
                    <span className="font-bold">Lv.{lvl}</span>
                  </Link>
                ),
              )}
              {group.troops[0]?.requiredSkills &&
                Object.entries(group.troops[0].requiredSkills).map(
                  ([sk, lvl]) => (
                    <Link
                      key={sk}
                      href={`/${lang}/skills/${sk}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-100 bg-violet-50 px-3 py-1 text-violet-800 transition-colors hover:border-violet-300 hover:bg-violet-100"
                    >
                      {skillNameMap.get(sk) ?? sk}{" "}
                      <span className="font-bold">Lv.{lvl}</span>
                    </Link>
                  ),
                )}
            </div>
          </section>
        )}
    </div>
  );
}
