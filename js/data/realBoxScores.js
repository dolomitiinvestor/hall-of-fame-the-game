// Real (not simulated) per-game logs for players with sourced box
// scores. Empty for most players today -- add them here piecemeal as
// they become sourceable, keyed by player id, then season year, then
// an array of that year's games *in the order actually played* (bye
// weeks skipped, not zero-filled). A player id can carry more than one
// archived year; season.js picks one at random each time a fantasy
// season starts, then shuffles that year's games onto the fantasy
// schedule -- so this file only needs to supply the raw per-game
// counting stats, not which fantasy week they land on.
//
// Stat field names match player.seasons[].stats (js/data/players.js)
// so calculateFantasyPoints() (scoring.js) scores a real game exactly
// like a season total: rec, recYds, recTD, rushAtt, rushYds, rushTD,
// passYds, passTD, passInt, fumblesLost. `rushAtt` is display-only
// (carries shown in the box score) -- it's not part of the scoring
// formula. Omit any field that's 0/didn't happen that game.
//
// Also add a matching { year, ... } entry to that player's `seasons`
// array in js/data/players.js -- this file supplies the week-by-week
// detail underneath that season, not a replacement for it.
//
//   export const REAL_GAME_LOGS = {
//     "jerry-rice": {
//       1990: [
//         { rec: 5, recYds: 60, recTD: 1 },
//         { rec: 4, recYds: 72, recTD: 0 },
//         // ...one entry per game, in season order
//       ],
//     },
//   };
export const REAL_GAME_LOGS = {
  "isaac-bruce": {
    2000: [
      { rec: 4, recYds: 60, recTD: 0 }, // Wk1 @DEN
      { rec: 6, recYds: 97, recTD: 0 }, // Wk2 @SEA
      { rec: 8, recYds: 188, recTD: 1 }, // Wk3 vs SFO
      { rec: 3, recYds: 92, recTD: 2 }, // Wk4 vs ATL
      { rec: 9, recYds: 167, recTD: 2 }, // Wk5 vs SDG
      { rec: 3, recYds: 88, recTD: 0 }, // Wk7 vs ATL
      { rec: 8, recYds: 129, recTD: 2 }, // Wk8 @KAN
      { rec: 8, recYds: 129, recTD: 0 }, // Wk9 @SFO
      { rec: 7, recYds: 69, recTD: 1, fumblesLost: 1 }, // Wk10 vs CAR
      { rec: 4, recYds: 75, recTD: 1 }, // Wk11 vs NYG
      { rec: 5, recYds: 91, recTD: 0 }, // Wk12 @WAS
      { rec: 4, recYds: 59, recTD: 0 }, // Wk13 @NOR
      { rec: 6, recYds: 74, recTD: 0 }, // Wk14 @CAR
      { rec: 7, recYds: 74, recTD: 0 }, // Wk15 vs MIN
      { rec: 3, recYds: 36, recTD: 0, rushAtt: 1, rushYds: 11 }, // Wk16 @TAM
      { rec: 2, recYds: 43, recTD: 0 }, // Wk17 @NOR
    ],
  },
};
