<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VueIcon from "@/components/icons/VueIcon.vue";
import { useT } from "@/lib/i18n";

type TroopData = {
  key: string;
  title: string;
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
};

const props = defineProps<{
  troops: TroopData[];
  tierColors: { border: string; bg: string; text: string; badge: string };
  lang: string;
  raceLabels: Record<string, string>;
  initialRace?: string;
}>();

function t(key: string, fallback?: string) {
  return useT(props.lang)(key, fallback);
}

function fmtTime(seconds?: number): string {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
}

function fmtCost(v?: number): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

const initialIdx = props.initialRace ? Math.max(0, props.troops.findIndex((t) => t.race === props.initialRace)) : 0;
const selectedIdx = ref(initialIdx);
const selected = computed(() => props.troops[selectedIdx.value] ?? props.troops[0]);

onMounted(() => {
  const fromUrl = new URLSearchParams(window.location.search).get("race");
  if (!fromUrl) return;
  const idx = props.troops.findIndex((t) => t.race === fromUrl);
  if (idx >= 0) selectedIdx.value = idx;
});

const STAT_ICONS = [
  { key: "atk" as const, icon: "swords", label: t("troopRacePanel.statAttack") },
  { key: "def" as const, icon: "shield", label: t("troopRacePanel.statDefense") },
  { key: "speed" as const, icon: "zap", label: t("troopRacePanel.statSpeed") },
  { key: "load" as const, icon: "package", label: t("troopRacePanel.statLoad") },
];

function raceLabel(race?: string): string {
  return props.raceLabels[race ?? ""] ?? race ?? "—";
}

const RES_ICON: Record<string, string> = {
  food: "/img/icon/food.svg",
  wood: "/img/icon/wood.png",
  stone: "/img/icon/stone.svg",
};
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-1.5 border-b border-zinc-100 px-4 py-3">
      <button
        v-for="(t, i) in troops"
        :key="t.key"
        @click="selectedIdx = i"
        class="rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors"
        :class="i === selectedIdx
          ? `${tierColors.bg} ${tierColors.text} ring-1 ${tierColors.border.replace('border-', 'ring-')}`
          : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100'"
      >
        {{ raceLabel(t.race) }}
      </button>
    </div>

    <div class="flex flex-col gap-0 md:flex-row">
      <div class="flex flex-col justify-center gap-4 p-6 md:w-1/2">
        <p class="text-sm font-medium text-zinc-500">
          {{ selected.title }}
          <span class="ml-2 text-xs capitalize text-zinc-400">({{ raceLabel(selected.race) }})</span>
        </p>

        <div v-for="s in STAT_ICONS" :key="s.key" class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" :class="tierColors.bg">
            <VueIcon :name="s.icon" class="h-5 w-5" :class="tierColors.text" />
          </div>
          <div>
            <p class="text-xs text-zinc-400">{{ s.label }}</p>
            <p class="text-xl font-bold text-slate-900">{{ (selected as any)[s.key] ?? "—" }}</p>
          </div>
        </div>

        <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-lg bg-zinc-50 px-3 py-2">
            <p class="text-[10px] uppercase tracking-wide text-zinc-400">{{ t("troopRacePanel.power") }}</p>
            <p class="font-bold text-slate-800">{{ selected.power ?? "—" }}</p>
          </div>
          <div class="rounded-lg bg-zinc-50 px-3 py-2">
            <p class="text-[10px] uppercase tracking-wide text-zinc-400">{{ t("troopRacePanel.time") }}</p>
            <p class="font-bold text-slate-800">{{ fmtTime(selected.time) }}</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 text-sm">
          <span v-if="selected.priceFood" class="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
            <img :src="RES_ICON.food" alt="food" class="h-4 w-4" /> {{ fmtCost(selected.priceFood) }}
          </span>
          <span v-if="selected.priceWood" class="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-green-800">
            <img :src="RES_ICON.wood" alt="wood" class="h-4 w-4" /> {{ fmtCost(selected.priceWood) }}
          </span>
          <span v-if="selected.priceStone" class="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
            <img :src="RES_ICON.stone" alt="stone" class="h-4 w-4" /> {{ fmtCost(selected.priceStone) }}
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center border-t border-zinc-100 p-8 md:w-1/2 md:border-l md:border-t-0">
        <img
          v-if="selected?.key"
          :src="`/img/troops/${selected.key}.png`"
          :alt="`${raceLabel(selected.race)} ${selected.title}`"
          class="h-56 w-56 shrink-0 rounded-2xl object-contain"
        />
        <p class="mt-3 text-sm font-semibold capitalize text-zinc-600">{{ raceLabel(selected.race) }} {{ selected.title }}</p>
      </div>
    </div>
  </div>
</template>
