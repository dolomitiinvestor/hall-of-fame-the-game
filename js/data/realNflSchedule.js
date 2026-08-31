// Real (not generated) NFL schedule data, sourced via web search across
// several outlets in Aug 2026. This environment's tooling could not
// fetch full schedule pages directly (every sports-schedule site tried
// was blocked by network egress policy), and search results only ever
// surface partial, fragmentary listings -- so only Week 1 could be
// confirmed complete (all 32 teams, no duplicates, cross-checked).
//
// This is intentionally a sparse override map, not a full-season
// dataset: js/nflSchedule.js uses REAL_SCHEDULE[week] when present and
// falls back to the algorithmically generated round-robin otherwise
// (see getNflSchedule()). Add more weeks here as real data becomes
// available/sourceable -- nothing else needs to change.
export const REAL_SCHEDULE = {
  1: [
    { away: "NE", home: "SEA" },
    { away: "SF", home: "LAR" },
    { away: "CHI", home: "CAR" },
    { away: "TB", home: "CIN" },
    { away: "NO", home: "DET" },
    { away: "BAL", home: "IND" },
    { away: "ATL", home: "PIT" },
    { away: "NYJ", home: "TEN" },
    { away: "BUF", home: "HOU" },
    { away: "CLE", home: "JAX" },
    { away: "ARI", home: "LAC" },
    { away: "GB", home: "MIN" },
    { away: "MIA", home: "LV" },
    { away: "WAS", home: "PHI" },
    { away: "DAL", home: "NYG" },
    { away: "DEN", home: "KC" },
  ],
};
