"use client";

import { useMemo, useState } from "react";

export type HeroLevelRow = { level: number; exp: number };

export type HeroBonusCol = {
  key: string;
  label: string;
  perLevel: number;
};

export type HeroStarRank = {
  stars: number;
  maxLevel: number;
  bonusMult: number;
};

type Props = {
  lang: string;
  expTierMult: number;
  levelTextClass: string;
  rows: HeroLevelRow[];
  bonusCols: HeroBonusCol[];
  starRanks: HeroStarRank[];
};

export default function HeroLevelProgression({
  lang,
  expTierMult,
  levelTextClass,
  rows,
  bonusCols,
  starRanks,
}: Props) {
  const sortedStars = useMemo(
    () => [...starRanks].sort((a, b) => a.stars - b.stars),
    [starRanks],
  );
  const [stars, setStars] = useState(5);

  const rank = sortedStars.find((r) => r.stars === stars) ?? sortedStars[sortedStars.length - 1]!;
  const maxLevel = rank.maxLevel;
  const bonusMult = rank.bonusMult;

  const visibleRows = rows.filter((r) => r.level <= maxLevel);

  const locale = lang === "ru" ? "ru-RU" : "en-US";

  function expDelta(level: number, cumulative: number): number | null {
    if (level <= 1) return null;
    const prev = rows.find((r) => r.level === level - 1);
    if (!prev) return null;
    return cumulative - prev.exp;
  }

  function formatBonus(n: number): string {
    const total = +n.toFixed(4);
    if (Number.isInteger(total)) return String(total);
    return total.toFixed(2).replace(/\.?0+$/, "");
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-3">
        <h2 className="text-lg font-bold text-slate-800">
          {lang === "ru" ? "Прогресс по уровням (геройский EXP)" : "Level progression (hero EXP)"}
        </h2>
        {expTierMult > 1 && (
          <p className="text-xs text-zinc-400">
            {lang === "ru"
              ? `Множитель геройского EXP для этого тира: ×${expTierMult}`
              : `Hero EXP multiplier for this tier: ×${expTierMult}`}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {lang === "ru"
            ? "Выберите звёздность: видны только уровни, доступные при таком количестве звёзд. Бонусы считаются с множителем звёзд. EXP в строке — сколько нужно набрать, чтобы перейти на этот уровень."
            : "Choose stars: only levels available at that star count are shown. Bonuses include the star multiplier. EXP per row is the amount needed to reach that level from the previous one."}
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {lang === "ru" ? "Звёзды" : "Stars"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sortedStars.map((r) => {
              const active = stars === r.stars;
              return (
                <button
                  key={r.stars}
                  type="button"
                  onClick={() => setStars(r.stars)}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-amber-400 bg-amber-100 text-amber-900 shadow-sm"
                      : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-white"
                  }`}
                  title={
                    lang === "ru"
                      ? `Макс. ур. ${r.maxLevel}, бонус ×${r.bonusMult}`
                      : `Max lvl ${r.maxLevel}, bonus ×${r.bonusMult}`
                  }
                >
                  {r.stars === 0 ? (lang === "ru" ? "0 ★" : "0 ★") : "★".repeat(r.stars)}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {lang === "ru" ? (
            <>
              При выбранной звёздности: макс. уровень <strong>{maxLevel}</strong>, множитель бонуса{" "}
              <strong>{Math.round(bonusMult * 100)}%</strong>
            </>
          ) : (
            <>
              At this star rank: max level <strong>{maxLevel}</strong>, bonus multiplier{" "}
              <strong>{Math.round(bonusMult * 100)}%</strong>
            </>
          )}
        </p>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-2.5">{lang === "ru" ? "Ур." : "Lvl"}</th>
              <th className="px-4 py-2.5 text-right">
                {lang === "ru" ? "EXP (за уровень)" : "EXP (per level)"}
              </th>
              {bonusCols.map((c) => (
                <th key={c.key} className="px-4 py-2.5 text-right">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((e, i) => {
              const rawDelta = expDelta(e.level, e.exp);
              const delta =
                rawDelta == null ? null : Math.round(rawDelta * expTierMult);
              return (
                <tr
                  key={e.level}
                  className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className={`px-4 py-2 font-bold ${levelTextClass}`}>{e.level}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-700">
                    {delta == null
                      ? "—"
                      : delta.toLocaleString(locale)}
                  </td>
                  {bonusCols.map((c) => {
                    const total = c.perLevel * e.level * bonusMult;
                    return (
                      <td
                        key={c.key}
                        className="px-4 py-2 text-right tabular-nums font-medium text-emerald-700"
                      >
                        +{formatBonus(total)}
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
  );
}
