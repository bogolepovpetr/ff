/**
 * PVP loss percents from backend Combat::_calcBattleLosses (ATK/DEF totals with bonuses).
 * Per-stack rounding from Combat::_decreaseTroopCount: winner ceil(survivors), loser floor(survivors).
 *
 * Hospital (UserHospital::calcWounded / storeWounded): floor(lost * percent / 100), percent in 0..100.
 * Attacker wiped → wounded go to hospital immediately; else → same formula, shown as “on return”.
 * Defender → immediate after battle. Capacity trims excess by stack order (first stacks fill first).
 */

export type TroopCombatStat = {
  key: string;
  atk: number;
  def: number;
};

export type ArmyLine = { key: string; count: number };

export type CombatInput = {
  attacker: ArmyLine[];
  defender: ArmyLine[];
  troopStats: Map<string, TroopCombatStat>;
  atkBonusPct: number;
  defBonusPct: number;
  /** UserProps::hospitalAtkPercent — 0..100 */
  hospitalAtkPercent?: number;
  /** UserProps::hospitalDefPercent — 0..100 */
  hospitalDefPercent?: number;
  /** Max wounded that fit attacker hospital (omit / NaN = unlimited) */
  hospitalCapacityAtk?: number;
  /** Max wounded that fit defender hospital */
  hospitalCapacityDef?: number;
};

export type CombatResultLine = {
  key: string;
  start: number;
  lost: number;
  survived: number;
  /** To hospital right after battle (defender; attacker if army wiped) */
  hospitalImmediate: number;
  /** Attacker only when some troops survive — applied on march return */
  hospitalOnReturn: number;
};

export type CombatResult = {
  attackerTotalAtk: number;
  defenderTotalDef: number;
  attackerLossesPercent: number;
  defenderLossesPercent: number;
  attackerWon: boolean;
  /** Sum of attacker.survived === 0 */
  attackerArmyWiped: boolean;
  /** Sum(raw wounded) − sum(admitted) for defender */
  hospitalDefenderOverflow: number;
  /** Same for attacker path (immediate or on-return batch) */
  hospitalAttackerOverflow: number;
  attacker: CombatResultLine[];
  defender: CombatResultLine[];
};

function lineValid(line: ArmyLine): boolean {
  return Boolean(line.key && line.count > 0 && Number.isFinite(line.count));
}

/** Mirrors Combat::_calcBattleLosses — percents in [0, 100]. */
export function calcBattleLossesPercent(ATK: number, DEF: number): {
  attackerLosses: number;
  defenderLosses: number;
} {
  if (ATK <= 0 && DEF <= 0) {
    return { attackerLosses: 0, defenderLosses: 0 };
  }

  if (ATK <= 0) {
    return { attackerLosses: 100, defenderLosses: 0 };
  }

  if (ATK <= DEF) {
    let attackerLosses: number;
    let defenderLosses: number;

    if (DEF >= ATK * 50) {
      attackerLosses = 100;
      defenderLosses = 0;
    } else {
      attackerLosses = 85 - 35 * (ATK / DEF);

      if (DEF >= ATK * 14) {
        defenderLosses = 0;
      } else {
        const x = ATK / DEF;
        defenderLosses = Math.max(0, -12 * x * x + 72.33 * x - 5) * 0.6;
      }

      const maxDefenderLossesPercent =
        ((ATK * attackerLosses) / 100) * 0.85 / DEF * 100;
      defenderLosses = Math.min(defenderLosses, maxDefenderLossesPercent);
    }

    return {
      attackerLosses: clampPercent(attackerLosses),
      defenderLosses: clampPercent(defenderLosses),
    };
  }

  const defenderLosses = 50 - 13 * (DEF / ATK);
  let attackerLosses: number;

  if (ATK >= DEF * 75) {
    attackerLosses = 0;
  } else {
    attackerLosses = (DEF / ATK) * 100 * 0.5;
  }

  const maxAttackerLossesPercent =
    ((DEF * defenderLosses) / 100) * 0.85 / ATK * 100;
  attackerLosses = Math.min(attackerLosses, maxAttackerLossesPercent);

  return {
    attackerLosses: clampPercent(attackerLosses),
    defenderLosses: clampPercent(defenderLosses),
  };
}

function clampPercent(p: number): number {
  if (!Number.isFinite(p)) return 0;
  return Math.max(0, Math.min(100, p));
}

/** UserHospital::calcWounded — percent clamped 0..100 */
export function calcWounded(lost: number, percent: number): number {
  if (lost <= 0) return 0;
  const p = clampPercent(percent);
  return Math.floor((lost * p) / 100);
}

/**
 * storeWoundedDirect-style cap: admit wounded in stack order until capacity runs out.
 */
function admitWoundedByCapacity(raw: number[], capacity: number | undefined): {
  admitted: number[];
  overflow: number;
} {
  if (capacity === undefined || !Number.isFinite(capacity) || capacity < 0) {
    return { admitted: raw.slice(), overflow: 0 };
  }
  let left = Math.floor(capacity);
  const admitted = raw.map((w) => {
    const take = Math.min(Math.max(0, w), left);
    left -= take;
    return take;
  });
  const rawSum = raw.reduce((a, b) => a + b, 0);
  const admSum = admitted.reduce((a, b) => a + b, 0);
  return { admitted, overflow: Math.max(0, rawSum - admSum) };
}

/** Per stack: lost = count * p/100; survivors = ceil(after) if won else floor(after). */
function applyStackLoss(
  count: number,
  lossPercent: number,
  sideWon: boolean,
): { lost: number; survived: number } {
  if (count <= 0) return { lost: 0, survived: 0 };
  const rawAfter = count * (1 - lossPercent / 100);
  const survived = sideWon
    ? Math.min(count, Math.max(0, Math.ceil(rawAfter - 1e-9)))
    : Math.min(count, Math.max(0, Math.floor(rawAfter + 1e-9)));
  const lost = count - survived;
  return { lost, survived };
}

export function estimateBattle(input: CombatInput): CombatResult | null {
  const atkLines = input.attacker.filter(lineValid);
  const defLines = input.defender.filter(lineValid);
  if (atkLines.length === 0 || defLines.length === 0) return null;

  let Ta = 0;
  for (const l of atkLines) {
    const s = input.troopStats.get(l.key);
    if (!s) continue;
    Ta += l.count * Math.max(0, s.atk);
  }
  let Td = 0;
  for (const l of defLines) {
    const s = input.troopStats.get(l.key);
    if (!s) continue;
    Td += l.count * Math.max(0, s.def);
  }

  Ta *= 1 + input.atkBonusPct / 100;
  Td *= 1 + input.defBonusPct / 100;

  if (Ta <= 0 && Td <= 0) return null;

  const { attackerLosses, defenderLosses } = calcBattleLossesPercent(Ta, Td);
  const attackerWon = Ta > Td;

  const attacker = atkLines.map((l) => {
    const { lost, survived } = applyStackLoss(
      l.count,
      attackerLosses,
      attackerWon,
    );
    return { key: l.key, start: l.count, lost, survived };
  });

  const defender = defLines.map((l) => {
    const { lost, survived } = applyStackLoss(
      l.count,
      defenderLosses,
      !attackerWon,
    );
    return { key: l.key, start: l.count, lost, survived };
  });

  const atkPct = input.hospitalAtkPercent ?? 0;
  const defPct = input.hospitalDefPercent ?? 0;
  const attackerTotalSurvived = attacker.reduce((s, l) => s + l.survived, 0);
  const attackerArmyWiped = attackerTotalSurvived <= 0;

  const defWoundedRaw = defender.map((l) => calcWounded(l.lost, defPct));
  const { admitted: defAdmitted, overflow: hospitalDefenderOverflow } = admitWoundedByCapacity(
    defWoundedRaw,
    input.hospitalCapacityDef,
  );

  let atkImmediate: number[];
  let atkReturn: number[];
  let hospitalAttackerOverflow: number;

  if (attackerArmyWiped) {
    const raw = attacker.map((l) => calcWounded(l.lost, atkPct));
    const { admitted, overflow } = admitWoundedByCapacity(raw, input.hospitalCapacityAtk);
    atkImmediate = admitted;
    atkReturn = attacker.map(() => 0);
    hospitalAttackerOverflow = overflow;
  } else {
    const raw = attacker.map((l) => calcWounded(l.lost, atkPct));
    const { admitted, overflow } = admitWoundedByCapacity(raw, input.hospitalCapacityAtk);
    atkImmediate = attacker.map(() => 0);
    atkReturn = admitted;
    hospitalAttackerOverflow = overflow;
  }

  const attackerOut = attacker.map((l, i) => ({
    ...l,
    hospitalImmediate: atkImmediate[i] ?? 0,
    hospitalOnReturn: atkReturn[i] ?? 0,
  }));

  const defenderOut = defender.map((l, i) => ({
    ...l,
    hospitalImmediate: defAdmitted[i] ?? 0,
    hospitalOnReturn: 0,
  }));

  return {
    attackerTotalAtk: Ta,
    defenderTotalDef: Td,
    attackerLossesPercent: attackerLosses,
    defenderLossesPercent: defenderLosses,
    attackerWon,
    attackerArmyWiped,
    hospitalDefenderOverflow,
    hospitalAttackerOverflow,
    attacker: attackerOut,
    defender: defenderOut,
  };
}
