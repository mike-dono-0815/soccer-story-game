/* ============================================================
   HUB SCREEN — Main dashboard between events
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Hub = (function () {

  function render(nextEventLabel, nextEventDetail) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();
    const s = state.story;
    const r = state.results;

    const div = document.createElement('div');
    div.className = 'screen-hub';

    // Header
    const header = document.createElement('div');
    header.className = 'hub-header';

    const crest = document.createElement('div');
    crest.className = 'hub-crest';
    const crestLetter = document.createElement('div');
    crestLetter.className = 'hub-crest-letter';
    crestLetter.textContent = 'V';
    crest.appendChild(crestLetter);
    header.appendChild(crest);

    const teamInfo = document.createElement('div');
    teamInfo.className = 'hub-team-info';
    const teamName = document.createElement('div');
    teamName.className = 'hub-team-name';
    teamName.textContent = 'FC Valhalla';
    const managerName = document.createElement('div');
    managerName.className = 'hub-manager-name';
    managerName.textContent = `Manager: ${state.meta.managerName}`;
    teamInfo.appendChild(teamName);
    teamInfo.appendChild(managerName);
    header.appendChild(teamInfo);

    const weekBadge = document.createElement('div');
    weekBadge.className = 'hub-week-badge';
    weekBadge.textContent = state.progress.seasonWeek === 0 ? 'Pre-Season' : `Week ${state.progress.seasonWeek}`;
    header.appendChild(weekBadge);

    div.appendChild(header);

    // Season progress bar
    const TOTAL_WEEKS = 38;
    const week = state.progress.seasonWeek;
    const pct = Math.min(100, week / TOTAL_WEEKS * 100);

    function phaseLabel(w) {
      if (w === 0)   return 'Pre-Season';
      if (w <= 12)   return 'Early Season';
      if (w <= 23)   return 'Mid-Season';
      if (w <= 30)   return 'Run-In';
      return 'Final Stretch';
    }

    const seasonBar = document.createElement('div');
    seasonBar.className = 'hub-season-bar';

    const seasonBarHeader = document.createElement('div');
    seasonBarHeader.className = 'hub-season-bar-header';
    const phaseEl = document.createElement('span');
    phaseEl.className = 'hub-season-phase';
    phaseEl.textContent = phaseLabel(week);
    const weekEl = document.createElement('span');
    weekEl.className = 'hub-season-week';
    weekEl.textContent = week === 0 ? 'Kick-off soon' : `Week ${week} of ${TOTAL_WEEKS}`;
    seasonBarHeader.appendChild(phaseEl);
    seasonBarHeader.appendChild(weekEl);
    seasonBar.appendChild(seasonBarHeader);

    const track = document.createElement('div');
    track.className = 'hub-season-track';
    const fill = document.createElement('div');
    fill.className = 'hub-season-fill';
    fill.style.width = `${pct}%`;
    track.appendChild(fill);
    // Phase boundary ticks: league start (~3%), mid-season (~34%), run-in (~63%)
    [3, 34, 63].forEach(pos => {
      const tick = document.createElement('div');
      tick.className = 'hub-season-tick';
      tick.style.left = `${pos}%`;
      track.appendChild(tick);
    });
    seasonBar.appendChild(track);
    div.appendChild(seasonBar);

    // Body
    const body = document.createElement('div');
    body.className = 'hub-body';

    // Standing card
    const standingCard = document.createElement('div');
    standingCard.className = 'hub-card';
    const standingTitle = document.createElement('div');
    standingTitle.className = 'hub-card-title';
    standingTitle.textContent = 'Season Standing';
    standingCard.appendChild(standingTitle);

    const onTable = () => window.Game.Screens.League.render(() => Engine.showHub());

    // Always compute league position live from the actual table
    let livePosition = r.vplPosition;
    if (state.league && state.league.fixtures && state.league.round > 0) {
      const liveTable = window.Game.LeagueSim.computeTable(state.league.fixtures, state.league.round);
      const liveIdx = liveTable.findIndex(row => row.id === 'valhalla');
      if (liveIdx >= 0) livePosition = liveIdx + 1;
    }

    const standingRows = [
      ['League Position', (r.vplWins + r.vplDraws + r.vplLosses === 0) ? '—' : Utils.ordinal(livePosition) + ' of 18'],
      ['Record', `${r.vplWins}W ${r.vplDraws}D ${r.vplLosses}L`],
      ['Budget', Utils.formatMoney(state.budget)],
      ['Formation', state.formation],
    ];

    standingRows.forEach(([label, val]) => {
      const row = document.createElement('div');
      row.className = 'hub-stat-row';
      const lEl = document.createElement('div');
      lEl.className = 'hub-stat-label';
      lEl.textContent = label;
      const vEl = document.createElement('div');
      vEl.className = 'hub-stat-value';
      if (label === 'League Position') {
        const tableBtn = document.createElement('button');
        tableBtn.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent-gold);opacity:0.8;margin-right:8px;';
        tableBtn.textContent = 'Full Table ›';
        tableBtn.addEventListener('click', onTable);
        tableBtn.addEventListener('touchend', e => { e.preventDefault(); onTable(); }, { passive: false });
        vEl.style.display = 'flex';
        vEl.style.alignItems = 'center';
        vEl.appendChild(tableBtn);
        vEl.appendChild(document.createTextNode(val));
      } else {
        vEl.textContent = val;
      }
      row.appendChild(lEl);
      row.appendChild(vEl);
      standingCard.appendChild(row);
    });

    // Cup status rows — always visible from the start
    const phaseLabels = state.cups ? window.Game.CupSim.getPhaseLabel(state.cups, state.results) : {};
    const cupEntries = [
      ['FA Cup',             'fa',    phaseLabels.fa    || 'Draw'],
      ['Champions Cup',      'champ', phaseLabels.champ || 'Draw'],
      ['Club World Cup', 'world', phaseLabels.world || 'Not Qualified'],
    ];

    const cupDivider = document.createElement('div');
    cupDivider.style.cssText = 'height:1px;background:var(--border);margin:8px 0 6px';
    standingCard.appendChild(cupDivider);

    cupEntries.forEach(([label, tab, status]) => {
      const row = document.createElement('div');
      row.className = 'hub-stat-row';
      const lEl = document.createElement('div');
      lEl.className = 'hub-stat-label';
      lEl.style.cssText = 'display:flex;align-items:center;gap:6px';
      lEl.appendChild(Utils.mkTrophy(tab, 'xs'));
      const labelText = document.createElement('span');
      labelText.textContent = label;
      lEl.appendChild(labelText);
      const vEl = document.createElement('div');
      vEl.className = 'hub-stat-value';
      vEl.textContent = status + ' ›';
      const isOut  = status.startsWith('Out') || status === 'Knocked Out' || status === 'Runners-up';
      const isWin  = status.includes('Winners') || status.includes('Champions');
      vEl.style.color = isWin ? 'var(--accent-gold)' : isOut ? 'var(--accent-red)' : 'var(--accent-green)';
      vEl.style.cursor = 'pointer';
      const onCupClick = () => window.Game.Screens.Cups.render(tab, () => Engine.showHub());
      vEl.addEventListener('click', onCupClick);
      vEl.addEventListener('touchend', e => { e.preventDefault(); onCupClick(); }, { passive: false });
      row.appendChild(lEl);
      row.appendChild(vEl);
      standingCard.appendChild(row);
    });

    // Last results (up to 10)
    if (r.lastResults.length > 0) {
      const formWrap = document.createElement('div');
      formWrap.style.marginTop = '8px';

      const formLabel = document.createElement('div');
      formLabel.style.cssText = 'font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px;';
      formLabel.textContent = `Last ${r.lastResults.length} game${r.lastResults.length !== 1 ? 's' : ''}`;
      formWrap.appendChild(formLabel);

      const resultsRow = document.createElement('div');
      resultsRow.className = 'hub-result-row';
      r.lastResults.forEach(res => {
        const badge = document.createElement('span');
        badge.className = `badge badge-${res === 'W' ? 'win' : res === 'D' ? 'draw' : 'loss'}`;
        badge.textContent = res;
        resultsRow.appendChild(badge);
      });
      formWrap.appendChild(resultsRow);
      standingCard.appendChild(formWrap);
    }

    body.appendChild(standingCard);

    // Meters card
    const metersCard = document.createElement('div');
    metersCard.className = 'hub-card';
    const metersTitle = document.createElement('div');
    metersTitle.className = 'hub-card-title';
    metersTitle.textContent = 'Club Status';
    metersCard.appendChild(metersTitle);

    // Compute team strength: base from lineup average rating + accumulated bonus
    const starters = state.lineup
      .map(id => state.squad.find(p => p.id === id))
      .filter(Boolean);
    const avgRating = starters.length > 0
      ? starters.reduce((sum, p) => sum + p.rating, 0) / starters.length
      : 70;
    // Scale: rating 60 → 0%, 88 → 100%
    const baseStrength = Math.round(Utils.clamp((avgRating - 60) / 28 * 100, 0, 100));
    const teamStrength = Utils.clamp(baseStrength + (s.teamStrengthBonus || 0), 0, 100);

    const meters = [
      { label: 'Team Strength', val: teamStrength, cls: 'strength' },
      { label: 'Team Morale', key: 'teamMorale', cls: 'morale' },
      { label: 'Board Confidence', key: 'boardConfidence', cls: 'board' },
      { label: 'Media Reputation', key: 'mediaRep', cls: 'media' },
      { label: 'Fan Reputation', key: 'fanReputation', cls: 'fan' },
      { label: 'Star Happiness', key: 'starHappiness', cls: 'star' },
    ];

    const meterRow = document.createElement('div');
    meterRow.className = 'hub-meter-row';

    meters.forEach(m => {
      if (m.key === 'starHappiness' && s.starSold) return; // hide if sold
      const val = m.val !== undefined ? m.val : s[m.key];
      const item = document.createElement('div');
      item.className = 'hub-meter-item';

      const labelRow = document.createElement('div');
      labelRow.className = 'hub-meter-label-row';
      const nameEl = document.createElement('span');
      nameEl.className = 'hub-meter-name';
      nameEl.textContent = m.label;
      const valEl = document.createElement('span');
      valEl.className = 'hub-meter-val';
      valEl.textContent = `${val}%`;
      // Color the value
      if (val >= 70) valEl.style.color = 'var(--accent-green)';
      else if (val >= 40) valEl.style.color = 'var(--accent-gold)';
      else valEl.style.color = 'var(--accent-red)';
      labelRow.appendChild(nameEl);
      labelRow.appendChild(valEl);
      item.appendChild(labelRow);

      const barOuter = document.createElement('div');
      barOuter.className = 'meter-bar';
      const barFill = document.createElement('div');
      barFill.className = `meter-fill ${m.cls}`;
      barFill.style.width = `${val}%`;
      barOuter.appendChild(barFill);
      item.appendChild(barOuter);

      meterRow.appendChild(item);
    });
    metersCard.appendChild(meterRow);
    body.appendChild(metersCard);

    // Next event card
    if (nextEventLabel) {
      const nextCard = document.createElement('div');
      nextCard.className = 'hub-card';
      const nextTitle = document.createElement('div');
      nextTitle.className = 'hub-card-title';
      nextTitle.textContent = 'Up Next';
      nextCard.appendChild(nextTitle);

      const nextMatch = document.createElement('div');
      nextMatch.className = 'hub-next-match';
      const vsDiv = document.createElement('div');
      vsDiv.className = 'hub-next-match-vs';
      const vsName = document.createElement('div');
      vsName.className = 'hub-next-match-name';
      vsName.textContent = nextEventLabel;
      const vsDetail = document.createElement('div');
      vsDetail.className = 'hub-next-match-detail';
      vsDetail.textContent = nextEventDetail || '';
      vsDiv.appendChild(vsName);
      vsDiv.appendChild(vsDetail);
      nextMatch.appendChild(vsDiv);
      nextCard.appendChild(nextMatch);
      body.appendChild(nextCard);
    }

    // Competitions card (if any wins)
    if (r.competitionWins.length > 0) {
      const compCard = document.createElement('div');
      compCard.className = 'hub-card';
      const compTitle = document.createElement('div');
      compTitle.className = 'hub-card-title';
      compTitle.textContent = 'Trophies';
      compCard.appendChild(compTitle);
      r.competitionWins.forEach(win => {
        const row = document.createElement('div');
        row.className = 'hub-stat-row';
        row.style.cssText = 'display:flex;align-items:center;gap:10px';
        row.appendChild(Utils.mkTrophy(win, 'md'));
        const label = document.createElement('span');
        label.style.color = 'var(--accent-gold)';
        label.textContent = win;
        row.appendChild(label);
        compCard.appendChild(row);
      });
      body.appendChild(compCard);
    }

    div.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'hub-footer';

    const continueBtn = document.createElement('button');
    continueBtn.className = 'hub-btn-continue';
    continueBtn.textContent = 'Continue';
    continueBtn.addEventListener('click', () => Engine.runCurrentEvent());
    continueBtn.addEventListener('touchend', e => { e.preventDefault(); Engine.runCurrentEvent(); }, { passive: false });
    footer.appendChild(continueBtn);

    const squadBtn = document.createElement('button');
    squadBtn.className = 'hub-btn-icon';
    squadBtn.title = 'Squad';
    squadBtn.textContent = '👥';
    const onSquad = () => window.Game.Screens.Squad.render(() => Engine.showHub());
    squadBtn.addEventListener('click', onSquad);
    squadBtn.addEventListener('touchend', e => { e.preventDefault(); onSquad(); }, { passive: false });
    footer.appendChild(squadBtn);

    const calendarBtn = document.createElement('button');
    calendarBtn.className = 'hub-btn-icon';
    calendarBtn.title = 'Season Calendar';
    calendarBtn.textContent = '📅';
    calendarBtn.addEventListener('click', () => window.Game.Screens.Calendar.render());
    calendarBtn.addEventListener('touchend', e => { e.preventDefault(); window.Game.Screens.Calendar.render(); }, { passive: false });
    footer.appendChild(calendarBtn);


    div.appendChild(footer);

    Utils.render(div);
  }

  return { render };

})();
