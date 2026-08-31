// Generated NFL schedule (who plays whom, and who's home) for the
// Season screen. Reuses the same round-robin generator as the fantasy
// league schedule -- see schedule.js for the algorithm and js/data/nflTeams.js
// for the disclaimer that this isn't a real published schedule.

import { generateSchedule } from "./schedule.js";
import { NFL_TEAMS } from "./data/nflTeams.js";

export function getNflSchedule(weeks = 16) {
  const codes = NFL_TEAMS.map((t) => t.code);
  const rounds = generateSchedule(codes, weeks);
  return rounds.map((pairs, weekIdx) =>
    pairs.map(([a, b], pairIdx) => {
      // Alternate home/away deterministically so it isn't always the
      // same side of the pair sitting at home all season.
      const aIsHome = (weekIdx + pairIdx) % 2 === 0;
      return { home: aIsHome ? a : b, away: aIsHome ? b : a };
    })
  );
}
