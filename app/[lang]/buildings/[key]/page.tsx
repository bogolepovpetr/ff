import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getBuildings, indexByKey } from "@/lib/data";
import { getManualDoc } from "@/lib/manual";
import { formatCost, formatTime, joinReqs, buildingName } from "@/lib/format";
import { getGameVersion } from "@/lib/version";
import { buildingImage } from "@/lib/images";
import LoreQuote from "@/components/wiki/lore-quote";
import PatchBadge from "@/components/wiki/patch-badge";
import { ResourceIcon, type ResourceKey } from "@/components/wiki/resource-icon";

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ lang: string; key: string }>;
}) {
  const { lang, key } = await params;
  const building = indexByKey(getBuildings()).get(key);
  if (!building) notFound();

  const manual = getManualDoc({ lang, entity: "buildings", key });

  const effectKeys = new Set<string>();
  for (const lvl of building.levels) {
    for (const k of Object.keys(lvl)) {
      if (k.startsWith("bonus") && !["bonus", "bonusRate", "bonusValue"].includes(k)) {
        effectKeys.add(k);
      }
    }
  }
  const effectCols = Array.from(effectKeys).sort();

  const allBuildings = getBuildings();
  const buildingNameMap = new Map<string, string>();
  for (const b of allBuildings) {
    buildingNameMap.set(b.key, b.title);
  }

  const ver = getGameVersion();

  const loreText =
    lang === "ru"
      ? `${building.title} — одно из ключевых зданий вашей империи. Развивайте его, чтобы открыть новые возможности и усилить свои позиции.`
      : `The ${building.title} is a vital structure in your empire. Upgrade it to unlock new capabilities and strengthen your position.`;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/buildings`} className="hover:text-amber-700 hover:underline">
          {lang === "ru" ? "Здания" : "Buildings"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{building.title}</span>
      </nav>

      {/* Title + Infobox row */}
      <div className="flex flex-col gap-5 md:flex-row">
        {/* Left: title + lore */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {building.title}
            </h1>
            {building.type && (
              <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                {building.type}
              </span>
            )}
          </div>

          {building.desc && <LoreQuote text={building.desc} />}
          {!building.desc && <LoreQuote text={loreText} />}

          {manual && (
            <div
              className="prose prose-zinc max-w-none rounded-xl border border-zinc-200 bg-white p-5"
              dangerouslySetInnerHTML={{ __html: manual.html }}
            />
          )}
        </div>

        {/* Right: infobox */}
        <div className="w-full shrink-0 md:w-64">
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="flex justify-center border-b border-zinc-100 p-4">
              <img
                src={buildingImage(building.key)}
                alt={building.title}
                className="h-56 w-56 shrink-0 rounded-lg object-cover"
              />
            </div>
            <div className="space-y-2 p-4 text-sm">
              <InfoRow label={lang === "ru" ? "Тип" : "Type"} value={building.type ?? "—"} />
              <InfoRow label={lang === "ru" ? "Уровней" : "Levels"} value={String(building.levels.length)} />
              <InfoRow
                label={lang === "ru" ? "Макс. мощь" : "Max power"}
                value={
                  building.levels.length
                    ? String(building.levels[building.levels.length - 1].power ?? "—")
                    : "—"
                }
              />
            </div>
          </div>
        </div>
      </div>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      {/* Progression table */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === "ru" ? "Прогрессия" : "Progression"}
          </h2>
          <p className="text-xs text-zinc-400">
            {lang === "ru"
              ? "Время строительства указано без учёта бонусов"
              : "Build times shown without bonus modifiers"}
          </p>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5">{lang === "ru" ? "Ур." : "Lvl"}</th>
                <th className="px-4 py-2.5">{lang === "ru" ? "Стоимость" : "Cost"}</th>
                <th className="px-4 py-2.5">{lang === "ru" ? "Время" : "Time"}</th>
                <th className="px-4 py-2.5">{lang === "ru" ? "Мощь" : "Power"}</th>
                {effectCols.map((k) => (
                  <th key={k} className="px-4 py-2.5">
                    {humanizeBonus(k)}
                  </th>
                ))}
                <th className="px-4 py-2.5">{lang === "ru" ? "Требования" : "Requirements"}</th>
              </tr>
            </thead>
            <tbody>
              {building.levels.map((lvl, i) => (
                <tr
                  key={lvl.level}
                  className={`border-b border-zinc-100 align-top ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-4 py-2 font-bold text-amber-700">{lvl.level}</td>
                  <td className="px-4 py-2">
                    <CostCell
                      food={lvl.priceFood}
                      wood={lvl.priceWood}
                      stone={lvl.priceStone}
                      gem={lvl.priceGem}
                    />
                  </td>
                  <td className="px-4 py-2 text-zinc-700">{formatTime(lvl.time)}</td>
                  <td className="px-4 py-2 font-medium">{lvl.power ?? "—"}</td>
                  {effectCols.map((k) => (
                    <td key={k} className="px-4 py-2 text-zinc-700">
                      {typeof lvl[k] === "number"
                        ? (lvl[k] as number).toLocaleString("en-US")
                        : String(lvl[k] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-zinc-600">
                    {lvl.requiredBuildings && Object.keys(lvl.requiredBuildings).length > 0
                      ? Object.entries(lvl.requiredBuildings).map(([bk, bv], ri, arr) => (
                          <span key={bk}>
                            <Link
                              href={`/${lang}/buildings/${bk}`}
                              className="text-amber-700 underline decoration-amber-300 hover:text-amber-600"
                            >
                              {buildingNameMap.get(bk) ?? bk}
                            </Link>
                            {" Lv."}{bv}{ri < arr.length - 1 ? ", " : ""}
                          </span>
                        ))
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-800">{value}</span>
    </div>
  );
}

function CostCell({
  food,
  wood,
  stone,
  gem,
}: {
  food?: number;
  wood?: number;
  stone?: number;
  gem?: number;
}) {
  const parts: { res: ResourceKey; val: string }[] = [];
  if (food) parts.push({ res: "food", val: formatCost(food) });
  if (wood) parts.push({ res: "wood", val: formatCost(wood) });
  if (stone) parts.push({ res: "stone", val: formatCost(stone) });
  if (gem) parts.push({ res: "gem", val: formatCost(gem) });
  if (parts.length === 0) return <span className="text-zinc-400">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((p) => (
        <span key={p.res} className="inline-flex items-center gap-0.5 whitespace-nowrap">
          <ResourceIcon res={p.res} className="h-4 w-4 text-sky-600" />
          {p.val}
        </span>
      ))}
    </div>
  );
}

function humanizeBonus(key: string): string {
  return key
    .replace(/^bonus/, "")
    .replace(/([A-Z])/g, " $1")
    .trim();
}
