# Dynasty Hall of Fame

A browser-based fantasy football prototype: draft any Pro Football Hall of
Famer at their career-best season, build a roster, and simulate a 16-week
season with matchups and standings.

It's a static site (vanilla HTML/CSS/JS, ES modules, no build step, no
backend) so it can be hosted directly on GitHub Pages and works on desktop
and mobile browsers, including iPhone.

## Play it

1. **Setup** — name your teams (2-12).
2. **Draft** — a local, hot-seat snake draft. On each turn, search/filter
   the Hall of Fame pool and draft a player; their career-best season
   (computed live from current scoring rules) is shown next to their name.
   Players auto-fill the most specific open roster slot (position → FLEX →
   BENCH). Undo is available if you misclick.
3. **Teams** — set your starting lineup. Only non-BENCH slots score.
   Swapping a player into a slot swaps whoever was there back to where the
   new player came from, so the roster never ends up in a broken state.
4. **Season** — click "Advance Week" to sim a week. Each starter scores
   their career-best season's fantasy points **per game**; short seasons
   (strike years, wartime schedules, etc.) have that rate repeated across
   all 16 simulated weeks rather than stopping early. Standings track
   W-L-T and points for/against across a round-robin schedule (byes when
   team count is odd).

State is saved to `localStorage`, so progress survives a page refresh.
"Reset League" on the Setup screen clears everything and starts over.

## Deploying to GitHub Pages

No build step needed — it's plain static files.

1. Push this repo to GitHub.
2. Repo **Settings → Pages → Build and deployment → Source**: "Deploy from
   a branch".
3. Branch: your default branch, folder: `/ (root)`.
4. Save. GitHub will publish `index.html` at `https://<user>.github.io/<repo>/`.

## Scoring (v1, half-PPR)

| Stat | Points |
|---|---|
| Passing yards | 1 / 25 yds |
| Passing TD | +4 |
| Interception | -2 |
| Rushing yards | 1 / 10 yds |
| Rushing TD | +6 |
| Receiving yards | 1 / 10 yds |
| Receiving TD | +6 |
| Reception | +0.5 |
| Fumble lost | -2 |

Rules live in `js/scoring.js` as a single exported object — change the
numbers there to change how every screen scores.

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
- `js/scoring.js` — the fantasy scoring engine. One object of rules, one
  function that turns a stat line into points.
- `js/draftEngine.js` — pure state-machine snake draft (order, turns,
  roster-slot eligibility, undo). No DOM code, so it's ready to be driven
  by network messages instead of local clicks for real multiplayer.
- `js/schedule.js` — round-robin matchup generator, kept separate from
  scoring so the pairing algorithm (divisions, playoffs, etc.) can change
  independently.
- `js/season.js` — weekly simulation and standings. The one function that
  turns a roster into a week's score (`computeTeamWeekScore`) is the seam
  for real per-week game logs, matchup-based defense adjustments, and
  random weekly variance.
- `js/storage.js` — the only module touching `localStorage`. Swapping in
  a backend/shared multiplayer state means replacing this file alone.
- `js/app.js` — UI controller: renders screens from state and wires up
  events. No game logic lives here.

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
- **Odd team counts**: bye weeks aren't perfectly even across a 16-week
  round robin when team count doesn't divide evenly.
- **Positions**: only QB/RB/WR/TE are modeled (no K/DEF) since those are
  the widely-drafted fantasy skill positions.
- **Data accuracy**: stats are hand-compiled from memory for well-known
  record seasons and meant to be "close enough" for a prototype, not a
  verified statistical source.
