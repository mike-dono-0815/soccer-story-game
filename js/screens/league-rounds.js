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

  // Timing constants (ms)
  const PLAY_MS    = 1700;  // "playing…" phase before result is revealed
  const REVEAL_GAP = 500;   // pause after result before next game starts

  function buildResultRow(r) {
    const row = document.createElement('div');
    row.className = `lr-result-row ${r.outcome}`;
    if (r.events) row.classList.add('lr-result-tappable');

    const badge = document.createElement('div');
    badge.className = `lr-result-badge ${r.outcome}`;
    badge.textContent = r.outcome === 'win' ? 'W' : r.outcome === 'draw' ? 'D' : 'L';

    const info = document.createElement('div');
    info.className = 'lr-result-info';

    const opp = document.createElement('div');
    opp.className = 'lr-result-opp';
    const valLabel = r.valPos ? `FC Valhalla (P${r.valPos})` : 'FC Valhalla';
    const oppLabel = r.oppPos ? `${r.opponent} (P${r.oppPos})` : r.opponent;
    opp.textContent = r.homeAway === 'home'
      ? `${valLabel} – ${oppLabel}`
      : `${oppLabel} – ${valLabel}`;
    info.appendChild(opp);

    if (r.events) {
      const tap = document.createElement('div');
      tap.className = 'lr-result-tap-hint';
      tap.textContent = 'Tap for details';
      info.appendChild(tap);
    }

    const scoreEl = document.createElement('div');
    scoreEl.className = 'lr-result-score';
    scoreEl.textContent = r.homeAway === 'home'
      ? `${r.valGoals}–${r.oppGoals}`
      : `${r.oppGoals}–${r.valGoals}`;

    row.appendChild(badge);
    row.appendChild(info);
    row.appendChild(scoreEl);

    return row;
  }

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

    // Tap hint (hidden until all results shown)
    const hint = document.createElement('div');
    hint.className = 'scene-tap-hint lr-hint-hidden';
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
    screen.appendChild(resultsList);

    // Summary + narrative (hidden until all revealed)
    const summary = document.createElement('div');
    summary.className = 'lr-summary lr-hint-hidden';

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

    // Footer (hidden until all revealed)
    const footer = document.createElement('div');
    footer.className = 'lr-footer lr-hint-hidden';
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

    // ── Sequential reveal ──────────────────────────────────────
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); onDone(); }, 300);
    }

    const timers = [];

    function revealAll() {
      // Skip straight to fully-revealed state
      timers.forEach(clearTimeout);
      resultsList.innerHTML = '';
      results.forEach(r => {
        const row = buildResultRow(r);
        row.classList.add('lr-row-enter');
        if (r.events) {
          const onTap = e => { e.stopPropagation(); showMatchDetail(r, screen); };
          row.addEventListener('click', onTap);
          row.addEventListener('touchend', e => { e.preventDefault(); onTap(e); }, { passive: false });
        }
        resultsList.appendChild(row);
      });
      hint.classList.remove('lr-hint-hidden');
      summary.classList.remove('lr-hint-hidden');
      footer.classList.remove('lr-hint-hidden');
    }

    // Sequence: for each game, show a "playing" placeholder, then flip to result
    results.forEach((r, i) => {
      const gameStart = i * (PLAY_MS + REVEAL_GAP);

      // Phase 1: add the "playing" placeholder row
      const t1 = setTimeout(() => {
        const placeholder = document.createElement('div');
        placeholder.className = 'lr-result-row lr-row-playing lr-row-enter';
        placeholder.dataset.idx = i;

        const spinBadge = document.createElement('div');
        spinBadge.className = 'lr-result-badge lr-badge-playing';
        spinBadge.textContent = '⚽';

        const info = document.createElement('div');
        info.className = 'lr-result-info';
        const oppEl = document.createElement('div');
        oppEl.className = 'lr-result-opp';
        const preValLabel = r.preValPos ? `FC Valhalla (P${r.preValPos})` : 'FC Valhalla';
        const preOppLabel = r.preOppPos ? `${r.opponent} (P${r.preOppPos})` : r.opponent;
        oppEl.textContent = `Round ${r.round} · ` + (r.homeAway === 'home'
          ? `${preValLabel} – ${preOppLabel}`
          : `${preOppLabel} – ${preValLabel}`);
        info.appendChild(oppEl);
        const statusEl = document.createElement('div');
        statusEl.className = 'lr-playing-status';
        statusEl.textContent = 'playing\u2026';
        info.appendChild(statusEl);

        const scoreEl = document.createElement('div');
        scoreEl.className = 'lr-result-score lr-score-playing';
        scoreEl.textContent = '–';

        placeholder.appendChild(spinBadge);
        placeholder.appendChild(info);
        placeholder.appendChild(scoreEl);
        resultsList.appendChild(placeholder);
        resultsList.scrollTop = resultsList.scrollHeight;
      }, gameStart);
      timers.push(t1);

      // Phase 2: replace placeholder with the real result row
      const t2 = setTimeout(() => {
        const placeholder = resultsList.querySelector(`[data-idx="${i}"]`);
        if (!placeholder) return;

        const row = buildResultRow(r);
        row.classList.add('lr-row-reveal');
        if (r.events) {
          const onTap = e => { e.stopPropagation(); showMatchDetail(r, screen); };
          row.addEventListener('click', onTap);
          row.addEventListener('touchend', e => { e.preventDefault(); onTap(e); }, { passive: false });
        }
        placeholder.replaceWith(row);
        resultsList.scrollTop = resultsList.scrollHeight;
      }, gameStart + PLAY_MS);
      timers.push(t2);
    });

    // Phase 3: after last result revealed, show summary + footer
    const allDone = results.length * (PLAY_MS + REVEAL_GAP) - REVEAL_GAP + PLAY_MS + 400;
    const t3 = setTimeout(() => {
      hint.classList.remove('lr-hint-hidden');
      summary.classList.remove('lr-hint-hidden');
      footer.classList.remove('lr-hint-hidden');
      // Enable tap-to-dismiss now
      screen.addEventListener('click', e => {
        if (e.target === screen || e.target === hint || e.target === resultsList) dismiss();
      });
    }, allDone);
    timers.push(t3);

    // Tapping during the sequence skips to full reveal
    screen.addEventListener('click', function skipHandler(e) {
      if (hint.classList.contains('lr-hint-hidden')) {
        // Still in sequence — skip to full reveal
        screen.removeEventListener('click', skipHandler);
        revealAll();
        hint.classList.remove('lr-hint-hidden');
        summary.classList.remove('lr-hint-hidden');
        footer.classList.remove('lr-hint-hidden');
        screen.addEventListener('click', e2 => {
          if (e2.target === screen || e2.target === hint || e2.target === resultsList) dismiss();
        });
      }
    });
  }

  function showMatchDetail(r, container) {
    const existing = container.querySelector('.lr-detail-backdrop');
    if (existing) existing.remove();

    const isHome = r.homeAway === 'home';
    const homeTeam = isHome ? 'FC Valhalla' : r.opponent;
    const awayTeam = isHome ? r.opponent    : 'FC Valhalla';
    const homeGoals = isHome ? r.valGoals : r.oppGoals;
    const awayGoals = isHome ? r.oppGoals : r.valGoals;

    const backdrop = document.createElement('div');
    backdrop.className = 'lr-detail-backdrop';

    const modal = document.createElement('div');
    modal.className = 'lr-detail-modal';

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'lr-detail-header';

    const roundBadge = document.createElement('div');
    roundBadge.className = 'lr-detail-round';
    roundBadge.textContent = `Round ${r.round} · VPL`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lr-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', e => { e.stopPropagation(); backdrop.remove(); });
    closeBtn.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); backdrop.remove(); }, { passive: false });

    hdr.appendChild(roundBadge);
    hdr.appendChild(closeBtn);
    modal.appendChild(hdr);

    // Scoreline
    const scoreRow = document.createElement('div');
    scoreRow.className = 'lr-detail-score-row';

    const homeEl = document.createElement('div');
    homeEl.className = 'lr-detail-team' + (isHome ? ' lr-detail-team-us' : '');
    homeEl.textContent = homeTeam;

    const scoreEl = document.createElement('div');
    scoreEl.className = `lr-detail-score ${r.outcome}`;
    scoreEl.textContent = `${homeGoals} – ${awayGoals}`;

    const awayEl = document.createElement('div');
    awayEl.className = 'lr-detail-team' + (!isHome ? ' lr-detail-team-us' : '');
    awayEl.textContent = awayTeam;

    scoreRow.appendChild(homeEl);
    scoreRow.appendChild(scoreEl);
    scoreRow.appendChild(awayEl);
    modal.appendChild(scoreRow);

    // Goal events — all interleaved by minute
    const allEvents = r.events && r.events.length > 0 ? r.events : [];
    const hasGoals  = allEvents.length > 0 || r.valGoals > 0 || r.oppGoals > 0;

    if (hasGoals) {
      const divider = document.createElement('div');
      divider.className = 'lr-detail-divider';
      modal.appendChild(divider);

      const eventsEl = document.createElement('div');
      eventsEl.className = 'lr-detail-events';

      if (allEvents.length === 0) {
        // Goalless draw — show placeholder
        const empty = document.createElement('div');
        empty.className = 'lr-detail-no-goals';
        empty.textContent = 'No goals scored';
        eventsEl.appendChild(empty);
      } else {
        allEvents.forEach(ev => {
          const evRow = document.createElement('div');
          evRow.className = 'lr-detail-event' + (ev.isValhalla ? '' : ' lr-detail-event-opp');

          const minuteEl = document.createElement('span');
          minuteEl.className = 'lr-detail-minute';
          minuteEl.textContent = `${ev.minute}'`;

          const icon = document.createElement('span');
          icon.className = 'lr-detail-icon';
          icon.textContent = '⚽';

          const text = document.createElement('span');
          text.className = 'lr-detail-event-text';

          if (ev.isValhalla) {
            // Sticker icon for key players
            const stickerUrl = ev.scorerId && window.Game.Characters.getStickerUrl(ev.scorerId);
            const stickerImg = stickerUrl
              ? `<img class="player-sticker-icon" src="${stickerUrl}" alt="">`
              : '';
            text.innerHTML = ev.assistName
              ? `${stickerImg}${ev.scorerName} <span class="lr-assist">(${ev.assistName})</span>`
              : `${stickerImg}${ev.scorerName}`;
          } else {
            text.innerHTML = `${ev.scorerName} <span class="lr-opp-tag">${r.opponent}</span>`;
          }

          evRow.appendChild(minuteEl);
          evRow.appendChild(icon);
          evRow.appendChild(text);
          eventsEl.appendChild(evRow);
        });
      }

      modal.appendChild(eventsEl);
    }

    // POTM
    if (r.potm) {
      const potmDivider = document.createElement('div');
      potmDivider.className = 'lr-detail-divider';
      modal.appendChild(potmDivider);

      const potmEl = document.createElement('div');
      potmEl.className = 'lr-detail-potm';
      potmEl.innerHTML = `<span class="lr-detail-potm-star">⭐</span><span class="lr-detail-potm-label">Player of the Match</span><span class="lr-detail-potm-name">${r.potm.name}</span>`;
      modal.appendChild(potmEl);
    }

    backdrop.appendChild(modal);
    container.appendChild(backdrop);

    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.addEventListener('touchend', e => { if (e.target === backdrop) { e.preventDefault(); backdrop.remove(); } }, { passive: false });
  }

  return { show };

})();
