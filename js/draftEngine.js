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
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
  "BENCH",
];

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
  BENCH: ["QB", "RB", "WR", "TE"],
};

// Builds a roster-slot template from league format settings. Kept
// separate from DEFAULT_ROSTER_SLOTS so the base template stays simple
// and each format toggle (Superflex, future ones) is one clear insert.
export function buildRosterSlots({ superflex = false } = {}) {
  const slots = [...DEFAULT_ROSTER_SLOTS];
  if (superflex) {
    const flexIdx = slots.indexOf("FLEX");
    slots.splice(flexIdx + 1, 0, "SUPERFLEX");
  }
  return slots;
}

export function createDraft(teamNames, rosterSlots = DEFAULT_ROSTER_SLOTS, order = null) {
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
// picks alternates, starting with retired on that team's 1st pick, then
// active on their 2nd, retired on their 3rd, and so on. Computed from
// how many picks this team has already made rather than stored, so
// undo (which just removes the last pick) keeps it correct for free.
export function getRequiredGroup(draft) {
  if (draft.status === "complete") return null;
  const team = getCurrentTeam(draft);
  if (!team) return null;
  const picksSoFar = draft.picks.filter((p) => p.teamId === team.id).length;
  return picksSoFar % 2 === 0 ? "RETIRED" : "ACTIVE";
}

export function playerMatchesGroup(player, requiredGroup) {
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

export function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
