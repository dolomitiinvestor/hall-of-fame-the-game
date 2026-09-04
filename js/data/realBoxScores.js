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
  "calvin-johnson": {
    2012: [
      { rec: 6, recYds: 111, recTD: 0 }, // Wk1 vs STL
      { rec: 8, recYds: 94, recTD: 0 }, // Wk2 @SFO
      { rec: 10, recYds: 164, recTD: 1 }, // Wk3 @TEN (OT)
      { rec: 5, recYds: 54, recTD: 0 }, // Wk4 vs MIN
      { rec: 6, recYds: 135, recTD: 0 }, // Wk6 @PHI (OT)
      { rec: 3, recYds: 34, recTD: 0 }, // Wk7 @CHI
      { rec: 3, recYds: 46, recTD: 0 }, // Wk8 vs SEA
      { rec: 7, recYds: 129, recTD: 0 }, // Wk9 @JAX
      { rec: 12, recYds: 207, recTD: 1, fumblesLost: 1 }, // Wk10 @MIN
      { rec: 5, recYds: 143, recTD: 1, fumblesLost: 1 }, // Wk11 vs GNB
      { rec: 8, recYds: 140, recTD: 1 }, // Wk12 vs HOU (OT)
      { rec: 13, recYds: 171, recTD: 1 }, // Wk13 vs IND
      { rec: 10, recYds: 118, recTD: 1 }, // Wk14 @GNB
      { rec: 10, recYds: 121, recTD: 0 }, // Wk15 @ARI
      { rec: 11, recYds: 225, recTD: 0, fumblesLost: 1 }, // Wk16 vs ATL
      { rec: 5, recYds: 72, recTD: 0 }, // Wk17 @CHI
    ],
  },
  "ladainian-tomlinson": {
    2006: [
      { rushAtt: 31, rushYds: 131, rushTD: 1, rec: 3, recYds: 18, recTD: 0 }, // Wk1 @OAK
      { rushAtt: 19, rushYds: 71, rushTD: 2, rec: 7, recYds: 51, recTD: 0 }, // Wk2 vs TEN
      { rushAtt: 26, rushYds: 98, rushTD: 0, rec: 1, recYds: 7, recTD: 0 }, // Wk4 @BAL
      { rushAtt: 13, rushYds: 36, rushTD: 0, rec: 8, recYds: 34, recTD: 0 }, // Wk5 vs PIT
      { rushAtt: 21, rushYds: 71, rushTD: 4, rec: 7, recYds: 64, recTD: 0 }, // Wk6 @SFO
      { rushAtt: 15, rushYds: 66, rushTD: 0, rec: 6, recYds: 72, recTD: 1, passYds: 1, passTD: 1, fumblesLost: 1 }, // Wk7 @KAN
      { rushAtt: 25, rushYds: 183, rushTD: 2, rec: 3, recYds: 57, recTD: 1 }, // Wk8 vs STL
      { rushAtt: 18, rushYds: 172, rushTD: 3, rec: 3, recYds: 20, recTD: 0 }, // Wk9 vs CLE
      { rushAtt: 22, rushYds: 104, rushTD: 4, rec: 6, recYds: 54, recTD: 0 }, // Wk10 @CIN
      { rushAtt: 20, rushYds: 105, rushTD: 3, rec: 3, recYds: 74, recTD: 1 }, // Wk11 @DEN
      { rushAtt: 19, rushYds: 109, rushTD: 2, rec: 1, recYds: 5, recTD: 0, passYds: 19, passTD: 1 }, // Wk12 vs OAK
      { rushAtt: 28, rushYds: 178, rushTD: 2, rec: 3, recYds: 14, recTD: 0 }, // Wk13 @BUF
      { rushAtt: 28, rushYds: 103, rushTD: 3, rec: 1, recYds: 9, recTD: 0 }, // Wk14 vs DEN
      { rushAtt: 25, rushYds: 199, rushTD: 2, rec: 1, recYds: 5, recTD: 0 }, // Wk15 vs KAN
      { rushAtt: 22, rushYds: 123, rushTD: 0, rec: 1, recYds: 10, recTD: 0 }, // Wk16 @SEA
      { rushAtt: 16, rushYds: 66, rushTD: 0, rec: 2, recYds: 14, recTD: 0 }, // Wk17 vs ARI
    ],
  },
  "marshall-faulk": {
    2001: [
      { rushAtt: 20, rushYds: 72, rushTD: 1, rec: 8, recYds: 48, recTD: 0 }, // Wk1 @PHI (OT)
      { rushAtt: 18, rushYds: 105, rushTD: 0, rec: 8, recYds: 79, recTD: 0 }, // Wk2 @SFO
      { rushAtt: 19, rushYds: 88, rushTD: 1, rec: 6, recYds: 72, recTD: 2 }, // Wk3 vs MIA
      { rushAtt: 14, rushYds: 71, rushTD: 1, rec: 9, recYds: 80, recTD: 0, fumblesLost: 1 }, // Wk4 @DET
      { rushAtt: 8, rushYds: 25, rushTD: 0, rec: 5, recYds: 38, recTD: 0, fumblesLost: 2 }, // Wk5 vs NYG
      // Wk6 @NYJ, Wk7 vs NOR: inactive, skipped
      { rushAtt: 15, rushYds: 183, rushTD: 2, rec: 4, recYds: 14, recTD: 0 }, // Wk9 vs CAR
      { rushAtt: 20, rushYds: 83, rushTD: 0, rec: 7, recYds: 70, recTD: 1 }, // Wk10 @NWE
      { rushAtt: 12, rushYds: 55, rushTD: 0, rec: 2, recYds: 11, recTD: 0 }, // Wk11 vs TAM
      { rushAtt: 12, rushYds: 70, rushTD: 0, rec: 6, recYds: 128, recTD: 3 }, // Wk12 @ATL
      { rushAtt: 25, rushYds: 88, rushTD: 1, rec: 5, recYds: 19, recTD: 1 }, // Wk13 vs SFO
      { rushAtt: 22, rushYds: 54, rushTD: 0, rec: 8, recYds: 51, recTD: 1 }, // Wk14 @NOR
      { rushAtt: 30, rushYds: 202, rushTD: 2, rec: 3, recYds: 50, recTD: 0 }, // Wk15 @CAR
      { rushAtt: 25, rushYds: 118, rushTD: 3, rec: 7, recYds: 47, recTD: 1 }, // Wk16 vs IND
      { rushAtt: 20, rushYds: 168, rushTD: 1, rec: 5, recYds: 58, recTD: 0 }, // Wk17 vs ATL
    ],
  },
};
