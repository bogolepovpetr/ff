/**
 * PVP loss percents from backend Combat::_calcBattleLosses (ATK/DEF totals with bonuses).
 * Per-stack rounding from Combat::_decreaseTroopCount: winner ceil(survivors), loser floor(survivors).
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
};

export type CombatResultLine = {
  key: string;
  start: number;
  lost: number;
  survived: number;
};

export type CombatResult = {
  attackerTotalAtk: number;
  defenderTotalDef: number;
  attackerLossesPercent: number;
  defenderLossesPercent: number;
  attackerWon: boolean;
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

  let defenderLosses = 50 - 13 * (DEF / ATK);
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

  return {
    attackerTotalAtk: Ta,
    defenderTotalDef: Td,
    attackerLossesPercent: attackerLosses,
    defenderLossesPercent: defenderLosses,
    attackerWon,
    attacker,
    defender,
  };
}
