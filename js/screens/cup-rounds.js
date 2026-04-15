/* ============================================================
   CUP ROUNDS SCREEN — Other teams' results before a cup match
   Shows the bracket results from the same/previous round so the
   player can see who else has advanced before they play.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.CupRounds = (function () {

  // ── Narrative generation ─────────────────────────────────────

  const NARRATIVES = {
    fa_r1: [
      "The draw opens up. Ironclad United are through and look dangerous — if both sides keep winning, a meeting awaits.",
      "The Round 1 results are in. The path to Wembley is becoming clearer.",
      "No upsets to speak of. The stronger sides advance. The competition is properly underway.",
    ],
    fa_qf: [
      "The semi-final picture is taking shape. Ironclad United are through — a potential showdown looms.",
      "Three other sides are through. The competition is down to its last four. Valhalla must be at their best.",
      "The quarter-finals deliver no major shocks. The favourites hold their nerve.",
    ],
    fa_sf: [
      "The Cup Final opponent is set. They've earned their place — and they'll be ready.",
      "One more win and Valhalla are in the Final. The other side of the draw has done its part.",
      "The stage is set. One more game stands between Valhalla and Wembley.",
    ],
    champ_group: [
      "Group B has been decided. Dynamo Vostok were relentless — the kind of opposition that punishes any weakness.",
      "The group stage is complete. The bracket is set. Valhalla's European adventure reaches its defining moment.",
      "Two teams from each group advance. The competition's elite are through, and they know it.",
    ],
    champ_sf: [
      "Dynamo Vostok are through to the Final. Fearsome from start to finish — a genuine test of everything Valhalla have built.",
      "The Champions Cup Final is set. Dynamo are waiting — and they look ready for it.",
      "The other semi-final is decided. Valhalla know their opponents if they can get past today.",
    ],
    cwc_r16: [
      "The Round of 16 field narrows. The world's elite sides advance. The competition has no room for error.",
      "Results from across the globe filter in. The Club World Cup is down to eight teams.",
      "No easy paths remain. The surviving sides are the best clubs on the planet.",
    ],
    cwc_qf: [
      "The quarter-finals deliver. Four clubs remain. The pressure at this stage is unlike anything in domestic football.",
      "The field is down to four. Every side here has earned their place. Including Valhalla.",
      "Semi-final spots are taken. From here, every match is a final in everything but name.",
    ],
    cwc_sf: [
      "The Final is set from the other side of the draw. Whoever Valhalla face, they will be formidable.",
      "One final obstacle. The other semi-final is done — a worthy opponent awaits in the Final.",
      "The stage is set for the Club World Cup Final. One match from history.",
    ],
  };

  function narrativeKey(data) {
    const { competition, roundLabel, isCWC, groupMode, groupLabel } = data;
    if (groupMode && groupLabel && groupLabel.includes('Group A')) return 'champ_group';
    if (groupMode)                             return 'champ_group';
    if (isCWC && roundLabel.includes('16'))    return 'cwc_r16';
    if (isCWC && roundLabel.includes('Quarter')) return 'cwc_qf';
    if (isCWC && roundLabel.includes('Semi'))  return 'cwc_sf';
    if (competition === 'FA Cup' && roundLabel.includes('Round 1'))  return 'fa_r1';
    if (competition === 'FA Cup' && roundLabel.includes('Quarter'))  return 'fa_qf';
    if (competition === 'FA Cup' && roundLabel.includes('Semi'))     return 'fa_sf';
    if (competition === 'Champions Cup' && roundLabel.includes('Semi')) return 'champ_sf';
    return 'fa_r1';
  }

  function pickNarrative(data) {
    const pool = NARRATIVES[narrativeKey(data)] || NARRATIVES.fa_r1;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Match row builders ───────────────────────────────────────

  function buildMatchRow(m, isCWC) {
    const { getTeamName, getCWCTeam } = window.Game.CupSim;
    const row = document.createElement('div');
    row.className = 'cr-match-row';

    if (isCWC) {
      const ht = getCWCTeam(m.homeId);
      const at = getCWCTeam(m.awayId);

      const hCell = document.createElement('div');
      hCell.className = 'cr-team-cell' + (m.winnerId === m.homeId ? ' cr-winner' : ' cr-loser');
      hCell.innerHTML = `<span class="cr-flag">${ht.flag || ''}</span><span class="cr-name">${ht.name}</span>`;

      const scoreEl = document.createElement('div');
      scoreEl.className = 'cr-score';
      scoreEl.textContent = (m.homeGoals != null && m.awayGoals != null)
        ? `${m.homeGoals} – ${m.awayGoals}`
        : '– –';

      const aCell = document.createElement('div');
      aCell.className = 'cr-team-cell right' + (m.winnerId === m.awayId ? ' cr-winner' : ' cr-loser');
      aCell.innerHTML = `<span class="cr-name">${at.name}</span><span class="cr-flag">${at.flag || ''}</span>`;

      row.appendChild(hCell);
      row.appendChild(scoreEl);
      row.appendChild(aCell);
    } else {
      const hName = getTeamName(m.homeId);
      const aName = getTeamName(m.awayId);

      const hEl = document.createElement('span');
      hEl.className = 'cr-team' + (m.winnerId === m.homeId ? ' cr-winner' : ' cr-loser');
      hEl.textContent = hName;

      const scoreEl = document.createElement('span');
      scoreEl.className = 'cr-score';
      scoreEl.textContent = (m.homeGoals != null && m.awayGoals != null)
        ? `${m.homeGoals} – ${m.awayGoals}`
        : '– –';

      const aEl = document.createElement('span');
      aEl.className = 'cr-team right' + (m.winnerId === m.awayId ? ' cr-winner' : ' cr-loser');
      aEl.textContent = aName;

      row.appendChild(hEl);
      row.appendChild(scoreEl);
      row.appendChild(aEl);
    }

    return row;
  }

  function buildGroupTable(fixtures, teamIds) {
    const standings = window.Game.CupSim.groupStandings(fixtures, teamIds);
    const { getTeamName } = window.Game.CupSim;

    const wrap = document.createElement('div');
    wrap.className = 'cr-group-table';

    const hdr = document.createElement('div');
    hdr.className = 'cr-group-hdr';
    hdr.innerHTML = '<span class="cr-g-name">Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span class="bold">Pts</span>';
    wrap.appendChild(hdr);

    standings.forEach((row, i) => {
      const r = document.createElement('div');
      r.className = 'cr-group-row' + (i < 2 ? ' cr-group-qualify' : '');
      const nameEl = document.createElement('span');
      nameEl.className = 'cr-g-name';
      nameEl.textContent = (i < 2 ? '↑ ' : '') + getTeamName(row.id);
      r.appendChild(nameEl);
      [row.played, row.w, row.d, row.l, row.pts].forEach((v, vi) => {
        const c = document.createElement('span');
        c.textContent = v;
        if (vi === 4) c.className = 'bold';
        r.appendChild(c);
      });
      wrap.appendChild(r);
    });

    return wrap;
  }

  // ── Main render ──────────────────────────────────────────────

  function show(data, onDone) {
    if (!data || (!data.matches?.length && !data.groupMode)) { onDone(); return; }

    const narrative = pickNarrative(data);

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-cup-rounds screen-enter';

    // Tap hint
    const hint = document.createElement('div');
    hint.className = 'scene-tap-hint';
    hint.textContent = 'tap anywhere to continue';
    screen.appendChild(hint);

    // Header
    const header = document.createElement('div');
    header.className = 'cr-header';

    const compBadge = document.createElement('div');
    compBadge.className = 'cr-comp-badge';
    compBadge.textContent = data.competition;
    header.appendChild(compBadge);

    const roundEl = document.createElement('div');
    roundEl.className = 'cr-round-label';
    roundEl.textContent = data.roundLabel;
    header.appendChild(roundEl);

    screen.appendChild(header);

    // Content (scrollable)
    const content = document.createElement('div');
    content.className = 'cr-content';

    if (data.groupMode && data.groupBIds && data.groupBFixtures) {
      // Champions Cup group stage: show standings
      const title = document.createElement('div');
      title.className = 'cr-section-title';
      title.textContent = data.groupLabel || 'Group B Standings';
      content.appendChild(title);
      content.appendChild(buildGroupTable(data.groupBFixtures, data.groupBIds));
    } else {
      // Match results list
      data.matches.forEach(m => content.appendChild(buildMatchRow(m, !!data.isCWC)));
    }

    // Narrative
    if (narrative) {
      const narr = document.createElement('p');
      narr.className = 'cr-narrative';
      narr.textContent = narrative;
      content.appendChild(narr);
    }

    screen.appendChild(content);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'cr-footer';
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

    // Tap-anywhere on background/hint dismisses too
    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); onDone(); }, 300);
    }
    screen.addEventListener('click', e => {
      if (e.target === screen || e.target === hint) dismiss();
    });
  }

  return { show };

})();
