// Weekly season simulation, playoffs, and standings.
//
// Scoring model: every drafted player's weekly score starts from their
// best season's fantasy points *per game* (a shortened season's rate
// "repeated" across weeks), then two adjustments apply before it's
// used: a seeded per-player-per-week variance multiplier (so weeks
// actually differ rather than repeating a flat average -- see rng.js),
// and a zero-out if that player is marked OUT/IR for the week (see
// injuries.js). A started COACH adds a flat percentage bonus to the
// team's total. This is the seam where real per-week game logs and
// matchup-based defense adjustments plug in later -- everything else
// (draft, standings, UI) only calls computeTeamWeekScore()/advanceWeek(),
// so upgrading the model here is a self-contained change.

import { getPlayerById, getBestSeason, selectSeason, getSeasonByYear } from "./players.js";
import { round1, getSeasonSummary } from "./scoring.js";
import { generateSchedule } from "./schedule.js";
import { seededNormal } from "./rng.js";
import { isOutForWeek, getInjuryStatusKey } from "./injuries.js";
import { generateBoxScore } from "./boxScore.js";

export const SEASON_WEEKS = 16;

// 4+ teams get a 4-team bracket (semifinals + championship/3rd-place,
// 2 playoff weeks); smaller leagues get a straight 2-team championship
// (1 playoff week) so there's always at least a title game.
export function getRegularSeasonWeeks(numTeams) {
  return numTeams >= 4 ? SEASON_WEEKS - 2 : SEASON_WEEKS - 1;
}

// At season creation, every rostered player's season is "chosen" once
// via the pluggable selectSeason() strategy (players.js) and snapshotted
// here by year -- today the only strategy is "best" (identical to what
// the pre-season screens show live), but the seam exists so a future
// strategy (or a player with real multiple preloaded seasons) can vary
// without touching anything downstream. resolvePlayerSeason() below is
// how the rest of this file reads it back, falling back to "best" for
// any player missing from the map (e.g. an older saved season, or a
// free-agent pickup added after the season started).
function buildSelectedSeasons(draft, rules) {
  const selected = {};
  draft.teams.forEach((team) => {
    team.roster.forEach((slot) => {
      if (!slot.playerId || selected[slot.playerId]) return;
      const player = getPlayerById(slot.playerId);
      if (!player) return;
      const season = selectSeason(player, rules, "best");
      if (season) selected[slot.playerId] = season.year;
    });
  });
  return selected;
}

function resolvePlayerSeason(playerId, rules, season) {
  const player = getPlayerById(playerId);
  if (!player) return null;
  const year = season?.selectedSeasons?.[playerId];
  const bySelected = year != null ? getSeasonByYear(player, year) : null;
  if (bySelected) return { season: bySelected, summary: getSeasonSummary(bySelected, rules, player.position) };
  return getBestSeason(player, rules);
}

export function createSeason(draft, weeks = SEASON_WEEKS, rules) {
  const teamIds = draft.teams.map((t) => t.id);
  const regularSeasonWeeks = getRegularSeasonWeeks(teamIds.length);
  return {
    weeks,
    regularSeasonWeeks,
    schedule: generateSchedule(teamIds, regularSeasonWeeks),
    currentWeek: 0,
    weeklyResults: [],
    standings: initStandings(draft.teams),
    playoffs: null, // seeded lazily once the regular season ends
    championId: null,
    selectedSeasons: buildSelectedSeasons(draft, rules),
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

const VARIANCE_STDDEV = 0.3;
const VARIANCE_MIN = 0.35;
const VARIANCE_MAX = 1.85;

export function weeklyVarianceMultiplier(playerId, week) {
  const z = seededNormal(`variance:${playerId}:${week}`);
  const factor = 1 + VARIANCE_STDDEV * z;
  return Math.min(VARIANCE_MAX, Math.max(VARIANCE_MIN, factor));
}

// A single player's points for a given week. Without a week (e.g. the
// Draft/Teams screens showing a flat "expected" rate), returns the
// season's plain points-per-game -- no variance, no injury effect,
// since those only make sense once a specific week is being played.
// `season` (optional) is the in-progress fantasy season -- when given,
// its selectedSeasons snapshot is used instead of always recomputing
// "best" (see resolvePlayerSeason above).
export function weeklyPointsForPlayer(playerId, rules, week, season) {
  const player = getPlayerById(playerId);
  if (!player) return 0;
  const { summary } = resolvePlayerSeason(playerId, rules, season) || getBestSeason(player, rules);
  if (week == null) return summary.pointsPerGame;
  if (isOutForWeek(player, week)) return 0;
  return round1(summary.pointsPerGame * weeklyVarianceMultiplier(playerId, week));
}

export function computeTeamWeekScore(team, rules, week, season) {
  const starterIds = getStarterIds(team);
  const breakdown = starterIds.map((pid) => {
    const player = getPlayerById(pid);
    const points = weeklyPointsForPlayer(pid, rules, week, season);
    const injury = week == null ? "HEALTHY" : getInjuryStatusKey(player, week);
    // Generated regardless of injury status -- an OUT/IR starter still
    // gets a box score (their fantasy points are zeroed separately,
    // above; the box score isn't gated on whether they "played").
    let boxScore = null;
    if (week != null) {
      const multiplier = weeklyVarianceMultiplier(pid, week);
      const resolved = resolvePlayerSeason(pid, rules, season);
      boxScore = generateBoxScore(player, resolved?.season, multiplier, pid, week);
    }
    return { playerId: pid, name: player.name, position: player.position, points, injury, boxScore };
  });
  let total = round1(breakdown.reduce((sum, b) => sum + b.points, 0));

  const coachSlot = team.roster.find((s) => s.slot === "COACH" && s.playerId);
  let coachBonus = null;
  const rate = rules.coachBonusRate || 0;
  if (coachSlot && rate) {
    const coachPlayer = getPlayerById(coachSlot.playerId);
    const amount = round1(total * rate);
    total = round1(total + amount);
    coachBonus = { coachName: coachPlayer.name, amount, rate };
  }

  return { total, breakdown, coachBonus };
}

function updateStandings(standings, aId, bId, scoreA, scoreB, winnerId) {
  const sa = standings[aId];
  const sb = standings[bId];
  sa.pointsFor = round1(sa.pointsFor + scoreA);
  sa.pointsAgainst = round1(sa.pointsAgainst + scoreB);
  sb.pointsFor = round1(sb.pointsFor + scoreB);
  sb.pointsAgainst = round1(sb.pointsAgainst + scoreA);
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

export function isRegularSeasonComplete(season) {
  return season.currentWeek >= season.regularSeasonWeeks;
}

function advanceRegularSeasonWeek(season, draft, rules, weekIndex) {
  const week = weekIndex + 1;
  const pairs = season.schedule[weekIndex] || [];
  const teamsById = Object.fromEntries(draft.teams.map((t) => [t.id, t]));
  const byeTeamIds = draft.teams
    .map((t) => t.id)
    .filter((id) => !pairs.some((pair) => pair.includes(id)));

  const matchups = pairs.map(([aId, bId]) => {
    const scoreA = computeTeamWeekScore(teamsById[aId], rules, week, season);
    const scoreB = computeTeamWeekScore(teamsById[bId], rules, week, season);
    let winnerId = null;
    if (scoreA.total > scoreB.total) winnerId = aId;
    else if (scoreB.total > scoreA.total) winnerId = bId;
    updateStandings(season.standings, aId, bId, scoreA.total, scoreB.total, winnerId);
    return { teamIds: [aId, bId], scores: { [aId]: scoreA, [bId]: scoreB }, winnerId };
  });

  season.weeklyResults.push({ week, round: "regular", matchups, byeTeamIds });
}

// One playoff game: computes both scores, picks a winner (ties broken
// toward `aId` -- vanishingly rare given fractional scoring, but a
// single-elimination bracket needs a winner to advance either way),
// and -- when `resultKey` is given -- stashes the result on
// season.playoffs.results so a later round (the championship) can look
// up who advanced. Deliberately does NOT call updateStandings(): the
// regular-season win/loss record stays exactly as it was when the
// regular season ended.
function playPlayoffMatchup(season, teamsById, rules, week, aId, bId, resultKey) {
  const scoreA = computeTeamWeekScore(teamsById[aId], rules, week, season);
  const scoreB = computeTeamWeekScore(teamsById[bId], rules, week, season);
  const winnerId = scoreB.total > scoreA.total ? bId : aId;
  const loserId = winnerId === aId ? bId : aId;
  const result = { teamIds: [aId, bId], scores: { [aId]: scoreA, [bId]: scoreB }, winnerId, loserId };
  if (resultKey) season.playoffs.results[resultKey] = result;
  return result;
}

function seedPlayoffs(season, draft) {
  const seeds = getStandingsList(season, draft)
    .slice(0, Math.min(4, draft.teams.length))
    .map((s) => s.teamId);
  season.playoffs = { bracketSize: seeds.length, seeds, results: {} };
}

function advancePlayoffWeek(season, draft, rules, weekIndex) {
  const week = weekIndex + 1;
  if (!season.playoffs) seedPlayoffs(season, draft);
  const { bracketSize, seeds } = season.playoffs;
  const teamsById = Object.fromEntries(draft.teams.map((t) => [t.id, t]));
  const playoffWeekNum = weekIndex - season.regularSeasonWeeks; // 0-based within the playoffs
  const nonPlayoffTeamIds = draft.teams.map((t) => t.id).filter((id) => !seeds.includes(id));

  let matchups;
  let roundLabel;

  if (bracketSize >= 4) {
    if (playoffWeekNum === 0) {
      roundLabel = "Semifinal";
      matchups = [
        playPlayoffMatchup(season, teamsById, rules, week, seeds[0], seeds[3], "semi1"),
        playPlayoffMatchup(season, teamsById, rules, week, seeds[1], seeds[2], "semi2"),
      ];
    } else {
      roundLabel = "Championship";
      const { semi1, semi2 } = season.playoffs.results;
      const champ = playPlayoffMatchup(season, teamsById, rules, week, semi1.winnerId, semi2.winnerId, "championship");
      const third = playPlayoffMatchup(season, teamsById, rules, week, semi1.loserId, semi2.loserId, "thirdPlace");
      matchups = [champ, third];
      season.championId = champ.winnerId;
    }
  } else {
    roundLabel = "Championship";
    const champ = playPlayoffMatchup(season, teamsById, rules, week, seeds[0], seeds[1], "championship");
    matchups = [champ];
    season.championId = champ.winnerId;
  }

  season.weeklyResults.push({ week, round: "playoff", roundLabel, matchups, byeTeamIds: nonPlayoffTeamIds });
}

export function advanceWeek(season, draft, rules) {
  if (isSeasonComplete(season)) return season;
  const weekIndex = season.currentWeek;
  if (weekIndex < season.regularSeasonWeeks) {
    advanceRegularSeasonWeek(season, draft, rules, weekIndex);
  } else {
    advancePlayoffWeek(season, draft, rules, weekIndex);
  }
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
