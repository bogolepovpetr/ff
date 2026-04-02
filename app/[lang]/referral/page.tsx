import Link from "next/link";
import { ChevronRight, Gift, Users, ArrowRightLeft, Percent, ExternalLink } from "lucide-react";
import { getReferralData } from "@/lib/data";
import { ResourceIcon } from "@/components/wiki/resource-icon";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function rangeLabel(from: number, to: number | null, ru: boolean): string {
  if (to == null) return ru ? `от ${from}` : `${from}+`;
  if (from === to) return String(from);
  return ru ? `${from}–${to}` : `${from}-${to}`;
}

export default async function ReferralPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const data = getReferralData();

  const invite = data.invite;
  const rev = data.revshare;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{ru ? "Рефералы" : "Referral"}</span>
      </nav>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-emerald-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? "Реферальная система" : "Referral system"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {ru
            ? "Два источника дохода: гемы за приглашённых друзей и доля от покупок друзей (rev share)."
            : "Two income sources: gems for invited friends and a revenue share from friends' purchases."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            <Percent className="h-3.5 w-3.5" />
            {ru ? "Rev share" : "Rev share"}:{" "}
            <span className="font-semibold">{rev.share_percent}%</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
            <ResourceIcon res="gem" className="h-3.5 w-3.5 text-sky-600" />
            {ru ? "До" : "Up to"}{" "}
            <span className="font-semibold">
              {fmtNumber(invite.max_per_friend_gems)}
            </span>{" "}
            {ru ? "за друга" : "per friend"}
          </span>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href={`/${lang}/referral/invite`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">{ru ? "Гемы за друзей" : "Gems for friends"}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Сеткa наград + Telegram Premium" : "Reward tiers + Telegram Premium"}
              </p>
            </div>
            <ArrowRightLeft className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-emerald-600" />
          </div>
        </Link>

        <Link
          href={`/${lang}/referral/revshare`}
          className="group rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-zinc-800">{ru ? "Rev share (USDT)" : "Rev share (USDT)"}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {ru ? "Вывод и конвертация" : "Withdraw and convert"}
              </p>
            </div>
            <ArrowRightLeft className="ml-auto h-4 w-4 text-zinc-300 group-hover:text-sky-600" />
          </div>
        </Link>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">
            {ru ? "Быстро: сетка наград" : "Quick: reward tiers"}
          </h2>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">{ru ? "Друзей" : "Friends"}</th>
                <th className="px-4 py-2">{ru ? "Награда" : "Reward"}</th>
                <th className="px-4 py-2">{ru ? "Premium" : "Premium"}</th>
              </tr>
            </thead>
            <tbody>
              {invite.tiers.map((t, i) => (
                <tr
                  key={`${t.from}-${t.to ?? "plus"}`}
                  className={`border-b border-zinc-100 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}
                >
                  <td className="px-4 py-2 font-semibold text-zinc-800">
                    {rangeLabel(t.from, t.to, ru)}
                  </td>
                  <td className="px-4 py-2 text-zinc-700">
                    <span className="inline-flex items-center gap-1.5">
                      <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                      {fmtNumber(t.per_friend_gems)}
                      <span className="text-zinc-400">{ru ? "за друга" : "per friend"}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-zinc-700">
                    <span className="inline-flex items-center gap-1.5">
                      <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                      {fmtNumber(t.per_friend_gems_premium)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4 text-xs text-zinc-500">
          {ru
            ? `Если у друга есть Telegram Premium, ваш бонус утраивается (x${invite.premium_multiplier}).`
            : `If your friend has Telegram Premium, your bonus is tripled (x${invite.premium_multiplier}).`}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-bold text-slate-800">{ru ? "Поддержка" : "Support"}</h2>
        <p className="mt-2 text-sm text-zinc-600">
          {ru ? "По выводу USDT связывайтесь с:" : "For USDT withdrawal contact:"}{" "}
          <span className="font-semibold">{rev.withdraw.support_contact}</span>
        </p>
        <a
          href={`https://t.me/${rev.withdraw.support_contact.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <ExternalLink className="h-4 w-4" />
          {ru ? "Открыть в Telegram" : "Open in Telegram"}
        </a>
      </section>
    </div>
  );
}

