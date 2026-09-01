// Real (not simulated) per-week box scores. Empty seam for now -- no
// real game logs have been sourced yet (this environment can't reach
// stats sites; see the FAQ). Add them here piecemeal as they become
// available, keyed by player id, then week number:
//
//   export const REAL_BOX_SCORES = {
//     "jerry-rice": {
//       3: { passYds: 0, rushYds: 0, receptions: 11, recYds: 189, recTD: 2, fumbles: 0 },
//     },
//   };
//
// js/boxScore.js checks here first and uses this over the simulated
// number whenever a player+week entry exists -- nothing else needs to
// change.
export const REAL_BOX_SCORES = {};
