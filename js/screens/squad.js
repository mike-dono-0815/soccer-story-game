/* ============================================================
   SQUAD OVERVIEW SCREEN — Player roster + season stats
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Squad = (function () {

  const GROUPS = [
    { label: 'Goalkeepers', positions: ['GK'] },
    { label: 'Defenders',   positions: ['CB', 'RB', 'LB', 'RWB', 'LWB'] },
    { label: 'Midfielders', positions: ['CM', 'DM', 'CAM', 'LM', 'RM', 'AM'] },
    { label: 'Forwards',    positions: ['ST', 'CF', 'LW', 'RW', 'SS'] },
  ];

  const STATS = [
    { label: 'STR', key: 'str', cls: 'stat-str' },
    { label: 'MID', key: 'mid', cls: 'stat-mid' },
    { label: 'DEF', key: 'def', cls: 'stat-def' },
    { label: 'GK',  key: 'gk',  cls: 'stat-gk'  },
  ];

  function render(backFn) {
    const { State, Utils } = window.Game;
    const state = State.get();
    const starterSet = new Set(state.lineup);
    const playerStats = state.playerStats || {};

    const div = document.createElement('div');
    div.className = 'screen-squad';

    // ── Header ──────────────────────────────────────────────
    const header = document.createElement('div');
    header.className = 'squad-header';

    const backBtn = document.createElement('button');
    backBtn.className = 'squad-back-btn';
    backBtn.textContent = '← Back';
    const onBack = () => backFn();
    backBtn.addEventListener('click', onBack);
    backBtn.addEventListener('touchend', e => { e.preventDefault(); onBack(); }, { passive: false });
    header.appendChild(backBtn);

    const titleWrap = document.createElement('div');
    titleWrap.style.flex = '1';
    const titleEl = document.createElement('div');
    titleEl.className = 'squad-title';
    titleEl.textContent = 'Squad';
    const countEl = document.createElement('div');
    countEl.className = 'squad-subtitle';
    countEl.textContent = `${state.squad.length} players · 11 starters`;
    titleWrap.appendChild(titleEl);
    titleWrap.appendChild(countEl);
    header.appendChild(titleWrap);
    div.appendChild(header);

    // ── Tabs ─────────────────────────────────────────────────
    const tabs = document.createElement('div');
    tabs.className = 'screen-tabs';
    const playersTabBtn = document.createElement('button');
    playersTabBtn.className = 'screen-tab-btn active';
    playersTabBtn.textContent = 'Players';
    const statsTabBtn = document.createElement('button');
    statsTabBtn.className = 'screen-tab-btn';
    statsTabBtn.textContent = 'Stats';
    tabs.appendChild(playersTabBtn);
    tabs.appendChild(statsTabBtn);
    div.appendChild(tabs);

    // ── Players Pane ─────────────────────────────────────────
    const playersPane = document.createElement('div');
    playersPane.className = 'tab-pane';

    const legend = document.createElement('div');
    legend.className = 'squad-legend';
    STATS.forEach(s => {
      const item = document.createElement('div');
      item.className = 'squad-legend-item';
      const dot = document.createElement('div');
      dot.className = `squad-legend-dot ${s.cls}`;
      const lbl = document.createElement('span');
      lbl.textContent = s.label === 'GK' ? 'Goalkeeping' :
                        s.label === 'DEF' ? 'Defending' :
                        s.label === 'MID' ? 'Midfield' : 'Attacking';
      item.appendChild(dot);
      item.appendChild(lbl);
      legend.appendChild(item);
    });
    playersPane.appendChild(legend);

    const body = document.createElement('div');
    body.className = 'squad-body';
    GROUPS.forEach(group => {
      const players = state.squad
        .filter(p => group.positions.includes(p.position))
        .sort((a, b) => {
          const aS = starterSet.has(a.id) ? 0 : 1;
          const bS = starterSet.has(b.id) ? 0 : 1;
          return aS !== bS ? aS - bS : b.rating - a.rating;
        });
      if (players.length === 0) return;
      const groupHeader = document.createElement('div');
      groupHeader.className = 'squad-group-label';
      groupHeader.textContent = group.label;
      body.appendChild(groupHeader);
      players.forEach(p => body.appendChild(buildCard(p, starterSet.has(p.id))));
    });
    playersPane.appendChild(body);
    div.appendChild(playersPane);

    // ── Stats Pane ───────────────────────────────────────────
    const statsPane = document.createElement('div');
    statsPane.className = 'tab-pane hidden';
    const statsScroll = document.createElement('div');
    statsScroll.className = 'stat-table-wrap';
    statsPane.appendChild(statsScroll);
    buildStatsTable(statsScroll, state.squad, playerStats, false);
    div.appendChild(statsPane);

    // ── Tab Switching ────────────────────────────────────────
    function switchTab(showStats) {
      playersTabBtn.classList.toggle('active', !showStats);
      statsTabBtn.classList.toggle('active', showStats);
      playersPane.classList.toggle('hidden', showStats);
      statsPane.classList.toggle('hidden', !showStats);
    }
    const onPlayers = () => switchTab(false);
    const onStats   = () => switchTab(true);
    playersTabBtn.addEventListener('click', onPlayers);
    playersTabBtn.addEventListener('touchend', e => { e.preventDefault(); onPlayers(); }, { passive: false });
    statsTabBtn.addEventListener('click', onStats);
    statsTabBtn.addEventListener('touchend', e => { e.preventDefault(); onStats(); }, { passive: false });

    Utils.render(div);
  }

  // ── Player Card (attribute bars) ──────────────────────────

  function buildCard(player, isStarter) {
    const card = document.createElement('div');
    card.className = `squad-card${isStarter ? ' starter' : ''}`;

    const top = document.createElement('div');
    top.className = 'squad-card-top';

    const starterDot = document.createElement('div');
    starterDot.className = `squad-starter-dot ${isStarter ? 'on' : 'off'}`;
    top.appendChild(starterDot);

    const nameEl = document.createElement('div');
    nameEl.className = 'squad-card-name';
    const _sUrl = window.Game.Characters.getStickerUrl(player.id);
    if (_sUrl) {
      const _icon = document.createElement('img');
      _icon.className = 'player-sticker-icon';
      _icon.src = _sUrl;
      _icon.alt = '';
      nameEl.appendChild(_icon);
    }
    nameEl.appendChild(document.createTextNode(window.Game.Characters.getShortName(player)));
    top.appendChild(nameEl);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'squad-card-right';

    const posBadge = document.createElement('span');
    posBadge.className = 'squad-pos-badge';
    posBadge.textContent = player.position;
    rightGroup.appendChild(posBadge);

    const ageEl = document.createElement('span');
    ageEl.className = 'squad-age';
    ageEl.textContent = player.age;
    rightGroup.appendChild(ageEl);

    const ratingEl = document.createElement('div');
    ratingEl.className = 'squad-rating';
    ratingEl.textContent = player.rating;
    rightGroup.appendChild(ratingEl);

    top.appendChild(rightGroup);
    card.appendChild(top);

    const statsRow = document.createElement('div');
    statsRow.className = 'squad-stats';

    STATS.forEach(({ label, key, cls }) => {
      const val = player[key] || 0;
      const pct = Math.min(100, val);

      const statWrap = document.createElement('div');
      statWrap.className = 'squad-stat';

      const statTop = document.createElement('div');
      statTop.className = 'squad-stat-top';

      const labelEl = document.createElement('span');
      labelEl.className = 'squad-stat-label';
      labelEl.textContent = label;
      statTop.appendChild(labelEl);

      const valEl = document.createElement('span');
      valEl.className = `squad-stat-val ${cls}${val < 15 ? ' dim' : ''}`;
      valEl.textContent = val;
      statTop.appendChild(valEl);

      statWrap.appendChild(statTop);

      const track = document.createElement('div');
      track.className = 'squad-stat-track';
      const fill = document.createElement('div');
      fill.className = `squad-stat-fill ${cls}`;
      fill.style.width = `${pct}%`;
      track.appendChild(fill);
      statWrap.appendChild(track);

      statsRow.appendChild(statWrap);
    });

    card.appendChild(statsRow);
    return card;
  }

  // ── Sortable Stats Table ───────────────────────────────────

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
        empty.textContent = isLeague
          ? 'No league matches played yet. Check back after your first VPL fixture.'
          : 'No matches played yet. Stats will appear here after your first game.';
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
        const _sUrl2 = window.Game.Characters.getStickerUrl(player.id);
        if (_sUrl2) {
          const _icon2 = document.createElement('img');
          _icon2.className = 'player-sticker-icon';
          _icon2.src = _sUrl2;
          _icon2.alt = '';
          nameEl.appendChild(_icon2);
        }
        nameEl.appendChild(document.createTextNode(window.Game.Characters.getShortName(player)));
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
