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
  reception: 0.5, // PPR value: 0, 0.5, or 1 -- see buildScoringRules()
  fumbleLost: -2,
  tePremiumPerReception: 0, // extra points per TE reception, on top of `reception`

  // Kicker (position "K")
  fgMade: 3, // flat per field goal made, no distance tiers in v1
  xpMade: 1,

  // Team defense (position "DEF")
  sack: 1,
  defInt: 2,
  fumRec: 2,
  defTD: 6,
  safety: 2,
  // Points-allowed bonus/penalty is tiered per game, not linear -- see
  // pointsAllowedBonus() below. Not exposed as a single "rule" number.

  // Coach (position "COACH") has no individual scoring rule -- every
  // coach's stats are {} (see js/data/coaches.js), which already scores
  // 0 through the formula below with no special-casing needed. Instead
  // a coach contributes a flat bonus to their *team's* week total when
  // started in the COACH slot: see coachBonusRate and its use in
  // computeTeamWeekScore() in season.js (a team-level effect, not a
  // per-player stat, so it can't live in calculateFantasyPoints below).
  coachBonusRate: 0.05,
};

// League-configurable knobs from the Setup screen, turned into a full
// scoring-rules object. Keeping this separate from DEFAULT_SCORING_RULES
// means the base rule set (yards-per-point, TD values, etc.) stays in
// one place while only the bits users actually toggle vary per league.
export function buildScoringRules({ pprValue = 0.5, tePremium = 0 } = {}) {
  return {
    ...DEFAULT_SCORING_RULES,
    reception: pprValue,
    tePremiumPerReception: tePremium,
  };
}

export function round2(n) {
  return Math.round(n * 100) / 100;
}

// Standard tiered fantasy defense scoring: bonus/penalty based on
// average points allowed *per game*. Because our data model only
// stores a season total (stats.ptsAllowed), calculateFantasyPoints
// divides by `games` to get the per-game average before applying the
// tier -- see the `games` param below.
function pointsAllowedBonus(avgPerGame) {
  if (avgPerGame <= 0) return 10;
  if (avgPerGame <= 6) return 7;
  if (avgPerGame <= 13) return 4;
  if (avgPerGame <= 20) return 1;
  if (avgPerGame <= 27) return 0;
  if (avgPerGame <= 34) return -1;
  return -4;
}

// `position` is optional -- only needed for position-conditional rules
// like TE premium and the defense points-allowed tier. `games` is only
// needed for the latter (see pointsAllowedBonus above); it defaults to
// 1 so passing it is optional for every other position.
export function calculateFantasyPoints(stats, rules = DEFAULT_SCORING_RULES, position = null, games = 1) {
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
  if (position === "TE") {
    pts += (s.rec || 0) * (rules.tePremiumPerReception || 0);
  }

  pts += (s.fgMade || 0) * rules.fgMade;
  pts += (s.xpMade || 0) * rules.xpMade;

  pts += (s.sacks || 0) * rules.sack;
  pts += (s.defInt || 0) * rules.defInt;
  pts += (s.fumRec || 0) * rules.fumRec;
  pts += (s.defTD || 0) * rules.defTD;
  pts += (s.safeties || 0) * rules.safety;
  if (s.ptsAllowed != null) {
    const avgPerGame = s.ptsAllowed / Math.max(1, games);
    pts += pointsAllowedBonus(avgPerGame) * games;
  }

  return round2(pts);
}

// A "season summary" bundles the total points for the year alongside
// the per-game rate. The per-game rate is what a shortened season
// (strike year, wartime schedule, < 16 games) gets "repeated" at for
// every week of a simulated 16-week fantasy season -- see season.js.
export function getSeasonSummary(season, rules = DEFAULT_SCORING_RULES, position = null) {
  const games = season.games || 1;
  const totalPoints = calculateFantasyPoints(season.stats, rules, position, games);
  const pointsPerGame = round2(totalPoints / games);
  return { totalPoints, pointsPerGame, games };
}
