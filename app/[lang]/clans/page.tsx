import { Users, Gift, Trophy, ArrowRight, Crown } from "lucide-react";
import Link from "next/link";
import { getClanLevels, getClanRanks, getClanRewards } from "@/lib/data";
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
    <div className="flex items-center gap-2 text-xs text-zinc-600">
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

function fmtRewardTitle(title: string, hours: number, lang: string): string {
  const base =
    lang === "ru" ? "Награда каждые {count} часов" : "Reward every {count} hours";
  const tpl = title?.includes("{count}") ? title : base;
  return tpl.replaceAll("{count}", String(hours));
}

function rankTitle(title: string, lang: string): string {
  if (lang !== "ru") return title;
  const map: Record<string, string> = {
    Founder: "Основатель",
    Deputy: "Заместитель",
    Officer: "Офицер",
    Soldier: "Солдат",
    Recruit: "Рекрут",
    Newbie: "Новичок",
  };
  return map[title] ?? title;
}

export default async function ClansPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";

  const levels = getClanLevels();
  const ranks = getClanRanks();
  const rewards = getClanRewards().slice().sort((a, b) => a.level - b.level);

  const maxLevel = Math.max(
    0,
    ...levels.map((x) => x.level),
    ...rewards.map((x) => x.level),
  );
  const maxMembers = Math.max(0, ...levels.map((x) => x.members));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? "Кланы" : "Clans"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {ru
            ? "Уровень клана открывает награды, а ранги определяют роли участников. Здесь собраны таблицы уровней, рангов и клановых наград."
            : "Clan level unlocks rewards, and ranks define member roles. Here are the tables for clan levels, ranks, and clan rewards."}
        </p>

        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            <Crown className="h-3.5 w-3.5" />
            {ru ? "Макс. уровень" : "Max level"}:{" "}
            <span className="font-semibold">{maxLevel}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            <Users className="h-3.5 w-3.5" />
            {ru ? "Макс. участников" : "Max members"}:{" "}
            <span className="font-semibold">{maxMembers}</span>
          </span>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/${lang}/clans/levels`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">
                {ru ? "Уровни клана" : "Clan Levels"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Опыт и лимит участников" : "Exp and member cap"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-amber-500" />
          </div>
        </Link>

        <Link
          href={`/${lang}/clans/rewards`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">
                {ru ? "Награды клана" : "Clan Rewards"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Интервалы и состав награды" : "Intervals and rewards"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-emerald-600" />
          </div>
        </Link>

        <Link
          href={`/${lang}/clans/ranks`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">
                {ru ? "Ранги" : "Ranks"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Пороги очков клана" : "Clan points thresholds"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-sky-600" />
          </div>
        </Link>

        <Link
          href={`/${lang}/clans/war`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">
                {ru ? "Клановая война" : "Clan War"}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Правила, награды, потери" : "Rules, rewards, losses"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-rose-600" />
          </div>
        </Link>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">
            {ru ? "Клановые награды (быстро)" : "Clan rewards (quick view)"}
          </h2>
          <Link
            href={`/${lang}/clans/rewards`}
            className="text-sm font-semibold text-amber-700 hover:text-amber-600"
          >
            {ru ? "Открыть таблицу" : "Open table"}
          </Link>
        </div>
        <div className="divide-y divide-zinc-50">
          {rewards.slice(0, 6).map((r) => (
            <div key={r.key} className="flex items-center gap-4 px-5 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <Gift className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-800">
                  {fmtRewardTitle(r.title, r.hours, lang)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {ru ? "Доступно с уровня" : "Available from level"}{" "}
                  <span className="font-semibold">Lv {r.level}</span>
                </p>
              </div>
              <RewardBits food={r.food} wood={r.wood} stone={r.stone} gem={r.gem} />
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="text-lg font-bold text-slate-800">
              {ru ? "Уровни клана" : "Clan levels"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {ru
                ? "Опыт — порог суммарных очков/вклада для достижения уровня."
                : "Exp is the total threshold to reach the level."}
            </p>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-2">{ru ? "Уровень" : "Level"}</th>
                  <th className="px-4 py-2">{ru ? "Опыт" : "Exp"}</th>
                  <th className="px-4 py-2">{ru ? "Участников" : "Members"}</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l, i) => (
                  <tr
                    key={l.level}
                    className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className="px-4 py-2 font-semibold text-zinc-800">
                      Lv {l.level}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {fmtNumber(l.exp)}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {fmtNumber(l.members)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="text-lg font-bold text-slate-800">
              {ru ? "Ранги (по очкам клана)" : "Ranks (by clan points)"}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              {ru
                ? "Порог — минимальные очки клана для ранга."
                : "Threshold is the minimum clan points for the rank."}
            </p>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-4 py-2">{ru ? "Ранг" : "Rank"}</th>
                  <th className="px-4 py-2">{ru ? "Порог" : "Threshold"}</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((r, i) => (
                  <tr
                    key={r.key}
                    className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className="px-4 py-2 font-semibold text-zinc-800">
                      {rankTitle(r.title, lang)}
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {r.isOwner || r.isDeputy ? "—" : fmtNumber(r.points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

