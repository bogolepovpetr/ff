import Link from "next/link";
import { ChevronRight, Percent, ArrowRightLeft, Wallet, Gamepad2 } from "lucide-react";
import { getReferralData } from "@/lib/data";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function ReferralRevsharePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const data = getReferralData();
  const rev = data.revshare;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${lang}/referral`} className="hover:text-amber-700 hover:underline">
          {ru ? "Рефералы" : "Referral"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{ru ? "Rev share (USDT)" : "Rev share (USDT)"}</span>
      </nav>

      <div className="rounded-xl border border-sky-200 bg-sky-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
            <Percent className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">{ru ? "Rev share" : "Revenue share"}</h1>
            <p className="mt-2 text-sm text-zinc-700">
              {ru ? "Вы получаете" : "You receive"}{" "}
              <span className="font-semibold text-zinc-900">{rev.share_percent}%</span>{" "}
              {ru
                ? "за каждую покупку, совершенную вашими друзьями."
                : "from each purchase made by your friends."}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">{ru ? "Вариант 1: Вывести реальные USDT" : "Option 1: Withdraw real USDT"}</h2>
          </div>
          <p className="mt-3 text-sm text-zinc-700">{ru ? rev.withdraw.note_ru : rev.withdraw.note_en}</p>
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            <p>
              <span className="font-semibold">{ru ? "Минимальная сумма" : "Minimum"}</span>:{" "}
              {fmtNumber(rev.withdraw.min_usdt)} USDT
            </p>
            <p className="mt-1">
              <span className="font-semibold">{ru ? "Контакт поддержки" : "Support"}</span>:{" "}
              {rev.withdraw.support_contact}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {ru ? "Вариант 2: Конвертировать в игровую USDT" : "Option 2: Convert to in-game USDT"}
            </h2>
          </div>
          <p className="mt-3 text-sm text-zinc-700">{ru ? rev.convert.note_ru : rev.convert.note_en}</p>
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            <p>
              <span className="font-semibold">{ru ? "Минимум" : "Minimum"}</span>:{" "}
              {fmtNumber(rev.convert.min_stars)} {ru ? "звёзд" : "Stars"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-800">{ru ? "Что это значит на практике" : "What this means"}</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>
            {ru
              ? "Rev share начисляется от покупок ваших приглашённых друзей."
              : "Rev share is credited from purchases of your invited friends."}
          </li>
          <li>
            {ru
              ? "Доступно два пути: вывести реальные USDT или конвертировать в внутриигровой USDT-баланс."
              : "Two paths: withdraw real USDT or convert to in-game USDT balance."}
          </li>
          <li>
            {ru
              ? "Для вывода есть минимальная сумма и обращение в поддержку."
              : "Withdrawals have a minimum amount and require contacting support."}
          </li>
        </ul>
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
          <ArrowRightLeft className="h-4 w-4" />
          {ru ? "Доля: " : "Share: "}
          {rev.share_percent}%
        </div>
      </section>
    </div>
  );
}

