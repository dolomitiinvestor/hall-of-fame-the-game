// Hall of Fame player dataset for the prototype.
//
// Stats are approximate, hand-compiled season totals for well-known
// Hall of Fame seasons (many are record-setting years, so they are
// well documented). They are meant to be "close enough" for a v1
// prototype, not a verified statistical source. Swap or extend this
// file with a more rigorous data source later -- nothing else in the
// app needs to change since everything downstream (scoring, draft,
// season sim) only depends on the shape of this data, not its origin.
//
// Shape:
// {
//   id: unique string
//   name: display name
//   position: "QB" | "RB" | "WR" | "TE"
//   tag: "HOF" (enshrined in the Pro Football Hall of Fame) |
//        "HOVG" (retired, statistically great, not (yet) enshrined --
//                the "Hall of Very Good") |
//        "ACTIVE" (currently playing; see the ACTIVE section below)
//   seasons: [
//     { year, team, games, stats: { ...raw box score totals for the year } }
//   ]
// }
//
// stats fields (all optional, default 0):
//   passYds, passTD, passInt
//   rushYds, rushTD
//   rec, recYds, recTD
//   fumblesLost
//
// A player can have multiple seasons listed; the app always computes
// the "best" one dynamically from the current scoring rules rather
// than hard-coding it, so changing scoring rules later automatically
// re-picks the right season.
//
// Several HOF/HOVG seasons below are intentionally shorter than 16
// games (strike years, wartime schedules, early-NFL 14-game seasons)
// so the "repeat a shortened season's per-game rate across all 16
// weeks" logic in scoring.js gets exercised by real data.
//
// HOF/HOVG tag accuracy is approximate/best-effort as of this file's
// writing: to stay safely accurate, recently-retired players whose HOF
// eligibility window was ambiguous at write time were left out of HOVG
// entirely rather than guessed at.

export const PLAYERS = [
  // ---------------------------------------------------------------- QB
  {
    id: "dan-marino",
    name: "Dan Marino",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1984, team: "MIA", games: 16, stats: { passYds: 5084, passTD: 48, passInt: 17 } },
    ],
  },
  {
    id: "peyton-manning",
    name: "Peyton Manning",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 2004, team: "IND", games: 16, stats: { passYds: 4557, passTD: 49, passInt: 10 } },
      { year: 2013, team: "DEN", games: 16, stats: { passYds: 5477, passTD: 55, passInt: 10 } },
    ],
  },
  {
    id: "kurt-warner",
    name: "Kurt Warner",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1999, team: "STL", games: 16, stats: { passYds: 4353, passTD: 41, passInt: 13 } },
    ],
  },
  {
    id: "steve-young",
    name: "Steve Young",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1994, team: "SF", games: 16, stats: { passYds: 3969, passTD: 35, passInt: 10, rushYds: 293, rushTD: 7 } },
    ],
  },
  {
    id: "brett-favre",
    name: "Brett Favre",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1996, team: "GB", games: 16, stats: { passYds: 3899, passTD: 39, passInt: 13 } },
    ],
  },
  {
    id: "warren-moon",
    name: "Warren Moon",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1991, team: "HOU", games: 16, stats: { passYds: 4690, passTD: 23, passInt: 21 } },
    ],
  },
  {
    id: "john-elway",
    name: "John Elway",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1993, team: "DEN", games: 16, stats: { passYds: 4030, passTD: 25, passInt: 10 } },
    ],
  },
  {
    id: "fran-tarkenton",
    name: "Fran Tarkenton",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1975, team: "MIN", games: 14, stats: { passYds: 2994, passTD: 25, passInt: 13 } },
    ],
  },
  {
    id: "dan-fouts",
    name: "Dan Fouts",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1981, team: "SD", games: 16, stats: { passYds: 4802, passTD: 33, passInt: 17 } },
    ],
  },
  {
    id: "joe-montana",
    name: "Joe Montana",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1989, team: "SF", games: 16, stats: { passYds: 3521, passTD: 26, passInt: 8 } },
    ],
  },
  {
    id: "troy-aikman",
    name: "Troy Aikman",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1993, team: "DAL", games: 14, stats: { passYds: 3100, passTD: 15, passInt: 6 } },
    ],
  },
  {
    id: "terry-bradshaw",
    name: "Terry Bradshaw",
    position: "QB",
    tag: "HOF",
    seasons: [
      { year: 1978, team: "PIT", games: 14, stats: { passYds: 2915, passTD: 28, passInt: 20 } },
    ],
  },

  // ---------------------------------------------------------------- RB
  {
    id: "jim-brown",
    name: "Jim Brown",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1963, team: "CLE", games: 14, stats: { rushYds: 1863, rushTD: 12, rec: 24, recYds: 268, recTD: 3 } },
    ],
  },
  {
    id: "barry-sanders",
    name: "Barry Sanders",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1997, team: "DET", games: 16, stats: { rushYds: 2053, rushTD: 11, rec: 33, recYds: 305, recTD: 1 } },
    ],
  },
  {
    id: "emmitt-smith",
    name: "Emmitt Smith",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1995, team: "DAL", games: 16, stats: { rushYds: 1773, rushTD: 25, rec: 62, recYds: 375, recTD: 0 } },
    ],
  },
  {
    id: "walter-payton",
    name: "Walter Payton",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1977, team: "CHI", games: 14, stats: { rushYds: 1852, rushTD: 14, rec: 27, recYds: 269, recTD: 2 } },
    ],
  },
  {
    id: "oj-simpson",
    name: "O.J. Simpson",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1973, team: "BUF", games: 14, stats: { rushYds: 2003, rushTD: 12, rec: 6, recYds: 70, recTD: 0 } },
    ],
  },
  {
    id: "eric-dickerson",
    name: "Eric Dickerson",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1984, team: "LAR", games: 16, stats: { rushYds: 2105, rushTD: 14, rec: 21, recYds: 139, recTD: 1 } },
    ],
  },
  {
    id: "marshall-faulk",
    name: "Marshall Faulk",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 2000, team: "STL", games: 14, stats: { rushYds: 1359, rushTD: 18, rec: 81, recYds: 830, recTD: 8 } },
      { year: 2001, team: "STL", games: 14, stats: { rushYds: 1382, rushTD: 12, rec: 83, recYds: 765, recTD: 9 } },
    ],
  },
  {
    id: "ladainian-tomlinson",
    name: "LaDainian Tomlinson",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 2006, team: "SD", games: 16, stats: { rushYds: 1815, rushTD: 28, rec: 56, recYds: 508, recTD: 3, passYds: 20, passTD: 2 } },
    ],
  },
  {
    id: "earl-campbell",
    name: "Earl Campbell",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1980, team: "HOU", games: 16, stats: { rushYds: 1934, rushTD: 13, rec: 6, recYds: 47, recTD: 0 } },
    ],
  },
  {
    id: "tony-dorsett",
    name: "Tony Dorsett",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1981, team: "DAL", games: 16, stats: { rushYds: 1646, rushTD: 4, rec: 32, recYds: 325, recTD: 2 } },
    ],
  },
  {
    id: "thurman-thomas",
    name: "Thurman Thomas",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1991, team: "BUF", games: 16, stats: { rushYds: 1407, rushTD: 7, rec: 62, recYds: 631, recTD: 5 } },
    ],
  },
  {
    id: "marcus-allen",
    name: "Marcus Allen",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1985, team: "LAR", games: 16, stats: { rushYds: 1759, rushTD: 11, rec: 67, recYds: 555, recTD: 3 } },
    ],
  },
  {
    id: "franco-harris",
    name: "Franco Harris",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1975, team: "PIT", games: 14, stats: { rushYds: 1246, rushTD: 10, rec: 28, recYds: 179, recTD: 1 } },
    ],
  },
  {
    id: "gale-sayers",
    name: "Gale Sayers",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1965, team: "CHI", games: 14, stats: { rushYds: 867, rushTD: 14, rec: 29, recYds: 507, recTD: 6 } },
    ],
  },
  {
    id: "terrell-davis",
    name: "Terrell Davis",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 1998, team: "DEN", games: 16, stats: { rushYds: 2008, rushTD: 21, rec: 25, recYds: 217, recTD: 2 } },
    ],
  },
  {
    id: "curtis-martin",
    name: "Curtis Martin",
    position: "RB",
    tag: "HOF",
    seasons: [
      { year: 2004, team: "NYJ", games: 16, stats: { rushYds: 1697, rushTD: 12, rec: 22, recYds: 137, recTD: 0 } },
    ],
  },

  // ---------------------------------------------------------------- WR
  {
    id: "jerry-rice",
    name: "Jerry Rice",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1995, team: "SF", games: 16, stats: { rec: 122, recYds: 1848, recTD: 15 } },
    ],
  },
  {
    id: "randy-moss",
    name: "Randy Moss",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 2007, team: "NE", games: 16, stats: { rec: 98, recYds: 1493, recTD: 23 } },
    ],
  },
  {
    id: "calvin-johnson",
    name: "Calvin Johnson",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 2012, team: "DET", games: 16, stats: { rec: 122, recYds: 1964, recTD: 5 } },
    ],
  },
  {
    id: "don-hutson",
    name: "Don Hutson",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1942, team: "GB", games: 11, stats: { rec: 74, recYds: 1211, recTD: 17 } },
    ],
  },
  {
    id: "steve-largent",
    name: "Steve Largent",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1985, team: "SEA", games: 16, stats: { rec: 79, recYds: 1287, recTD: 6 } },
    ],
  },
  {
    id: "michael-irvin",
    name: "Michael Irvin",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1995, team: "DAL", games: 16, stats: { rec: 111, recYds: 1603, recTD: 10 } },
    ],
  },
  {
    id: "cris-carter",
    name: "Cris Carter",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1995, team: "MIN", games: 16, stats: { rec: 122, recYds: 1371, recTD: 17 } },
    ],
  },
  {
    id: "andre-reed",
    name: "Andre Reed",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1994, team: "BUF", games: 16, stats: { rec: 90, recYds: 1303, recTD: 4 } },
    ],
  },
  {
    id: "art-monk",
    name: "Art Monk",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1984, team: "WAS", games: 16, stats: { rec: 106, recYds: 1372, recTD: 7 } },
    ],
  },
  {
    id: "lance-alworth",
    name: "Lance Alworth",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1965, team: "SD", games: 14, stats: { rec: 69, recYds: 1602, recTD: 14 } },
    ],
  },
  {
    id: "james-lofton",
    name: "James Lofton",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1984, team: "GB", games: 16, stats: { rec: 62, recYds: 1361, recTD: 7 } },
    ],
  },
  {
    id: "tim-brown",
    name: "Tim Brown",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1997, team: "OAK", games: 16, stats: { rec: 104, recYds: 1408, recTD: 5 } },
    ],
  },
  {
    id: "terrell-owens",
    name: "Terrell Owens",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 2000, team: "SF", games: 16, stats: { rec: 97, recYds: 1451, recTD: 13 } },
    ],
  },
  {
    id: "isaac-bruce",
    name: "Isaac Bruce",
    position: "WR",
    tag: "HOF",
    seasons: [
      { year: 1995, team: "STL", games: 16, stats: { rec: 119, recYds: 1781, recTD: 13 } },
      // Full game log archived in js/data/realBoxScores.js (REAL_GAME_LOGS).
      { year: 2000, team: "STL", games: 16, stats: { rec: 87, recYds: 1471, recTD: 9, rushAtt: 1, rushYds: 11, fumblesLost: 1 } },
    ],
  },

  // ---------------------------------------------------------------- TE
  {
    id: "tony-gonzalez",
    name: "Tony Gonzalez",
    position: "TE",
    tag: "HOF",
    seasons: [
      { year: 2004, team: "KC", games: 16, stats: { rec: 102, recYds: 1258, recTD: 7 } },
    ],
  },
  {
    id: "shannon-sharpe",
    name: "Shannon Sharpe",
    position: "TE",
    tag: "HOF",
    seasons: [
      { year: 1996, team: "DEN", games: 16, stats: { rec: 80, recYds: 1062, recTD: 10 } },
    ],
  },
  {
    id: "kellen-winslow",
    name: "Kellen Winslow",
    position: "TE",
    tag: "HOF",
    seasons: [
      { year: 1980, team: "SD", games: 16, stats: { rec: 89, recYds: 1290, recTD: 9 } },
    ],
  },
  {
    id: "ozzie-newsome",
    name: "Ozzie Newsome",
    position: "TE",
    tag: "HOF",
    seasons: [
      { year: 1984, team: "CLE", games: 16, stats: { rec: 89, recYds: 1001, recTD: 5 } },
    ],
  },
  {
    id: "dave-casper",
    name: "Dave Casper",
    position: "TE",
    tag: "HOF",
    seasons: [
      { year: 1977, team: "OAK", games: 14, stats: { rec: 48, recYds: 584, recTD: 6 } },
    ],
  },

  // ============================================================
  // "Hall of Very Good": ~100 retired offensive skill players who
  // are NOT (yet) enshrined in Canton, picked for standout single
  // seasons. hof: false on every entry below.
  // ============================================================

  // ---------------------------------------------------------- QB (hof: false)
  {
    id: "ken-anderson",
    name: "Ken Anderson",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1981, team: "CIN", games: 16, stats: { passYds: 3754, passTD: 29, passInt: 22 } },
    ],
  },
  {
    id: "boomer-esiason",
    name: "Boomer Esiason",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1988, team: "CIN", games: 16, stats: { passYds: 3572, passTD: 28, passInt: 14 } },
    ],
  },
  {
    id: "phil-simms",
    name: "Phil Simms",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1985, team: "NYG", games: 16, stats: { passYds: 3829, passTD: 22, passInt: 20 } },
    ],
  },
  {
    id: "randall-cunningham",
    name: "Randall Cunningham",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1990, team: "PHI", games: 16, stats: { passYds: 3466, passTD: 30, passInt: 13, rushYds: 942, rushTD: 5 } },
    ],
  },
  {
    id: "neil-lomax",
    name: "Neil Lomax",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1984, team: "STL", games: 16, stats: { passYds: 4614, passTD: 28, passInt: 26 } },
    ],
  },
  {
    id: "vinny-testaverde",
    name: "Vinny Testaverde",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1996, team: "BAL", games: 16, stats: { passYds: 4177, passTD: 33, passInt: 19 } },
    ],
  },
  {
    id: "rich-gannon",
    name: "Rich Gannon",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "OAK", games: 16, stats: { passYds: 4689, passTD: 26, passInt: 17 } },
    ],
  },
  {
    id: "daunte-culpepper",
    name: "Daunte Culpepper",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "MIN", games: 16, stats: { passYds: 4717, passTD: 39, passInt: 11, rushYds: 405, rushTD: 2 } },
    ],
  },
  {
    id: "jeff-george",
    name: "Jeff George",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1997, team: "OAK", games: 16, stats: { passYds: 3917, passTD: 29, passInt: 16 } },
    ],
  },
  {
    id: "steve-mcnair",
    name: "Steve McNair",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "TEN", games: 16, stats: { passYds: 3215, passTD: 24, passInt: 7, rushYds: 355, rushTD: 4 } },
    ],
  },
  {
    id: "mark-brunell",
    name: "Mark Brunell",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1996, team: "JAX", games: 16, stats: { passYds: 4367, passTD: 19, passInt: 14, rushYds: 396, rushTD: 2 } },
    ],
  },
  {
    id: "tony-romo",
    name: "Tony Romo",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "DAL", games: 16, stats: { passYds: 4211, passTD: 36, passInt: 19 } },
    ],
  },
  {
    id: "matt-schaub",
    name: "Matt Schaub",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "HOU", games: 16, stats: { passYds: 4770, passTD: 29, passInt: 15 } },
    ],
  },
  {
    id: "jay-cutler",
    name: "Jay Cutler",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2008, team: "DEN", games: 16, stats: { passYds: 4526, passTD: 25, passInt: 18 } },
    ],
  },
  {
    id: "matt-ryan",
    name: "Matt Ryan",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2016, team: "ATL", games: 16, stats: { passYds: 4944, passTD: 38, passInt: 7 } },
    ],
  },
  {
    id: "ben-roethlisberger",
    name: "Ben Roethlisberger",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2014, team: "PIT", games: 16, stats: { passYds: 4952, passTD: 32, passInt: 9 } },
    ],
  },
  {
    id: "carson-palmer",
    name: "Carson Palmer",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2015, team: "ARI", games: 16, stats: { passYds: 4671, passTD: 35, passInt: 11 } },
    ],
  },
  {
    id: "matt-hasselbeck",
    name: "Matt Hasselbeck",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "SEA", games: 16, stats: { passYds: 3966, passTD: 28, passInt: 19 } },
    ],
  },
  {
    id: "donovan-mcnabb",
    name: "Donovan McNabb",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "PHI", games: 16, stats: { passYds: 3875, passTD: 31, passInt: 8, rushYds: 220, rushTD: 3 } },
    ],
  },
  {
    id: "trent-green",
    name: "Trent Green",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "KC", games: 16, stats: { passYds: 4591, passTD: 27, passInt: 17 } },
    ],
  },
  {
    id: "jake-plummer",
    name: "Jake Plummer",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "DEN", games: 16, stats: { passYds: 4089, passTD: 27, passInt: 20 } },
    ],
  },
  {
    id: "brian-sipe",
    name: "Brian Sipe",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1980, team: "CLE", games: 16, stats: { passYds: 4132, passTD: 30, passInt: 14 } },
    ],
  },
  {
    id: "joe-theismann",
    name: "Joe Theismann",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1983, team: "WAS", games: 16, stats: { passYds: 3714, passTD: 29, passInt: 11 } },
    ],
  },
  {
    id: "danny-white",
    name: "Danny White",
    position: "QB",
    tag: "HOVG",
    seasons: [
      { year: 1983, team: "DAL", games: 16, stats: { passYds: 3980, passTD: 29, passInt: 23 } },
    ],
  },

  // ---------------------------------------------------------- RB (hof: false)
  {
    id: "fred-taylor",
    name: "Fred Taylor",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "JAX", games: 16, stats: { rushYds: 1399, rushTD: 12, rec: 30, recYds: 219, recTD: 1 } },
    ],
  },
  {
    id: "eddie-george",
    name: "Eddie George",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "TEN", games: 16, stats: { rushYds: 1509, rushTD: 14, rec: 36, recYds: 261, recTD: 0 } },
    ],
  },
  {
    id: "priest-holmes",
    name: "Priest Holmes",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "KC", games: 16, stats: { rushYds: 1420, rushTD: 27, rec: 45, recYds: 383, recTD: 3 } },
    ],
  },
  {
    id: "jamal-lewis",
    name: "Jamal Lewis",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "BAL", games: 16, stats: { rushYds: 2066, rushTD: 14, rec: 18, recYds: 205, recTD: 0 } },
    ],
  },
  {
    id: "ricky-williams",
    name: "Ricky Williams",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "MIA", games: 16, stats: { rushYds: 1853, rushTD: 16, rec: 24, recYds: 363, recTD: 1 } },
    ],
  },
  {
    id: "shaun-alexander",
    name: "Shaun Alexander",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "SEA", games: 16, stats: { rushYds: 1880, rushTD: 27, rec: 25, recYds: 78, recTD: 1 } },
    ],
  },
  {
    id: "larry-johnson",
    name: "Larry Johnson",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2006, team: "KC", games: 16, stats: { rushYds: 1789, rushTD: 17, rec: 41, recYds: 314, recTD: 2 } },
    ],
  },
  {
    id: "clinton-portis",
    name: "Clinton Portis",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "DEN", games: 16, stats: { rushYds: 1591, rushTD: 14, rec: 20, recYds: 106, recTD: 0 } },
    ],
  },
  {
    id: "corey-dillon",
    name: "Corey Dillon",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "CIN", games: 16, stats: { rushYds: 1435, rushTD: 7, rec: 22, recYds: 214, recTD: 1 } },
    ],
  },
  {
    id: "warrick-dunn",
    name: "Warrick Dunn",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 1997, team: "TB", games: 16, stats: { rushYds: 1268, rushTD: 4, rec: 39, recYds: 462, recTD: 1 } },
    ],
  },
  {
    id: "edgerrin-james",
    name: "Edgerrin James",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "IND", games: 16, stats: { rushYds: 1709, rushTD: 13, rec: 63, recYds: 594, recTD: 1 } },
    ],
  },
  {
    id: "jamal-anderson",
    name: "Jamal Anderson",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 1998, team: "ATL", games: 16, stats: { rushYds: 1846, rushTD: 14, rec: 27, recYds: 191, recTD: 0 } },
    ],
  },
  {
    id: "steven-jackson",
    name: "Steven Jackson",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2006, team: "STL", games: 16, stats: { rushYds: 1528, rushTD: 13, rec: 90, recYds: 806, recTD: 2 } },
    ],
  },
  {
    id: "deangelo-williams",
    name: "DeAngelo Williams",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2008, team: "CAR", games: 16, stats: { rushYds: 1515, rushTD: 18, rec: 28, recYds: 121, recTD: 1 } },
    ],
  },
  {
    id: "ahman-green",
    name: "Ahman Green",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "GB", games: 16, stats: { rushYds: 1883, rushTD: 15, rec: 50, recYds: 367, recTD: 5 } },
    ],
  },
  {
    id: "tiki-barber",
    name: "Tiki Barber",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "NYG", games: 16, stats: { rushYds: 1860, rushTD: 9, rec: 54, recYds: 530, recTD: 2 } },
    ],
  },
  {
    id: "chris-johnson",
    name: "Chris Johnson",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "TEN", games: 16, stats: { rushYds: 2006, rushTD: 14, rec: 50, recYds: 503, recTD: 2 } },
    ],
  },
  {
    id: "maurice-jones-drew",
    name: "Maurice Jones-Drew",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "JAX", games: 16, stats: { rushYds: 1606, rushTD: 8, rec: 43, recYds: 374, recTD: 2 } },
    ],
  },
  {
    id: "deuce-mcallister",
    name: "Deuce McAllister",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "NO", games: 16, stats: { rushYds: 1641, rushTD: 8, rec: 28, recYds: 210, recTD: 0 } },
    ],
  },
  {
    id: "rudi-johnson",
    name: "Rudi Johnson",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "CIN", games: 16, stats: { rushYds: 1454, rushTD: 12, rec: 26, recYds: 157, recTD: 0 } },
    ],
  },
  {
    id: "michael-turner",
    name: "Michael Turner",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2008, team: "ATL", games: 16, stats: { rushYds: 1699, rushTD: 17, rec: 6, recYds: 44, recTD: 0 } },
    ],
  },
  {
    id: "brian-westbrook",
    name: "Brian Westbrook",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "PHI", games: 16, stats: { rushYds: 1333, rushTD: 8, rec: 90, recYds: 771, recTD: 5 } },
    ],
  },
  {
    id: "matt-forte",
    name: "Matt Forte",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2013, team: "CHI", games: 16, stats: { rushYds: 1339, rushTD: 9, rec: 74, recYds: 594, recTD: 3 } },
    ],
  },
  {
    id: "roger-craig",
    name: "Roger Craig",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 1985, team: "SF", games: 16, stats: { rushYds: 1050, rushTD: 9, rec: 92, recYds: 1016, recTD: 6 } },
    ],
  },
  {
    id: "herschel-walker",
    name: "Herschel Walker",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 1986, team: "DAL", games: 16, stats: { rushYds: 1514, rushTD: 12, rec: 76, recYds: 837, recTD: 2 } },
    ],
  },
  {
    id: "demarco-murray",
    name: "DeMarco Murray",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2014, team: "DAL", games: 16, stats: { rushYds: 1845, rushTD: 13, rec: 57, recYds: 416, recTD: 1 } },
    ],
  },
  {
    id: "le-veon-bell",
    name: "Le'Veon Bell",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2017, team: "PIT", games: 15, stats: { rushYds: 1291, rushTD: 9, rec: 85, recYds: 655, recTD: 2 } },
    ],
  },
  {
    id: "arian-foster",
    name: "Arian Foster",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2012, team: "HOU", games: 16, stats: { rushYds: 1424, rushTD: 15, rec: 40, recYds: 217, recTD: 1 } },
    ],
  },
  {
    id: "thomas-jones",
    name: "Thomas Jones",
    position: "RB",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "NYJ", games: 16, stats: { rushYds: 1402, rushTD: 14, rec: 15, recYds: 121, recTD: 0 } },
    ],
  },

  // ---------------------------------------------------------- WR (hof: false)
  {
    id: "torry-holt",
    name: "Torry Holt",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "STL", games: 16, stats: { rec: 117, recYds: 1696, recTD: 12 } },
    ],
  },
  {
    id: "reggie-wayne",
    name: "Reggie Wayne",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "IND", games: 16, stats: { rec: 104, recYds: 1510, recTD: 10 } },
    ],
  },
  {
    id: "hines-ward",
    name: "Hines Ward",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "PIT", games: 16, stats: { rec: 112, recYds: 1329, recTD: 12 } },
    ],
  },
  {
    id: "anquan-boldin",
    name: "Anquan Boldin",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "ARI", games: 16, stats: { rec: 101, recYds: 1377, recTD: 8 } },
    ],
  },
  {
    id: "steve-smith-sr",
    name: "Steve Smith Sr",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "CAR", games: 16, stats: { rec: 103, recYds: 1563, recTD: 12 } },
    ],
  },
  {
    id: "chad-johnson",
    name: "Chad Johnson",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "CIN", games: 16, stats: { rec: 93, recYds: 1440, recTD: 8 } },
    ],
  },
  {
    id: "wes-welker",
    name: "Wes Welker",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "NE", games: 16, stats: { rec: 122, recYds: 1569, recTD: 9 } },
    ],
  },
  {
    id: "muhsin-muhammad",
    name: "Muhsin Muhammad",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "CAR", games: 16, stats: { rec: 93, recYds: 1405, recTD: 16 } },
    ],
  },
  {
    id: "rod-smith",
    name: "Rod Smith",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "DEN", games: 16, stats: { rec: 100, recYds: 1602, recTD: 5 } },
    ],
  },
  {
    id: "keyshawn-johnson",
    name: "Keyshawn Johnson",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1998, team: "NYJ", games: 16, stats: { rec: 83, recYds: 1131, recTD: 9 } },
    ],
  },
  {
    id: "derrick-mason",
    name: "Derrick Mason",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2000, team: "TEN", games: 16, stats: { rec: 95, recYds: 1128, recTD: 6 } },
    ],
  },
  {
    id: "amani-toomer",
    name: "Amani Toomer",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "NYG", games: 16, stats: { rec: 82, recYds: 1343, recTD: 5 } },
    ],
  },
  {
    id: "plaxico-burress",
    name: "Plaxico Burress",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "NYG", games: 16, stats: { rec: 76, recYds: 1214, recTD: 7 } },
    ],
  },
  {
    id: "laveranues-coles",
    name: "Laveranues Coles",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2003, team: "NYJ", games: 16, stats: { rec: 82, recYds: 1204, recTD: 5 } },
    ],
  },
  {
    id: "santana-moss",
    name: "Santana Moss",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "WAS", games: 16, stats: { rec: 84, recYds: 1483, recTD: 9 } },
    ],
  },
  {
    id: "braylon-edwards",
    name: "Braylon Edwards",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "CLE", games: 16, stats: { rec: 80, recYds: 1289, recTD: 16 } },
    ],
  },
  {
    id: "roddy-white",
    name: "Roddy White",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2010, team: "ATL", games: 16, stats: { rec: 115, recYds: 1389, recTD: 10 } },
    ],
  },
  {
    id: "vincent-jackson",
    name: "Vincent Jackson",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "SD", games: 14, stats: { rec: 68, recYds: 1167, recTD: 9 } },
    ],
  },
  {
    id: "miles-austin",
    name: "Miles Austin",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "DAL", games: 16, stats: { rec: 81, recYds: 1320, recTD: 11 } },
    ],
  },
  {
    id: "desean-jackson",
    name: "DeSean Jackson",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2013, team: "PHI", games: 16, stats: { rec: 82, recYds: 1332, recTD: 9 } },
    ],
  },
  {
    id: "brandon-marshall",
    name: "Brandon Marshall",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2012, team: "CHI", games: 16, stats: { rec: 118, recYds: 1508, recTD: 11 } },
    ],
  },
  {
    id: "herman-moore",
    name: "Herman Moore",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1995, team: "DET", games: 16, stats: { rec: 123, recYds: 1686, recTD: 14 } },
    ],
  },
  {
    id: "sterling-sharpe",
    name: "Sterling Sharpe",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1992, team: "GB", games: 16, stats: { rec: 108, recYds: 1461, recTD: 13 } },
    ],
  },
  {
    id: "andre-rison",
    name: "Andre Rison",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1993, team: "ATL", games: 16, stats: { rec: 86, recYds: 1242, recTD: 15 } },
    ],
  },
  {
    id: "gary-clark",
    name: "Gary Clark",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1991, team: "WAS", games: 16, stats: { rec: 70, recYds: 1340, recTD: 10 } },
    ],
  },
  {
    id: "henry-ellard",
    name: "Henry Ellard",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1988, team: "LAR", games: 16, stats: { rec: 86, recYds: 1414, recTD: 10 } },
    ],
  },
  {
    id: "drew-pearson",
    name: "Drew Pearson",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1977, team: "DAL", games: 14, stats: { rec: 48, recYds: 870, recTD: 6 } },
    ],
  },
  {
    id: "rob-moore",
    name: "Rob Moore",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1997, team: "ARI", games: 16, stats: { rec: 96, recYds: 1584, recTD: 6 } },
    ],
  },
  {
    id: "jimmy-smith-wr",
    name: "Jimmy Smith",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1999, team: "JAX", games: 16, stats: { rec: 116, recYds: 1636, recTD: 7 } },
    ],
  },
  {
    id: "terry-glenn",
    name: "Terry Glenn",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1996, team: "NE", games: 15, stats: { rec: 90, recYds: 1132, recTD: 6 } },
    ],
  },
  {
    id: "eric-moulds",
    name: "Eric Moulds",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 1998, team: "BUF", games: 16, stats: { rec: 67, recYds: 1368, recTD: 5 } },
    ],
  },
  {
    id: "antonio-brown",
    name: "Antonio Brown",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2015, team: "PIT", games: 16, stats: { rec: 136, recYds: 1834, recTD: 10 } },
    ],
  },
  {
    id: "hakeem-nicks",
    name: "Hakeem Nicks",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "NYG", games: 16, stats: { rec: 76, recYds: 1192, recTD: 7 } },
    ],
  },
  {
    id: "victor-cruz",
    name: "Victor Cruz",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "NYG", games: 16, stats: { rec: 82, recYds: 1536, recTD: 9 } },
    ],
  },
  {
    id: "percy-harvin",
    name: "Percy Harvin",
    position: "WR",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "MIN", games: 16, stats: { rec: 87, recYds: 967, recTD: 6, rushYds: 345, rushTD: 2 } },
    ],
  },

  // ---------------------------------------------------------- TE (hof: false)
  {
    id: "jimmy-graham",
    name: "Jimmy Graham",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2013, team: "NO", games: 16, stats: { rec: 86, recYds: 1215, recTD: 16 } },
    ],
  },
  {
    id: "rob-gronkowski",
    name: "Rob Gronkowski",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "NE", games: 16, stats: { rec: 90, recYds: 1327, recTD: 17 } },
    ],
  },
  {
    id: "vernon-davis",
    name: "Vernon Davis",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2009, team: "SF", games: 16, stats: { rec: 78, recYds: 965, recTD: 13 } },
    ],
  },
  {
    id: "greg-olsen",
    name: "Greg Olsen",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2015, team: "CAR", games: 16, stats: { rec: 77, recYds: 1104, recTD: 7 } },
    ],
  },
  {
    id: "jeremy-shockey",
    name: "Jeremy Shockey",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2002, team: "NYG", games: 16, stats: { rec: 74, recYds: 894, recTD: 2 } },
    ],
  },
  {
    id: "todd-christensen",
    name: "Todd Christensen",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 1983, team: "OAK", games: 16, stats: { rec: 92, recYds: 1247, recTD: 12 } },
    ],
  },
  {
    id: "mark-bavaro",
    name: "Mark Bavaro",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 1986, team: "NYG", games: 16, stats: { rec: 66, recYds: 1001, recTD: 4 } },
    ],
  },
  {
    id: "keith-jackson",
    name: "Keith Jackson",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 1988, team: "PHI", games: 15, stats: { rec: 81, recYds: 869, recTD: 6 } },
    ],
  },
  {
    id: "ben-coates",
    name: "Ben Coates",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 1994, team: "NE", games: 16, stats: { rec: 96, recYds: 1174, recTD: 7 } },
    ],
  },
  {
    id: "wesley-walls",
    name: "Wesley Walls",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 1999, team: "CAR", games: 16, stats: { rec: 68, recYds: 822, recTD: 12 } },
    ],
  },
  {
    id: "chris-cooley",
    name: "Chris Cooley",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2005, team: "WAS", games: 16, stats: { rec: 71, recYds: 852, recTD: 7 } },
    ],
  },
  {
    id: "kellen-winslow-ii",
    name: "Kellen Winslow II",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2007, team: "CLE", games: 16, stats: { rec: 82, recYds: 1106, recTD: 5 } },
    ],
  },
  {
    id: "delanie-walker",
    name: "Delanie Walker",
    position: "TE",
    tag: "HOVG",
    seasons: [
      { year: 2016, team: "TEN", games: 16, stats: { rec: 65, recYds: 800, recTD: 7 } },
    ],
  },

  // ============================================================
  // ACTIVE players: approximate top-100 2026 fantasy ADP pool,
  // assembled from web search across multiple outlets in Aug 2026
  // (no single source gave a full ordered top-100, so this is a
  // merged/best-effort snapshot -- expect some drift from any one
  // site's live ADP). Each entry's single "season" is a FORMULAIC
  // projection (not a specific analyst's real number): a smooth
  // curve per position tied to that player's approximate ADP tier,
  // used only so the existing scoring engine has a stat line to
  // work with -- same games:16, same calculateFantasyPoints() path
  // as every retired player. tag: "ACTIVE" on every entry.
  // ============================================================

  // ---------------------------------------------------------- QB (tag: "ACTIVE")
  {
    id: "josh-allen",
    name: "Josh Allen",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BUF", games: 16, stats: { passYds: 4650, passTD: 36, passInt: 9, rushYds: 550, rushTD: 4 } },
    ],
  },
  {
    id: "lamar-jackson",
    name: "Lamar Jackson",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BAL", games: 16, stats: { passYds: 4555, passTD: 35, passInt: 9, rushYds: 525, rushTD: 4 } },
    ],
  },
  {
    id: "joe-burrow",
    name: "Joe Burrow",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CIN", games: 16, stats: { passYds: 4460, passTD: 34, passInt: 10, rushYds: 110, rushTD: 1 } },
    ],
  },
  {
    id: "drake-maye",
    name: "Drake Maye",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NE", games: 16, stats: { passYds: 4365, passTD: 33, passInt: 10, rushYds: 475, rushTD: 4 } },
    ],
  },
  {
    id: "jalen-hurts",
    name: "Jalen Hurts",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "PHI", games: 16, stats: { passYds: 4270, passTD: 32, passInt: 10, rushYds: 450, rushTD: 3 } },
    ],
  },
  {
    id: "caleb-williams",
    name: "Caleb Williams",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CHI", games: 16, stats: { passYds: 4175, passTD: 31, passInt: 11, rushYds: 425, rushTD: 3 } },
    ],
  },
  {
    id: "justin-herbert",
    name: "Justin Herbert",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAC", games: 16, stats: { passYds: 4080, passTD: 29, passInt: 11, rushYds: 90, rushTD: 1 } },
    ],
  },
  {
    id: "jayden-daniels",
    name: "Jayden Daniels",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "WAS", games: 16, stats: { passYds: 3985, passTD: 28, passInt: 11, rushYds: 375, rushTD: 3 } },
    ],
  },
  {
    id: "trevor-lawrence",
    name: "Trevor Lawrence",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "JAX", games: 16, stats: { passYds: 3890, passTD: 27, passInt: 11, rushYds: 80, rushTD: 1 } },
    ],
  },
  {
    id: "dak-prescott",
    name: "Dak Prescott",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DAL", games: 16, stats: { passYds: 3795, passTD: 26, passInt: 12, rushYds: 75, rushTD: 1 } },
    ],
  },
  {
    id: "jared-goff",
    name: "Jared Goff",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DET", games: 16, stats: { passYds: 3700, passTD: 25, passInt: 12, rushYds: 70, rushTD: 1 } },
    ],
  },
  {
    id: "cj-stroud",
    name: "C.J. Stroud",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "HOU", games: 16, stats: { passYds: 3605, passTD: 24, passInt: 12, rushYds: 65, rushTD: 0 } },
    ],
  },
  {
    id: "patrick-mahomes",
    name: "Patrick Mahomes",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "KC", games: 16, stats: { passYds: 3510, passTD: 23, passInt: 13, rushYds: 250, rushTD: 2 } },
    ],
  },
  {
    id: "bo-nix",
    name: "Bo Nix",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DEN", games: 16, stats: { passYds: 3415, passTD: 22, passInt: 13, rushYds: 225, rushTD: 2 } },
    ],
  },
  {
    id: "baker-mayfield",
    name: "Baker Mayfield",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "TB", games: 16, stats: { passYds: 3320, passTD: 21, passInt: 13, rushYds: 50, rushTD: 0 } },
    ],
  },
  {
    id: "matthew-stafford",
    name: "Matthew Stafford",
    position: "QB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAR", games: 16, stats: { passYds: 3225, passTD: 20, passInt: 14, rushYds: 45, rushTD: 0 } },
    ],
  },

  // ---------------------------------------------------------- RB (tag: "ACTIVE")
  {
    id: "jahmyr-gibbs",
    name: "Jahmyr Gibbs",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DET", games: 16, stats: { rushYds: 1500, rushTD: 13, rec: 55, recYds: 430, recTD: 3 } },
    ],
  },
  {
    id: "bijan-robinson",
    name: "Bijan Robinson",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ATL", games: 16, stats: { rushYds: 1462, rushTD: 13, rec: 54, recYds: 419, recTD: 3 } },
    ],
  },
  {
    id: "christian-mccaffrey",
    name: "Christian McCaffrey",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "SF", games: 16, stats: { rushYds: 1424, rushTD: 12, rec: 52, recYds: 408, recTD: 3 } },
    ],
  },
  {
    id: "jonathan-taylor",
    name: "Jonathan Taylor",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "IND", games: 16, stats: { rushYds: 1386, rushTD: 12, rec: 51, recYds: 397, recTD: 3 } },
    ],
  },
  {
    id: "james-cook-iii",
    name: "James Cook III",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BUF", games: 16, stats: { rushYds: 1348, rushTD: 12, rec: 50, recYds: 386, recTD: 3 } },
    ],
  },
  {
    id: "devon-achane",
    name: "De'Von Achane",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "MIA", games: 16, stats: { rushYds: 1310, rushTD: 11, rec: 49, recYds: 375, recTD: 3 } },
    ],
  },
  {
    id: "chase-brown",
    name: "Chase Brown",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CIN", games: 16, stats: { rushYds: 1272, rushTD: 11, rec: 47, recYds: 364, recTD: 3 } },
    ],
  },
  {
    id: "derrick-henry",
    name: "Derrick Henry",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BAL", games: 16, stats: { rushYds: 1234, rushTD: 11, rec: 46, recYds: 353, recTD: 3 } },
    ],
  },
  {
    id: "kenneth-walker-iii",
    name: "Kenneth Walker III",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "SEA", games: 16, stats: { rushYds: 1196, rushTD: 10, rec: 45, recYds: 342, recTD: 2 } },
    ],
  },
  {
    id: "jeremiyah-love",
    name: "Jeremiyah Love",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ARI", games: 16, stats: { rushYds: 1158, rushTD: 10, rec: 43, recYds: 331, recTD: 2 } },
    ],
  },
  {
    id: "omarion-hampton",
    name: "Omarion Hampton",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAC", games: 16, stats: { rushYds: 1120, rushTD: 10, rec: 42, recYds: 320, recTD: 2 } },
    ],
  },
  {
    id: "javonte-williams",
    name: "Javonte Williams",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DAL", games: 16, stats: { rushYds: 1082, rushTD: 9, rec: 41, recYds: 309, recTD: 2 } },
    ],
  },
  {
    id: "breece-hall",
    name: "Breece Hall",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NYJ", games: 16, stats: { rushYds: 1044, rushTD: 9, rec: 39, recYds: 298, recTD: 2 } },
    ],
  },
  {
    id: "kyren-williams",
    name: "Kyren Williams",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAR", games: 16, stats: { rushYds: 1006, rushTD: 8, rec: 38, recYds: 287, recTD: 2 } },
    ],
  },
  {
    id: "cam-skattebo",
    name: "Cam Skattebo",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NYG", games: 16, stats: { rushYds: 854, rushTD: 7, rec: 33, recYds: 243, recTD: 2 } },
    ],
  },
  {
    id: "bucky-irving",
    name: "Bucky Irving",
    position: "RB",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "TB", games: 16, stats: { rushYds: 626, rushTD: 5, rec: 25, recYds: 177, recTD: 1 } },
    ],
  },

  // ---------------------------------------------------------- WR (tag: "ACTIVE")
  {
    id: "jamarr-chase",
    name: "Ja'Marr Chase",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CIN", games: 16, stats: { rec: 95, recYds: 1300, recTD: 9 } },
    ],
  },
  {
    id: "puka-nacua",
    name: "Puka Nacua",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAR", games: 16, stats: { rec: 93, recYds: 1278, recTD: 9 } },
    ],
  },
  {
    id: "jaxon-smith-njigba",
    name: "Jaxon Smith-Njigba",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "SEA", games: 16, stats: { rec: 92, recYds: 1256, recTD: 9 } },
    ],
  },
  {
    id: "amon-ra-st-brown",
    name: "Amon-Ra St. Brown",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DET", games: 16, stats: { rec: 90, recYds: 1234, recTD: 8 } },
    ],
  },
  {
    id: "justin-jefferson",
    name: "Justin Jefferson",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "MIN", games: 16, stats: { rec: 89, recYds: 1212, recTD: 8 } },
    ],
  },
  {
    id: "ceedee-lamb",
    name: "CeeDee Lamb",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DAL", games: 16, stats: { rec: 87, recYds: 1190, recTD: 8 } },
    ],
  },
  {
    id: "drake-london",
    name: "Drake London",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ATL", games: 16, stats: { rec: 85, recYds: 1168, recTD: 8 } },
    ],
  },
  {
    id: "nico-collins",
    name: "Nico Collins",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "HOU", games: 16, stats: { rec: 84, recYds: 1146, recTD: 8 } },
    ],
  },
  {
    id: "aj-brown",
    name: "A.J. Brown",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NE", games: 16, stats: { rec: 82, recYds: 1124, recTD: 8 } },
    ],
  },
  {
    id: "rashee-rice",
    name: "Rashee Rice",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "KC", games: 16, stats: { rec: 81, recYds: 1102, recTD: 7 } },
    ],
  },
  {
    id: "malik-nabers",
    name: "Malik Nabers",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NYG", games: 16, stats: { rec: 79, recYds: 1080, recTD: 7 } },
    ],
  },
  {
    id: "marvin-harrison-jr",
    name: "Marvin Harrison Jr.",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ARI", games: 16, stats: { rec: 77, recYds: 1058, recTD: 7 } },
    ],
  },
  {
    id: "tee-higgins",
    name: "Tee Higgins",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CIN", games: 16, stats: { rec: 76, recYds: 1036, recTD: 7 } },
    ],
  },
  {
    id: "devonta-smith",
    name: "DeVonta Smith",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "PHI", games: 16, stats: { rec: 74, recYds: 1014, recTD: 7 } },
    ],
  },
  {
    id: "dk-metcalf",
    name: "DK Metcalf",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "PIT", games: 16, stats: { rec: 73, recYds: 992, recTD: 7 } },
    ],
  },
  {
    id: "garrett-wilson",
    name: "Garrett Wilson",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NYJ", games: 16, stats: { rec: 69, recYds: 948, recTD: 6 } },
    ],
  },
  {
    id: "zay-flowers",
    name: "Zay Flowers",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BAL", games: 16, stats: { rec: 68, recYds: 926, recTD: 6 } },
    ],
  },
  {
    id: "jaylen-waddle",
    name: "Jaylen Waddle",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "MIA", games: 16, stats: { rec: 66, recYds: 904, recTD: 6 } },
    ],
  },
  {
    id: "chris-olave",
    name: "Chris Olave",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "NO", games: 16, stats: { rec: 65, recYds: 882, recTD: 6 } },
    ],
  },
  {
    id: "rome-odunze",
    name: "Rome Odunze",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CHI", games: 16, stats: { rec: 61, recYds: 838, recTD: 5 } },
    ],
  },
  {
    id: "ladd-mcconkey",
    name: "Ladd McConkey",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LAC", games: 16, stats: { rec: 60, recYds: 816, recTD: 5 } },
    ],
  },
  {
    id: "jameson-williams",
    name: "Jameson Williams",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DET", games: 16, stats: { rec: 57, recYds: 772, recTD: 5 } },
    ],
  },
  {
    id: "michael-pittman-jr",
    name: "Michael Pittman Jr.",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "IND", games: 16, stats: { rec: 50, recYds: 684, recTD: 4 } },
    ],
  },
  {
    id: "jauan-jennings",
    name: "Jauan Jennings",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "SF", games: 16, stats: { rec: 49, recYds: 662, recTD: 4 } },
    ],
  },
  {
    id: "deebo-samuel",
    name: "Deebo Samuel",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "WAS", games: 16, stats: { rec: 45, recYds: 618, recTD: 4 } },
    ],
  },
  {
    id: "michael-wilson",
    name: "Michael Wilson",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ARI", games: 16, stats: { rec: 42, recYds: 574, recTD: 3 } },
    ],
  },
  {
    id: "tetairoa-mcmillan",
    name: "Tetairoa McMillan",
    position: "WR",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CAR", games: 16, stats: { rec: 39, recYds: 530, recTD: 3 } },
    ],
  },

  // ---------------------------------------------------------- TE (tag: "ACTIVE")
  {
    id: "trey-mcbride",
    name: "Trey McBride",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "ARI", games: 16, stats: { rec: 78, recYds: 950, recTD: 7 } },
    ],
  },
  {
    id: "brock-bowers",
    name: "Brock Bowers",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "LV", games: 16, stats: { rec: 75, recYds: 912, recTD: 7 } },
    ],
  },
  {
    id: "tyler-warren",
    name: "Tyler Warren",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "IND", games: 16, stats: { rec: 72, recYds: 874, recTD: 6 } },
    ],
  },
  {
    id: "harold-fannin-jr",
    name: "Harold Fannin Jr.",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CLE", games: 16, stats: { rec: 69, recYds: 836, recTD: 6 } },
    ],
  },
  {
    id: "colston-loveland",
    name: "Colston Loveland",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "CHI", games: 16, stats: { rec: 66, recYds: 798, recTD: 6 } },
    ],
  },
  {
    id: "tucker-kraft",
    name: "Tucker Kraft",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "GB", games: 16, stats: { rec: 63, recYds: 760, recTD: 6 } },
    ],
  },
  {
    id: "dallas-goedert",
    name: "Dallas Goedert",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "PHI", games: 16, stats: { rec: 57, recYds: 684, recTD: 5 } },
    ],
  },
  {
    id: "travis-kelce",
    name: "Travis Kelce",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "KC", games: 16, stats: { rec: 51, recYds: 608, recTD: 4 } },
    ],
  },
  {
    id: "jake-ferguson",
    name: "Jake Ferguson",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DAL", games: 16, stats: { rec: 48, recYds: 570, recTD: 4 } },
    ],
  },
  {
    id: "isaiah-likely",
    name: "Isaiah Likely",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BAL", games: 16, stats: { rec: 42, recYds: 494, recTD: 3 } },
    ],
  },
  {
    id: "sam-laporta",
    name: "Sam LaPorta",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "DET", games: 16, stats: { rec: 39, recYds: 456, recTD: 3 } },
    ],
  },
  {
    id: "george-kittle",
    name: "George Kittle",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "SF", games: 16, stats: { rec: 36, recYds: 418, recTD: 3 } },
    ],
  },
  {
    id: "mark-andrews",
    name: "Mark Andrews",
    position: "TE",
    tag: "ACTIVE",
    seasons: [
      { year: 2026, team: "BAL", games: 16, stats: { rec: 33, recYds: 380, recTD: 3 } },
    ],
  },
];
