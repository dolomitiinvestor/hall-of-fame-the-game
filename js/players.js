// Player data access layer. This is the seam where "current players"
// or a bigger/real stats source gets mixed in later -- callers never
// touch the raw data arrays directly, only the functions below, so the
// data source (or how many pools get merged in) can change without
// touching draft/season/UI code.

import { PLAYERS } from "./data/players.js";
import { COACHES } from "./data/coaches.js";
import { KICKERS } from "./data/kickers.js";
import { DEFENSES } from "./data/defenses.js";
import { getSeasonSummary } from "./scoring.js";

const ALL_PLAYERS = [...PLAYERS, ...COACHES, ...KICKERS, ...DEFENSES];

export function getAllPlayers() {
  return ALL_PLAYERS;
}

export function getPlayerById(id) {
  return ALL_PLAYERS.find((p) => p.id === id) || null;
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

// Which of a player's `seasons` entries gets used for an actual
// fantasy season -- a pluggable seam. Only "best" (today's existing
// behavior: highest-scoring season under current rules) is implemented;
// this is the hook for later strategies (e.g. "random", "weighted by
// recency") once more players carry multiple preloaded seasons.
// createSeason() in season.js calls this once per rostered player when
// a season starts and snapshots the chosen year, rather than always
// dynamically re-picking "best" the way pre-season screens do.
export const SEASON_SELECTION_STRATEGIES = {
  best: (player, rules) => getBestSeason(player, rules).season,
};

export function selectSeason(player, rules, strategy = "best") {
  const fn = SEASON_SELECTION_STRATEGIES[strategy] || SEASON_SELECTION_STRATEGIES.best;
  return fn(player, rules) || player.seasons[0];
}

export function getSeasonByYear(player, year) {
  return player.seasons.find((s) => s.year === year) || null;
}

// A player is either RETIRED (tag HOF or HOVG) or ACTIVE. This is the
// grouping the draft's forced alternation (see draftEngine.js) cares
// about -- HOF vs. HOVG only matters for display/filtering. Coaches,
// kickers, and team defenses all carry a tag too (for the badge/filter)
// but are exempt from the alternation itself; see SKILL_POSITIONS in
// draftEngine.js.
export function isRetired(player) {
  return player.tag === "HOF" || player.tag === "HOVG";
}

export function isActive(player) {
  return player.tag === "ACTIVE";
}

// `tagFilter`: "ALL" | "HOF" | "HOVG" | "ACTIVE" -- lets the draft pool
// be narrowed to enshrined Hall of Famers, the "Hall of Very Good" (not
// yet enshrined), active players, or all of the above.
export function searchPlayers({ query = "", position = "ALL", tagFilter = "ALL" } = {}, rules) {
  const q = query.trim().toLowerCase();
  return ALL_PLAYERS.filter((p) => {
    if (position !== "ALL" && p.position !== position) return false;
    if (tagFilter !== "ALL" && p.tag !== tagFilter) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  }).map((p) => ({ player: p, best: getBestSeason(p, rules) }));
}

function formatCoachLine(player) {
  const r = player.record;
  const record = `${r.wins}-${r.losses}${r.ties ? `-${r.ties}` : ""}`;
  const titleWord = r.titles === 1 ? "title" : "titles";
  const apptWord = r.titleAppearances === 1 ? "appearance" : "appearances";
  return `${record} career record - ${r.titles} ${titleWord}, ${r.titleAppearances} title-game ${apptWord}`;
}

export function formatSeasonLine(player, best) {
  if (player.position === "COACH") return formatCoachLine(player);

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
  } else if (player.position === "WR" || player.position === "TE") {
    if (season.stats.rec) parts.push(`${season.stats.rec} rec`);
    if (season.stats.recYds) parts.push(`${season.stats.recYds} rec yds`);
    if (season.stats.recTD) parts.push(`${season.stats.recTD} rec TD`);
  } else if (player.position === "K") {
    if (season.stats.fgMade != null) parts.push(`${season.stats.fgMade} FG made`);
    if (season.stats.xpMade != null) parts.push(`${season.stats.xpMade} XP made`);
  } else if (player.position === "DEF") {
    if (season.stats.sacks) parts.push(`${season.stats.sacks} sacks`);
    if (season.stats.defInt) parts.push(`${season.stats.defInt} INT`);
    if (season.stats.fumRec) parts.push(`${season.stats.fumRec} FR`);
    if (season.stats.defTD) parts.push(`${season.stats.defTD} DEF TD`);
    if (season.stats.ptsAllowed != null) parts.push(`${season.stats.ptsAllowed} pts allowed`);
  }
  const shortSeason = season.games < 16 ? ` (${season.games} gm season)` : "";
  const yearLabel = isActive(player) ? `${season.year} proj.` : `${season.year}`;
  return `${yearLabel} ${season.team}${shortSeason} - ${parts.join(", ")}`;
}
