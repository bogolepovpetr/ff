import Link from "next/link";
import { ChevronRight, Swords, Trophy, Coins, ShieldAlert, ArrowRight, Ban } from "lucide-react";
import { getWarData } from "@/lib/data";

export default async function WarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const data = getWarData().war;
  const token = `$${data.token}`;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">WAR</span>
      </nav>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? `${token} на Server 2` : `${token} on Server 2`}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          {ru
            ? `На Server 2 ${token} — постоянный накопительный баланс, который виден в рейтинге игроков. Потратить его в игре сейчас негде: нет ни магазина, ни обмена на USDT.`
            : `On Server 2, ${token} is a persistent balance shown in the player ranking. There is currently nowhere to spend it in-game: no shop and no USDT exchange.`}
        </p>
        <div className="mt-4">
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

      <section className="rounded-xl border border-rose-200 bg-rose-50">
        <div className="flex items-center gap-2 border-b border-rose-100 px-5 py-3">
          <Ban className="h-4 w-4 text-rose-700" />
          <h2 className="text-lg font-bold text-rose-900">{ru ? data.access.title_ru : data.access.title_en}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-rose-900/90">
          <ul className="list-disc space-y-2 pl-5">
            {(ru ? data.access.bullets_ru : data.access.bullets_en).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Trophy className="h-4 w-4 text-emerald-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.earn.title_ru : data.earn.title_en}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.earn.bullets_ru : data.earn.bullets_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Coins className="h-4 w-4 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? data.balance.title_ru : data.balance.title_en}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              {(ru ? data.balance.bullets_ru : data.balance.bullets_en).map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
          <ShieldAlert className="h-4 w-4 text-amber-700" />
          <h2 className="text-lg font-bold text-slate-800">{ru ? data.noSink.title_ru : data.noSink.title_en}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          <ul className="list-disc space-y-2 pl-5">
            {(ru ? data.noSink.bullets_ru : data.noSink.bullets_en).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
