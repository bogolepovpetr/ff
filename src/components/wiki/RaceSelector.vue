<script setup lang="ts">
const RACE_META: Record<string, { img: string; accent: string; activeAccent: string; textColor: string }> = {
  elf: {
    img: "/img/races/race-elf.png",
    accent: "border-emerald-300 bg-emerald-50",
    activeAccent: "border-emerald-400 bg-emerald-100 ring-2 ring-emerald-300",
    textColor: "text-emerald-800",
  },
  human: {
    img: "/img/races/race-human.png",
    accent: "border-sky-300 bg-sky-50",
    activeAccent: "border-sky-400 bg-sky-100 ring-2 ring-sky-300",
    textColor: "text-sky-800",
  },
  demon: {
    img: "/img/races/race-demon.png",
    accent: "border-rose-300 bg-rose-50",
    activeAccent: "border-rose-400 bg-rose-100 ring-2 ring-rose-300",
    textColor: "text-rose-800",
  },
};

type RaceData = { key: string; title: string; desc?: string };

defineProps<{
  lang: string;
  races: RaceData[];
  selectedRace: string;
}>();

const emit = defineEmits<{ select: [race: string] }>();
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <template v-for="race in races" :key="race.key">
      <button
        v-if="RACE_META[race.key]"
        type="button"
        @click="emit('select', race.key)"
        class="flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all sm:flex-col sm:items-center sm:gap-2 sm:p-4 sm:text-center"
        :class="selectedRace === race.key ? RACE_META[race.key].activeAccent : `${RACE_META[race.key].accent} hover:shadow-md`"
      >
        <img :src="RACE_META[race.key].img" :alt="race.title" class="h-16 w-16 shrink-0 rounded-xl object-contain sm:h-24 sm:w-24" />
        <div class="min-w-0">
          <p class="text-sm font-bold" :class="RACE_META[race.key].textColor">{{ race.title }}</p>
          <p v-if="race.desc" class="mt-0.5 text-xs leading-snug text-zinc-500">{{ race.desc }}</p>
        </div>
      </button>
    </template>
  </div>
</template>
