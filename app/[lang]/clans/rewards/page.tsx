import Link from "next/link";
import { ChevronRight, Gift } from "lucide-react";
import { getClanRewards } from "@/lib/data";
import { ResourceIcon } from "@/components/wiki/resource-icon";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function RewardBits({
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
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {food ? (
        <span className="inline-flex items-center gap-1.5">
          <ResourceIcon res="food" className="h-4 w-4" />
          {fmtNumber(food)}
        </span>
      ) : null}
      {wood ? (
        <span className="inline-flex items-center gap-1.5">
          <ResourceIcon res="wood" className="h-4 w-4" />
          {fmtNumber(wood)}
        </span>
      ) : null}
      {stone ? (
        <span className="inline-flex items-center gap-1.5">
          <ResourceIcon res="stone" className="h-4 w-4" />
          {fmtNumber(stone)}
        </span>
      ) : null}
      {gem ? (
        <span className="inline-flex items-center gap-1.5">
          <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
          {fmtNumber(gem)}
        </span>
      ) : null}
    </div>
  );
}

function fmtTitle(title: string, hours: number, lang: string): string {
  const base =
    lang === "ru" ? "Награда каждые {count} часов" : "Reward every {count} hours";
  const tpl = title?.includes("{count}") ? title : base;
  return tpl.replaceAll("{count}", String(hours));
}

export default async function ClanRewardsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";

  const rewards = getClanRewards().slice().sort((a, b) => a.level - b.level);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/clans`} className="hover:text-amber-700 hover:underline">
          {ru ? "Кланы" : "Clans"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">
          {ru ? "Награды клана" : "Clan rewards"}
        </span>
      </nav>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Gift className="h-6 w-6 text-emerald-600" />
            {ru ? "Награды клана" : "Clan rewards"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">
            {ru
              ? "Чем выше уровень клана, тем больше доступно наград. Награды выдаются с определённым интервалом (в часах)."
              : "Higher clan level unlocks more rewards. Rewards are available on a timed interval (hours)."}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">{ru ? "Уровень" : "Level"}</th>
                <th className="px-4 py-2">{ru ? "Интервал" : "Interval"}</th>
                <th className="px-4 py-2">{ru ? "Награда" : "Reward"}</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r, i) => (
                <tr
                  key={r.key}
                  className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-4 py-2 font-semibold text-zinc-800">
                    Lv {r.level}
                  </td>
                  <td className="px-4 py-2 text-zinc-700">
                    {fmtTitle(r.title, r.hours, lang)}
                  </td>
                  <td className="px-4 py-2 text-zinc-700">
                    <RewardBits food={r.food} wood={r.wood} stone={r.stone} gem={r.gem} />
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

