import { getActiveShopItems } from "@/lib/data";
import { Crown, Shield, Wheat, Warehouse, Users, Zap } from "lucide-react";

const CATEGORY_META: Record<string, {
  en: string;
  ru: string;
  icon: typeof Crown;
  accent: string;
  bg: string;
  border: string;
}> = {
  prem: {
    en: "Premium",
    ru: "Премиум",
    icon: Crown,
    accent: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  defence: {
    en: "Protection",
    ru: "Защита",
    icon: Shield,
    accent: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  resource: {
    en: "Resource Boosts",
    ru: "Бусты ресурсов",
    icon: Wheat,
    accent: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  storage: {
    en: "Storage Boosts",
    ru: "Бусты хранилища",
    icon: Warehouse,
    accent: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  friends: {
    en: "Virtual Friends",
    ru: "Виртуальные друзья",
    icon: Users,
    accent: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  energy: {
    en: "Energy",
    ru: "Энергия",
    icon: Zap,
    accent: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
};

const CATEGORY_ORDER = ["prem", "defence", "resource", "storage", "energy", "friends"];

function formatDuration(hours?: number, ru?: boolean): string {
  if (!hours) return "";
  if (hours < 24) return `${hours}${ru ? " ч" : "h"}`;
  const days = Math.round(hours / 24);
  return `${days}${ru ? " дн" : "d"}`;
}

export default async function ShopPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const items = getActiveShopItems();

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const cat = item.category;
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(item);
  }

  const orderedCats = CATEGORY_ORDER.filter((c) => grouped.has(c));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? "Премиум магазин" : "Premium Shop"}
        </h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {ru ? "Покупки за гемы" : "Gem purchases"}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {ru
            ? "Все товары покупаются за гемы. Гемы можно получить за выполнение заданий, приглашение друзей и из наград клановых войн."
            : "All items are purchased with gems. Gems can be earned through quests, referrals, and clan war rewards."}
        </p>
      </div>

      {orderedCats.map((catKey) => {
        const meta = CATEGORY_META[catKey];
        if (!meta) return null;
        const catItems = grouped.get(catKey)!;
        const Icon = meta.icon;

        return (
          <section key={catKey}>
            <h2 className={`mb-4 flex items-center gap-2 text-xl font-bold ${meta.accent}`}>
              <Icon className="h-5 w-5" />
              {ru ? meta.ru : meta.en}
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catItems.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-xl border ${meta.border} ${meta.bg} p-4 transition-shadow hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800">
                      {item.title}
                    </h3>
                    {item.hours && item.category !== "energy" ? (
                      <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                        {formatDuration(item.hours, ru)}
                      </span>
                    ) : null}
                  </div>

                  {item.desc && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-600 whitespace-pre-line">
                      {item.desc.replace(/\\n/g, "\n").trim()}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1.5">
                    <img src="/img/icon/gem.png" alt="gem" className="h-4 w-4" />
                    <span className="text-sm font-bold text-slate-800">
                      {(item.priceGem ?? 0).toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
