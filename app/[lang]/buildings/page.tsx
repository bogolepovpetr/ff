import Link from "next/link";
import { getBuildings } from "@/lib/data";
import { getLore } from "@/lib/lore";
import { buildingImage } from "@/lib/images";

export default async function BuildingsIndex({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lore = getLore("buildings", lang);
  const buildings = getBuildings()
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));

  const groups = new Map<string, typeof buildings>();
  for (const b of buildings) {
    const k = b.type || "Other";
    const list = groups.get(k) ?? [];
    list.push(b);
    groups.set(k, list);
  }

  return (
    <div className="space-y-6">
      {/* Hero / intro */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {lore.subtitle}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {lore.intro}
        </p>
      </div>

      {/* Grouped building cards */}
      {Array.from(groups.entries()).map(([type, items]) => (
        <section key={type}>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
            <span className="h-1 w-4 rounded-full bg-amber-400" />
            {type}
            <span className="text-sm font-normal text-zinc-400">
              ({items.length})
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((b) => (
              <Link
                key={b.key}
                href={`/${lang}/buildings/${b.key}`}
                className="group flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-all hover:border-amber-300 hover:shadow-md"
              >
                <img
                  src={buildingImage(b.key)}
                  alt={b.title}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-800 transition-colors group-hover:text-amber-700">
                    {b.title}
                  </p>
                  {b.desc && (
                    <p className="mt-0.5 truncate text-xs text-zinc-500">{b.desc}</p>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {`${b.levels.length} levels`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
