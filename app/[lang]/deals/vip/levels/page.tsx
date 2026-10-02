import { Crown } from "lucide-react";
import { getVipPassLevels } from "@/lib/data";
import {
  extractVipNewPerms,
  extractVipNewUnlocks,
  formatCost,
} from "@/lib/format";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

export default async function DealsVipLevelsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const allLevels = getVipPassLevels();
  const levels = allLevels.filter((l) => l.lvl > 0);

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { href: `/${lang}/deals`, label: "Deals" },
          { href: `/${lang}/deals/vip`, label: "VIP" },
          { label: ru ? "VIP-уровни" : "VIP levels" },
        ]}
      />

      <section className="wiki-panel">
        <div className="border-b border-[var(--game-frame)] px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Crown className="h-6 w-6 text-[var(--game-orange)]" />
            {ru ? "VIP-уровни" : "VIP levels"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {ru
              ? "На каждом уровне показаны новые пассивные бонусы и разблокировки. Итоговые значения бонусов — абсолютные для текущего уровня."
              : "Each level shows newly unlocked passive bonuses and features. Total bonus values are absolute for that level."}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-[var(--game-frame)] bg-[var(--game-bg)] text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">{ru ? "Уровень" : "Level"}</th>
                <th className="px-4 py-2">{ru ? "VIP-очки" : "VIP points"}</th>
                <th className="px-4 py-2">
                  {ru ? "Новые пассивные бонусы" : "New passive bonuses"}
                </th>
                <th className="px-4 py-2">{ru ? "Разблокировки" : "Unlocks"}</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((l, i) => {
                const prev = allLevels.find((x) => x.lvl === l.lvl - 1) ?? null;
                const unlocks = extractVipNewUnlocks(l, prev, lang);
                const perms = extractVipNewPerms(l, prev, lang);
                const skinNew =
                  l.skinKey && l.skinKey !== (prev as { skinKey?: string } | null)?.skinKey
                    ? [ru ? "VIP-скин города" : "VIP city skin"]
                    : [];
                const allPerms = [...perms, ...skinNew];

                return (
                  <tr
                    key={l.key}
                    className={`border-b border-[var(--game-frame)]/50 align-top ${i % 2 === 1 ? "bg-[var(--game-bg)]/40" : ""}`}
                  >
                    <td className="px-4 py-3 font-semibold">{l.title}</td>
                    <td className="px-4 py-3">{formatCost(l.gem_cost)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {unlocks.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          unlocks.map((u) => (
                            <span
                              key={u.key}
                              className={u.kind === "new" ? "wiki-unlock-new" : "wiki-unlock-up"}
                            >
                              {u.kind === "new" ? "+" : "↑"} {u.label}
                              {u.kind === "upgrade" && u.prevValue !== undefined
                                ? `: ${u.prevValue} → ${u.value}`
                                : `: ${u.value}`}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {allPerms.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {allPerms.map((p) => (
                            <span key={p} className="wiki-unlock-new">
                              + {p}
                            </span>
                          ))}
                        </div>
                      )}
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
