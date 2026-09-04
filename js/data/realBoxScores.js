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
  "antonio-brown": {
    2014: [
      { rec: 5, recYds: 116, recTD: 1 }, // Wk1 vs CLE
      { rushAtt: 2, rushYds: 10, rec: 7, recYds: 90, recTD: 0 }, // Wk2 @BAL
      { rec: 10, recYds: 90, recTD: 2 }, // Wk3 @CAR
      { rec: 7, recYds: 131, recTD: 2, passYds: 17 }, // Wk4 vs TAM
      { rec: 5, recYds: 84, recTD: 0 }, // Wk5 @JAX
      { rushAtt: 1, rushYds: -2, rec: 7, recYds: 118, recTD: 0 }, // Wk6 @CLE
      { rec: 9, recYds: 90, recTD: 0, passYds: 3, passTD: 1 }, // Wk7 vs HOU
      { rushAtt: 1, rushYds: 5, rec: 10, recYds: 133, recTD: 2 }, // Wk8 vs IND
      { rec: 11, recYds: 144, recTD: 1 }, // Wk9 vs BAL
      { rec: 8, recYds: 74, recTD: 0, fumblesLost: 2 }, // Wk10 @NYJ
      { rec: 9, recYds: 91, recTD: 1 }, // Wk11 @TEN
      // Wk12: bye
      { rec: 8, recYds: 97, recTD: 2 }, // Wk13 vs NOR
      { rec: 9, recYds: 117, recTD: 0 }, // Wk14 @CIN
      { rec: 10, recYds: 123, recTD: 0 }, // Wk15 @ATL
      { rec: 7, recYds: 72, recTD: 1 }, // Wk16 vs KAN
      { rec: 7, recYds: 128, recTD: 1 }, // Wk17 vs CIN
    ],
  },
  "tom-brady": {
    2007: [
      { rushAtt: 1, rushYds: 4, rushTD: 0, passYds: 297, passTD: 3 }, // Wk1 @NYJ
      { rushAtt: 1, rushYds: 2, rushTD: 0, passYds: 279, passTD: 3, passInt: 1 }, // Wk2 vs SDG
      { rushAtt: 1, rushYds: 2, rushTD: 0, passYds: 311, passTD: 4, fumblesLost: 1 }, // Wk3 vs BUF
      { rushAtt: 2, rushYds: -2, rushTD: 0, passYds: 231, passTD: 3, passInt: 1 }, // Wk4 @CIN
      { passYds: 265, passTD: 3 }, // Wk5 vs CLE
      { rushAtt: 3, rushYds: 5, rushTD: 0, passYds: 388, passTD: 5, fumblesLost: 1 }, // Wk6 @DAL
      { passYds: 354, passTD: 6 }, // Wk7 @MIA
      { rushAtt: 4, rushYds: 14, rushTD: 2, passYds: 306, passTD: 3, fumblesLost: 1 }, // Wk8 vs WAS
      { rushAtt: 5, rushYds: 14, rushTD: 0, passYds: 255, passTD: 3, passInt: 2 }, // Wk9 @IND
      { rushAtt: 2, rushYds: 9, rushTD: 0, passYds: 373, passTD: 5 }, // Wk11 @BUF
      { rushAtt: 3, rushYds: 16, rushTD: 0, passYds: 380, passTD: 1 }, // Wk12 vs PHI
      { rushAtt: 2, rushYds: 14, rushTD: 0, passYds: 257, passTD: 2, passInt: 1 }, // Wk13 @BAL
      { rushAtt: 1, rushYds: 4, rushTD: 0, passYds: 399, passTD: 4 }, // Wk14 vs PIT
      { rushAtt: 4, rushYds: 9, rushTD: 0, passYds: 140, passInt: 1 }, // Wk15 vs NYJ
      { rushAtt: 4, rushYds: 11, rushTD: 0, passYds: 215, passTD: 3, passInt: 2, fumblesLost: 1 }, // Wk16 vs MIA
      { rushAtt: 4, rushYds: -4, rushTD: 0, passYds: 356, passTD: 2 }, // Wk17 @NYG
    ],
  },
  "andre-reed": {
    1989: [
      { rec: 6, recYds: 58, recTD: 0 }, // Wk1 @MIA
      { rec: 13, recYds: 157, recTD: 0 }, // Wk2 vs DEN
      { rec: 5, recYds: 135, recTD: 2 }, // Wk3 @HOU (OT)
      { rec: 4, recYds: 114, recTD: 0 }, // Wk4 vs NWE
      { rec: 7, recYds: 75, recTD: 1 }, // Wk5 @IND
      { rec: 8, recYds: 106, recTD: 1 }, // Wk6 vs RAM
      { rec: 5, recYds: 58, recTD: 1 }, // Wk7 vs NYJ
      {}, // Wk8 vs MIA (0 catches on 2 targets)
      { rec: 5, recYds: 100, recTD: 0 }, // Wk9 @ATL
      { rec: 6, recYds: 76, recTD: 2 }, // Wk10 vs IND
      { rec: 6, recYds: 107, recTD: 0 }, // Wk11 @NWE
      { rushAtt: 1, rushYds: 23, rushTD: 0, rec: 1, recYds: 19, recTD: 1 }, // Wk12 vs CIN
      { rec: 2, recYds: 77, recTD: 1 }, // Wk13 @SEA
      { rec: 4, recYds: 35, recTD: 0 }, // Wk14 vs NOR
      { rec: 10, recYds: 115, recTD: 0 }, // Wk15 @SFO
      { rushAtt: 1, rushYds: 8, rushTD: 0, rec: 6, recYds: 80, recTD: 0 }, // Wk16 @NYJ
    ],
  },
  "barry-sanders": {
    1997: [
      { rushAtt: 15, rushYds: 33, rushTD: 0, rec: 2, recYds: 26, recTD: 0 }, // Wk1 vs ATL
      { rushAtt: 10, rushYds: 20, rushTD: 0, rec: 8, recYds: 102, recTD: 1 }, // Wk2 vs TAM
      { rushAtt: 19, rushYds: 161, rushTD: 0, rec: 1, recYds: 3, recTD: 0 }, // Wk3 @CHI
      { rushAtt: 18, rushYds: 113, rushTD: 0, rec: 1, recYds: 17, recTD: 1 }, // Wk4 @NOR
      { rushAtt: 28, rushYds: 139, rushTD: 0, rec: 1, recYds: 20, recTD: 0 }, // Wk5 vs GNB
      { rushAtt: 25, rushYds: 107, rushTD: 0, rec: 2, recYds: -1, recTD: 0 }, // Wk6 @BUF
      { rushAtt: 24, rushYds: 215, rushTD: 2, rec: 1, recYds: 7, recTD: 1, fumblesLost: 1 }, // Wk7 @TAM
      { rushAtt: 24, rushYds: 105, rushTD: 1, rec: 2, recYds: 21, recTD: 0 }, // Wk8 vs NYG (OT)
      // Wk9: bye
      { rushAtt: 23, rushYds: 105, rushTD: 0 }, // Wk10 @GNB
      { rushAtt: 15, rushYds: 105, rushTD: 1, rec: 1, recYds: 9, recTD: 0, fumblesLost: 1 }, // Wk11 @WAS
      { rushAtt: 19, rushYds: 108, rushTD: 0, rec: 1, recYds: 34, recTD: 0 }, // Wk12 vs MIN
      { rushAtt: 24, rushYds: 216, rushTD: 2, rec: 2, recYds: 10, recTD: 0 }, // Wk13 vs IND
      { rushAtt: 19, rushYds: 167, rushTD: 3, rec: 2, recYds: 8, recTD: 0 }, // Wk14 vs CHI
      { rushAtt: 30, rushYds: 137, rushTD: 1, rec: 1, recYds: 2, recTD: 0 }, // Wk15 @MIA
      { rushAtt: 19, rushYds: 138, rushTD: 0, rec: 5, recYds: 37, recTD: 0 }, // Wk16 @MIN
      { rushAtt: 23, rushYds: 184, rushTD: 1, rec: 3, recYds: 10, recTD: 0 }, // Wk17 vs NYJ
    ],
  },
  "brett-favre": {
    1995: [
      { rushAtt: 4, rushYds: 27, rushTD: 0, passYds: 299, passTD: 2, passInt: 3 }, // Wk1 vs STL
      { rushAtt: 4, rushYds: 7, rushTD: 0, passYds: 312, passTD: 3, passInt: 1 }, // Wk2 @CHI
      { rushAtt: 1, rushYds: -2, rushTD: 0, passYds: 141, passTD: 2 }, // Wk3 vs NYG
      { rushAtt: 2, rushYds: 39, rushTD: 0, passYds: 202, passTD: 2, passInt: 1 }, // Wk4 @JAX
      { rushAtt: 2, rushYds: 25, rushTD: 2, passYds: 295, passTD: 1, passInt: 1 }, // Wk6 @DAL
      { rushAtt: 5, rushYds: 12, rushTD: 0, passYds: 342, passTD: 2 }, // Wk7 vs DET
      { rushAtt: 1, rushYds: 4, rushTD: 0, passYds: 295, passTD: 4 }, // Wk8 vs MIN
      { rushAtt: 1, rushYds: 12, rushTD: 0, passYds: 304, passTD: 1, passInt: 3, fumblesLost: 1 }, // Wk9 @DET
      { rushAtt: 1, rushYds: 2, rushTD: 0, passYds: 177, passInt: 2, fumblesLost: 1 }, // Wk10 @MIN
      { rushAtt: 1, rushYds: 2, rushTD: 0, passYds: 336, passTD: 5 }, // Wk11 vs CHI
      { rushAtt: 5, rushYds: -1, rushTD: 1, passYds: 210, passTD: 3, fumblesLost: 1 }, // Wk12 @CLE
      { rushAtt: 2, rushYds: 18, rushTD: 0, passYds: 267, passTD: 3 }, // Wk13 vs TAM
      { rushAtt: 6, rushYds: 15, rushTD: 0, passYds: 339, passTD: 3, passInt: 1 }, // Wk14 vs CIN
      { passYds: 285, passTD: 1, passInt: 1 }, // Wk15 @TAM (OT)
      { rushAtt: 1, rushYds: 15, rushTD: 0, passYds: 308, passTD: 4 }, // Wk16 @NOR
      { rushAtt: 3, rushYds: 6, rushTD: 0, passYds: 301, passTD: 2, fumblesLost: 1 }, // Wk17 vs PIT
    ],
  },
};
