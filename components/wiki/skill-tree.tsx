"use client";

import { useState } from "react";
import Link from "next/link";
import type { SkillTreeData } from "@/lib/data";
import { skillImage } from "@/lib/images";

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

type Props = {
  trees: Record<string, SkillTreeData>;
  lang: string;
  categoryLabels: { key: string; label: string }[];
};

function pickDefaultTab(
  trees: Record<string, SkillTreeData>,
  categoryLabels: { key: string }[],
): string {
  for (const { key } of categoryLabels) {
    if (trees[key]?.nodes?.length) return key;
  }
  const fallback = Object.keys(trees).find((k) => trees[k]?.nodes?.length);
  return fallback ?? "";
}

export default function SkillTree({ trees, lang, categoryLabels }: Props) {
  const [activeTab, setActiveTab] = useState(() =>
    pickDefaultTab(trees, categoryLabels),
  );
  const [imgOk, setImgOk] = useState<Record<string, boolean>>({});

  const tree =
    trees[activeTab] ?? trees[pickDefaultTab(trees, categoryLabels)] ?? null;
  if (!tree?.nodes?.length) {
    return (
      <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {lang === "ru"
          ? "Дерево навыков пока недоступно."
          : "Skill tree data is not available."}
      </p>
    );
  }

  const totalW = tree.maxCols * (NODE_W + GAP_X) - GAP_X;
  const totalH = tree.maxRows * (NODE_H + GAP_Y) - GAP_Y;
  const padding = 40;
  const svgW = totalW + padding * 2;
  const svgH = totalH + padding * 2;

  const nodePos = new Map<string, { cx: number; cy: number }>();
  for (const node of tree.nodes) {
    const cx = padding + node.col * (NODE_W + GAP_X) + NODE_W / 2;
    const cy = padding + node.row * (NODE_H + GAP_Y) + NODE_H / 2;
    nodePos.set(node.key, { cx, cy });
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
        {categoryLabels.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === cat.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tree area */}
      <div className="overflow-auto rounded-xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
        <div className="relative" style={{ width: svgW, minHeight: svgH }}>
          {/* SVG connections */}
          <svg
            className="absolute inset-0"
            width={svgW}
            height={svgH}
            style={{ pointerEvents: "none" }}
          >
            {tree.nodes.map((node) => {
              const child = nodePos.get(node.key);
              if (!child) return null;
              return node.parents.map((pKey) => {
                const parent = nodePos.get(pKey);
                if (!parent) return null;
                const x1 = parent.cx;
                const y1 = parent.cy + NODE_H / 2;
                const x2 = child.cx;
                const y2 = child.cy - NODE_H / 2;
                const midY = (y1 + y2) / 2;
                return (
                  <path
                    key={`${pKey}-${node.key}`}
                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    fill="none"
                    stroke={lineColor(node.tier)}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                  />
                );
              });
            })}
          </svg>

          {/* Nodes */}
          {tree.nodes.map((node) => {
            const pos = nodePos.get(node.key);
            if (!pos) return null;
            const left = pos.cx - NODE_W / 2;
            const top = pos.cy - NODE_H / 2;
            return (
              <Link
                key={node.key}
                href={`/${lang}/skills/${node.key}`}
                className="group absolute flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-2 shadow-sm transition-all hover:shadow-md hover:border-amber-300 hover:-translate-y-0.5"
                style={{
                  left,
                  top,
                  width: NODE_W,
                  height: NODE_H,
                }}
              >
                {/* Icon circle */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-zinc-200 group-hover:bg-amber-50 group-hover:ring-amber-200">
                  {!imgOk[node.key] && (
                    <span className="text-sm font-extrabold text-zinc-700">
                      {(node.title?.trim()?.[0] ?? "?").toUpperCase()}
                    </span>
                  )}
                  <img
                    src={skillImage(node.key)}
                    alt={node.title}
                    className={`h-10 w-10 object-cover ${imgOk[node.key] ? "" : "hidden"}`}
                    onLoad={() => setImgOk((m) => ({ ...m, [node.key]: true }))}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                {/* Title */}
                <p className="mt-1 w-full truncate text-center text-[11px] font-semibold leading-tight text-zinc-800">
                  {node.title}
                </p>
                {/* Level badge */}
                <span className="mt-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  {node.maxLevel}/{node.maxLevel}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
