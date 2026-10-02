import Link from "next/link";
import { Castle, Gift } from "lucide-react";
import { getDawnFundPass, getDawnFundTopup } from "@/lib/data";
import { RewardDict } from "@/components/wiki/reward-dict";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

export default async function DealsDawnFundPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const pass = getDawnFundPass();
  const topup = getDawnFundTopup();

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { href: `/${lang}/deals`, label: "Deals" },
          { label: ru ? "Фонд Рассвета" : "Fund of Dawn" },
        ]}
      />

      <div className="wiki-hero">
        <h1 className="text-2xl font-bold">{pass.title}</h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">{pass.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="wiki-chip wiki-chip-accent">⭐ {topup.priceStar} Stars</span>
          <span className="wiki-chip">
            TON {topup.priceTon}
            {topup.priceTonOld ? (
              <span className="ml-1 line-through opacity-60">{topup.priceTonOld}</span>
            ) : null}
          </span>
          <span className="wiki-chip">${topup.priceUsdt} USDT</span>
          <Link
            href={`/${lang}/buildings/castle`}
            className="wiki-chip hover:border-[var(--game-orange)]"
          >
            <Castle className="h-3.5 w-3.5" />
            {ru ? "Привязка к замку" : "Tied to Castle"}
          </Link>
        </div>
        <p className="mt-3 text-xs opacity-75">
          {ru
            ? "Активируйте один раз — получайте награды при каждом улучшении замка."
            : "Activate once — earn rewards on every Castle upgrade."}
        </p>
      </div>

      <section className="wiki-panel">
        <div className="border-b border-[var(--game-frame)] px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Gift className="h-5 w-5 text-[var(--game-orange)]" />
            {ru ? "Треки наград" : "Reward tracks"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {ru
              ? "Free — для всех; Premium — после покупки Fund of Dawn."
              : "Free — for everyone; Premium — after purchasing Fund of Dawn."}
          </p>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--game-frame)] bg-[var(--game-bg)] text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">{ru ? "Замок" : "Castle"}</th>
                <th className="px-4 py-2">Free</th>
                <th className="px-4 py-2">Premium</th>
              </tr>
            </thead>
            <tbody>
              {pass.levels.map((lv, i) => {
                const castleLv = lv.requiredBuildings?.castle ?? lv.lvl;
                return (
                  <tr
                    key={lv.lvl}
                    className={`border-b border-[var(--game-frame)]/50 align-top ${i % 2 === 1 ? "bg-[var(--game-bg)]/40" : ""}`}
                  >
                    <td className="px-4 py-2 font-semibold">Lv {castleLv}</td>
                    <td className="px-4 py-2">
                      <RewardDict dict={lv.free} lang={lang} />
                    </td>
                    <td className="px-4 py-2">
                      <RewardDict dict={lv.premium} lang={lang} />
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
