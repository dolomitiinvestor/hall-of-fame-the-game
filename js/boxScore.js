// Per-week integer box score (yards, TDs, receptions, carries,
// fumbles) for skill-position starters, shown on the Games tab and the
// player card.
//
// Two sources:
//   1. realGameBoxScore() below -- a real archived game (see
//      js/data/realBoxScores.js and resolveRealGame() in season.js),
//      used as-is with no scaling.
//   2. generateBoxScore() -- a simulated box score for everyone else:
//      the player's selected season's per-game averages, scaled by a
//      weekly variance multiplier (see weeklyVarianceMultiplier() in
//      season.js) and rounded to whole numbers. That week's fantasy
//      points are then computed FROM this exact rounded statline (see
//      boxScoreToStats() below and computeTeamWeekScore() in
//      season.js), rather than sampled independently -- so the points
//      shown always add up to the stats shown next to them, the same
//      way a real game's points do.
//
// "Carries" isn't a stored stat (season data only has rushing yards/
// TDs) -- it's estimated from rushing yards at a fixed yards-per-carry
// rate, same as the rest of this simulated model: a reasonable
// stand-in, not real data. A real game log can supply an exact
// `rushAtt` instead (see realGameBoxScore()).

const RUSH_YARDS_PER_CARRY = 4.3;

function scaledInt(seasonTotal, games, multiplier) {
  const perGame = (seasonTotal || 0) / Math.max(1, games);
  return Math.max(0, Math.round(perGame * multiplier));
}

function carriesFor(rushYds, rushAtt) {
  if (rushAtt != null) return rushAtt;
  return rushYds ? Math.max(1, Math.round(rushYds / RUSH_YARDS_PER_CARRY)) : 0;
}

// Turns one archived real game (see js/data/realBoxScores.js) into the
// same box-score shape generateBoxScore() below produces, so the Games
// tab and player card render either one identically.
export function realGameBoxScore(game) {
  const g = game || {};
  return {
    isReal: true,
    passYds: g.passYds || 0,
    passTD: g.passTD || 0,
    passInt: g.passInt || 0,
    carries: carriesFor(g.rushYds, g.rushAtt),
    rushYds: g.rushYds || 0,
    rushTD: g.rushTD || 0,
    receptions: g.rec || 0,
    recYds: g.recYds || 0,
    recTD: g.recTD || 0,
    fumbles: g.fumblesLost || 0,
  };
}

// `season` is the specific season object (already resolved by the
// caller -- see resolvePlayerSeason() in season.js) to scale from, not
// necessarily always "best": this stays correct automatically as the
// season-selection seam (players.js) grows beyond "best" later.
export function generateBoxScore(player, season, multiplier) {
  if (!["QB", "RB", "WR", "TE"].includes(player.position)) return null;
  if (!season) return null;

  const games = season.games || 1;
  const s = season.stats || {};
  const box = { isReal: false };

  if (player.position === "QB") {
    box.passYds = scaledInt(s.passYds, games, multiplier);
    box.passTD = scaledInt(s.passTD, games, multiplier);
    box.passInt = scaledInt(s.passInt, games, multiplier);
    box.rushYds = scaledInt(s.rushYds, games, multiplier);
    box.rushTD = scaledInt(s.rushTD, games, multiplier);
    box.carries = carriesFor(box.rushYds);
    box.fumbles = scaledInt(s.fumblesLost, games, multiplier);
  } else if (player.position === "RB") {
    box.rushYds = scaledInt(s.rushYds, games, multiplier);
    box.rushTD = scaledInt(s.rushTD, games, multiplier);
    box.carries = carriesFor(box.rushYds);
    box.receptions = scaledInt(s.rec, games, multiplier);
    box.recYds = scaledInt(s.recYds, games, multiplier);
    box.recTD = scaledInt(s.recTD, games, multiplier);
    box.fumbles = scaledInt(s.fumblesLost, games, multiplier);
  } else {
    box.receptions = scaledInt(s.rec, games, multiplier);
    box.recYds = scaledInt(s.recYds, games, multiplier);
    box.recTD = scaledInt(s.recTD, games, multiplier);
    box.fumbles = scaledInt(s.fumblesLost, games, multiplier);
  }
  return box;
}

// Turns a box score (generateBoxScore()/realGameBoxScore() shape,
// "receptions"/"fumbles") into the stat-field shape
// calculateFantasyPoints() (scoring.js) expects ("rec"/"fumblesLost")
// -- every other field name already matches, so this just renames
// those two. Lets a week's points be computed directly from the exact
// statline shown for it.
export function boxScoreToStats(box) {
  if (!box) return {};
  return {
    passYds: box.passYds,
    passTD: box.passTD,
    passInt: box.passInt,
    rushYds: box.rushYds,
    rushTD: box.rushTD,
    recYds: box.recYds,
    recTD: box.recTD,
    rec: box.receptions,
    fumblesLost: box.fumbles,
  };
}

// Compact "187 pass yds, 2 pass TD, 12 rush yds" style line, shared by
// the Games tab box score column and the player card's weekly history.
export function formatBoxScoreLine(box) {
  if (!box) return "";
  const parts = [];
  if (box.passYds) parts.push(`${box.passYds} pass yds`);
  if (box.passTD) parts.push(`${box.passTD} pass TD`);
  if (box.passInt) parts.push(`${box.passInt} INT`);
  if (box.carries) parts.push(`${box.carries} car`);
  if (box.rushYds) parts.push(`${box.rushYds} rush yds`);
  if (box.rushTD) parts.push(`${box.rushTD} rush TD`);
  if (box.receptions) parts.push(`${box.receptions} rec`);
  if (box.recYds) parts.push(`${box.recYds} rec yds`);
  if (box.recTD) parts.push(`${box.recTD} rec TD`);
  if (box.fumbles) parts.push(`${box.fumbles} fum`);
  return parts.join(", ");
}
