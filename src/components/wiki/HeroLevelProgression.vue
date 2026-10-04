<script setup lang="ts">
import { ref, computed } from "vue";
import { useT } from "@/lib/i18n";

export type HeroLevelRow = { level: number; exp: number };
export type HeroBonusCol = { key: string; label: string; perLevel: number };
export type HeroStarRank = { stars: number; maxLevel: number; bonusMult: number };

const props = defineProps<{
  lang: string;
  expTierMult: number;
  levelTextClass: string;
  rows: HeroLevelRow[];
  bonusCols: HeroBonusCol[];
  starRanks: HeroStarRank[];
}>();

function t(key: string, fallback?: string) {
  return useT(props.lang)(key, fallback);
}

const sortedStars = computed(() => [...props.starRanks].sort((a, b) => a.stars - b.stars));
const stars = ref(5);

const rank = computed(
  () => sortedStars.value.find((r) => r.stars === stars.value) ?? sortedStars.value[sortedStars.value.length - 1],
);
const maxLevel = computed(() => rank.value?.maxLevel ?? 0);
const bonusMult = computed(() => rank.value?.bonusMult ?? 1);

const visibleRows = computed(() => props.rows.filter((r) => r.level <= maxLevel.value));
const locale = computed(() => (props.lang === "ru" ? "ru-RU" : "en-US"));

function expDelta(level: number, cumulative: number): number | null {
  if (level <= 1) return null;
  const prev = props.rows.find((r) => r.level === level - 1);
  if (!prev) return null;
  return cumulative - prev.exp;
}

function formatBonus(n: number): string {
  const total = +n.toFixed(4);
  if (Number.isInteger(total)) return String(total);
  return total.toFixed(2).replace(/\.?0+$/, "");
}
</script>

<template>
  <section class="rounded-xl border border-zinc-200 bg-white">
    <div class="border-b border-zinc-100 px-5 py-3">
      <h2 class="text-lg font-bold text-slate-800">
        {{ t("heroLevelProgression.title") }}
      </h2>
      <p v-if="expTierMult > 1" class="text-xs text-zinc-400">
        {{ t("heroLevelProgression.tierMultiplier").replace("{mult}", String(expTierMult)) }}
      </p>
      <p class="mt-1 text-xs text-zinc-500">
        {{ t("heroLevelProgression.instructions") }}
      </p>

      <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span class="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {{ t("heroLevelProgression.starsLabel") }}
        </span>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="r in sortedStars"
            :key="r.stars"
            type="button"
            @click="stars = r.stars"
            class="rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors"
            :class="stars === r.stars
              ? 'border-amber-400 bg-amber-100 text-amber-900 shadow-sm'
              : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-white'"
            :title="t('heroLevelProgression.starButtonTitle').replace('{maxLevel}', String(r.maxLevel)).replace('{bonusMult}', String(r.bonusMult))"
          >
            {{ r.stars === 0 ? "0 ★" : "★".repeat(r.stars) }}
          </button>
        </div>
      </div>
      <p class="mt-2 text-xs text-zinc-500">{{ " " + t("heroLevelProgression.starRankPrefix") }} <strong>{{ maxLevel }}</strong>, {{ t("heroLevelProgression.starRankMiddle") }}
        <strong>{{ Math.round(bonusMult * 100) }}%</strong>
      </p>
    </div>

    <div class="overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <th class="px-4 py-2.5">{{ t("heroLevelProgression.colLevel") }}</th>
            <th class="px-4 py-2.5 text-right">{{ t("heroLevelProgression.colExpPerLevel") }}</th>
            <th v-for="c in bonusCols" :key="c.key" class="px-4 py-2.5 text-right">{{ c.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(e, i) in visibleRows"
            :key="e.level"
            class="border-b border-zinc-100"
            :class="i % 2 === 1 ? 'bg-zinc-50/50' : ''"
          >
            <td class="px-4 py-2 font-bold" :class="levelTextClass">{{ e.level }}</td>
            <td class="px-4 py-2 text-right tabular-nums text-zinc-700">
              {{
                expDelta(e.level, e.exp) == null
                  ? "—"
                  : Math.round(expDelta(e.level, e.exp)! * expTierMult).toLocaleString(locale)
              }}
            </td>
            <td v-for="c in bonusCols" :key="c.key" class="px-4 py-2 text-right tabular-nums font-medium text-emerald-700">
              +{{ formatBonus(c.perLevel * e.level * bonusMult) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
