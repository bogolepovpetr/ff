"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RaceSelector from "@/components/wiki/race-selector";
import { ResourceIcon } from "@/components/wiki/resource-icon";

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

type TroopGroupData = {
  building: string;
  tier: number;
  title: string;
  troops: TroopData[];
};

type RaceData = {
  key: string;
  title: string;
  desc?: string;
};

type Props = {
  lang: string;
  buildingOrder: string[];
  groupsByBuilding: Record<string, TroopGroupData[]>;
  buildingLabels: Record<string, string>;
  tierLabels: Record<number, { border: string; bg: string; text: string; badge: string }>;
  troopTypeLabels: Record<string, string>;
  races: RaceData[];
};

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

export default function TroopsPageClient({
  lang,
  buildingOrder,
  groupsByBuilding,
  buildingLabels,
  tierLabels,
  troopTypeLabels,
  races,
}: Props) {
  const searchParams = useSearchParams();
  const [race, setRace] = useState(() => {
    const fromUrl = searchParams.get("race");
    return fromUrl && ["cat", "dog", "frog"].includes(fromUrl) ? fromUrl : "cat";
  });

  function troopForRace(troops: TroopData[]): TroopData | undefined {
    return troops.find((t) => t.race === race) ?? troops[0];
  }

  return (
    <div className="space-y-8">
      <RaceSelector lang={lang} races={races} selectedRace={race} onSelect={setRace} />

      {buildingOrder.map((buildingKey) => {
        const tiers = groupsByBuilding[buildingKey];
        if (!tiers) return null;
        return (
          <section key={buildingKey}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-800">
              <span className="h-1.5 w-5 rounded-full bg-red-400" />
              {buildingLabels[buildingKey] ?? buildingKey}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {tiers.map((group) => {
                const tc = tierLabels[group.tier] ?? tierLabels[1];
                const sample = troopForRace(group.troops);
                const typeName = troopTypeLabels[group.title] ?? group.title;

                return (
                  <Link
                    key={`${buildingKey}-${group.tier}`}
                    href={`/${lang}/troops/${buildingKey}/${group.tier}?race=${race}`}
                    className={`group relative flex flex-col rounded-xl border-2 ${tc.border} ${tc.bg} p-4 transition-all hover:shadow-lg hover:-translate-y-0.5`}
                  >
                    <span
                      className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${tc.badge}`}
                    >
                      {lang === "ru" ? "Тир" : "Tier"} {group.tier}
                    </span>

                    <div className="flex items-start gap-3">
                      {sample?.key ? (
                        <img
                          src={`/img/troops/${sample.key}.png`}
                          alt={typeName}
                          className="h-14 w-14 shrink-0 rounded-lg object-contain"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-bold ${tc.text}`}>
                          {typeName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-1 text-[11px]">
                      <Stat label="ATK" value={String(sample?.atk ?? "—")} />
                      <Stat label="DEF" value={String(sample?.def ?? "—")} />
                      <Stat
                        label={lang === "ru" ? "Время" : "Time"}
                        value={formatTime(sample?.time)}
                      />
                      <Stat
                        label={lang === "ru" ? "Мощь" : "Power"}
                        value={String(sample?.power ?? "—")}
                      />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
                      {sample?.priceFood ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="food" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceFood)}
                        </span>
                      ) : null}
                      {sample?.priceWood ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="wood" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceWood)}
                        </span>
                      ) : null}
                      {sample?.priceStone ? (
                        <span className="inline-flex items-center gap-0.5">
                          <ResourceIcon res="stone" className="inline-block h-4 w-4" />
                          {formatCost(sample.priceStone)}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between rounded bg-white/60 px-1.5 py-0.5">
      <span className="text-zinc-400">{label}</span>
      <span className="font-semibold text-zinc-700">{value}</span>
    </div>
  );
}
