import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getLeads, getLeadTiers, getLeadExp, indexByKey } from "@/lib/data";
import {
  tierColor,
  heroTierName,
  roleName,
  formatCost,
  humanizeBonus,
} from "@/lib/format";
import { getGameVersion } from "@/lib/version";
import { heroImage } from "@/lib/images";
import LoreQuote from "@/components/wiki/lore-quote";
import PatchBadge from "@/components/wiki/patch-badge";
import { ResourceIcon } from "@/components/wiki/resource-icon";

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ lang: string; key: string }>;
}) {
  const { lang, key } = await params;
  const leads = getLeads();
  const hero = indexByKey(leads).get(key);
  if (!hero) notFound();

  const leadTiers = getLeadTiers();
  const tierInfo = leadTiers.find((t) => t.key === hero.tier);
  const leadExp = getLeadExp();
  const tc = tierColor(hero.tier);

  const ver = getGameVersion();
  const bonusEntries = hero.bonusPerLevel
    ? Object.entries(hero.bonusPerLevel)
    : [];

  const loreText =
    hero.desc ??
    (lang === "ru"
      ? `${hero.title} — легендарный герой, способный изменить ход сражения.`
      : `${hero.title} is a legendary hero capable of turning the tide of battle.`);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link
          href={`/${lang}/heroes`}
          className="hover:text-amber-700 hover:underline"
        >
          {lang === "ru" ? "Герои" : "Heroes"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{hero.title}</span>
      </nav>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      {/* Title + Infobox */}
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{hero.title}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-bold ${tc.badge}`}
              >
                {heroTierName(hero.tier, lang)}
              </span>
              {hero.role && (
                <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-semibold text-zinc-700">
                  {roleName(hero.role, lang)}
                </span>
              )}
              {hero.aspect && (
                <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold capitalize text-indigo-800">
                  {hero.aspect}
                </span>
              )}
            </div>
          </div>

          <LoreQuote text={loreText} />
        </div>

        {/* Infobox */}
        <div className="w-full shrink-0 md:w-64">
          <div className={`rounded-xl border-2 ${tc.border} bg-white`}>
            <div className="flex justify-center border-b border-zinc-100 p-4">
              <img
                src={heroImage(key)}
                alt={hero.title}
                className="h-56 w-56 rounded-lg object-cover"
              />
            </div>
            <div className="space-y-2 p-4 text-sm">
              <InfoRow
                label={lang === "ru" ? "Тир" : "Tier"}
                value={heroTierName(hero.tier, lang)}
              />
              <InfoRow
                label={lang === "ru" ? "Роль" : "Role"}
                value={hero.role ? roleName(hero.role, lang) : "—"}
              />
              <InfoRow
                label={lang === "ru" ? "Аспект" : "Aspect"}
                value={hero.aspect ?? "—"}
              />
              <InfoRow
                label={lang === "ru" ? "Стоимость" : "Cost"}
                value={
                  hero.priceGem
                    ? (
                      <span className="inline-flex items-center gap-0.5">
                        <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                        {formatCost(hero.priceGem)}
                      </span>
                    )
                    : "—"
                }
              />
              <InfoRow
                label={lang === "ru" ? "Карт для открытия" : "Cards to unlock"}
                value={hero.cardCount ? String(hero.cardCount) : "—"}
              />
              <InfoRow
                label={lang === "ru" ? "Цена карты" : "Card price"}
                value={
                  hero.cardPriceGem
                    ? (
                      <span className="inline-flex items-center gap-0.5">
                        <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                        {formatCost(hero.cardPriceGem)}
                      </span>
                    )
                    : "—"
                }
              />
              <InfoRow
                label={lang === "ru" ? "Макс. уровень" : "Max level"}
                value="50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blocked timer buildings */}
      {hero.blockedTimerInBuilding && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-2 text-lg font-bold text-slate-800">
            {lang === "ru" ? "Ускоряет здания" : "Blocked Timer in Buildings"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {hero.blockedTimerInBuilding.split(",").map((b) => (
              <span
                key={b}
                className="rounded-lg bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800"
              >
                {b
                  .trim()
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Bonus per level summary */}
      {bonusEntries.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {bonusEntries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2"
            >
              <span className="text-sm text-zinc-500">{humanizeBonus(k)}</span>
              <span className="text-sm font-bold text-emerald-700">+{v}</span>
              <span className="text-[10px] text-zinc-400">
                {lang === "ru" ? "/ ур." : "/ lvl"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Level Progression Table */}
      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">
            {lang === "ru" ? "Прогресс по уровням" : "Level Progression"}
          </h2>
          {tierInfo && tierInfo.leadExpMultiplicator > 1 && (
            <p className="text-xs text-zinc-400">
              {lang === "ru"
                ? `Множитель EXP для этого тира: x${tierInfo.leadExpMultiplicator}`
                : `EXP multiplier for this tier: x${tierInfo.leadExpMultiplicator}`}
            </p>
          )}
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5">
                  {lang === "ru" ? "Ур." : "Lvl"}
                </th>
                <th className="px-4 py-2.5 text-right">EXP</th>
                {bonusEntries.map(([k]) => (
                  <th key={k} className="px-4 py-2.5 text-right">
                    {humanizeBonus(k)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leadExp.map((e, i) => {
                const mult = tierInfo?.leadExpMultiplicator ?? 1;
                const actualExp = e.exp * mult;
                return (
                  <tr
                    key={e.level}
                    className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className={`px-4 py-2 font-bold ${tc.text}`}>
                      {e.level}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums text-zinc-700">
                      {actualExp.toLocaleString("en-US")}
                    </td>
                    {bonusEntries.map(([k, v]) => {
                      const total = +(v * e.level).toFixed(2);
                      return (
                        <td
                          key={k}
                          className="px-4 py-2 text-right tabular-nums font-medium text-emerald-700"
                        >
                          +{total % 1 === 0 ? total : total.toFixed(2).replace(/0+$/, "")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-medium text-zinc-800">{value}</span>
    </div>
  );
}
