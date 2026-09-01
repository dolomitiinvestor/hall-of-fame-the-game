import { buildScoringRules } from "./scoring.js";
import { searchPlayers, getPlayerById, getBestSeason, formatSeasonLine } from "./players.js";
import {
  createDraft,
  draftPlayer,
  undoLastPick,
  getCurrentTeam,
  teamHasOpenSlotFor,
  canDraftPlayer,
  getRequiredGroup,
  playerMatchesGroup,
  setSlotPlayer,
  dropPlayer,
  addFreeAgent,
  shuffle,
  buildRosterSlots,
  SLOT_ELIGIBILITY,
} from "./draftEngine.js";
import {
  createSeason,
  advanceWeek,
  isSeasonComplete,
  isRegularSeasonComplete,
  getStandingsList,
  SEASON_WEEKS,
} from "./season.js";
import { saveState, loadState, clearState } from "./storage.js";
import { getByeWeek, NFL_TEAMS } from "./data/nflTeams.js";
import { getNflSchedule, isRealWeek } from "./nflSchedule.js";
import { getInjuryStatusKey, INJURY_STATUSES } from "./injuries.js";
import { COACH_QUOTES } from "./data/coachQuotes.js";
import { PLAYER_QUOTES } from "./data/playerQuotes.js";
import { formatBoxScoreLine } from "./boxScore.js";
import { seededRandom } from "./rng.js";

const NFL_TEAM_NAMES = Object.fromEntries(NFL_TEAMS.map((t) => [t.code, t.name]));

const DRAFT_TIMER_SECONDS = 60;

const DEFAULT_LEAGUE_SETTINGS = {
  pprValue: 0.5,
  tePremium: 0,
  superflex: false,
  enableKicker: true,
  enableDefense: true,
  benchSpots: 7,
  maxRetiredSkillPlayers: null, // null = no limit
};

const state = {
  screen: "setup",
  setupTeamNames: ["Team 1", "Team 2"],
  leagueSettings: { ...DEFAULT_LEAGUE_SETTINGS },
  draft: null,
  season: null,
  draftFilter: { query: "", position: "ALL", tagFilter: "ALL" },
  playersFilter: { query: "", position: "ALL", tagFilter: "ALL" },
  freeAgentFilter: { query: "", position: "ALL", tagFilter: "ALL" },
  gamesWeekIndex: null,
};

function getRules() {
  return buildScoringRules(state.leagueSettings);
}

function persist() {
  saveState({
    setupTeamNames: state.setupTeamNames,
    leagueSettings: state.leagueSettings,
    draft: state.draft,
    season: state.season,
  });
}

function restore() {
  const saved = loadState();
  if (saved) {
    state.setupTeamNames = saved.setupTeamNames || state.setupTeamNames;
    // Merge (not replace) so a save from before a new setting existed
    // still gets that setting's default rather than `undefined`.
    state.leagueSettings = { ...DEFAULT_LEAGUE_SETTINGS, ...(saved.leagueSettings || {}) };
    state.draft = saved.draft || null;
    state.season = saved.season || null;
    if (state.draft && state.draft.status === "complete") {
      state.screen = state.season ? "season" : "teams";
    } else if (state.draft) {
      state.screen = "draft";
    }
  }
}

// Re-runs render() but restores focus (and cursor position) to whatever
// input triggered it -- render() replaces #app's innerHTML wholesale on
// every keystroke, which would otherwise destroy and recreate the
// input element the user is actively typing in, kicking focus out of
// it after every character.
function rerenderPreservingFocus() {
  const active = document.activeElement;
  const id = active && active.id;
  const selStart = active && typeof active.selectionStart === "number" ? active.selectionStart : null;
  const selEnd = active && typeof active.selectionEnd === "number" ? active.selectionEnd : null;
  render();
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  if (selStart != null && el.setSelectionRange) {
    try {
      el.setSelectionRange(selStart, selEnd);
    } catch {
      // Some input types (e.g. number) don't support setSelectionRange -- fine to skip.
    }
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

// ---------------------------------------------------------- draft timer
//
// One continuous interval runs while the draft screen is showing an
// in-progress draft. `draftTimerSeconds` is deliberately kept outside
// of `state` (it's ephemeral UI, not something to persist) so re-runs
// of render() -- e.g. typing in the player search box -- don't disturb
// it; only explicit pick/undo/screen-change events reset it.

let draftTimerInterval = null;
let draftTimerSeconds = DRAFT_TIMER_SECONDS;

function draftTimerClass() {
  if (draftTimerSeconds <= 10) return "timer-danger";
  if (draftTimerSeconds <= 20) return "timer-warning";
  return "";
}

function updateDraftTimerDisplay() {
  const el = document.getElementById("draft-timer");
  if (!el) return;
  el.textContent = `${draftTimerSeconds}s`;
  el.className = `draft-timer ${draftTimerClass()}`;
}

function stopDraftTimer() {
  if (draftTimerInterval) {
    clearInterval(draftTimerInterval);
    draftTimerInterval = null;
  }
}

function resetDraftTimer() {
  draftTimerSeconds = DRAFT_TIMER_SECONDS;
  updateDraftTimerDisplay();
}

function startDraftTimer() {
  if (draftTimerInterval) return;
  draftTimerInterval = setInterval(() => {
    draftTimerSeconds--;
    updateDraftTimerDisplay();
    if (draftTimerSeconds <= 0) autoDraftForCurrentTeam();
  }, 1000);
}

// A K or DEF pick is only legal when that slot is enabled for this
// league (see the Kicker/Defense Slot format toggles) -- without it,
// no roster slot (including BENCH) would ever accept one anyway, but
// filtering here keeps them out of the pool/auto-pick entirely rather
// than relying on that indirectly.
function positionEnabledForLeague(position) {
  if (position === "K") return state.leagueSettings.enableKicker;
  if (position === "DEF") return state.leagueSettings.enableDefense;
  return true;
}

// Highest-scoring player currently eligible for whoever's on the
// clock -- shared by the draft-clock auto-pick and the "Complete
// Draft" testing shortcut below, so both pick the same way.
function bestCandidateIdFor(draft, team) {
  const candidates = searchPlayers({ query: "", position: "ALL" }, getRules())
    .filter(({ player }) => positionEnabledForLeague(player.position))
    .filter(({ player }) => !draft.draftedPlayerIds.includes(player.id))
    .filter(({ player }) => canDraftPlayer(draft, team, player))
    .sort((a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame);
  return candidates.length ? candidates[0].player.id : null;
}

// Time expired on someone's pick: auto-draft the highest-scoring
// eligible player available, same as a real draft clock would.
function autoDraftForCurrentTeam() {
  const draft = state.draft;
  if (!draft || draft.status === "complete") {
    stopDraftTimer();
    return;
  }
  const team = getCurrentTeam(draft);
  const playerId = bestCandidateIdFor(draft, team);

  if (!playerId) {
    // Player pool exhausted before rosters filled -- nothing left to
    // auto-draft. Stop the clock rather than loop forever.
    stopDraftTimer();
    return;
  }

  draftPlayer(draft, playerId);
  if (draft.status === "complete" && !state.season) {
    state.season = createSeason(draft, SEASON_WEEKS, getRules());
  }
  persist();
  if (draft.status === "complete") stopDraftTimer();
  else resetDraftTimer();
  render();
}

// Testing shortcut: auto-draft every remaining pick instantly with the
// same "best eligible player" logic as the clock auto-pick, looped
// synchronously instead of one pick per timer tick. Not meant for
// normal play -- it exists so a league can be filled fast while
// testing Teams/Season without hand-drafting every roster.
function completeDraftInstantly() {
  const draft = state.draft;
  if (!draft || draft.status === "complete") return;
  stopDraftTimer();
  let guard = 0;
  const maxPicks = draft.teams.length * draft.totalRounds + 10;
  while (draft.status !== "complete" && guard < maxPicks) {
    const team = getCurrentTeam(draft);
    const playerId = bestCandidateIdFor(draft, team);
    if (!playerId) {
      alert("Ran out of eligible players before every roster filled -- stopping here.");
      break;
    }
    draftPlayer(draft, playerId);
    guard++;
  }
  if (draft.status === "complete" && !state.season) {
    state.season = createSeason(draft, SEASON_WEEKS, getRules());
  }
  persist();
  render();
}

// ---------------------------------------------------------------- nav

function setScreen(screen) {
  state.screen = screen;
  if (screen === "draft" && state.draft && state.draft.status !== "complete") {
    resetDraftTimer();
    startDraftTimer();
  } else {
    stopDraftTimer();
  }
  render();
}

// -------------------------------------------------------------- setup

function renderSetup() {
  const rows = state.setupTeamNames
    .map(
      (name, i) => `
      <div class="team-input-row">
        <input type="text" class="team-name-input" data-idx="${i}" value="${escapeHtml(name)}" placeholder="Team ${i + 1}" />
        <button class="btn btn-danger btn-small" data-action="remove-team" data-idx="${i}" ${state.setupTeamNames.length <= 2 ? "disabled" : ""}>Remove</button>
      </div>`
    )
    .join("");

  const hasSavedLeague = !!state.draft;
  const settings = state.leagueSettings;
  const pprOptions = [0, 0.5, 1]
    .map((v) => `<option value="${v}" ${settings.pprValue === v ? "selected" : ""}>${v} PPR</option>`)
    .join("");
  const tepOptions = [
    { v: 0, label: "None" },
    { v: 0.5, label: "+0.5 pts / TE reception" },
    { v: 1, label: "+1.0 pt / TE reception" },
  ]
    .map(({ v, label }) => `<option value="${v}" ${settings.tePremium === v ? "selected" : ""}>${label}</option>`)
    .join("");
  const superflexOptions = [
    { v: "off", label: "Off" },
    { v: "on", label: "On (extra slot also allows QB)" },
  ]
    .map(({ v, label }) => `<option value="${v}" ${(settings.superflex ? "on" : "off") === v ? "selected" : ""}>${label}</option>`)
    .join("");
  const kickerOptions = [
    { v: "on", label: "On" },
    { v: "off", label: "Off" },
  ]
    .map(({ v, label }) => `<option value="${v}" ${(settings.enableKicker ? "on" : "off") === v ? "selected" : ""}>${label}</option>`)
    .join("");
  const defenseOptions = [
    { v: "on", label: "On" },
    { v: "off", label: "Off" },
  ]
    .map(({ v, label }) => `<option value="${v}" ${(settings.enableDefense ? "on" : "off") === v ? "selected" : ""}>${label}</option>`)
    .join("");
  const benchOptions = Array.from({ length: 11 }, (_, i) => i)
    .map((n) => `<option value="${n}" ${settings.benchSpots === n ? "selected" : ""}>${n}</option>`)
    .join("");
  const maxRetiredOptions = [["", "No limit"], ...Array.from({ length: 10 }, (_, i) => [String(i + 1), String(i + 1)])]
    .map(
      ([v, label]) =>
        `<option value="${v}" ${(settings.maxRetiredSkillPlayers == null ? "" : String(settings.maxRetiredSkillPlayers)) === v ? "selected" : ""}>${label}</option>`
    )
    .join("");

  return `
    <h2>League Settings</h2>
    <p class="hint">Add each team, then start the draft. Roster: ${buildRosterSlots(settings).join(", ")}.</p>
    <div id="team-inputs">${rows}</div>
    <button class="btn" data-action="add-team" ${state.setupTeamNames.length >= 12 ? "disabled" : ""}>+ Add Team</button>

    <h3>League Format</h3>
    <div class="format-row">
      <label>Points Per Reception
        <select id="format-ppr">${pprOptions}</select>
      </label>
      <label>TE Premium
        <select id="format-tep">${tepOptions}</select>
      </label>
      <label>Superflex
        <select id="format-superflex">${superflexOptions}</select>
      </label>
      <label>Kicker Slot
        <select id="format-kicker">${kickerOptions}</select>
      </label>
      <label>Defense Slot
        <select id="format-defense">${defenseOptions}</select>
      </label>
      <label>Bench Spots
        <select id="format-bench">${benchOptions}</select>
      </label>
      <label>Max Retired Players (per team)
        <select id="format-max-retired">${maxRetiredOptions}</select>
      </label>
    </div>

    <div class="setup-actions">
      <button class="btn btn-primary" data-action="start-draft">Start Draft</button>
      ${hasSavedLeague ? '<button class="btn btn-danger" data-action="reset-league">Reset League</button>' : ""}
    </div>
    ${hasSavedLeague ? '<p class="hint">Starting a new draft will erase your current league.</p>' : ""}
  `;
}

function handleSetupClick(action, target) {
  if (action === "add-team") {
    state.setupTeamNames.push(`Team ${state.setupTeamNames.length + 1}`);
    render();
  } else if (action === "remove-team") {
    const idx = Number(target.dataset.idx);
    state.setupTeamNames.splice(idx, 1);
    render();
  } else if (action === "start-draft") {
    startDraft();
  } else if (action === "reset-league") {
    if (confirm("This will erase your current draft and season. Continue?")) {
      state.draft = null;
      state.season = null;
      clearState();
      render();
    }
  }
}

function handleSetupChange(target) {
  if (target.id === "format-ppr") {
    state.leagueSettings.pprValue = Number(target.value);
  } else if (target.id === "format-tep") {
    state.leagueSettings.tePremium = Number(target.value);
  } else if (target.id === "format-superflex") {
    state.leagueSettings.superflex = target.value === "on";
  } else if (target.id === "format-kicker") {
    state.leagueSettings.enableKicker = target.value === "on";
  } else if (target.id === "format-defense") {
    state.leagueSettings.enableDefense = target.value === "on";
  } else if (target.id === "format-bench") {
    state.leagueSettings.benchSpots = Number(target.value);
  } else if (target.id === "format-max-retired") {
    state.leagueSettings.maxRetiredSkillPlayers = target.value === "" ? null : Number(target.value);
  } else {
    return;
  }
  persist();
  render();
}

function startDraft() {
  const names = state.setupTeamNames.map((n) => n.trim()).filter(Boolean);
  if (names.length < 2) {
    alert("Add at least 2 teams to start a draft.");
    return;
  }
  const teamIds = names.map((_, i) => `team-${i + 1}`);
  const order = shuffle(teamIds);
  const rosterSlots = buildRosterSlots(state.leagueSettings);
  state.draft = createDraft(names, rosterSlots, order, state.leagueSettings);
  state.season = null;
  state.screen = "draft";
  persist();
  resetDraftTimer();
  startDraftTimer();
  render();
}

// -------------------------------------------------------------- draft

function byeBadge(teamCode) {
  const wk = getByeWeek(teamCode);
  return wk ? `<span class="bye-badge" title="${escapeHtml(NFL_TEAM_NAMES[teamCode] || teamCode)} bye week">BYE Wk ${wk}</span>` : "";
}

const TAG_BADGE = {
  HOF: { cls: "hof-tag", title: "Enshrined in the Pro Football Hall of Fame" },
  HOVG: { cls: "hovg-tag", title: "Retired, not (yet) in the Hall of Fame -- the \"Hall of Very Good\"" },
  ACTIVE: { cls: "active-tag", title: "Currently active NFL player" },
};

function tagBadge(player) {
  // Team defenses carry no tag (HOF/HOVG/ACTIVE don't apply to a unit
  // rather than an individual) -- render nothing rather than crash.
  const entry = TAG_BADGE[player.tag];
  if (!entry) return "";
  return `<span class="tag-badge ${entry.cls}" title="${entry.title}">${player.tag}</span>`;
}

// Blank-for-now headshot placeholder. Drop a matching file at
// img/headshots/<player.id>.jpg later and it starts showing up here
// automatically -- no code changes needed. Until then (today, for
// every player) the <img> fails to load and removes itself, leaving
// just the generic silhouette underneath. Clickable everywhere it
// appears -- opens that player's card (see showPlayerCard()).
function playerAvatar(player) {
  return `
    <span class="player-avatar" data-action="show-player" data-player="${player.id}" role="button" tabindex="0" aria-label="View ${escapeHtml(player.name)}'s player card">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5Z"/></svg>
      <img src="img/headshots/${player.id}.jpg" alt="" loading="lazy" onerror="this.remove()" />
    </span>`;
}

// A player's clickable name -- opens the same player card as
// playerAvatar(), just with a bigger/more discoverable tap target.
function playerNameLink(player) {
  return `<span class="player-name" data-action="show-player" data-player="${player.id}">${escapeHtml(player.name)}</span>`;
}

const INJURY_BADGE_CLASS = {
  QUESTIONABLE: "injury-q",
  DOUBTFUL: "injury-d",
  OUT: "injury-o",
  IR: "injury-ir",
};

// `week` is optional: omit it (Draft/Teams screens, no week in play)
// to show only an ACTIVE player's fixed real-world designation, if
// any -- retired players' status is a per-week random roll and only
// makes sense once a specific simulated week exists (the Season
// screen's matchup detail, where `week` is always passed).
function injuryBadge(player, week) {
  const key = getInjuryStatusKey(player, week);
  if (key === "HEALTHY") return "";
  const { code, label } = INJURY_STATUSES[key];
  return `<span class="injury-badge ${INJURY_BADGE_CLASS[key]}" title="${escapeHtml(label)}">${code}</span>`;
}

function renderDraft() {
  const draft = state.draft;
  if (!draft) {
    return `<h2>Draft</h2><p class="hint">Set up a league first.</p>`;
  }

  if (draft.status === "complete") {
    return `
      <h2>Draft Complete!</h2>
      <p class="hint">Every roster is set. Head to Teams to set your starting lineup, or straight to Season to start the year.</p>
      <div class="setup-actions">
        <button class="btn btn-primary" data-action="goto-teams">View Teams</button>
        <button class="btn" data-action="goto-season">Go To Season</button>
      </div>
      ${renderDraftBoard(draft)}
    `;
  }

  const currentTeam = getCurrentTeam(draft);
  const rules = getRules();
  const requiredGroup = getRequiredGroup(draft);
  const requiredLabel = requiredGroup === "RETIRED" ? "RETIRED (HOF or HOVG)" : "ACTIVE";
  // Two kinds of ineligibility hide a player entirely rather than show
  // them disabled: (1) a QB/RB/WR/TE of the wrong retired/active group
  // for this pick (COACH/K/DEF are always exempt -- playerMatchesGroup
  // returns true for them); (2) nowhere left on the roster for their
  // position to go (every slot that could hold them, including BENCH,
  // is already full). Anyone still shown is fully draftable.
  const results = searchPlayers(state.draftFilter, rules)
    .filter(({ player }) => positionEnabledForLeague(player.position))
    .filter(({ player }) => !draft.draftedPlayerIds.includes(player.id))
    .filter(({ player }) => playerMatchesGroup(player, requiredGroup))
    .filter(({ player }) => teamHasOpenSlotFor(currentTeam, player.position))
    .sort((a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame);

  const rows = results
    .map(({ player, best }) => {
      return `
        <div class="player-card">
          <div class="player-main">
            ${playerAvatar(player)}
            <span class="pos-badge pos-${player.position}">${player.position}</span>
            ${playerNameLink(player)}
            ${tagBadge(player)}
            ${byeBadge(best.season.team)}
            ${injuryBadge(player)}
          </div>
          <div class="player-season">${escapeHtml(formatSeasonLine(player, best))}</div>
          <div class="player-points">${best.summary.totalPoints} pts season &middot; ${best.summary.pointsPerGame} pts/gm</div>
          <button class="btn btn-primary btn-small" data-action="draft-player" data-player="${player.id}">
            Draft
          </button>
        </div>`;
    })
    .join("") || `<p class="hint">No eligible players match your search/filter right now.</p>`;

  return `
    <h2>Draft &mdash; Round ${draft.round} / ${draft.totalRounds}, Pick ${draft.overallPick}</h2>
    <p class="on-the-clock">
      On the clock: <strong>${escapeHtml(currentTeam.name)}</strong>
      <span id="draft-timer" class="draft-timer ${draftTimerClass()}">${draftTimerSeconds}s</span>
    </p>
    <p class="hint">Your next QB/RB/WR/TE pick must be ${requiredLabel} -- each team's own skill-position picks alternate retired/active, starting with retired. Coach/K/DEF picks aren't restricted and are always shown. Auto-picks the best available eligible player if the clock runs out.</p>

    <div class="testing-row">
      <button class="btn btn-danger btn-small" data-action="complete-draft" title="Auto-drafts every remaining pick instantly. For testing only.">Complete Draft (Testing)</button>
    </div>

    <div class="draft-filters">
      <input type="text" id="draft-search" placeholder="Search players..." value="${escapeHtml(state.draftFilter.query)}" />
      <select id="draft-position-filter">
        ${["ALL", "QB", "RB", "WR", "TE", "COACH", "K", "DEF"]
          .map((p) => `<option value="${p}" ${state.draftFilter.position === p ? "selected" : ""}>${p}</option>`)
          .join("")}
      </select>
      <select id="draft-tag-filter">
        ${[
          ["ALL", "All Players"],
          ["HOF", "Hall of Famers"],
          ["HOVG", "Hall of Very Good"],
          ["ACTIVE", "Active"],
        ]
          .map(([v, label]) => `<option value="${v}" ${state.draftFilter.tagFilter === v ? "selected" : ""}>${label}</option>`)
          .join("")}
      </select>
      <button class="btn" data-action="undo-pick" ${draft.picks.length ? "" : "disabled"}>Undo Last Pick</button>
    </div>

    <div class="player-list">${rows}</div>

    ${renderDraftBoard(draft)}
  `;
}

function renderDraftBoard(draft) {
  const teams = draft.teams
    .map(
      (team) => `
      <div class="mini-roster">
        <h4>${escapeHtml(team.name)}</h4>
        <ul>
          ${team.roster
            .map((s) => {
              const p = s.playerId ? getPlayerById(s.playerId) : null;
              return `<li><span class="slot-label">${s.slot}</span> ${p ? escapeHtml(p.name) : "<em>empty</em>"}</li>`;
            })
            .join("")}
        </ul>
      </div>`
    )
    .join("");
  return `<h3>Rosters So Far</h3><div class="roster-grid">${teams}</div>`;
}

function handleDraftClick(action, target) {
  const draft = state.draft;
  if (!draft) return;
  if (action === "draft-player") {
    try {
      draftPlayer(draft, target.dataset.player);
      if (draft.status === "complete" && !state.season) {
        state.season = createSeason(draft, SEASON_WEEKS, getRules());
      }
      persist();
      if (draft.status === "complete") stopDraftTimer();
      else resetDraftTimer();
      render();
    } catch (err) {
      alert(err.message);
    }
  } else if (action === "undo-pick") {
    undoLastPick(draft);
    state.season = null;
    persist();
    resetDraftTimer();
    render();
  } else if (action === "complete-draft") {
    completeDraftInstantly();
  } else if (action === "goto-teams") {
    stopDraftTimer();
    setScreen("teams");
  } else if (action === "goto-season") {
    stopDraftTimer();
    if (!state.season) state.season = createSeason(draft, SEASON_WEEKS, getRules());
    persist();
    setScreen("season");
  }
}

// -------------------------------------------------------------- teams

function renderTeams() {
  const draft = state.draft;
  if (!draft) return `<h2>Teams</h2><p class="hint">Set up a league first.</p>`;
  const rules = getRules();

  const teams = draft.teams
    .map((team, teamIdx) => {
      const rows = team.roster
        .map((slot, slotIdx) => {
          const eligiblePositions = SLOT_ELIGIBILITY[slot.slot] || [];
          const options = team.roster
            .map((s) => s.playerId)
            .filter(Boolean)
            .filter((pid, i, arr) => arr.indexOf(pid) === i)
            .map((pid) => getPlayerById(pid))
            .filter((p) => eligiblePositions.includes(p.position));

          const optionHtml = [`<option value="">-- empty --</option>`]
            .concat(
              options.map((p) => {
                const best = getBestSeason(p, rules);
                return `<option value="${p.id}" ${slot.playerId === p.id ? "selected" : ""}>${escapeHtml(p.name)} (${best.summary.pointsPerGame} pts/gm)</option>`;
              })
            )
            .join("");

          const currentPlayer = slot.playerId ? getPlayerById(slot.playerId) : null;
          const seasonLine = currentPlayer
            ? escapeHtml(formatSeasonLine(currentPlayer, getBestSeason(currentPlayer, rules)))
            : "";
          const dropBtn =
            currentPlayer && draft.status === "complete"
              ? `<button class="btn btn-danger btn-small" data-action="drop-player" data-team="${team.id}" data-player="${currentPlayer.id}">Drop</button>`
              : "";

          return `
            <tr>
              <td class="slot-label">${slot.slot}</td>
              <td class="player-cell">
                ${currentPlayer ? playerAvatar(currentPlayer) : ""}
                <select data-action="set-slot" data-team="${teamIdx}" data-slot="${slotIdx}">${optionHtml}</select>
                ${currentPlayer ? injuryBadge(currentPlayer) : ""}
              </td>
              <td class="season-line">${seasonLine}</td>
              <td>${dropBtn}</td>
            </tr>`;
        })
        .join("");

      return `
        <details class="panel" open>
          <summary>${escapeHtml(team.name)}</summary>
          <table class="roster-table">
            <thead><tr><th>Slot</th><th>Player</th><th>Best Season</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </details>`;
    })
    .join("");

  return `
    <h2>Teams &amp; Lineups</h2>
    <p class="hint">Only non-BENCH slots score points each week. Move players between slots below.</p>
    ${teams}
    ${renderFreeAgency(draft, rules)}
  `;
}

// Waiver-wire style add/drop, only once the draft is complete (mid-draft,
// roster changes should only come from the draft itself -- see the
// Drop buttons above, gated the same way). Drop clears a roster slot
// and returns that player to the pool; Add auto-fills whichever open
// slot on the chosen team fits the free agent's position, same
// slot-priority logic the draft itself uses.
function renderFreeAgency(draft, rules) {
  if (draft.status !== "complete") return "";
  const draftedIds = new Set(draft.draftedPlayerIds);
  const results = searchPlayers(state.freeAgentFilter, rules)
    .filter(({ player }) => positionEnabledForLeague(player.position))
    .filter(({ player }) => !draftedIds.has(player.id))
    .sort((a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame)
    .slice(0, 150);

  const teamOptions = draft.teams.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join("");

  const rows = results
    .map(({ player, best }) => {
      return `
        <div class="player-card">
          <div class="player-main">
            ${playerAvatar(player)}
            <span class="pos-badge pos-${player.position}">${player.position}</span>
            ${playerNameLink(player)}
            ${tagBadge(player)}
          </div>
          <div class="player-season">${escapeHtml(formatSeasonLine(player, best))}</div>
          <div class="player-points">${best.summary.totalPoints.toFixed(1)} pts season &middot; ${best.summary.pointsPerGame.toFixed(1)} pts/gm</div>
          <div class="free-agent-actions">
            <select data-role="fa-team-select" data-player="${player.id}">${teamOptions}</select>
            <button class="btn btn-primary btn-small" data-action="add-free-agent" data-player="${player.id}">Add</button>
          </div>
        </div>`;
    })
    .join("") || `<p class="hint">No free agents match your search/filter.</p>`;

  return `
    <h3>Free Agency</h3>
    <p class="hint">Drop a rostered player above to open a slot, then add any undrafted player here -- pick the team, hit Add.</p>
    <div class="draft-filters">
      <input type="text" id="fa-search" placeholder="Search players..." value="${escapeHtml(state.freeAgentFilter.query)}" />
      <select id="fa-position-filter">
        ${["ALL", "QB", "RB", "WR", "TE", "COACH", "K", "DEF"]
          .map((p) => `<option value="${p}" ${state.freeAgentFilter.position === p ? "selected" : ""}>${p}</option>`)
          .join("")}
      </select>
    </div>
    <div class="player-list">${rows}</div>
  `;
}

function handleTeamsChange(target) {
  if (target.dataset.action === "set-slot") {
    const draft = state.draft;
    const team = draft.teams[Number(target.dataset.team)];
    const slotIdx = Number(target.dataset.slot);
    setSlotPlayer(team, slotIdx, target.value || null);
    persist();
    render();
  }
}

function handleTeamsClick(action, target) {
  const draft = state.draft;
  if (!draft) return;
  if (action === "drop-player") {
    const player = getPlayerById(target.dataset.player);
    if (confirm(`Drop ${player ? player.name : "this player"}? They'll return to the free agent pool.`)) {
      try {
        dropPlayer(draft, target.dataset.team, target.dataset.player);
        persist();
        render();
      } catch (err) {
        alert(err.message);
      }
    }
  } else if (action === "add-free-agent") {
    const playerId = target.dataset.player;
    const select = document.querySelector(`select[data-role="fa-team-select"][data-player="${playerId}"]`);
    const teamId = select ? select.value : draft.teams[0]?.id;
    try {
      addFreeAgent(draft, teamId, playerId);
      persist();
      render();
    } catch (err) {
      alert(err.message);
    }
  }
}

// ------------------------------------------------------------ players

// Read-only, filterable directory of every player/coach/kicker/defense
// in the game -- ESPN's "Players" tab equivalent. No Draft button here
// (that's the Draft screen's job); this is for browsing and checking
// who's already been taken.
function renderPlayers() {
  const rules = getRules();
  const draft = state.draft;
  const draftedIds = draft ? new Set(draft.draftedPlayerIds) : new Set();

  const results = searchPlayers(state.playersFilter, rules).sort(
    (a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame
  );

  const rows = results
    .map(({ player, best }) => {
      const drafted = draftedIds.has(player.id);
      return `
        <div class="player-card">
          <div class="player-main">
            ${playerAvatar(player)}
            <span class="pos-badge pos-${player.position}">${player.position}</span>
            ${playerNameLink(player)}
            ${tagBadge(player)}
            ${byeBadge(best.season.team)}
            ${injuryBadge(player)}
            ${drafted ? '<span class="tag-badge drafted-badge" title="Already on a roster">DRAFTED</span>' : ""}
          </div>
          <div class="player-season">${escapeHtml(formatSeasonLine(player, best))}</div>
          <div class="player-points">${best.summary.totalPoints} pts season &middot; ${best.summary.pointsPerGame} pts/gm</div>
        </div>`;
    })
    .join("") || `<p class="hint">No players match your search/filter.</p>`;

  return `
    <h2>Players</h2>
    <p class="hint">Every player, coach, kicker, and defense in the game, ranked by points per game at their career-best (or projected) season. ${draft ? "DRAFTED marks anyone already on a roster." : "Set up a league to see draft status here."}</p>

    <div class="draft-filters">
      <input type="text" id="players-search" placeholder="Search players..." value="${escapeHtml(state.playersFilter.query)}" />
      <select id="players-position-filter">
        ${["ALL", "QB", "RB", "WR", "TE", "COACH", "K", "DEF"]
          .map((p) => `<option value="${p}" ${state.playersFilter.position === p ? "selected" : ""}>${p}</option>`)
          .join("")}
      </select>
      <select id="players-tag-filter">
        ${[
          ["ALL", "All Players"],
          ["HOF", "Hall of Famers"],
          ["HOVG", "Hall of Very Good"],
          ["ACTIVE", "Active"],
        ]
          .map(([v, label]) => `<option value="${v}" ${state.playersFilter.tagFilter === v ? "selected" : ""}>${label}</option>`)
          .join("")}
      </select>
    </div>

    <div class="player-list">${rows}</div>
  `;
}

// ------------------------------------------------------------- season

// A deterministic quote from a *player* after their game -- infra
// twin of coachQuoteForTeam() above, backed by PLAYER_QUOTES (empty
// seam today; see js/data/playerQuotes.js). No quote shows until real
// player quotes are added there.
function playerQuoteFor(playerId, week) {
  const quotes = PLAYER_QUOTES[playerId];
  if (!quotes || !quotes.length) return null;
  const idx = Math.floor(seededRandom(`playerquote:${playerId}:${week}`) * quotes.length);
  return quotes[idx];
}

// Per-starter box score for one team's side of a matchup, plus the
// coach bonus line if one applied. Everything comes straight off the
// stored score object (computeTeamWeekScore() at the time that week
// was simulated), not recomputed live, so this stays an accurate
// historical record even after a lineup is edited later. `week` is
// only needed for the deterministic player-quote pick.
function renderPlayerBreakdown(score, week) {
  const { breakdown, coachBonus } = score;
  if (!breakdown.length) return `<p class="hint">No starters were set that week.</p>`;
  const rows = breakdown
    .map((b) => {
      const player = getPlayerById(b.playerId);
      const badge = INJURY_STATUSES[b.injury]?.code
        ? `<span class="injury-badge ${INJURY_BADGE_CLASS[b.injury]}" title="${escapeHtml(INJURY_STATUSES[b.injury].label)}">${INJURY_STATUSES[b.injury].code}</span>`
        : "";
      const boxLine = formatBoxScoreLine(b.boxScore);
      const quote = playerQuoteFor(b.playerId, week);
      return `
      <tr>
        <td><span class="pos-badge pos-${b.position}">${b.position}</span></td>
        <td>
          <div class="player-row-name">${player ? playerAvatar(player) : ""}${player ? playerNameLink(player) : escapeHtml(b.name)} ${badge}</div>
          ${boxLine ? `<div class="box-score-line">${escapeHtml(boxLine)}</div>` : ""}
          ${quote ? `<div class="player-quote">&ldquo;${escapeHtml(quote)}&rdquo;</div>` : ""}
        </td>
        <td>${b.points.toFixed(1)}</td>
      </tr>`;
    })
    .join("");
  const bonusRow = coachBonus
    ? `<p class="hint coach-bonus-note">+ ${escapeHtml(coachBonus.coachName)} coach bonus: ${coachBonus.amount >= 0 ? "+" : ""}${coachBonus.amount.toFixed(1)} (${(coachBonus.rate * 100).toFixed(0)}%)</p>`
    : "";
  return `
    <table class="roster-table matchup-table">
      <thead><tr><th>Pos</th><th>Player</th><th>Pts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${bonusRow}`;
}

// A deterministic quote from a team's started Coach (COACH slot, not
// benched -- same rule as the coach scoring bonus), shown next to
// their score after a game. Same pick if you look again, but varies
// by team and week. No quote if the team has no Coach starting that
// week, or the coach's id isn't in COACH_QUOTES yet.
function coachQuoteForTeam(team, week) {
  const coachSlot = team.roster.find((s) => s.slot === "COACH" && s.playerId);
  if (!coachSlot) return null;
  const coach = getPlayerById(coachSlot.playerId);
  const quotes = COACH_QUOTES[coachSlot.playerId];
  if (!coach || !quotes || !quotes.length) return null;
  const idx = Math.floor(seededRandom(`quote:${team.id}:${week}`) * quotes.length);
  return { coachName: coach.name, text: quotes[idx] };
}

function renderScoreBlock(team, score, win, week) {
  const quote = coachQuoteForTeam(team, week);
  const quoteHtml = quote
    ? `<p class="coach-quote">&ldquo;${escapeHtml(quote.text)}&rdquo; <span class="coach-quote-author">&mdash; ${escapeHtml(quote.coachName)}</span></p>`
    : "";
  return `
    <div class="matchup-score-block">
      <span class="${win}">${escapeHtml(team.name)} ${score.total.toFixed(1)}</span>
      ${quoteHtml}
    </div>`;
}

// Full game detail: header (both teams' scores + coach quotes) and the
// full per-starter box score for both sides. Used by the Games tab's
// fullscreen game view (see openGameFullscreen()) -- clicking a
// compact game row opens exactly this, full-screen, rather than
// expanding in place.
function buildGameDetailHtml(m, draft, label, week) {
  const [aId, bId] = m.teamIds;
  const aTeam = draft.teams.find((t) => t.id === aId);
  const bTeam = draft.teams.find((t) => t.id === bId);
  const aScore = m.scores[aId];
  const bScore = m.scores[bId];
  const aWin = m.winnerId === aId ? " win" : "";
  const bWin = m.winnerId === bId ? " win" : "";
  const labelTag = label ? `<span class="tag-badge hovg-tag">${escapeHtml(label)}</span>` : "";
  return `
    <div class="game-detail-header">
      ${labelTag}
      ${renderScoreBlock(aTeam, aScore, aWin, week)}
      <span class="vs">vs</span>
      ${renderScoreBlock(bTeam, bScore, bWin, week)}
    </div>
    <div class="matchup-detail">
      <div class="matchup-team">
        <h5>${escapeHtml(aTeam.name)}</h5>
        ${renderPlayerBreakdown(aScore, week)}
      </div>
      <div class="matchup-team">
        <h5>${escapeHtml(bTeam.name)}</h5>
        ${renderPlayerBreakdown(bScore, week)}
      </div>
    </div>`;
}

function renderNflSchedule(weeks) {
  const nflWeeks = getNflSchedule(weeks);
  const weekBlocks = nflWeeks
    .map((games, idx) => {
      const rows = games
        .map((g) => {
          const away = escapeHtml(NFL_TEAM_NAMES[g.away] || g.away);
          const home = escapeHtml(NFL_TEAM_NAMES[g.home] || g.home);
          return `<div class="nfl-game"><span>${away} (${g.away})</span><span class="at">at</span><span class="home-team">${home} (${g.home})</span></div>`;
        })
        .join("");
      const real = isRealWeek(idx + 1);
      const badge = real
        ? `<span class="tag-badge active-tag" title="Real, confirmed 2026 schedule">REAL</span>`
        : `<span class="tag-badge hovg-tag" title="Algorithmically generated, not a real schedule">GENERATED</span>`;
      return `<details class="panel week-panel"><summary>Week ${idx + 1} ${badge}</summary><div class="nfl-week-games">${rows}</div></details>`;
    })
    .join("");
  return `
    <h3>NFL Schedule</h3>
    <p class="hint">The real 2026 regular-season schedule -- see the FAQ.</p>
    <div class="nfl-schedule">${weekBlocks}</div>
  `;
}

function currentWeekLabel(season) {
  if (isSeasonComplete(season)) return "Season complete!";
  const weekNum = season.currentWeek + 1;
  if (weekNum <= season.regularSeasonWeeks) {
    return `Week ${weekNum} of ${season.regularSeasonWeeks} (Regular Season)`;
  }
  const totalPlayoffWeeks = season.weeks - season.regularSeasonWeeks;
  const roundName = totalPlayoffWeeks >= 2 && weekNum === season.regularSeasonWeeks + 1 ? "Semifinals" : "Championship";
  return `Playoffs: ${roundName} (Week ${weekNum} of ${season.weeks})`;
}

// Shown on the Season tab at all times once the draft is complete:
// before the regular season ends this is a *projected* bracket (top
// seeds by current standings, relabeled and re-sorted every week as
// standings shift); once the regular season ends it's the actual
// seeded bracket (frozen -- season.playoffs.seeds, set once by
// seedPlayoffs() in season.js), and any playoff games already played
// show their real scores.
function renderPlayoffsSection(season, draft) {
  const regularDone = isRegularSeasonComplete(season);
  const seeds = season.playoffs
    ? season.playoffs.seeds
    : getStandingsList(season, draft)
        .slice(0, Math.min(4, draft.teams.length))
        .map((s) => s.teamId);
  const bracketSize = seeds.length;
  const teamName = (id) => escapeHtml(draft.teams.find((t) => t.id === id).name);
  const seedRows = seeds.map((id, i) => `<li>#${i + 1} ${teamName(id)}</li>`).join("");
  const champion = season.championId
    ? `<p class="champion-banner">&#127942; Champion: <strong>${teamName(season.championId)}</strong></p>`
    : "";

  const playoffWeeks = season.weeklyResults.filter((wk) => wk.round === "playoff");
  const resultRows = playoffWeeks
    .flatMap((wk) => {
      const labels =
        wk.matchups.length === 2 && wk.roundLabel === "Championship" ? ["Championship", "3rd Place"] : wk.matchups.map(() => wk.roundLabel);
      return wk.matchups.map((m, i) => ({ ...m, roundLabel: labels[i] }));
    })
    .map((m) => {
      const [aId, bId] = m.teamIds;
      const aWin = m.winnerId === aId ? " win" : "";
      const bWin = m.winnerId === bId ? " win" : "";
      return `<li>${escapeHtml(m.roundLabel)}: <span class="${aWin}">${teamName(aId)} ${m.scores[aId].total.toFixed(1)}</span> vs <span class="${bWin}">${teamName(bId)} ${m.scores[bId].total.toFixed(1)}</span></li>`;
    })
    .join("");

  const heading = regularDone ? "Playoffs" : "Projected Playoff Bracket";
  const subtitle = regularDone
    ? bracketSize >= 4
      ? "Top 4 seeds: semifinals (1v4, 2v3), then championship + 3rd place."
      : "Top 2 seeds play a single championship game."
    : "Based on current standings -- updates as the regular season continues, and locks in once it ends.";

  return `
    <h3>${heading}</h3>
    ${champion}
    <div class="panel">
      <p class="hint">${subtitle}</p>
      <ol class="playoff-seeds">${seedRows}</ol>
      ${resultRows ? `<h4>Results</h4><ul class="playoff-results">${resultRows}</ul>` : ""}
    </div>
  `;
}

function renderSeason() {
  const draft = state.draft;
  if (!draft || draft.status !== "complete") {
    return `<h2>Season</h2><p class="hint">Finish the draft first.</p>`;
  }
  if (!state.season) {
    state.season = createSeason(draft, SEASON_WEEKS, getRules());
    persist();
  }
  const season = state.season;
  const complete = isSeasonComplete(season);

  const standings = getStandingsList(season, draft)
    .map(
      (s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(s.teamName)}</td>
        <td>${s.wins}-${s.losses}-${s.ties}</td>
        <td>${s.pointsFor.toFixed(1)}</td>
        <td>${s.pointsAgainst.toFixed(1)}</td>
      </tr>`
    )
    .join("");

  return `
    <h2>Season</h2>
    <p class="hint">${currentWeekLabel(season)}</p>
    <button class="btn btn-primary" data-action="advance-week" ${complete ? "disabled" : ""}>
      ${complete ? "Season Finished" : "Advance Week"}
    </button>
    <p class="hint">Set lineups any time from the <button class="link-btn" data-action="goto-teams-from-season">Teams tab</button> -- changes apply starting with the next week you advance; past weeks keep their own recorded lineup. See every matchup so far on the <button class="link-btn" data-action="goto-games-from-season">Games tab</button>.</p>

    <h3>Standings${isRegularSeasonComplete(season) ? " (Regular Season)" : ""}</h3>
    <table class="roster-table standings-table">
      <thead><tr><th>#</th><th>Team</th><th>W-L-T</th><th>PF</th><th>PA</th></tr></thead>
      <tbody>${standings}</tbody>
    </table>

    ${renderPlayoffsSection(season, draft)}
  `;
}

function handleSeasonClick(action) {
  if (action === "advance-week") {
    advanceWeek(state.season, state.draft, getRules());
    persist();
    render();
    const justPlayed = state.season.weeklyResults[state.season.weeklyResults.length - 1];
    showWeekCompleteSplash(justPlayed);
  } else if (action === "goto-teams-from-season") {
    setScreen("teams");
  } else if (action === "goto-games-from-season") {
    setScreen("games");
  }
}

// -------------------------------------------------------------- games

// One compact, single-line game row -- name + score for both teams,
// no expansion in place. Tapping it opens the full box score
// full-screen (see openGameFullscreen()) rather than growing inline,
// which is what keeps a whole week's slate fitting on screen together.
function renderCompactGameRow(m, draft, weekIdx, matchupIdx, label) {
  const [aId, bId] = m.teamIds;
  const aTeam = draft.teams.find((t) => t.id === aId);
  const bTeam = draft.teams.find((t) => t.id === bId);
  const aScore = m.scores[aId];
  const bScore = m.scores[bId];
  const aWin = m.winnerId === aId ? " win" : "";
  const bWin = m.winnerId === bId ? " win" : "";
  const labelTag = label ? `<span class="tag-badge hovg-tag">${escapeHtml(label)}</span>` : "";
  return `
    <button class="game-row" data-action="open-game" data-week-idx="${weekIdx}" data-matchup-idx="${matchupIdx}">
      ${labelTag}
      <span class="game-row-team${aWin}">${escapeHtml(aTeam.name)} <b>${aScore.total.toFixed(1)}</b></span>
      <span class="vs">vs</span>
      <span class="game-row-team${bWin}">${escapeHtml(bTeam.name)} <b>${bScore.total.toFixed(1)}</b></span>
    </button>`;
}

// One week at a time (all of that week's games stacked vertically),
// with left/right arrows to move between weeks -- ESPN's "Games" /
// schedule tab equivalent. Defaults to the most recently played week.
function renderGames() {
  const draft = state.draft;
  if (!draft || draft.status !== "complete") {
    return `<h2>Games</h2><p class="hint">Finish the draft first.</p>`;
  }
  if (!state.season) {
    state.season = createSeason(draft, SEASON_WEEKS, getRules());
    persist();
  }
  const season = state.season;
  const results = season.weeklyResults;

  if (!results.length) {
    return `
      <h2>Games</h2>
      <p class="hint">No weeks played yet -- advance a week from the Season tab.</p>
      ${renderNflSchedule(season.weeks)}
    `;
  }

  if (state.gamesWeekIndex == null || state.gamesWeekIndex >= results.length) {
    state.gamesWeekIndex = results.length - 1;
  }
  const idx = state.gamesWeekIndex;
  const wk = results[idx];
  const isPlayoff = wk.round === "playoff";
  const labels =
    isPlayoff && wk.matchups.length === 2 && wk.roundLabel === "Championship"
      ? ["Championship", "3rd Place"]
      : wk.matchups.map(() => wk.roundLabel);
  const gameRows = wk.matchups.map((m, i) => renderCompactGameRow(m, draft, idx, i, isPlayoff ? labels[i] : null)).join("");
  const byeLabel = isPlayoff ? "Missed playoffs" : "Bye";
  const byes = wk.byeTeamIds.length
    ? `<div class="bye-note">${byeLabel}: ${wk.byeTeamIds.map((id) => escapeHtml(draft.teams.find((t) => t.id === id).name)).join(", ")}</div>`
    : "";
  const weekHeading = isPlayoff ? `Week ${wk.week} &mdash; Playoffs: ${escapeHtml(wk.roundLabel)}` : `Week ${wk.week}`;

  return `
    <h2>Games</h2>
    <div class="week-nav">
      <button class="btn btn-small" data-action="games-prev-week" ${idx === 0 ? "disabled" : ""} aria-label="Previous week">&larr;</button>
      <span class="week-nav-label">${weekHeading}</span>
      <button class="btn btn-small" data-action="games-next-week" ${idx === results.length - 1 ? "disabled" : ""} aria-label="Next week">&rarr;</button>
    </div>
    <p class="hint">Tap a game for the full box score.</p>
    <div class="game-list">${gameRows}</div>
    ${byes}

    ${renderNflSchedule(season.weeks)}
  `;
}

function handleGamesClick(action, target) {
  if (action === "games-prev-week") {
    state.gamesWeekIndex = Math.max(0, (state.gamesWeekIndex || 0) - 1);
    render();
  } else if (action === "games-next-week") {
    const max = state.season.weeklyResults.length - 1;
    state.gamesWeekIndex = Math.min(max, (state.gamesWeekIndex || 0) + 1);
    render();
  } else if (action === "open-game") {
    openGameFullscreen(Number(target.dataset.weekIdx), Number(target.dataset.matchupIdx));
  }
}

// Full-screen single-game view: X (or Escape) closes it and returns to
// the Games tab's week view underneath, unchanged -- see
// buildGameDetailHtml() for the actual content.
function openGameFullscreen(weekIdx, matchupIdx) {
  const wk = state.season.weeklyResults[weekIdx];
  const m = wk.matchups[matchupIdx];
  const isPlayoff = wk.round === "playoff";
  const labels =
    isPlayoff && wk.matchups.length === 2 && wk.roundLabel === "Championship"
      ? ["Championship", "3rd Place"]
      : wk.matchups.map(() => wk.roundLabel);
  const label = isPlayoff ? labels[matchupIdx] : null;
  const weekHeading = isPlayoff ? `Week ${wk.week} &mdash; Playoffs: ${escapeHtml(wk.roundLabel)}` : `Week ${wk.week}`;

  const body = document.getElementById("game-fullscreen-body");
  if (!body) return;
  body.innerHTML = `
    <h2>${weekHeading}</h2>
    ${buildGameDetailHtml(m, state.draft, label, wk.week)}
  `;
  document.getElementById("game-fullscreen-overlay").hidden = false;
}

function closeGameFullscreen() {
  const overlay = document.getElementById("game-fullscreen-overlay");
  if (overlay) overlay.hidden = true;
}

// ---------------------------------------------------------- player card

// Every week this season where `playerId` started (i.e. appears in a
// matchup breakdown -- bench weeks never do, same as everywhere else
// in the app), oldest first, with that week's points/box score/injury
// as actually recorded at the time.
function getPlayerWeeklyHistory(playerId) {
  if (!state.season) return [];
  const rows = [];
  state.season.weeklyResults.forEach((wk) => {
    wk.matchups.forEach((m) => {
      Object.values(m.scores).forEach((score) => {
        const entry = score.breakdown.find((b) => b.playerId === playerId);
        if (entry) rows.push({ week: wk.week, round: wk.round, roundLabel: wk.roundLabel, ...entry });
      });
    });
  });
  return rows.sort((a, b) => a.week - b.week);
}

// Full-screen card for one player: avatar, position/tag/bye, which
// fantasy team (if any) has them rostered, their season line, and
// (once a season is underway) a week-by-week table of actual points
// and box scores. Reachable by clicking a player's avatar or name
// pretty much anywhere in the app -- see the global "show-player"
// click handling in wireEvents().
function showPlayerCard(playerId) {
  const player = getPlayerById(playerId);
  const body = document.getElementById("player-card-body");
  const overlay = document.getElementById("player-card-overlay");
  if (!player || !body || !overlay) return;
  const rules = getRules();
  const best = getBestSeason(player, rules);

  const rosterTeam = state.draft?.teams.find((t) => t.roster.some((s) => s.playerId === playerId));
  const teamLine = rosterTeam ? `Rostered by <strong>${escapeHtml(rosterTeam.name)}</strong>` : "Not currently rostered";

  const history = getPlayerWeeklyHistory(playerId);
  const historyRows = history
    .map((h) => {
      const boxLine = formatBoxScoreLine(h.boxScore);
      const weekLabel = h.round === "playoff" ? `Wk ${h.week} (${escapeHtml(h.roundLabel)})` : `Wk ${h.week}`;
      const badge = INJURY_STATUSES[h.injury]?.code
        ? `<span class="injury-badge ${INJURY_BADGE_CLASS[h.injury]}" title="${escapeHtml(INJURY_STATUSES[h.injury].label)}">${INJURY_STATUSES[h.injury].code}</span>`
        : "";
      return `<tr><td>${weekLabel}</td><td>${h.points.toFixed(1)} ${badge}</td><td>${escapeHtml(boxLine)}</td></tr>`;
    })
    .join("");
  const historySection = history.length
    ? `<h3>Weekly Box Scores</h3><table class="roster-table"><thead><tr><th>Week</th><th>Pts</th><th>Box Score</th></tr></thead><tbody>${historyRows}</tbody></table>`
    : `<p class="hint">${state.season ? "Hasn't started a week yet this season." : "No season in progress yet."}</p>`;

  body.innerHTML = `
    <div class="player-card-header">
      <span class="player-avatar player-avatar-lg" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5Z"/></svg>
        <img src="img/headshots/${player.id}.jpg" alt="" loading="lazy" onerror="this.remove()" />
      </span>
      <div>
        <h2>${escapeHtml(player.name)}</h2>
        <p class="player-card-badges">
          <span class="pos-badge pos-${player.position}">${player.position}</span>
          ${tagBadge(player)}
          ${byeBadge(best.season.team)}
          ${injuryBadge(player)}
        </p>
        <p class="hint">${teamLine}</p>
      </div>
    </div>
    <p>${escapeHtml(formatSeasonLine(player, best))}</p>
    <p class="hint">${best.summary.totalPoints.toFixed(1)} pts season &middot; ${best.summary.pointsPerGame.toFixed(1)} pts/gm</p>
    ${historySection}
  `;
  overlay.hidden = false;
}

function closePlayerCard() {
  const overlay = document.getElementById("player-card-overlay");
  if (overlay) overlay.hidden = true;
}

// ---------------------------------------------------------------- faq

const FAQ_ITEMS = [
  {
    q: "How does the draft work?",
    a: "It's a local, hot-seat snake draft: pick order reverses each round. Each team's own QB/RB/WR/TE picks also alternate between retired and active, starting with retired on their 1st skill pick, active on their 2nd, retired on their 3rd, and so on -- independently per team, not by overall pick order. Whichever group isn't currently eligible is hidden from the list entirely rather than shown disabled -- and so is anyone your team has nowhere left to roster (every slot that could hold their position, including BENCH, already full). Coach, K, and DEF picks aren't part of the retired/active alternation and are always shown, subject to that same roster-room check. On your turn, search or filter the player pool and hit Draft. Each player auto-fills the most specific open roster slot (their exact position, then FLEX/SUPERFLEX, then BENCH).",
  },
  {
    q: "What does the season line next to a player mean?",
    a: "Every retired player's career-best season is calculated live from your league's current scoring settings (PPR, TE Premium) -- not hard-coded -- so it always reflects the format you picked in League Settings. Active players show a single projected season the same way (marked 'proj.'). That's the season you're drafting them at.",
  },
  {
    q: "What's the 60-second draft timer?",
    a: "Each pick has 60 seconds on the clock. If time runs out, the app auto-drafts the highest-scoring player still available that's eligible for the pick (right retired/active group, open roster slot), just like an autopick in a real draft room.",
  },
  {
    q: "What do the HOF / HOVG / ACTIVE badges mean, and why must picks alternate?",
    a: "Every player and coach carries one tag: HOF (enshrined in the relevant Hall of Fame), HOVG (retired/former, statistically or historically great, not yet enshrined -- the 'Hall of Very Good'), or ACTIVE (currently playing/coaching). Kickers are tagged too, but defenses aren't -- a team defensive unit isn't an individual who can be personally enshrined, so no badge shows for DEF. HOF and HOVG together count as 'retired' for the draft's alternating rule, which only applies to QB/RB/WR/TE. Filter to any one tag with the dropdown next to the position filter. Active players' rough draft order (and their projected points) approximates this year's fantasy ADP, assembled from multiple outlets and formulaically projected -- not a live feed, so expect some drift from any single site.",
  },
  {
    q: "What are the Coach, K, and DEF roster spots?",
    a: "Every team drafts exactly one Coach (from the top 10 all-time NFL coaches and top 4 all-time college coaches), one Kicker, and one Defense (a single all-time-great team defensive season), alongside the usual offensive skill positions. Kickers score on field goals/extra points made; defenses score on sacks, interceptions, fumble recoveries, defensive TDs, safeties, and a tiered bonus/penalty for points allowed per game -- all real scoring, adjustable in js/scoring.js. A started Coach doesn't score individually, but adds a flat 5% bonus to your team's total for the week (shown under that team's box score) -- benching your Coach removes the bonus. None of the three count toward the retired/active alternation.",
  },
  {
    q: "Can I turn off Kicker/Defense, or change bench spots and how many retired players I can draft?",
    a: "Yes -- League Settings has four more format toggles alongside PPR/TE Premium/Superflex: Kicker Slot and Defense Slot can each be switched off (that position is then never draftable at all, not just benched), Bench Spots sets how many bench slots every roster gets (0-10), and Max Retired Players caps how many HOF/HOVG skill-position (QB/RB/WR/TE) players a team may draft -- once a team hits that cap, the alternating retired/active rule just requires active for the rest of their skill picks. All four are locked in once you start the draft, like every other format setting.",
  },
  {
    q: "What's the quote next to each team's score on the Games tab?",
    a: "A real, attributed quote from that team's started Coach -- one per team, per game. It's picked deterministically (same pick if you look again, but varies game to game) from a fixed list of that coach's real quotes, not generated. A team without a Coach in the starting slot that week shows no quote, matching the same rule as the Coach scoring bonus. Individual players can carry a quote the same way (shown next to them in their box score) -- infrastructure only for now, since no player quotes have been added yet; see js/data/playerQuotes.js.",
  },
  {
    q: "What's the injury (Q/D/O/IR) badge?",
    a: "Active players show a real current designation where one could be confirmed -- a small, best-effort snapshot (not a live feed), since most injury-report sites couldn't be reached from here; most show nothing (Healthy). Retired players don't have real weekly injury data to pull, so their designation is randomly rolled fresh each simulated week -- but deterministically, so a given player's status for a given week stays the same if you look again. Out and IR zero that player's points for the week; Questionable/Doubtful are just a risk flag with no scoring effect. Coaches and defenses are exempt.",
  },
  {
    q: "What are the little blank circles next to player names?",
    a: "Headshot placeholders. No photos are wired in yet, so every player currently shows a generic silhouette -- this is intentional, not a bug. Whenever a matching image is added later, it'll appear there automatically with no code changes.",
  },
  {
    q: "What do 0/0.5/1 PPR and TE Premium mean?",
    a: "PPR sets how many points a reception is worth (0 = standard, 0.5 = half-PPR, 1 = full PPR). TE Premium adds bonus points per reception specifically for tight ends, on top of the base PPR value -- a common way leagues make the TE position more valuable.",
  },
  {
    q: "What's Superflex?",
    a: "Superflex adds an extra starting slot that -- unlike a normal FLEX (RB/WR/TE) -- also allows a QB. It makes quarterbacks much more valuable since you can start two.",
  },
  {
    q: "How does the season simulation work?",
    a: "Each starter's career-best season's fantasy points per game is the baseline, then two things adjust it week to week: a randomized (but deterministic and season-average-preserving) variance, so weeks actually differ instead of repeating a flat number, and an injury zero-out if that player is Out/IR that week. This is a simulated model, not real historical week-by-week box scores -- genuine per-week game logs for ~150 players weren't obtainable from here (the stats sites that would have them are unreachable), so this is the honest alternative: scores that vary realistically rather than a flat repeated average. Bench players don't score. All scores round to 1 decimal place.",
  },
  {
    q: "Can a player have more than one preloaded season to choose from?",
    a: "The data model already supports it (every player has a `seasons` list, not just one), and starting a season now formally 'chooses' one per rostered player via a pluggable strategy rather than always silently assuming best -- infrastructure only for now, since the only strategy implemented is still 'best' (identical to what you see pre-draft) and virtually every player only has one season loaded anyway. This is the seam for later: add more seasons to a player's data and/or a new selection strategy, and nothing else needs to change.",
  },
  {
    q: "Where do the yards/TDs/receptions/carries/fumbles in a box score come from?",
    a: "Simulated, like the points themselves: whole-number stats scaled from that player's season averages by the exact same weekly variance used for their points that week, so a big scoring week shows a correspondingly big stat line rather than an independently random one. 'Carries' isn't stored data (only rushing yards/TDs are) so it's estimated at a fixed yards-per-carry rate -- a reasonable stand-in, not a real figure. Real per-week box scores can be added piecemeal, player by player and week by week, in js/data/realBoxScores.js -- infrastructure only for now, since none has been sourced yet, but any entry added there is used automatically over the simulated number.",
  },
  {
    q: "Can I change my lineup as the season goes on?",
    a: "Yes -- the Teams tab is editable at any point, including mid-season, and there's a shortcut to it right on the Season screen. A change only affects weeks you advance to afterward; every week already played keeps the lineup (and scores) it actually used, so past results never shift under you.",
  },
  {
    q: "How do the playoffs work?",
    a: "The last 1-2 of the 16 weeks are playoffs: leagues of 4+ teams play a round-robin regular season through week 14, then a 4-team bracket (top 4 seeds by regular-season record) -- semifinals (1v4, 2v3) in week 15, championship and 3rd-place game in week 16. Leagues of 2-3 teams get a 15-week regular season and a single championship game (top 2 seeds) in week 16. Regular-season standings freeze once the playoffs start -- playoff results don't add to a team's win/loss record. The Season tab always shows a bracket: a Projected one (current standings, re-sorted every week) before the regular season ends, then the actual seeded bracket after, with real scores filled in as playoff games are played, culminating in a champion banner.",
  },
  {
    q: "How are weekly matchups and standings decided?",
    a: "Teams play a round-robin regular-season schedule (with a bye if you have an odd number of teams). Higher total score wins the week; standings rank by wins, then losses, then total points. Click any matchup on the Games tab to see exactly what each starter scored that week.",
  },
  {
    q: "What's the difference between the Players, Season, and Games tabs?",
    a: "Season is the league's standings and playoff bracket -- rankings, not games. Games shows one week at a time (use the arrows to move between weeks), every game that week stacked vertically as a compact score line -- tap one to open its full box score full-screen (X or Escape to close); the NFL schedule reference sits below. Players is a full, filterable directory of everyone in the game (search, position, and HOF/HOVG/ACTIVE filters), independent of any draft, marking anyone already DRAFTED once a league exists. This mirrors a typical fantasy platform's separate rankings/schedule/player-pool tabs.",
  },
  {
    q: "How do I see a player's card, and what's on it?",
    a: "Click any player's avatar or name, pretty much anywhere in the app (Draft, Teams, Players, a box score) -- it opens full-screen with their photo placeholder, position/tag/bye/injury badges, which fantasy team (if any) has them rostered, their season stat line, and once a season is underway, a week-by-week table of their actual points and box score. Close with the X or Escape.",
  },
  {
    q: "Can I add or drop players during the season?",
    a: "Yes, once the draft is complete -- the Teams tab has a Drop button next to every rostered player (returns them to the pool) and a Free Agency section below every team's roster (search/filter undrafted players, pick a team, hit Add -- they auto-fill the most specific open slot, same as the draft itself). Add fails with a message if that team has nowhere left to put them; drop someone first.",
  },
  {
    q: "What's the BYE badge on the Draft screen, and the NFL Schedule on the Games screen?",
    a: "Both are the real 2026 NFL schedule now, transcribed from a pro-football-reference.com schedule export the user supplied directly (this environment's own tooling can't reach schedule sites -- every one tried, including pro-football-reference.com itself, is blocked by network egress policy). It covers all 18 real weeks; the fantasy season only plays out over 16, so those are the ones shown and used for BYE badges. A generated round-robin fallback still exists in the code as a seam for a future season before its real schedule is entered, but isn't used this season since every week here is real.",
  },
  {
    q: "Is my league saved?",
    a: "Yes -- everything is saved to your browser's local storage automatically, so refreshing or closing the tab won't lose your draft or season. Reset League on the League Settings screen clears it and starts over.",
  },
  {
    q: "What are the splash screens?",
    a: "The welcome splash (logo + theme song) shows every time you open or refresh the site. A second one -- logo again, no audio -- pops up after every 'Advance Week' to congratulate you and name the week (or playoff round) you just completed. Both close the same way: click the X, or press Escape.",
  },
  {
    q: "What's coming next?",
    a: "This is a v1 prototype. Planned next steps include real multiplayer drafting, opponent/defense-adjusted scoring (e.g. a great pass defense holding a player below their average that week), a real active-player injury feed, and filling in more real NFL schedule weeks as sources become reachable.",
  },
];

function renderFAQ() {
  const items = FAQ_ITEMS.map(
    ({ q, a }) => `
      <details class="panel">
        <summary>${escapeHtml(q)}</summary>
        <p>${escapeHtml(a)}</p>
      </details>`
  ).join("");
  return `
    <h2>FAQ</h2>
    <p class="hint">How the game works, screen by screen.</p>
    ${items}
  `;
}

// --------------------------------------------------------------- root

function render() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === state.screen);
  });

  const app = document.getElementById("app");
  if (state.screen === "setup") app.innerHTML = renderSetup();
  else if (state.screen === "draft") app.innerHTML = renderDraft();
  else if (state.screen === "teams") app.innerHTML = renderTeams();
  else if (state.screen === "players") app.innerHTML = renderPlayers();
  else if (state.screen === "season") app.innerHTML = renderSeason();
  else if (state.screen === "games") app.innerHTML = renderGames();
  else if (state.screen === "faq") app.innerHTML = renderFAQ();
}

function wireEvents() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => setScreen(btn.dataset.screen));
  });

  const app = document.getElementById("app");

  app.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    // "show-player" opens the player card from anywhere -- Draft,
    // Teams, Players, Games box scores -- so it's handled once here
    // rather than duplicated into every per-screen handler below.
    if (action === "show-player") {
      showPlayerCard(target.dataset.player);
      return;
    }
    if (state.screen === "setup") handleSetupClick(action, target);
    else if (state.screen === "draft") handleDraftClick(action, target);
    else if (state.screen === "teams") handleTeamsClick(action, target);
    else if (state.screen === "season") handleSeasonClick(action);
    else if (state.screen === "games") handleGamesClick(action, target);
  });

  // Keyboard activation (Enter/Space) for the avatar's role="button"
  // span, which isn't a real <button> so doesn't get this for free.
  app.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset?.action === "show-player") {
      e.preventDefault();
      showPlayerCard(e.target.dataset.player);
    }
  });

  app.addEventListener("input", (e) => {
    if (state.screen === "setup" && e.target.classList.contains("team-name-input")) {
      const idx = Number(e.target.dataset.idx);
      state.setupTeamNames[idx] = e.target.value;
      persist();
    } else if (state.screen === "draft" && e.target.id === "draft-search") {
      state.draftFilter.query = e.target.value;
      rerenderPreservingFocus();
    } else if (state.screen === "players" && e.target.id === "players-search") {
      state.playersFilter.query = e.target.value;
      rerenderPreservingFocus();
    } else if (state.screen === "teams" && e.target.id === "fa-search") {
      state.freeAgentFilter.query = e.target.value;
      rerenderPreservingFocus();
    }
  });

  app.addEventListener("change", (e) => {
    if (state.screen === "setup") {
      handleSetupChange(e.target);
    } else if (state.screen === "draft" && e.target.id === "draft-position-filter") {
      state.draftFilter.position = e.target.value;
      render();
    } else if (state.screen === "draft" && e.target.id === "draft-tag-filter") {
      state.draftFilter.tagFilter = e.target.value;
      render();
    } else if (state.screen === "players" && e.target.id === "players-position-filter") {
      state.playersFilter.position = e.target.value;
      render();
    } else if (state.screen === "players" && e.target.id === "players-tag-filter") {
      state.playersFilter.tagFilter = e.target.value;
      render();
    } else if (state.screen === "teams" && e.target.id === "fa-position-filter") {
      state.freeAgentFilter.position = e.target.value;
      render();
    } else if (state.screen === "teams") {
      handleTeamsChange(e.target);
    }
  });
}

// Splash screens: the welcome splash (shown on every page load/refresh)
// and the post-week congratulations splash (shown after each "Advance
// Week"). Both are dismissed by their own X button, or by Escape --
// never a timeout or backdrop click, so neither is ever mistaken for a
// loading state.

function closeWelcomeSplash() {
  const overlay = document.getElementById("splash-overlay");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  const audio = document.getElementById("splash-audio");
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function closeWeekSplash() {
  const overlay = document.getElementById("week-splash-overlay");
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
}

// Escape closes whichever overlay is currently showing -- the two
// splash screens, or either fullscreen view (player card, single
// game). In practice at most one is ever open at a time -- each
// overlay covers the full viewport, so it blocks interaction with
// whatever might open another one while it's up.
function closeOpenSplash() {
  closeWelcomeSplash();
  closeWeekSplash();
  closePlayerCard();
  closeGameFullscreen();
}

// Plays the theme song on open, looped, stopped when closed. Most
// browsers block audible autoplay until the page has had a user
// gesture; if that happens, play() rejects and we just stay silent
// rather than throw.
function initSplash() {
  const overlay = document.getElementById("splash-overlay");
  if (!overlay) return;
  overlay.hidden = false;

  const audio = document.getElementById("splash-audio");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  document.getElementById("splash-close").addEventListener("click", closeWelcomeSplash);
  document.getElementById("week-splash-close").addEventListener("click", closeWeekSplash);
  document.getElementById("player-card-close").addEventListener("click", closePlayerCard);
  document.getElementById("game-fullscreen-close").addEventListener("click", closeGameFullscreen);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOpenSplash();
  });
}

// Shown after each "Advance Week" -- congratulates the player, shows
// the logo again, and names the week (and playoff round, if any) that
// was just completed.
function showWeekCompleteSplash(weekResult) {
  const overlay = document.getElementById("week-splash-overlay");
  const text = document.getElementById("week-splash-text");
  if (!overlay || !text) return;
  const label =
    weekResult.round === "playoff" ? `Playoffs: ${weekResult.roundLabel} (Week ${weekResult.week})` : `Week ${weekResult.week}`;
  text.textContent = `Congratulations! ${label} complete.`;
  overlay.hidden = false;
}

function init() {
  restore();
  wireEvents();
  render();
  initSplash();
  if (state.screen === "draft" && state.draft && state.draft.status !== "complete") {
    resetDraftTimer();
    startDraftTimer();
  }
}

init();
