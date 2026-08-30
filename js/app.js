import { DEFAULT_SCORING_RULES } from "./scoring.js";
import { searchPlayers, getPlayerById, getBestSeason, formatSeasonLine } from "./players.js";
import {
  createDraft,
  draftPlayer,
  undoLastPick,
  getCurrentTeam,
  teamHasOpenSlotFor,
  setSlotPlayer,
  shuffle,
  DEFAULT_ROSTER_SLOTS,
} from "./draftEngine.js";
import {
  createSeason,
  advanceWeek,
  isSeasonComplete,
  getStandingsList,
  SEASON_WEEKS,
} from "./season.js";
import { saveState, loadState, clearState } from "./storage.js";

const rules = DEFAULT_SCORING_RULES;

const state = {
  screen: "setup",
  setupTeamNames: ["Team 1", "Team 2"],
  draft: null,
  season: null,
  draftFilter: { query: "", position: "ALL" },
};

function persist() {
  saveState({
    setupTeamNames: state.setupTeamNames,
    draft: state.draft,
    season: state.season,
  });
}

function restore() {
  const saved = loadState();
  if (saved) {
    state.setupTeamNames = saved.setupTeamNames || state.setupTeamNames;
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

// ---------------------------------------------------------------- nav

function setScreen(screen) {
  state.screen = screen;
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

  return `
    <h2>Set Up Your League</h2>
    <p class="hint">Add each team, then start the draft. Roster: ${DEFAULT_ROSTER_SLOTS.join(", ")}.</p>
    <div id="team-inputs">${rows}</div>
    <button class="btn" data-action="add-team" ${state.setupTeamNames.length >= 12 ? "disabled" : ""}>+ Add Team</button>
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

function startDraft() {
  const names = state.setupTeamNames.map((n) => n.trim()).filter(Boolean);
  if (names.length < 2) {
    alert("Add at least 2 teams to start a draft.");
    return;
  }
  const teamIds = names.map((_, i) => `team-${i + 1}`);
  const order = shuffle(teamIds);
  state.draft = createDraft(names, DEFAULT_ROSTER_SLOTS, order);
  state.season = null;
  state.screen = "draft";
  persist();
  render();
}

// -------------------------------------------------------------- draft

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
  const results = searchPlayers(state.draftFilter, rules)
    .filter(({ player }) => !draft.draftedPlayerIds.includes(player.id))
    .sort((a, b) => b.best.summary.totalPoints - a.best.summary.totalPoints);

  const rows = results
    .map(({ player, best }) => {
      const eligible = teamHasOpenSlotFor(currentTeam, player.position);
      return `
        <div class="player-card">
          <div class="player-main">
            <span class="pos-badge pos-${player.position}">${player.position}</span>
            <span class="player-name">${escapeHtml(player.name)}</span>
          </div>
          <div class="player-season">${escapeHtml(formatSeasonLine(player, best))}</div>
          <div class="player-points">${best.summary.totalPoints} pts season &middot; ${best.summary.pointsPerGame} pts/gm</div>
          <button class="btn btn-primary btn-small" data-action="draft-player" data-player="${player.id}" ${eligible ? "" : "disabled"}>
            ${eligible ? "Draft" : "No open slot"}
          </button>
        </div>`;
    })
    .join("") || `<p class="hint">No players match your search.</p>`;

  return `
    <h2>Draft &mdash; Round ${draft.round} / ${draft.totalRounds}, Pick ${draft.overallPick}</h2>
    <p class="on-the-clock">On the clock: <strong>${escapeHtml(currentTeam.name)}</strong></p>

    <div class="draft-filters">
      <input type="text" id="draft-search" placeholder="Search players..." value="${escapeHtml(state.draftFilter.query)}" />
      <select id="draft-position-filter">
        ${["ALL", "QB", "RB", "WR", "TE"]
          .map((p) => `<option value="${p}" ${state.draftFilter.position === p ? "selected" : ""}>${p}</option>`)
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
      render();
    } catch (err) {
      alert(err.message);
    }
  } else if (action === "undo-pick") {
    undoLastPick(draft);
    state.season = null;
    persist();
    render();
  } else if (action === "goto-teams") {
    setScreen("teams");
  } else if (action === "goto-season") {
    if (!state.season) state.season = createSeason(draft, SEASON_WEEKS);
    persist();
    setScreen("season");
  }
}

// -------------------------------------------------------------- teams

const SLOT_ELIGIBILITY = {
  QB: ["QB"],
  RB: ["RB"],
  WR: ["WR"],
  TE: ["TE"],
  FLEX: ["RB", "WR", "TE"],
  BENCH: ["QB", "RB", "WR", "TE"],
};

function renderTeams() {
  const draft = state.draft;
  if (!draft) return `<h2>Teams</h2><p class="hint">Set up a league first.</p>`;

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
        <details class="team-panel" open>
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
  `;
}

function handleSeasonClick(action) {
  if (action === "advance-week") {
    advanceWeek(state.season, state.draft, rules);
    persist();
    render();
  }
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
    if (state.screen === "draft" && e.target.id === "draft-position-filter") {
      state.draftFilter.position = e.target.value;
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
}

init();
