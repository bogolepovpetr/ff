import Link from "next/link";
import { getPlayableRaces } from "@/lib/data";
import { Zap, Hammer, GraduationCap, Battery, Swords } from "lucide-react";

const RACE_STYLE: Record<string, {
  img: string;
  border: string;
  bg: string;
  headerBg: string;
  headerText: string;
  accent: string;
}> = {
  cat: {
    img: "/img/avatars/cat_f_prem_huntress.png",
    border: "border-rose-300",
    bg: "bg-rose-50",
    headerBg: "bg-rose-100",
    headerText: "text-rose-900",
    accent: "text-rose-700",
  },
  dog: {
    img: "/img/avatars/original/dog_prem_aviator.png",
    border: "border-sky-300",
    bg: "bg-sky-50",
    headerBg: "bg-sky-100",
    headerText: "text-sky-900",
    accent: "text-sky-700",
  },
  frog: {
    img: "/img/avatars/original/frog_f_prem_princess.png",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    headerBg: "bg-emerald-100",
    headerText: "text-emerald-900",
    accent: "text-emerald-700",
  },
};

const BONUS_LABELS: Record<string, { en: string; ru: string; icon: typeof Zap }> = {
  energyMax:      { en: "Max Energy",      ru: "Макс. энергия",    icon: Battery },
  bonusBuilders:  { en: "Builders",        ru: "Строители",        icon: Hammer },
  bonusAcademics: { en: "Academics",       ru: "Учёные",           icon: GraduationCap },
};

export default async function RacesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const races = getPlayableRaces();

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? "Расы" : "Races"}
        </h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {ru ? "Выбери свой путь" : "Choose your path"}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {ru
            ? "В FOMO Fighters вы выбираете расу при создании аккаунта. Каждая раса имеет уникальные бонусы и стиль игры. Выбор расы влияет на стартовые ресурсы, количество строителей и учёных, а также на специализацию армии."
            : "In FOMO Fighters you choose a race when creating your account. Each race has unique bonuses and playstyle. Your choice affects starting resources, builders, academics, and army specialization."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {races.map((race) => {
          const style = RACE_STYLE[race.key];
          if (!style) return null;

          const bonuses = [
            { key: "energyMax", value: race.energyMax },
            { key: "bonusBuilders", value: race.bonusBuilders },
            { key: "bonusAcademics", value: race.bonusAcademics },
          ];

          return (
            <div
              key={race.key}
              className={`overflow-hidden rounded-2xl border-2 ${style.border} ${style.bg} transition-shadow hover:shadow-lg`}
            >
              <div className={`flex items-center gap-4 ${style.headerBg} px-5 py-4`}>
                <img
                  src={style.img}
                  alt={race.title}
                  className="h-20 w-20 shrink-0 rounded-xl object-contain"
                />
                <div>
                  <h2 className={`text-xl font-bold ${style.headerText}`}>
                    {race.title}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-zinc-600">
                    {race.desc}
                  </p>
                </div>
              </div>

              <div className="space-y-2 px-5 py-4">
                <h3 className={`text-xs font-bold uppercase tracking-wider ${style.accent}`}>
                  {ru ? "Бонусы расы" : "Race Bonuses"}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {bonuses.map((b) => {
                    const label = BONUS_LABELS[b.key];
                    if (!label || b.value == null) return null;
                    const Icon = label.icon;
                    return (
                      <div
                        key={b.key}
                        className="flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2"
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${style.accent}`} />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                            {ru ? label.ru : label.en}
                          </p>
                          <p className="text-sm font-bold text-slate-800">{b.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-white/30 px-5 py-3">
                <p className="text-xs text-zinc-500">
                  <Zap className="mr-1 inline h-3.5 w-3.5 text-amber-500" />
                  {ru
                    ? "Энергия: +1 каждые 12 мин (для всех рас)"
                    : "Energy: +1 every 12 min (all races)"}
                </p>
              </div>

              <div className="border-t border-white/50 px-5 py-3">
                <Link
                  href={`/${lang}/troops?race=${race.key}`}
                  className={`text-sm font-semibold ${style.accent} hover:underline`}
                >
                  {ru ? "Смотреть войска →" : "View troops →"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <Swords className="h-5 w-5 text-amber-500" />
          {ru ? "Сравнение рас" : "Race Comparison"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2.5">{ru ? "Параметр" : "Stat"}</th>
                {races.map((r) => (
                  <th key={r.key} className="px-4 py-2.5 text-center">{r.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: "energyMax", en: "Max Energy", ru: "Макс. энергия" },
                { key: "bonusBuilders", en: "Builders", ru: "Строители" },
                { key: "bonusAcademics", en: "Academics", ru: "Учёные" },
              ].map((stat, i) => (
                <tr key={stat.key} className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}>
                  <td className="px-4 py-2 font-medium text-zinc-700">{ru ? stat.ru : stat.en}</td>
                  {races.map((r) => {
                    const val = (r as Record<string, unknown>)[stat.key] as number | undefined;
                    const allVals = races.map((rx) => (rx as Record<string, unknown>)[stat.key] as number).filter(Boolean);
                    const max = Math.max(...allVals);
                    const isMax = val === max && new Set(allVals).size > 1;
                    return (
                      <td key={r.key} className={`px-4 py-2 text-center ${isMax ? "font-bold text-emerald-700" : "text-zinc-600"}`}>
                        {val ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-2 font-medium text-zinc-700">{ru ? "Реген энергии" : "Energy Regen"}</td>
                {races.map((r) => (
                  <td key={r.key} className="px-4 py-2 text-center text-zinc-600">
                    {ru ? "1 / 12 мин" : "1 / 12 min"}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-zinc-100">
                <td className="px-4 py-2 font-medium text-zinc-700">{ru ? "Специализация" : "Specialization"}</td>
                <td className="px-4 py-2 text-center text-zinc-600">{ru ? "Атака" : "Attack"}</td>
                <td className="px-4 py-2 text-center text-zinc-600">{ru ? "Защита" : "Defense"}</td>
                <td className="px-4 py-2 text-center text-zinc-600">{ru ? "Баланс" : "Balanced"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
