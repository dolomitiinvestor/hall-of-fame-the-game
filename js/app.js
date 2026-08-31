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

const NFL_TEAM_NAMES = Object.fromEntries(NFL_TEAMS.map((t) => [t.code, t.name]));

const DRAFT_TIMER_SECONDS = 60;

const state = {
  screen: "setup",
  setupTeamNames: ["Team 1", "Team 2"],
  leagueSettings: { pprValue: 0.5, tePremium: 0, superflex: false },
  draft: null,
  season: null,
  draftFilter: { query: "", position: "ALL", tagFilter: "ALL" },
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
    state.leagueSettings = saved.leagueSettings || state.leagueSettings;
    state.draft = saved.draft || null;
    state.season = saved.season || null;
    if (state.draft && state.draft.status === "complete") {
      state.screen = state.season ? "season" : "teams";
    } else if (state.draft) {
      state.screen = "draft";
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

// Highest-scoring player currently eligible for whoever's on the
// clock -- shared by the draft-clock auto-pick and the "Complete
// Draft" testing shortcut below, so both pick the same way.
function bestCandidateIdFor(draft, team) {
  const candidates = searchPlayers({ query: "", position: "ALL" }, getRules())
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
    state.season = createSeason(draft, SEASON_WEEKS);
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
    state.season = createSeason(draft, SEASON_WEEKS);
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

  return `
    <h2>Set Up Your League</h2>
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
  state.draft = createDraft(names, rosterSlots, order);
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
// just the generic silhouette underneath.
function playerAvatar(player) {
  return `
    <span class="player-avatar" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.8-3.6-5-8-5Z"/></svg>
      <img src="img/headshots/${player.id}.jpg" alt="" loading="lazy" onerror="this.remove()" />
    </span>`;
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
            <span class="player-name">${escapeHtml(player.name)}</span>
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
        state.season = createSeason(draft, SEASON_WEEKS);
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
    if (!state.season) state.season = createSeason(draft, SEASON_WEEKS);
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

          return `
            <tr>
              <td class="slot-label">${slot.slot}</td>
              <td class="player-cell">
                ${currentPlayer ? playerAvatar(currentPlayer) : ""}
                <select data-action="set-slot" data-team="${teamIdx}" data-slot="${slotIdx}">${optionHtml}</select>
                ${currentPlayer ? injuryBadge(currentPlayer) : ""}
              </td>
              <td class="season-line">${seasonLine}</td>
            </tr>`;
        })
        .join("");

      return `
        <details class="panel" open>
          <summary>${escapeHtml(team.name)}</summary>
          <table class="roster-table">
            <thead><tr><th>Slot</th><th>Player</th><th>Best Season</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </details>`;
    })
    .join("");

  return `
    <h2>Teams &amp; Lineups</h2>
    <p class="hint">Only non-BENCH slots score points each week. Move players between slots below.</p>
    ${teams}
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

// ------------------------------------------------------------- season

// Per-starter box score for one team's side of a matchup, plus the
// coach bonus line if one applied. Both come straight off the stored
// score object (computeTeamWeekScore() at the time that week was
// simulated), not recomputed live, so this stays an accurate
// historical record even after a lineup is edited later.
function renderPlayerBreakdown(score) {
  const { breakdown, coachBonus } = score;
  if (!breakdown.length) return `<p class="hint">No starters were set that week.</p>`;
  const rows = breakdown
    .map((b) => {
      const player = getPlayerById(b.playerId);
      const badge = INJURY_STATUSES[b.injury]?.code
        ? `<span class="injury-badge ${INJURY_BADGE_CLASS[b.injury]}" title="${escapeHtml(INJURY_STATUSES[b.injury].label)}">${INJURY_STATUSES[b.injury].code}</span>`
        : "";
      return `
      <tr>
        <td><span class="pos-badge pos-${b.position}">${b.position}</span></td>
        <td>${player ? playerAvatar(player) : ""}${escapeHtml(b.name)} ${badge}</td>
        <td>${b.points.toFixed(2)}</td>
      </tr>`;
    })
    .join("");
  const bonusRow = coachBonus
    ? `<p class="hint coach-bonus-note">+ ${escapeHtml(coachBonus.coachName)} coach bonus: ${coachBonus.amount >= 0 ? "+" : ""}${coachBonus.amount.toFixed(2)} (${(coachBonus.rate * 100).toFixed(0)}%)</p>`
    : "";
  return `
    <table class="roster-table matchup-table">
      <thead><tr><th>Pos</th><th>Player</th><th>Pts</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${bonusRow}`;
}

function renderMatchupBox(m, draft, label) {
  const [aId, bId] = m.teamIds;
  const aTeam = draft.teams.find((t) => t.id === aId);
  const bTeam = draft.teams.find((t) => t.id === bId);
  const aScore = m.scores[aId];
  const bScore = m.scores[bId];
  const aWin = m.winnerId === aId ? " win" : "";
  const bWin = m.winnerId === bId ? " win" : "";
  const labelTag = label ? `<span class="tag-badge hovg-tag">${escapeHtml(label)}</span>` : "";
  return `
    <details class="panel matchup-panel">
      <summary>
        ${labelTag}
        <span class="${aWin}">${escapeHtml(aTeam.name)} ${aScore.total.toFixed(2)}</span>
        <span class="vs">vs</span>
        <span class="${bWin}">${escapeHtml(bTeam.name)} ${bScore.total.toFixed(2)}</span>
      </summary>
      <div class="matchup-detail">
        <div class="matchup-team">
          <h5>${escapeHtml(aTeam.name)}</h5>
          ${renderPlayerBreakdown(aScore)}
        </div>
        <div class="matchup-team">
          <h5>${escapeHtml(bTeam.name)}</h5>
          ${renderPlayerBreakdown(bScore)}
        </div>
      </div>
    </details>`;
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
    <p class="hint">Week 1 is the real announced 2026 schedule; every other week is generated for gameplay flavor pending more real data -- see the FAQ.</p>
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

function renderPlayoffsSection(season, draft) {
  if (!isRegularSeasonComplete(season)) return "";
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
  return `
    <h3>Playoffs</h3>
    ${champion}
    <div class="panel">
      <p class="hint">${bracketSize >= 4 ? "Top 4 seeds: semifinals (1v4, 2v3), then championship + 3rd place." : "Top 2 seeds play a single championship game."}</p>
      <ol class="playoff-seeds">${seedRows}</ol>
    </div>
  `;
}

function renderSeason() {
  const draft = state.draft;
  if (!draft || draft.status !== "complete") {
    return `<h2>Season</h2><p class="hint">Finish the draft first.</p>`;
  }
  if (!state.season) {
    state.season = createSeason(draft, SEASON_WEEKS);
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
        <td>${s.pointsFor.toFixed(2)}</td>
        <td>${s.pointsAgainst.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const history = [...season.weeklyResults]
    .reverse()
    .map((wk) => {
      const isPlayoff = wk.round === "playoff";
      const labels =
        isPlayoff && wk.matchups.length === 2 && wk.roundLabel === "Championship"
          ? ["Championship", "3rd Place"]
          : wk.matchups.map(() => wk.roundLabel);
      const matchups = wk.matchups.map((m, i) => renderMatchupBox(m, draft, isPlayoff ? labels[i] : null)).join("");
      const byeLabel = isPlayoff ? "Missed playoffs" : "Bye";
      const byes = wk.byeTeamIds.length
        ? `<div class="bye-note">${byeLabel}: ${wk.byeTeamIds
            .map((id) => escapeHtml(draft.teams.find((t) => t.id === id).name))
            .join(", ")}</div>`
        : "";
      const weekHeading = isPlayoff ? `Week ${wk.week} &mdash; Playoffs: ${escapeHtml(wk.roundLabel)}` : `Week ${wk.week}`;
      return `<div class="week-block"><h4>${weekHeading}</h4>${matchups}${byes}</div>`;
    })
    .join("") || `<p class="hint">No weeks played yet.</p>`;

  return `
    <h2>Season</h2>
    <p class="hint">${currentWeekLabel(season)}</p>
    <button class="btn btn-primary" data-action="advance-week" ${complete ? "disabled" : ""}>
      ${complete ? "Season Finished" : "Advance Week"}
    </button>
    <p class="hint">Set lineups any time from the <button class="link-btn" data-action="goto-teams-from-season">Teams tab</button> -- changes apply starting with the next week you advance; past weeks keep their own recorded lineup.</p>

    <h3>Standings${isRegularSeasonComplete(season) ? " (Regular Season)" : ""}</h3>
    <table class="roster-table standings-table">
      <thead><tr><th>#</th><th>Team</th><th>W-L-T</th><th>PF</th><th>PA</th></tr></thead>
      <tbody>${standings}</tbody>
    </table>

    ${renderPlayoffsSection(season, draft)}

    <h3>Weekly Results</h3>
    <p class="hint">Click a matchup to see each starter's actual points that week.</p>
    <div class="week-history">${history}</div>

    ${renderNflSchedule(season.weeks)}
  `;
}

function handleSeasonClick(action) {
  if (action === "advance-week") {
    advanceWeek(state.season, state.draft, getRules());
    persist();
    render();
  } else if (action === "goto-teams-from-season") {
    setScreen("teams");
  }
}

// ---------------------------------------------------------------- faq

const FAQ_ITEMS = [
  {
    q: "How does the draft work?",
    a: "It's a local, hot-seat snake draft: pick order reverses each round. Each team's own QB/RB/WR/TE picks also alternate between retired and active, starting with retired on their 1st skill pick, active on their 2nd, retired on their 3rd, and so on -- independently per team, not by overall pick order. Whichever group isn't currently eligible is hidden from the list entirely rather than shown disabled -- and so is anyone your team has nowhere left to roster (every slot that could hold their position, including BENCH, already full). Coach, K, and DEF picks aren't part of the retired/active alternation and are always shown, subject to that same roster-room check. On your turn, search or filter the player pool and hit Draft. Each player auto-fills the most specific open roster slot (their exact position, then FLEX/SUPERFLEX, then BENCH).",
  },
  {
    q: "What does the season line next to a player mean?",
    a: "Every retired player's career-best season is calculated live from your league's current scoring settings (PPR, TE Premium) -- not hard-coded -- so it always reflects the format you picked in Setup. Active players show a single projected season the same way (marked 'proj.'). That's the season you're drafting them at.",
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
    a: "Every team drafts exactly one Coach (from the top 10 all-time NFL coaches and top 5 all-time college coaches), one Kicker, and one Defense (a single all-time-great team defensive season), alongside the usual offensive skill positions. Kickers score on field goals/extra points made; defenses score on sacks, interceptions, fumble recoveries, defensive TDs, safeties, and a tiered bonus/penalty for points allowed per game -- all real scoring, adjustable in js/scoring.js. A started Coach doesn't score individually, but adds a flat 5% bonus to your team's total for the week (shown under that team's box score) -- benching your Coach removes the bonus. None of the three count toward the retired/active alternation.",
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
    a: "Each starter's career-best season's fantasy points per game is the baseline, then two things adjust it week to week: a randomized (but deterministic and season-average-preserving) variance, so weeks actually differ instead of repeating a flat number, and an injury zero-out if that player is Out/IR that week. This is a simulated model, not real historical week-by-week box scores -- genuine per-week game logs for ~150 players weren't obtainable from here (the stats sites that would have them are unreachable), so this is the honest alternative: scores that vary realistically rather than a flat repeated average. Bench players don't score.",
  },
  {
    q: "Can I change my lineup as the season goes on?",
    a: "Yes -- the Teams tab is editable at any point, including mid-season, and there's a shortcut to it right on the Season screen. A change only affects weeks you advance to afterward; every week already played keeps the lineup (and scores) it actually used, so past results never shift under you.",
  },
  {
    q: "How do the playoffs work?",
    a: "The last 1-2 of the 16 weeks are playoffs: leagues of 4+ teams play a round-robin regular season through week 14, then a 4-team bracket (top 4 seeds by regular-season record) -- semifinals (1v4, 2v3) in week 15, championship and 3rd-place game in week 16. Leagues of 2-3 teams get a 15-week regular season and a single championship game (top 2 seeds) in week 16. Regular-season standings freeze once the playoffs start -- playoff results don't add to a team's win/loss record, they're shown as their own bracket, culminating in a champion banner.",
  },
  {
    q: "How are weekly matchups and standings decided?",
    a: "Teams play a round-robin regular-season schedule (with a bye if you have an odd number of teams). Higher total score wins the week; standings rank by wins, then losses, then total points. Click any matchup in Weekly Results to see exactly what each starter scored that week.",
  },
  {
    q: "What's the BYE badge on the Draft screen, and the NFL Schedule on the Season screen?",
    a: "The BYE badge is generated for gameplay flavor, not a real published bye-week calendar. The Season screen's NFL Schedule is a mix: Week 1 is the real announced 2026 schedule (confirmed complete, all 32 teams, via web search). Weeks 2 onward are algorithmically generated -- getting the rest of the real schedule turned out not to be achievable here: the sites that publish it are unreachable from this environment, and search results only ever return a handful of games per week (roughly a third to half of each week, at best) rather than a complete slate. Both real and generated portions are a foundation for future features like matchup-adjusted scoring.",
  },
  {
    q: "Is my league saved?",
    a: "Yes -- everything is saved to your browser's local storage automatically, so refreshing or closing the tab won't lose your draft or season. Reset League on the Setup screen clears it and starts over.",
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
  else if (state.screen === "season") app.innerHTML = renderSeason();
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
    if (state.screen === "setup") handleSetupClick(action, target);
    else if (state.screen === "draft") handleDraftClick(action, target);
    else if (state.screen === "season") handleSeasonClick(action);
  });

  app.addEventListener("input", (e) => {
    if (state.screen === "setup" && e.target.classList.contains("team-name-input")) {
      const idx = Number(e.target.dataset.idx);
      state.setupTeamNames[idx] = e.target.value;
      persist();
    } else if (state.screen === "draft" && e.target.id === "draft-search") {
      state.draftFilter.query = e.target.value;
      render();
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
    } else if (state.screen === "teams") {
      handleTeamsChange(e.target);
    }
  });
}

// Splash screen: shown on every page load/refresh, dismissed only by
// its close button (never a timeout or backdrop click, so it's never
// mistaken for a loading state). Plays the theme song on open, looped,
// stopped when closed.
function initSplash() {
  const overlay = document.getElementById("splash-overlay");
  if (!overlay) return;
  overlay.hidden = false;

  const audio = document.getElementById("splash-audio");
  if (audio) {
    audio.currentTime = 0;
    // Most browsers block audible autoplay until the page has had a
    // user gesture; if that happens, play() rejects and we just stay
    // silent rather than throw.
    audio.play().catch(() => {});
  }

  document.getElementById("splash-close").addEventListener("click", () => {
    overlay.hidden = true;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  });
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
