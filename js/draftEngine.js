// Snake draft state machine. Pure data-in/data-out (no DOM) so it can
// be unit tested and, later, driven by network messages instead of
// local UI clicks for real multiplayer.

import { getPlayerById } from "./players.js";

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
];

const FLEX_ELIGIBLE = ["RB", "WR", "TE"];

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
  let slot = team.roster.find((s) => s.slot === position && !s.playerId);
  if (slot) return slot;
  if (FLEX_ELIGIBLE.includes(position)) {
    slot = team.roster.find((s) => s.slot === "FLEX" && !s.playerId);
    if (slot) return slot;
  }
  slot = team.roster.find((s) => s.slot === "BENCH" && !s.playerId);
  return slot || null;
}

export function teamHasOpenSlotFor(team, position) {
  return !!findOpenSlotForPosition(team, position);
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
