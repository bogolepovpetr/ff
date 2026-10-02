import { Clock } from "lucide-react";
import { getVipTimePacks } from "@/lib/data";
import { ResourceIcon } from "@/components/wiki/resource-icon";
import { WikiBreadcrumbs } from "@/components/wiki/wiki-breadcrumbs";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function DealsVipTimePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const packs = getVipTimePacks();

  const durationLabel = (days: number) => {
    if (days === 1) return ru ? "24 часа" : "24 hours";
    if (days === 7) return ru ? "7 дней" : "7 days";
    if (days === 30) return ru ? "30 дней" : "30 days";
    return ru ? `${days} дн.` : `${days} days`;
  };

  return (
    <div className="space-y-6">
      <WikiBreadcrumbs
        crumbs={[
          { href: `/${lang}`, label: ru ? "Главная" : "Home" },
          { href: `/${lang}/deals`, label: "Deals" },
          { href: `/${lang}/deals/vip`, label: "VIP" },
          { label: ru ? "VIP-время" : "VIP time" },
        ]}
      />

      <section className="wiki-panel">
        <div className="border-b border-[var(--game-frame)] px-5 py-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Clock className="h-6 w-6 text-[var(--game-green)]" />
            {ru ? "VIP-время" : "VIP time"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            {ru
              ? "Покупка продлевает vip_expires_at. Пока VIP-время активно — работают все привилегии текущего VIP-уровня."
              : "Purchase extends vip_expires_at. While VIP time is active, all perks of your current VIP level apply."}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {packs.map((p) => (
            <div
              key={p.key}
              className="rounded-xl border border-[var(--game-frame)] bg-[var(--game-bg)] p-4 text-center"
            >
              <p className="text-lg font-bold">{durationLabel(p.days)}</p>
              <p className="mt-2 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--game-orange)]">
                <ResourceIcon res="gem" className="h-4 w-4" />
                {fmtNumber(p.gem_cost)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
