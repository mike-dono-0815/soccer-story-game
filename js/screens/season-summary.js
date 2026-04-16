/* ============================================================
   SEASON SUMMARY SCREEN
   End-of-season overview: league position, W/D/L record,
   cup progression per competition, and top scorers.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.SeasonSummary = (function () {

  // ── Cup result display helpers ────────────────────────────────

  const CUP_ROUND_LABELS = {
    'qf':        'Quarter-Final',
    'sf':        'Semi-Final',
    'final':     'Final',
    'winner':    'Winners 🏆',
    'out_R1':    'Round 1',
    'out_QF':    'Quarter-Final',
    'out_SF':    'Semi-Final',
    'out_Final': 'Final',
    'group':     'Group Stage',
    'ko':        'Semi-Final',
    'out_Group': 'Group Stage',
    'out_KO':    'Semi-Final',
    'out_Final': 'Final',
    'qf':        'Quarter-Final',
    'sf':        'Semi-Final',
    'final':     'Final',
    'winner':    'Winners 🏆',
    'out_R16':   'Round of 16',
    'out_QF':    'Quarter-Final',
    'out_SF':    'Semi-Final',
  };

  function cupLabel(round) {
    if (!round) return 'Did not qualify';
    if (round === 'winner') return 'Winners';
    if (round.startsWith('out_')) return 'Out — ' + (CUP_ROUND_LABELS[round] || round.replace('out_', ''));
    return CUP_ROUND_LABELS[round] || round;
  }

  function cupIcon(round) {
    if (!round) return '—';
    if (round === 'winner') return '🏆';
    if (round.startsWith('out_')) return '❌';
    return '✓';  // still in / reached
  }

  // ── Top scorers ───────────────────────────────────────────────

  function getTopScorers(state, n) {
    const squad = state.squad || [];
    const stats = state.playerStats || {};

    return squad
      .map(p => ({
        id:    p.id,
        name:  p.name,
        goals: (stats[p.id] && stats[p.id].goals) || 0,
        apps:  (stats[p.id] && stats[p.id].apps)  || 0,
      }))
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals || b.apps - a.apps)
      .slice(0, n);
  }

  // ── Main render ───────────────────────────────────────────────

  function show(state, onDone) {
    const r = state.results;

    // League record
    const totalGames = r.vplWins + r.vplDraws + r.vplLosses;
    const points     = r.vplWins * 3 + r.vplDraws;

    // Ordinal suffix for position
    const pos = r.vplPosition || '?';
    const suffix = pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th';

    // Cup data
    const cups = [
      { name: 'FA Cup',         icon: '🏆', round: r.cupRound         },
      { name: 'Champions Cup',  icon: '⭐', round: r.championsRound    },
      { name: 'Club World Cup', icon: '🌍', round: r.worldRound        },
    ];

    const topScorers = getTopScorers(state, 5);

    // ── DOM ──────────────────────────────────────────────────────

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-season-summary screen-enter';

    // Header
    const header = document.createElement('div');
    header.className = 'ss-header';
    const headerTitle = document.createElement('div');
    headerTitle.className = 'ss-header-title';
    headerTitle.textContent = 'Season Review';
    const headerSub = document.createElement('div');
    headerSub.className = 'ss-header-sub';
    headerSub.textContent = 'FC Valhalla · End of Season';
    header.appendChild(headerTitle);
    header.appendChild(headerSub);
    screen.appendChild(header);

    // Scrollable content
    const content = document.createElement('div');
    content.className = 'ss-content';

    // ── League block ─────────────────────────────────────────────
    const leagueBlock = document.createElement('div');
    leagueBlock.className = 'ss-block';

    const leagueTitle = document.createElement('div');
    leagueTitle.className = 'ss-block-title';
    leagueTitle.textContent = 'Valorian Premier League';
    leagueBlock.appendChild(leagueTitle);

    const leaguePosRow = document.createElement('div');
    leaguePosRow.className = 'ss-position-row';
    const posNum = document.createElement('span');
    posNum.className = 'ss-pos-num';
    posNum.textContent = pos + suffix;
    const posLabel = document.createElement('span');
    posLabel.className = 'ss-pos-label';
    posLabel.textContent = 'Final Position';
    leaguePosRow.appendChild(posNum);
    leaguePosRow.appendChild(posLabel);
    leagueBlock.appendChild(leaguePosRow);

    const recordRow = document.createElement('div');
    recordRow.className = 'ss-record-row';
    [
      { val: r.vplWins,   label: 'W', cls: 'win'  },
      { val: r.vplDraws,  label: 'D', cls: 'draw' },
      { val: r.vplLosses, label: 'L', cls: 'loss' },
      { val: points,      label: 'Pts', cls: 'pts'},
    ].forEach(({ val, label, cls }) => {
      const cell = document.createElement('div');
      cell.className = 'ss-record-cell';
      const num = document.createElement('div');
      num.className = 'ss-record-num ' + cls;
      num.textContent = val;
      const lbl = document.createElement('div');
      lbl.className = 'ss-record-lbl';
      lbl.textContent = label;
      cell.appendChild(num);
      cell.appendChild(lbl);
      recordRow.appendChild(cell);
    });
    leagueBlock.appendChild(recordRow);
    content.appendChild(leagueBlock);

    // ── Cup block ─────────────────────────────────────────────────
    const cupBlock = document.createElement('div');
    cupBlock.className = 'ss-block';
    const cupTitle = document.createElement('div');
    cupTitle.className = 'ss-block-title';
    cupTitle.textContent = 'Cup Competitions';
    cupBlock.appendChild(cupTitle);

    cups.forEach(({ name, icon, round }) => {
      const row = document.createElement('div');
      row.className = 'ss-cup-row';
      const rowIcon = document.createElement('span');
      rowIcon.className = 'ss-cup-icon';
      rowIcon.textContent = icon;
      const rowName = document.createElement('span');
      rowName.className = 'ss-cup-name';
      rowName.textContent = name;
      const rowResult = document.createElement('span');
      rowResult.className = 'ss-cup-result' + (round === 'winner' ? ' winner' : round ? '' : ' none');
      rowResult.textContent = cupIcon(round) + ' ' + cupLabel(round);
      row.appendChild(rowIcon);
      row.appendChild(rowName);
      row.appendChild(rowResult);
      cupBlock.appendChild(row);
    });
    content.appendChild(cupBlock);

    // ── Top scorers block ─────────────────────────────────────────
    if (topScorers.length > 0) {
      const scorersBlock = document.createElement('div');
      scorersBlock.className = 'ss-block';
      const scorersTitle = document.createElement('div');
      scorersTitle.className = 'ss-block-title';
      scorersTitle.textContent = 'Top Scorers';
      scorersBlock.appendChild(scorersTitle);

      topScorers.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'ss-scorer-row';
        const rank = document.createElement('span');
        rank.className = 'ss-scorer-rank';
        rank.textContent = (i + 1) + '.';
        const name = document.createElement('span');
        name.className = 'ss-scorer-name';
        const _ssu = window.Game.Characters.getStickerUrl(p.id);
        if (_ssu) {
          const _sic = document.createElement('img');
          _sic.className = 'player-sticker-icon';
          _sic.src = _ssu;
          _sic.alt = '';
          name.appendChild(_sic);
        }
        name.appendChild(document.createTextNode(window.Game.Characters.getShortName(p)));
        const goals = document.createElement('span');
        goals.className = 'ss-scorer-goals';
        goals.textContent = p.goals + ' goals';
        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(goals);
        scorersBlock.appendChild(row);
      });
      content.appendChild(scorersBlock);
    }

    screen.appendChild(content);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'ss-footer';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'See Your Fate';
    btn.addEventListener('click', () => {
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); onDone(); }, 300);
    });
    btn.addEventListener('touchend', e => {
      e.preventDefault();
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); onDone(); }, 300);
    }, { passive: false });
    footer.appendChild(btn);
    screen.appendChild(footer);

    div.appendChild(screen);
    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);
  }

  return { show };

})();
