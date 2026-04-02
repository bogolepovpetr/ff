import Link from "next/link";
import { ChevronRight, Swords, Trophy, ArrowRight, CalendarClock, Coins, ShieldAlert, Wallet } from "lucide-react";
import { getWarData } from "@/lib/data";

function fmtDateTimeUTC0(iso: string, lang: string): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

export default async function WarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const data = getWarData().war;

  const token = `$${data.token}`;
  const usdt = data.usdt;
  const poolLabel = ru ? data.season.pool_label_ru : data.season.pool_label_en;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{ru ? "WAR" : "WAR"}</span>
      </nav>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{ru ? "WAR — главная цель сезона" : "WAR — the core seasonal goal"}</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">
              {ru
                ? `${token} зарабатывается в клановых войнах. В конце сезона проходит buyback — обмен ${token} на ${usdt}.`
                : `${token} is earned in clan wars. At season end, a buyback event lets you exchange ${token} to ${usdt}.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-semibold text-zinc-700">
                {ru ? "Сезон" : "Season"} {data.season.number}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800">
                {poolLabel}: {data.season.pool_usdt_current.toLocaleString(ru ? "ru-RU" : "en-US")} {usdt}
              </span>
            </div>
          </div>

          <Link
            href={`/${lang}/clans/war`}
            className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            <Swords className="h-4 w-4" />
            {ru ? "Правила клановой войны" : "Clan war rules"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.earn.title_ru : data.earn.title_en}</h2>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            {(ru ? data.earn.bullets_ru : data.earn.bullets_en).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? "Окно buyback" : "Buyback window"}</h2>
          </div>
          <div className="mt-3 space-y-2">
            {data.buyback.timeline_utc0.map((e) => (
              <div key={e.key} className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                <div className="mt-0.5 h-2 w-2 rounded-full bg-sky-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-800">{ru ? e.label_ru : e.label_en}</p>
                  <p className="text-xs text-zinc-600">
                    {fmtDateTimeUTC0(e.at, lang)}{" "}
                    <span className="text-zinc-400">{ru ? "(UTC+0)" : "(UTC+0)"}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.withdraw_usdt.title_ru : data.withdraw_usdt.title_en}</h2>
          </div>
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <span className="font-semibold">{ru ? "Порог" : "Threshold"}:</span>{" "}
            {data.withdraw_usdt.constraints.min_balance_usdt} {usdt}
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            {(ru ? data.withdraw_usdt.bullets_ru : data.withdraw_usdt.bullets_en).slice(0, 3).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Swords className="h-4 w-4 text-rose-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.buyback.title_ru : data.buyback.title_en}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.buyback.rules_ru : data.buyback.rules_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Coins className="h-4 w-4 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? "Фонд и курс обмена" : "Fund & exchange rate"}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.buyback.fund_ru : data.buyback.fund_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              <span className="font-semibold">{ru ? "Формула" : "Formula"}:</span>{" "}
              {ru ? "Фонд выкупа / Общая сумма $WAR" : "Buyback Fund / Total $WAR"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <ShieldAlert className="h-4 w-4 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.min_threshold.title_ru : data.min_threshold.title_en}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.min_threshold.bullets_ru : data.min_threshold.bullets_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <CalendarClock className="h-4 w-4 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.seasons.title_ru : data.seasons.title_en}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.seasons.bullets_ru : data.seasons.bullets_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
          <ShieldAlert className="h-4 w-4 text-rose-700" />
          <h2 className="text-lg font-bold text-slate-800">{ru ? data.important.title_ru : data.important.title_en}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          <ul className="list-disc space-y-2 pl-5">
            {(ru ? data.important.bullets_ru : data.important.bullets_en).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

