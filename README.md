# Dynasty Hall of Fame

A browser-based fantasy football prototype: draft from a pool of Pro
Football Hall of Famers, statistically great retired players who aren't
(yet) enshrined, active players at their approximate current ADP, the
top all-time NFL/college coaches, and all-time great kicker and defense
seasons; build a roster; and simulate a 16-week season with matchups
and standings.

It's a static site (vanilla HTML/CSS/JS, ES modules, no build step, no
backend) so it can be hosted directly on GitHub Pages and works on desktop
and mobile browsers, including iPhone.

## Play it

1. **Setup** — name your teams (2-12) and pick your league format: PPR
   (0 / 0.5 / 1 points per reception), TE Premium (bonus points per TE
   reception), and Superflex (an extra starting slot that also allows a
   QB).
2. **Draft** — a local, hot-seat snake draft with a 60-second pick clock.
   Each team's own QB/RB/WR/TE picks also alternate between retired and
   active, starting with retired on their 1st skill pick, active on
   their 2nd, and so on — independently per team, not by overall pick
   order — and the on-screen hint always says which is required; whichever
   group isn't currently eligible is hidden from the list entirely (not
   just disabled). Coach, K, and DEF picks aren't part of that alternation
   and are always shown. On each turn, search/filter the player pool (by
   name, position, and HOF/HOVG/ACTIVE tag) and draft a player; their best
   (or projected) season — computed live from your league's scoring
   settings — their team's bye week, and their tag badge are shown next to
   their name. Players auto-fill the most specific open roster slot
   (position → FLEX/SUPERFLEX → BENCH). If the clock hits zero, the best
   available eligible player is auto-drafted for you. Undo is available if
   you misclick.
3. **Teams** — set your starting lineup: QB, 2×RB, 2×WR, TE, FLEX (+
   SUPERFLEX if enabled), Coach, K, DEF, and 7 bench spots. Only
   non-BENCH slots score. Swapping a player into a slot swaps whoever was
   there back to where the new player came from, so the roster never ends
   up in a broken state.
4. **Season** — click "Advance Week" to sim a week. Each starter scores
   their best (or projected) season's fantasy points **per game**; short
   seasons (strike years, wartime schedules, etc.) have that rate repeated across
   all 16 simulated weeks rather than stopping early. Coaches don't score
   yet (see Scoring below). Standings track W-L-T and points for/against
   across a round-robin schedule (byes when team count is odd). The
   screen also shows the NFL schedule — Week 1 is the real announced 2026
   slate, other weeks are generated pending more real data.
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

**Offense**

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

**Kicker**

| Stat | Points |
|---|---|
| Field goal made | +3 (flat — no distance tiers in v1) |
| Extra point made | +1 |

**Defense (DEF)**

| Stat | Points |
|---|---|
| Sack | +1 |
| Interception | +2 |
| Fumble recovery | +2 |
| Defensive/return TD | +6 |
| Safety | +2 |
| Points allowed per game | tiered: 0→+10, 1-6→+7, 7-13→+4, 14-20→+1, 21-27→0, 28-34→-1, 35+→-4 |

**Coach**

No scoring yet — every coach's stat line is `{}`, which already scores
0 through the normal formula with no special-casing. This is the seam
for the point-modifier planned later.

The fixed part of the rules lives in `DEFAULT_SCORING_RULES` in
`js/scoring.js`; `buildScoringRules()` layers the Setup screen's PPR/TE
Premium choices on top of it to produce the rules object used everywhere
else. The points-allowed tier is a fixed table (`pointsAllowedBonus()`
in `js/scoring.js`), not yet a Setup-screen toggle.

## Architecture (built to be swapped out piece by piece)

Each concern is its own module with a narrow interface, specifically so
the roadmap below doesn't require rewrites:

- `js/data/players.js` — raw QB/RB/WR/TE player/season data, ~247 players
  total, each tagged `tag: "HOF" | "HOVG" | "ACTIVE"`: ~46 enshrined Hall
  of Famers, ~101 statistically great retired players not (yet) enshrined
  (the "Hall of Very Good"), and ~100 active players at their approximate
  current ADP. Hand-compiled/approximate for this prototype (see the
  roadmap notes on data accuracy below). This is the file to replace with
  a real stats source — nothing downstream cares where the data comes
  from.
- `js/data/coaches.js` / `js/data/kickers.js` / `js/data/defenses.js` —
  the top-10-NFL/top-5-college all-time coaches, ~12 all-time kicker
  seasons, and 12 all-time team-defense seasons. Same shape as
  `players.js` (`tag`, `seasons`) so they flow through the same scoring
  engine, draft engine, and season sim unchanged; coaches additionally
  carry a `record` (career W-L-T, titles, title-game appearances) read
  only for display.
- `js/players.js` — data access layer merging all four pools above into
  one list (search/filter by name, position, and tag; "best season"
  calculation; `isRetired()`/`isActive()` group helpers used by the
  draft's alternation rule; `formatSeasonLine()` renders the right kind
  of line per position — stat line, kicking line, defensive line, or
  coach record). "Best season" is computed dynamically from the current
  scoring rules rather than hard-coded, so it stays correct if scoring
  changes.
- `js/scoring.js` — the fantasy scoring engine, covering offense, kicker,
  and defense stat categories (defense's points-allowed bonus is tiered
  per game via `pointsAllowedBonus()`, using the `games` param on
  `calculateFantasyPoints()`). `DEFAULT_SCORING_RULES` is the fixed part;
  `buildScoringRules({ pprValue, tePremium })` layers a league's
  Setup-screen choices on top. Coaches score 0 today (empty stat lines) —
  this is the seam for the coach point-modifier planned later.
- `js/draftEngine.js` — pure state-machine snake draft (order, turns,
  roster-slot eligibility via `SLOT_ELIGIBILITY`, undo). `buildRosterSlots()`
  adds a SUPERFLEX slot when a league enables it. `SKILL_POSITIONS`
  (QB/RB/WR/TE) is the only group of positions subject to the
  retired/active alternation; `getRequiredGroup()` / `playerMatchesGroup()`
  / `canDraftPlayer()` enforce it per team (from how many *skill* picks
  that team has made so far, not by overall pick order) and exempt
  Coach/K/DEF entirely. No DOM code, so it's ready to be driven by
  network messages instead of local clicks for real multiplayer.
- `js/schedule.js` — generic round-robin matchup generator (byes for odd
  counts), kept separate from scoring so the pairing algorithm (divisions,
  playoffs, etc.) can change independently. Reused by both the fantasy
  league schedule and the NFL schedule below.
- `js/season.js` — weekly simulation and standings. The one function that
  turns a roster into a week's score (`computeTeamWeekScore`) is the seam
  for real per-week game logs, matchup-based defense adjustments, and
  random weekly variance.
- `js/data/nflTeams.js` — the 32 current NFL teams and a generated
  illustrative bye week per team (gameplay flavor, not a real calendar).
- `js/data/realNflSchedule.js` / `js/nflSchedule.js` — real schedule data
  where available (currently just Week 1, confirmed complete via web
  search — see roadmap) layered over an algorithmically generated
  32-team round-robin for every other week. `getNflSchedule()` picks real
  data for a week when present and falls back to generated otherwise;
  `isRealWeek()` tells the UI which is which. Add more weeks to
  `REAL_SCHEDULE` in `realNflSchedule.js` as real data becomes available
  — nothing else needs to change.
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
- **Large/adversarial leagues can exhaust a position's pool**: dataset
  sizes are prototype-scale (e.g. 16 active QBs, 16 active TEs, 12
  kickers, 12 defenses, 15 coaches). A typical draft comfortably supports
  up to ~8 teams; heavily testing showed a 10+ team league, or a
  strategy that greedily stacks one position, can exhaust that
  position's pool before every roster fills, leaving a slot permanently
  empty and, in the worst case, nothing left for that team to legally
  draft. The UI won't crash (the draft-clock auto-pick just stops
  offering picks once nothing is eligible) but that team's draft stalls.
  Fix is the same as other size limits here: grow the relevant data file.
- **NFL schedule / bye weeks**: the per-team bye-week badge on the Draft
  screen is generated for gameplay flavor, not a real calendar. The
  Season screen's NFL Schedule is real for Week 1 (confirmed complete —
  all 32 teams, sourced via web search in Aug 2026) and algorithmically
  generated for every other week, labeled REAL vs. GENERATED per week.
  Most schedule-data sites (ESPN, NFL.com, Pro-Football-Reference,
  RotoWire, Wikipedia, etc.) were unreachable from this environment
  (blocked by network egress policy), and web search only surfaces
  partial/fragmentary listings per query, so assembling a complete,
  verified 18-week schedule wasn't achievable here — see
  `js/data/realNflSchedule.js` for how to extend it as more weeks become
  sourceable.
- **Data accuracy (HOF/HOVG players, coaches, kickers, defenses)**: stats
  and records are hand-compiled from memory for well-known seasons/careers
  and meant to be "close enough" for a prototype, not a verified
  statistical source.
- **Tag accuracy (HOF/HOVG)**: each entry's `tag` reflects Hall of Fame
  status as best known at the time this file was written. Recently
  retired players/coaches whose induction timing was ambiguous at write
  time were left out of the "Hall of Very Good" pool entirely rather than
  guessed at; still, HOF voting happens annually, so a tag can go stale.
  Update it directly in the relevant `js/data/*.js` file as induction news
  changes.
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
- **Coach scoring**: intentionally not implemented yet — every coach
  scores 0 (see Scoring above). The `record` field (career W-L-T, titles,
  title-game appearances) already carries the data a future point
  modifier would use.
