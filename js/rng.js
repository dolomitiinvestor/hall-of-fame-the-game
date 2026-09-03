// Deterministic seeded pseudo-random helpers. The same seed string
// always produces the same result, so per-player-per-week values
// (injury status, weekly score variance) stay stable across
// re-renders and page reloads without needing to persist them
// anywhere -- they're just recomputed from (playerId, week) on demand.

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Returns a value in [0, 1).
export function seededRandom(seed) {
  let x = hashSeed(String(seed));
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  x >>>= 0;
  return (x >>> 0) / 4294967296;
}

// Approximately standard-normal (mean 0, stddev 1) via Box-Muller,
// seeded from two independent draws off the same seed.
export function seededNormal(seed) {
  const u1 = Math.max(seededRandom(`${seed}:u1`), 1e-9);
  const u2 = seededRandom(`${seed}:u2`);
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Picks a key from `weights` (array of [key, weight] pairs, weights
// summing to ~1) using a [0,1) draw.
export function pickWeighted(r, weights) {
  let acc = 0;
  for (const [key, weight] of weights) {
    acc += weight;
    if (r < acc) return key;
  }
  return weights[weights.length - 1][0];
}

// Deterministic Fisher-Yates: the same seed always produces the same
// permutation of `array`. For a "random" order that needs to survive
// re-renders without being persisted anywhere (see
// previewSeasonSelection() in season.js) -- draft order and other
// one-time, persisted-immediately rolls should keep using Math.random
// via shuffle() (draftEngine.js) instead.
export function seededShuffle(array, seed) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(`${seed}:${i}`) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
