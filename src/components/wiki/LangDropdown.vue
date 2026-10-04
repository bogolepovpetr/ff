<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps<{
  lang: string;
}>();

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

const open = ref(false);
const root = ref<HTMLElement | null>(null);

const current = computed(() => LANGS.find((l) => l.code === props.lang) ?? LANGS[0]);

function buildUrl(target: string): string {
  const pathname = window.location.pathname;
  const parts = pathname.split("/");
  // parts[0] === "" always; parts[1] is either the ru prefix or the first real segment.
  const isRu = parts[1] === "ru";
  const rest = isRu ? parts.slice(2) : parts.slice(1);
  if (target === "en") return "/" + rest.join("/");
  return "/ru" + (rest.length ? "/" + rest.join("/") : "");
}

function handleClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleClickOutside));
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      @click="open = !open"
      class="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:px-3 sm:text-sm"
    >
      <span class="text-sm leading-none">{{ current.flag }}</span>
      <span>{{ current.label }}</span>
      <svg
        class="h-3.5 w-3.5 transition-transform"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      ><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" /></svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-lg border border-border bg-card shadow-lg"
    >
      <a
        v-for="l in LANGS"
        :key="l.code"
        :href="buildUrl(l.code)"
        @click="open = false"
        class="flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors"
        :class="l.code === lang ? 'bg-primary/10 font-semibold text-primary' : 'text-foreground hover:bg-muted'"
      >
        <span class="text-base leading-none">{{ l.flag }}</span>
        <span>{{ l.label }}</span>
        <svg v-if="l.code === lang" class="ml-auto h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </a>
    </div>
  </div>
</template>
