// Snake draft state machine. Pure data-in/data-out (no DOM) so it can
// be unit tested and, later, driven by network messages instead of
// local UI clicks for real multiplayer.

import { getPlayerById, isRetired, isActive } from "./players.js";

export const DEFAULT_ROSTER_SLOTS = [
  "QB",
  "RB",
  "RB",
  "WR",
  "WR",
  "TE",
  "FLEX",
  "K",
  "DEF",
  "COACH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
];

// Offensive skill positions -- the only ones subject to the draft's
// forced retired/active alternation (see getRequiredGroup below).
// COACH/K/DEF are a different kind of pick entirely and are exempt.
export const SKILL_POSITIONS = ["QB", "RB", "WR", "TE"];

// Which player positions can fill each slot type. BENCH takes anyone;
// FLEX takes the usual RB/WR/TE; SUPERFLEX (added when a league enables
// the Superflex format) additionally allows QB.
export const SLOT_ELIGIBILITY = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "WR", "TE"],
  SUPERFLEX: ["QB", "RB", "WR", "TE"],
  COACH: ["COACH"],
  K: ["K"],
  DEF: ["DEF"],
  BENCH: ["QB", "RB", "WR", "TE", "COACH", "K", "DEF"],
};

export const DEFAULT_BENCH_SPOTS = 7;

// Builds a roster-slot template from league format settings. Kicker
// and Defense slots are each optional (omitting one means that
// position is never draftable at all -- see the pool filtering in
// app.js's Draft screen); bench size is configurable too.
export function buildRosterSlots({
  superflex = false,
  enableKicker = true,
  enableDefense = true,
  benchSpots = DEFAULT_BENCH_SPOTS,
} = {}) {
  const slots = ["QB", "RB", "RB", "WR", "WR", "TE", "FLEX"];
  if (superflex) slots.push("SUPERFLEX");
  if (enableKicker) slots.push("K");
  if (enableDefense) slots.push("DEF");
  slots.push("COACH");
  for (let i = 0; i < Math.max(0, benchSpots); i++) slots.push("BENCH");
  return slots;
}

// `settings.maxRetiredSkillPlayers` (null/undefined = no limit) caps
// how many retired (HOF/HOVG) QB/RB/WR/TE picks a team may make; once
// hit, getRequiredGroup forces ACTIVE for the rest of that team's
// skill picks regardless of the normal alternation count. Stored on
// the draft object (like rosterSlots) so every function that needs it
// only takes `draft`, not a separate settings param threaded through.
export function createDraft(teamNames, rosterSlots = DEFAULT_ROSTER_SLOTS, order = null, settings = {}) {
  const teams = teamNames.map((name, i) => ({
    id: `team-${i + 1}`,
    name,
    roster: rosterSlots.map((slot) => ({ slot, playerId: null })),
  }));
  return {
    teams,
    rosterSlots: [...rosterSlots],
    order: order && order.length ? order : teams.map((t) => t.id),
    totalRounds: rosterSlots.length,
    round: 1,
    pickInRound: 0,
    overallPick: 1,
    picks: [],
    draftedPlayerIds: [],
    status: "in_progress",
    maxRetiredSkillPlayers: settings.maxRetiredSkillPlayers ?? null,
  };
}

function currentTeamId(draft) {
  const idxForward = draft.pickInRound;
  const idx = draft.round % 2 === 1 ? idxForward : draft.order.length - 1 - idxForward;
  return draft.order[idx];
}

export function getCurrentTeam(draft) {
  if (draft.status === "complete") return null;
  const id = currentTeamId(draft);
  return draft.teams.find((t) => t.id === id) || null;
}

function findOpenSlotForPosition(team, position) {
  // Prefer the exact-position slot first (e.g. a QB into the QB slot).
  let slot = team.roster.find((s) => s.slot === position && !s.playerId);
  if (slot) return slot;
  // Then any other eligible non-BENCH slot, in roster order (so FLEX
  // fills before SUPERFLEX, matching how the template is laid out).
  slot = team.roster.find(
    (s) =>
      s.slot !== "BENCH" &&
      s.slot !== position &&
      !s.playerId &&
      (SLOT_ELIGIBILITY[s.slot] || []).includes(position)
  );
  if (slot) return slot;
  // Finally, bench.
  slot = team.roster.find((s) => s.slot === "BENCH" && !s.playerId);
  return slot || null;
}

export function teamHasOpenSlotFor(team, position) {
  return !!findOpenSlotForPosition(team, position);
}

// The draft forces alternation between retired (HOF/HOVG) and active
// players -- per team, not by overall pick: each team's OWN sequence of
// SKILL-POSITION picks alternates, starting with retired on their 1st
// skill pick, then active on their 2nd, retired on their 3rd, and so
// on. COACH/K/DEF picks don't count toward this and aren't restricted
// by it (see playerMatchesGroup). Computed from how many qualifying
// picks this team has already made rather than stored, so undo (which
// just removes the last pick) keeps it correct for free.
export function getRequiredGroup(draft) {
  if (draft.status === "complete") return null;
  const team = getCurrentTeam(draft);
  if (!team) return null;
  const skillPicks = draft.picks.filter((p) => {
    if (p.teamId !== team.id) return false;
    const player = getPlayerById(p.playerId);
    return player && SKILL_POSITIONS.includes(player.position);
  });
  const maxRetired = draft.maxRetiredSkillPlayers;
  if (maxRetired != null) {
    const retiredSoFar = skillPicks.filter((p) => isRetired(getPlayerById(p.playerId))).length;
    if (retiredSoFar >= maxRetired) return "ACTIVE";
  }
  return skillPicks.length % 2 === 0 ? "RETIRED" : "ACTIVE";
}

// COACH/K/DEF aren't offensive skill players and sit outside the
// retired/active alternation entirely -- always eligible group-wise.
export function playerMatchesGroup(player, requiredGroup) {
  if (!SKILL_POSITIONS.includes(player.position)) return true;
  if (!requiredGroup) return true;
  return requiredGroup === "RETIRED" ? isRetired(player) : isActive(player);
}

// Combines the position/slot check with the retired-vs-active check --
// the single source of truth the UI uses to enable/disable a Draft
// button, and that draftPlayer() below re-validates against.
export function canDraftPlayer(draft, team, player) {
  return teamHasOpenSlotFor(team, player.position) && playerMatchesGroup(player, getRequiredGroup(draft));
}

function advancePick(draft) {
  draft.overallPick++;
  draft.pickInRound++;
  if (draft.pickInRound >= draft.order.length) {
    draft.pickInRound = 0;
    draft.round++;
    if (draft.round > draft.totalRounds) {
      draft.status = "complete";
    }
  }
}

export function draftPlayer(draft, playerId) {
  if (draft.status === "complete") throw new Error("Draft is already complete.");
  if (draft.draftedPlayerIds.includes(playerId)) throw new Error("Player already drafted.");

  const team = getCurrentTeam(draft);
  const player = getPlayerById(playerId);
  if (!player) throw new Error("Unknown player.");

  const requiredGroup = getRequiredGroup(draft);
  if (!playerMatchesGroup(player, requiredGroup)) {
    const label = requiredGroup === "RETIRED" ? "a retired (HOF/HOVG)" : "an active";
    throw new Error(`This pick must be ${label} player.`);
  }

  const slot = findOpenSlotForPosition(team, player.position);
  if (!slot) throw new Error(`${team.name} has no open roster spot for a ${player.position}.`);

  slot.playerId = playerId;
  draft.draftedPlayerIds.push(playerId);
  draft.picks.push({
    overallPick: draft.overallPick,
    round: draft.round,
    teamId: team.id,
    playerId,
  });
  advancePick(draft);
  return team;
}

export function undoLastPick(draft) {
  const last = draft.picks.pop();
  if (!last) return;
  draft.status = "in_progress";
  draft.overallPick--;
  draft.pickInRound--;
  if (draft.pickInRound < 0) {
    draft.round--;
    draft.pickInRound = draft.order.length - 1;
  }
  draft.draftedPlayerIds = draft.draftedPlayerIds.filter((id) => id !== last.playerId);
  const team = draft.teams.find((t) => t.id === last.teamId);
  const slot = team.roster.find((s) => s.playerId === last.playerId);
  if (slot) slot.playerId = null;
}

// Swaps whichever player currently occupies `slotIndex` on `team`
// with `newPlayerId` (which must already be somewhere on the roster).
// Used by the lineup editor to move players between BENCH and starting
// slots without ever leaving the roster in an inconsistent state.
export function setSlotPlayer(team, slotIndex, newPlayerId) {
  const targetSlot = team.roster[slotIndex];
  const oldPlayerId = targetSlot.playerId;
  const sourceIndex = team.roster.findIndex(
    (s, i) => i !== slotIndex && s.playerId === newPlayerId
  );
  targetSlot.playerId = newPlayerId || null;
  if (sourceIndex >= 0) {
    team.roster[sourceIndex].playerId = oldPlayerId;
  }
}

// Waiver-wire style add/drop, usable once the draft is complete (see
// the Teams tab's Free Agency section in app.js). Both re-use the same
// draftedPlayerIds/roster invariants the draft itself maintains, so
// nothing downstream (scoring, standings) needs to know a player
// arrived via drop/add instead of a draft pick.
export function dropPlayer(draft, teamId, playerId) {
  const team = draft.teams.find((t) => t.id === teamId);
  if (!team) throw new Error("Unknown team.");
  const slot = team.roster.find((s) => s.playerId === playerId);
  if (!slot) throw new Error("That player isn't on this team.");
  slot.playerId = null;
  draft.draftedPlayerIds = draft.draftedPlayerIds.filter((id) => id !== playerId);
}

export function addFreeAgent(draft, teamId, playerId) {
  if (draft.draftedPlayerIds.includes(playerId)) throw new Error("That player is already rostered.");
  const team = draft.teams.find((t) => t.id === teamId);
  if (!team) throw new Error("Unknown team.");
  const player = getPlayerById(playerId);
  if (!player) throw new Error("Unknown player.");
  const slot = findOpenSlotForPosition(team, player.position);
  if (!slot) throw new Error(`${team.name} has no open roster spot for a ${player.position}. Drop someone first.`);
  slot.playerId = playerId;
  draft.draftedPlayerIds.push(playerId);
  return team;
}

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
