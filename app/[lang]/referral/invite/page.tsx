import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";
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

export default async function ReferralInvitePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";
  const data = getReferralData();
  const invite = data.invite;

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
        <span className="font-medium text-zinc-700">{ru ? "Гемы за друзей" : "Gems for friends"}</span>
      </nav>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900">
              {ru ? "Пригласите друзей!" : "Invite friends!"}
            </h1>
            <p className="mt-2 text-sm text-zinc-700">
              {ru ? "Зарабатывай до" : "Earn up to"}{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                {fmtNumber(invite.max_per_friend_gems)}
              </span>{" "}
              {ru ? "за каждого друга." : "for each friend."}
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              {ru
                ? "Если у вашего друга есть Telegram Premium, ваш бонус утраивается."
                : "If your friend has Telegram Premium, your bonus is tripled."}
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              {ru ? "Ваш друг получит" : "Your friend receives"}{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                {fmtNumber(invite.friend_reward_gems)}
              </span>{" "}
              {ru ? "или" : "or"}{" "}
              <span className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                <ResourceIcon res="gem" className="h-4 w-4 text-sky-600" />
                {fmtNumber(invite.friend_reward_gems_premium)}
              </span>
              {ru ? ", если у него Telegram Premium." : " if they have Telegram Premium."}
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">{ru ? "Правила получения наград" : "Reward rules"}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {ru
                ? `Telegram Premium увеличивает награду в ${invite.premium_multiplier} раза.`
                : `Telegram Premium multiplies the reward by ${invite.premium_multiplier}x.`}
            </li>
            <li>{ru ? invite.requirement_ru : invite.requirement_en}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">{ru ? "Сетка наград" : "Reward tiers"}</h2>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-2">{ru ? "Друзей" : "Friends"}</th>
                <th className="px-4 py-2">{ru ? "Обычная" : "Standard"}</th>
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
      </section>
    </div>
  );
}

