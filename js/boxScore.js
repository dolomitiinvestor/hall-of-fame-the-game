// Per-week integer box score (yards, TDs, receptions, carries,
// fumbles) for skill-position starters, shown on the Games tab and the
// player card.
//
// Two sources, real taking priority:
//   1. js/data/realBoxScores.js -- an empty seam for now. Add real
//      per-week game logs here piecemeal (keyed by playerId, then
//      week) as they become sourceable, and they take over
//      automatically -- nothing else needs to change.
//   2. Otherwise, a simulated box score: the player's selected
//      season's per-game averages, scaled by the SAME weekly variance
//      multiplier already applied to their fantasy points that week
//      (see weeklyVarianceMultiplier() in season.js), then rounded to
//      whole numbers. Using the same multiplier is what makes the box
//      score "correspond to" that week's score -- a big scoring week
//      shows big yardage/TD numbers, not independently-random ones.
//
// "Carries" isn't a stored stat (season data only has rushing yards/
// TDs) -- it's estimated from rushing yards at a fixed yards-per-carry
// rate, same as the rest of this simulated model: a reasonable
// stand-in, not real data.

import { REAL_BOX_SCORES } from "./data/realBoxScores.js";

const RUSH_YARDS_PER_CARRY = 4.3;

function scaledInt(seasonTotal, games, multiplier) {
  const perGame = (seasonTotal || 0) / Math.max(1, games);
  return Math.max(0, Math.round(perGame * multiplier));
}

function carriesFor(rushYds) {
  return rushYds ? Math.max(1, Math.round(rushYds / RUSH_YARDS_PER_CARRY)) : 0;
}

// `season` is the specific season object (already resolved by the
// caller -- see resolvePlayerSeason() in season.js) to scale from, not
// necessarily always "best": this stays correct automatically as the
// season-selection seam (players.js) grows beyond "best" later.
export function generateBoxScore(player, season, multiplier, playerId, week) {
  const real = REAL_BOX_SCORES[playerId]?.[week];
  if (real) return { ...real, isReal: true };

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
