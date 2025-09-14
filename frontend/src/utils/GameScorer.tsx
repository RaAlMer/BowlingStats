export function calculateScore(rolls: number[]): number {
  let score = 0;
  let rollIndex = 0;

  for (let frame = 0; frame < 10; frame++) {
    if (rolls[rollIndex] === 10) {
      // strike
      score += 10 + (rolls[rollIndex + 1] ?? 0) + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 1;
    } else if ((rolls[rollIndex] ?? 0) + (rolls[rollIndex + 1] ?? 0) === 10) {
      // spare
      score += 10 + (rolls[rollIndex + 2] ?? 0);
      rollIndex += 2;
    } else {
      // normal
      score += (rolls[rollIndex] ?? 0) + (rolls[rollIndex + 1] ?? 0);
      rollIndex += 2;
    }
  }

  return score;
}

export function calculateFrameTotals(rolls: number[]): number[] {
  const totals: number[] = [];
  let score = 0;
  let rollIndex = 0;

  for (let frame = 0; frame < 10; frame++) {
    if (rolls[rollIndex] === 10) {
      score += 10 + (rolls[rollIndex + 1] ?? 0) + (rolls[rollIndex + 2] ?? 0);
      totals.push(score);
      rollIndex += 1;
    } else if ((rolls[rollIndex] ?? 0) + (rolls[rollIndex + 1] ?? 0) === 10) {
      score += 10 + (rolls[rollIndex + 2] ?? 0);
      totals.push(score);
      rollIndex += 2;
    } else {
      score += (rolls[rollIndex] ?? 0) + (rolls[rollIndex + 1] ?? 0);
      totals.push(score);
      rollIndex += 2;
    }
  }

  return totals;
}

export function formatRoll(roll: number, frame: number[], idx: number): string {
  // Strike: any roll of 10 is X
  if (roll === 10) return "X";
  // Spare: only for 2nd or 3rd roll when sum of previous roll(s) < 10
  if (idx > 0 && frame[idx - 1] + roll === 10) return "/";
  // Miss
  if (roll === 0) return "-";
  // Otherwise, number
  return roll.toString();
}
