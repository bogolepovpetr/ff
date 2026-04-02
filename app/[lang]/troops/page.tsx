import Link from "next/link";
import { getTroopGroups } from "@/lib/data";
import { getLore } from "@/lib/lore";
import { tierColor, buildingName, formatTime, formatCost, troopTypeName } from "@/lib/format";
import { troopImage } from "@/lib/images";
import { ResourceIcon } from "@/components/wiki/resource-icon";

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

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-red-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {lore.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {lore.intro}
        </p>
      </div>

      {/* Building sections */}
      {orderedBuildings.map((buildingKey) => {
        const tiers = groups.get(buildingKey)!;
        return (
          <section key={buildingKey}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              <span className="h-1.5 w-5 rounded-full bg-red-400" />
              {buildingName(buildingKey, lang)}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {tiers.map((group) => {
                const tc = tierColor(group.tier);
                const sample = group.troops[0];

                return (
                  <Link
                    key={`${buildingKey}-${group.tier}`}
                    href={`/${lang}/troops/${buildingKey}/${group.tier}`}
                    className={`group relative flex flex-col rounded-xl border-2 ${tc.border} ${tc.bg} p-4 transition-all hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    {/* Tier badge */}
                    <span
                      className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${tc.badge}`}
                    >
                      {lang === "ru" ? "Тир" : "Tier"} {group.tier}
                    </span>

                    <div className="flex items-start gap-3">
                      {sample?.key ? (
                        <img
                          src={troopImage(sample.key)}
                          alt={troopTypeName(group.title, lang)}
                          className="h-14 w-14 shrink-0 rounded-lg object-contain"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-bold ${tc.text}`}>
                          {troopTypeName(group.title, lang)}
                        </p>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
                      <Stat
                        label="ATK"
                        value={String(sample?.atk ?? "—")}
                      />
                      <Stat
                        label="DEF"
                        value={String(sample?.def ?? "—")}
                      />
                      <Stat
                        label={lang === "ru" ? "Время" : "Time"}
                        value={formatTime(sample?.time)}
                      />
                      <Stat
                        label={lang === "ru" ? "Мощь" : "Power"}
                        value={String(sample?.power ?? "—")}
                      />
                    </div>

                    {/* Cost preview */}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
                      {sample?.priceFood ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="food" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceFood)}
                        </span>
                      ) : null}
                      {sample?.priceWood ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="wood" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceWood)}
                        </span>
                      ) : null}
                      {sample?.priceStone ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="stone" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceStone)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-zinc-700">{value}</span>
    </div>
  );
}
