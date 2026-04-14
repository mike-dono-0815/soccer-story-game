/* ============================================================
   LEAGUE TABLE SCREEN — VPL standings + league scorer stats
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
    const playerStats = state.playerStats || {};

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
    titleEl.textContent = 'VPL';
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

    // ── Tabs ─────────────────────────────────────────────────
    const tabs = document.createElement('div');
    tabs.className = 'screen-tabs';
    const tableTabBtn = document.createElement('button');
    tableTabBtn.className = 'screen-tab-btn active';
    tableTabBtn.textContent = 'Table';
    const statsTabBtn = document.createElement('button');
    statsTabBtn.className = 'screen-tab-btn';
    statsTabBtn.textContent = 'Stats';
    tabs.appendChild(tableTabBtn);
    tabs.appendChild(statsTabBtn);
    div.appendChild(tabs);

    // ── Table Pane ───────────────────────────────────────────
    const tablePane = document.createElement('div');
    tablePane.className = 'tab-pane';

    const tableBody = document.createElement('div');
    tableBody.className = 'league-body';

    if (!table) {
      const empty = document.createElement('div');
      empty.className = 'league-empty';
      empty.textContent = 'The season hasn\'t kicked off yet. Check back after the first match day.';
      tableBody.appendChild(empty);
    } else {
      // Column header
      const colHeader = document.createElement('div');
      colHeader.className = 'league-col-header';
      ['#', 'Club', 'P', 'W', 'D', 'L', 'GD', 'Pts'].forEach(label => {
        const cell = document.createElement('div');
        cell.className = `league-th${label === 'Club' ? ' league-th-name' : ''}`;
        cell.textContent = label;
        colHeader.appendChild(cell);
      });
      tableBody.appendChild(colHeader);

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

        tableBody.appendChild(row);

        if (pos === 2 || pos === 5 || pos === 15) {
          const div2 = document.createElement('div');
          div2.className = 'league-zone-divider';
          tableBody.appendChild(div2);
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
      tableBody.appendChild(legend);
    }

    tablePane.appendChild(tableBody);
    div.appendChild(tablePane);

    // ── Stats Pane ───────────────────────────────────────────
    const statsPane = document.createElement('div');
    statsPane.className = 'tab-pane hidden';
    const statsScroll = document.createElement('div');
    statsScroll.className = 'stat-table-wrap';
    statsPane.appendChild(statsScroll);
    buildStatsTable(statsScroll, state.squad, playerStats, true);
    div.appendChild(statsPane);

    // ── Tab Switching ────────────────────────────────────────
    function switchTab(showStats) {
      tableTabBtn.classList.toggle('active', !showStats);
      statsTabBtn.classList.toggle('active', showStats);
      tablePane.classList.toggle('hidden', showStats);
      statsPane.classList.toggle('hidden', !showStats);
    }
    const onTable = () => switchTab(false);
    const onStats  = () => switchTab(true);
    tableTabBtn.addEventListener('click', onTable);
    tableTabBtn.addEventListener('touchend', e => { e.preventDefault(); onTable(); }, { passive: false });
    statsTabBtn.addEventListener('click', onStats);
    statsTabBtn.addEventListener('touchend', e => { e.preventDefault(); onStats(); }, { passive: false });

    Utils.render(div);
  }

  // ── Sortable Stats Table (league games only) ──────────────

  function buildStatsTable(scrollEl, players, playerStats, isLeague) {
    const appsKey    = isLeague ? 'leagueApps'    : 'apps';
    const goalsKey   = isLeague ? 'leagueGoals'   : 'goals';
    const assistsKey = isLeague ? 'leagueAssists' : 'assists';
    const potmKey    = isLeague ? 'leaguePotm'    : 'potm';

    let sortKey = goalsKey;
    let sortDir = 'desc';

    const COLS = [
      { key: null,         label: '#',    wide: false },
      { key: 'name',       label: 'Name', wide: true  },
      { key: 'pos',        label: 'Pos',  wide: false },
      { key: appsKey,      label: 'GP',   wide: false },
      { key: goalsKey,     label: 'G',    wide: false },
      { key: assistsKey,   label: 'A',    wide: false },
      { key: potmKey,      label: 'POTM', wide: false },
    ];

    function getStat(pid, key) {
      return (playerStats[pid] || {})[key] || 0;
    }

    const activePlayers = players.filter(p => getStat(p.id, appsKey) > 0);

    function refresh() {
      scrollEl.innerHTML = '';

      if (activePlayers.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'stat-empty';
        empty.textContent = 'No VPL matches played yet. Check back after your first league fixture.';
        scrollEl.appendChild(empty);
        return;
      }

      // Sticky column header
      const colHead = document.createElement('div');
      colHead.className = 'stat-col-header';
      COLS.forEach(col => {
        const th = document.createElement('div');
        const active = col.key === sortKey;
        th.className = `stat-th${col.wide ? ' stat-th-name' : ''}${active ? ' sort-active' : ''}`;
        th.textContent = col.label + (active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '');
        if (col.key) {
          th.addEventListener('click', () => {
            if (sortKey === col.key) {
              sortDir = sortDir === 'desc' ? 'asc' : 'desc';
            } else {
              sortKey = col.key;
              sortDir = 'desc';
            }
            refresh();
          });
        }
        colHead.appendChild(th);
      });
      scrollEl.appendChild(colHead);

      // Sort
      const sorted = [...activePlayers].sort((a, b) => {
        if (sortKey === 'name') return sortDir === 'asc'
          ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        if (sortKey === 'pos') return sortDir === 'asc'
          ? a.position.localeCompare(b.position) : b.position.localeCompare(a.position);
        const av = getStat(a.id, sortKey), bv = getStat(b.id, sortKey);
        if (av !== bv) return sortDir === 'asc' ? av - bv : bv - av;
        if (sortKey !== goalsKey) {
          const gd = getStat(b.id, goalsKey) - getStat(a.id, goalsKey);
          if (gd !== 0) return gd;
        }
        return b.rating - a.rating;
      });

      // Rows
      sorted.forEach((player, i) => {
        const s = playerStats[player.id] || {};
        const row = document.createElement('div');
        row.className = 'stat-row';

        const rankEl = document.createElement('div');
        rankEl.className = 'stat-td-rank';
        rankEl.textContent = i + 1;
        row.appendChild(rankEl);

        const nameEl = document.createElement('div');
        nameEl.className = 'stat-td-name';
        nameEl.textContent = player.name;
        row.appendChild(nameEl);

        const posEl = document.createElement('div');
        posEl.className = 'stat-td-pos';
        posEl.textContent = player.position;
        row.appendChild(posEl);

        [
          { key: appsKey,    gold: false },
          { key: goalsKey,   gold: true  },
          { key: assistsKey, gold: false },
          { key: potmKey,    gold: true  },
        ].forEach(({ key, gold }) => {
          const cell = document.createElement('div');
          const val = s[key] || 0;
          cell.className = `stat-td${sortKey === key ? ' highlight' : ''}${gold && val > 0 ? ' gold' : ''}`;
          cell.textContent = val;
          row.appendChild(cell);
        });

        scrollEl.appendChild(row);
      });
    }

    refresh();
  }

  return { render };

})();
