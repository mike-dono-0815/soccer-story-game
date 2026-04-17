/* ============================================================
   TRANSITION SCREEN — Narrative interstitial card
   Tap anywhere to dismiss and proceed to the next scene.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Transition = (function () {

  function show(transition, onDone) {
    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-transition screen-enter';

    // Background accent strip (top)
    const accent = document.createElement('div');
    accent.className = 'transition-accent';
    screen.appendChild(accent);

    // Content card
    const card = document.createElement('div');
    card.className = 'transition-card';

    // Trophy / icon
    if (transition.icon) {
      const iconEl = document.createElement('div');
      iconEl.className = 'transition-icon';
      iconEl.textContent = transition.icon;
      card.appendChild(iconEl);
    }

    // Location label
    if (transition.location) {
      const loc = document.createElement('div');
      loc.className = 'transition-location';
      loc.textContent = transition.location;
      card.appendChild(loc);

      const rule = document.createElement('div');
      rule.className = 'transition-rule';
      card.appendChild(rule);
    }

    // Narrative text
    const text = document.createElement('p');
    text.className = 'transition-text';
    text.textContent = transition.text;
    card.appendChild(text);

    screen.appendChild(card);

    // Tap hint
    const hint = document.createElement('div');
    hint.className = 'transition-hint';
    hint.textContent = 'tap anywhere to continue';
    screen.appendChild(hint);

    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      screen.classList.add('screen-exit');
      setTimeout(() => {
        div.remove();
        if (onDone) onDone();
      }, 300);
    }

    screen.addEventListener('click', dismiss);
    screen.addEventListener('touchend', function (e) {
      e.preventDefault();
      dismiss();
    }, { passive: false });
  }

  return { show };

})();
