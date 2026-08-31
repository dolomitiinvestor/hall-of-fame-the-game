// NFL schedule for the Season screen: real data where available,
// algorithmically generated round-robin pairing everywhere else.
// See js/data/realNflSchedule.js for what "real" currently covers
// (just Week 1) and why, and js/data/nflTeams.js for the disclaimer
// on the generated portion.

import { generateSchedule } from "./schedule.js";
import { NFL_TEAMS } from "./data/nflTeams.js";
import { REAL_SCHEDULE } from "./data/realNflSchedule.js";

export function getNflSchedule(weeks = 16) {
  const codes = NFL_TEAMS.map((t) => t.code);
  const rounds = generateSchedule(codes, weeks);
  return rounds.map((pairs, weekIdx) => {
    const week = weekIdx + 1;
    if (REAL_SCHEDULE[week]) return REAL_SCHEDULE[week];
    // Alternate home/away deterministically so it isn't always the
    // same side of the pair sitting at home all season.
    return pairs.map(([a, b], pairIdx) => {
      const aIsHome = (weekIdx + pairIdx) % 2 === 0;
      return { home: aIsHome ? a : b, away: aIsHome ? b : a };
    });
  });
}

export function isRealWeek(week) {
  return !!REAL_SCHEDULE[week];
}
