<script setup lang="ts">
import { ref, computed } from "vue";
import { localizedPath } from "@/lib/i18n";

type SkillTreeNode = {
  key: string;
  title: string;
  tier: number;
  maxLevel: number;
  desc?: string;
  type?: string;
  col: number;
  row: number;
  parents: string[];
};
type SkillTreeData = { nodes: SkillTreeNode[]; maxCols: number; maxRows: number };

const props = defineProps<{
  trees: Record<string, SkillTreeData>;
  lang: string;
  categoryLabels: { key: string; label: string }[];
}>();

const NODE_W = 110;
const NODE_H = 100;
const GAP_X = 20;
const GAP_Y = 40;

const TIER_LINE_COLORS: Record<number, string> = {
  1: "#a1a1aa",
  2: "#34d399",
  3: "#60a5fa",
  4: "#a78bfa",
  5: "#fbbf24",
};

function lineColor(tier: number): string {
  if (tier <= 5) return TIER_LINE_COLORS[tier] ?? "#a1a1aa";
  if (tier <= 10) return "#60a5fa";
  if (tier <= 15) return "#a78bfa";
  return "#fbbf24";
}

function pickDefaultTab(): string {
  for (const { key } of props.categoryLabels) {
    if (props.trees[key]?.nodes?.length) return key;
  }
  const fallback = Object.keys(props.trees).find((k) => props.trees[k]?.nodes?.length);
  return fallback ?? "";
}

const activeTab = ref(pickDefaultTab());
const imgOk = ref<Record<string, boolean>>({});

const tree = computed(() => props.trees[activeTab.value] ?? props.trees[pickDefaultTab()] ?? null);

const nodePos = computed(() => {
  const map = new Map<string, { cx: number; cy: number }>();
  const t = tree.value;
  if (!t) return map;
  const padding = 40;
  for (const node of t.nodes) {
    const cx = padding + node.col * (NODE_W + GAP_X) + NODE_W / 2;
    const cy = padding + node.row * (NODE_H + GAP_Y) + NODE_H / 2;
    map.set(node.key, { cx, cy });
  }
  return map;
});

const svgSize = computed(() => {
  const t = tree.value;
  if (!t) return { w: 0, h: 0 };
  const padding = 40;
  const totalW = t.maxCols * (NODE_W + GAP_X) - GAP_X;
  const totalH = t.maxRows * (NODE_H + GAP_Y) - GAP_Y;
  return { w: totalW + padding * 2, h: totalH + padding * 2 };
});

function skillImage(key: string): string {
  return `/img/skills/${key}.jpg`;
}

type Edge = { key: string; d: string; color: string };
const edges = computed<Edge[]>(() => {
  const t = tree.value;
  if (!t) return [];
  const out: Edge[] = [];
  for (const node of t.nodes) {
    const child = nodePos.value.get(node.key);
    if (!child) continue;
    for (const pKey of node.parents) {
      const parent = nodePos.value.get(pKey);
      if (!parent) continue;
      const x1 = parent.cx;
      const y1 = parent.cy + NODE_H / 2;
      const x2 = child.cx;
      const y2 = child.cy - NODE_H / 2;
      const midY = (y1 + y2) / 2;
      out.push({
        key: `${pKey}-${node.key}`,
        d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
        color: lineColor(node.tier),
      });
    }
  }
  return out;
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-1 rounded-lg bg-zinc-100 p-1">
      <button
        v-for="cat in categoryLabels"
        :key="cat.key"
        @click="activeTab = cat.key"
        class="flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === cat.key ? 'bg-white text-slate-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'"
      >
        {{ cat.label }}
      </button>
    </div>

    <p v-if="!tree?.nodes?.length" class="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      {{ lang === "ru" ? "Дерево навыков пока недоступно." : "Skill tree data is not available." }}
    </p>

    <div v-else class="overflow-auto rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
      <div class="relative mx-auto" :style="{ width: svgSize.w + 'px', minHeight: svgSize.h + 'px' }">
        <svg class="absolute inset-0" :width="svgSize.w" :height="svgSize.h" style="pointer-events: none">
          <path
            v-for="edge in edges"
            :key="edge.key"
            :d="edge.d"
            fill="none"
            :stroke="edge.color"
            stroke-width="2"
            stroke-opacity="0.5"
          />
        </svg>

        <a
          v-for="node in tree.nodes"
          :key="node.key"
          :href="localizedPath(`/skills/${node.key}`, lang)"
          class="group absolute flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition-all hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5"
          :style="{
            left: (nodePos.get(node.key)?.cx ?? 0) - NODE_W / 2 + 'px',
            top: (nodePos.get(node.key)?.cy ?? 0) - NODE_H / 2 + 'px',
            width: NODE_W + 'px',
            height: NODE_H + 'px',
          }"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200 group-hover:bg-amber-50 group-hover:ring-amber-200">
            <span v-if="!imgOk[node.key]" class="text-sm font-extrabold text-zinc-700">
              {{ (node.title?.trim()?.[0] ?? "?").toUpperCase() }}
            </span>
            <img
              :src="skillImage(node.key)"
              :alt="node.title"
              class="h-10 w-10 object-cover"
              :class="imgOk[node.key] ? '' : 'hidden'"
              @load="imgOk[node.key] = true"
              @error="(e: Event) => ((e.target as HTMLElement).style.display = 'none')"
            />
          </div>
          <p class="mt-1 w-full truncate text-center text-[11px] font-semibold leading-tight text-zinc-800">
            {{ node.title }}
          </p>
          <span class="mt-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            {{ node.maxLevel }}/{{ node.maxLevel }}
          </span>
        </a>
      </div>
    </div>
  </div>
</template>
