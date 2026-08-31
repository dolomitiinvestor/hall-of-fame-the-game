# Dynasty Hall of Fame

A browser-based fantasy football prototype: draft from a pool of Pro
Football Hall of Famers, statistically great retired players who aren't
(yet) enshrined, and active players at their approximate current ADP,
build a roster, and simulate a 16-week season with matchups and
standings.

It's a static site (vanilla HTML/CSS/JS, ES modules, no build step, no
backend) so it can be hosted directly on GitHub Pages and works on desktop
and mobile browsers, including iPhone.

## Play it

1. **Setup** — name your teams (2-12) and pick your league format: PPR
   (0 / 0.5 / 1 points per reception), TE Premium (bonus points per TE
   reception), and Superflex (an extra starting slot that also allows a
   QB).
2. **Draft** — a local, hot-seat snake draft with a 60-second pick clock.
   Each team's own picks also alternate between retired and active
   players, starting with retired on their 1st pick, active on their
   2nd, and so on — independently per team, not by overall pick order —
   and the on-screen hint always says which is required. On each turn, search/filter the
   player pool (by name, position, and HOF/HOVG/ACTIVE tag) and draft a
   player; their best (or projected) season — computed live from your
   league's scoring settings — their team's bye week, and their tag badge
   are shown next to their name. Players auto-fill the most specific open
   roster slot (position → FLEX/SUPERFLEX → BENCH). If the clock hits
   zero, the best available eligible player is auto-drafted for you. Undo
   is available if you misclick.
3. **Teams** — set your starting lineup (7 bench spots per team). Only
   non-BENCH slots score. Swapping a player into a slot swaps whoever was
   there back to where the new player came from, so the roster never ends
   up in a broken state.
4. **Season** — click "Advance Week" to sim a week. Each starter scores
   their best (or projected) season's fantasy points **per game**; short
   seasons (strike years, wartime schedules, etc.) have that rate repeated across
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

- `js/data/players.js` — raw player/season data, ~247 players total, each
  tagged `tag: "HOF" | "HOVG" | "ACTIVE"`: ~46 enshrined Hall of Famers,
  ~101 statistically great retired players not (yet) enshrined (the "Hall
  of Very Good"), and ~100 active players at their approximate current
  ADP. Hand-compiled/approximate for this prototype (see the roadmap
  notes on data accuracy below). This is the file to replace with a real
  stats source — nothing downstream cares where the data comes from.
- `js/players.js` — data access layer (search/filter by name, position,
  and tag; "best season" calculation; `isRetired()`/`isActive()` group
  helpers used by the draft's alternation rule). "Best season" is
  computed dynamically from the current scoring rules rather than
  hard-coded, so it stays correct if scoring changes.
- `js/scoring.js` — the fantasy scoring engine. `DEFAULT_SCORING_RULES` is
  the fixed part; `buildScoringRules({ pprValue, tePremium })` layers a
  league's Setup-screen choices on top, and `calculateFantasyPoints()`
  turns a stat line (plus position, for TE Premium) into points.
- `js/draftEngine.js` — pure state-machine snake draft (order, turns,
  roster-slot eligibility via `SLOT_ELIGIBILITY`, undo). `buildRosterSlots()`
  adds a SUPERFLEX slot when a league enables it. `getRequiredGroup()` /
  `canDraftPlayer()` enforce the retired/active pick alternation, per
  team (from how many picks that team has made so far), not by overall
  pick order. No DOM code, so it's ready to be driven by network
  messages instead of local clicks for real multiplayer.
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
- **Data accuracy (HOF/HOVG)**: stats are hand-compiled from memory for
  well-known record seasons and meant to be "close enough" for a
  prototype, not a verified statistical source.
- **Tag accuracy (HOF/HOVG)**: each player's `tag` reflects Hall of Fame
  status as best known at the time this file was written. Recently
  retired players whose induction timing was ambiguous at write time were
  left out of the "Hall of Very Good" pool entirely rather than guessed
  at; still, HOF voting happens annually, so a tag can go stale. Update it
  directly in `js/data/players.js` as induction news changes.
- **ACTIVE player data**: the ~100 active players and their rough ADP
  order were assembled from web searches across several fantasy outlets
  in one sitting, not a live feed or a single authoritative source, so
  expect drift from any one site's current rankings and from roster
  moves after this file was written. Each active player's single season
  is a **formulaic projection** (a smooth stat-line curve keyed to
  position + approximate ADP tier, in `js/data/players.js`'s generator
  notes) rather than a real analyst's per-player projection — it exists
  so the same scoring engine and season sim work identically for retired
  and active players. Swap in a real projections feed by replacing those
  stat lines; nothing else needs to change.
