/* ============================================================
   LEAGUE ROUNDS SCREEN — Between-match simulation summary
   Shows simulated Valhalla results for rounds played between
   the story's 7 featured VPL matches.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.LeagueRounds = (function () {

  // ── Narrative generation ────────────────────────────────────

  const NARRATIVES = {
    all_wins: [
      "FC Valhalla are in scintillating form — not dropping a single point. The dressing room is buzzing.",
      "An immaculate run. Every game a win. Whatever you're doing, it's working.",
      "Unstoppable. Valhalla sweep through the fixtures without losing a step.",
    ],
    mostly_wins: [
      "A strong spell of form. Valhalla pick up the points they need and stay in the hunt.",
      "More wins than losses — solid, steady progress. The squad is growing into the season.",
      "Good form, with a slip here and there. The core of the team is performing.",
    ],
    balanced: [
      "A frustrating stretch. Too many draws and defeats mixed with the wins. Something has to click.",
      "Neither dominant nor dismal — Valhalla tread water. The league waits for no one.",
      "Mixed results. The squad shows fight but also frailty. Fine margins separate the table.",
    ],
    mostly_losses: [
      "A poor run. More defeats than wins — the pressure is mounting and the board is watching closely.",
      "Difficult times. The squad is struggling, and results don't lie. A response is needed.",
      "Too many defeats. Confidence is fragile. Something has to change before it gets worse.",
    ],
    all_losses: [
      "A catastrophic run — not a single win. The fans are restless and the dressing room is fractured.",
      "Dire. No wins whatsoever. Whatever went wrong, it needs fixing immediately.",
      "A crisis. These results can't continue. The squad needs a spark — and fast.",
    ],
    all_draws: [
      "Draw after draw. Valhalla can't find a way to win — too many points left on the pitch.",
      "Frustrating. The squad keeps creating but can't convert. A run of draws pleases no one.",
    ],
  };

  function pickNarrative(wins, draws, losses) {
    const total = wins + draws + losses;
    if (total === 0) return '';

    let pool;
    if (losses === 0 && draws === 0) {
      pool = NARRATIVES.all_wins;
    } else if (wins === 0 && losses === 0) {
      pool = NARRATIVES.all_draws;
    } else if (wins === 0 && draws === 0) {
      pool = NARRATIVES.all_losses;
    } else if (wins >= total * 0.6) {
      pool = NARRATIVES.mostly_wins;
    } else if (losses >= total * 0.6) {
      pool = NARRATIVES.mostly_losses;
    } else {
      pool = NARRATIVES.balanced;
    }

    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Render ───────────────────────────────────────────────────

  function show(results, onDone) {
    if (!results || results.length === 0) { onDone(); return; }

    const wins   = results.filter(r => r.outcome === 'win').length;
    const draws  = results.filter(r => r.outcome === 'draw').length;
    const losses = results.filter(r => r.outcome === 'loss').length;
    const narrative = pickNarrative(wins, draws, losses);

    const firstRound = results[0].round;
    const lastRound  = results[results.length - 1].round;
    const roundLabel = results.length === 1
      ? `Round ${firstRound}`
      : `Rounds ${firstRound}–${lastRound}`;

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-league-rounds screen-enter';

    // Tap hint
    const hint = document.createElement('div');
    hint.className = 'scene-tap-hint';
    hint.textContent = 'tap anywhere to continue';
    screen.appendChild(hint);

    // Header
    const header = document.createElement('div');
    header.className = 'lr-header';

    const compBadge = document.createElement('div');
    compBadge.className = 'lr-comp-badge';
    compBadge.textContent = 'Valorian Premier League';
    header.appendChild(compBadge);

    const roundEl = document.createElement('div');
    roundEl.className = 'lr-round-label';
    roundEl.textContent = roundLabel;
    header.appendChild(roundEl);

    screen.appendChild(header);

    // Results list (scrollable)
    const resultsList = document.createElement('div');
    resultsList.className = 'lr-results';

    results.forEach(r => {
      const row = document.createElement('div');
      row.className = `lr-result-row ${r.outcome}`;

      const badge = document.createElement('div');
      badge.className = `lr-result-badge ${r.outcome}`;
      badge.textContent = r.outcome === 'win' ? 'W' : r.outcome === 'draw' ? 'D' : 'L';

      const info = document.createElement('div');
      info.className = 'lr-result-info';

      const opp = document.createElement('div');
      opp.className = 'lr-result-opp';
      opp.textContent = (r.homeAway === 'home' ? 'vs ' : '@ ') + r.opponent;
      info.appendChild(opp);

      // Show as home score – away score (Valhalla perspective)
      const scoreEl = document.createElement('div');
      scoreEl.className = 'lr-result-score';
      scoreEl.textContent = r.homeAway === 'home'
        ? `${r.valGoals}–${r.oppGoals}`
        : `${r.oppGoals}–${r.valGoals}`;

      row.appendChild(badge);
      row.appendChild(info);
      row.appendChild(scoreEl);
      resultsList.appendChild(row);
    });

    screen.appendChild(resultsList);

    // Summary + narrative
    const summary = document.createElement('div');
    summary.className = 'lr-summary';

    const record = document.createElement('div');
    record.className = 'lr-record';
    record.innerHTML =
      `<span class="lr-rec-w">${wins}W</span> ` +
      `<span class="lr-rec-d">${draws}D</span> ` +
      `<span class="lr-rec-l">${losses}L</span>`;
    summary.appendChild(record);

    if (narrative) {
      const narr = document.createElement('p');
      narr.className = 'lr-narrative';
      narr.textContent = narrative;
      summary.appendChild(narr);
    }

    screen.appendChild(summary);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'lr-footer';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Next Match';
    btn.addEventListener('click', onDone);
    btn.addEventListener('touchend', e => { e.preventDefault(); onDone(); }, { passive: false });
    footer.appendChild(btn);
    screen.appendChild(footer);

    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);

    // Also allow tap-anywhere to dismiss
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      // Only dismiss if they tapped the screen background, not the button
      dismissed = true;
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); onDone(); }, 300);
    }
    screen.addEventListener('click', e => {
      if (e.target === screen || e.target === hint || e.target === resultsList) dismiss();
    });
  }

  return { show };

})();
