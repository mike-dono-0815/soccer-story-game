/* ============================================================
   CUPS SCREEN — Progressive bracket/group revelation
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Cups = (function () {

  const TAB_LABELS = { fa: 'FA Cup', champ: 'Champions', world: 'World Cup' };
  const { groupStandings, getTeamName } = window.Game.CupSim;

  // ── Entry point ───────────────────────────────────────────────

  function render(startTab, backFn) {
    const { State, Utils } = window.Game;
    const cups = State.get().cups;

    const div = document.createElement('div');
    div.className = 'screen-cups';

    // Header
    const header = document.createElement('div');
    header.className = 'cups-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'cups-back-btn';
    backBtn.textContent = '← Back';
    const onBack = () => backFn();
    backBtn.addEventListener('click', onBack);
    backBtn.addEventListener('touchend', e => { e.preventDefault(); onBack(); }, { passive: false });
    header.appendChild(backBtn);
    const titleEl = document.createElement('div');
    titleEl.className = 'cups-title';
    titleEl.textContent = 'Competitions';
    header.appendChild(titleEl);
    div.appendChild(header);

    // Tabs
    const tabBar = document.createElement('div');
    tabBar.className = 'cups-tabs';
    const tabIds = ['fa', 'champ', 'world'];
    let activeTab = startTab || 'fa';

    const body = document.createElement('div');
    body.className = 'cups-body';

    function showTab(tab) {
      activeTab = tab;
      tabBar.querySelectorAll('.cups-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
      });
      body.innerHTML = '';
      if (!cups) {
        const msg = document.createElement('div');
        msg.className = 'cups-empty';
        msg.textContent = 'Cup data not available.';
        body.appendChild(msg);
        return;
      }
      const trophyHeader = document.createElement('div');
      trophyHeader.className = 'cups-trophy-header';
      trophyHeader.appendChild(window.Game.Utils.mkTrophy(tab, 'sm'));
      body.appendChild(trophyHeader);

      if (tab === 'fa')    renderFA(body, cups.fa);
      if (tab === 'champ') renderChamp(body, cups.champ);
      if (tab === 'world') renderWorld(body, cups.world);
    }

    tabIds.forEach(tab => {
      const btn = document.createElement('button');
      btn.className = 'cups-tab';
      btn.dataset.tab = tab;
      btn.textContent = TAB_LABELS[tab];
      const onTab = () => showTab(tab);
      btn.addEventListener('click', onTab);
      btn.addEventListener('touchend', e => { e.preventDefault(); onTab(); }, { passive: false });
      tabBar.appendChild(btn);
    });

    div.appendChild(tabBar);
    div.appendChild(body);
    Utils.render(div);
    showTab(activeTab);
  }

  // ── FA Cup ────────────────────────────────────────────────────

  function renderFA(body, fa) {
    const ORDER  = ['R1', 'QF', 'SF', 'Final'];
    const LABELS = { R1: 'Round 1', QF: 'Quarter-Final', SF: 'Semi-Final', Final: 'Final' };

    for (const key of ORDER) {
      const matches = fa.rounds[key];
      const vm = matches.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
      if (!vm) break; // Valhalla not in this round — eliminated earlier

      if (!vm.played) {
        // Current round: show draw (no scores revealed yet)
        body.appendChild(roundSection(LABELS[key], 'draw', matches));
        break;
      }

      // Round complete: reveal all results
      body.appendChild(roundSection(LABELS[key], 'results', matches));

      if (vm.winnerId !== 'valhalla') {
        body.appendChild(eliminatedBanner(LABELS[key]));
        break;
      }
      // Won — loop to next round
    }
  }

  // ── Champions Cup ─────────────────────────────────────────────

  function renderChamp(body, ch) {
    const GRP_A_IDS = ['valhalla', 'bayern_klauss', 'sporting_lisora', 'fc_aurora'];

    // Group stage: show only Valhalla's matches + full group standings
    const valGroupMatches = ch.groupA.filter(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    const allValPlayed    = valGroupMatches.every(m => m.played);

    const grpSec = document.createElement('div');
    grpSec.className = 'cups-section';
    grpSec.appendChild(sectionTitle('Group Stage', allValPlayed ? 'results' : 'draw'));

    // Only Valhalla's fixtures
    valGroupMatches.forEach(m => grpSec.appendChild(matchRow(m, m.played ? 'results' : 'draw')));

    // Standings (computed from all group A fixtures including simulated)
    if (ch.groupA.some(m => m.played)) {
      grpSec.appendChild(standingsTable(groupStandings(ch.groupA, GRP_A_IDS)));
    }

    // Qualification line
    const qualLine = document.createElement('div');
    qualLine.className = 'cups-qual-info';
    qualLine.textContent = 'Top 2 advance to the Semi-Final';
    grpSec.appendChild(qualLine);

    body.appendChild(grpSec);

    if (!allValPlayed) return;

    // Check qualification
    const topTwo = groupStandings(ch.groupA, GRP_A_IDS).slice(0, 2).map(t => t.id);
    if (!topTwo.includes('valhalla')) {
      body.appendChild(eliminatedBanner('Group Stage'));
      return;
    }

    // KO round
    const koVm = ch.KO.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!koVm) return;
    if (!koVm.played) {
      body.appendChild(roundSection('Semi-Final', 'draw', ch.KO));
      return;
    }
    body.appendChild(roundSection('Semi-Final', 'results', ch.KO));
    if (koVm.winnerId !== 'valhalla') {
      body.appendChild(eliminatedBanner('Semi-Final'));
      return;
    }

    // Final
    const fVm = ch.Final[0];
    if (!fVm) return;
    body.appendChild(roundSection('Final', fVm.played ? 'results' : 'draw', ch.Final));
    if (fVm.played && fVm.winnerId !== 'valhalla') {
      body.appendChild(eliminatedBanner('Final'));
    }
  }

  // ── World Championship ────────────────────────────────────────

  function renderWorld(body, wo) {
    const sfVm = wo.SF.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!sfVm) return;

    if (!sfVm.played) {
      body.appendChild(roundSection('Semi-Final', 'draw', wo.SF));
      return;
    }
    body.appendChild(roundSection('Semi-Final', 'results', wo.SF));
    if (sfVm.winnerId !== 'valhalla') {
      body.appendChild(eliminatedBanner('Semi-Final'));
      return;
    }

    const fVm = wo.Final[0];
    if (!fVm) return;
    const finalMode = fVm.played ? 'results' : 'draw';
    body.appendChild(roundSection('Final', finalMode, wo.Final));
    if (fVm.played && fVm.winnerId !== 'valhalla') {
      body.appendChild(eliminatedBanner('Final'));
    }
  }

  // ── Section builders ──────────────────────────────────────────

  // KO/round section: all matches shown in same mode (draw or results)
  function roundSection(label, mode, matches) {
    const sec = document.createElement('div');
    sec.className = 'cups-section';

    sec.appendChild(sectionTitle(label, mode));
    matches.forEach(m => sec.appendChild(matchRow(m, mode)));
    return sec;
  }

  function sectionTitle(label, mode) {
    const el = document.createElement('div');
    el.className = 'cups-section-title';
    const text = document.createElement('span');
    text.textContent = label;
    const badge = document.createElement('span');
    badge.className = 'cups-round-badge ' + (mode === 'draw' ? 'badge-draw' : 'badge-results');
    badge.textContent = mode === 'draw' ? 'Draw' : 'Results';
    el.appendChild(text);
    el.appendChild(badge);
    return el;
  }

  function matchRow(m, mode) {
    const isVal = m.homeId === 'valhalla' || m.awayId === 'valhalla';
    const el = document.createElement('div');
    el.className = 'cups-match' + (isVal ? ' cups-valhalla' : '');

    const homeName = getTeamName(m.homeId);
    const awayName = getTeamName(m.awayId);

    if (mode === 'draw') {
      el.innerHTML = `
        <span class="cups-team ${m.homeId === 'valhalla' ? 'cups-team-us' : ''}">${homeName}</span>
        <span class="cups-score cups-score-vs">vs</span>
        <span class="cups-team ${m.awayId === 'valhalla' ? 'cups-team-us' : ''}">${awayName}</span>
      `;
    } else {
      const hG = m.homeGoals ?? '–';
      const aG = m.awayGoals ?? '–';
      const hWin = m.winnerId === m.homeId;
      const aWin = m.winnerId === m.awayId;
      el.innerHTML = `
        <span class="cups-team ${m.homeId === 'valhalla' ? 'cups-team-us' : ''} ${hWin ? 'cups-team-won' : ''}">${homeName}</span>
        <span class="cups-score">${hG} – ${aG}</span>
        <span class="cups-team ${m.awayId === 'valhalla' ? 'cups-team-us' : ''} ${aWin ? 'cups-team-won' : ''}">${awayName}</span>
      `;
    }

    return el;
  }

  function standingsTable(standings) {
    const tbl = document.createElement('div');
    tbl.className = 'cups-group-table';

    const hdr = document.createElement('div');
    hdr.className = 'cups-group-hdr';
    hdr.innerHTML = '<span class="cups-g-name">Club</span><span>P</span><span>W</span><span>D</span><span>L</span><span>GD</span><span class="bold">Pts</span>';
    tbl.appendChild(hdr);

    standings.forEach((row, i) => {
      const r = document.createElement('div');
      r.className = 'cups-group-row'
        + (row.id === 'valhalla' ? ' cups-group-us' : '')
        + (i < 2 ? ' cups-group-qualify' : '');

      const nameEl = document.createElement('span');
      nameEl.className = 'cups-g-name';
      nameEl.textContent = (i < 2 ? '↑ ' : '') + getTeamName(row.id);
      r.appendChild(nameEl);

      [row.played, row.w, row.d, row.l,
       (row.gd >= 0 ? '+' : '') + row.gd, row.pts].forEach((v, vi) => {
        const c = document.createElement('span');
        c.textContent = v;
        if (vi === 5) c.className = 'bold';
        r.appendChild(c);
      });

      tbl.appendChild(r);
    });

    return tbl;
  }

  function eliminatedBanner(round) {
    const el = document.createElement('div');
    el.className = 'cups-eliminated';
    el.innerHTML = `<span class="elim-icon">✗</span> Knocked out — ${round}`;
    return el;
  }

  return { render };

})();
