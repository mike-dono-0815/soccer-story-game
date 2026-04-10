/* ============================================================
   MATCH SCREEN — Classic scoreboard + timeline + match report
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Match = (function () {

  function render(scene) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();

    const result = calcOutcome(scene, state);
    State.recordResult(scene.competition || 'VPL', result.outcome, scene.id, result.homeGoals, result.awayGoals);
    if (scene.isFinal && result.outcome === 'win') State.addCompetitionWin(scene.competition);
    State.save();

    const summary = window.Game.MatchSummary.generate(scene, result, state);

    const isHome     = scene.homeAway === 'home';
    const homeTeam   = isHome ? 'FC Valhalla' : (scene.opponent || 'Opponent');
    const awayTeam   = isHome ? (scene.opponent || 'Opponent') : 'FC Valhalla';

    const div = document.createElement('div');
    div.className = 'screen-match';

    // Pitch background art
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

    // Scoreboard
    content.appendChild(buildScoreboard(result, summary, homeTeam, awayTeam, isHome));

    // Result label
    const resultLabel = document.createElement('div');
    resultLabel.className = `match-result-label ${result.outcome}`;
    resultLabel.textContent = result.outcome === 'win' ? '⚡ VICTORY'
                            : result.outcome === 'draw' ? '⚖ DRAW'
                            : '💔 DEFEAT';
    content.appendChild(resultLabel);

    // Scrollable content area: report then timeline
    const scrollArea = document.createElement('div');
    scrollArea.className = 'match-scroll-area';

    const rptPane = buildReport(summary.proseParts);
    rptPane.className = 'match-pane match-pane-report';
    scrollArea.appendChild(rptPane);

    const divider = document.createElement('div');
    divider.className = 'match-section-divider';
    divider.textContent = 'Match Events';
    scrollArea.appendChild(divider);

    const tlPane = buildTimeline(summary.events);
    tlPane.className = 'match-pane match-pane-timeline';
    scrollArea.appendChild(tlPane);

    content.appendChild(scrollArea);

    // Continue
    const footer = document.createElement('div');
    footer.className = 'match-footer';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Continue';
    const onDone = () => { if (scene.next) Engine.advance(scene.next); else Engine.next(); };
    btn.addEventListener('click', onDone);
    btn.addEventListener('touchend', e => { e.preventDefault(); onDone(); }, { passive: false });
    footer.appendChild(btn);
    content.appendChild(footer);

    div.appendChild(content);
    Utils.render(div);

    // Subtle entrance animation
    setTimeout(() => {
      resultLabel.classList.add(result.outcome === 'win' ? 'pulse-good' : result.outcome === 'loss' ? 'shake' : '');
    }, 300);
  }

  function minStr(m) { return m > 90 ? `90+${m - 90}'` : `${m}'`; }

  // ── Scoreboard ────────────────────────────────────────────────

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
        el.innerHTML = `<span class="sb-ball">⚽</span><span class="sb-scorer-name">${g.scorerShort}</span><span class="sb-scorer-min">${minStr(g.minute)}</span>`;
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

  function buildTimeline(events) {
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
        main.innerHTML = `<span class="tl-min">${minStr(ev.minute)}</span><span class="tl-scorer">${ev.scorerShort}</span>`;
        body.appendChild(main);

        if (ev.assist && ev.isValhalla) {
          const sub = document.createElement('div');
          sub.className = 'tl-sub';
          sub.textContent = `Assist: ${ev.assistShort}`;
          body.appendChild(sub);
        }

        const score = document.createElement('div');
        score.className = 'tl-score';
        score.textContent = ev.scoreStr;

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

  // ── Report ────────────────────────────────────────────────────

  function buildReport(proseParts) {
    const pane = document.createElement('div');
    proseParts.forEach(part => {
      const p = document.createElement('p');
      p.className = 'report-para';
      // Convert **bold** markers to <strong>
      p.innerHTML = part.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      pane.appendChild(p);
    });
    return pane;
  }

  // ── Outcome calculation (unchanged) ──────────────────────────

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

    score += (Math.random() * 0.2) - 0.1;

    const difficulty = scene.difficulty || 0.5;
    let outcome;
    if (score > difficulty + 0.08)      outcome = 'win';
    else if (score > difficulty - 0.08) outcome = 'draw';
    else                                 outcome = 'loss';

    return buildScoreline(outcome, scene);
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
