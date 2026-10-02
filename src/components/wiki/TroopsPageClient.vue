<script setup lang="ts">
import { ref, onMounted } from "vue";
import RaceSelector from "./RaceSelector.vue";
import { localizedPath, useT } from "@/lib/i18n";

type TroopData = {
  key: string;
  title: string;
  building: string;
  race?: string;
  atk?: number;
  def?: number;
  speed?: number;
  load?: number;
  time?: number;
  power?: number;
  priceFood?: number;
  priceWood?: number;
  priceStone?: number;
  tier?: number;
};

type TroopGroupData = { building: string; tier: number; title: string; troops: TroopData[] };
type RaceData = { key: string; title: string; desc?: string };

const props = defineProps<{
  lang: string;
  buildingOrder: string[];
  groupsByBuilding: Record<string, TroopGroupData[]>;
  buildingLabels: Record<string, string>;
  tierLabels: Record<number, { border: string; bg: string; text: string; badge: string }>;
  troopTypeLabels: Record<string, string>;
  races: RaceData[];
}>();

function t(key: string, fallback?: string) {
  return useT(props.lang)(key, fallback);
}

const race = ref("elf");

onMounted(() => {
  const fromUrl = new URLSearchParams(window.location.search).get("race");
  if (fromUrl && ["elf", "human", "demon"].includes(fromUrl)) race.value = fromUrl;
});

function troopForRace(troops: TroopData[]): TroopData | undefined {
  return troops.find((t) => t.race === race.value) ?? troops[0];
}

function formatTime(seconds?: number): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
}

function formatCost(v?: number): string {
  if (!v) return "";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

const RES_ICON: Record<string, string> = {
  food: "/img/icon/food.svg",
  wood: "/img/icon/wood.png",
  stone: "/img/icon/stone.svg",
};
</script>

<template>
  <div class="space-y-8">
    <RaceSelector :lang="lang" :races="races" :selected-race="race" @select="(r) => (race = r)" />

    <section v-for="buildingKey in buildingOrder" :key="buildingKey">
      <template v-if="groupsByBuilding[buildingKey]">
        <h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
          <span class="h-1.5 w-5 rounded-full bg-red-400"></span>
          {{ buildingLabels[buildingKey] ?? buildingKey }}
        </h2>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <a
            v-for="group in groupsByBuilding[buildingKey]"
            :key="`${buildingKey}-${group.tier}`"
            :href="`${localizedPath(`/troops/${buildingKey}/${group.tier}`, lang)}?race=${race}`"
            class="group relative flex flex-col rounded-xl border-2 p-4 transition-all hover:shadow-lg hover:-translate-y-0.5"
            :class="[(tierLabels[group.tier] ?? tierLabels[1]).border, (tierLabels[group.tier] ?? tierLabels[1]).bg]"
          >
            <span
              class="absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
              :class="(tierLabels[group.tier] ?? tierLabels[1]).badge"
            >
              {{ t("troopsPageClient.tierLabel") }} {{ group.tier }}
            </span>

            <div class="flex items-start gap-3">
              <img
                v-if="troopForRace(group.troops)?.key"
                :src="`/img/troops/${troopForRace(group.troops)!.key}.png`"
                :alt="troopTypeLabels[group.title] ?? group.title"
                class="h-14 w-14 shrink-0 rounded-lg object-contain"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate font-bold" :class="(tierLabels[group.tier] ?? tierLabels[1]).text">
                  {{ troopTypeLabels[group.title] ?? group.title }}
                </p>
              </div>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-1 text-[11px]">
              <div class="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
                <span class="text-zinc-400">ATK</span>
                <span class="font-semibold text-zinc-700">{{ troopForRace(group.troops)?.atk ?? "—" }}</span>
              </div>
              <div class="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
                <span class="text-zinc-400">DEF</span>
                <span class="font-semibold text-zinc-700">{{ troopForRace(group.troops)?.def ?? "—" }}</span>
              </div>
              <div class="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
                <span class="text-zinc-400">{{ t("troopsPageClient.time") }}</span>
                <span class="font-semibold text-zinc-700">{{ formatTime(troopForRace(group.troops)?.time) }}</span>
              </div>
              <div class="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
                <span class="text-zinc-400">{{ t("troopsPageClient.power") }}</span>
                <span class="font-semibold text-zinc-700">{{ troopForRace(group.troops)?.power ?? "—" }}</span>
              </div>
            </div>

            <div class="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
              <span v-if="troopForRace(group.troops)?.priceFood" class="inline-flex items-center gap-0.5">
                <img :src="RES_ICON.food" alt="food" class="inline-block h-4 w-4" />
                {{ formatCost(troopForRace(group.troops)?.priceFood) }}
              </span>
              <span v-if="troopForRace(group.troops)?.priceWood" class="inline-flex items-center gap-0.5">
                <img :src="RES_ICON.wood" alt="wood" class="inline-block h-4 w-4" />
                {{ formatCost(troopForRace(group.troops)?.priceWood) }}
              </span>
              <span v-if="troopForRace(group.troops)?.priceStone" class="inline-flex items-center gap-0.5">
                <img :src="RES_ICON.stone" alt="stone" class="inline-block h-4 w-4" />
                {{ formatCost(troopForRace(group.troops)?.priceStone) }}
              </span>
            </div>
          </a>
        </div>
      </template>
    </section>
  </div>
</template>
