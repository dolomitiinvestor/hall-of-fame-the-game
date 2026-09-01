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
// Retired (HOF/HOVG) players and HOVG kickers: no real per-week injury
// history exists to pull, so status is randomly rolled -- but
// deterministically, seeded from (playerId, week), so a given player's
// week-N designation is stable across re-renders and reloads rather
// than flickering. Coaches and team defenses are exempt entirely (a
// coach isn't the one taking snaps; a defense is a unit, not a person).

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
// players are Healthy but real injury risk exists.
const RETIRED_INJURY_WEIGHTS = [
  ["HEALTHY", 0.82],
  ["QUESTIONABLE", 0.09],
  ["DOUBTFUL", 0.04],
  ["OUT", 0.04],
  ["IR", 0.01],
];

// The only status key that varies by week is the retired-player random
// roll; ACTIVE is a fixed snapshot, so `week` is optional for it.
export function getInjuryStatusKey(player, week) {
  if (!INJURY_ELIGIBLE_POSITIONS.includes(player.position)) return "HEALTHY";
  if (player.tag === "ACTIVE") return ACTIVE_INJURY_REPORT[player.id] || "HEALTHY";
  if (player.tag !== "HOF" && player.tag !== "HOVG") return "HEALTHY";
  if (week == null) return "HEALTHY"; // no week context (e.g. Draft screen) -- nothing to show
  const r = seededRandom(`injury:${player.id}:${week}`);
  return pickWeighted(r, RETIRED_INJURY_WEIGHTS);
}

export function getInjuryStatus(player, week) {
  return INJURY_STATUSES[getInjuryStatusKey(player, week)];
}

export function isOutForWeek(player, week) {
  const key = getInjuryStatusKey(player, week);
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
