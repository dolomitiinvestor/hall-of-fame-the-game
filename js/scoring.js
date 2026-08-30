// Fantasy scoring engine.
//
// Kept isolated from everything else: draft.js and season.js only ever
// call calculateFantasyPoints() / getSeasonSummary(). Swap the rules,
// add stat categories, or replace this whole module later without
// touching the rest of the app.

export const DEFAULT_SCORING_RULES = {
  passYdsPerPoint: 25,
  passTD: 4,
  passInt: -2,
  rushYdsPerPoint: 10,
  rushTD: 6,
  recYdsPerPoint: 10,
  recTD: 6,
  reception: 0.5, // half-PPR
  fumbleLost: -2,
};

export function round2(n) {
  return Math.round(n * 100) / 100;
}

export function calculateFantasyPoints(stats, rules = DEFAULT_SCORING_RULES) {
  const s = stats || {};
  let pts = 0;
  pts += (s.passYds || 0) / rules.passYdsPerPoint;
  pts += (s.passTD || 0) * rules.passTD;
  pts += (s.passInt || 0) * rules.passInt;
  pts += (s.rushYds || 0) / rules.rushYdsPerPoint;
  pts += (s.rushTD || 0) * rules.rushTD;
  pts += (s.recYds || 0) / rules.recYdsPerPoint;
  pts += (s.recTD || 0) * rules.recTD;
  pts += (s.rec || 0) * rules.reception;
  pts += (s.fumblesLost || 0) * rules.fumbleLost;
  return round2(pts);
}

// A "season summary" bundles the total points for the year alongside
// the per-game rate. The per-game rate is what a shortened season
// (strike year, wartime schedule, < 16 games) gets "repeated" at for
// every week of a simulated 16-week fantasy season -- see season.js.
export function getSeasonSummary(season, rules = DEFAULT_SCORING_RULES) {
  const totalPoints = calculateFantasyPoints(season.stats, rules);
  const games = season.games || 1;
  const pointsPerGame = round2(totalPoints / games);
  return { totalPoints, pointsPerGame, games };
}
