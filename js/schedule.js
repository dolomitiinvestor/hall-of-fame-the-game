// Round-robin schedule generator (circle method). Separated from
// season.js so the pairing algorithm can be swapped later (divisions,
// playoffs bracket, etc.) without touching scoring/standings logic.

export function generateSchedule(teamIds, weeks = 16) {
  const ids = [...teamIds];
  const hasBye = ids.length % 2 !== 0;
  if (hasBye) ids.push(null);
  const n = ids.length;
  if (n < 2) return Array.from({ length: weeks }, () => []);

  const rounds = [];
  const arr = [...ids];
  for (let r = 0; r < n - 1; r++) {
    const roundPairs = [];
    for (let i = 0; i < n / 2; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== null && b !== null) roundPairs.push([a, b]);
    }
    rounds.push(roundPairs);
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr.splice(0, arr.length, fixed, ...rest);
  }

  const schedule = [];
  for (let w = 0; w < weeks; w++) {
    schedule.push(rounds[w % rounds.length]);
  }
  return schedule;
}
