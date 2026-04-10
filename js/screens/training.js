/* ============================================================
   TRAINING SCREEN — Weekly training focus selector
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Training = (function () {

  const OPTIONS = [
    {
      id: 'fitness',
      icon: '💪',
      name: 'Physical Conditioning',
      desc: 'Push the squad hard. Improve stamina and reduce injury risk over time.',
      effects: [
        { label: '+Match Performance', cls: 'badge-win' },
        { label: '+Morale (long term)', cls: 'badge-league' },
      ],
      storyEffects: { teamMorale: +3, teamStrengthBonus: +2 },
    },
    {
      id: 'tactics',
      icon: '📋',
      name: 'Tactical Drills',
      desc: 'Refine your system. The team learns to press higher and move as a unit.',
      effects: [
        { label: '+Formation Fit', cls: 'badge-win' },
        { label: '+Board Confidence', cls: 'badge-league' },
      ],
      storyEffects: { boardConfidence: +3, teamStrengthBonus: +2 },
    },
    {
      id: 'morale',
      icon: '❤️',
      name: 'Team Bonding',
      desc: 'Light sessions, team activities, and trust-building exercises.',
      effects: [
        { label: '+Team Morale', cls: 'badge-win' },
        { label: '+Star Happiness', cls: 'badge-cup' },
      ],
      storyEffects: { teamMorale: +7, starHappiness: +5, teamStrengthBonus: +1 },
    },
    {
      id: 'set-pieces',
      icon: '⚽',
      name: 'Set Pieces',
      desc: 'Practice corners, free kicks, and penalties until they\'re second nature.',
      effects: [
        { label: '+Dead Ball Danger', cls: 'badge-win' },
        { label: '+Media Rep', cls: 'badge-draw' },
      ],
      storyEffects: { mediaRep: +3, teamStrengthBonus: +2 },
    },
  ];

  function render(nextSceneId) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();
    let selected = state.trainingFocus || 'fitness';

    const div = document.createElement('div');
    div.className = 'screen-training';

    // Header
    const header = document.createElement('div');
    header.className = 'training-header';
    const title = document.createElement('div');
    title.style.fontSize = '17px';
    title.style.fontWeight = '700';
    title.textContent = 'Training Focus';
    const sub = document.createElement('div');
    sub.style.fontSize = '13px';
    sub.style.color = 'var(--text-muted)';
    sub.style.marginTop = '2px';
    sub.textContent = 'Choose this week\'s emphasis for the squad';
    header.appendChild(title);
    header.appendChild(sub);
    div.appendChild(header);

    // Options
    const body = document.createElement('div');
    body.className = 'training-body';

    OPTIONS.forEach(opt => {
      const card = document.createElement('div');
      card.className = `training-option ${opt.id === selected ? 'selected' : ''}`;
      card.dataset.id = opt.id;

      const optHeader = document.createElement('div');
      optHeader.className = 'training-option-header';

      const iconEl = document.createElement('div');
      iconEl.className = 'training-icon';
      iconEl.style.background = 'rgba(255,255,255,0.05)';
      iconEl.textContent = opt.icon;
      optHeader.appendChild(iconEl);

      const nameEl = document.createElement('div');
      nameEl.className = 'training-name';
      nameEl.textContent = opt.name;
      optHeader.appendChild(nameEl);

      card.appendChild(optHeader);

      const desc = document.createElement('div');
      desc.className = 'training-desc';
      desc.textContent = opt.desc;
      card.appendChild(desc);

      const effectsDiv = document.createElement('div');
      effectsDiv.className = 'training-effects';
      opt.effects.forEach(eff => {
        const tag = document.createElement('span');
        tag.className = `badge training-effect-tag ${eff.cls}`;
        tag.textContent = eff.label;
        effectsDiv.appendChild(tag);
      });
      card.appendChild(effectsDiv);

      card.addEventListener('click', () => selectOption(opt.id, body));
      card.addEventListener('touchend', e => { e.preventDefault(); selectOption(opt.id, body); }, { passive: false });

      body.appendChild(card);
    });

    div.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'training-footer';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'btn-primary';
    confirmBtn.textContent = 'Confirm Training Plan';
    confirmBtn.addEventListener('click', () => confirm(nextSceneId));
    confirmBtn.addEventListener('touchend', e => { e.preventDefault(); confirm(nextSceneId); }, { passive: false });
    footer.appendChild(confirmBtn);
    div.appendChild(footer);

    Utils.render(div);
    // Store selected in closure
    div._selectedFocus = selected;
  }

  function selectOption(id, body) {
    body.querySelectorAll('.training-option').forEach(card => {
      card.classList.toggle('selected', card.dataset.id === id);
    });
    // Store selection
    window.Game.State.get()._pendingTraining = id;
  }

  function confirm(nextSceneId) {
    const { State, Engine } = window.Game;
    const state = State.get();
    const selected = state._pendingTraining || state.trainingFocus;

    state.trainingFocus = selected;
    delete state._pendingTraining;

    const opt = OPTIONS.find(o => o.id === selected);
    if (opt && opt.storyEffects) {
      State.applyEffects(opt.storyEffects);
    }
    State.save();

    if (nextSceneId) Engine.advance(nextSceneId);
    else Engine.next();
  }

  return { render };

})();
