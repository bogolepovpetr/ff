"use client";

import { useState } from "react";
import { Swords, Shield, Zap, Package } from "lucide-react";
import { ResourceIcon } from "@/components/wiki/resource-icon";
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

type Props = {
  troops: TroopData[];
  tierColors: { border: string; bg: string; text: string; badge: string };
  lang: string;
  raceLabels: Record<string, string>;
};

function fmtTime(seconds?: number): string {
  if (!seconds) return "\u2014";
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
  if (!v) return "\u2014";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString("en-US");
}

export default function TroopRacePanel({
  troops,
  tierColors: tc,
  lang,
  raceLabels,
}: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = troops[selectedIdx] ?? troops[0];

  const STAT_ICONS = [
    { key: "atk" as const, icon: Swords, label: lang === "ru" ? "Атака" : "Attack" },
    { key: "def" as const, icon: Shield, label: lang === "ru" ? "Защита" : "Defense" },
    { key: "speed" as const, icon: Zap, label: lang === "ru" ? "Скорость" : "Speed" },
    { key: "load" as const, icon: Package, label: lang === "ru" ? "Груз" : "Load" },
  ];

  const raceLabel = (race?: string) => raceLabels[race ?? ""] ?? race ?? "\u2014";

  return (
    <div>
      {/* Race selector tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 px-4 py-3">
        {troops.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setSelectedIdx(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              i === selectedIdx
                ? `${tc.bg} ${tc.text} ring-1 ${tc.border.replace("border-", "ring-")}`
                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {raceLabel(t.race)}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-0 md:flex-row">
        {/* Stats column */}
        <div className="flex flex-col justify-center gap-4 p-6 md:w-1/2">
          <p className="text-sm font-medium text-zinc-500">
            {selected.title}
            <span className="ml-2 text-xs capitalize text-zinc-400">
              ({raceLabel(selected.race)})
            </span>
          </p>

          {STAT_ICONS.map(({ key, icon: Icon, label }) => (
            <div key={key} className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tc.bg}`}>
                <Icon className={`h-5 w-5 ${tc.text}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-400">{label}</p>
                <p className="text-xl font-bold text-slate-900">
                  {selected[key] ?? "\u2014"}
                </p>
              </div>
            </div>
          ))}

          {/* Power + Time */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                {lang === "ru" ? "Мощь" : "Power"}
              </p>
              <p className="font-bold text-slate-800">{selected.power ?? "\u2014"}</p>
            </div>
            <div className="rounded-lg bg-zinc-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-zinc-400">
                {lang === "ru" ? "Время" : "Time"}
              </p>
              <p className="font-bold text-slate-800">{fmtTime(selected.time)}</p>
            </div>
          </div>

          {/* Cost */}
          <div className="flex flex-wrap gap-2 text-sm">
            {selected.priceFood ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-800">
                <ResourceIcon res="food" className="h-4 w-4" /> {fmtCost(selected.priceFood)}
              </span>
            ) : null}
            {selected.priceWood ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-green-800">
                <ResourceIcon res="wood" className="h-4 w-4" /> {fmtCost(selected.priceWood)}
              </span>
            ) : null}
            {selected.priceStone ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                <ResourceIcon res="stone" className="h-4 w-4" /> {fmtCost(selected.priceStone)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Character image area */}
        <div className="flex flex-col items-center justify-center border-t border-zinc-100 p-8 md:w-1/2 md:border-l md:border-t-0">
          {selected?.key ? (
            <img
              src={`/img/troops/${selected.key}.png`}
              alt={`${raceLabel(selected.race)} ${selected.title}`}
              className="h-56 w-56 shrink-0 rounded-2xl"
            />
          ) : null}
          <p className="mt-3 text-sm font-semibold capitalize text-zinc-600">
            {raceLabel(selected.race)} {selected.title}
          </p>
        </div>
      </div>
    </div>
  );
}
