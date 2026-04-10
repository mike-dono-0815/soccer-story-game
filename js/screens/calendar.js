/* ============================================================
   CALENDAR SCREEN — Season timeline view
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Calendar = (function () {

  function render() {
    const { State, Utils, Engine, StoryData } = window.Game;
    const state = State.get();
    const events = StoryData.events;
    const currentIdx = state.progress.currentEventIndex;

    const div = document.createElement('div');
    div.className = 'screen-calendar';

    // Header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    const title = document.createElement('div');
    title.style.fontSize = '17px';
    title.style.fontWeight = '700';
    title.textContent = 'Season Calendar';
    const sub = document.createElement('div');
    sub.style.fontSize = '12px';
    sub.style.color = 'var(--text-muted)';
    sub.style.marginTop = '2px';
    sub.textContent = `Event ${currentIdx + 1} of ${events.length}`;
    header.appendChild(title);
    header.appendChild(sub);
    div.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'calendar-body';

    const phases = {
      preseason:  { label: 'Pre-Season',           events: [] },
      league:     { label: 'League Season',         events: [] },
      cups:       { label: 'FA Cup & Champions Cup',events: [] },
      worlds:     { label: 'Club World Cup',         events: [] },
    };

    events.forEach((ev, i) => {
      const phase = ev.phase || 'league';
      if (phases[phase]) phases[phase].events.push({ ev, i });
    });

    Object.values(phases).forEach(phase => {
      if (phase.events.length === 0) return;

      const phaseLabel = document.createElement('div');
      phaseLabel.className = 'calendar-phase-label';
      phaseLabel.textContent = phase.label;
      body.appendChild(phaseLabel);

      phase.events.forEach(({ ev, i }) => {
        const item = document.createElement('div');
        item.className = `calendar-event-item ${i === currentIdx ? 'current' : i < currentIdx ? 'done' : ''}`;

        const week = document.createElement('div');
        week.className = 'calendar-event-week';
        week.textContent = ev.week ? `Wk ${ev.week}` : '—';

        const icon = document.createElement('div');
        icon.className = 'calendar-event-icon';
        icon.textContent = getEventIcon(ev);

        const label = document.createElement('div');
        label.className = 'calendar-event-label';
        label.textContent = getEventLabel(ev);

        const comp = document.createElement('div');
        comp.className = 'calendar-event-comp';
        if (ev.type === 'match') comp.textContent = ev.competition || 'VPL';

        item.appendChild(week);
        item.appendChild(icon);
        item.appendChild(label);
        item.appendChild(comp);
        body.appendChild(item);
      });
    });

    div.appendChild(body);

    // Footer — back to hub
    const footer = document.createElement('div');
    footer.className = 'calendar-footer';
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-primary';
    backBtn.textContent = '← Back to Hub';
    backBtn.addEventListener('click', () => Engine.showHub());
    backBtn.addEventListener('touchend', e => { e.preventDefault(); Engine.showHub(); }, { passive: false });
    footer.appendChild(backBtn);
    div.appendChild(footer);

    Utils.render(div);
  }

  function getEventIcon(ev) {
    if (ev.type === 'match') return '⚽';
    if (ev.type === 'decision') return '💭';
    if (ev.type === 'minigame') {
      if (ev.miniGameType === 'lineup') return '📋';
      if (ev.miniGameType === 'training') return '💪';
      if (ev.miniGameType === 'transfer') return '💰';
      return '🎮';
    }
    return '📖';
  }

  function getEventLabel(ev) {
    if (ev.type === 'match') return `vs. ${ev.opponent || 'Opponent'}`;
    return ev.calendarLabel || ev.id.replace(/_/g, ' ');
  }

  return { render };

})();
