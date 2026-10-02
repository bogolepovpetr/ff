import Link from "next/link";
import { ChevronRight, Swords, Castle } from "lucide-react";
import { getArenaPvpTiers, getArenaWiki } from "@/lib/data";
import { formatCost, leagueLabel } from "@/lib/format";
import { RewardDict } from "@/components/wiki/reward-dict";

export default async function ArenaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const wiki = getArenaWiki();
  const tiers = getArenaPvpTiers();

  const floorLabel = (min: number, max: number) =>
    min === max ? `Lv ${min}` : `Lv ${min}–${max}`;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">
          {ru ? wiki.title_ru : wiki.title_en}
        </span>
      </nav>

      <div className="wiki-hero p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Swords className="h-6 w-6 text-rose-600" />
          {ru ? wiki.title_ru : wiki.title_en}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {ru ? wiki.intro_ru : wiki.intro_en}
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-zinc-600">
          {(ru ? wiki.bullets_ru : wiki.bullets_en).map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-rose-500">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/${lang}/buildings/arena`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-600"
        >
          <Castle className="h-4 w-4" />
          {ru ? "Здание: Арена" : "Building: Arena"}
        </Link>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-800">
            {ru ? "Этажи и награды" : "Floors and rewards"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {ru
              ? "Минимум Kill Points для получения наград — requiredKillPoints."
              : "Minimum Kill Points to qualify for rewards — requiredKillPoints."}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-3 py-2">{ru ? "Этаж" : "Floor"}</th>
                <th className="px-3 py-2">{ru ? "Лига" : "League"}</th>
                <th className="px-3 py-2">KP min</th>
                <th className="px-3 py-2">Top 1</th>
                <th className="px-3 py-2">Top 5</th>
                <th className="px-3 py-2">Top 10</th>
                <th className="px-3 py-2">Top 100</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => (
                <tr
                  key={`${t.league}-${t.minLevel}`}
                  className={`border-b border-zinc-100 align-top ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-3 py-2 font-semibold text-zinc-800">
                    {floorLabel(t.minLevel, t.maxLevel)}
                  </td>
                  <td className="px-3 py-2 text-zinc-700">{leagueLabel(t.league, lang)}</td>
                  <td className="px-3 py-2 text-zinc-700">{formatCost(t.requiredKillPoints)}</td>
                  <td className="px-3 py-2"><RewardDict dict={t.top1} lang={lang} /></td>
                  <td className="px-3 py-2"><RewardDict dict={t.top5} lang={lang} /></td>
                  <td className="px-3 py-2"><RewardDict dict={t.top10} lang={lang} /></td>
                  <td className="px-3 py-2"><RewardDict dict={t.top100} lang={lang} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
