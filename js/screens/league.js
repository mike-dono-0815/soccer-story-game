/* ============================================================
   LEAGUE TABLE SCREEN — VPL standings
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.League = (function () {

  // Zone boundaries (positions, 1-based)
  const ZONE_CHAMP   = [1, 2];      // Champions Cup — blue left border
  const ZONE_EURO    = [3, 4, 5];   // Europa          — green left border
  const ZONE_REL     = [16, 17, 18]; // Relegation      — red left border

  function render(backFn) {
    const { State, Utils, LeagueSim } = window.Game;
    const state = State.get();
    const league = state.league;
    const round  = league ? league.round : 0;

    const table = (league && league.fixtures && round > 0)
      ? LeagueSim.computeTable(league.fixtures, round)
      : null;

    const valhallaPos = table
      ? table.findIndex(r => r.id === 'valhalla') + 1
      : null;

    const div = document.createElement('div');
    div.className = 'screen-league';

    // ── Header ──────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'league-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'league-back-btn';
    backBtn.textContent = '← Back';
    const onBack = () => backFn();
    backBtn.addEventListener('click', onBack);
    backBtn.addEventListener('touchend', e => { e.preventDefault(); onBack(); }, { passive: false });
    header.appendChild(backBtn);

    const titleWrap = document.createElement('div');
    titleWrap.style.flex = '1';
    const titleEl = document.createElement('div');
    titleEl.className = 'league-title';
    titleEl.textContent = 'VPL Table';
    const subtitleEl = document.createElement('div');
    subtitleEl.className = 'league-subtitle';
    subtitleEl.textContent = round > 0 ? `After Round ${round} of 34` : 'Season not started';
    titleWrap.appendChild(titleEl);
    titleWrap.appendChild(subtitleEl);
    header.appendChild(titleWrap);

    if (valhallaPos) {
      const posBadge = document.createElement('div');
      posBadge.className = 'league-pos-badge';
      posBadge.textContent = Utils.ordinal(valhallaPos);
      header.appendChild(posBadge);
    }

    div.appendChild(header);

    // ── Body ────────────────────────────────────────────────
    const body = document.createElement('div');
    body.className = 'league-body';

    if (!table) {
      const empty = document.createElement('div');
      empty.className = 'league-empty';
      empty.textContent = 'The season hasn\'t kicked off yet. Check back after the first match day.';
      body.appendChild(empty);
      div.appendChild(body);
      Utils.render(div);
      return;
    }

    // Column header
    const colHeader = document.createElement('div');
    colHeader.className = 'league-col-header';
    ['#', 'Club', 'P', 'W', 'D', 'L', 'GD', 'Pts'].forEach(label => {
      const cell = document.createElement('div');
      cell.className = `league-th${label === 'Club' ? ' league-th-name' : ''}`;
      cell.textContent = label;
      colHeader.appendChild(cell);
    });
    body.appendChild(colHeader);

    // Rows
    table.forEach((team, i) => {
      const pos = i + 1;
      const isValhalla = team.id === 'valhalla';

      const row = document.createElement('div');
      row.className = `league-row${isValhalla ? ' is-valhalla' : ''}`;

      if (ZONE_CHAMP.includes(pos))      row.classList.add('zone-champ');
      else if (ZONE_EURO.includes(pos))  row.classList.add('zone-euro');
      else if (ZONE_REL.includes(pos))   row.classList.add('zone-rel');

      const cells = [
        { val: pos,    cls: 'league-td-pos' },
        { val: isValhalla ? `★ ${team.name}` : team.name, cls: 'league-td-name' },
        { val: team.played, cls: 'league-td' },
        { val: team.won,    cls: 'league-td' },
        { val: team.drawn,  cls: 'league-td' },
        { val: team.lost,   cls: 'league-td' },
        { val: (team.gd >= 0 ? '+' : '') + team.gd, cls: `league-td league-td-gd${team.gd > 0 ? ' pos' : team.gd < 0 ? ' neg' : ''}` },
        { val: team.pts, cls: 'league-td league-td-pts' },
      ];

      cells.forEach(({ val, cls }) => {
        const cell = document.createElement('div');
        cell.className = cls;
        cell.textContent = val;
        row.appendChild(cell);
      });

      body.appendChild(row);

      // Divider between zones
      if (pos === 2 || pos === 5 || pos === 15) {
        const div2 = document.createElement('div');
        div2.className = 'league-zone-divider';
        body.appendChild(div2);
      }
    });

    // Legend
    const legend = document.createElement('div');
    legend.className = 'league-legend';
    [
      { cls: 'zone-champ', label: 'Champions Cup' },
      { cls: 'zone-euro',  label: 'Europa Cup' },
      { cls: 'zone-rel',   label: 'Relegation' },
    ].forEach(({ cls, label }) => {
      const item = document.createElement('div');
      item.className = 'league-legend-item';
      const dot = document.createElement('div');
      dot.className = `league-legend-dot ${cls}`;
      const lbl = document.createElement('span');
      lbl.textContent = label;
      item.appendChild(dot);
      item.appendChild(lbl);
      legend.appendChild(item);
    });
    body.appendChild(legend);

    div.appendChild(body);
    Utils.render(div);
  }

  return { render };

})();
