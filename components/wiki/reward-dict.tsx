"use client";

import { ResourceIcon, type ResourceKey } from "@/components/wiki/resource-icon";
import { parseRewardDict, rewardKeyLabel } from "@/lib/format";

function fmtNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function RewardDict({
  dict,
  lang,
  className = "",
}: {
  dict?: Record<string, number | string>;
  lang: string;
  className?: string;
}) {
  const entries = parseRewardDict(dict);
  if (entries.length === 0) return <span className="text-zinc-400">—</span>;

  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 ${className}`}>
      {entries.map((e) => (
        <span key={e.key} className="inline-flex items-center gap-1">
          {e.kind === "resource" ? (
            <ResourceIcon res={e.key as ResourceKey} className="h-3.5 w-3.5" />
          ) : null}
          <span>
            {e.kind === "other" ? `${rewardKeyLabel(e.key, lang)}: ` : ""}
            {fmtNumber(e.amount)}
          </span>
        </span>
      ))}
    </div>
  );
}

export function RewardBits({
  food,
  wood,
  stone,
  gem,
}: {
  food?: number;
  wood?: number;
  stone?: number;
  gem?: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
      {food ? (
        <span className="inline-flex items-center gap-1">
          <ResourceIcon res="food" className="h-3.5 w-3.5" />
          {fmtNumber(food)}
        </span>
      ) : null}
      {wood ? (
        <span className="inline-flex items-center gap-1">
          <ResourceIcon res="wood" className="h-3.5 w-3.5" />
          {fmtNumber(wood)}
        </span>
      ) : null}
      {stone ? (
        <span className="inline-flex items-center gap-1">
          <ResourceIcon res="stone" className="h-3.5 w-3.5" />
          {fmtNumber(stone)}
        </span>
      ) : null}
      {gem ? (
        <span className="inline-flex items-center gap-1">
          <ResourceIcon res="gem" className="h-3.5 w-3.5" />
          {fmtNumber(gem)}
        </span>
      ) : null}
    </div>
  );
}
