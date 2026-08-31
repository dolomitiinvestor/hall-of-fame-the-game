// Notable all-time kicker seasons. Approximate/hand-compiled like the
// rest of this prototype's data. Scoring in v1 is a flat rate per FG
// made (no distance tiers) plus extra points made -- see DEFAULT_SCORING_RULES
// in js/scoring.js.
//
// tag: mostly "HOVG" since only one pure placekicker (Jan Stenerud) is
// in the Pro Football Hall of Fame and he isn't in this list; kickers
// still active as of this writing are tagged "ACTIVE". Position "K"
// is exempt from the draft's retired/active alternation regardless
// (see SKILL_POSITIONS in draftEngine.js), so the tag here is mainly
// for the badge/filter display.

export const KICKERS = [
  {
    id: "gary-anderson-k",
    name: "Gary Anderson",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 1998, team: "MIN", games: 16, stats: { fgMade: 35, xpMade: 59 } },
    ],
  },
  {
    id: "justin-tucker",
    name: "Justin Tucker",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2016, team: "BAL", games: 16, stats: { fgMade: 38, xpMade: 38 } },
    ],
  },
  {
    id: "david-akers",
    name: "David Akers",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "SF", games: 16, stats: { fgMade: 44, xpMade: 32 } },
    ],
  },
  {
    id: "adam-vinatieri",
    name: "Adam Vinatieri",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2004, team: "NE", games: 16, stats: { fgMade: 31, xpMade: 37 } },
    ],
  },
  {
    id: "jason-elam",
    name: "Jason Elam",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 1998, team: "DEN", games: 16, stats: { fgMade: 24, xpMade: 49 } },
    ],
  },
  {
    id: "morten-andersen",
    name: "Morten Andersen",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 1995, team: "ATL", games: 16, stats: { fgMade: 28, xpMade: 35 } },
    ],
  },
  {
    id: "sebastian-janikowski",
    name: "Sebastian Janikowski",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "OAK", games: 16, stats: { fgMade: 31, xpMade: 26 } },
    ],
  },
  {
    id: "greg-zuerlein",
    name: "Greg Zuerlein",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2017, team: "LAR", games: 16, stats: { fgMade: 38, xpMade: 45 } },
    ],
  },
  {
    id: "harrison-butker",
    name: "Harrison Butker",
    position: "K",
    tag: "ACTIVE",
    seasons: [
      { year: 2022, team: "KC", games: 16, stats: { fgMade: 33, xpMade: 50 } },
    ],
  },
  {
    id: "matt-prater",
    name: "Matt Prater",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2013, team: "DEN", games: 16, stats: { fgMade: 25, xpMade: 61 } },
    ],
  },
  {
    id: "stephen-gostkowski",
    name: "Stephen Gostkowski",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2008, team: "NE", games: 16, stats: { fgMade: 36, xpMade: 36 } },
    ],
  },
  {
    id: "mason-crosby",
    name: "Mason Crosby",
    position: "K",
    tag: "HOVG",
    seasons: [
      { year: 2011, team: "GB", games: 16, stats: { fgMade: 22, xpMade: 60 } },
    ],
  },
];
