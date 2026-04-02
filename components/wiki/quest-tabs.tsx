"use client";

import { useState } from "react";
import {
  Star,
  Swords,
  ScrollText,
  Calendar,
  Gift,
  ChevronDown,
  Gem,
} from "lucide-react";
import { ResourceIcon, type ResourceKey } from "@/components/wiki/resource-icon";

// ─── Serialisable prop types (built server-side) ───

export type RewardPart = { res: string; amount: string };

export type DailyItem = {
  desc: string;
  points: number;
  reward: RewardPart[];
};

export type DailyRewardTier = {
  points: number;
  reward: RewardPart[];
};

export type MainChapter = {
  title: string;
  quests: { step: number; desc: string; reward: RewardPart[] }[];
};

export type SideCategoryGroup = {
  category: string;
  quests: {
    desc: string;
    milestones: number;
    rangeLabel: string;
  }[];
};

export type BotTask = {
  title: string;
  desc: string;
  reward: number;
  url: string;
};

type Props = {
  lang: string;
  daily: DailyItem[];
  dailyRewards: DailyRewardTier[];
  mainChapters: MainChapter[];
  sideGroups: SideCategoryGroup[];
  botTasks: BotTask[];
};

type Tab = "daily" | "main" | "side" | "special";

const TABS: { id: Tab; en: string; ru: string; icon: React.ReactNode }[] = [
  { id: "daily",   en: "Daily Quests",      ru: "Ежедневные",       icon: <Calendar className="h-4 w-4" /> },
  { id: "main",    en: "Main Story",        ru: "Основные квесты",  icon: <ScrollText className="h-4 w-4" /> },
  { id: "side",    en: "Side Achievements",  ru: "Побочные задания", icon: <Star className="h-4 w-4" /> },
  { id: "special", en: "Special Tasks",      ru: "Особые задания",  icon: <Swords className="h-4 w-4" /> },
];

function ResImg({ type }: { type: string }) {
  if (type === "food" || type === "wood" || type === "stone" || type === "gem") {
    return <ResourceIcon res={type satisfies ResourceKey} className="inline-block h-4 w-4 align-text-bottom" />;
  }
  return null;
}

function Reward({ parts }: { parts: RewardPart[] }) {
  if (parts.length === 0) return <span className="text-zinc-400">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
      {parts.map((p) => (
        <span key={p.res} className="inline-flex items-center gap-0.5 whitespace-nowrap">
          <ResImg type={p.res} />
          <span>{p.amount}</span>
        </span>
      ))}
    </span>
  );
}

export default function QuestTabs({ lang, daily, dailyRewards, mainChapters, sideGroups, botTasks }: Props) {
  const [tab, setTab] = useState<Tab>("daily");
  const ru = lang === "ru";

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-amber-800 shadow-sm"
                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
            }`}
          >
            {t.icon}
            {ru ? t.ru : t.en}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "daily" && <DailyTab lang={lang} daily={daily} rewards={dailyRewards} />}
      {tab === "main" && <MainTab lang={lang} chapters={mainChapters} />}
      {tab === "side" && <SideTab lang={lang} groups={sideGroups} />}
      {tab === "special" && <SpecialTab lang={lang} tasks={botTasks} />}
    </div>
  );
}

// ─── Daily Tab ───

function DailyTab({ lang, daily, rewards }: { lang: string; daily: DailyItem[]; rewards: DailyRewardTier[] }) {
  const ru = lang === "ru";
  const totalPts = daily.reduce((s, d) => s + d.points, 0);

  return (
    <div className="space-y-4">
      {/* Milestone bar */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <h3 className="mb-3 text-sm font-bold text-amber-800">
          {ru ? "Награды за очки активности" : "Activity Point Rewards"}
          <span className="ml-2 text-xs font-normal text-amber-600">
            ({ru ? "макс" : "max"} {totalPts} {ru ? "очков" : "pts"})
          </span>
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {rewards.map((r, i) => (
            <div key={r.points} className="flex items-center gap-2">
              <div
                className={`flex min-w-[80px] flex-col items-center rounded-lg border-2 px-3 py-2 text-center ${
                  i === rewards.length - 1
                    ? "border-amber-400 bg-amber-100"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <span className="text-lg font-bold text-slate-800">{r.points}</span>
                <span className="text-[10px] text-zinc-400">{ru ? "очков" : "pts"}</span>
                <span className="mt-1 text-xs text-zinc-600"><Reward parts={r.reward} /></span>
              </div>
              {i < rewards.length - 1 && (
                <div className="h-0.5 w-4 bg-zinc-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quest cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {daily.map((d, i) => (
          <div
            key={i}
            className="flex flex-col rounded-lg border border-zinc-200 bg-white p-3"
          >
            <p className="flex-1 text-sm font-medium text-zinc-800">{d.desc}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
                +{d.points} {ru ? "очк." : "pts"}
              </span>
              <span className="text-xs text-zinc-500"><Reward parts={d.reward} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Tab ───

function MainTab({ lang, chapters }: { lang: string; chapters: MainChapter[] }) {
  const ru = lang === "ru";

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        {ru
          ? `Основные квесты — это последовательная цепочка заданий, которая ведёт вас по игре. Всего ${chapters.reduce((s, c) => s + c.quests.length, 0)} квестов.`
          : `Main quests form a sequential chain guiding your progression. ${chapters.reduce((s, c) => s + c.quests.length, 0)} quests total.`}
      </p>

      {chapters.map((ch, ci) => (
        <details key={ci} className="group rounded-lg border border-zinc-200 bg-white" open={ci === 0}>
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-zinc-50">
            <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
            {ch.title}
            <span className="ml-auto text-xs font-normal text-zinc-400">
              {ch.quests.length} {ru ? "квестов" : "quests"}
            </span>
          </summary>
          <div className="border-t border-zinc-100">
            <table className="w-full text-sm">
              <tbody>
                {ch.quests.map((q) => (
                  <tr key={q.step} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                    <td className="w-10 px-3 py-2 text-center text-xs font-bold text-zinc-400">
                      #{q.step}
                    </td>
                    <td className="px-2 py-2 text-zinc-700">{q.desc}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-xs text-zinc-500">
                      <Reward parts={q.reward} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  );
}

// ─── Side Tab ───

function SideTab({ lang, groups }: { lang: string; groups: SideCategoryGroup[] }) {
  const ru = lang === "ru";

  return (
    <div className="space-y-3">
      <p className="text-sm text-zinc-500">
        {ru
          ? "Побочные задания — долгосрочные достижения с множеством этапов. Выполняйте их по мере прогресса."
          : "Side achievements are long-term goals with multiple milestones. Complete them as you progress."}
      </p>

      {groups.map((g) => (
        <details key={g.category} className="group rounded-lg border border-zinc-200 bg-white" open>
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-zinc-50">
            <ChevronDown className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
            {g.category}
            <span className="ml-auto text-xs font-normal text-zinc-400">
              {g.quests.length} {ru ? "заданий" : "quests"}
            </span>
          </summary>
          <div className="border-t border-zinc-100 divide-y divide-zinc-50">
            {g.quests.map((q, qi) => (
              <div key={qi} className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-700">{q.desc}</p>
                  <p className="text-xs text-zinc-400">{q.rangeLabel}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {q.milestones} {ru ? "этапов" : "milestones"}
                </span>
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function ContentPromoTask({ lang }: { lang: string }) {
  const ru = lang === "ru";
  const tiers: { views: string; reward: string }[] = [
    { views: "100 — 999", reward: "50" },
    { views: "1K — 4.9K", reward: "100" },
    { views: "5K — 9.9K", reward: "500" },
    { views: "10K — 49.9K", reward: "1K" },
    { views: "50K — 99.9K", reward: "5K" },
    { views: "100K — 499K", reward: "10K" },
    { views: "500K — 999K", reward: "500K" },
    { views: "1M +", reward: "1M" },
  ];

  return (
    <section className="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50">
      <div className="border-b border-emerald-100 px-4 py-3">
        <h3 className="text-sm font-bold text-emerald-900">
          {ru ? "Постинг контента (Special Task)" : "Content posting (Special Task)"}
        </h3>
        <p className="mt-1 text-xs text-emerald-800/80">
          {ru
            ? "Снимите короткое фан-видео и получите награду за просмотры."
            : "Create a short fan video and earn rewards based on views."}
        </p>
      </div>

      <div className="grid gap-4 px-4 py-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/60 bg-white/70 p-4 text-sm text-zinc-700">
          <p className="font-semibold text-zinc-800">{ru ? "Правила" : "Rules"}</p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
            <li>
              {ru
                ? "Снимите фанатское видео о FOMO Fighters для YouTube Shorts, Instagram Reels или TikTok."
                : "Create a fan video about FOMO Fighters for YouTube Shorts, Instagram Reels, or TikTok."}
            </li>
            <li>
              {ru
                ? "Добавьте хэштег #fomofighters и ваш реферальный код в описание."
                : "Add the hashtag #fomofighters and your referral code to the description."}
            </li>
            <li>
              {ru
                ? "Отправьте ссылку на публикацию, когда достигнете 100+ просмотров (учитываются просмотры на момент отправки)."
                : "Send the publication link when you reach 100+ views (views are counted at the moment of submission)."}
            </li>
            <li>
              {ru
                ? "Если правила нарушены — участие и награда могут быть отклонены."
                : "If the rules are violated, participation and rewards may be rejected."}
            </li>
          </ol>
        </div>

        <div className="overflow-hidden rounded-lg border border-emerald-100 bg-white">
          <div className="flex items-center justify-between bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>{ru ? "Просмотры" : "Views"}</span>
            <span className="inline-flex items-center gap-1">
              <ResImg type="gem" />
              {ru ? "Награда" : "Reward"}
            </span>
          </div>
          <div className="divide-y divide-zinc-100">
            {tiers.map((t) => (
              <div key={t.views} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-medium text-zinc-700">{t.views}</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                  <ResImg type="gem" />
                  {t.reward}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Special Tab ───

function SpecialTab({ lang, tasks }: { lang: string; tasks: BotTask[] }) {
  const ru = lang === "ru";

  return (
    <div className="space-y-4">
      <ContentPromoTask lang={lang} />
      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Gift className="h-4 w-4 text-amber-500" />
            {ru ? "Разовые задания" : "One-Time Tasks"}
          </h3>
        </div>
        <div className="divide-y divide-zinc-50">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-700">{t.title}</p>
                <p className="mt-0.5 text-xs text-zinc-400 line-clamp-2">{t.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                  <Gem className="mr-0.5 inline-block h-3 w-3" />
                  {t.reward}
                </span>
                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
                  >
                    →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
