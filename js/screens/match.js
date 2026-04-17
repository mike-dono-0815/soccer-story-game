/* ============================================================
   MATCH SCREEN — Classic scoreboard + timeline + match report
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Match = (function () {

  // ── Tactical Cards ─────────────────────────────────────────────
  const TACTICAL_CARDS = [
    { id: 'high_press',    icon: '🔥', name: 'High Press',    flavour: 'Push up. Force the error.' },
    { id: 'solid_block',   icon: '🛡', name: 'Solid Block',   flavour: 'Drop deep. Stay compact.' },
    { id: 'counter_punch', icon: '⚡', name: 'Counter',       flavour: 'Absorb. Hit the break.' },
    { id: 'dead_ball',     icon: '🎯', name: 'Dead Ball',     flavour: 'One set piece. Everything.' },
    { id: 'gaffers_talk',  icon: '📢', name: "Gaffer's Talk", flavour: 'Your words. Their fire.' },
  ];

  function pickGoalscorer(starters) {
    const fwmf = starters.filter(p => p && ['ST', 'CF', 'CAM', 'RM', 'LM', 'CM', 'RW', 'LW'].includes(p.position));
    const pool = fwmf.length > 0 ? fwmf : starters.filter(Boolean);
    if (!pool.length) return { scorerShort: 'Valhalla', scorerId: null };
    const p = pool[Math.floor(Math.random() * pool.length)];
    return { scorerShort: p.name.split(' ').pop(), scorerId: p.id };
  }

  function render(scene, onAdvance) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();

    // Pre-calculate for sim animation goal events only — final result re-derived in finishSim
    const initialResult = calcOutcome(scene, state);
    const summary = window.Game.MatchSummary.generate(scene, initialResult, state);
    const starters = state.lineup.map(id => state.squad.find(p => p.id === id)).filter(Boolean);

    const playerLookup = buildPlayerLookup(state);

    const isHome   = scene.homeAway === 'home';
    const homeTeam = isHome ? 'FC Valhalla' : (scene.opponent || 'Opponent');
    const awayTeam = isHome ? (scene.opponent || 'Opponent') : 'FC Valhalla';

    const div = document.createElement('div');
    div.className = 'screen-match';

    const pitchArt = document.createElement('div');
    pitchArt.className = 'match-pitch-art';
    pitchArt.innerHTML = `
      <div class="match-pitch-lines"></div>
      <div class="match-pitch-center"></div>
      <div class="match-pitch-halfway"></div>
    `;
    div.appendChild(pitchArt);

    const content = document.createElement('div');
    content.className = 'match-content';

    // Competition badge + trophy
    const compHeader = document.createElement('div');
    compHeader.className = 'match-comp-header';
    const compBadge = document.createElement('div');
    compBadge.className = 'match-competition-badge';
    compBadge.textContent = scene.competition || 'Valorian Premier League';
    compHeader.appendChild(compBadge);
    compHeader.appendChild(Utils.mkTrophy(scene.competition || 'VPL', 'sm'));
    content.appendChild(compHeader);

    // ── Live scoreboard (starts 0–0, populated during simulation) ──
    const { sbEl, homeNumEl, awayNumEl, hCol, aCol } = buildLiveScoreboard(homeTeam, awayTeam, isHome);
    content.appendChild(sbEl);

    // ── Running clock bar (hidden after simulation) ──────────────
    const liveBar = document.createElement('div');
    liveBar.className = 'match-live-bar';
    liveBar.innerHTML = `<span class="match-live-badge">LIVE</span>`;
    const clockEl = document.createElement('span');
    clockEl.className = 'match-live-clock';
    clockEl.textContent = "0'";
    const progressOuter = document.createElement('div');
    progressOuter.className = 'match-live-progress';
    const progressFill = document.createElement('div');
    progressFill.className = 'match-live-progress-fill';
    progressOuter.appendChild(progressFill);
    liveBar.appendChild(clockEl);
    liveBar.appendChild(progressOuter);
    content.appendChild(liveBar);

    // ── Result label — hidden until simulation ends ──────────────
    const resultLabel = document.createElement('div');
    resultLabel.className = `match-result-label ${result.outcome}`;
    resultLabel.textContent = result.outcome === 'win' ? '⚡ VICTORY'
                            : result.outcome === 'draw' ? '⚖ DRAW'
                            : '💔 DEFEAT';
    resultLabel.style.display = 'none';
    content.appendChild(resultLabel);

    // ── Scrollable summary area — built and revealed in finishSim ─
    const scrollArea = document.createElement('div');
    scrollArea.className = 'match-scroll-area';
    scrollArea.style.opacity = '0';
    scrollArea.style.pointerEvents = 'none';

    // Event delegation for player tags — works for children added later
    scrollArea.addEventListener('click', e => {
      const tag = e.target.closest('.player-tag');
      if (!tag) return;
      const player = state.squad.find(p => p.id === tag.dataset.pid);
      if (player) showPlayerCard(player, state);
    });
    scrollArea.addEventListener('touchend', e => {
      const tag = e.target.closest('.player-tag');
      if (!tag) return;
      e.preventDefault();
      const player = state.squad.find(p => p.id === tag.dataset.pid);
      if (player) showPlayerCard(player, state);
    }, { passive: false });

    content.appendChild(scrollArea);

    // ── Footer — hidden until simulation ends ────────────────────
    const footer = document.createElement('div');
    footer.className = 'match-footer';
    footer.style.display = 'none';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Continue';
    // advance/onDone use finalResult/finalSummary set in finishSim
    const advance = () => {
      const nextId = (finalResult.outcome === 'win' && scene.onWin)  ? scene.onWin
                   : (finalResult.outcome !== 'win' && scene.onLoss) ? scene.onLoss
                   : scene.next || null;
      if (typeof onAdvance === 'function') onAdvance(nextId);
      else if (nextId) Engine.advance(nextId);
      else Engine.next();
    };
    const onDone = () => {
      const moments = (finalSummary && finalSummary.keyMoments) || [];
      if (moments.length === 0) { advance(); return; }
      let idx = 0;
      function showNext() {
        if (idx < moments.length) window.Game.Screens.PlayerMoment.show(moments[idx++], showNext);
        else advance();
      }
      showNext();
    };
    btn.addEventListener('click', onDone);
    btn.addEventListener('touchend', e => { e.preventDefault(); onDone(); }, { passive: false });
    footer.appendChild(btn);
    content.appendChild(footer);

    // ── "Tap to skip" hint ────────────────────────────────────────
    const skipHint = document.createElement('div');
    skipHint.className = 'match-skip-hint';
    skipHint.textContent = 'tap anywhere to skip';
    div.appendChild(skipHint);

    div.appendChild(content);
    Utils.render(div);

    // ── Simulation ────────────────────────────────────────────────
    const goalEvents = summary.events
      .filter(e => e.type === 'goal')
      .sort((a, b) => a.minute - b.minute);

    let maxMinute = Math.max(90, goalEvents.length ? goalEvents[goalEvents.length - 1].minute : 0);
    const DURATION_MS = 21000;

    // Which column belongs to Valhalla vs opponent
    const vCol = isHome ? hCol : aCol;
    const oCol = isHome ? aCol : hCol;

    let simDone     = false;
    let rafId       = null;
    let startTime   = null;
    let nextGoalIdx = 0;
    let curHome = 0, curAway = 0;
    let simMinute   = 0;      // updated each tick, used by card injection
    let finalResult = null;   // set in finishSim
    let finalSummary = null;  // set in finishSim

    // ── Tactical Card Tray ────────────────────────────────────────
    const seasonCards = (state.seasonCards && state.seasonCards.length === TACTICAL_CARDS.length)
      ? state.seasonCards
      : TACTICAL_CARDS.map(c => ({ id: c.id, used: false }));

    const tacTray = document.createElement('div');
    tacTray.className = 'tac-tray';
    const tacLabel = document.createElement('div');
    tacLabel.className = 'tac-tray-label';
    tacLabel.textContent = 'Tactical Cards';
    tacTray.appendChild(tacLabel);
    const tacRow = document.createElement('div');
    tacRow.className = 'tac-cards-row';

    TACTICAL_CARDS.forEach((def, idx) => {
      const sc = seasonCards[idx];
      const cardEl = document.createElement('div');
      cardEl.className = 'tac-card' + (sc.used ? ' used' : '');
      cardEl.title = def.flavour;
      cardEl.innerHTML = `
        <div class="tac-card-inner">
          <div class="tac-card-front">
            <span class="tac-icon">${def.icon}</span>
            <span class="tac-name">${def.name}</span>
          </div>
          <div class="tac-card-back"><span class="tac-back-mark">✦</span></div>
        </div>`;
      tacRow.appendChild(cardEl);
    });
    tacTray.appendChild(tacRow);
    // Insert before the result label inside content
    content.insertBefore(tacTray, resultLabel);

    // ── Card interaction ──────────────────────────────────────────
    function applyCard(idx) {
      const sc = seasonCards[idx];
      if (!sc || sc.used || simDone) return;
      sc.used = true;
      State.useCard(sc.id);

      // Remove the next future opponent goal (if any)
      for (let i = nextGoalIdx; i < goalEvents.length; i++) {
        if (!goalEvents[i].isValhalla) { goalEvents.splice(i, 1); break; }
      }

      // Inject a Valhalla goal in remaining time
      const earliest = Math.max(simMinute + 6, 1);
      if (earliest <= 88) {
        const minute = Math.floor(Math.random() * (88 - earliest + 1)) + earliest;
        const scorer = pickGoalscorer(starters);
        const injected = { type: 'goal', minute, isValhalla: true, scorerId: scorer.scorerId, scorerShort: scorer.scorerShort };
        let ins = goalEvents.length;
        for (let i = nextGoalIdx; i < goalEvents.length; i++) {
          if (goalEvents[i].minute > minute) { ins = i; break; }
        }
        goalEvents.splice(ins, 0, injected);
      }

      // Flip card visually
      const cardEl = tacRow.children[idx];
      if (cardEl) cardEl.classList.add('used');

      // Update label if all used
      const allUsed = seasonCards.every(c => c.used);
      if (allUsed) tacLabel.textContent = 'No cards remaining';
    }

    tacRow.querySelectorAll('.tac-card').forEach((cardEl, idx) => {
      cardEl.addEventListener('click', e => { e.stopPropagation(); applyCard(idx); });
      cardEl.addEventListener('touchend', e => { e.preventDefault(); e.stopPropagation(); applyCard(idx); }, { passive: false });
    });
    // Prevent tray-level taps from triggering "tap to skip"
    tacTray.addEventListener('click', e => e.stopPropagation());
    tacTray.addEventListener('touchend', e => e.stopPropagation(), { passive: false });

    function flashNum(el) {
      el.classList.remove('sb-num-flash');
      void el.offsetWidth; // force reflow to restart animation
      el.classList.add('sb-num-flash');
    }

    function fireGoal(g, animate) {
      const isHomeGoal = (isHome && g.isValhalla) || (!isHome && !g.isValhalla);
      if (isHomeGoal) { curHome++; homeNumEl.textContent = curHome; if (animate) flashNum(homeNumEl); }
      else            { curAway++; awayNumEl.textContent = curAway; if (animate) flashNum(awayNumEl); }

      const el = document.createElement('div');
      el.className = 'sb-scorer' + (animate ? ' sb-scorer-new' : '');
      if (g.isValhalla) {
        el.innerHTML = `<span class="sb-ball">⚽</span><span class="sb-scorer-name">${stickerHtml(g.scorerId)}${g.scorerShort}</span><span class="sb-scorer-min">${minStr(g.minute)}</span>`;
        vCol.appendChild(el);
      } else {
        el.innerHTML = `<span class="sb-scorer-min">${minStr(g.minute)}</span><span class="sb-scorer-name">${g.scorerShort}</span><span class="sb-ball">⚽</span>`;
        oCol.appendChild(el);
      }
    }

    function finishSim() {
      if (simDone) return;
      simDone = true;
      if (rafId) cancelAnimationFrame(rafId);

      // Fire any goals not yet shown
      while (nextGoalIdx < goalEvents.length) fireGoal(goalEvents[nextGoalIdx++], false);

      // ── Derive actual result from displayed goals ─────────────
      const valGoals = goalEvents.filter(g => g.isValhalla).length;
      const oppGoals = goalEvents.filter(g => !g.isValhalla).length;
      const fHomeGoals = isHome ? valGoals : oppGoals;
      const fAwayGoals = isHome ? oppGoals : valGoals;
      const rawOutcome = valGoals > oppGoals ? 'win' : valGoals < oppGoals ? 'loss' : 'draw';
      const rawResult  = { outcome: rawOutcome, homeGoals: fHomeGoals, awayGoals: fAwayGoals };
      finalResult = (rawOutcome === 'draw' && isKnockoutMatch(scene))
        ? resolveKODraw(rawResult, scene)
        : { ...rawResult, method: 'normal', penScore: null, ninetyGoals: null };

      // Correct displayed score to final (AET adds a goal, penalties keep 90-min score)
      homeNumEl.textContent = finalResult.homeGoals;
      awayNumEl.textContent = finalResult.awayGoals;

      // AET / penalties badge
      if (finalResult.method === 'aet' || (finalResult.method === 'penalties' && finalResult.penScore)) {
        const scoreBox = sbEl.querySelector('.match-sb-score');
        if (scoreBox && !scoreBox.querySelector('.sb-method-badge')) {
          const badge = document.createElement('div');
          badge.className = 'sb-method-badge';
          badge.textContent = finalResult.method === 'aet'
            ? 'AET'
            : `${finalResult.penScore.home}–${finalResult.penScore.away} pens`;
          scoreBox.appendChild(badge);
        }
      }

      // Record result and generate summary
      State.recordResult(scene.competition || 'VPL', finalResult.outcome, scene.id, finalResult.homeGoals, finalResult.awayGoals, scene.opponent, isHome);
      if (scene.isFinal && finalResult.outcome === 'win') State.addCompetitionWin(scene.competition);
      State.save();
      finalSummary = window.Game.MatchSummary.generate(scene, finalResult, state);
      State.recordPlayerStats(finalSummary.events, finalSummary.potm, scene.competition || 'VPL', state.lineup);
      State.save();

      // Hide live elements + card tray
      liveBar.style.display  = 'none';
      skipHint.style.display = 'none';
      tacTray.style.display  = 'none';

      // Reveal result label
      resultLabel.className   = `match-result-label ${finalResult.outcome}`;
      resultLabel.textContent = finalResult.outcome === 'win' ? '⚡ VICTORY'
                              : finalResult.outcome === 'draw' ? '⚖ DRAW'
                              : '💔 DEFEAT';
      resultLabel.style.display = '';
      setTimeout(() => {
        resultLabel.classList.add(finalResult.outcome === 'win' ? 'pulse-good' : finalResult.outcome === 'loss' ? 'shake' : '');
      }, 100);

      // Build scroll area content
      const rptPane = buildReport(finalSummary.proseParts, playerLookup);
      rptPane.className = 'match-pane match-pane-report';
      scrollArea.appendChild(rptPane);
      const divider = document.createElement('div');
      divider.className = 'match-section-divider';
      divider.textContent = 'Match Events';
      scrollArea.appendChild(divider);
      const tlPane = buildTimeline(finalSummary.events, playerLookup);
      tlPane.className = 'match-pane match-pane-timeline';
      scrollArea.appendChild(tlPane);
      if (finalSummary.potm) scrollArea.appendChild(buildPotm(finalSummary.potm));

      // Fade in scroll area
      scrollArea.style.transition = 'opacity 0.5s ease';
      scrollArea.style.pointerEvents = '';
      requestAnimationFrame(() => { scrollArea.style.opacity = '1'; });

      // Show footer
      footer.style.display = '';
    }

    function tick(timestamp) {
      if (simDone) return;
      if (!startTime) startTime = timestamp;
      const elapsed  = Math.min(timestamp - startTime, DURATION_MS);
      const progress = elapsed / DURATION_MS;
      simMinute = Math.floor(progress * maxMinute);

      clockEl.textContent      = simMinute > 90 ? `90+${simMinute - 90}'` : `${simMinute}'`;
      progressFill.style.width = `${progress * 100}%`;

      while (nextGoalIdx < goalEvents.length && goalEvents[nextGoalIdx].minute <= simMinute) {
        fireGoal(goalEvents[nextGoalIdx++], true);
      }

      if (elapsed >= DURATION_MS) { finishSim(); return; }
      rafId = requestAnimationFrame(tick);
    }

    // Tap anywhere to skip to the end
    div.addEventListener('click',    () => finishSim());
    div.addEventListener('touchend', e => { if (!simDone) { e.preventDefault(); finishSim(); } }, { passive: false });

    rafId = requestAnimationFrame(tick);
  }

  function minStr(m) { return m > 90 ? `90+${m - 90}'` : `${m}'`; }

  // Returns an <img> HTML string for a key-player sticker, or '' if none.
  function stickerHtml(charId) {
    if (!charId) return '';
    const url = window.Game.Characters.getStickerUrl(charId);
    if (!url) return '';
    return `<img class="player-sticker-icon" src="${url}" alt="">`;
  }

  // ── Live scoreboard (0–0 start, refs for live updates) ────────

  function buildLiveScoreboard(homeTeam, awayTeam, isHome) {
    const wrap = document.createElement('div');
    wrap.className = 'match-sb-wrap';

    const header = document.createElement('div');
    header.className = 'match-sb-header';

    const hName = document.createElement('div');
    hName.className = 'match-sb-team' + (isHome ? ' valhalla' : '');
    hName.textContent = homeTeam;

    const scoreBox = document.createElement('div');
    scoreBox.className = 'match-sb-score';
    const homeNumEl = document.createElement('span');
    homeNumEl.className = 'sb-num';
    homeNumEl.textContent = '0';
    const dash = document.createElement('span');
    dash.className = 'sb-dash';
    dash.textContent = '–';
    const awayNumEl = document.createElement('span');
    awayNumEl.className = 'sb-num';
    awayNumEl.textContent = '0';
    scoreBox.appendChild(homeNumEl);
    scoreBox.appendChild(dash);
    scoreBox.appendChild(awayNumEl);

    const aName = document.createElement('div');
    aName.className = 'match-sb-team' + (!isHome ? ' valhalla' : '');
    aName.textContent = awayTeam;

    header.appendChild(hName);
    header.appendChild(scoreBox);
    header.appendChild(aName);
    wrap.appendChild(header);

    // Scorer columns — always present, populated as goals fire
    const scorersRow = document.createElement('div');
    scorersRow.className = 'match-sb-scorers';
    const hCol = document.createElement('div');
    hCol.className = 'sb-scorer-col';
    const aCol = document.createElement('div');
    aCol.className = 'sb-scorer-col right';
    scorersRow.appendChild(hCol);
    scorersRow.appendChild(aCol);
    wrap.appendChild(scorersRow);

    return { sbEl: wrap, homeNumEl, awayNumEl, hCol, aCol };
  }

  // ── Scoreboard (static, kept for reference) ───────────────────

  function buildScoreboard(result, summary, homeTeam, awayTeam, isHome) {
    const wrap = document.createElement('div');
    wrap.className = 'match-sb-wrap';

    // Header row: team name | score | team name
    const header = document.createElement('div');
    header.className = 'match-sb-header';

    const hName = document.createElement('div');
    hName.className = 'match-sb-team' + (isHome ? ' valhalla' : '');
    hName.textContent = homeTeam;

    const scoreBox = document.createElement('div');
    scoreBox.className = 'match-sb-score';
    scoreBox.innerHTML = `<span class="sb-num">${result.homeGoals}</span><span class="sb-dash">–</span><span class="sb-num">${result.awayGoals}</span>`;

    if (result.method === 'aet') {
      const badge = document.createElement('div');
      badge.className = 'sb-method-badge';
      badge.textContent = 'AET';
      scoreBox.appendChild(badge);
    } else if (result.method === 'penalties' && result.penScore) {
      const badge = document.createElement('div');
      badge.className = 'sb-method-badge';
      badge.textContent = `${result.penScore.home}–${result.penScore.away} pens`;
      scoreBox.appendChild(badge);
    }

    const aName = document.createElement('div');
    aName.className = 'match-sb-team' + (!isHome ? ' valhalla' : '');
    aName.textContent = awayTeam;

    header.appendChild(hName);
    header.appendChild(scoreBox);
    header.appendChild(aName);
    wrap.appendChild(header);

    // Scorers row
    const goalEvents = summary.events.filter(e => e.type === 'goal');
    const homeGoals  = goalEvents.filter(e => (isHome && e.isValhalla) || (!isHome && !e.isValhalla));
    const awayGoals  = goalEvents.filter(e => (isHome && !e.isValhalla) || (!isHome && e.isValhalla));

    if (homeGoals.length > 0 || awayGoals.length > 0) {
      const scorersRow = document.createElement('div');
      scorersRow.className = 'match-sb-scorers';

      const hCol = document.createElement('div');
      hCol.className = 'sb-scorer-col';
      homeGoals.forEach(g => {
        const el = document.createElement('div');
        el.className = 'sb-scorer';
        el.innerHTML = `<span class="sb-ball">⚽</span><span class="sb-scorer-name">${stickerHtml(g.scorerId)}${g.scorerShort}</span><span class="sb-scorer-min">${minStr(g.minute)}</span>`;
        hCol.appendChild(el);
      });

      const aCol = document.createElement('div');
      aCol.className = 'sb-scorer-col right';
      awayGoals.forEach(g => {
        const el = document.createElement('div');
        el.className = 'sb-scorer';
        el.innerHTML = `<span class="sb-scorer-min">${minStr(g.minute)}</span><span class="sb-scorer-name">${g.scorerShort}</span><span class="sb-ball">⚽</span>`;
        aCol.appendChild(el);
      });

      scorersRow.appendChild(hCol);
      scorersRow.appendChild(aCol);
      wrap.appendChild(scorersRow);
    }

    return wrap;
  }

  // ── Timeline ──────────────────────────────────────────────────

  function buildTimeline(events, lookup) {
    const pane = document.createElement('div');

    const goalCount = events.filter(e => e.type === 'goal').length;
    if (goalCount === 0) {
      const empty = document.createElement('div');
      empty.className = 'tl-empty';
      empty.textContent = 'No goals today — a goalless draw.';
      pane.appendChild(empty);
    }

    events.forEach(ev => {
      const row = document.createElement('div');

      if (ev.type === 'goal') {
        row.className = 'match-tl-row goal' + (ev.isValhalla ? ' our-goal' : ' their-goal');

        const icon = document.createElement('span');
        icon.className = 'tl-icon';
        icon.textContent = '⚽';

        const body = document.createElement('div');
        body.className = 'tl-body';

        const main = document.createElement('div');
        main.className = 'tl-main';
        const scorerHtml = (ev.isValhalla && ev.scorerId)
          ? `<button class="player-tag tl-scorer" data-pid="${ev.scorerId}">${stickerHtml(ev.scorerId)}${ev.scorerShort}</button>`
          : `<span class="tl-scorer">${ev.scorerShort}</span>`;
        main.innerHTML = `<span class="tl-min">${minStr(ev.minute)}</span>${scorerHtml}`;
        body.appendChild(main);

        if (ev.assist && ev.isValhalla) {
          const sub = document.createElement('div');
          sub.className = 'tl-sub';
          if (ev.assistId) {
            sub.innerHTML = `Assist: <button class="player-tag" data-pid="${ev.assistId}">${stickerHtml(ev.assistId)}${ev.assistShort}</button>`;
          } else {
            sub.textContent = `Assist: ${ev.assistShort}`;
          }
          body.appendChild(sub);
        }

        const score = document.createElement('div');
        score.className = 'tl-score';
        score.textContent = ev.scoreStr;

        row.appendChild(icon);
        row.appendChild(body);
        row.appendChild(score);

      } else if (ev.type === 'penalties') {
        row.className = 'match-tl-row penalties' + (ev.isValhalla ? ' our-goal' : ' their-goal');
        const icon = document.createElement('span');
        icon.className = 'tl-icon';
        icon.textContent = '🥅';
        const body = document.createElement('div');
        body.className = 'tl-body';
        const main = document.createElement('div');
        main.className = 'tl-main';
        main.innerHTML = `<span class="tl-min">Pen.</span><span class="tl-scorer">Penalty Shootout</span>`;
        body.appendChild(main);
        const score = document.createElement('div');
        score.className = 'tl-score';
        score.textContent = `${ev.penHome}–${ev.penAway}`;
        row.appendChild(icon);
        row.appendChild(body);
        row.appendChild(score);
      } else {
        const iconMap = { near_miss: '💨', save: '🧤', near_miss_opp: '💨', yellow: '🟨', yellow_opp: '🟨' };
        row.className = 'match-tl-row filler' + (ev.isValhalla ? '' : ' theirs');

        const icon = document.createElement('span');
        icon.className = 'tl-icon filler-icon';
        icon.textContent = iconMap[ev.type] || '•';

        const body = document.createElement('div');
        body.className = 'tl-body';

        const line = document.createElement('div');
        line.className = 'tl-filler-text';
        line.textContent = `${minStr(ev.minute)}  ${ev.text || ''}`;
        body.appendChild(line);

        row.appendChild(icon);
        row.appendChild(body);
      }

      pane.appendChild(row);
    });

    return pane;
  }

  // ── Player of the Match ───────────────────────────────────────

  function buildPotm(potm) {
    const wrap = document.createElement('div');
    wrap.className = `match-potm${potm.isOpponent ? ' opponent' : ''}`;

    const label = document.createElement('div');
    label.className = 'match-potm-label';
    label.textContent = '⭐ Player of the Match';

    const name = document.createElement('div');
    name.className = 'match-potm-name';
    if (!potm.isOpponent) {
      const _su = window.Game.Characters.getStickerUrl(potm.id);
      if (_su) {
        const _ic = document.createElement('img');
        _ic.className = 'player-sticker-icon';
        _ic.src = _su;
        _ic.alt = '';
        name.appendChild(_ic);
      }
      name.appendChild(document.createTextNode(window.Game.Characters.getShortName(potm)));
    } else {
      name.textContent = potm.name;
    }

    const detail = document.createElement('div');
    detail.className = 'match-potm-detail';
    if (potm.isOpponent) {
      detail.textContent = potm.team;
    } else {
      detail.textContent = `${potm.position} · ${potm.team} · ${potm.rating}`;
    }

    wrap.appendChild(label);
    wrap.appendChild(name);
    wrap.appendChild(detail);
    return wrap;
  }

  // ── Player lookup & card overlay ─────────────────────────────

  // Maps each squad player's surname → player object (for tappable name tags)
  function buildPlayerLookup(state) {
    const map = {};
    (state.squad || []).forEach(p => {
      const surname = p.name.split(' ').pop();
      map[surname] = p;
    });
    return map;
  }

  function showPlayerCard(player, state) {
    const stats = (state.playerStats || {})[player.id] || {};

    const backdrop = document.createElement('div');
    backdrop.className = 'player-card-backdrop';

    const card = document.createElement('div');
    card.className = 'player-card-modal';

    // Header: position badge + close button
    const header = document.createElement('div');
    header.className = 'pc-header';

    const posBadge = document.createElement('div');
    posBadge.className = 'pc-pos-badge';
    posBadge.textContent = player.position;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'pc-close';
    closeBtn.textContent = '✕';

    header.appendChild(posBadge);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // Name
    const nameEl = document.createElement('div');
    nameEl.className = 'pc-name';
    nameEl.textContent = player.name;
    card.appendChild(nameEl);

    // Rating + age
    const metaRow = document.createElement('div');
    metaRow.className = 'pc-meta';
    const ratingEl = document.createElement('span');
    ratingEl.className = 'pc-rating';
    ratingEl.textContent = `★ ${player.rating}`;
    const ageEl = document.createElement('span');
    ageEl.className = 'pc-age';
    ageEl.textContent = `Age ${player.age}`;
    metaRow.appendChild(ratingEl);
    metaRow.appendChild(ageEl);
    card.appendChild(metaRow);

    // Season stats section
    const sectionLabel = document.createElement('div');
    sectionLabel.className = 'pc-section-label';
    sectionLabel.textContent = 'Season Stats';
    card.appendChild(sectionLabel);

    const statsGrid = document.createElement('div');
    statsGrid.className = 'pc-stats';
    [
      { label: 'Apps',    val: stats.apps    || 0 },
      { label: 'Goals',   val: stats.goals   || 0 },
      { label: 'Assists', val: stats.assists  || 0 },
      { label: 'POTM',    val: stats.potm    || 0 },
    ].forEach(s => {
      const cell = document.createElement('div');
      cell.className = 'pc-stat-cell';
      const valEl = document.createElement('div');
      valEl.className = 'pc-stat-val';
      valEl.textContent = s.val;
      const lblEl = document.createElement('div');
      lblEl.className = 'pc-stat-label';
      lblEl.textContent = s.label;
      cell.appendChild(valEl);
      cell.appendChild(lblEl);
      statsGrid.appendChild(cell);
    });
    card.appendChild(statsGrid);

    backdrop.appendChild(card);

    // Dismiss on backdrop tap or close button
    const dismiss = () => backdrop.remove();
    closeBtn.addEventListener('click', dismiss);
    closeBtn.addEventListener('touchend', e => { e.preventDefault(); dismiss(); }, { passive: false });
    backdrop.addEventListener('click', e => { if (e.target === backdrop) dismiss(); });
    backdrop.addEventListener('touchend', e => {
      if (e.target === backdrop) { e.preventDefault(); dismiss(); }
    }, { passive: false });

    const container = document.querySelector('.game-container') || document.body;
    container.appendChild(backdrop);
  }

  // ── Report ────────────────────────────────────────────────────

  function buildReport(proseParts, lookup) {
    const pane = document.createElement('div');
    proseParts.forEach(part => {
      const p = document.createElement('p');
      p.className = 'report-para';
      // Convert **name** markers: tappable tag for squad players, bold otherwise
      p.innerHTML = part.replace(/\*\*([^*]+)\*\*/g, (_, name) => {
        const player = lookup && lookup[name];
        return player
          ? `<button class="player-tag" data-pid="${player.id}">${name}</button>`
          : `<strong>${name}</strong>`;
      });
      pane.appendChild(p);
    });
    return pane;
  }

  // ── Outcome calculation ───────────────────────────────────────

  // Knockout rounds (non-group cup matches) must always have a winner
  function isKnockoutMatch(scene) {
    const groupScenes = new Set(['champions_group_1', 'champions_group_2', 'champions_group_3']);
    if (groupScenes.has(scene.id)) return false;
    return ['FA Cup', 'Champions Cup', 'Club World Cup'].includes(scene.competition);
  }

  // Resolve a draw in a knockout round via AET or penalties
  function resolveKODraw(scoreline, scene) {
    const valIsHome = scene.homeAway !== 'away';
    const r = Math.random();
    // 65% chance goes to AET, 35% straight to penalties
    const method = r < 0.65 ? 'aet' : 'penalties';
    const valhallaWins = Math.random() < 0.5;

    const { homeGoals, awayGoals } = scoreline; // draw score at 90 min

    if (method === 'aet') {
      const homeWinsAET = valIsHome ? valhallaWins : !valhallaWins;
      return {
        outcome: valhallaWins ? 'win' : 'loss',
        homeGoals: homeGoals + (homeWinsAET ? 1 : 0),
        awayGoals: awayGoals + (homeWinsAET ? 0 : 1),
        method: 'aet',
        penScore: null,
        ninetyGoals: { home: homeGoals, away: awayGoals },
      };
    } else {
      // Penalty shootout — realistic scores
      const penOpts = valhallaWins ? [[4,3],[5,4],[5,3],[4,2]] : [[3,4],[4,5],[3,5],[2,4]];
      const [valPen, oppPen] = penOpts[Math.floor(Math.random() * penOpts.length)];
      return {
        outcome: valhallaWins ? 'win' : 'loss',
        homeGoals, awayGoals, // score stays at 90-min result
        method: 'penalties',
        penScore: { home: valIsHome ? valPen : oppPen, away: valIsHome ? oppPen : valPen },
        ninetyGoals: { home: homeGoals, away: awayGoals },
      };
    }
  }

  function calcOutcome(scene, state) {
    const s = state.story;

    let score = (s.teamMorale * 0.4 + s.boardConfidence * 0.3) / 100;

    if (state.trainingFocus === 'fitness')    score += 0.05;
    if (state.trainingFocus === 'tactics')    score += 0.04;
    if (state.trainingFocus === 'morale')     score += 0.03;
    if (state.trainingFocus === 'set-pieces') score += 0.03;

    const goodFormations = scene.goodFormations || [];
    if (goodFormations.includes(state.formation)) score += 0.07;

    if (s.starSold || s.starInjured) score -= 0.08;
    if (state.lineup.includes('star') && !s.starSold && !s.starInjured) score += 0.04;

    // Average squad rating factor: 76 = baseline (neutral), every ±10 pts ≈ ±0.067
    const starters = state.lineup.map(id => state.squad.find(p => p.id === id)).filter(Boolean);
    if (starters.length > 0) {
      const avgRating = starters.reduce((sum, p) => sum + p.rating, 0) / starters.length;
      score += (avgRating - 76) / 150;
    }

    score += (Math.random() * 0.2) - 0.1;

    const difficulty = scene.difficulty || 0.5;
    let outcome;
    if (score > difficulty + 0.06)      outcome = 'win';
    else if (score > difficulty - 0.06) outcome = 'draw';
    else                                 outcome = 'loss';

    const scoreline = buildScoreline(outcome, scene);

    // Knockout rounds must produce a winner — resolve draws via AET or penalties
    if (scoreline.outcome === 'draw' && isKnockoutMatch(scene)) {
      return resolveKODraw(scoreline, scene);
    }

    return { ...scoreline, method: 'normal', penScore: null, ninetyGoals: null };
  }

  function buildScoreline(outcome, scene) {
    const { randomBetween } = window.Game.Utils;
    let homeGoals, awayGoals;

    if (scene.homeAway === 'home') {
      if (outcome === 'win')       { homeGoals = randomBetween(1, 4); awayGoals = randomBetween(0, homeGoals - 1); }
      else if (outcome === 'draw') { homeGoals = randomBetween(0, 2); awayGoals = homeGoals; }
      else                         { awayGoals = randomBetween(1, 3); homeGoals = randomBetween(0, awayGoals - 1); }
    } else {
      if (outcome === 'win')       { awayGoals = randomBetween(1, 3); homeGoals = randomBetween(0, awayGoals - 1); }
      else if (outcome === 'draw') { homeGoals = randomBetween(0, 2); awayGoals = homeGoals; }
      else                         { homeGoals = randomBetween(1, 3); awayGoals = randomBetween(0, homeGoals - 1); }
    }

    return { outcome, homeGoals, awayGoals };
  }

  return { render };

})();
