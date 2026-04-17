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
      ['Budget', Utils.formatMoney(state.budget)],
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
      const details = r.lastResultDetails || [];
      r.lastResults.forEach((res, i) => {
        const badge = document.createElement('span');
        badge.className = `badge badge-${res === 'W' ? 'win' : res === 'D' ? 'draw' : 'loss'}`;
        badge.textContent = res;
        const d = details[i];
        if (d && d.opponent) {
          const score = (d.vGoals !== null && d.oGoals !== null) ? ` ${d.vGoals}–${d.oGoals}` : '';
          const comp  = d.competition && d.competition !== 'VPL' ? ` (${d.competition})` : '';
          badge.setAttribute('data-tooltip', `${d.opponent}${score}${comp}`);
          badge.addEventListener('touchstart', e => {
            e.stopPropagation();
            document.querySelectorAll('.badge.tooltip-active').forEach(b => b.classList.remove('tooltip-active'));
            badge.classList.add('tooltip-active');
          }, { passive: true });
        }
        resultsRow.appendChild(badge);
      });
      div.addEventListener('touchstart', () => {
        resultsRow.querySelectorAll('.badge.tooltip-active').forEach(b => b.classList.remove('tooltip-active'));
      }, { passive: true });
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

    const saveBtn = document.createElement('button');
    saveBtn.className = 'hub-btn-icon';
    saveBtn.title = 'Save game';
    saveBtn.textContent = '💾';
    const onSave = () => showSaveModal(div);
    saveBtn.addEventListener('click', onSave);
    saveBtn.addEventListener('touchend', e => { e.preventDefault(); onSave(); }, { passive: false });
    footer.appendChild(saveBtn);

    const loadBtn = document.createElement('button');
    loadBtn.className = 'hub-btn-icon';
    loadBtn.title = 'Load game';
    loadBtn.textContent = '📂';
    const onLoad = () => showLoadModal(div);
    loadBtn.addEventListener('click', onLoad);
    loadBtn.addEventListener('touchend', e => { e.preventDefault(); onLoad(); }, { passive: false });
    footer.appendChild(loadBtn);

    div.appendChild(footer);

    Utils.render(div);
  }

  function showSaveModal(container) {
    const existing = container.querySelector('.hub-load-backdrop');
    if (existing) existing.remove();

    const { State } = window.Game;
    const managerName = State.get().meta.managerName;

    const backdrop = document.createElement('div');
    backdrop.className = 'hub-load-backdrop';

    const modal = document.createElement('div');
    modal.className = 'hub-load-modal hub-save-modal';

    const header = document.createElement('div');
    header.className = 'hub-load-header';
    const headerTitle = document.createElement('div');
    headerTitle.className = 'hub-load-title';
    headerTitle.textContent = 'Save Game';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'hub-load-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => backdrop.remove());
    closeBtn.addEventListener('touchend', e => { e.preventDefault(); backdrop.remove(); }, { passive: false });
    header.appendChild(headerTitle);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    const body = document.createElement('div');
    body.className = 'hub-save-body';

    const label = document.createElement('div');
    label.className = 'hub-save-label';
    label.textContent = 'Save name';
    body.appendChild(label);

    const nameRow = document.createElement('div');
    nameRow.className = 'hub-save-name-row';

    const prefix = document.createElement('span');
    prefix.className = 'hub-save-prefix';
    prefix.textContent = managerName + '_';

    const input = document.createElement('input');
    input.className = 'hub-save-input';
    input.type = 'text';
    input.placeholder = 'e.g. AfterCup';
    input.maxLength = 24;
    // Sanitise as user types: only word chars, no spaces
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^a-zA-Z0-9_]/g, '');
    });

    nameRow.appendChild(prefix);
    nameRow.appendChild(input);
    body.appendChild(nameRow);

    const hint = document.createElement('div');
    hint.className = 'hub-save-hint';
    hint.textContent = 'Leave blank to overwrite your last save.';
    body.appendChild(hint);

    const saveConfirmBtn = document.createElement('button');
    saveConfirmBtn.className = 'btn-primary hub-save-confirm';
    saveConfirmBtn.textContent = '💾  Save';
    const doSave = () => {
      const suffix = input.value.trim();
      State.saveAs(suffix);
      backdrop.remove();
      showSaveToast(container);
    };
    saveConfirmBtn.addEventListener('click', doSave);
    saveConfirmBtn.addEventListener('touchend', e => { e.preventDefault(); doSave(); }, { passive: false });
    body.appendChild(saveConfirmBtn);

    modal.appendChild(body);
    backdrop.appendChild(modal);
    container.appendChild(backdrop);

    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.addEventListener('touchend', e => { if (e.target === backdrop) { e.preventDefault(); backdrop.remove(); } }, { passive: false });

    setTimeout(() => input.focus(), 50);
  }

  function showLoadModal(container) {
    // Remove any existing modal
    const existing = container.querySelector('.hub-load-backdrop');
    if (existing) existing.remove();

    const { State, Engine } = window.Game;
    const slots = State.listSlots();

    const backdrop = document.createElement('div');
    backdrop.className = 'hub-load-backdrop';

    const modal = document.createElement('div');
    modal.className = 'hub-load-modal';

    const header = document.createElement('div');
    header.className = 'hub-load-header';
    const headerTitle = document.createElement('div');
    headerTitle.className = 'hub-load-title';
    headerTitle.textContent = 'Load Game';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'hub-load-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => backdrop.remove());
    closeBtn.addEventListener('touchend', e => { e.preventDefault(); backdrop.remove(); }, { passive: false });
    header.appendChild(headerTitle);
    header.appendChild(closeBtn);
    modal.appendChild(header);

    if (slots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'hub-load-empty';
      empty.textContent = 'No saved games found.';
      modal.appendChild(empty);
    } else {
      slots.forEach(slot => {
        const card = document.createElement('div');
        card.className = 'hub-load-slot';

        const info = document.createElement('div');
        info.className = 'hub-load-slot-info';

        const name = document.createElement('div');
        name.className = 'hub-load-slot-name';
        name.textContent = slot.slotName || slot.managerName;

        const date = document.createElement('div');
        date.className = 'hub-load-slot-date';
        date.textContent = _fmtSlotDate(slot.savedAt);

        const progress = document.createElement('div');
        progress.className = 'hub-load-slot-progress';
        progress.textContent = _weekLabel(slot.week);

        info.appendChild(name);
        info.appendChild(date);
        info.appendChild(progress);

        const actions = document.createElement('div');
        actions.className = 'hub-load-slot-actions';

        const loadSlotBtn = document.createElement('button');
        loadSlotBtn.className = 'hub-load-slot-btn';
        loadSlotBtn.textContent = 'Load ›';
        const displayName = slot.slotName || slot.managerName;
        const doLoad = () => {
          if (confirm(`Load "${displayName}"? Any unsaved progress will be lost.`)) {
            State.loadSlot(slot.id);
            backdrop.remove();
            Engine.showHub();
          }
        };
        loadSlotBtn.addEventListener('click', doLoad);
        loadSlotBtn.addEventListener('touchend', e => { e.preventDefault(); doLoad(); }, { passive: false });

        const delBtn = document.createElement('button');
        delBtn.className = 'hub-load-slot-del';
        delBtn.textContent = '🗑';
        delBtn.title = 'Delete save';
        const doDel = () => {
          if (confirm(`Delete "${displayName}"? This cannot be undone.`)) {
            State.deleteSlot(slot.id);
            card.remove();
            if (modal.querySelectorAll('.hub-load-slot').length === 0) {
              const empty = document.createElement('div');
              empty.className = 'hub-load-empty';
              empty.textContent = 'No saved games found.';
              modal.appendChild(empty);
            }
          }
        };
        delBtn.addEventListener('click', doDel);
        delBtn.addEventListener('touchend', e => { e.preventDefault(); doDel(); }, { passive: false });

        actions.appendChild(loadSlotBtn);
        actions.appendChild(delBtn);
        card.appendChild(info);
        card.appendChild(actions);
        modal.appendChild(card);
      });
    }

    backdrop.appendChild(modal);
    container.appendChild(backdrop);

    // Dismiss on backdrop tap
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    backdrop.addEventListener('touchend', e => { if (e.target === backdrop) { e.preventDefault(); backdrop.remove(); } }, { passive: false });
  }

  function _fmtSlotDate(ts) {
    if (!ts) return 'Unknown date';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function _weekLabel(week) {
    if (!week || week === 0) return 'Pre-Season';
    if (week <= 12) return `Week ${week} · Early Season`;
    if (week <= 23) return `Week ${week} · Mid-Season`;
    if (week <= 30) return `Week ${week} · Run-In`;
    return `Week ${week} · Final Stretch`;
  }

  function showSaveToast(container) {
    // Remove any existing toast
    const existing = container.querySelector('.hub-save-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'hub-save-toast';
    toast.textContent = '✓ Game Saved';
    container.appendChild(toast);

    // Trigger animation: visible → fade out after delay
    requestAnimationFrame(() => {
      toast.classList.add('hub-save-toast-show');
      setTimeout(() => {
        toast.classList.add('hub-save-toast-hide');
        setTimeout(() => toast.remove(), 400);
      }, 1800);
    });
  }

  return { render };

})();
