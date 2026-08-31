// NFL schedule for the Games tab: the real 2026 season for every week
// the fantasy season covers (1-16 -- see js/data/realNflSchedule.js).
// The generated round-robin fallback stays in place as the seam for a
// future season before its real schedule is entered.

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
