// Top coaches, all time: 10 NFL head coaches + 4 college head coaches.
// Approximate/best-effort career win-loss records, championship counts,
// and championship-game/national-title-game appearances, hand-compiled
// like the rest of this prototype's data -- not a verified statistical
// source. `tag` follows the same HOF/HOVG/ACTIVE vocabulary as players:
// HOF = actually enshrined (Pro or College Football Hall of Fame as a
// coach); HOVG = a real, well-known non-enshrinement; ACTIVE = still
// coaching.
//
// Coaches intentionally have NO scoring stats yet: `seasons` holds one
// placeholder entry with `stats: {}`, which already scores 0 through
// the normal calculateFantasyPoints() formula with zero special-casing.
// `record` (career W-L-T, titles, titleAppearances) is separate,
// display-only data read by formatSeasonLine() in js/players.js. This
// is the seam for the coach point-modifier planned later -- give
// calculateFantasyPoints() a coach-aware rule and/or put real per-season
// stats in `seasons` and nothing else here needs to change.

export const COACHES = [
  // ------------------------------------------------------------ NFL (top 10)
  {
    id: "coach-don-shula",
    name: "Don Shula",
    position: "COACH",
    tag: "HOF",
    record: { wins: 347, losses: 173, ties: 6, titles: 2, titleAppearances: 6 },
    seasons: [{ year: 1995, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-george-halas",
    name: "George Halas",
    position: "COACH",
    tag: "HOF",
    record: { wins: 318, losses: 148, ties: 31, titles: 6, titleAppearances: 7 },
    seasons: [{ year: 1967, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-bill-belichick",
    name: "Bill Belichick",
    position: "COACH",
    tag: "HOVG",
    record: { wins: 333, losses: 178, ties: 0, titles: 6, titleAppearances: 9 },
    seasons: [{ year: 2023, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-tom-landry",
    name: "Tom Landry",
    position: "COACH",
    tag: "HOF",
    record: { wins: 250, losses: 162, ties: 6, titles: 2, titleAppearances: 5 },
    seasons: [{ year: 1977, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-curly-lambeau",
    name: "Curly Lambeau",
    position: "COACH",
    tag: "HOF",
    record: { wins: 226, losses: 132, ties: 22, titles: 6, titleAppearances: 6 },
    seasons: [{ year: 1944, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-andy-reid",
    name: "Andy Reid",
    position: "COACH",
    tag: "ACTIVE",
    record: { wins: 271, losses: 145, ties: 1, titles: 3, titleAppearances: 5 },
    seasons: [{ year: 2024, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-chuck-noll",
    name: "Chuck Noll",
    position: "COACH",
    tag: "HOF",
    record: { wins: 209, losses: 156, ties: 1, titles: 4, titleAppearances: 4 },
    seasons: [{ year: 1979, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-paul-brown",
    name: "Paul Brown",
    position: "COACH",
    tag: "HOF",
    record: { wins: 213, losses: 104, ties: 9, titles: 7, titleAppearances: 10 },
    seasons: [{ year: 1955, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-dan-reeves",
    name: "Dan Reeves",
    position: "COACH",
    tag: "HOVG",
    record: { wins: 201, losses: 174, ties: 2, titles: 0, titleAppearances: 4 },
    seasons: [{ year: 1998, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-marty-schottenheimer",
    name: "Marty Schottenheimer",
    position: "COACH",
    tag: "HOVG",
    record: { wins: 200, losses: 126, ties: 1, titles: 0, titleAppearances: 0 },
    seasons: [{ year: 1998, team: null, games: 16, stats: {} }],
  },

  // ------------------------------------------------------ College (top 4)
  {
    id: "coach-nick-saban",
    name: "Nick Saban",
    position: "COACH",
    tag: "HOVG",
    record: { wins: 292, losses: 71, ties: 1, titles: 7, titleAppearances: 11 },
    seasons: [{ year: 2020, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-bobby-bowden",
    name: "Bobby Bowden",
    position: "COACH",
    tag: "HOF",
    record: { wins: 377, losses: 129, ties: 4, titles: 2, titleAppearances: 5 },
    seasons: [{ year: 1999, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-bear-bryant",
    name: "Bear Bryant",
    position: "COACH",
    tag: "HOF",
    record: { wins: 323, losses: 85, ties: 17, titles: 6, titleAppearances: 8 },
    seasons: [{ year: 1979, team: null, games: 16, stats: {} }],
  },
  {
    id: "coach-urban-meyer",
    name: "Urban Meyer",
    position: "COACH",
    tag: "HOVG",
    record: { wins: 187, losses: 32, ties: 0, titles: 3, titleAppearances: 4 },
    seasons: [{ year: 2018, team: null, games: 16, stats: {} }],
  },
];
