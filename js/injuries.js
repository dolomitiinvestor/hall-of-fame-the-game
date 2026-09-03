// Injury designations.
//
// ACTIVE players: meant to be "pulled" real current NFL injury
// designations. In practice, this environment's web search only
// surfaced one designation solid enough to encode with confidence
// (see ACTIVE_INJURY_REPORT below) -- injury reports change daily in
// real life and most search results here were too vague/contradictory
// (e.g. old-season articles mixed into current results) to treat as
// reliable. Everyone else defaults to Healthy. Update
// ACTIVE_INJURY_REPORT directly as better data becomes available; nothing
// else needs to change.
//
// Retired (HOF/HOVG) players and HOVG kickers get two independent
// injury mechanics layered together:
//   1. A per-week Questionable/Doubtful/Out flutter, randomly rolled
//      but deterministically seeded from (playerId, week) -- a given
//      player's week-N designation is stable across re-renders and
//      reloads rather than flickering. Never season-ending; see below.
//   2. A season-ending injury: once per fantasy season, each rostered
//      eligible player gets one shot (rate depends on position -- see
//      SEASON_ENDING_INJURY_RATE) at going down for the year in a
//      randomly picked week. This is a stateful roll (persists once it
//      happens), so unlike (1) it can't be recomputed on demand from
//      just (playerId, week) -- it's rolled once at season creation
//      (rollSeasonEndingInjury(), called from season.js) and the
//      result threaded back in here as `seasonEndingInjuries`.
// Coaches and team defenses are exempt entirely from both (a coach
// isn't the one taking snaps; a defense is a unit, not a person).

import { seededRandom, pickWeighted } from "./rng.js";

export const INJURY_STATUSES = {
  HEALTHY: { code: null, label: "Healthy" },
  QUESTIONABLE: { code: "Q", label: "Questionable" },
  DOUBTFUL: { code: "D", label: "Doubtful" },
  OUT: { code: "O", label: "Out" },
  IR: { code: "IR", label: "Injured Reserve" },
};

// Positions that can carry a football injury designation at all.
const INJURY_ELIGIBLE_POSITIONS = ["QB", "RB", "WR", "TE", "K"];

// Real-world snapshot (see module comment above) -- keys are player
// ids from js/data/players.js.
const ACTIVE_INJURY_REPORT = {
  "sam-laporta": "QUESTIONABLE", // hip, ahead of Week 1 (source: web search, Aug 2026)
};

// Weekly odds for a retired/HOVG player, tuned so most weeks most
// players are Healthy but real injury risk exists. IR isn't in this
// pool -- that designation is reserved for the season-ending mechanic
// below, which is stateful (persists week to week) rather than
// re-rolled fresh every week like this one.
const RETIRED_INJURY_WEIGHTS = [
  ["HEALTHY", 0.83],
  ["QUESTIONABLE", 0.09],
  ["DOUBTFUL", 0.04],
  ["OUT", 0.04],
];

// Rough, position-shaped approximations of the chance a given retired
// starter suffers a season-ending injury in a given season -- running
// backs take the most punishment and miss the most time league-wide,
// kickers almost never go down. Gameplay flavor, not sourced from a
// single authoritative study -- same "hand-compiled approximation"
// spirit as the rest of this game's data (see the site footer).
export const SEASON_ENDING_INJURY_RATE = {
  QB: 0.06,
  RB: 0.14,
  WR: 0.09,
  TE: 0.1,
  K: 0.02,
};

const SEASON_ENDING_INJURY_REASONS = [
  "a torn ACL",
  "a ruptured Achilles tendon",
  "a fractured fibula",
  "a torn labrum",
  "a dislocated shoulder",
  "a torn pectoral muscle",
  "a ruptured patellar tendon",
  "a Lisfranc fracture",
  "a torn MCL",
  "a herniated disc",
  "a broken collarbone",
  "a high ankle sprain requiring surgery",
];

// Rolls whether `player` goes down for the season, and if so, which
// week (1..seasonWeeks, uniform) and why. Called once per rostered
// eligible player when a fantasy season is created (see
// buildSeasonEndingInjuries() in season.js) -- not deterministically
// seeded like the per-week roll above, since it only ever needs to
// happen once and gets snapshotted into season state immediately
// (same pattern as the real-game-archive year/order picks in
// season.js). Returns null for anyone ineligible (ACTIVE, ineligible
// position, coach, defense) or who just didn't roll it.
export function rollSeasonEndingInjury(player, seasonWeeks) {
  if (!INJURY_ELIGIBLE_POSITIONS.includes(player.position)) return null;
  if (player.tag !== "HOF" && player.tag !== "HOVG") return null;
  const rate = SEASON_ENDING_INJURY_RATE[player.position] || 0;
  if (Math.random() >= rate) return null;
  const week = 1 + Math.floor(Math.random() * seasonWeeks);
  const reason = SEASON_ENDING_INJURY_REASONS[Math.floor(Math.random() * SEASON_ENDING_INJURY_REASONS.length)];
  return { week, reason };
}

// `seasonEndingInjuries` (optional) is the in-progress season's map of
// playerId -> { week, reason } (season.seasonEndingInjuries, built by
// buildSeasonEndingInjuries() in season.js) -- once `week` reaches
// that player's injury week, they're IR through the rest of the
// season, overriding the per-week flutter below. Omit it (e.g. no
// season in progress yet, or this player isn't rostered) to fall back
// to just the per-week roll.
export function getInjuryStatusKey(player, week, seasonEndingInjuries) {
  if (!INJURY_ELIGIBLE_POSITIONS.includes(player.position)) return "HEALTHY";
  if (player.tag === "ACTIVE") return ACTIVE_INJURY_REPORT[player.id] || "HEALTHY";
  if (player.tag !== "HOF" && player.tag !== "HOVG") return "HEALTHY";
  if (week == null) return "HEALTHY"; // no week context (e.g. Draft screen) -- nothing to show
  const seasonEnding = seasonEndingInjuries?.[player.id];
  if (seasonEnding && week >= seasonEnding.week) return "IR";
  const r = seededRandom(`injury:${player.id}:${week}`);
  return pickWeighted(r, RETIRED_INJURY_WEIGHTS);
}

export function getInjuryStatus(player, week, seasonEndingInjuries) {
  return INJURY_STATUSES[getInjuryStatusKey(player, week, seasonEndingInjuries)];
}

export function isOutForWeek(player, week, seasonEndingInjuries) {
  const key = getInjuryStatusKey(player, week, seasonEndingInjuries);
  return key === "OUT" || key === "IR";
}

// Whole-number "injury prone" percentage for a retired (HOF/HOVG)
// player: the chance, in any given simulated week, that their weekly
// roll (see getInjuryStatusKey above) comes back as anything other
// than Healthy. Only meaningful for the retired weekly-roll model --
// null for ACTIVE players (a fixed real-world snapshot, not a weekly
// probability) and for ineligible positions/coaches/defenses.
export function getInjuryPronePercent(player) {
  if (!INJURY_ELIGIBLE_POSITIONS.includes(player.position)) return null;
  if (player.tag !== "HOF" && player.tag !== "HOVG") return null;
  const healthyWeight = RETIRED_INJURY_WEIGHTS.find(([key]) => key === "HEALTHY")[1];
  return Math.round((1 - healthyWeight) * 100);
}
