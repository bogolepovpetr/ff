"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { estimateBattle, type ArmyLine, type CombatResult } from "@/lib/combat-sim";

export type TroopOption = {
  key: string;
  label: string;
  atk: number;
  def: number;
};

type Props = {
  lang: string;
  troops: TroopOption[];
};

type RowState = { id: string; key: string; count: string };

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

function emptyRows(n: number): RowState[] {
  return Array.from({ length: n }, () => ({ id: uid(), key: "", count: "" }));
}

export default function BattleSimClient({ lang, troops }: Props) {
  const [atkRows, setAtkRows] = useState<RowState[]>(() => emptyRows(4));
  const [defRows, setDefRows] = useState<RowState[]>(() => emptyRows(4));
  const [atkBonus, setAtkBonus] = useState("0");
  const [defBonus, setDefBonus] = useState("0");
  const [result, setResult] = useState<CombatResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  const troopMap = useMemo(() => new Map(troops.map((t) => [t.key, t])), [troops]);
  const statsMap = useMemo(() => {
    const m = new Map<string, { key: string; atk: number; def: number }>();
    for (const t of troops) {
      m.set(t.key, { key: t.key, atk: t.atk, def: t.def });
    }
    return m;
  }, [troops]);

  function parseArmy(rows: RowState[]): ArmyLine[] {
    return rows
      .filter((r) => r.key && r.count)
      .map((r) => ({ key: r.key, count: Math.max(0, Math.floor(Number(r.count) || 0)) }))
      .filter((l) => l.count > 0);
  }

  function run() {
    const input = {
      attacker: parseArmy(atkRows),
      defender: parseArmy(defRows),
      troopStats: statsMap,
      atkBonusPct: Math.max(-90, Number(atkBonus) || 0),
      defBonusPct: Math.max(-90, Number(defBonus) || 0),
    };
    const res = estimateBattle(input);
    if (!res) {
      setCalcError(
        lang === "ru"
          ? "Нужны хотя бы одна полная строка нападения и одна обороны (юнит и количество > 0)."
          : "Need at least one valid attacker row and one defender row (unit and count > 0).",
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
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm text-amber-950">
        <p className="font-semibold">
          {lang === "ru" ? "Важно" : "Disclaimer"}
        </p>
        <p className="mt-1 text-amber-900/90">
          {lang === "ru"
            ? "Проценты потерь и округление совпадают с бэкендом: Combat::_calcBattleLosses и Combat::_decreaseTroopCount (победитель — ceil выживших, проигравший — floor). Здесь симулируется PVP: суммарная АТК нападающего и суммарная ЗАЩ защитника с бонусами %. Лагерь (camp) и прочие режимы в калькуляторе не моделируются."
            : "Loss percentages and per-stack rounding match the backend: Combat::_calcBattleLosses and Combat::_decreaseTroopCount (winner: ceil survivors, loser: floor). This simulates PVP totals (attacker ATK vs defender DEF with % bonuses). Camp and other contexts are not modeled here."}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">{lang === "ru" ? "Бонус АТК %" : "ATK bonus %"}</span>
          <input
            type="number"
            value={atkBonus}
            onChange={(e) => setAtkBonus(e.target.value)}
            className="w-20 rounded-md border border-zinc-200 px-2 py-1"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500">{lang === "ru" ? "Бонус ЗАЩ %" : "DEF bonus %"}</span>
          <input
            type="number"
            value={defBonus}
            onChange={(e) => setDefBonus(e.target.value)}
            className="w-20 rounded-md border border-zinc-200 px-2 py-1"
          />
        </label>
        <button
          type="button"
          onClick={run}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow hover:opacity-95"
        >
          <Calculator className="h-4 w-4" />
          {lang === "ru" ? "Считать" : "Calculate"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ArmyPanel
          title={lang === "ru" ? "Нападение" : "Attacker"}
          accent="border-red-200 bg-red-50/40"
          rows={atkRows}
          setRows={setAtkRows}
          troops={troops}
          lang={lang}
        />
        <ArmyPanel
          title={lang === "ru" ? "Защита" : "Defender"}
          accent="border-blue-200 bg-blue-50/40"
          rows={defRows}
          setRows={setDefRows}
          troops={troops}
          lang={lang}
        />
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
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ResultTable
              title={lang === "ru" ? "Нападение — потери" : "Attacker losses"}
              lines={result.attacker}
              labelForKey={labelForKey}
              lang={lang}
            />
            <ResultTable
              title={lang === "ru" ? "Защита — потери" : "Defender losses"}
              lines={result.defender}
              labelForKey={labelForKey}
              lang={lang}
            />
          </div>
        </div>
      )}

      {result === null && !calcError && (
        <p className="text-center text-sm text-zinc-500">
          {lang === "ru"
            ? "Заполните обе стороны и нажмите «Считать»."
            : "Fill both sides and tap Calculate."}
        </p>
      )}
    </div>
  );
}

function ArmyPanel({
  title,
  accent,
  rows,
  setRows,
  troops,
  lang,
}: {
  title: string;
  accent: string;
  rows: RowState[];
  setRows: Dispatch<SetStateAction<RowState[]>>;
  troops: TroopOption[];
  lang: string;
}) {
  return (
    <section className={`rounded-xl border-2 p-4 ${accent}`}>
      <h3 className="mb-3 text-lg font-bold text-slate-900">{title}</h3>
      <div className="space-y-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1">
              <label className="text-[10px] font-semibold uppercase text-zinc-500">
                {lang === "ru" ? "Юнит" : "Unit"}
              </label>
              <select
                value={row.key}
                onChange={(e) => {
                  const v = e.target.value;
                  setRows((r) => r.map((x, i) => (i === idx ? { ...x, key: v } : x)));
                }}
                className="mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
              >
                <option value="">{lang === "ru" ? "— выберите —" : "— select —"}</option>
                {troops.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="text-[10px] font-semibold uppercase text-zinc-500">
                {lang === "ru" ? "Кол-во" : "Count"}
              </label>
              <input
                type="number"
                min={0}
                value={row.count}
                onChange={(e) => {
                  const v = e.target.value;
                  setRows((r) => r.map((x, i) => (i === idx ? { ...x, count: v } : x)));
                }}
                className="mt-0.5 w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm tabular-nums"
              />
            </div>
            <button
              type="button"
              onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}
              className="rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 hover:text-red-600"
              aria-label={lang === "ru" ? "Удалить строку" : "Remove row"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { id: uid(), key: "", count: "" }])}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        <Plus className="h-3.5 w-3.5" />
        {lang === "ru" ? "Строка" : "Add row"}
      </button>
    </section>
  );
}

function ResultTable({
  title,
  lines,
  labelForKey,
  lang,
}: {
  title: string;
  lines: { key: string; start: number; lost: number; survived: number }[];
  labelForKey: (k: string) => string;
  lang: string;
}) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
