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
// Several seasons below are intentionally shorter than 16 games
// (strike years, wartime schedules, early-NFL 14-game seasons) so the
// "repeat a shortened season's per-game rate across all 16 weeks"
// logic in scoring.js gets exercised by real data.

export const PLAYERS = [
  // ---------------------------------------------------------------- QB
  {
    id: "dan-marino",
    name: "Dan Marino",
    position: "QB",
    seasons: [
      { year: 1984, team: "MIA", games: 16, stats: { passYds: 5084, passTD: 48, passInt: 17 } },
    ],
  },
  {
    id: "peyton-manning",
    name: "Peyton Manning",
    position: "QB",
    seasons: [
      { year: 2004, team: "IND", games: 16, stats: { passYds: 4557, passTD: 49, passInt: 10 } },
      { year: 2013, team: "DEN", games: 16, stats: { passYds: 5477, passTD: 55, passInt: 10 } },
    ],
  },
  {
    id: "kurt-warner",
    name: "Kurt Warner",
    position: "QB",
    seasons: [
      { year: 1999, team: "STL", games: 16, stats: { passYds: 4353, passTD: 41, passInt: 13 } },
    ],
  },
  {
    id: "steve-young",
    name: "Steve Young",
    position: "QB",
    seasons: [
      { year: 1994, team: "SF", games: 16, stats: { passYds: 3969, passTD: 35, passInt: 10, rushYds: 293, rushTD: 7 } },
    ],
  },
  {
    id: "brett-favre",
    name: "Brett Favre",
    position: "QB",
    seasons: [
      { year: 1996, team: "GB", games: 16, stats: { passYds: 3899, passTD: 39, passInt: 13 } },
    ],
  },
  {
    id: "warren-moon",
    name: "Warren Moon",
    position: "QB",
    seasons: [
      { year: 1991, team: "HOU", games: 16, stats: { passYds: 4690, passTD: 23, passInt: 21 } },
    ],
  },
  {
    id: "john-elway",
    name: "John Elway",
    position: "QB",
    seasons: [
      { year: 1993, team: "DEN", games: 16, stats: { passYds: 4030, passTD: 25, passInt: 10 } },
    ],
  },
  {
    id: "fran-tarkenton",
    name: "Fran Tarkenton",
    position: "QB",
    seasons: [
      { year: 1975, team: "MIN", games: 14, stats: { passYds: 2994, passTD: 25, passInt: 13 } },
    ],
  },
  {
    id: "dan-fouts",
    name: "Dan Fouts",
    position: "QB",
    seasons: [
      { year: 1981, team: "SD", games: 16, stats: { passYds: 4802, passTD: 33, passInt: 17 } },
    ],
  },
  {
    id: "joe-montana",
    name: "Joe Montana",
    position: "QB",
    seasons: [
      { year: 1989, team: "SF", games: 16, stats: { passYds: 3521, passTD: 26, passInt: 8 } },
    ],
  },
  {
    id: "troy-aikman",
    name: "Troy Aikman",
    position: "QB",
    seasons: [
      { year: 1993, team: "DAL", games: 14, stats: { passYds: 3100, passTD: 15, passInt: 6 } },
    ],
  },
  {
    id: "terry-bradshaw",
    name: "Terry Bradshaw",
    position: "QB",
    seasons: [
      { year: 1978, team: "PIT", games: 14, stats: { passYds: 2915, passTD: 28, passInt: 20 } },
    ],
  },

  // ---------------------------------------------------------------- RB
  {
    id: "jim-brown",
    name: "Jim Brown",
    position: "RB",
    seasons: [
      { year: 1963, team: "CLE", games: 14, stats: { rushYds: 1863, rushTD: 12, rec: 24, recYds: 268, recTD: 3 } },
    ],
  },
  {
    id: "barry-sanders",
    name: "Barry Sanders",
    position: "RB",
    seasons: [
      { year: 1997, team: "DET", games: 16, stats: { rushYds: 2053, rushTD: 11, rec: 33, recYds: 305, recTD: 1 } },
    ],
  },
  {
    id: "emmitt-smith",
    name: "Emmitt Smith",
    position: "RB",
    seasons: [
      { year: 1995, team: "DAL", games: 16, stats: { rushYds: 1773, rushTD: 25, rec: 62, recYds: 375, recTD: 0 } },
    ],
  },
  {
    id: "walter-payton",
    name: "Walter Payton",
    position: "RB",
    seasons: [
      { year: 1977, team: "CHI", games: 14, stats: { rushYds: 1852, rushTD: 14, rec: 27, recYds: 269, recTD: 2 } },
    ],
  },
  {
    id: "oj-simpson",
    name: "O.J. Simpson",
    position: "RB",
    seasons: [
      { year: 1973, team: "BUF", games: 14, stats: { rushYds: 2003, rushTD: 12, rec: 6, recYds: 70, recTD: 0 } },
    ],
  },
  {
    id: "eric-dickerson",
    name: "Eric Dickerson",
    position: "RB",
    seasons: [
      { year: 1984, team: "LAR", games: 16, stats: { rushYds: 2105, rushTD: 14, rec: 21, recYds: 139, recTD: 1 } },
    ],
  },
  {
    id: "marshall-faulk",
    name: "Marshall Faulk",
    position: "RB",
    seasons: [
      { year: 2000, team: "STL", games: 14, stats: { rushYds: 1359, rushTD: 18, rec: 81, recYds: 830, recTD: 8 } },
    ],
  },
  {
    id: "ladainian-tomlinson",
    name: "LaDainian Tomlinson",
    position: "RB",
    seasons: [
      { year: 2006, team: "SD", games: 16, stats: { rushYds: 1815, rushTD: 28, rec: 56, recYds: 508, recTD: 3 } },
    ],
  },
  {
    id: "earl-campbell",
    name: "Earl Campbell",
    position: "RB",
    seasons: [
      { year: 1980, team: "HOU", games: 16, stats: { rushYds: 1934, rushTD: 13, rec: 6, recYds: 47, recTD: 0 } },
    ],
  },
  {
    id: "tony-dorsett",
    name: "Tony Dorsett",
    position: "RB",
    seasons: [
      { year: 1981, team: "DAL", games: 16, stats: { rushYds: 1646, rushTD: 4, rec: 32, recYds: 325, recTD: 2 } },
    ],
  },
  {
    id: "thurman-thomas",
    name: "Thurman Thomas",
    position: "RB",
    seasons: [
      { year: 1991, team: "BUF", games: 16, stats: { rushYds: 1407, rushTD: 7, rec: 62, recYds: 631, recTD: 5 } },
    ],
  },
  {
    id: "marcus-allen",
    name: "Marcus Allen",
    position: "RB",
    seasons: [
      { year: 1985, team: "LAR", games: 16, stats: { rushYds: 1759, rushTD: 11, rec: 67, recYds: 555, recTD: 3 } },
    ],
  },
  {
    id: "franco-harris",
    name: "Franco Harris",
    position: "RB",
    seasons: [
      { year: 1975, team: "PIT", games: 14, stats: { rushYds: 1246, rushTD: 10, rec: 28, recYds: 179, recTD: 1 } },
    ],
  },
  {
    id: "gale-sayers",
    name: "Gale Sayers",
    position: "RB",
    seasons: [
      { year: 1965, team: "CHI", games: 14, stats: { rushYds: 867, rushTD: 14, rec: 29, recYds: 507, recTD: 6 } },
    ],
  },
  {
    id: "terrell-davis",
    name: "Terrell Davis",
    position: "RB",
    seasons: [
      { year: 1998, team: "DEN", games: 16, stats: { rushYds: 2008, rushTD: 21, rec: 25, recYds: 217, recTD: 2 } },
    ],
  },
  {
    id: "curtis-martin",
    name: "Curtis Martin",
    position: "RB",
    seasons: [
      { year: 2004, team: "NYJ", games: 16, stats: { rushYds: 1697, rushTD: 12, rec: 22, recYds: 137, recTD: 0 } },
    ],
  },

  // ---------------------------------------------------------------- WR
  {
    id: "jerry-rice",
    name: "Jerry Rice",
    position: "WR",
    seasons: [
      { year: 1995, team: "SF", games: 16, stats: { rec: 122, recYds: 1848, recTD: 15 } },
    ],
  },
  {
    id: "randy-moss",
    name: "Randy Moss",
    position: "WR",
    seasons: [
      { year: 2007, team: "NE", games: 16, stats: { rec: 98, recYds: 1493, recTD: 23 } },
    ],
  },
  {
    id: "don-hutson",
    name: "Don Hutson",
    position: "WR",
    seasons: [
      { year: 1942, team: "GB", games: 11, stats: { rec: 74, recYds: 1211, recTD: 17 } },
    ],
  },
  {
    id: "steve-largent",
    name: "Steve Largent",
    position: "WR",
    seasons: [
      { year: 1985, team: "SEA", games: 16, stats: { rec: 79, recYds: 1287, recTD: 6 } },
    ],
  },
  {
    id: "michael-irvin",
    name: "Michael Irvin",
    position: "WR",
    seasons: [
      { year: 1995, team: "DAL", games: 16, stats: { rec: 111, recYds: 1603, recTD: 10 } },
    ],
  },
  {
    id: "cris-carter",
    name: "Cris Carter",
    position: "WR",
    seasons: [
      { year: 1995, team: "MIN", games: 16, stats: { rec: 122, recYds: 1371, recTD: 17 } },
    ],
  },
  {
    id: "andre-reed",
    name: "Andre Reed",
    position: "WR",
    seasons: [
      { year: 1994, team: "BUF", games: 16, stats: { rec: 90, recYds: 1303, recTD: 4 } },
    ],
  },
  {
    id: "art-monk",
    name: "Art Monk",
    position: "WR",
    seasons: [
      { year: 1984, team: "WAS", games: 16, stats: { rec: 106, recYds: 1372, recTD: 7 } },
    ],
  },
  {
    id: "lance-alworth",
    name: "Lance Alworth",
    position: "WR",
    seasons: [
      { year: 1965, team: "SD", games: 14, stats: { rec: 69, recYds: 1602, recTD: 14 } },
    ],
  },
  {
    id: "james-lofton",
    name: "James Lofton",
    position: "WR",
    seasons: [
      { year: 1984, team: "GB", games: 16, stats: { rec: 62, recYds: 1361, recTD: 7 } },
    ],
  },
  {
    id: "tim-brown",
    name: "Tim Brown",
    position: "WR",
    seasons: [
      { year: 1997, team: "OAK", games: 16, stats: { rec: 104, recYds: 1408, recTD: 5 } },
    ],
  },
  {
    id: "terrell-owens",
    name: "Terrell Owens",
    position: "WR",
    seasons: [
      { year: 2000, team: "SF", games: 16, stats: { rec: 97, recYds: 1451, recTD: 13 } },
    ],
  },
  {
    id: "isaac-bruce",
    name: "Isaac Bruce",
    position: "WR",
    seasons: [
      { year: 1995, team: "STL", games: 16, stats: { rec: 119, recYds: 1781, recTD: 13 } },
    ],
  },

  // ---------------------------------------------------------------- TE
  {
    id: "tony-gonzalez",
    name: "Tony Gonzalez",
    position: "TE",
    seasons: [
      { year: 2004, team: "KC", games: 16, stats: { rec: 102, recYds: 1258, recTD: 7 } },
    ],
  },
  {
    id: "shannon-sharpe",
    name: "Shannon Sharpe",
    position: "TE",
    seasons: [
      { year: 1996, team: "DEN", games: 16, stats: { rec: 80, recYds: 1062, recTD: 10 } },
    ],
  },
  {
    id: "kellen-winslow",
    name: "Kellen Winslow",
    position: "TE",
    seasons: [
      { year: 1980, team: "SD", games: 16, stats: { rec: 89, recYds: 1290, recTD: 9 } },
    ],
  },
  {
    id: "ozzie-newsome",
    name: "Ozzie Newsome",
    position: "TE",
    seasons: [
      { year: 1984, team: "CLE", games: 16, stats: { rec: 89, recYds: 1001, recTD: 5 } },
    ],
  },
  {
    id: "dave-casper",
    name: "Dave Casper",
    position: "TE",
    seasons: [
      { year: 1977, team: "OAK", games: 14, stats: { rec: 48, recYds: 584, recTD: 6 } },
    ],
  },
];
