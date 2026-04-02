import Link from "next/link";
import { ChevronRight, Trophy, Users } from "lucide-react";
import { getClanLevels } from "@/lib/data";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function ClanLevelsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const levels = getClanLevels();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}/clans`} className="hover:text-amber-700 hover:underline">
          {ru ? "Кланы" : "Clans"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">
          {ru ? "Уровни клана" : "Clan levels"}
        </span>
      </nav>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Trophy className="h-6 w-6 text-amber-600" />
            {ru ? "Уровни клана" : "Clan levels"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-zinc-600">
            {ru
              ? "Таблица порогов опыта и лимита участников. Чем выше уровень — тем больше участников и наград."
              : "Table of exp thresholds and member cap. Higher level means more members and more rewards."}
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
                  <td className="px-4 py-2 text-zinc-700">{fmtNumber(l.exp)}</td>
                  <td className="px-4 py-2 text-zinc-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-zinc-400" />
                      {fmtNumber(l.members)}
                    </span>
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

