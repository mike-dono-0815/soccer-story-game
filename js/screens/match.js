/* ============================================================
   MATCH SCREEN — Classic scoreboard + timeline + match report
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Match = (function () {

  function render(scene, onAdvance) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();

    const result = calcOutcome(scene, state);
    State.recordResult(scene.competition || 'VPL', result.outcome, scene.id, result.homeGoals, result.awayGoals);
    if (scene.isFinal && result.outcome === 'win') State.addCompetitionWin(scene.competition);
    State.save();

    const summary = window.Game.MatchSummary.generate(scene, result, state);
    State.recordPlayerStats(summary.events, summary.potm, scene.competition || 'VPL', state.lineup);
    State.save();

    // Build surname → player lookup for tappable name tags
    const playerLookup = buildPlayerLookup(state);

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

    const rptPane = buildReport(summary.proseParts, playerLookup);
    rptPane.className = 'match-pane match-pane-report';
    scrollArea.appendChild(rptPane);

    const divider = document.createElement('div');
    divider.className = 'match-section-divider';
    divider.textContent = 'Match Events';
    scrollArea.appendChild(divider);

    const tlPane = buildTimeline(summary.events, playerLookup);
    tlPane.className = 'match-pane match-pane-timeline';
    scrollArea.appendChild(tlPane);

    // Tap any highlighted player name to see their card
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

    // Player of the Match
    if (summary.potm) {
      const potmSection = buildPotm(summary.potm);
      scrollArea.appendChild(potmSection);
    }

    // Continue
    const footer = document.createElement('div');
    footer.className = 'match-footer';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Continue';
    const advance = () => {
      const nextId = (result.outcome === 'win' && scene.onWin)   ? scene.onWin
                   : (result.outcome !== 'win' && scene.onLoss)  ? scene.onLoss
                   : scene.next || null;
      if (typeof onAdvance === 'function') {
        onAdvance(nextId);
      } else if (nextId) {
        Engine.advance(nextId);
      } else {
        Engine.next();
      }
    };
    const onDone = () => {
      if (summary.keyMoment) {
        window.Game.Screens.PlayerMoment.show(summary.keyMoment, advance);
      } else {
        advance();
      }
    };
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
          ? `<button class="player-tag tl-scorer" data-pid="${ev.scorerId}">${ev.scorerShort}</button>`
          : `<span class="tl-scorer">${ev.scorerShort}</span>`;
        main.innerHTML = `<span class="tl-min">${minStr(ev.minute)}</span>${scorerHtml}`;
        body.appendChild(main);

        if (ev.assist && ev.isValhalla) {
          const sub = document.createElement('div');
          sub.className = 'tl-sub';
          if (ev.assistId) {
            sub.innerHTML = `Assist: <button class="player-tag" data-pid="${ev.assistId}">${ev.assistShort}</button>`;
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
    name.textContent = potm.name;

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
