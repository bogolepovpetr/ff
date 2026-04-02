import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { getGameVersion } from "@/lib/version";
import PatchBadge from "@/components/wiki/patch-badge";
import {
  getQuestsMain,
  getQuestsSide,
  getQuestsDaily,
  getQuestsDailyRewards,
  getQuestsBot,
} from "@/lib/data";
import {
  describeMainQuest,
  describeSideQuest,
  describeDailyQuest,
  formatReward,
  sideCategory,
  categoryLabel,
  type SideCategory,
} from "@/lib/quest-format";
import { formatCost } from "@/lib/format";
import QuestTabs from "@/components/wiki/quest-tabs";
import type {
  DailyItem,
  DailyRewardTier,
  MainChapter,
  SideCategoryGroup,
  BotTask,
} from "@/components/wiki/quest-tabs";

export default async function QuestsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const ver = getGameVersion();
  const ru = lang === "ru";

  // ─── Load raw data ───
  const mainRaw = getQuestsMain().sort((a, b) => a.order - b.order);
  const sideRaw = getQuestsSide();
  const dailyRaw = getQuestsDaily();
  const dailyRewardsRaw = getQuestsDailyRewards().sort((a, b) => a.points - b.points);
  const botRaw = getQuestsBot();

  // ─── Daily ───
  const daily: DailyItem[] = dailyRaw.map((q) => ({
    desc: describeDailyQuest(q, lang),
    points: q.points,
    reward: formatReward(q.food, q.wood, q.stone),
  }));

  const dailyRewards: DailyRewardTier[] = dailyRewardsRaw.map((r) => ({
    points: r.points,
    reward: formatReward(r.food, r.wood, r.stone, r.gem),
  }));

  // ─── Main quests → chapters by Castle level ───
  const mainChapters: MainChapter[] = [];
  let currentChapter: MainChapter | null = null;
  let step = 0;

  for (const q of mainRaw) {
    step++;
    const isCastle = q.type === "build" && q.data === "castle";

    if (isCastle && (!currentChapter || currentChapter.quests.length > 0)) {
      const castleLvl = q.count;
      const chTitle = ru
        ? `Замок ${castleLvl}`
        : `Castle ${castleLvl}`;
      currentChapter = { title: chTitle, quests: [] };
      mainChapters.push(currentChapter);
    }

    if (!currentChapter) {
      currentChapter = {
        title: ru ? "Начало" : "Prologue",
        quests: [],
      };
      mainChapters.push(currentChapter);
    }

    currentChapter.quests.push({
      step,
      desc: describeMainQuest(q, lang),
      reward: formatReward(q.food, q.wood, q.stone, q.gem),
    });
  }

  // Merge tiny chapters: if a castle chapter only has 1 quest (the castle itself),
  // fold the subsequent quests into it until the next castle
  // (already handled by the loop above)

  // ─── Side quests → grouped by category ───
  const catOrder: SideCategory[] = ["building", "training", "combat", "economy", "research", "social"];
  const catMap = new Map<SideCategory, SideCategoryGroup>();

  for (const cat of catOrder) {
    catMap.set(cat, {
      category: categoryLabel(cat, lang),
      quests: [],
    });
  }

  for (const q of sideRaw) {
    const cat = sideCategory(q.type);
    const group = catMap.get(cat)!;
    const first = q.counts[0];
    const last = q.counts[q.counts.length - 1];
    const rangeLabel =
      q.type === "build"
        ? `Lv.${first} → Lv.${last}`
        : `${formatCost(first)} → ${formatCost(last)}`;

    group.quests.push({
      desc: describeSideQuest(q, lang),
      milestones: q.counts.length,
      rangeLabel,
    });
  }

  const sideGroups = catOrder
    .map((c) => catMap.get(c)!)
    .filter((g) => g.quests.length > 0);

  // ─── Bot quests → one-time tasks (exclude riddles, chests, partner spam) ───
  const EXCLUDED_BOT_KEYS = new Set(["bybit", "bybit_kyc", "bybit_deposit_100", "tonpay_bot"]);
  const botTasks: BotTask[] = [];

  for (const b of botRaw) {
    if (b.key.startsWith("riddle_") || b.key.startsWith("chest_")) continue;
    if (EXCLUDED_BOT_KEYS.has(b.key)) continue;
    botTasks.push({
      title: b.title.replace(/\{(\w+)\}/g, "$1"),
      desc: b.desc.replace(/\{(\w+)\}/g, "$1").replace(/\n+/g, " ").trim(),
      reward: b.reward,
      url: b.actionUrl,
    });
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-zinc-500">
        <Link href={`/${lang}`} className="hover:text-amber-700 hover:underline">
          {ru ? "Главная" : "Home"}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-700">
          {ru ? "Квесты" : "Quests"}
        </span>
      </nav>

      {/* Hero banner */}
      <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ru ? "Квесты" : "Quests"}
        </h1>
        <p className="mt-1 text-sm font-medium text-amber-700">
          {ru
            ? "Ежедневные задания, основная кампания, побочные достижения и особые задачи"
            : "Daily objectives, main campaign, side achievements and special tasks"}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
          {ru
            ? `Игра содержит ${mainRaw.length} основных квестов, ${sideRaw.length} побочных достижений, ${dailyRaw.length} ежедневных заданий и ${botTasks.length} особых задач.`
            : `The game features ${mainRaw.length} main quests, ${sideRaw.length} side achievements, ${dailyRaw.length} daily objectives, and ${botTasks.length} special tasks.`}
        </p>
      </div>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      {/* Tabbed content */}
      <QuestTabs
        lang={lang}
        daily={daily}
        dailyRewards={dailyRewards}
        mainChapters={mainChapters}
        sideGroups={sideGroups}
        botTasks={botTasks}
      />

      {/* Reset info */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Clock className="h-4 w-4" />
        {ru
          ? "Ежедневные задания обновляются каждый день в 00:00 UTC."
          : "Daily objectives reset every day at 00:00 UTC."}
      </div>
    </div>
  );
}
