/* ============================================================
   KNOCKOUT TRANSITION SCREEN
   Shown when Valhalla are eliminated from a cup competition.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.KnockoutTransition = (function () {

  const COMP_ICONS = {
    'FA Cup':         '🏆',
    'Champions Cup':  '⭐',
    'Club World Cup': '🌍',
  };

  function show(scene, onDone) {
    const icon = COMP_ICONS[scene.competition] || '⚽';

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-knockout-transition screen-enter';

    // Tap hint
    const hint = document.createElement('div');
    hint.className = 'scene-tap-hint';
    hint.textContent = 'tap anywhere to continue';
    screen.appendChild(hint);

    // Icon
    const iconEl = document.createElement('div');
    iconEl.className = 'kt-icon';
    iconEl.textContent = icon;
    screen.appendChild(iconEl);

    // Competition + round label
    const label = document.createElement('div');
    label.className = 'kt-label';
    label.textContent = scene.competition;
    screen.appendChild(label);

    const roundEl = document.createElement('div');
    roundEl.className = 'kt-round';
    roundEl.textContent = scene.round + ' — Eliminated';
    screen.appendChild(roundEl);

    // Lines
    const linesWrap = document.createElement('div');
    linesWrap.className = 'kt-lines';
    (scene.lines || []).forEach(text => {
      const p = document.createElement('p');
      p.className = 'kt-line';
      p.textContent = text;
      linesWrap.appendChild(p);
    });
    screen.appendChild(linesWrap);

    // Footer button
    const footer = document.createElement('div');
    footer.className = 'kt-footer';
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.textContent = 'Continue Season';
    btn.addEventListener('click', dismiss);
    btn.addEventListener('touchend', e => { e.preventDefault(); dismiss(); }, { passive: false });
    footer.appendChild(btn);
    screen.appendChild(footer);

    div.appendChild(screen);
    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);

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
