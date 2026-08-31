// Player data access layer. This is the seam where "current players"
// or a bigger/real stats source gets mixed in later -- callers only
// use the functions below, never PLAYERS directly, so the data source
// can change without touching draft/season/UI code.

import { PLAYERS } from "./data/players.js";
import { getSeasonSummary } from "./scoring.js";

export function getAllPlayers() {
  return PLAYERS;
}

export function getPlayerById(id) {
  return PLAYERS.find((p) => p.id === id) || null;
}

// The "best season" is computed dynamically from the current scoring
// rules (highest total fantasy points that year) rather than stored
// as a flag, so changing scoring rules automatically re-picks it.
export function getBestSeason(player, rules) {
  let best = null;
  let bestSummary = null;
  for (const season of player.seasons) {
    const summary = getSeasonSummary(season, rules, player.position);
    if (!best || summary.totalPoints > bestSummary.totalPoints) {
      best = season;
      bestSummary = summary;
    }
  }
  return { season: best, summary: bestSummary };
}

// `hofFilter`: "ALL" | "HOF" | "NOT_HOF" -- lets the draft pool be
// narrowed to enshrined Hall of Famers, the "Hall of Very Good" (not
// yet enshrined), or both.
export function searchPlayers({ query = "", position = "ALL", hofFilter = "ALL" } = {}, rules) {
  const q = query.trim().toLowerCase();
  return PLAYERS.filter((p) => {
    if (position !== "ALL" && p.position !== position) return false;
    if (hofFilter === "HOF" && !p.hof) return false;
    if (hofFilter === "NOT_HOF" && p.hof) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  }).map((p) => ({ player: p, best: getBestSeason(p, rules) }));
}

export function formatSeasonLine(player, best) {
  const { season, summary } = best;
  const parts = [];
  if (player.position === "QB") {
    if (season.stats.passYds) parts.push(`${season.stats.passYds} pass yds`);
    if (season.stats.passTD) parts.push(`${season.stats.passTD} pass TD`);
    if (season.stats.passInt) parts.push(`${season.stats.passInt} INT`);
    if (season.stats.rushYds) parts.push(`${season.stats.rushYds} rush yds`);
  } else if (player.position === "RB") {
    if (season.stats.rushYds) parts.push(`${season.stats.rushYds} rush yds`);
    if (season.stats.rushTD) parts.push(`${season.stats.rushTD} rush TD`);
    if (season.stats.rec) parts.push(`${season.stats.rec} rec`);
    if (season.stats.recYds) parts.push(`${season.stats.recYds} rec yds`);
  } else {
    if (season.stats.rec) parts.push(`${season.stats.rec} rec`);
    if (season.stats.recYds) parts.push(`${season.stats.recYds} rec yds`);
    if (season.stats.recTD) parts.push(`${season.stats.recTD} rec TD`);
  }
  const shortSeason = season.games < 16 ? ` (${season.games} gm season)` : "";
  return `${season.year} ${season.team}${shortSeason} - ${parts.join(", ")}`;
}
