import type { Metadata } from "next";
import { getFilteredTroops } from "@/lib/data";
import { buildingName, troopTypeName, raceName } from "@/lib/format";
import { getLore } from "@/lib/lore";
import PatchBadge from "@/components/wiki/patch-badge";
import BattleSimClient from "@/components/wiki/battle-sim-client";
import { getGameVersion } from "@/lib/version";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (lang === "ru") {
    return {
      title: "Симулятор боя — FOMO Fighters Wiki",
      description:
        "Калькулятор потерь по формулам Combat::_calcBattleLosses и _decreaseTroopCount (PVP-суммы).",
    };
  }
  return {
    title: "Battle simulator — FOMO Fighters Wiki",
    description:
      "Troop loss calculator aligned with Combat::_calcBattleLosses and _decreaseTroopCount (PVP totals).",
  };
}

export default async function BattleSimPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lore = getLore("battleSim", lang);
  const ver = getGameVersion();
  const raw = getFilteredTroops();

  const troops = raw
    .map((t) => {
      const b = buildingName(t.building, lang);
      const name = troopTypeName(t.title, lang);
      const race = t.race ? raceName(t.race, lang) : "";
      return {
        key: t.key,
        label: `${name} · ${race} · ${b} T${t.tier ?? "?"}`,
        atk: t.atk ?? 0,
        def: t.def ?? 0,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, lang === "ru" ? "ru" : "en"));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-gradient-to-r from-red-50/80 to-blue-50/80 p-6">
        <h1 className="text-2xl font-bold text-slate-900">{lore.title}</h1>
        <p className="mt-1 text-sm font-medium text-zinc-600">{lore.subtitle}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-600">{lore.intro}</p>
      </div>

      <PatchBadge gameVersion={ver.gameVersion} dataUpdated={ver.dataUpdated} lang={lang} />

      <BattleSimClient lang={lang} troops={troops} />
    </div>
  );
}
