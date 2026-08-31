// Current (2020s-era) 32 NFL franchises, used for the NFL schedule
// (Games tab) and the BYE badges shown next to players (Draft/Players
// tabs).

import { REAL_SCHEDULE } from "./realNflSchedule.js";

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

// The fantasy season only runs 16 weeks, so bye weeks are derived
// from REAL_SCHEDULE across weeks 1-16 only: for each week, whichever
// teams don't appear as home or away are on bye that week. The real
// 2026 schedule's actual byes (weeks 5-14) all fall within that
// window, so every team resolves to a real bye week here -- no
// generated/illustrative fallback needed.
function computeByeWeeks() {
  const byes = {};
  for (let week = 1; week <= 16; week++) {
    const playing = new Set();
    (REAL_SCHEDULE[week] || []).forEach((g) => {
      playing.add(g.home);
      playing.add(g.away);
    });
    NFL_TEAMS.forEach(({ code }) => {
      if (!playing.has(code)) byes[code] = week;
    });
  }
  return byes;
}

export const TEAM_BYE_WEEKS = computeByeWeeks();

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
