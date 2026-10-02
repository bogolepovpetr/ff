import { Flame } from "lucide-react";
import { getVipStreak } from "@/lib/data";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function DealsVipStreakPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const streak = getVipStreak();

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { href: `/${lang}/deals`, label: "Deals" },
          { href: `/${lang}/deals/vip`, label: "VIP" },
          { label: ru ? "Стрик сундука" : "Chest streak" },
        ]}
      />

      <section className="wiki-panel">
        <div className="border-b border-[var(--game-frame)] px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Flame className="h-6 w-6 text-[var(--game-atk)]" />
            {ru ? "Дневной сундук — стрик" : "Daily chest streak"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {ru
              ? "VIP-очки за ежедневный вход. Пропуск дня сбрасывает стрик на 1."
              : "VIP points for daily login. Missing a day resets the streak to 1."}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--game-frame)] bg-[var(--game-bg)] text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">{ru ? "День" : "Day"}</th>
                <th className="px-4 py-2">{ru ? "VIP-очки" : "VIP points"}</th>
              </tr>
            </thead>
            <tbody>
              {streak.map((s, i) => (
                <tr
                  key={s.key}
                  className={`border-b border-[var(--game-frame)]/50 ${i % 2 === 1 ? "bg-[var(--game-bg)]/40" : ""}`}
                >
                  <td className="px-4 py-2 font-semibold">{s.key}</td>
                  <td className="px-4 py-2">{fmtNumber(s.points)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
