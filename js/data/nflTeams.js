// Current (2020s-era) 32 NFL franchises, used for:
//  - the generated NFL schedule shown on the Season screen
//  - bye-week flavor badges shown next to players on the Draft screen
//
// This is NOT a real published schedule/bye-week calendar for any given
// season -- it's algorithmically generated so every team plays someone
// each week and every team gets one illustrative bye. Treat it as
// gameplay flavor (and a seam for the "opponent-adjusted scoring"
// roadmap item), not a source of truth for real NFL dates.

export const NFL_TEAMS = [
  { code: "ARI", name: "Arizona Cardinals" },
  { code: "ATL", name: "Atlanta Falcons" },
  { code: "BAL", name: "Baltimore Ravens" },
  { code: "BUF", name: "Buffalo Bills" },
  { code: "CAR", name: "Carolina Panthers" },
  { code: "CHI", name: "Chicago Bears" },
  { code: "CIN", name: "Cincinnati Bengals" },
  { code: "CLE", name: "Cleveland Browns" },
  { code: "DAL", name: "Dallas Cowboys" },
  { code: "DEN", name: "Denver Broncos" },
  { code: "DET", name: "Detroit Lions" },
  { code: "GB", name: "Green Bay Packers" },
  { code: "HOU", name: "Houston Texans" },
  { code: "IND", name: "Indianapolis Colts" },
  { code: "JAX", name: "Jacksonville Jaguars" },
  { code: "KC", name: "Kansas City Chiefs" },
  { code: "LAC", name: "Los Angeles Chargers" },
  { code: "LAR", name: "Los Angeles Rams" },
  { code: "LV", name: "Las Vegas Raiders" },
  { code: "MIA", name: "Miami Dolphins" },
  { code: "MIN", name: "Minnesota Vikings" },
  { code: "NE", name: "New England Patriots" },
  { code: "NO", name: "New Orleans Saints" },
  { code: "NYG", name: "New York Giants" },
  { code: "NYJ", name: "New York Jets" },
  { code: "PHI", name: "Philadelphia Eagles" },
  { code: "PIT", name: "Pittsburgh Steelers" },
  { code: "SEA", name: "Seattle Seahawks" },
  { code: "SF", name: "San Francisco 49ers" },
  { code: "TB", name: "Tampa Bay Buccaneers" },
  { code: "TEN", name: "Tennessee Titans" },
  { code: "WAS", name: "Washington Commanders" },
];

// Deterministic, evenly-spread illustrative bye week (4-14) per team.
export const TEAM_BYE_WEEKS = Object.fromEntries(
  NFL_TEAMS.map(({ code }, i) => [code, 4 + (i % 11)])
);

// Relocated/renamed franchises that appear on older Hall of Fame
// seasons in js/data/players.js, mapped to their current code so bye
// lookups (and any future opponent modeling) resolve sensibly.
const FRANCHISE_ALIAS = {
  OAK: "LV", // Oakland Raiders -> Las Vegas Raiders
  SD: "LAC", // San Diego Chargers -> LA Chargers
  STL: "LAR", // St. Louis Rams -> LA Rams
};

export function getTeamCode(rawTeamCode) {
  return FRANCHISE_ALIAS[rawTeamCode] || rawTeamCode;
}

export function getByeWeek(rawTeamCode) {
  return TEAM_BYE_WEEKS[getTeamCode(rawTeamCode)] ?? null;
}
