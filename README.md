# Dynasty Hall of Fame

A browser-based fantasy football prototype: draft from a pool of Pro
Football Hall of Famers, statistically great retired players who aren't
(yet) enshrined, active players at their approximate current ADP, the
top all-time NFL/college coaches, and all-time great kicker and defense
seasons; build a roster; and simulate a 16-week season with matchups
and standings.

It's a static site (vanilla HTML/CSS/JS, ES modules, no build step, no
backend) so it can be hosted directly on GitHub Pages and works on desktop
and mobile browsers, including iPhone. Black-and-gold color scheme
throughout (`--gold`/`--gold-light`/`--gold-dark` in `css/style.css`).

## Play it

1. **League Settings** — name your teams (2-12) and pick your league
   format: PPR (0 / 0.5 / 1 points per reception), TE Premium (bonus
   points per TE reception), Superflex (an extra starting slot that
   also allows a QB), Kicker/Defense Slot (each can be switched off,
   removing that position from the draft pool entirely), Bench Spots
   (0-10), and Max Retired Players (caps how many HOF/HOVG skill-position
   players a team may draft; once hit, the alternating rule requires
   active for the rest of that team's skill picks). All locked in once
   the draft starts -- though once a draft exists this screen switches
   to just an editable name per team (renaming works any time,
   including mid-season) since format and team count are fixed by then.
2. **Draft** — a local, hot-seat snake draft with a 60-second pick clock.
   Each team's own QB/RB/WR/TE picks also alternate between retired and
   active, starting with retired on their 1st skill pick, active on
   their 2nd, and so on — independently per team, not by overall pick
   order — and the on-screen hint always says which is required. Anyone
   who isn't currently eligible is hidden from the list entirely, never
   shown disabled: that covers both the wrong retired/active group for
   this pick, and anyone your team has no roster room left for (every
   slot that could hold their position, including BENCH, already full).
   Coach, K, and DEF picks aren't part of the retired/active alternation
   and are always shown, subject to that same roster-room check. On each
   turn, search/filter the player pool (by name, position, and
   HOF/HOVG/ACTIVE tag) and draft a player; their best (or projected)
   season — computed live from your league's scoring settings — their
   team's bye week, their tag badge (defenses don't get one — see
   Scoring below), and (retired players only) an injury-risk percentage
   are shown next to their name. Players auto-fill the most specific
   open roster slot (position → FLEX/SUPERFLEX → BENCH). If the clock
   hits zero, the best available eligible player is auto-drafted for
   you. Undo is available if you misclick. A dashed "Complete Draft
   (Testing)" button instantly auto-drafts every remaining pick with
   that same best-available logic, for quickly getting to a full league
   while testing Teams/Season -- not meant for normal play. A scrollable
   Draft Order table (pick #, clickable player name, team) records the
   exact order everyone was taken in, live as the draft happens.
3. **Teams** — set your starting lineup: QB, 2×RB, 2×WR, TE, FLEX (+
   SUPERFLEX if enabled), K and/or DEF (if enabled), Coach, and however
   many bench spots your league format set (0-10). Only non-BENCH slots
   score. Swapping a player into a slot swaps whoever was there back to
   where the new player came from, so the roster never ends up in a
   broken state. Editable any time, including mid-season — see Season
   below. A small circular avatar sits inline with each player's name —
   click either to open that player's card (see FAQ) — a blank headshot
   placeholder for now. Once the draft is complete, every rostered
   player also gets a Drop button, and a Free Agency section below every
   team lets you add any undrafted player to a team of your choice
   (auto-filling the most specific open slot, same as the draft itself).
4. **Players** — a read-only, filterable directory of every player,
   coach, kicker, and defense in the game (search, position, and
   HOF/HOVG/ACTIVE filters, same as the Draft screen), ranked by points
   per game at their best (or projected) season. Independent of any
   draft — browse it from Setup onward — and marks anyone already
   **DRAFTED** once a league exists.
5. **Season** — rankings only, mirroring a typical fantasy platform's
   separate rankings/schedule tabs. Click "Advance Week" to sim a week.
   Each starter's best (or projected) season's points **per game** is the
   baseline; on top of that, each week applies a randomized-but-repeatable
   variance (so scores actually differ week to week rather than repeating
   a flat number) and zeroes out anyone marked Out/IR that week (see the
   injury FAQ entry). A started Coach adds a flat 5% bonus to that team's
   week total. All scores round to 1 decimal place. Standings track
   regular-season W-L-T and points for/against across a round-robin
   schedule (byes when team count is odd) and freeze once the playoffs
   start. A playoff bracket is always shown once the draft is complete:
   **projected** (current standings, re-sorted every week) before the
   regular season ends, then the actual seeded bracket after, with real
   scores filled in (and the winner's box glowing gold) as playoff games
   are played — the last 1-2 of the 16 weeks, a 4-team bracket (leagues
   of 4+, top seed always drawing the worst seed in the semifinals, not
   the next-best one) or a single championship game (2-3 teams),
   culminating in a champion banner. Below the seed list, a literal
   bracket diagram lays out the actual matchups round by round
   (semifinal boxes always show real team names since seeding alone
   determines them; the championship/3rd-place boxes show TBD until
   both semifinals are actually played, since only the winners/losers
   determine who's in them); see the FAQ for the exact format. A
   shortcut link jumps to the Teams tab so you can adjust a lineup
   between weeks; the change only takes effect starting with the next
   week you advance, since each played week keeps the lineup (and
   score) it actually used. Another shortcut jumps to Games.
6. **Games** — one week at a time (left/right arrows to move between
   weeks, spanning the whole season from week 1 through the playoffs —
   not just weeks already played), every game that week stacked
   vertically as a compact 5-column row: team name, score, "vs", team
   name, score. Scroll past the most recently played week and upcoming
   matchups preview with blank scores instead of disappearing (playoff
   pairings preview as TBD until they're actually determinable — see the
   FAQ). Once a game is finalized, the winning team's name and score
   glow gold. Tap a played game to open its full box score full-screen
   (X or Escape to close): each starter's actual points, plus a
   simulated integer box score (yards/TDs/receptions/carries/fumbles,
   scaled from their season averages by that week's same scoring
   variance — generated even for an Out/IR starter, not just healthy
   ones; see the FAQ and roadmap) and, if one exists, a quote next to
   that specific player (player quotes are an empty infrastructure seam
   for now). A started Coach's bonus line sits right under their own row
   (name suffixed "- coach bonus"), not as a separate note elsewhere.
   Each team's score up top carries up to two quotes: a real, attributed
   one from that team's started Coach, and one from an actual starter
   that week (same empty seam as above) — both picked deterministically
   (see the FAQ). A player's avatar/name is clickable from inside this
   full-screen view too, and opens their player card stacked on top
   rather than replacing the game view underneath. Below the week's
   games, the NFL schedule — the real 2026 regular-season slate for
   every week the fantasy season uses (see the FAQ and roadmap).
7. **FAQ** — an in-app explainer covering all of the above.

Every time you open or refresh the site, a splash screen shows the logo
(`img/main-logo.jpg`) and plays the theme song (`audio/time-to-rumble.mp3`,
looped) until you close it — click the X or press Escape. Most browsers
block audible autoplay until the page has had some user interaction, so
the music may not start on a hard refresh with no prior interaction —
that's a browser policy, not a bug. A second splash (logo again, no
audio) pops up after every "Advance Week," congratulating you and naming
the week (or playoff round) you just completed — same X/Escape to close.

State is saved to `localStorage`, so progress survives a page refresh.
"Reset League" on the League Settings screen clears everything and
starts over.

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

Defenses carry no HOF/HOVG/ACTIVE tag and show no badge in the draft
list — a team defensive unit isn't an individual who can be personally
enshrined, so that classification doesn't apply. It's still fully
exempt from the retired/active alternation, same as Coach and K.

**Coach**

No individual scoring yet — every coach's stat line is `{}`, which
already scores 0 through the normal formula with no special-casing.
Instead, a Coach started in the COACH slot (not benched) adds a flat
**+5%** to their team's whole week total (`coachBonusRate` in
`DEFAULT_SCORING_RULES`) — the current placeholder for the point
modifier planned later.

**Injuries**

A weekly Out/IR designation zeroes that player's points for the week;
Questionable/Doubtful are a risk flag only, with no scoring effect. See
`js/injuries.js` and the Roadmap below for how designations are decided
and their real-data limitations.

The fixed part of the rules lives in `DEFAULT_SCORING_RULES` in
`js/scoring.js`; `buildScoringRules()` layers the Setup screen's PPR/TE
Premium choices on top of it to produce the rules object used everywhere
else. The points-allowed tier and the coach bonus are both applied
outside that per-player formula (points-allowed in
`calculateFantasyPoints()` using the `games` param; the coach bonus in
`computeTeamWeekScore()` in `js/season.js`, since it's a team-level
effect) and aren't yet Setup-screen toggles.

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
  the top-10-NFL/top-4-college all-time coaches, ~12 all-time kicker
  seasons, and 12 all-time team-defense seasons. Same shape as
  `players.js` (`tag`, `seasons`) so they flow through the same scoring
  engine, draft engine, and season sim unchanged; coaches additionally
  carry a `record` (career W-L-T, titles, title-game appearances) read
  only for display.
- `js/data/coachQuotes.js` — real, attributed quotes per coach (source:
  a user-supplied quote list, hand-parsed into this structure), keyed by
  coach id. `coachQuoteForTeam()` in `js/app.js` picks one deterministically
  per team per week (seeded, like injuries/variance) for that team's
  started Coach, shown on the Games tab; display-only, no scoring effect.
- `js/data/playerQuotes.js` — infrastructure twin of `coachQuotes.js`,
  for individual player quotes on the Games tab. Empty seam for now (no
  player quotes supplied yet); add entries keyed by player id and they
  show automatically.
- `js/players.js` — data access layer merging all four pools above into
  one list (search/filter by name, position, and tag; "best season"
  calculation; `isRetired()`/`isActive()` group helpers used by the
  draft's alternation rule; `formatSeasonLine()` renders the right kind
  of line per position — stat line, kicking line, defensive line, or
  coach record). "Best season" is computed dynamically from the current
  scoring rules rather than hard-coded, so it stays correct if scoring
  changes. `SEASON_SELECTION_STRATEGIES` / `selectSeason()` is a
  pluggable seam for choosing among a player's multiple preloaded
  seasons at season start (today only "best" is implemented, identical
  to the above) — see season.js and the roadmap.
- `js/scoring.js` — the fantasy scoring engine, covering offense, kicker,
  and defense stat categories (defense's points-allowed bonus is tiered
  per game via `pointsAllowedBonus()`, using the `games` param on
  `calculateFantasyPoints()`). `DEFAULT_SCORING_RULES` is the fixed part;
  `buildScoringRules({ pprValue, tePremium })` layers a league's
  Setup-screen choices on top. Coaches score 0 individually today (empty
  stat lines) — `coachBonusRate` here is the current stand-in for a
  richer coach point-modifier planned later, applied at the team level
  in `season.js` rather than per-player here.
- `js/rng.js` — deterministic seeded pseudo-random helpers
  (`seededRandom`, `seededNormal`, `pickWeighted`). Same seed string
  (always built from a player id + week number) always gives the same
  result, so weekly variance and retired-player injury rolls are stable
  across re-renders and reloads without persisting anything extra.
- `js/injuries.js` — injury designations. ACTIVE players get a small,
  best-effort real snapshot (`ACTIVE_INJURY_REPORT`); retired (HOF/HOVG)
  players get a seeded-random weekly roll instead (no real per-week
  injury history exists to pull for them). `isOutForWeek()` is what
  `season.js` calls to zero a player's points; see the roadmap for real
  data-coverage limits.
- `js/draftEngine.js` — pure state-machine snake draft (order, turns,
  roster-slot eligibility via `SLOT_ELIGIBILITY`, undo). `buildRosterSlots()`
  builds the roster template from league format settings: SUPERFLEX
  when enabled, K/DEF each omitted entirely when disabled, and however
  many BENCH slots the league chose. `SKILL_POSITIONS` (QB/RB/WR/TE) is
  the only group of positions subject to the retired/active alternation;
  `getRequiredGroup()` / `playerMatchesGroup()` / `canDraftPlayer()`
  enforce it per team (from how many *skill* picks that team has made so
  far, not by overall pick order) and exempt Coach/K/DEF entirely --
  `getRequiredGroup()` also forces ACTIVE once a team hits its
  `maxRetiredSkillPlayers` cap (stored on the draft object, like
  `rosterSlots`), regardless of the normal alternation count.
  `dropPlayer()` / `addFreeAgent()` are the waiver-wire add/drop
  primitives the Teams tab's Free Agency section uses post-draft. No DOM
  code, so it's ready to be driven by network messages instead of local
  clicks for real multiplayer.
- `js/schedule.js` — generic round-robin matchup generator (byes for odd
  counts), kept separate from scoring so the pairing algorithm (divisions,
  playoffs, etc.) can change independently. Reused by both the fantasy
  league schedule and the NFL schedule below.
- `js/season.js` — weekly simulation, playoffs, and standings.
  `createSeason()` snapshots each rostered player's chosen season (year)
  via `selectSeason()` into `season.selectedSeasons` -- see the
  season-selection note under `players.js` above.
  `computeTeamWeekScore()` is the seam for real per-week game logs and
  matchup-based defense adjustments later; it already applies seeded
  weekly variance (`weeklyVarianceMultiplier`, now exported), injury
  zero-outs (`isOutForWeek`), the coach bonus, and (via
  `js/boxScore.js`) a simulated per-starter box score. It's called fresh
  every `advanceWeek()` against the team's *current* roster (a live
  reference, not a snapshot), and its return value's `breakdown`
  (per-starter points + box score) is stored on that week's matchup —
  together this is why editing a lineup any time only affects weeks
  simulated afterward, and why the Games tab's box score can show
  exactly what happened even after the lineup later changes.
  `getRegularSeasonWeeks()` decides how many of the 16 weeks are regular
  season (14, or 15 for leagues under 4 teams) versus playoffs;
  `advanceWeek()` branches to `advancePlayoffWeek()` once the regular
  season ends, which seeds a bracket from standings (`seedPlayoffs()`)
  and plays it out (`playPlayoffMatchup()`) without touching the
  regular-season win/loss record. All scores round to 1 decimal
  (`round1()` in `scoring.js`).
- `js/boxScore.js` — simulated per-week integer box scores
  (yards/TDs/receptions/carries/fumbles), scaled from a player's
  selected-season averages by the same weekly variance multiplier
  already applied to their points that week. `js/data/realBoxScores.js`
  is the empty real-data seam checked first, keyed by player id then
  week -- add entries there piecemeal as real game logs become
  sourceable, and they override the simulated number automatically.
- `js/data/nflTeams.js` — the 32 current NFL teams; `TEAM_BYE_WEEKS` is
  derived from `REAL_SCHEDULE` (whichever team doesn't appear in a given
  week's real games is on bye that week), not generated.
- `js/data/realNflSchedule.js` / `js/nflSchedule.js` — the real 2026
  regular-season schedule, all 18 weeks, transcribed from a
  pro-football-reference.com schedule export the user supplied directly
  (see roadmap). `getNflSchedule()` picks `REAL_SCHEDULE[week]` when
  present and falls back to an algorithmically generated round-robin
  otherwise; `isRealWeek()` tells the UI which is which. With real data
  for every week the 16-week fantasy season uses, that fallback is
  currently unused but stays in place as the seam for a future season
  before its schedule is known — add it to `REAL_SCHEDULE` and nothing
  else needs to change.
- `js/storage.js` — the only module touching `localStorage`. Swapping in
  a backend/shared multiplayer state means replacing this file alone.
- `js/app.js` — UI controller: renders screens from state and wires up
  events, including the 60-second draft-pick timer. No game logic lives
  here. `rerenderPreservingFocus()` is used by every live-filter search
  box (Draft/Players/Free Agency) instead of a plain `render()`, so
  typing doesn't kick focus out of the input on every keystroke (render()
  otherwise replaces `#app`'s innerHTML, and the input, on every call).
  `showPlayerCard()` builds the full-screen player card (avatar, badges,
  season line, and — once a season exists — a week-by-week table from
  `getPlayerWeeklyHistory()`), reachable via a `data-action="show-player"`
  click handled once, globally, regardless of which screen is showing.

## Roadmap / known v1 limitations

- **Multiplayer draft**: currently a single-device hot-seat draft. The
  draft engine is already headless/pure-data, so a real-time layer (e.g.
  WebSocket relay calling the same `draftPlayer()`/`undoLastPick()`
  functions) can sit on top without changing the engine.
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
  kickers, 12 defenses, 14 coaches). A typical draft comfortably supports
  up to ~8 teams; heavily testing showed a 10+ team league, or a
  strategy that greedily stacks one position, can exhaust that
  position's pool before every roster fills, leaving a slot permanently
  empty and, in the worst case, nothing left for that team to legally
  draft. The UI won't crash (the draft-clock auto-pick just stops
  offering picks once nothing is eligible) but that team's draft stalls.
  Fix is the same as other size limits here: grow the relevant data file.
- **NFL schedule / bye weeks**: now real, not generated. The Games
  screen's NFL Schedule and the per-team BYE badge (Draft/Players tabs)
  both come from the real 2026 regular-season schedule (all 18 weeks;
  the fantasy season uses 1-16), transcribed from a
  pro-football-reference.com schedule export the user supplied directly
  as a PDF. This environment's own tooling still can't fetch it —
  every schedule site tried (ESPN, NFL.com, Pro-Football-Reference,
  CBS Sports, Wikipedia, etc.) is blocked by network egress policy, and
  web search only ever surfaced scattered single-game fragments, not
  full weeks — so a direct fetch was never the path here; the user's
  own upload was. The transcription was cross-checked programmatically
  (all 272 games, no team playing itself or twice in a week, all 32
  teams at exactly 17 games) before being committed. See
  `js/data/realNflSchedule.js` for the seam to extend this to a future
  season once its schedule is known.
- **Weekly scores and box scores are simulated, not real historical game
  logs**: real per-week box scores for ~150 HOF/HOVG players (thousands
  of individual stat lines) aren't obtainable here for the same reason
  as the NFL schedule above — the stats sites that would have them are
  unreachable, and web search doesn't return structured historical
  tables. Instead, `computeTeamWeekScore()` applies a seeded weekly
  variance multiplier around each player's season average
  (`weeklyVarianceMultiplier()` in `season.js`) for points, and
  `js/boxScore.js` scales the same season average by that same
  multiplier for the integer yards/TDs/receptions/carries/fumbles line
  — so both genuinely differ week to week rather than repeating a flat
  number, and stay internally consistent with each other, without
  claiming to be real. `js/data/realBoxScores.js` is already wired as
  the seam for adding real per-week data piecemeal (player by player,
  week by week) as it becomes sourceable; any entry there is used
  automatically instead of the simulated one.
- **Injury data coverage**: only one ACTIVE player designation
  (`sam-laporta`: Questionable) could be confirmed with confidence from
  web search when this was written — most search results for current
  injury reports were too vague or contradictory (old-season articles
  mixed into "current" results) to encode reliably. Everyone else
  defaults to Healthy. This isn't a live feed; update
  `ACTIVE_INJURY_REPORT` in `js/injuries.js` directly as better data
  becomes available.
- **Playoff ties**: a tied playoff game (winnerId would be null) is
  broken toward the first team in the pairing so the bracket always has
  someone to advance -- vanishingly rare given fractional point scoring,
  but worth knowing about if you ever see it.
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
- **Coach scoring**: individual coach scoring is intentionally not
  implemented yet — every coach's own stat line scores 0 (see Scoring
  above); only the flat team-level 5% bonus exists today. The `record`
  field (career W-L-T, titles, title-game appearances) already carries
  the data a future, more nuanced point modifier would use.
- **Headshots**: `js/app.js`'s `playerAvatar()` renders every player's
  avatar as a blank silhouette placeholder on purpose (no photo files
  exist yet). Drop a matching image at `img/headshots/<player.id>.jpg`
  (ids are the kebab-case ones in `js/data/*.js`, e.g.
  `img/headshots/jerry-rice.jpg`) and it starts showing up automatically
  everywhere that player appears — no code changes needed.
