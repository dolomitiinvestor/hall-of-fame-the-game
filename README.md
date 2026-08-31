# Dynasty Hall of Fame

A browser-based fantasy football prototype: draft any Pro Football Hall of
Famer at their career-best season, build a roster, and simulate a 16-week
season with matchups and standings.

It's a static site (vanilla HTML/CSS/JS, ES modules, no build step, no
backend) so it can be hosted directly on GitHub Pages and works on desktop
and mobile browsers, including iPhone.

## Play it

1. **Setup** — name your teams (2-12) and pick your league format: PPR
   (0 / 0.5 / 1 points per reception), TE Premium (bonus points per TE
   reception), and Superflex (an extra starting slot that also allows a
   QB).
2. **Draft** — a local, hot-seat snake draft with a 60-second pick clock.
   On each turn, search/filter the Hall of Fame pool and draft a player;
   their career-best season (computed live from your league's scoring
   settings) and their team's bye week are shown next to their name.
   Players auto-fill the most specific open roster slot (position →
   FLEX/SUPERFLEX → BENCH). If the clock hits zero, the best available
   eligible player is auto-drafted for you. Undo is available if you
   misclick.
3. **Teams** — set your starting lineup. Only non-BENCH slots score.
   Swapping a player into a slot swaps whoever was there back to where the
   new player came from, so the roster never ends up in a broken state.
4. **Season** — click "Advance Week" to sim a week. Each starter scores
   their career-best season's fantasy points **per game**; short seasons
   (strike years, wartime schedules, etc.) have that rate repeated across
   all 16 simulated weeks rather than stopping early. Standings track
   W-L-T and points for/against across a round-robin schedule (byes when
   team count is odd). The screen also shows a generated NFL schedule
   (all 32 teams, who's facing who and who's home) for flavor.
5. **FAQ** — an in-app explainer covering all of the above.

State is saved to `localStorage`, so progress survives a page refresh.
"Reset League" on the Setup screen clears everything and starts over.

## Deploying to GitHub Pages

No build step needed — it's plain static files.

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source**: "Deploy from
   a branch".
3. Branch: your default branch, folder: `/ (root)`.
4. Save. GitHub will publish `index.html` at `https://<user>.github.io/<repo>/`.

## Scoring

| Stat | Points |
|---|---|
| Passing yards | 1 / 25 yds |
| Passing TD | +4 |
| Interception | -2 |
| Rushing yards | 1 / 10 yds |
| Rushing TD | +6 |
| Receiving yards | 1 / 10 yds |
| Receiving TD | +6 |
| Reception | set in Setup: 0 / 0.5 / 1 PPR |
| TE Premium | set in Setup: +0 / +0.5 / +1 per TE reception, on top of PPR |
| Fumble lost | -2 |

The fixed part of the rules lives in `DEFAULT_SCORING_RULES` in
`js/scoring.js`; `buildScoringRules()` layers the Setup screen's PPR/TE
Premium choices on top of it to produce the rules object used everywhere
else.

## Architecture (built to be swapped out piece by piece)

Each concern is its own module with a narrow interface, specifically so
the roadmap below doesn't require rewrites:

- `js/data/players.js` — raw player/season data. Hand-compiled
  approximate stats for ~46 Hall of Famers for this prototype. This is
  the file to replace with a real stats source, and the file to extend
  with active/current players later — nothing downstream cares where the
  data comes from.
- `js/players.js` — data access layer (search, lookup, "best season"
  calculation). "Best season" is computed dynamically from the current
  scoring rules rather than hard-coded, so it stays correct if scoring
  changes.
- `js/scoring.js` — the fantasy scoring engine. `DEFAULT_SCORING_RULES` is
  the fixed part; `buildScoringRules({ pprValue, tePremium })` layers a
  league's Setup-screen choices on top, and `calculateFantasyPoints()`
  turns a stat line (plus position, for TE Premium) into points.
- `js/draftEngine.js` — pure state-machine snake draft (order, turns,
  roster-slot eligibility via `SLOT_ELIGIBILITY`, undo). `buildRosterSlots()`
  adds a SUPERFLEX slot when a league enables it. No DOM code, so it's
  ready to be driven by network messages instead of local clicks for real
  multiplayer.
- `js/schedule.js` — generic round-robin matchup generator (byes for odd
  counts), kept separate from scoring so the pairing algorithm (divisions,
  playoffs, etc.) can change independently. Reused by both the fantasy
  league schedule and the NFL schedule below.
- `js/season.js` — weekly simulation and standings. The one function that
  turns a roster into a week's score (`computeTeamWeekScore`) is the seam
  for real per-week game logs, matchup-based defense adjustments, and
  random weekly variance.
- `js/data/nflTeams.js` / `js/nflSchedule.js` — the 32 current NFL teams,
  a generated illustrative bye week per team, and a generated 32-team
  weekly schedule (home/away). Not a real published schedule -- it exists
  as gameplay flavor and as the foundation for opponent-adjusted scoring
  later (see roadmap).
- `js/storage.js` — the only module touching `localStorage`. Swapping in
  a backend/shared multiplayer state means replacing this file alone.
- `js/app.js` — UI controller: renders screens from state and wires up
  events, including the 60-second draft-pick timer. No game logic lives
  here.

## Roadmap / known v1 limitations

- **Multiplayer draft**: currently a single-device hot-seat draft. The
  draft engine is already headless/pure-data, so a real-time layer (e.g.
  WebSocket relay calling the same `draftPlayer()`/`undoLastPick()`
  functions) can sit on top without changing the engine.
- **Current players**: dataset only has retired Hall of Famers today.
  Add them to `js/data/players.js` (or a second data file merged in
  `js/players.js`) with the same shape.
- **Weekly variance**: every week currently uses a flat points-per-game
  rate. `weeklyPointsForPlayer()` in `season.js` is the single place to
  add randomness (e.g. a normal distribution around the rate).
- **Opponent-adjusted scoring**: e.g. Jerry Rice scoring less against a
  historically great pass defense that week. This needs (a) a defense
  strength rating per team/season and (b) the season schedule to know who
  a player's team "played" that week — both can hang off
  `computeTeamWeekScore()` without touching the draft or UI layers.
  Currently player performance is independent of both team and no
  matchup/opponent modeling exists at all.
- **Odd team counts**: fantasy-league bye weeks aren't perfectly even
  across a 16-week round robin when team count doesn't divide evenly.
- **Positions**: only QB/RB/WR/TE are modeled (no K/DEF) since those are
  the widely-drafted fantasy skill positions.
- **NFL schedule / bye weeks**: generated for gameplay flavor (every team
  plays every week in the schedule table; the separate per-team bye-week
  badge on the Draft screen is illustrative), not sourced from a real
  published NFL schedule.
- **Data accuracy**: stats are hand-compiled from memory for well-known
  record seasons and meant to be "close enough" for a prototype, not a
  verified statistical source.
