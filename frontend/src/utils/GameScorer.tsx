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
