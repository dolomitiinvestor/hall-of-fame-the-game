#!/usr/bin/env node
// Converts a Pro-Football-Reference-style game log CSV (the two-row header
// with category groups like "Rushing,Rushing,..." above the real column
// names) into the two snippets this repo hand-writes for a new archived
// player season:
//   1. the REAL_GAME_LOGS array entry for js/data/realBoxScores.js
//   2. the matching season-total line for js/data/players.js
//
// It also sums every game it emits and compares that sum against the
// CSV's own totals row, so a transcription/OCR slip (a misread digit)
// shows up as a printed warning instead of silently landing in the repo.
//
// Usage:
//   node scripts/csv-to-gamelog.js <player-id> <year> <path-to-csv>
//   node scripts/csv-to-gamelog.js <player-id> <year> -   (reads CSV from stdin)
//
// The CSV is exactly what you get pasting a Pro-Football-Reference "Game
// Logs" table: a category header row, a column-name row, one row per
// game (with "Inactive"/"Did Not Play" rows for missed games), then a
// totals row (blank Rk).

const fs = require("fs");

function parseCsvLine(line) {
  // Minimal CSV split: handles simple double-quoted fields (no embedded
  // quotes) as well as the common unquoted case these tables come as.
  const fields = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      fields.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  fields.push(cur);
  return fields;
}

// Stat categories we score (see js/data/realBoxScores.js's field list).
// Kick/punt return yardage and passing completions/attempts/rating etc.
// aren't part of the scoring schema, so those columns are read (for
// context) but never emitted.
const STAT_COLUMNS = {
  Rushing: { Att: "rushAtt", Yds: "rushYds", TD: "rushTD" },
  Receiving: { Rec: "rec", Yds: "recYds", TD: "recTD" },
  Passing: { Yds: "passYds", TD: "passTD", Int: "passInt" },
  Fumbles: { FL: "fumblesLost" },
};
// Order stats are emitted in an entry, matching this repo's convention
// of listing rushing, then receiving, then passing, then fumbles.
const FIELD_ORDER = [
  "rushAtt", "rushYds", "rushTD",
  "rec", "recYds", "recTD",
  "passYds", "passTD", "passInt",
  "fumblesLost",
];

function main() {
  const [, , playerId, yearArg, csvPath] = process.argv;
  if (!playerId || !yearArg || !csvPath) {
    console.error("Usage: node scripts/csv-to-gamelog.js <player-id> <year> <path-to-csv|->");
    process.exit(1);
  }
  const year = Number(yearArg);
  const raw = csvPath === "-"
    ? fs.readFileSync(0, "utf8")
    : fs.readFileSync(csvPath, "utf8");

  const lines = raw.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 3) {
    console.error("Expected at least a category row, a column row, and one data row.");
    process.exit(1);
  }

  const categoryRow = parseCsvLine(lines[0]);
  const nameRow = parseCsvLine(lines[1]);

  // Map each column index to a scored field name, or null if it's not
  // one we track. Carries the running category since the category row
  // only labels the first column of each group (repeats as blanks after).
  // PFR passing tables reuse the "Yds" header twice under "Passing" --
  // real pass yards, then sack-yards-lost -- so only the *first* column
  // in a category matching a given name is mapped; a repeat (e.g. that
  // second "Yds") is left unmapped rather than double-counted.
  let currentCategory = "";
  let seenInCategory = new Set();
  const fieldForCol = nameRow.map((name, i) => {
    if (categoryRow[i] && categoryRow[i].trim() && categoryRow[i].trim() !== currentCategory) {
      currentCategory = categoryRow[i].trim();
      seenInCategory = new Set();
    }
    const group = STAT_COLUMNS[currentCategory];
    if (!group) return null;
    const key = name.trim();
    if (seenInCategory.has(key)) return null;
    seenInCategory.add(key);
    return group[key] || null;
  });

  const weekCol = nameRow.findIndex((n) => n.trim() === "Week");
  const dateCol = nameRow.findIndex((n) => n.trim() === "Date");
  const teamCol = nameRow.findIndex((n) => n.trim() === "Team");
  const oppCol = nameRow.findIndex((n) => n.trim() === "Opp");
  const atCol = oppCol - 1; // the blank "@" column always immediately precedes Opp
  const resultCol = nameRow.findIndex((n) => n.trim() === "Result");
  const rkCol = nameRow.findIndex((n) => n.trim() === "Rk");
  const gsCol = nameRow.findIndex((n) => n.trim() === "GS" || n.trim() === "GS▼");

  const games = [];
  const totals = {};
  let totalsRow = null;
  let team = "";

  for (let r = 2; r < lines.length; r++) {
    const cells = parseCsvLine(lines[r]);
    const rk = (cells[rkCol] || "").trim();
    if (rk === "") {
      totalsRow = cells;
      continue;
    }
    if (!team && teamCol >= 0) team = (cells[teamCol] || "").trim();
    if ((cells[gsCol] || "").trim() === "Inactive") continue; // didn't play -- skip, don't zero-fill

    const stats = {};
    for (let i = 0; i < cells.length; i++) {
      const field = fieldForCol[i];
      if (!field) continue;
      const val = Number((cells[i] || "0").trim() || 0);
      if (val) stats[field] = (stats[field] || 0) + val;
      totals[field] = (totals[field] || 0) + val;
    }
    // Repo convention (see the hand-written entries already in this
    // file): rushTD/recTD stay explicit at 0 whenever that game had any
    // carries/catches at all -- only the sparser fields (passing,
    // fumbles) get dropped when zero.
    if ("rushAtt" in stats) stats.rushTD = stats.rushTD || 0;
    if ("rec" in stats) stats.recTD = stats.recTD || 0;
    const week = (cells[weekCol] || "").trim();
    const opp = (cells[oppCol] || "").trim();
    const away = (cells[atCol] || "").trim() === "@";
    const result = (cells[resultCol] || "").trim();
    const ot = /\(OT\)/.test(result) ? " (OT)" : "";
    games.push({ week, comment: `Wk${week} ${away ? "@" : "vs "}${opp}${ot}`, stats });
  }

  // --- emit the REAL_GAME_LOGS array entry ---
  console.log(`  "${playerId}": {`);
  console.log(`    ${year}: [`);
  for (const g of games) {
    const parts = FIELD_ORDER.filter((f) => f in g.stats).map((f) => `${f}: ${g.stats[f]}`);
    console.log(`      { ${parts.join(", ")} }, // ${g.comment}`);
  }
  console.log(`    ],`);
  console.log(`  },`);

  // --- emit the players.js season-total line ---
  // rushAtt is display-only (see js/data/realBoxScores.js) -- the vast
  // majority of hand-written season entries omit it, so match that.
  const statsStr = FIELD_ORDER.filter((f) => f !== "rushAtt" && totals[f])
    .map((f) => `${f}: ${totals[f]}`).join(", ");
  console.log();
  console.log(`      { year: ${year}, team: "${team}", games: ${games.length}, stats: { ${statsStr} } },`);

  // --- validate against the CSV's own totals row ---
  if (totalsRow) {
    console.log();
    console.log("Validation against the CSV totals row:");
    let allOk = true;
    for (const field of FIELD_ORDER) {
      const summed = totals[field] || 0;
      // Find the matching totals-row cell the same way we found it per-game.
      let footerVal = 0;
      for (let i = 0; i < totalsRow.length; i++) {
        if (fieldForCol[i] === field) {
          footerVal += Number((totalsRow[i] || "0").trim() || 0);
        }
      }
      if (summed !== footerVal) {
        allOk = false;
        console.log(`  MISMATCH ${field}: games sum to ${summed}, CSV total says ${footerVal}`);
      }
    }
    if (allOk) console.log("  all fields match the CSV total row -- clean.");
  }
}

main();
