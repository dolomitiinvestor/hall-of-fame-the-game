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
  "le-veon-bell": {
    2014: [
      { rushAtt: 21, rushYds: 109, rushTD: 1, rec: 6, recYds: 88, recTD: 0 }, // Wk1 vs CLE
      { rushAtt: 11, rushYds: 59, rushTD: 0, rec: 5, recYds: 48, recTD: 0 }, // Wk2 @BAL
      { rushAtt: 21, rushYds: 147, rushTD: 0, rec: 2, recYds: 10, recTD: 0 }, // Wk3 @CAR
      { rushAtt: 19, rushYds: 63, rushTD: 0, rec: 6, recYds: 46, recTD: 0 }, // Wk4 vs TAM
      { rushAtt: 15, rushYds: 82, rushTD: 0, rec: 5, recYds: 36, recTD: 0 }, // Wk5 @JAX
      { rushAtt: 18, rushYds: 82, rushTD: 0, rec: 4, recYds: 23, recTD: 0 }, // Wk6 @CLE
      { rushAtt: 12, rushYds: 57, rushTD: 0, rec: 8, recYds: 88, recTD: 1 }, // Wk7 vs HOU
      { rushAtt: 24, rushYds: 92, rushTD: 0, rec: 6, recYds: 56, recTD: 0 }, // Wk8 vs IND
      { rushAtt: 10, rushYds: 20, rushTD: 0, rec: 5, recYds: 38, recTD: 1 }, // Wk9 vs BAL
      { rushAtt: 11, rushYds: 36, rushTD: 0, rec: 8, recYds: 33, recTD: 0 }, // Wk10 @NYJ
      { rushAtt: 33, rushYds: 204, rushTD: 1, rec: 2, recYds: 18, recTD: 0 }, // Wk11 @TEN
      { rushAtt: 21, rushYds: 95, rushTD: 1, rec: 8, recYds: 159, recTD: 0 }, // Wk13 vs NOR
      { rushAtt: 26, rushYds: 185, rushTD: 2, rec: 6, recYds: 50, recTD: 1 }, // Wk14 @CIN
      { rushAtt: 20, rushYds: 47, rushTD: 2, rec: 5, recYds: 72, recTD: 0 }, // Wk15 @ATL
      { rushAtt: 20, rushYds: 63, rushTD: 1, rec: 1, recYds: 9, recTD: 0 }, // Wk16 vs KAN
      { rushAtt: 8, rushYds: 20, rushTD: 0, rec: 6, recYds: 80, recTD: 0 }, // Wk17 vs CIN
    ],
    2017: [
      { rushAtt: 10, rushYds: 32, rushTD: 0, rec: 3, recYds: 15, recTD: 0 }, // Wk1 @CLE
      { rushAtt: 27, rushYds: 87, rushTD: 0, rec: 4, recYds: 4, recTD: 0 }, // Wk2 vs MIN
      { rushAtt: 15, rushYds: 61, rushTD: 1, rec: 6, recYds: 37, recTD: 0 }, // Wk3 @CHI (OT)
      { rushAtt: 35, rushYds: 144, rushTD: 2, rec: 4, recYds: 42, recTD: 0 }, // Wk4 @BAL
      { rushAtt: 15, rushYds: 47, rushTD: 0, rec: 10, recYds: 46, recTD: 0 }, // Wk5 vs JAX
      { rushAtt: 32, rushYds: 179, rushTD: 1, rec: 3, recYds: 12, recTD: 0 }, // Wk6 @KAN
      { rushAtt: 35, rushYds: 134, rushTD: 0, rec: 3, recYds: 58, recTD: 0 }, // Wk7 vs CIN
      { rushAtt: 25, rushYds: 76, rushTD: 1, rec: 2, recYds: 5, recTD: 0, fumblesLost: 1 }, // Wk8 @DET
      { rushAtt: 26, rushYds: 80, rushTD: 0, rec: 5, recYds: 32, recTD: 0 }, // Wk10 @IND
      { rushAtt: 12, rushYds: 46, rushTD: 0, rec: 9, recYds: 57, recTD: 0 }, // Wk11 vs TEN
      { rushAtt: 20, rushYds: 95, rushTD: 0, rec: 12, recYds: 88, recTD: 1, fumblesLost: 1 }, // Wk12 vs GNB
      { rushAtt: 18, rushYds: 76, rushTD: 0, rec: 5, recYds: 106, recTD: 1 }, // Wk13 @CIN
      { rushAtt: 13, rushYds: 48, rushTD: 2, rec: 9, recYds: 77, recTD: 1 }, // Wk14 vs BAL
      { rushAtt: 24, rushYds: 117, rushTD: 1, rec: 5, recYds: 48, recTD: 0 }, // Wk15 vs NWE
      { rushAtt: 14, rushYds: 69, rushTD: 1, rec: 5, recYds: 28, recTD: 0 }, // Wk16 @HOU
    ],
  },
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
  "matt-hasselbeck": {
    2003: [
      { rushAtt: 4, rushYds: 11, rushTD: 0, passYds: 137, passTD: 2 }, // Wk1 vs NOR
      { rushAtt: 1, rushYds: 2, rushTD: 1, passYds: 175, passTD: 2 }, // Wk2 @ARI
      { rushAtt: 5, rushYds: 28, rushTD: 0, passYds: 256, passTD: 2, passInt: 1 }, // Wk3 vs STL
      { rushAtt: 1, rushYds: 7, rushTD: 0, passYds: 225, passInt: 1 }, // Wk5 @GNB
      { rushAtt: 5, rushYds: 17, rushTD: 0, passYds: 207, passTD: 1, passInt: 1 }, // Wk6 vs SFO
      { rushAtt: 4, rushYds: 12, rushTD: 0, passYds: 215, passTD: 1, passInt: 1 }, // Wk7 vs CHI
      { rushAtt: 1, rushYds: 11, rushTD: 0, passYds: 344, passTD: 3, passInt: 3 }, // Wk8 @CIN
      { rushAtt: 2, rushYds: 3, rushTD: 0, passYds: 215, passTD: 1 }, // Wk9 vs PIT
      { rushAtt: 1, rushYds: 1, rushTD: 0, passYds: 241, passTD: 1, passInt: 1 }, // Wk10 @WAS
      { rushAtt: 3, rushYds: 15, rushTD: 1, passYds: 207, passTD: 1 }, // Wk11 vs DET
      { rushAtt: 3, rushYds: 26, rushTD: 0, passYds: 333, passTD: 5, fumblesLost: 1 }, // Wk12 @BAL (OT)
      { passYds: 328, passTD: 3, passInt: 1 }, // Wk13 vs CLE
      { passYds: 218, passInt: 2 }, // Wk14 @MIN
      { passYds: 246, passTD: 1, passInt: 1 }, // Wk15 @STL
      { rushAtt: 3, rushYds: -5, rushTD: 0, passYds: 179, passTD: 1, passInt: 1 }, // Wk16 vs ARI
      { rushAtt: 3, rushYds: -3, rushTD: 0, passYds: 315, passTD: 2, passInt: 2 }, // Wk17 @SFO
    ],
  },
  "earl-campbell": {
    1980: [
      { rushAtt: 13, rushYds: 57, rushTD: 1, rec: 4, recYds: 24, recTD: 0, passYds: 57, passTD: 1 }, // Wk1 @PIT
      { rushAtt: 18, rushYds: 106, rushTD: 0, rec: 1, recYds: 8, recTD: 0 }, // Wk2 @CLE
      { rushAtt: 7, rushYds: 11, rushTD: 1 }, // Wk3 vs BAL
      { rushAtt: 12, rushYds: 50, rushTD: 0, rec: 2, recYds: -2, recTD: 0 }, // Wk5 vs SEA
      { rushAtt: 38, rushYds: 178, rushTD: 1 }, // Wk6 @KAN
      { rushAtt: 33, rushYds: 203, rushTD: 0, rec: 1, recYds: 8, recTD: 0 }, // Wk7 vs TAM
      { rushAtt: 27, rushYds: 202, rushTD: 2 }, // Wk8 vs CIN
      { rushAtt: 36, rushYds: 157, rushTD: 2 }, // Wk9 @DEN
      { rushAtt: 30, rushYds: 130, rushTD: 2 }, // Wk10 vs NWE
      { rushAtt: 31, rushYds: 206, rushTD: 0 }, // Wk11 @CHI
      { rushAtt: 15, rushYds: 60, rushTD: 0, rec: 1, recYds: 8, recTD: 0 }, // Wk12 @NYJ (OT)
      { rushAtt: 27, rushYds: 109, rushTD: 1, rec: 1, recYds: 2, recTD: 0 }, // Wk13 vs CLE
      { rushAtt: 21, rushYds: 81, rushTD: 0 }, // Wk14 vs PIT
      { rushAtt: 36, rushYds: 181, rushTD: 2 }, // Wk15 @GNB
      { rushAtt: 29, rushYds: 203, rushTD: 1, rec: 1, recYds: -1, recTD: 0 }, // Wk16 vs MIN
    ],
  },
  "marcus-allen": {
    1985: [
      { rushAtt: 20, rushYds: 76, rushTD: 2, rec: 2, recYds: 30, recTD: 0, passYds: 16 }, // Wk1 vs NYJ
      { rushAtt: 14, rushYds: 50, rushTD: 0, rec: 6, recYds: 27, recTD: 0 }, // Wk2 @KAN
      { rushAtt: 12, rushYds: 59, rushTD: 0, rec: 8, recYds: 53, recTD: 0 }, // Wk3 vs SFO
      { rushAtt: 21, rushYds: 98, rushTD: 0, rec: 3, recYds: 30, recTD: 0 }, // Wk4 @NWE
      { rushAtt: 29, rushYds: 126, rushTD: 0, rec: 3, recYds: 24, recTD: 0 }, // Wk5 vs KAN
      { rushAtt: 28, rushYds: 107, rushTD: 2, rec: 3, recYds: 51, recTD: 0 }, // Wk6 vs NOR
      { rushAtt: 20, rushYds: 81, rushTD: 0, rec: 3, recYds: 41, recTD: 1 }, // Wk7 @CLE
      { rushAtt: 30, rushYds: 111, rushTD: 3, rec: 3, recYds: 24, recTD: 0 }, // Wk8 vs SDG
      { rushAtt: 19, rushYds: 101, rushTD: 0, rec: 5, recYds: 49, recTD: 0 }, // Wk9 @SEA
      { rushAtt: 28, rushYds: 119, rushTD: 1, rec: 5, recYds: 30, recTD: 0 }, // Wk10 @SDG (OT)
      { rushAtt: 31, rushYds: 135, rushTD: 0, rec: 6, recYds: 54, recTD: 1 }, // Wk11 vs CIN
      { rushAtt: 24, rushYds: 173, rushTD: 1, rec: 4, recYds: 49, recTD: 0 }, // Wk12 vs DEN (OT)
      { rushAtt: 28, rushYds: 156, rushTD: 0, rec: 2, recYds: 42, recTD: 1 }, // Wk13 @ATL
      { rushAtt: 25, rushYds: 135, rushTD: 1, rec: 5, recYds: 21, recTD: 0 }, // Wk14 @DEN (OT)
      { rushAtt: 27, rushYds: 109, rushTD: 1, rec: 1, recYds: 5, recTD: 0 }, // Wk15 vs SEA
      { rushAtt: 24, rushYds: 123, rushTD: 0, rec: 8, recYds: 25, recTD: 0 }, // Wk16 @RAM
    ],
  },
  "art-monk": {
    1984: [
      { rec: 3, recYds: 54, recTD: 0 }, // Wk1 vs MIA
      { rushAtt: 1, rushTD: 0, rec: 10, recYds: 200, recTD: 0 }, // Wk2 @SFO
      { rec: 8, recYds: 78, recTD: 0 }, // Wk3 vs NYG
      { rec: 5, recYds: 37, recTD: 0 }, // Wk4 @NWE
      { rec: 5, recYds: 80, recTD: 1 }, // Wk5 vs PHI
      { rec: 8, recYds: 141, recTD: 3 }, // Wk6 @IND
      { rec: 4, recYds: 67, recTD: 0 }, // Wk7 vs DAL
      { rec: 6, recYds: 87, recTD: 0 }, // Wk8 @STL
      { rec: 4, recYds: 104, recTD: 0 }, // Wk9 @NYG
      { rec: 5, recYds: 45, recTD: 0 }, // Wk10 vs ATL
      { rec: 5, recYds: 34, recTD: 0 }, // Wk11 vs DET
      { rec: 8, recYds: 80, recTD: 0 }, // Wk12 @PHI
      { rec: 11, recYds: 104, recTD: 1 }, // Wk13 vs BUF
      { rec: 6, recYds: 45, recTD: 0 }, // Wk14 @MIN
      { rushAtt: 1, rushYds: 18, rushTD: 0, rec: 7, recYds: 80, recTD: 0 }, // Wk15 @DAL
      { rec: 11, recYds: 136, recTD: 2 }, // Wk16 vs STL
    ],
  },
  "cris-carter": {
    1995: [
      { rec: 5, recYds: 83, recTD: 0 }, // Wk1 @CHI
      { rec: 6, recYds: 57, recTD: 0 }, // Wk2 vs DET
      { rec: 5, recYds: 39, recTD: 1 }, // Wk3 vs DAL (OT)
      { rec: 6, recYds: 67, recTD: 2 }, // Wk4 @PIT
      { rec: 12, recYds: 115, recTD: 2 }, // Wk6 vs HOU (OT)
      { rec: 4, recYds: 21, recTD: 0 }, // Wk7 @TAM (OT)
      { rec: 5, recYds: 58, recTD: 0 }, // Wk8 @GNB
      { rec: 8, recYds: 68, recTD: 0 }, // Wk9 vs CHI
      { rec: 9, recYds: 91, recTD: 1 }, // Wk10 vs GNB
      { rec: 12, recYds: 157, recTD: 2 }, // Wk11 @ARI (OT)
      { rec: 12, recYds: 137, recTD: 2 }, // Wk12 vs NOR
      { rec: 5, recYds: 51, recTD: 2 }, // Wk13 @DET
      { rec: 6, recYds: 136, recTD: 2 }, // Wk14 vs TAM
      { rec: 8, recYds: 124, recTD: 0 }, // Wk15 vs CLE
      { rushAtt: 1, rushTD: 0, rec: 12, recYds: 88, recTD: 2 }, // Wk16 @SFO
      { rec: 7, recYds: 79, recTD: 1 }, // Wk17 @CIN
    ],
  },
  "curtis-martin": {
    2004: [
      { rushAtt: 29, rushYds: 196, rushTD: 1, rec: 3, recYds: 7, recTD: 1 }, // Wk1 vs CIN
      { rushAtt: 32, rushYds: 119, rushTD: 2, rec: 6, recYds: 25, recTD: 0 }, // Wk2 @SDG
      { rushAtt: 24, rushYds: 110, rushTD: 1, rec: 4, recYds: 31, recTD: 0 }, // Wk4 @MIA
      { rushAtt: 22, rushYds: 77, rushTD: 0, rec: 6, recYds: 23, recTD: 0 }, // Wk5 vs BUF
      { rushAtt: 25, rushYds: 111, rushTD: 2, rec: 3, recYds: 20, recTD: 0 }, // Wk6 vs SFO
      { rushAtt: 20, rushYds: 70, rushTD: 0, rec: 2, recTD: 0 }, // Wk7 @NWE
      { rushAtt: 19, rushYds: 115, rushTD: 1, rec: 1, recYds: 13, recTD: 0 }, // Wk8 vs MIA
      { rushAtt: 19, rushYds: 67, rushTD: 0 }, // Wk9 @BUF
      { rushAtt: 28, rushYds: 119, rushTD: 2, rec: 2, recYds: 5, recTD: 0 }, // Wk10 vs BAL (OT)
      { rushAtt: 17, rushYds: 88, rushTD: 0 }, // Wk11 @CLE
      { rushAtt: 24, rushYds: 99, rushTD: 0 }, // Wk12 @ARI
      { rushAtt: 23, rushYds: 134, rushTD: 1, rec: 4, recYds: 20, recTD: 1 }, // Wk13 vs HOU
      { rushAtt: 24, rushYds: 72, rushTD: 0, rec: 3, recYds: 35, recTD: 0 }, // Wk14 @PIT
      { rushAtt: 24, rushYds: 134, rushTD: 2 }, // Wk15 vs SEA
      { rushAtt: 13, rushYds: 33, rushTD: 0, rec: 5, recYds: 44, recTD: 0 }, // Wk16 vs NWE
      { rushAtt: 28, rushYds: 153, rushTD: 0, rec: 2, recYds: 22, recTD: 0 }, // Wk17 @STL (OT)
    ],
  },
  "emmitt-smith": {
    1995: [
      { rushAtt: 21, rushYds: 163, rushTD: 4, rec: 1, recTD: 0 }, // Wk1 @NYG
      { rushAtt: 26, rushYds: 114, rushTD: 1, rec: 4, recYds: 35, recTD: 0 }, // Wk2 vs DEN
      { rushAtt: 20, rushYds: 150, rushTD: 2, rec: 6, recYds: 12, recTD: 0, fumblesLost: 1 }, // Wk3 @MIN (OT)
      { rushAtt: 21, rushYds: 116, rushTD: 2, rec: 3, recYds: 53, recTD: 0 }, // Wk4 vs ARI
      { rushAtt: 22, rushYds: 95, rushTD: 0, rec: 8, recYds: 38, recTD: 0, fumblesLost: 1 }, // Wk5 @WAS
      { rushAtt: 31, rushYds: 106, rushTD: 2, rec: 3, recYds: 19, recTD: 0 }, // Wk6 vs GNB
      { rushAtt: 22, rushYds: 68, rushTD: 2, rec: 5, recYds: 15, recTD: 0 }, // Wk7 @SDG
      { rushAtt: 26, rushYds: 167, rushTD: 1, rec: 5, recYds: 30, recTD: 0 }, // Wk9 @ATL
      { rushAtt: 27, rushYds: 158, rushTD: 2, rec: 3, recYds: 22, recTD: 0, fumblesLost: 1 }, // Wk10 vs PHI
      { rushAtt: 18, rushYds: 100, rushTD: 1, rec: 6, recYds: 50, recTD: 0 }, // Wk11 vs SFO
      { rushAtt: 29, rushYds: 110, rushTD: 3, rec: 3, recYds: 22, recTD: 0, fumblesLost: 1 }, // Wk12 @OAK
      { rushAtt: 18, rushYds: 56, rushTD: 1, rec: 3, recYds: 11, recTD: 0 }, // Wk13 vs KAN
      { rushAtt: 21, rushYds: 91, rushTD: 1, rec: 4, recYds: 16, recTD: 0, fumblesLost: 1 }, // Wk14 vs WAS
      { rushAtt: 27, rushYds: 108, rushTD: 1, rec: 3, recYds: 8, recTD: 0, fumblesLost: 1 }, // Wk15 @PHI
      { rushAtt: 24, rushYds: 103, rushTD: 1, rec: 2, recYds: 6, recTD: 0 }, // Wk16 vs NYG
      { rushAtt: 24, rushYds: 68, rushTD: 1, rec: 3, recYds: 38, recTD: 0 }, // Wk17 @ARI
    ],
  },
  "eric-dickerson": {
    1984: [
      { rushAtt: 21, rushYds: 138, rushTD: 1, rec: 2, recYds: 20, recTD: 0, passInt: 1 }, // Wk1 vs DAL
      { rushAtt: 27, rushYds: 102, rushTD: 0, rec: 2, recYds: 9, recTD: 0 }, // Wk2 vs CLE
      { rushAtt: 23, rushYds: 49, rushTD: 0, rec: 3, recYds: 16, recTD: 0 }, // Wk3 @PIT
      { rushAtt: 22, rushYds: 89, rushTD: 1 }, // Wk4 @CIN
      { rushAtt: 22, rushYds: 120, rushTD: 0, rec: 3, recYds: 27, recTD: 0 }, // Wk5 vs NYG
      { rushAtt: 19, rushYds: 107, rushTD: 2, rec: 1, recYds: 17, recTD: 0 }, // Wk6 vs ATL
      { rushAtt: 20, rushYds: 175, rushTD: 0 }, // Wk7 @NOR
      { rushAtt: 24, rushYds: 145, rushTD: 1, rec: 1, recYds: 2, recTD: 0 }, // Wk8 @ATL
      { rushAtt: 13, rushYds: 38, rushTD: 0, rec: 3, recYds: 19, recTD: 0 }, // Wk9 vs SFO
      { rushAtt: 21, rushYds: 208, rushTD: 0 }, // Wk10 @STL
      { rushAtt: 28, rushYds: 149, rushTD: 2 }, // Wk11 vs CHI
      { rushAtt: 25, rushYds: 132, rushTD: 0, rec: 3, recYds: 14, recTD: 0 }, // Wk12 @GNB
      { rushAtt: 28, rushYds: 191, rushTD: 3, rec: 1, recYds: 3, recTD: 0 }, // Wk13 @TAM
      { rushAtt: 33, rushYds: 149, rushTD: 1, rec: 1, recYds: 6, recTD: 0 }, // Wk14 vs NOR
      { rushAtt: 27, rushYds: 215, rushTD: 2 }, // Wk15 vs HOU
      { rushAtt: 26, rushYds: 98, rushTD: 1, rec: 1, recYds: 6, recTD: 0 }, // Wk16 @SFO
    ],
  },
  "franco-harris": {
    1976: [
      { rushAtt: 18, rushYds: 68, rushTD: 1, rec: 1, recYds: 39, recTD: 0 }, // Wk1 @OAK
      { rushAtt: 25, rushYds: 118, rushTD: 1, rec: 2, recYds: 10, recTD: 0 }, // Wk2 vs CLE
      { rushAtt: 19, rushYds: 78, rushTD: 2 }, // Wk3 vs NWE
      { rushAtt: 17, rushYds: 34, rushTD: 0, rec: 4, recYds: 38, recTD: 0 }, // Wk4 @MIN
      { rushAtt: 13, rushYds: 39, rushTD: 1, rec: 6, recYds: 13, recTD: 0 }, // Wk5 @CLE
      { rushAtt: 41, rushYds: 143, rushTD: 2 }, // Wk6 vs CIN
      { rushAtt: 27, rushYds: 106, rushTD: 2, rec: 4, recYds: 12, recTD: 0 }, // Wk7 @NYG
      { rushAtt: 11, rushYds: 32, rushTD: 0, rec: 1, recYds: 11, recTD: 0 }, // Wk8 vs SDG
      { rushAtt: 23, rushYds: 117, rushTD: 2 }, // Wk9 @KAN
      { rushAtt: 22, rushYds: 110, rushTD: 1, rec: 1, recYds: 7, recTD: 0 }, // Wk10 vs MIA
      { rushAtt: 10, rushYds: 37, rushTD: 0, rec: 1, recYds: 4, recTD: 0 }, // Wk11 vs HOU
      { rushAtt: 26, rushYds: 87, rushTD: 1, rec: 1, recYds: 5, recTD: 0 }, // Wk12 @CIN
      { rushAtt: 14, rushYds: 55, rushTD: 0 }, // Wk13 vs TAM
      { rushAtt: 23, rushYds: 104, rushTD: 1, rec: 2, recYds: 12, recTD: 0 }, // Wk14 @HOU
    ],
  },
  "oj-simpson": {
    1975: [
      { rushAtt: 32, rushYds: 173, rushTD: 2, rec: 1, recYds: 5, recTD: 0 }, // Wk1 vs NYJ
      { rushAtt: 28, rushYds: 227, rushTD: 1 }, // Wk2 @PIT
      { rushAtt: 26, rushYds: 138, rushTD: 1 }, // Wk3 vs DEN
      { rushAtt: 32, rushYds: 159, rushTD: 1, rec: 1, recYds: 14, recTD: 0 }, // Wk4 @BAL
      { rushAtt: 34, rushYds: 126, rushTD: 1 }, // Wk5 vs NYG
      { rushAtt: 19, rushYds: 88, rushTD: 1, rec: 2, recYds: 16, recTD: 0 }, // Wk6 vs MIA
      { rushAtt: 21, rushYds: 94, rushTD: 0, rec: 2, recYds: 66, recTD: 1 }, // Wk7 @NYJ
      { rushAtt: 19, rushYds: 123, rushTD: 1, rec: 3, recYds: 71, recTD: 2 }, // Wk8 vs BAL
      { rushAtt: 17, rushYds: 197, rushTD: 2, rec: 2, recYds: 21, recTD: 0 }, // Wk9 @CIN
      { rushAtt: 27, rushYds: 69, rushTD: 2, rec: 4, recYds: 22, recTD: 2 }, // Wk10 vs NWE
      { rushAtt: 23, rushYds: 85, rushTD: 1 }, // Wk11 @STL
      { rushAtt: 18, rushYds: 96, rushTD: 1, rec: 8, recYds: 117, recTD: 1 }, // Wk12 @MIA
      { rushAtt: 21, rushYds: 185, rushTD: 1, rec: 2, recYds: 28, recTD: 0 }, // Wk13 @NWE
      { rushAtt: 12, rushYds: 57, rushTD: 1, rec: 3, recYds: 66, recTD: 1 }, // Wk14 vs MIN
    ],
  },
  "walter-payton": {
    1977: [
      { rushAtt: 23, rushYds: 160, rushTD: 2, rec: 1, recYds: 2, recTD: 0 }, // Wk1 vs DET
      { rushAtt: 11, rushYds: 36, rushTD: 0, rec: 4, recYds: 20, recTD: 0 }, // Wk2 @STL
      { rushAtt: 19, rushYds: 140, rushTD: 2, rec: 4, recYds: 53, recTD: 1 }, // Wk3 vs NOR
      { rushAtt: 24, rushYds: 126, rushTD: 0, rec: 1, recYds: 1, recTD: 0 }, // Wk4 vs RAM
      { rushAtt: 24, rushYds: 122, rushTD: 0, rec: 1, recYds: 5, recTD: 0 }, // Wk5 @MIN (OT)
      { rushAtt: 24, rushYds: 69, rushTD: 0, rec: 1, recYds: 3, recTD: 0 }, // Wk6 vs ATL
      { rushAtt: 23, rushYds: 205, rushTD: 2, rec: 1, recYds: 5, recTD: 0 }, // Wk7 @GNB
      { rushAtt: 18, rushYds: 79, rushTD: 0, rec: 2, recYds: 15, recTD: 0 }, // Wk8 @HOU
      { rushAtt: 33, rushYds: 192, rushTD: 3, rec: 1, recYds: 29, recTD: 0 }, // Wk9 vs KAN
      { rushAtt: 40, rushYds: 275, rushTD: 1, rec: 1, recYds: 6, recTD: 0 }, // Wk10 vs MIN
      { rushAtt: 20, rushYds: 137, rushTD: 1, rec: 4, recYds: 107, recTD: 1 }, // Wk11 @DET
      { rushAtt: 33, rushYds: 101, rushTD: 1 }, // Wk12 @TAM
      { rushAtt: 32, rushYds: 163, rushTD: 2 }, // Wk13 vs GNB
      { rushAtt: 15, rushYds: 47, rushTD: 0, rec: 6, recYds: 23, recTD: 0 }, // Wk14 @NYG (OT)
    ],
  },
  "gale-sayers": {
    1966: [
      { rushAtt: 17, rushYds: 79, rushTD: 0, rec: 2, recYds: 8, recTD: 0 }, // Wk1 @DET
      { rushAtt: 18, rushYds: 97, rushTD: 2 }, // Wk2 @RAM
      { rushAtt: 9, rushYds: 40, rushTD: 0, rec: 5, recYds: 71, recTD: 0 }, // Wk4 @MIN
      { rushAtt: 18, rushYds: 106, rushTD: 2 }, // Wk5 vs BAL
      { rushAtt: 15, rushYds: 29, rushTD: 0, rec: 3, recYds: 21, recTD: 0 }, // Wk6 vs GNB
      { rushAtt: 16, rushYds: 87, rushTD: 0, rec: 1, recYds: 25, recTD: 0 }, // Wk7 vs RAM
      { rushAtt: 19, rushYds: 68, rushTD: 0, rec: 1, recYds: 80, recTD: 1, passYds: 39 }, // Wk8 @STL
      { rushAtt: 21, rushYds: 124, rushTD: 1, rec: 3, recYds: 24, recTD: 0 }, // Wk9 vs DET
      { rushAtt: 14, rushYds: 87, rushTD: 0, rec: 2, recYds: 48, recTD: 1 }, // Wk10 vs SFO
      { rushAtt: 20, rushYds: 68, rushTD: 1, rec: 1, recYds: 14, recTD: 0, passInt: 1 }, // Wk11 @GNB
      { rushAtt: 19, rushYds: 172, rushTD: 0, rec: 5, recYds: 65, recTD: 0 }, // Wk12 vs ATL
      { rushAtt: 16, rushYds: 38, rushTD: 0, rec: 7, recYds: 60, recTD: 0, passYds: 19 }, // Wk13 @BAL
      { rushAtt: 10, rushYds: 39, rushTD: 1, rec: 3, recYds: 5, recTD: 0 }, // Wk14 @SFO
      { rushAtt: 17, rushYds: 197, rushTD: 1, rec: 1, recYds: 26, recTD: 0 }, // Wk15 vs MIN
    ],
  },
  "jim-brown": {
    1963: [
      { rushAtt: 15, rushYds: 162, rushTD: 2, rec: 3, recYds: 100, recTD: 1 }, // Wk1 vs WAS
      { rushAtt: 20, rushYds: 232, rushTD: 2 }, // Wk2 @DAL
      { rushAtt: 22, rushYds: 95, rushTD: 1, rec: 1, recTD: 0 }, // Wk3 vs RAM
      { rushAtt: 21, rushYds: 175, rushTD: 1, rec: 1, recYds: 15, recTD: 0 }, // Wk4 vs PIT
      { rushAtt: 23, rushYds: 123, rushTD: 2, rec: 4, recYds: 86, recTD: 1 }, // Wk5 @NYG
      { rushAtt: 25, rushYds: 144, rushTD: 0, rec: 3, recYds: 21, recTD: 1 }, // Wk6 vs PHI
      { rushAtt: 9, rushYds: 40, rushTD: 0 }, // Wk7 vs NYG
      { rushAtt: 28, rushYds: 223, rushTD: 1 }, // Wk8 @PHI
      { rushAtt: 19, rushYds: 99, rushTD: 0, rec: 4, recYds: 14, recTD: 0 }, // Wk9 @PIT
      { rushAtt: 22, rushYds: 154, rushTD: 1, rec: 2, recYds: 21, recTD: 0 }, // Wk10 vs STL
      { rushAtt: 17, rushYds: 51, rushTD: 0, rec: 3, recYds: 15, recTD: 0 }, // Wk11 vs DAL
      { rushAtt: 29, rushYds: 179, rushTD: 2 }, // Wk12 @STL
      { rushAtt: 13, rushYds: 61, rushTD: 0, rec: 2, recYds: -2, recTD: 0 }, // Wk13 @DET
      { rushAtt: 28, rushYds: 125, rushTD: 0, rec: 1, recYds: -2, recTD: 0 }, // Wk14 @WAS
    ],
  },
  "terrell-davis": {
    1997: [
      { rushAtt: 26, rushYds: 101, rushTD: 1, rec: 3, recYds: 14, recTD: 0 }, // Wk1 vs KAN
      { rushAtt: 21, rushYds: 107, rushTD: 1 }, // Wk2 @SEA
      { rushAtt: 21, rushYds: 103, rushTD: 0, rec: 1, recYds: 4, recTD: 0 }, // Wk3 vs STL
      { rushAtt: 27, rushYds: 215, rushTD: 1, rec: 2, recYds: 13, recTD: 0 }, // Wk4 vs CIN
      { rushAtt: 23, rushYds: 79, rushTD: 1 }, // Wk5 @ATL
      { rushAtt: 32, rushYds: 171, rushTD: 2, rec: 2, recYds: 7, recTD: 0 }, // Wk6 vs NWE
      { rushAtt: 23, rushYds: 85, rushTD: 2, rec: 7, recYds: 70, recTD: 0 }, // Wk8 @OAK
      { rushAtt: 42, rushYds: 207, rushTD: 1, rec: 5, recYds: 29, recTD: 0 }, // Wk9 @BUF (OT)
      { rushAtt: 21, rushYds: 101, rushTD: 0, rec: 6, recYds: 17, recTD: 0 }, // Wk10 vs SEA
      { rushAtt: 21, rushYds: 104, rushTD: 0, rec: 1, recYds: 12, recTD: 0 }, // Wk11 vs CAR
      { rushAtt: 34, rushYds: 127, rushTD: 0, rec: 2, recYds: 13, recTD: 0 }, // Wk12 @KAN
      { rushAtt: 21, rushYds: 69, rushTD: 3, rec: 4, recYds: 46, recTD: 0 }, // Wk13 vs OAK
      { rushAtt: 26, rushYds: 178, rushTD: 1, rec: 4, recYds: 36, recTD: 0 }, // Wk14 @SDG
      { rushAtt: 21, rushYds: 75, rushTD: 1, rec: 3, recYds: 26, recTD: 0 }, // Wk15 @PIT
      { rushAtt: 10, rushYds: 28, rushTD: 1, rec: 2, recTD: 0 }, // Wk16 @SFO
    ],
    1998: [
      { rushAtt: 22, rushYds: 75, rushTD: 2, rec: 1, recYds: 7, recTD: 0 }, // Wk1 vs NWE
      { rushAtt: 23, rushYds: 191, rushTD: 3 }, // Wk2 vs DAL
      { rushAtt: 28, rushYds: 104, rushTD: 0, rec: 1, recYds: 8, recTD: 0 }, // Wk3 @OAK
      { rushAtt: 21, rushYds: 119, rushTD: 1, rec: 2, recYds: 7, recTD: 0 }, // Wk4 @WAS
      { rushAtt: 20, rushYds: 168, rushTD: 2 }, // Wk5 vs PHI
      { rushAtt: 30, rushYds: 208, rushTD: 1 }, // Wk6 @SEA
      { rushAtt: 31, rushYds: 136, rushTD: 3, rec: 5, recYds: 76, recTD: 0 }, // Wk8 vs JAX
      { rushAtt: 27, rushYds: 149, rushTD: 2, rec: 1, recYds: 3, recTD: 0 }, // Wk9 @CIN
      { rushAtt: 20, rushYds: 69, rushTD: 1, rec: 2, recYds: 19, recTD: 1 }, // Wk10 vs SDG
      { rushAtt: 18, rushYds: 111, rushTD: 1 }, // Wk11 @KAN
      { rushAtt: 31, rushYds: 162, rushTD: 1, rec: 3, recYds: 26, recTD: 0 }, // Wk12 vs OAK
      { rushAtt: 24, rushYds: 74, rushTD: 0, rec: 1, recYds: 4, recTD: 0 }, // Wk13 @SDG
      { rushAtt: 24, rushYds: 88, rushTD: 3, rec: 5, recYds: 45, recTD: 0, fumblesLost: 1 }, // Wk14 vs KAN
      { rushAtt: 28, rushYds: 147, rushTD: 1 }, // Wk15 @NYG
      { rushAtt: 16, rushYds: 29, rushTD: 0, rec: 2, recYds: 5, recTD: 0 }, // Wk16 @MIA
      { rushAtt: 29, rushYds: 178, rushTD: 0, rec: 2, recYds: 17, recTD: 1, fumblesLost: 1 }, // Wk17 vs SEA
    ],
  },
  "thurman-thomas": {
    1992: [
      { rushAtt: 22, rushYds: 103, rushTD: 3, rec: 3, recYds: 33, recTD: 1 }, // Wk1 vs RAM
      { rushAtt: 19, rushYds: 85, rushTD: 1, rec: 4, recYds: 94, recTD: 1 }, // Wk2 @SFO
      { rushAtt: 14, rushYds: 42, rushTD: 0, rec: 2, recYds: 29, recTD: 0 }, // Wk3 vs IND
      { rushAtt: 18, rushYds: 120, rushTD: 1, rec: 2, recYds: 27, recTD: 0 }, // Wk4 @NWE
      { rushAtt: 11, rushYds: 33, rushTD: 0, rec: 9, recYds: 83, recTD: 0 }, // Wk5 vs MIA
      { rushAtt: 16, rushYds: 52, rushTD: 0, rec: 3, recYds: 27, recTD: 0 }, // Wk6 @RAI
      { rushAtt: 21, rushYds: 142, rushTD: 0, rec: 3, recYds: 22, recTD: 1 }, // Wk8 @NYJ
      { rushAtt: 12, rushYds: 29, rushTD: 0, rec: 5, recYds: 45, recTD: 0 }, // Wk9 vs NWE
      { rushAtt: 37, rushYds: 155, rushTD: 1, rec: 4, recYds: 30, recTD: 0 }, // Wk10 vs PIT
      { rushAtt: 22, rushYds: 73, rushTD: 0, rec: 6, recYds: 66, recTD: 0 }, // Wk11 @MIA
      { rushAtt: 13, rushYds: 103, rushTD: 0 }, // Wk12 vs ATL
      { rushAtt: 21, rushYds: 102, rushTD: 0, rec: 3, recYds: 37, recTD: 0 }, // Wk13 @IND (OT)
      { rushAtt: 18, rushYds: 116, rushTD: 0, rec: 2, recYds: 24, recTD: 0 }, // Wk14 vs NYJ
      { rushAtt: 26, rushYds: 120, rushTD: 1, rec: 3, recYds: 39, recTD: 0 }, // Wk15 vs DEN
      { rushAtt: 24, rushYds: 115, rushTD: 2, rec: 6, recYds: 62, recTD: 0 }, // Wk16 @NOR
      { rushAtt: 18, rushYds: 97, rushTD: 0, rec: 3, recYds: 8, recTD: 0 }, // Wk17 @HOU
    ],
  },
  "randy-moss": {
    2007: [
      { rec: 9, recYds: 183, recTD: 1 }, // Wk1 @NYJ
      { rec: 8, recYds: 105, recTD: 2 }, // Wk2 vs SDG
      { rec: 5, recYds: 115, recTD: 2 }, // Wk3 vs BUF
      { rec: 9, recYds: 102, recTD: 2 }, // Wk4 @CIN
      { rec: 3, recYds: 46, recTD: 0 }, // Wk5 vs CLE
      { rec: 6, recYds: 59, recTD: 1 }, // Wk6 @DAL
      { rec: 4, recYds: 122, recTD: 2 }, // Wk7 @MIA
      { rec: 3, recYds: 47, recTD: 1 }, // Wk8 vs WAS
      { rec: 9, recYds: 145, recTD: 1 }, // Wk9 @IND
      { rec: 10, recYds: 128, recTD: 4 }, // Wk11 @BUF
      { rec: 5, recYds: 43, recTD: 0 }, // Wk12 vs PHI
      { rec: 4, recYds: 34, recTD: 1 }, // Wk13 @BAL
      { rec: 7, recYds: 135, recTD: 2 }, // Wk14 vs PIT
      { rec: 5, recYds: 79, recTD: 0 }, // Wk15 vs NYJ
      { rec: 5, recYds: 50, recTD: 2 }, // Wk16 vs MIA
      { rec: 6, recYds: 100, recTD: 2 }, // Wk17 @NYG
    ],
  },
  "jerry-rice": {
    1995: [
      { rushAtt: 1, rushYds: 5, rushTD: 0, rec: 6, recYds: 87, recTD: 1 }, // Wk1 @NOR
      { rec: 11, recYds: 167, recTD: 2 }, // Wk2 vs ATL
      { rec: 6, recYds: 87, recTD: 2 }, // Wk3 vs NWE
      { rec: 11, recYds: 181, recTD: 0 }, // Wk4 @DET
      { rec: 7, recYds: 71, recTD: 1 }, // Wk5 vs NYG
      { rec: 6, recYds: 43, recTD: 1 }, // Wk7 @IND
      { rushAtt: 1, rushYds: 20, rushTD: 1, rec: 2, recYds: 21, recTD: 1 }, // Wk8 @STL
      { rushAtt: 1, rushTD: 0, rec: 8, recYds: 108, recTD: 0 }, // Wk9 vs NOR
      { rushAtt: 1, rushYds: 1, rushTD: 0, rec: 8, recYds: 111, recTD: 0, fumblesLost: 1 }, // Wk10 vs CAR
      { rec: 5, recYds: 161, recTD: 1 }, // Wk11 @DAL
      { rec: 8, recYds: 149, recTD: 2 }, // Wk12 @MIA
      { rec: 7, recYds: 67, recTD: 1, fumblesLost: 1 }, // Wk13 vs STL
      { rec: 5, recYds: 32, recTD: 0 }, // Wk14 vs BUF
      { rec: 6, recYds: 121, recTD: 0 }, // Wk15 @CAR
      { rushAtt: 1, rushYds: 10, rushTD: 0, rec: 14, recYds: 289, recTD: 3, fumblesLost: 1 }, // Wk16 vs MIN
      { rec: 12, recYds: 153, recTD: 0, passYds: 41, passTD: 1 }, // Wk17 @ATL
    ],
  },
  "herschel-walker": {
    1988: [
      { rushAtt: 19, rushYds: 79, rushTD: 0, rec: 6, recYds: 56, recTD: 0 }, // Wk1 @PIT
      { rushAtt: 29, rushYds: 149, rushTD: 1, rec: 3, recYds: 22, recTD: 0 }, // Wk2 @PHO
      { rushAtt: 19, rushYds: 78, rushTD: 0, rec: 5, recYds: 80, recTD: 1 }, // Wk3 vs NYG
      { rushAtt: 25, rushYds: 96, rushTD: 0, rec: 5, recYds: 27, recTD: 1 }, // Wk4 vs ATL
      { rushAtt: 26, rushYds: 124, rushTD: 0, rec: 4, recYds: 23, recTD: 0 }, // Wk5 @NOR
      { rushAtt: 15, rushYds: 51, rushTD: 0, rec: 5, recYds: 92, recTD: 0 }, // Wk6 vs WAS
      { rushAtt: 21, rushYds: 88, rushTD: 0, rec: 4, recYds: 47, recTD: 0 }, // Wk7 @CHI
      { rushAtt: 25, rushYds: 85, rushTD: 0, rec: 4, recYds: 42, recTD: 0 }, // Wk8 @PHI
      { rushAtt: 17, rushYds: 87, rushTD: 0 }, // Wk9 vs PHO
      { rushAtt: 20, rushYds: 96, rushTD: 0, rec: 6, recYds: 40, recTD: 0 }, // Wk10 @NYG
      { rushAtt: 21, rushYds: 86, rushTD: 0 }, // Wk11 vs MIN
      { rushAtt: 27, rushYds: 131, rushTD: 1, rec: 2, recYds: 16, recTD: 0 }, // Wk12 vs CIN
      { rushAtt: 22, rushYds: 69, rushTD: 1, rec: 4, recYds: 20, recTD: 0 }, // Wk13 vs HOU
      { rushAtt: 25, rushYds: 134, rushTD: 1, rec: 3, recYds: 7, recTD: 0 }, // Wk14 @CLE
      { rushAtt: 27, rushYds: 98, rushTD: 0, rec: 2, recYds: 33, recTD: 0 }, // Wk15 @WAS
      { rushAtt: 23, rushYds: 63, rushTD: 1 }, // Wk16 vs PHI
    ],
  },
};
