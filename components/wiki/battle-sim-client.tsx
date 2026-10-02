"use client";

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import {
  estimateBattle,
  type ArmyLine,
  type CombatResult,
  type CombatResultLine,
} from "@/lib/combat-sim";
import type { BattleSimRaceLayout } from "@/lib/battle-sim-layout";

export type TroopOption = {
  key: string;
  label: string;
  atk: number;
  def: number;
};

type Props = {
  lang: string;
  troops: TroopOption[];
  battleLayout: BattleSimRaceLayout[];
};

type SlotRow = { id: string; tier: number; count: string };

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function layoutForRace(layouts: BattleSimRaceLayout[], raceKey: string): BattleSimRaceLayout | undefined {
  return layouts.find((l) => l.raceKey === raceKey);
}

function initSlotState(layout: BattleSimRaceLayout | undefined): Record<string, SlotRow[]> {
  if (!layout) return {};
  const o: Record<string, SlotRow[]> = {};
  for (const b of layout.buildings) {
    const t0 = b.tiers[0]?.tier ?? 1;
    o[b.buildingKey] = [{ id: uid(), tier: t0, count: "" }];
  }
  return o;
}

function parseBonusPair(hero: string, academy: string): number {
  const x = (Number(hero) || 0) + (Number(academy) || 0);
  return Math.max(-90, x);
}

/** Empty / invalid → unlimited capacity */
function parseHospitalCapacity(s: string): number | undefined {
  const t = s.trim();
  if (t === "") return undefined;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.floor(n);
}

function mergeArmyLines(lines: ArmyLine[]): ArmyLine[] {
  const m = new Map<string, number>();
  for (const l of lines) {
    if (l.count <= 0) continue;
    m.set(l.key, (m.get(l.key) ?? 0) + l.count);
  }
  return [...m.entries()].map(([key, count]) => ({ key, count }));
}

function linesFromSlots(layout: BattleSimRaceLayout, slots: Record<string, SlotRow[]>): ArmyLine[] {
  const out: ArmyLine[] = [];
  for (const b of layout.buildings) {
    const rows = slots[b.buildingKey];
    if (!rows) continue;
    for (const row of rows) {
      const c = Math.max(0, Math.floor(Number(row.count) || 0));
      if (c <= 0) continue;
      const opt = b.tiers.find((t) => t.tier === row.tier);
      if (!opt) continue;
      out.push({ key: opt.key, count: c });
    }
  }
  return mergeArmyLines(out);
}

export default function BattleSimClient({ lang, troops, battleLayout }: Props) {
  const defaultRace = battleLayout[0]?.raceKey ?? "elf";

  const [atkRace, setAtkRace] = useState(defaultRace);
  const [defRace, setDefRace] = useState(defaultRace);
  const [atkSlots, setAtkSlots] = useState<Record<string, SlotRow[]>>(() =>
    initSlotState(layoutForRace(battleLayout, defaultRace)),
  );
  const [defSlots, setDefSlots] = useState<Record<string, SlotRow[]>>(() =>
    initSlotState(layoutForRace(battleLayout, defaultRace)),
  );

  const [atkHeroPct, setAtkHeroPct] = useState("0");
  const [atkAcademyPct, setAtkAcademyPct] = useState("0");
  const [defHeroPct, setDefHeroPct] = useState("0");
  const [defAcademyPct, setDefAcademyPct] = useState("0");
  const [hospitalAtkPct, setHospitalAtkPct] = useState("0");
  const [hospitalDefPct, setHospitalDefPct] = useState("0");
  const [hospitalCapAtk, setHospitalCapAtk] = useState("");
  const [hospitalCapDef, setHospitalCapDef] = useState("");
  const [result, setResult] = useState<CombatResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const atkLayout = useMemo(() => layoutForRace(battleLayout, atkRace), [battleLayout, atkRace]);
  const defLayout = useMemo(() => layoutForRace(battleLayout, defRace), [battleLayout, defRace]);

  const troopMap = useMemo(() => new Map(troops.map((t) => [t.key, t])), [troops]);
  const statsMap = useMemo(() => {
    const m = new Map<string, { key: string; atk: number; def: number }>();
    for (const t of troops) {
      m.set(t.key, { key: t.key, atk: t.atk, def: t.def });
    }
    return m;
  }, [troops]);

  const changeAtkRace = useCallback(
    (race: string) => {
      setAtkRace(race);
      setAtkSlots(initSlotState(layoutForRace(battleLayout, race)));
    },
    [battleLayout],
  );

  const changeDefRace = useCallback(
    (race: string) => {
      setDefRace(race);
      setDefSlots(initSlotState(layoutForRace(battleLayout, race)));
    },
    [battleLayout],
  );

  function run() {
    if (!atkLayout || !defLayout) {
      setCalcError(lang === "ru" ? "Нет данных по расе." : "No layout for selected race.");
      setResult(null);
      return;
    }
    const attacker = linesFromSlots(atkLayout, atkSlots);
    const defender = linesFromSlots(defLayout, defSlots);
    const input = {
      attacker,
      defender,
      troopStats: statsMap,
      atkBonusPct: parseBonusPair(atkHeroPct, atkAcademyPct),
      defBonusPct: parseBonusPair(defHeroPct, defAcademyPct),
      hospitalAtkPercent: Math.max(0, Math.min(100, Number(hospitalAtkPct) || 0)),
      hospitalDefPercent: Math.max(0, Math.min(100, Number(hospitalDefPct) || 0)),
      hospitalCapacityAtk: parseHospitalCapacity(hospitalCapAtk),
      hospitalCapacityDef: parseHospitalCapacity(hospitalCapDef),
    };
    const res = estimateBattle(input);
    if (!res) {
      setCalcError(
        lang === "ru"
          ? "Нужны хотя бы один юнит нападения и один обороны (количество > 0)."
          : "Need at least one attacker unit and one defender unit (count > 0).",
      );
      setResult(null);
      return;
    }
    setCalcError(null);
    setResult(res);
  }

  function labelForKey(key: string): string {
    return troopMap.get(key)?.label ?? key;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2">
        <div className="rounded-lg border border-red-200/80 bg-red-50/50 p-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-red-900/90">
            {lang === "ru" ? "Нападение — бонусы к АТК, %" : "Attacker — ATK bonuses, %"}
          </h3>
          <p className="mb-2 text-xs text-zinc-500">
            {lang === "ru" ? "Герои и технологии академии (войска уже в юнитах)." : "Heroes and academy tech (troop stats are in unit lines)."}
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Герои" : "Heroes"}</span>
              <input
                type="number"
                value={atkHeroPct}
                onChange={(e) => setAtkHeroPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Академия" : "Academy"}</span>
              <input
                type="number"
                value={atkAcademyPct}
                onChange={(e) => setAtkAcademyPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-blue-200/80 bg-blue-50/50 p-4">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-blue-900/90">
            {lang === "ru" ? "Защита — бонусы к ЗАЩ, %" : "Defender — DEF bonuses, %"}
          </h3>
          <p className="mb-2 text-xs text-zinc-500">
            {lang === "ru" ? "Герои и технологии академии." : "Heroes and academy tech."}
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Герои" : "Heroes"}</span>
              <input
                type="number"
                value={defHeroPct}
                onChange={(e) => setDefHeroPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Академия" : "Academy"}</span>
              <input
                type="number"
                value={defAcademyPct}
                onChange={(e) => setDefAcademyPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2">
        <div className="rounded-lg border border-violet-200/80 bg-violet-50/40 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-violet-900/90">
            {lang === "ru" ? "Госпиталь — нападение" : "Hospital — attacker"}
          </h3>
          <p className="mb-3 text-xs text-zinc-600">
            {lang === "ru"
              ? "UserProps::hospitalAtkPercent. Если армия погибла полностью — раненые сразу; иначе — при возврате марша. Пустая вместимость = без лимита."
              : "UserProps::hospitalAtkPercent. Wiped army → immediate; else → on return. Empty capacity = unlimited."}
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Раненые от потерь, %" : "Wounded from losses, %"}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hospitalAtkPct}
                onChange={(e) => setHospitalAtkPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Вместимость (мест)" : "Capacity (beds)"}</span>
              <input
                type="number"
                min={0}
                value={hospitalCapAtk}
                onChange={(e) => setHospitalCapAtk(e.target.value)}
                placeholder="∞"
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
          </div>
        </div>
        <div className="rounded-lg border border-violet-200/80 bg-violet-50/40 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-violet-900/90">
            {lang === "ru" ? "Госпиталь — защита" : "Hospital — defender"}
          </h3>
          <p className="mb-3 text-xs text-zinc-600">
            {lang === "ru"
              ? "UserProps::hospitalDefPercent. Раненые сразу после боя (как _processDefenderHospital)."
              : "UserProps::hospitalDefPercent. Immediate after battle."}
          </p>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Раненые от потерь, %" : "Wounded from losses, %"}</span>
              <input
                type="number"
                min={0}
                max={100}
                value={hospitalDefPct}
                onChange={(e) => setHospitalDefPct(e.target.value)}
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-600">{lang === "ru" ? "Вместимость (мест)" : "Capacity (beds)"}</span>
              <input
                type="number"
                min={0}
                value={hospitalCapDef}
                onChange={(e) => setHospitalCapDef(e.target.value)}
                placeholder="∞"
                className="w-24 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-right tabular-nums"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {atkLayout && (
          <RaceArmyPanel
            title={lang === "ru" ? "Нападение" : "Attacker"}
            accent="border-red-200 bg-red-50/40"
            lang={lang}
            layout={atkLayout}
            raceOptions={battleLayout}
            raceKey={atkRace}
            onRaceChange={changeAtkRace}
            slots={atkSlots}
            setSlots={setAtkSlots}
          />
        )}
        {defLayout && (
          <RaceArmyPanel
            title={lang === "ru" ? "Защита" : "Defender"}
            accent="border-blue-200 bg-blue-50/40"
            lang={lang}
            layout={defLayout}
            raceOptions={battleLayout}
            raceKey={defRace}
            onRaceChange={changeDefRace}
            slots={defSlots}
            setSlots={setDefSlots}
          />
        )}
      </div>

      {calcError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">{calcError}</p>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
            <p className="grid gap-1 text-zinc-700 sm:grid-cols-2">
              <span>
                {lang === "ru" ? "Суммарная АТК (с бонусом)" : "Total ATK (w/ bonus)"}:{" "}
                <strong className="tabular-nums text-slate-900">{result.attackerTotalAtk.toFixed(0)}</strong>
              </span>
              <span>
                {lang === "ru" ? "Суммарная ЗАЩ (с бонусом)" : "Total DEF (w/ bonus)"}:{" "}
                <strong className="tabular-nums text-slate-900">{result.defenderTotalDef.toFixed(0)}</strong>
              </span>
              <span>
                {lang === "ru" ? "Потери атакующего (все стеки)" : "Attacker losses (all stacks)"}:{" "}
                <strong>{result.attackerLossesPercent.toFixed(2)}%</strong>
              </span>
              <span>
                {lang === "ru" ? "Потери защитника (все стеки)" : "Defender losses (all stacks)"}:{" "}
                <strong>{result.defenderLossesPercent.toFixed(2)}%</strong>
              </span>
              <span className="sm:col-span-2">
                {lang === "ru" ? "Исход (по сумме АТК vs ЗАЩ)" : "Outcome (total ATK vs DEF)"}:{" "}
                <strong>
                  {result.attackerWon
                    ? lang === "ru"
                      ? "Победа нападения"
                      : "Attacker wins"
                    : lang === "ru"
                      ? "Победа защиты"
                      : "Defender wins"}
                </strong>
                {lang === "ru"
                  ? " — у выживших в стеке: победитель ceil, проигравший floor."
                  : " — per stack: winner uses ceil(survivors), loser uses floor."}
              </span>
              <span className="sm:col-span-2 text-violet-900/90">
                {lang === "ru" ? "Госпиталь (PvP)" : "Hospital (PvP)"}:{" "}
                {result.attackerArmyWiped
                  ? lang === "ru"
                    ? "армия нападения уничтожена — раненые принимаются сразу после боя."
                    : "attacker army wiped — wounded admitted right after battle."
                  : lang === "ru"
                    ? "у нападения есть выжившие — раненые от потерь идут в госпиталь при возврате марша."
                    : "attacker has survivors — wounded from losses go to hospital on march return."}{" "}
                {result.hospitalAttackerOverflow > 0 &&
                  (lang === "ru"
                    ? ` Нападение: не вместилось ${result.hospitalAttackerOverflow}.`
                    : ` Attacker overflow: ${result.hospitalAttackerOverflow}.`)}
                {result.hospitalDefenderOverflow > 0 &&
                  (lang === "ru"
                    ? ` Защита: не вместилось ${result.hospitalDefenderOverflow}.`
                    : ` Defender overflow: ${result.hospitalDefenderOverflow}.`)}
              </span>
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ResultTable
              title={lang === "ru" ? "Нападение — потери" : "Attacker losses"}
              side="attacker"
              lines={result.attacker}
              labelForKey={labelForKey}
              lang={lang}
            />
            <ResultTable
              title={lang === "ru" ? "Защита — потери" : "Defender losses"}
              side="defender"
              lines={result.defender}
              labelForKey={labelForKey}
              lang={lang}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 pt-2">
        {result === null && !calcError && (
          <p className="text-center text-sm text-zinc-500">
            {lang === "ru"
              ? "Укажите количества юнитов и нажмите «Считать»."
              : "Enter unit counts and tap Calculate."}
          </p>
        )}
        <button
          type="button"
          onClick={run}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
        >
          <Calculator className="h-5 w-5" />
          {lang === "ru" ? "Считать" : "Calculate"}
        </button>
      </div>
    </div>
  );
}

function RaceArmyPanel({
  title,
  accent,
  lang,
  layout,
  raceOptions,
  raceKey,
  onRaceChange,
  slots,
  setSlots,
}: {
  title: string;
  accent: string;
  lang: string;
  layout: BattleSimRaceLayout;
  raceOptions: BattleSimRaceLayout[];
  raceKey: string;
  onRaceChange: (race: string) => void;
  slots: Record<string, SlotRow[]>;
  setSlots: Dispatch<SetStateAction<Record<string, SlotRow[]>>>;
}) {
  function updateRow(buildingKey: string, rowId: string, patch: Partial<SlotRow>) {
    setSlots((prev) => {
      const rows = prev[buildingKey];
      if (!rows) return prev;
      return {
        ...prev,
        [buildingKey]: rows.map((r) => (r.id === rowId ? { ...r, ...patch } : r)),
      };
    });
  }

  function addRow(buildingKey: string, defaultTier: number) {
    setSlots((prev) => ({
      ...prev,
      [buildingKey]: [...(prev[buildingKey] ?? []), { id: uid(), tier: defaultTier, count: "" }],
    }));
  }

  function removeRow(buildingKey: string, rowId: string) {
    setSlots((prev) => {
      const rows = prev[buildingKey];
      if (!rows || rows.length <= 1) return prev;
      return { ...prev, [buildingKey]: rows.filter((r) => r.id !== rowId) };
    });
  }

  function tierLabel(building: (typeof layout.buildings)[0], tier: number): string {
    return building.tiers.find((t) => t.tier === tier)?.label ?? `T${tier}`;
  }

  return (
    <section className={`rounded-xl border-2 p-4 ${accent}`}>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-semibold uppercase text-zinc-500">
          {lang === "ru" ? "Раса" : "Race"}
        </span>
        <select
          value={raceKey}
          onChange={(e) => onRaceChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold"
        >
          {raceOptions.map((r) => (
            <option key={r.raceKey} value={r.raceKey}>
              {r.raceLabel}
            </option>
          ))}
        </select>
      </label>

      <h3 className="mb-3 text-lg font-bold text-slate-900">{title}</h3>

      <div className="space-y-5">
        {layout.buildings.map((b) => {
          const rows = slots[b.buildingKey] ?? [];
          const defaultTier = b.tiers[0]?.tier ?? 1;
          return (
            <div key={b.buildingKey} className="rounded-lg border border-zinc-200/80 bg-white/60 p-3">
              <div className="mb-2 text-sm font-bold text-slate-800">{b.buildingLabel}</div>
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-end gap-2">
                    <div className="w-20 shrink-0">
                      <label className="text-[10px] font-semibold uppercase text-zinc-500">
                        {lang === "ru" ? "Тир" : "Tier"}
                      </label>
                      <select
                        value={row.tier}
                        onChange={(e) =>
                          updateRow(b.buildingKey, row.id, { tier: Number(e.target.value) })
                        }
                        className="mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                      >
                        {b.tiers.map((t) => (
                          <option key={t.tier} value={t.tier}>
                            {t.tier}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="text-[10px] font-semibold uppercase text-zinc-500">
                        {lang === "ru" ? "Юнит" : "Unit"}
                      </label>
                      <div className="mt-0.5 truncate rounded-lg border border-zinc-100 bg-zinc-50 px-2 py-1.5 text-sm text-zinc-800">
                        {tierLabel(b, row.tier)}
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <label className="text-[10px] font-semibold uppercase text-zinc-500">
                        {lang === "ru" ? "Кол-во" : "Count"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={row.count}
                        onChange={(e) => updateRow(b.buildingKey, row.id, { count: e.target.value })}
                        className="mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={rows.length <= 1}
                      onClick={() => removeRow(b.buildingKey, row.id)}
                      className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={lang === "ru" ? "Удалить строку" : "Remove row"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => addRow(b.buildingKey, defaultTier)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Plus className="h-3.5 w-3.5" />
                {lang === "ru" ? "Строка (другой тир)" : "Add row (other tier)"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ResultTable({
  title,
  side,
  lines,
  labelForKey,
  lang,
}: {
  title: string;
  side: "attacker" | "defender";
  lines: CombatResultLine[];
  labelForKey: (k: string) => string;
  lang: string;
}) {
  const nowLabel = lang === "ru" ? "Сейчас" : "Now";
  const retLabel = lang === "ru" ? "По возврату" : "On return";

  return (
    <div className="overflow-auto rounded-xl border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-4 py-2 font-bold text-slate-800">{title}</div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
            <th className="px-3 py-2">{lang === "ru" ? "Юнит" : "Unit"}</th>
            <th className="px-3 py-2 text-right">{lang === "ru" ? "Было" : "Start"}</th>
            <th className="px-3 py-2 text-right text-red-700">{lang === "ru" ? "Потери" : "Lost"}</th>
            <th className="px-3 py-2 text-right text-emerald-700">{lang === "ru" ? "Выжило" : "Survived"}</th>
            <th className="px-3 py-2 text-right text-violet-800">{lang === "ru" ? "Госп. сейчас" : "Hosp. now"}</th>
            {side === "attacker" && (
              <th className="px-3 py-2 text-right text-violet-700">{lang === "ru" ? "Госп. возврат" : "Hosp. return"}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {lines.map((l, rowIdx) => (
            <tr key={`${l.key}-${rowIdx}`} className="border-b border-zinc-50">
              <td className="max-w-[200px] truncate px-3 py-1.5 text-xs font-medium" title={labelForKey(l.key)}>
                {labelForKey(l.key)}
              </td>
              <td className="px-3 py-1.5 text-right tabular-nums">{l.start}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-red-700">{l.lost}</td>
              <td className="px-3 py-1.5 text-right tabular-nums text-emerald-700">{l.survived}</td>
              <td
                className="px-3 py-1.5 text-right tabular-nums text-violet-900"
                title={side === "defender" ? nowLabel : undefined}
              >
                {l.hospitalImmediate > 0 ? l.hospitalImmediate : "—"}
              </td>
              {side === "attacker" && (
                <td className="px-3 py-1.5 text-right tabular-nums text-violet-800" title={retLabel}>
                  {l.hospitalOnReturn > 0 ? l.hospitalOnReturn : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
