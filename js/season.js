// Weekly season simulation + standings.
//
// v1 scoring model: every drafted player's weekly score is their best
// season's fantasy points *per game*, i.e. a shortened season's rate
// gets "repeated" across all 16 simulated weeks. This is the seam
// where real per-week game logs, matchup-based defense adjustments,
// and random weekly variance all plug in later -- everything else
// (draft, standings, UI) only calls computeTeamWeekScore()/advanceWeek(),
// so upgrading the model here is a self-contained change.

import { getPlayerById, getBestSeason } from "./players.js";
import { round2 } from "./scoring.js";
import { generateSchedule } from "./schedule.js";

export const SEASON_WEEKS = 16;

export function createSeason(draft, weeks = SEASON_WEEKS) {
  const teamIds = draft.teams.map((t) => t.id);
  return {
    weeks,
    schedule: generateSchedule(teamIds, weeks),
    currentWeek: 0,
    weeklyResults: [],
    standings: initStandings(draft.teams),
  };
}

function initStandings(teams) {
  const standings = {};
  teams.forEach((t) => {
    standings[t.id] = {
      teamId: t.id,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    };
  });
  return standings;
}

export function getStarterIds(team) {
  return team.roster.filter((s) => s.slot !== "BENCH" && s.playerId).map((s) => s.playerId);
}

// A single player's projected points for any given week of the
// simulated season -- currently their best season's points-per-game.
export function weeklyPointsForPlayer(playerId, rules) {
  const player = getPlayerById(playerId);
  if (!player) return 0;
  const { summary } = getBestSeason(player, rules);
  return summary.pointsPerGame;
}

export function computeTeamWeekScore(team, rules) {
  const starterIds = getStarterIds(team);
  const breakdown = starterIds.map((pid) => {
    const player = getPlayerById(pid);
    const points = weeklyPointsForPlayer(pid, rules);
    return { playerId: pid, name: player.name, position: player.position, points };
  });
  const total = round2(breakdown.reduce((sum, b) => sum + b.points, 0));
  return { total, breakdown };
}

function updateStandings(standings, aId, bId, scoreA, scoreB, winnerId) {
  const sa = standings[aId];
  const sb = standings[bId];
  sa.pointsFor = round2(sa.pointsFor + scoreA);
  sa.pointsAgainst = round2(sa.pointsAgainst + scoreB);
  sb.pointsFor = round2(sb.pointsFor + scoreB);
  sb.pointsAgainst = round2(sb.pointsAgainst + scoreA);
  if (winnerId === aId) {
    sa.wins++;
    sb.losses++;
  } else if (winnerId === bId) {
    sb.wins++;
    sa.losses++;
  } else {
    sa.ties++;
    sb.ties++;
  }
}

export function isSeasonComplete(season) {
  return season.currentWeek >= season.weeks;
}

export function advanceWeek(season, draft, rules) {
  if (isSeasonComplete(season)) return season;
  const weekIndex = season.currentWeek;
  const pairs = season.schedule[weekIndex] || [];
  const teamsById = Object.fromEntries(draft.teams.map((t) => [t.id, t]));
  const byeTeamIds = draft.teams
    .map((t) => t.id)
    .filter((id) => !pairs.some((pair) => pair.includes(id)));

  const matchups = pairs.map(([aId, bId]) => {
    const scoreA = computeTeamWeekScore(teamsById[aId], rules);
    const scoreB = computeTeamWeekScore(teamsById[bId], rules);
    let winnerId = null;
    if (scoreA.total > scoreB.total) winnerId = aId;
    else if (scoreB.total > scoreA.total) winnerId = bId;
    updateStandings(season.standings, aId, bId, scoreA.total, scoreB.total, winnerId);
    return { teamIds: [aId, bId], scores: { [aId]: scoreA, [bId]: scoreB }, winnerId };
  });

  season.weeklyResults.push({ week: weekIndex + 1, matchups, byeTeamIds });
  season.currentWeek++;
  return season;
}

export function getStandingsList(season, draft) {
  const teamsById = Object.fromEntries(draft.teams.map((t) => [t.id, t]));
  return Object.values(season.standings)
    .map((s) => ({ ...s, teamName: teamsById[s.teamId]?.name || s.teamId }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (a.losses !== b.losses) return a.losses - b.losses;
      return b.pointsFor - a.pointsFor;
    });
}
