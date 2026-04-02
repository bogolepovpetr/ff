import Link from "next/link";
import { getLeads } from "@/lib/data";
import { getLore } from "@/lib/lore";
import { tierColor, heroTierName, roleName, formatCost } from "@/lib/format";
import { heroImage } from "@/lib/images";
import { ResourceIcon } from "@/components/wiki/resource-icon";

export default async function HeroesIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lore = getLore("heroes", lang);
  const leads = getLeads();

  const tierMap = new Map<number, typeof leads>();
  for (const lead of leads) {
    const list = tierMap.get(lead.tier) ?? [];
    list.push(lead);
    tierMap.set(lead.tier, list);
  }

  return (
    <div className="space-y-8">
      {/* Hero banner */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-purple-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {lore.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {lore.intro}
        </p>
      </div>

      {/* Tiers */}
      {Array.from(tierMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([tier, heroes]) => {
          const tc = tierColor(tier);
          return (
            <section key={tier}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                  <span
                    className={`inline-block h-1.5 w-5 rounded-full ${tc.border.replace("border-", "bg-")}`}
                  />
                  {heroTierName(tier, lang)}
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {heroes.map((hero) => (
                  <Link
                    key={hero.key}
                    href={`/${lang}/heroes/${hero.key}`}
                    className={`group relative flex flex-col rounded-xl border-2 ${tc.border} ${tc.bg} p-4 transition-all hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    {/* Role badge */}
                    {hero.role && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-zinc-600 shadow-sm">
                        {roleName(hero.role, lang)}
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      <img
                        src={heroImage(hero.key)}
                        alt={hero.title}
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-bold ${tc.text}`}>
                          {hero.title}
                        </p>
                        {hero.aspect && (
                          <p className="mt-0.5 text-xs capitalize text-zinc-500">
                            {hero.aspect}
                          </p>
                        )}
                      </div>
                    </div>

                    {hero.desc && (
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                        {hero.desc}
                      </p>
                    )}

                    {/* Bonuses preview */}
                    {hero.bonusPerLevel && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(hero.bonusPerLevel)
                          .slice(0, 3)
                          .map(([k, v]) => (
                            <span
                              key={k}
                              className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600"
                            >
                              {humanizeShort(k)} +{v}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Price */}
                    {hero.priceGem != null && (
                      <p className="mt-2 text-[10px] text-zinc-400">
                        <span className="mr-0.5 inline-flex align-text-bottom">
                          <ResourceIcon res="gem" className="h-3.5 w-3.5 text-sky-600" />
                        </span>
                        {formatCost(hero.priceGem)}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}

function humanizeShort(key: string): string {
  return key
    .replace(/^bonus/, "")
    .replace(/Rate/g, "")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ");
}
