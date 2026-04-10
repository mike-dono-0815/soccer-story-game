/* ============================================================
   SQUAD OVERVIEW SCREEN — Player stats by position
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

    const div = document.createElement('div');
    div.className = 'screen-squad';

    // Header
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

    // Legend row
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
    div.appendChild(legend);

    // Body
    const body = document.createElement('div');
    body.className = 'squad-body';

    GROUPS.forEach(group => {
      const players = state.squad
        .filter(p => group.positions.includes(p.position))
        .sort((a, b) => {
          // starters first, then by rating
          const aS = starterSet.has(a.id) ? 0 : 1;
          const bS = starterSet.has(b.id) ? 0 : 1;
          return aS !== bS ? aS - bS : b.rating - a.rating;
        });

      if (players.length === 0) return;

      const groupHeader = document.createElement('div');
      groupHeader.className = 'squad-group-label';
      groupHeader.textContent = group.label;
      body.appendChild(groupHeader);

      players.forEach(p => {
        body.appendChild(buildCard(p, starterSet.has(p.id)));
      });
    });

    div.appendChild(body);
    Utils.render(div);
  }

  function buildCard(player, isStarter) {
    const card = document.createElement('div');
    card.className = `squad-card${isStarter ? ' starter' : ''}`;

    // Top row: name / position badge / age / rating
    const top = document.createElement('div');
    top.className = 'squad-card-top';

    const starterDot = document.createElement('div');
    starterDot.className = `squad-starter-dot ${isStarter ? 'on' : 'off'}`;
    top.appendChild(starterDot);

    const nameEl = document.createElement('div');
    nameEl.className = 'squad-card-name';
    nameEl.textContent = player.name;
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

    // Stat bars
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

  return { render };

})();
