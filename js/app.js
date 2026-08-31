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
  getStandingsList,
  SEASON_WEEKS,
} from "./season.js";
import { saveState, loadState, clearState } from "./storage.js";
import { getByeWeek, NFL_TEAMS } from "./data/nflTeams.js";
import { getNflSchedule } from "./nflSchedule.js";

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

// Time expired on someone's pick: auto-draft the highest-scoring
// eligible player available, same as a real draft clock would.
function autoDraftForCurrentTeam() {
  const draft = state.draft;
  if (!draft || draft.status === "complete") {
    stopDraftTimer();
    return;
  }
  const team = getCurrentTeam(draft);
  const candidates = searchPlayers({ query: "", position: "ALL" }, getRules())
    .filter(({ player }) => !draft.draftedPlayerIds.includes(player.id))
    .filter(({ player }) => canDraftPlayer(draft, team, player))
    .sort((a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame);

  if (!candidates.length) {
    // Player pool exhausted before rosters filled -- nothing left to
    // auto-draft. Stop the clock rather than loop forever.
    stopDraftTimer();
    return;
  }

  draftPlayer(draft, candidates[0].player.id);
  if (draft.status === "complete" && !state.season) {
    state.season = createSeason(draft, SEASON_WEEKS);
  }
  persist();
  if (draft.status === "complete") stopDraftTimer();
  else resetDraftTimer();
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
      <label class="checkbox-row">
        <input type="checkbox" id="format-superflex" ${settings.superflex ? "checked" : ""} />
        Superflex (extra slot also allows QB)
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
    state.leagueSettings.superflex = target.checked;
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
  const { cls, title } = TAG_BADGE[player.tag];
  return `<span class="tag-badge ${cls}" title="${title}">${player.tag}</span>`;
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
  const requiredLabel = requiredGroup === "RETIRED" ? "a RETIRED player (HOF or HOVG)" : "an ACTIVE player";
  const results = searchPlayers(state.draftFilter, rules)
    .filter(({ player }) => !draft.draftedPlayerIds.includes(player.id))
    .sort((a, b) => b.best.summary.pointsPerGame - a.best.summary.pointsPerGame);

  const rows = results
    .map(({ player, best }) => {
      const groupOk = playerMatchesGroup(player, requiredGroup);
      const slotOk = teamHasOpenSlotFor(currentTeam, player.position);
      const eligible = groupOk && slotOk;
      let buttonLabel = "Draft";
      if (!groupOk) buttonLabel = requiredGroup === "RETIRED" ? "Must Be Retired" : "Must Be Active";
      else if (!slotOk) buttonLabel = "No Open Slot";
      return `
        <div class="player-card">
          <div class="player-main">
            <span class="pos-badge pos-${player.position}">${player.position}</span>
            <span class="player-name">${escapeHtml(player.name)}</span>
            ${tagBadge(player)}
            ${byeBadge(best.season.team)}
          </div>
          <div class="player-season">${escapeHtml(formatSeasonLine(player, best))}</div>
          <div class="player-points">${best.summary.totalPoints} pts season &middot; ${best.summary.pointsPerGame} pts/gm</div>
          <button class="btn btn-primary btn-small" data-action="draft-player" data-player="${player.id}" ${eligible ? "" : "disabled"}>
            ${buttonLabel}
          </button>
        </div>`;
    })
    .join("") || `<p class="hint">No players match your search.</p>`;

  return `
    <h2>Draft &mdash; Round ${draft.round} / ${draft.totalRounds}, Pick ${draft.overallPick}</h2>
    <p class="on-the-clock">
      On the clock: <strong>${escapeHtml(currentTeam.name)}</strong>
      <span id="draft-timer" class="draft-timer ${draftTimerClass()}">${draftTimerSeconds}s</span>
    </p>
    <p class="hint">This pick must be ${requiredLabel} -- each team's own picks alternate retired/active, starting with retired. Auto-picks the best available eligible player if the clock runs out.</p>

    <div class="draft-filters">
      <input type="text" id="draft-search" placeholder="Search players..." value="${escapeHtml(state.draftFilter.query)}" />
      <select id="draft-position-filter">
        ${["ALL", "QB", "RB", "WR", "TE"]
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
              <td>
                <select data-action="set-slot" data-team="${teamIdx}" data-slot="${slotIdx}">${optionHtml}</select>
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
      return `<details class="panel week-panel"><summary>Week ${idx + 1}</summary><div class="nfl-week-games">${rows}</div></details>`;
    })
    .join("");
  return `
    <h3>NFL Schedule</h3>
    <p class="hint">Generated matchups (who's facing who, and who's home) for gameplay flavor -- see the FAQ.</p>
    <div class="nfl-schedule">${weekBlocks}</div>
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
      const matchups = wk.matchups
        .map((m) => {
          const [aId, bId] = m.teamIds;
          const aName = draft.teams.find((t) => t.id === aId).name;
          const bName = draft.teams.find((t) => t.id === bId).name;
          const aScore = m.scores[aId].total;
          const bScore = m.scores[bId].total;
          const aWin = m.winnerId === aId ? " win" : "";
          const bWin = m.winnerId === bId ? " win" : "";
          return `<div class="matchup">
            <span class="${aWin}">${escapeHtml(aName)} ${aScore.toFixed(2)}</span>
            <span class="vs">vs</span>
            <span class="${bWin}">${escapeHtml(bName)} ${bScore.toFixed(2)}</span>
          </div>`;
        })
        .join("");
      const byes = wk.byeTeamIds.length
        ? `<div class="bye-note">Bye: ${wk.byeTeamIds
            .map((id) => escapeHtml(draft.teams.find((t) => t.id === id).name))
            .join(", ")}</div>`
        : "";
      return `<div class="week-block"><h4>Week ${wk.week}</h4>${matchups}${byes}</div>`;
    })
    .join("") || `<p class="hint">No weeks played yet.</p>`;

  return `
    <h2>Season</h2>
    <p class="hint">${complete ? "Season complete!" : `Week ${season.currentWeek + 1} of ${season.weeks}`}</p>
    <button class="btn btn-primary" data-action="advance-week" ${complete ? "disabled" : ""}>
      ${complete ? "Season Finished" : "Advance Week"}
    </button>

    <h3>Standings</h3>
    <table class="roster-table standings-table">
      <thead><tr><th>#</th><th>Team</th><th>W-L-T</th><th>PF</th><th>PA</th></tr></thead>
      <tbody>${standings}</tbody>
    </table>

    <h3>Weekly Results</h3>
    <div class="week-history">${history}</div>

    ${renderNflSchedule(season.weeks)}
  `;
}

function handleSeasonClick(action) {
  if (action === "advance-week") {
    advanceWeek(state.season, state.draft, getRules());
    persist();
    render();
  }
}

// ---------------------------------------------------------------- faq

const FAQ_ITEMS = [
  {
    q: "How does the draft work?",
    a: "It's a local, hot-seat snake draft: pick order reverses each round. Each team's own picks also alternate between retired and active players, starting with retired on their 1st pick, active on their 2nd, retired on their 3rd, and so on -- independently per team, not by overall pick order. On your turn, search or filter the player pool and hit Draft. Each player auto-fills the most specific open roster slot (their position, then FLEX/SUPERFLEX, then BENCH).",
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
    a: "Every player carries one tag: HOF (enshrined in Canton), HOVG (retired, statistically great, not yet enshrined -- the 'Hall of Very Good'), or ACTIVE (currently playing). HOF and HOVG together count as 'retired' for the draft's alternating rule. Filter to any one tag with the dropdown next to the position filter. Active players' rough draft order (and their projected points) approximates this year's fantasy ADP, assembled from multiple outlets and formulaically projected -- not a live feed, so expect some drift from any single site.",
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
    a: "Each starter scores their career-best season's fantasy points per game, every week. For a real shortened season (a strike year, a wartime schedule, etc.), that per-game rate is simply repeated across all 16 simulated weeks rather than the season ending early. Bench players don't score.",
  },
  {
    q: "How are weekly matchups and standings decided?",
    a: "Teams play a round-robin schedule (with a bye if you have an odd number of teams) across 16 weeks. Higher total score wins the week; standings rank by wins, then losses, then total points.",
  },
  {
    q: "What's the BYE badge on the Draft screen, and the NFL Schedule on the Season screen?",
    a: "Both are generated for gameplay flavor, not pulled from a real published NFL calendar: the BYE badge shows an illustrative bye week for the player's team, and the Season screen's NFL Schedule shows generated weekly matchups (who's facing who, and who's home) for all 32 teams. They're a foundation for future features like matchup-adjusted scoring.",
  },
  {
    q: "Is my league saved?",
    a: "Yes -- everything is saved to your browser's local storage automatically, so refreshing or closing the tab won't lose your draft or season. Reset League on the Setup screen clears it and starts over.",
  },
  {
    q: "What's coming next?",
    a: "This is a v1 prototype. Planned next steps include real multiplayer drafting, random weekly score variance, and opponent/defense-adjusted scoring (e.g. a great pass defense holding a player below their average that week).",
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

function init() {
  restore();
  wireEvents();
  render();
  if (state.screen === "draft" && state.draft && state.draft.status !== "complete") {
    resetDraftTimer();
    startDraftTimer();
  }
}

init();
