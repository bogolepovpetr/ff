import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getSkills, getBuildings, getFilteredTroops, indexByKey } from "@/lib/data";
import { getManualDoc } from "@/lib/manual";
import { formatCost, formatTime, joinReqs, buildingName } from "@/lib/format";
import { getGameVersion } from "@/lib/version";
import { troopImage } from "@/lib/images";
import LoreQuote from "@/components/wiki/lore-quote";
import PatchBadge from "@/components/wiki/patch-badge";
import { ResourceIcon } from "@/components/wiki/resource-icon";
import SkillArt from "@/components/wiki/skill-art";

export default async function SkillPage({
  params,
}: {
  params: Promise<{ lang: string; key: string }>;
}) {
  const { lang, key } = await params;
  const skill = indexByKey(getSkills()).get(key);
  if (!skill) notFound();

  const manual = getManualDoc({ lang, entity: "skills", key });

  const effectKeys = new Set<string>();
  for (const lvl of skill.levels) {
    for (const k of Object.keys(lvl)) {
      if (k.startsWith("bonus")) effectKeys.add(k);
    }
  }
  const effectCols = Array.from(effectKeys).sort();

  const allBuildings = getBuildings();
  const allSkills = getSkills();
  const nameMap = new Map<string, string>();
  for (const b of allBuildings) nameMap.set(b.key, b.title);
  for (const s of allSkills) nameMap.set(s.key, s.title);

  const ver = getGameVersion();

  const unlockedTroops = getFilteredTroops().filter(
    (t) =>
      t.requiredSkills &&
      Object.prototype.hasOwnProperty.call(t.requiredSkills, key),
  );

  const loreText =
    skill.desc ??
    (lang === "ru"
      ? `${skill.title} — навык, открывающий новые горизонты для вашей империи. Исследуйте его, чтобы получить стратегическое преимущество.`
      : `${skill.title} is a skill that opens new horizons for your empire. Research it to gain a strategic advantage over your rivals.`);

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/skills`} className="hover:text-amber-700 hover:underline">
          {lang === "ru" ? "Навыки" : "Skills"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{skill.title}</span>
      </nav>

      {/* Title + Infobox row */}
      <div className="flex flex-col gap-5 md:flex-row">
        {/* Left */}
        <div className="flex-1 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{skill.title}</h1>
            <div className="mt-1 flex flex-wrap gap-2">
              {skill.type && (
                <span className="rounded-full bg-violet-100 px-3 py-0.5 text-xs font-semibold text-violet-800">
                  {skill.type}
                </span>
              )}
              {skill.tier != null && (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                  Tier {skill.tier}
                </span>
              )}
            </div>
          </div>

          <LoreQuote text={loreText} />

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
              <SkillArt
                lang={lang}
                skillKey={key}
                skillTitle={skill.title}
                fallbackIconKey={effectCols[0]}
              />
            </div>
            <div className="space-y-2 p-4 text-sm">
              <InfoRow
                label={lang === "ru" ? "Тип" : "Type"}
                value={skill.type ?? "—"}
              />
              <InfoRow
                label={lang === "ru" ? "Тир" : "Tier"}
                value={skill.tier != null ? String(skill.tier) : "—"}
              />
              <InfoRow
                label={lang === "ru" ? "Макс. уровень" : "Max level"}
                value={String(skill.levels.length)}
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
              ? "Время исследования указано без учёта бонусов"
              : "Research times shown without bonus modifiers"}
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
              {skill.levels.map((lvl, i) => {
                const bEntries = lvl.requiredBuildings ? Object.entries(lvl.requiredBuildings) : [];
                const sEntries = lvl.requiredSkills ? Object.entries(lvl.requiredSkills) : [];
                const hasReqs = bEntries.length > 0 || sEntries.length > 0 || !!lvl.requiredFriends;

                return (
                  <tr
                    key={lvl.level}
                    className={`border-b border-zinc-100 align-top ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className="px-4 py-2 font-bold text-violet-700">
                      {lvl.level}
                    </td>
                    <td className="px-4 py-2">
                      <CostCell
                        food={lvl.priceFood}
                        wood={lvl.priceWood}
                        stone={lvl.priceStone}
                        gem={lvl.priceGem}
                      />
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {formatTime(lvl.time)}
                    </td>
                    <td className="px-4 py-2 font-medium">{lvl.power ?? "—"}</td>
                    {effectCols.map((k) => (
                      <td key={k} className="px-4 py-2 text-zinc-700">
                        {typeof lvl[k] === "number"
                          ? (lvl[k] as number).toLocaleString("en-US")
                          : String(lvl[k] ?? "—")}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-zinc-600">
                      {hasReqs ? (
                        <span className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                          {bEntries.map(([bk, bv]) => (
                            <span key={bk}>
                              <Link
                                href={`/${lang}/buildings/${bk}`}
                                className="text-amber-700 underline decoration-amber-300 hover:text-amber-600"
                              >
                                {nameMap.get(bk) ?? bk}
                              </Link>
                              {" Lv."}{bv}
                            </span>
                          ))}
                          {sEntries.map(([sk, sv]) => (
                            <span key={sk}>
                              <Link
                                href={`/${lang}/skills/${sk}`}
                                className="text-violet-700 underline decoration-violet-300 hover:text-violet-600"
                              >
                                {nameMap.get(sk) ?? sk}
                              </Link>
                              {" Lv."}{sv}
                            </span>
                          ))}
                          {lvl.requiredFriends && (
                            <span>{lvl.requiredFriends} {lang === "ru" ? "друзей" : "friends"}</span>
                          )}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Unlocked troops */}
      {unlockedTroops.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            {lang === "ru" ? "Открывает войска" : "Unlocks Troops"}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
              {unlockedTroops
              .slice()
              .sort((a, b) => a.title.localeCompare(b.title))
              .map((t) => (
                <Link
                  key={t.key}
                  href={`/${lang}/troops/${t.building}/${t.tier ?? 1}`}
                  className="flex items-center gap-2 rounded-lg border border-zinc-100 p-2 transition-colors hover:border-amber-300 hover:bg-amber-50/40"
                >
                  <img
                    src={troopImage(t.key)}
                    alt={t.title}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800">
                      {t.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {buildingName(t.building, lang)} &middot; Tier {t.tier ?? 1}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      )}
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
  const parts: { res: string; val: string }[] = [];
  if (food) parts.push({ res: "food", val: formatCost(food) });
  if (wood) parts.push({ res: "wood", val: formatCost(wood) });
  if (stone) parts.push({ res: "stone", val: formatCost(stone) });
  if (gem) parts.push({ res: "gem", val: formatCost(gem) });
  if (parts.length === 0) return <span className="text-zinc-400">—</span>;
  return (
    <div className="flex flex-col gap-0.5">
      {parts.map((p) => (
        <span key={p.res} className="inline-flex items-center gap-0.5 whitespace-nowrap">
          {p.res === "food" || p.res === "wood" || p.res === "stone" || p.res === "gem" ? (
            <ResourceIcon res={p.res} className="inline-block h-4 w-4" />
          ) : null}
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
