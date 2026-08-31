// Notable all-time team defense/special-teams seasons. Approximate/
// hand-compiled like the rest of this prototype's data. `sacks` is
// omitted (defaults to 0) for pre-1982 defenses since sacks weren't an
// official NFL stat until 1982 -- better to leave it out than guess.
//
// Scoring: sacks/INT/fumble recoveries/defensive TDs/safeties are flat
// per-stat, plus a standard tiered bonus/penalty on average points
// allowed per game (pointsAllowedBonus() in js/scoring.js). tag is
// "HOVG" across the board -- a team defensive unit isn't an individual
// who can be personally enshrined, so the "not an individual Hall of
// Famer" bucket is the closest fit; position "DEF" is exempt from the
// draft's retired/active alternation regardless (see SKILL_POSITIONS
// in draftEngine.js).

export const DEFENSES = [
  {
    id: "def-ravens-2000",
    name: "2000 Baltimore Ravens",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "BAL", games: 16, stats: { sacks: 35, defInt: 27, fumRec: 15, defTD: 4, ptsAllowed: 165 } },
    ],
  },
  {
    id: "def-bears-1985",
    name: "1985 Chicago Bears",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1985, team: "CHI", games: 16, stats: { sacks: 64, defInt: 34, fumRec: 19, defTD: 6, ptsAllowed: 198 } },
    ],
  },
  {
    id: "def-steelers-1976",
    name: "1976 Pittsburgh Steelers",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1976, team: "PIT", games: 14, stats: { defInt: 32, fumRec: 16, defTD: 5, ptsAllowed: 138 } },
    ],
  },
  {
    id: "def-buccaneers-2002",
    name: "2002 Tampa Bay Buccaneers",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "TB", games: 16, stats: { sacks: 43, defInt: 31, fumRec: 12, defTD: 6, ptsAllowed: 196 } },
    ],
  },
  {
    id: "def-seahawks-2013",
    name: "2013 Seattle Seahawks",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2013, team: "SEA", games: 16, stats: { sacks: 44, defInt: 28, fumRec: 13, defTD: 4, ptsAllowed: 231 } },
    ],
  },
  {
    id: "def-broncos-2015",
    name: "2015 Denver Broncos",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2015, team: "DEN", games: 16, stats: { sacks: 52, defInt: 21, fumRec: 11, defTD: 3, ptsAllowed: 296 } },
    ],
  },
  {
    id: "def-steelers-2008",
    name: "2008 Pittsburgh Steelers",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2008, team: "PIT", games: 16, stats: { sacks: 51, defInt: 20, fumRec: 13, defTD: 3, ptsAllowed: 223 } },
    ],
  },
  {
    id: "def-bears-1986",
    name: "1986 Chicago Bears",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1986, team: "CHI", games: 16, stats: { sacks: 55, defInt: 29, fumRec: 17, defTD: 4, ptsAllowed: 187 } },
    ],
  },
  {
    id: "def-broncos-1977",
    name: "1977 Denver Broncos",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1977, team: "DEN", games: 14, stats: { defInt: 37, fumRec: 18, defTD: 5, ptsAllowed: 148 } },
    ],
  },
  {
    id: "def-patriots-2019",
    name: "2019 New England Patriots",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 2019, team: "NE", games: 16, stats: { sacks: 47, defInt: 25, fumRec: 10, defTD: 6, ptsAllowed: 225 } },
    ],
  },
  {
    id: "def-eagles-1991",
    name: "1991 Philadelphia Eagles",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1991, team: "PHI", games: 16, stats: { sacks: 55, defInt: 22, fumRec: 14, defTD: 2, ptsAllowed: 273 } },
    ],
  },
  {
    id: "def-bears-1963",
    name: "1963 Chicago Bears",
    position: "DEF",
    tag: "HOVG",
    seasons: [
      { year: 1963, team: "CHI", games: 14, stats: { defInt: 36, fumRec: 16, defTD: 3, ptsAllowed: 144 } },
    ],
  },
];
