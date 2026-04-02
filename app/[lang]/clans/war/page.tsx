import Link from "next/link";
import { ChevronRight, Swords, Trophy, Users, ShieldAlert, Timer, Percent, Coins, ArrowRight } from "lucide-react";

export default async function ClanWarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ru = lang === "ru";

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/${lang}/clans`} className="hover:text-amber-700 hover:underline">
          {ru ? "Кланы" : "Clans"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">{ru ? "Клановая война" : "Clan War"}</span>
      </nav>

      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-rose-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{ru ? "Клановая война" : "Clan War"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-700">
          {ru
            ? "Сводка правил, наград и расчёта потерь по экрану «Правила войны»."
            : "Rules, rewards, and loss calculation based on the “War rules” screen."}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Link
            href={`/${lang}/war`}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <Coins className="h-3.5 w-3.5" />
            {ru ? "$WAR и Buyback (обмен на USDT)" : "$WAR & Buyback (exchange to USDT)"}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-base font-bold text-emerald-900">{ru ? "Победа" : "Win"}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-emerald-900/90">
            <li>{ru ? "100% ресурсов от потерянных войск противника" : "100% of resources from enemy troop losses"}</li>
            <li>{ru ? "Больше $WAR" : "More $WAR"}</li>
            <li>{ru ? "Больше наград (EXP/звёзды/сундуки)" : "More rewards (EXP/stars/chests)"}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-bold text-amber-900">{ru ? "Поражение" : "Loss"}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-amber-900/90">
            <li>{ru ? "Меньше $WAR" : "Less $WAR"}</li>
            <li>{ru ? "Награды зависят от вклада" : "Rewards depend on contribution"}</li>
            <li>{ru ? "Низкие потери врага могут не дать наград" : "Low enemy losses may yield no rewards"}</li>
          </ul>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
          <h2 className="text-base font-bold text-rose-900">{ru ? "Сдача (менее 50% силы)" : "Surrender (<50% power)"}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-rose-900/90">
            <li>{ru ? "Штраф: −50% дневной энергии (мин. 2 остаётся)" : "Penalty: -50% daily energy (min 2 remains)"}</li>
            <li>{ru ? "В будущем — доп. штрафы" : "More penalties may be added"}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
          <Swords className="h-4 w-4 text-rose-700" />
          <h2 className="text-lg font-bold text-slate-800">{ru ? "Правила войны" : "War rules"}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              {ru
                ? "Основатель клана или его заместители могут начать войну."
                : "The clan founder or their deputies can start a war."}
            </li>
            <li className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-zinc-500" />
              {ru ? "Война длится 12 часов." : "War lasts 12 hours."}
            </li>
            <li>
              {ru
                ? "Только кланы с мощностью не менее 90% мощности атакующего клана могут быть целью."
                : "Only clans with at least 90% of the attacker’s power can be targeted."}
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              {ru
                ? "Оба клана должны иметь минимум 5 участников, чтобы участвовать в войне."
                : "Both clans must have at least 5 members to participate."}
            </li>
            <li>
              {ru
                ? "Когда начинается война, 5% вражеских войск в замках автоматически вызываются."
                : "When the war starts, 5% of enemy troops in castles are auto-called."}
            </li>
            <li>
              {ru
                ? "Значение защиты не видно в течение первых 3 часов после начала войны."
                : "Defense value is hidden for the first 3 hours after the war starts."}
            </li>
            <li>
              {ru
                ? "Можно отправлять неограниченное количество войск в любое время до окончания войны."
                : "You can send unlimited troops at any time until the war ends."}
            </li>
            <li>
              {ru
                ? "Только участники, вступившие в клан до начала войны, могут отправлять войска и быть призванными."
                : "Only members who joined before the war started can send troops and be called."}
            </li>
            <li>
              {ru
                ? "Участники войны получают награды в зависимости от их вклада."
                : "Participants receive rewards based on contribution."}
            </li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Trophy className="h-4 w-4 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? "Награды" : "Rewards"}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <p className="font-semibold text-zinc-800">{ru ? "Победившая сторона" : "Winning side"}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                {ru
                  ? "Получает 100% ресурсов от потерянных войск противника."
                  : "Receives 100% of resources from the opponent’s lost troops."}
              </li>
              <li>{ru ? "Получает $WAR." : "Receives $WAR."}</li>
            </ul>

            <p className="mt-4 font-semibold text-zinc-800">{ru ? "Проигравшая сторона" : "Losing side"}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>{ru ? "Получает меньше $WAR." : "Receives less $WAR."}</li>
              <li>
                {ru
                  ? "Если проигравший клан отправил менее 50% от своей общей силы — это считается сдачей."
                  : "If the losing clan sent less than 50% of its total power, it is considered a surrender."}
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-rose-700" />
                <span>
                  {ru
                    ? "При сдаче участники теряют 50% своей дневной энергии (минимум 2 энергии остаётся)."
                    : "On surrender, participants lose 50% of their daily energy (minimum 2 energy remains)."}
                </span>
              </li>
              <li>
                {ru
                  ? "В будущем будут добавлены дополнительные штрафы за сдачу."
                  : "Additional surrender penalties will be added in the future."}
              </li>
            </ul>

            <p className="mt-4 font-semibold text-zinc-800">{ru ? "Больше наград" : "More rewards"}</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                {ru
                  ? "Обе стороны получают EXP, звёздочки и сундуки с картами в зависимости от потерь войск противника."
                  : "Both sides get EXP, stars, and card chests depending on the opponent’s troop losses."}
              </li>
              <li>
                {ru
                  ? "Звёздный уровень зависит от уровня игрока: 1–9 → уровень 1, 10–19 → уровень 2 и т.д."
                  : "Star level depends on player level: 1–9 → level 1, 10–19 → level 2, etc."}
              </li>
              <li>
                {ru
                  ? "Уровень 35+ имеет более высокий шанс на сундук с картами 4–5 уровня."
                  : "Level 35+ has a higher chance to receive a chest with level 4–5 cards."}
              </li>
              <li>{ru ? "Победители получают больше наград." : "Winners receive more rewards."}</li>
              <li>
                {ru
                  ? "Низкий урон или низкие потери у врага могут не приносить награды."
                  : "Low damage or low enemy losses may yield no rewards."}
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <Percent className="h-4 w-4 text-sky-700" />
            <h2 className="text-lg font-bold text-slate-800">{ru ? "Расчёт потерь" : "Loss calculation"}</h2>
          </div>
          <div className="px-5 py-4 text-sm text-zinc-700">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {ru
                  ? "Общие потери = 20%, разделённые по соотношению сил противника."
                  : "Total losses = 20%, split by the ratio of the opponent’s power."}
              </li>
              <li>
                {ru ? "Формула:" : "Formula:"}{" "}
                <span className="font-semibold text-zinc-900">
                  {ru
                    ? "ваш процент потерь = 20% × (мощь врага / общая мощь)"
                    : "your loss % = 20% × (enemy power / total power)"}
                </span>
              </li>
            </ul>

            <div className="mt-4 overflow-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-2">{ru ? "Соотношение сил" : "Power ratio"}</th>
                    <th className="px-4 py-2">{ru ? "Потери сильного" : "Stronger losses"}</th>
                    <th className="px-4 py-2">{ru ? "Потери слабого" : "Weaker losses"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="px-4 py-2 font-semibold text-zinc-800">50 / 50</td>
                    <td className="px-4 py-2 text-zinc-700">10%</td>
                    <td className="px-4 py-2 text-zinc-700">10%</td>
                  </tr>
                  <tr className="bg-zinc-50/40">
                    <td className="px-4 py-2 font-semibold text-zinc-800">60 / 40</td>
                    <td className="px-4 py-2 text-zinc-700">8%</td>
                    <td className="px-4 py-2 text-zinc-700">12%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-semibold text-zinc-800">80 / 20</td>
                    <td className="px-4 py-2 text-zinc-700">4%</td>
                    <td className="px-4 py-2 text-zinc-700">16%</td>
                  </tr>
                  <tr className="bg-zinc-50/40">
                    <td className="px-4 py-2 font-semibold text-zinc-800">5x+</td>
                    <td className="px-4 py-2 text-zinc-700">{ru ? "0% (победитель)" : "0% (winner)"}</td>
                    <td className="px-4 py-2 text-zinc-700">{ru ? "20% (проигравший)" : "20% (loser)"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="text-lg font-bold text-slate-800">{ru ? "Интерфейс (по скринам)" : "UI (from screenshots)"}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-zinc-700">
          <ul className="list-disc space-y-2 pl-5">
            <li>{ru ? "Экран «Война в процессе» с таймером и шкалой." : "“War in progress” screen with timer and progress bar."}</li>
            <li>{ru ? "Карточка клана: уровень, основатель, мощь клана, участники, победы/потери, условия членства." : "Clan card: level, founder, clan power, members, wins/losses, membership requirements."}</li>
            <li>{ru ? "Вклад участников (список + вклад в процентах/значениях)." : "Participant contribution list."}</li>
            <li>{ru ? "История войн и «Недавние войны» (закончились более 6 часов назад)." : "War history and “Recent wars” (ended 6+ hours ago)."}</li>
            <li>{ru ? "Окно отправки войск на войну (по типам юнитов)." : "Send troops modal (by unit types)."}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

