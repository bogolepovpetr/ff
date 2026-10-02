import Link from "next/link";
import { Crown, Castle, ArrowRight, Sparkles } from "lucide-react";
import { getDawnFundTopup, getVipPassLevels } from "@/lib/data";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

export default async function DealsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const maxVip = Math.max(...getVipPassLevels().map((l) => l.lvl));
  const topup = getDawnFundTopup();

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { label: "Deals" },
        ]}
      />

      <div className="wiki-hero">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-[var(--game-orange)]" />
          Deals
        </h1>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          {ru
            ? "Премиум-предложения: VIP-привилегии и Fund of Dawn — награды за прогресс замка."
            : "Premium offers: VIP perks and Fund of Dawn — rewards tied to Castle progress."}
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/${lang}/deals/vip`}
          className="group wiki-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--game-orange)_18%,white)] text-[var(--game-orange)]">
              <Crown className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">VIP</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ru
                  ? `Уровни 1–${maxVip}, VIP-время, стрик сундука`
                  : `Levels 1–${maxVip}, VIP time, chest streak`}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-[var(--game-orange)]" />
          </div>
        </Link>

        <Link
          href={`/${lang}/deals/dawn-fund`}
          className="group wiki-panel p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--game-green)_18%,white)] text-[var(--game-green)]">
              <Castle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold">{ru ? "Фонд Рассвета" : "Fund of Dawn"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {ru
                  ? `От ${topup.priceStar} ⭐ · награды за уровень замка`
                  : `From ${topup.priceStar} ⭐ · rewards per Castle level`}
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-[var(--game-green)]" />
          </div>
        </Link>
      </section>
    </div>
  );
}
