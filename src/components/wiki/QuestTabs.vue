<script setup lang="ts">
import { ref, computed } from "vue";
import VueIcon from "@/components/icons/VueIcon.vue";
import { useT } from "@/lib/i18n";

export type RewardPart = { res: string; amount: string };
export type DailyItem = { desc: string; points: number; reward: RewardPart[] };
export type DailyRewardTier = { points: number; reward: RewardPart[] };
export type MainChapter = { title: string; quests: { step: number; desc: string; reward: RewardPart[] }[] };
export type SideCategoryGroup = {
  category: string;
  quests: { desc: string; milestones: number; rangeLabel: string }[];
};
export type BotTask = { title: string; desc: string; reward: number; url: string };

const props = defineProps<{
  lang: string;
  daily: DailyItem[];
  dailyRewards: DailyRewardTier[];
  mainChapters: MainChapter[];
  sideGroups: SideCategoryGroup[];
  botTasks: BotTask[];
}>();

function t(key: string): string {
  return useT(props.lang)(key);
}

type Tab = "daily" | "main" | "side" | "special";
const tab = ref<Tab>("daily");

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "daily", label: "questTabs.tabDaily", icon: "calendar" },
  { id: "main", label: "questTabs.tabMain", icon: "scroll-text" },
  { id: "side", label: "questTabs.tabSide", icon: "star" },
  { id: "special", label: "questTabs.tabSpecial", icon: "swords" },
];

const RES_ICON: Record<string, string> = {
  food: "/img/icon/food.svg",
  wood: "/img/icon/wood.png",
  stone: "/img/icon/stone.svg",
  gem: "/img/icon/gem.png",
};

const totalPts = computed(() => props.daily.reduce((s, d) => s + d.points, 0));

const tiers = [
  { views: "100 — 999", reward: "50" },
  { views: "1K — 4.9K", reward: "100" },
  { views: "5K — 9.9K", reward: "500" },
  { views: "10K — 49.9K", reward: "1K" },
  { views: "50K — 99.9K", reward: "5K" },
  { views: "100K — 499K", reward: "10K" },
  { views: "500K — 999K", reward: "500K" },
  { views: "1M +", reward: "1M" },
];

const totalMainQuests = computed(() => props.mainChapters.reduce((s, c) => s + c.quests.length, 0));
</script>

<template>
  <div class="space-y-4">
    <!-- Tab bar -->
    <div class="flex gap-1 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-100 p-1">
      <button
        v-for="tabItem in TABS"
        :key="tabItem.id"
        @click="tab = tabItem.id"
        class="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="tab === tabItem.id ? 'bg-white text-amber-800 shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'"
      >
        <VueIcon :name="tabItem.icon" class="h-4 w-4" />
        {{ t(tabItem.label) }}
      </button>
    </div>

    <!-- Daily -->
    <div v-if="tab === 'daily'" class="space-y-4">
      <div class="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <h3 class="mb-3 text-sm font-bold text-amber-800">
          {{ t("questTabs.dailyRewardsTitle") }}
          <span class="ml-2 text-xs font-normal text-amber-600">
            ({{ t("questTabs.maxPointsLabel") }} {{ totalPts }} {{ t("questTabs.maxPointsUnit") }})
          </span>
        </h3>
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <template v-for="(r, i) in dailyRewards" :key="r.points">
            <div class="flex items-center gap-2">
              <div
                class="flex min-w-[80px] flex-col items-center rounded-lg border-2 px-3 py-2 text-center"
                :class="i === dailyRewards.length - 1 ? 'border-amber-400 bg-amber-100' : 'border-zinc-200 bg-white'"
              >
                <span class="text-lg font-bold text-slate-800">{{ r.points }}</span>
                <span class="text-[10px] text-zinc-400">{{ t("questTabs.tierPointsUnit") }}</span>
                <span class="mt-1 text-xs text-zinc-600">
                  <span v-if="r.reward.length === 0" class="text-zinc-400">—</span>
                  <span v-else class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span v-for="p in r.reward" :key="p.res" class="inline-flex items-center gap-0.5 whitespace-nowrap">
                      <img v-if="RES_ICON[p.res]" :src="RES_ICON[p.res]" :alt="p.res" class="inline-block h-4 w-4 align-text-bottom" />
                      <span>{{ p.amount }}</span>
                    </span>
                  </span>
                </span>
              </div>
              <div v-if="i < dailyRewards.length - 1" class="h-0.5 w-4 bg-zinc-300"></div>
            </div>
          </template>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(d, i) in daily" :key="i" class="flex flex-col rounded-lg border border-zinc-200 bg-white p-3">
          <p class="flex-1 text-sm font-medium text-zinc-800">{{ d.desc }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              +{{ d.points }} {{ t("questTabs.dailyPointsUnit") }}
            </span>
            <span class="text-xs text-zinc-500">
              <span v-if="d.reward.length === 0" class="text-zinc-400">—</span>
              <span v-else class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span v-for="p in d.reward" :key="p.res" class="inline-flex items-center gap-0.5 whitespace-nowrap">
                  <img v-if="RES_ICON[p.res]" :src="RES_ICON[p.res]" :alt="p.res" class="inline-block h-4 w-4 align-text-bottom" />
                  <span>{{ p.amount }}</span>
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main -->
    <div v-else-if="tab === 'main'" class="space-y-3">
      <p class="text-sm text-zinc-500">
        {{ t("questTabs.mainDesc").replace("{count}", String(totalMainQuests)) }}
      </p>

      <details v-for="(ch, ci) in mainChapters" :key="ci" class="group rounded-lg border border-zinc-200 bg-white" :open="ci === 0">
        <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-zinc-50">
          <VueIcon name="chevron-down" class="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
          {{ ch.title }}
          <span class="ml-auto text-xs font-normal text-zinc-400">{{ ch.quests.length }} {{ t("questTabs.chapterQuestsUnit") }}</span>
        </summary>
        <div class="overflow-x-auto border-t border-zinc-100">
          <table class="w-full text-sm">
            <tbody>
              <tr v-for="q in ch.quests" :key="q.step" class="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
                <td class="w-10 px-3 py-2 text-center text-xs font-bold text-zinc-400">#{{ q.step }}</td>
                <td class="px-2 py-2 text-zinc-700">{{ q.desc }}</td>
                <td class="whitespace-nowrap px-3 py-2 text-right text-xs text-zinc-500">
                  <span v-if="q.reward.length === 0" class="text-zinc-400">—</span>
                  <span v-else class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span v-for="p in q.reward" :key="p.res" class="inline-flex items-center gap-0.5 whitespace-nowrap">
                      <img v-if="RES_ICON[p.res]" :src="RES_ICON[p.res]" :alt="p.res" class="inline-block h-4 w-4 align-text-bottom" />
                      <span>{{ p.amount }}</span>
                    </span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>

    <!-- Side -->
    <div v-else-if="tab === 'side'" class="space-y-3">
      <p class="text-sm text-zinc-500">
        {{ t("questTabs.sideDesc") }}
      </p>

      <details v-for="g in sideGroups" :key="g.category" class="group rounded-lg border border-zinc-200 bg-white" open>
        <summary class="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-zinc-50">
          <VueIcon name="chevron-down" class="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" />
          {{ g.category }}
          <span class="ml-auto text-xs font-normal text-zinc-400">{{ g.quests.length }} {{ t("questTabs.sideGroupQuestsUnit") }}</span>
        </summary>
        <div class="border-t border-zinc-100 divide-y divide-zinc-50">
          <div v-for="(q, qi) in g.quests" :key="qi" class="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50/50">
            <div class="flex-1">
              <p class="text-sm font-medium text-zinc-700">{{ q.desc }}</p>
              <p class="text-xs text-zinc-400">{{ q.rangeLabel }}</p>
            </div>
            <span class="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {{ q.milestones }} {{ t("questTabs.milestonesUnit") }}
            </span>
          </div>
        </div>
      </details>
    </div>

    <!-- Special -->
    <div v-else-if="tab === 'special'" class="space-y-4">
      <section class="rounded-lg border border-emerald-200 bg-gradient-to-r from-emerald-50 to-amber-50">
        <div class="border-b border-emerald-100 px-4 py-3">
          <h3 class="text-sm font-bold text-emerald-900">
            {{ t("questTabs.specialPostingTitle") }}
          </h3>
          <p class="mt-1 text-xs text-emerald-800/80">
            {{ t("questTabs.specialPostingDesc") }}
          </p>
        </div>

        <div class="grid gap-4 px-4 py-4 lg:grid-cols-2">
          <div class="rounded-lg border border-white/60 bg-white/70 p-4 text-sm text-zinc-700">
            <p class="font-semibold text-zinc-800">{{ t("questTabs.rulesTitle") }}</p>
            <ol class="mt-2 list-decimal space-y-1.5 pl-5 text-sm">
              <li>
                {{ t("questTabs.ruleStep1") }}
              </li>
              <li>
                {{ t("questTabs.ruleStep2") }}
              </li>
              <li>
                {{ t("questTabs.ruleStep3") }}
              </li>
              <li>
                {{ t("questTabs.ruleStep4") }}
              </li>
            </ol>
          </div>

          <div class="overflow-hidden rounded-lg border border-emerald-100 bg-white">
            <div class="flex items-center justify-between bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span>{{ t("questTabs.viewsLabel") }}</span>
              <span class="inline-flex items-center gap-1">
                <img src="/img/icon/gem.png" alt="gem" class="inline-block h-4 w-4" />
                {{ t("questTabs.rewardLabel") }}
              </span>
            </div>
            <div class="divide-y divide-zinc-100">
              <div v-for="tier in tiers" :key="tier.views" class="flex items-center justify-between px-4 py-2 text-sm">
                <span class="font-medium text-zinc-700">{{ tier.views }}</span>
                <span class="inline-flex items-center gap-1 font-bold text-emerald-800">
                  <img src="/img/icon/gem.png" alt="gem" class="inline-block h-4 w-4" />
                  {{ tier.reward }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-zinc-200 bg-white">
        <div class="border-b border-zinc-100 px-4 py-3">
          <h3 class="flex items-center gap-2 text-sm font-bold text-slate-800">
            <VueIcon name="gift" class="h-4 w-4 text-amber-500" />
            {{ t("questTabs.oneTimeTasksTitle") }}
          </h3>
        </div>
        <div class="divide-y divide-zinc-50">
          <div v-for="(t, i) in botTasks" :key="i" class="flex items-center gap-3 px-4 py-3">
            <div class="flex-1">
              <p class="text-sm font-medium text-zinc-700">{{ t.title }}</p>
              <p class="mt-0.5 text-xs text-zinc-400 line-clamp-2">{{ t.desc }}</p>
            </div>
            <div class="flex shrink-0 items-center gap-1.5">
              <span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                <VueIcon name="gem" class="mr-0.5 inline-block h-3 w-3" />
                {{ t.reward }}
              </span>
              <a
                v-if="t.url"
                :href="t.url"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200"
              >→</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
