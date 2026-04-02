import Link from "next/link";
import { ChevronRight, Users, Crown } from "lucide-react";
import { getClanRanks } from "@/lib/data";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
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

export default async function ClanRanksPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const ranks = getClanRanks();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/clans`} className="hover:text-amber-700 hover:underline">
          {ru ? "Кланы" : "Clans"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{ru ? "Ранги" : "Ranks"}</span>
      </nav>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Users className="h-6 w-6 text-sky-600" />
            {ru ? "Ранги клана" : "Clan ranks"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">
            {ru
              ? "Ранг определяется очками клана. Основатель и заместитель отмечены отдельно."
              : "Rank is determined by clan points. Founder and deputy are highlighted separately."}
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
              {ranks.map((r, i) => {
                const isSpecial = r.isOwner || r.isDeputy;
                return (
                  <tr
                    key={r.key}
                    className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                  >
                    <td className="px-4 py-2 font-semibold text-zinc-800">
                      <span className="inline-flex items-center gap-2">
                        {isSpecial ? (
                          <Crown className="h-4 w-4 text-amber-600" />
                        ) : null}
                        {rankTitle(r.title, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-700">
                      {isSpecial ? "—" : fmtNumber(r.points)}
                    </td>
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

