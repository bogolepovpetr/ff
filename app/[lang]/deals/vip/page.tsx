import Link from "next/link";
import { Crown, Clock, Flame, Trophy, ArrowRight } from "lucide-react";
import { getVipPassLevels, getVipWiki } from "@/lib/data";
import { formatCost } from "@/lib/format";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

export default async function DealsVipPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const wiki = getVipWiki();
  const levels = getVipPassLevels();
  const maxLevel = Math.max(...levels.map((l) => l.lvl));

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { href: `/${lang}/deals`, label: "Deals" },
          { label: "VIP" },
        ]}
      />

      <div className="wiki-hero">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Crown className="h-6 w-6 text-[var(--game-orange)]" />
          VIP
        </h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          {ru ? wiki.intro_ru : wiki.intro_en}
        </p>
        <ul className="mt-4 space-y-1.5 text-sm opacity-90">
          {(ru ? wiki.bullets_ru : wiki.bullets_en).map((b) => (
            <li key={b} className="flex gap-2">
              <span className="text-[var(--game-orange)]">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <span className="wiki-chip wiki-chip-accent">
            <Crown className="h-3.5 w-3.5" />
            {ru ? "Макс. уровень" : "Max level"}: {maxLevel}
          </span>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href={`/${lang}/deals/vip/levels`}
          className="group wiki-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--game-orange)_18%,white)] text-[var(--game-orange)]">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">{ru ? "VIP-уровни" : "VIP levels"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ru ? "Новые пассивные бонусы" : "New passive bonuses"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-[var(--game-orange)]" />
          </div>
        </Link>

        <Link
          href={`/${lang}/deals/vip/time`}
          className="group wiki-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--game-green)_18%,white)] text-[var(--game-green)]">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">{ru ? "VIP-время" : "VIP time"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ru ? "Покупка за гемы" : "Purchase with gems"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-[var(--game-green)]" />
          </div>
        </Link>

        <Link
          href={`/${lang}/deals/vip/streak`}
          className="group wiki-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--game-atk)_18%,white)] text-[var(--game-atk)]">
              <Flame className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">{ru ? "Стрик сундука" : "Chest streak"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ru ? "28 дней входа" : "28-day login streak"}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-[var(--game-atk)]" />
          </div>
        </Link>
      </section>

      <section className="wiki-panel">
        <div className="flex items-center justify-between border-b border-[var(--game-frame)] px-5 py-3">
          <h2 className="text-lg font-bold">{ru ? "VIP-уровни (кратко)" : "VIP levels (quick view)"}</h2>
          <Link href={`/${lang}/deals/vip/levels`} className="wiki-link text-sm font-semibold">
            {ru ? "Полная таблица" : "Full table"}
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--game-frame)] bg-[var(--game-bg)] text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">{ru ? "Уровень" : "Level"}</th>
                <th className="px-4 py-2">{ru ? "VIP-очки" : "VIP points"}</th>
              </tr>
            </thead>
            <tbody>
              {levels.filter((l) => l.lvl > 0).slice(0, 8).map((l, i) => (
                <tr
                  key={l.key}
                  className={`border-b border-[var(--game-frame)]/50 ${i % 2 === 1 ? "bg-[var(--game-bg)]/40" : ""}`}
                >
                  <td className="px-4 py-2 font-semibold">{l.title}</td>
                  <td className="px-4 py-2">{formatCost(l.gem_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
