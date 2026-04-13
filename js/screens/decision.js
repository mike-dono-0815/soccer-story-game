/* ============================================================
   DECISION SCREEN — Choice panel renderer
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Decision = (function () {

  // Unique icon + label for each tracked stat bucket
  const STAT_META = {
    teamMorale:        { icon: '🔥', label: 'Morale' },
    boardConfidence:   { icon: '🎩', label: 'Board' },
    mediaRep:          { icon: '📺', label: 'Media' },
    fanReputation:     { icon: '📣', label: 'Fans' },
    starHappiness:     { icon: '⭐', label: 'Star' },
    youthInvestment:   { icon: '🌱', label: 'Youth' },
    budget:            { icon: '💰', label: 'Budget' },
    teamStrengthBonus: { icon: '💪', label: 'Strength' },
  };

  // Collect all numeric displayable effects from a choice
  function getNumericEffects(choice) {
    const merged = Object.assign({}, choice.effects || {});
    if (choice.rootEffects && typeof choice.rootEffects.budget === 'number') {
      merged.budget = choice.rootEffects.budget;
    }
    return Object.keys(merged)
      .filter(k => typeof merged[k] === 'number' && STAT_META[k])
      .map(k => ({ key: k, val: merged[k], meta: STAT_META[k] }));
  }

  // Spread n items across [minPct, maxPct] evenly
  function spreadPositions(n, minPct, maxPct) {
    if (n === 1) return [50];
    return Array.from({ length: n }, (_, i) =>
      Math.round(minPct + ((maxPct - minPct) / (n - 1)) * i)
    );
  }

  // Animated chips inside a given container element
  function showEffectBurst(effects, container, onDone) {
    if (!effects.length) { onDone(); return; }

    // Chips stay anchored to container (animZone) for correct positioning
    const chipOverlay = document.createElement('div');
    chipOverlay.className = 'effect-burst-overlay';
    container.appendChild(chipOverlay);

    const positive = effects.filter(e => e.val >= 0);
    const negative = effects.filter(e => e.val < 0);
    const posPos = spreadPositions(positive.length, 15, 85);
    const negPos = spreadPositions(negative.length, 15, 85);

    function makeChip(effect, leftPct, direction, delay) {
      const chip = document.createElement('div');
      chip.className = `effect-chip ${effect.val >= 0 ? 'positive' : 'negative'} fly-${direction}`;
      chip.style.left = `${leftPct}%`;
      chip.style.animationDelay = `${delay}ms`;
      const iconEl = document.createElement('span');
      iconEl.className = 'effect-chip-icon';
      iconEl.textContent = effect.meta.icon;
      const labelEl = document.createElement('span');
      labelEl.className = 'effect-chip-label';
      labelEl.textContent = effect.meta.label;
      chip.appendChild(iconEl);
      chip.appendChild(labelEl);
      chipOverlay.appendChild(chip);
    }

    positive.forEach((e, i) => makeChip(e, posPos[i], 'up',   i * 75));
    negative.forEach((e, i) => makeChip(e, negPos[i], 'down', i * 75));

    // After animation settles, add a separate full-screen tap layer with the hint
    const animMs = 2200 + (effects.length - 1) * 75;
    setTimeout(() => {
      const fullScreen = document.querySelector('.game-container') || container;
      const tapLayer = document.createElement('div');
      tapLayer.className = 'effect-tap-layer';

      const hint = document.createElement('div');
      hint.className = 'effect-continue-hint';
      hint.textContent = 'tap anywhere to continue';
      tapLayer.appendChild(hint);

      fullScreen.appendChild(tapLayer);

      let advanced = false;
      function advance() {
        if (advanced) return;
        advanced = true;
        tapLayer.removeEventListener('click', advance);
        tapLayer.removeEventListener('touchend', advance);
        onDone();
      }
      tapLayer.addEventListener('click', advance);
      tapLayer.addEventListener('touchend', function (e) {
        e.preventDefault();
        advance();
      }, { passive: false });
    }, animMs);
  }

  function render(scene) {
    const { Characters, Utils, Engine } = window.Game;
    const char = Characters.get(scene.character || 'narrator');

    const div = document.createElement('div');
    div.className = 'screen-decision';

    // Background
    const bg = document.createElement('div');
    bg.className = `decision-bg ${scene.background || 'bg-office'}`;
    div.appendChild(bg);

    // Portrait area (above content, same layout as story scenes)
    const portraitArea = document.createElement('div');
    portraitArea.className = 'decision-portrait-area';
    if (scene.character && scene.character !== 'narrator') {
      const portrait = Characters.buildPortrait(scene.character, 'large');
      portrait.classList.add('portrait-enter');
      portraitArea.appendChild(portrait);
    }
    div.appendChild(portraitArea);

    // Content (prompt + choices)
    const content = document.createElement('div');
    content.className = 'decision-content';

    // Prompt box
    const promptBox = document.createElement('div');
    promptBox.className = 'decision-prompt-box';

    if (scene.character && scene.character !== 'narrator' && char.name) {
      const speakerEl = document.createElement('div');
      speakerEl.className = 'decision-speaker';
      speakerEl.style.color = char.color;
      speakerEl.textContent = scene.name || char.name;
      promptBox.appendChild(speakerEl);
    }

    const promptText = document.createElement('div');
    promptText.className = 'decision-prompt-text';
    promptText.textContent = scene.prompt || scene.dialogue?.[0] || '';
    promptBox.appendChild(promptText);
    content.appendChild(promptBox);

    // Choices
    const choicesDiv = document.createElement('div');
    choicesDiv.className = 'decision-choices';

    (scene.choices || []).forEach((choice, i) => {
      const card = document.createElement('button');
      card.className = 'choice-card choice-enter card-press';
      card.style.animationDelay = `${0.05 + i * 0.07}s`;

      const label = document.createElement('div');
      label.className = 'choice-label';
      label.textContent = choice.label;
      card.appendChild(label);

      if (choice.hint) {
        const hint = document.createElement('div');
        hint.className = 'choice-hint';
        hint.textContent = choice.hint;
        card.appendChild(hint);
      }

      card.addEventListener('click', function () {
        handleChoice(choice);
      });
      card.addEventListener('touchend', function (e) {
        e.preventDefault();
        handleChoice(choice);
      }, { passive: false });

      choicesDiv.appendChild(card);
    });

    content.appendChild(choicesDiv);
    div.appendChild(content);

    Utils.render(div);
  }

  function handleChoice(choice) {
    const { State, Engine } = window.Game;

    // Lock input immediately
    document.querySelectorAll('.choice-card').forEach(c => { c.style.pointerEvents = 'none'; });

    const promptBox  = document.querySelector('.decision-prompt-box');
    const choicesDiv = document.querySelector('.decision-choices');

    // Snapshot height of choices before anything changes
    const animHeight = choicesDiv ? choicesDiv.offsetHeight : 160;

    // Fade out prompt + choices together
    [promptBox, choicesDiv].forEach(el => {
      if (!el) return;
      el.style.transition = 'opacity 0.2s ease';
      el.style.opacity = '0';
    });

    if (choice.effects)     State.applyEffects(choice.effects);
    if (choice.rootEffects) State.applyRootEffects(choice.rootEffects);
    State.save();

    setTimeout(() => {
      // Show selected label where prompt was
      if (promptBox) {
        promptBox.innerHTML = '';
        const label = document.createElement('div');
        label.className = 'decision-selected-label';
        label.textContent = choice.label;
        promptBox.appendChild(label);
        promptBox.style.transition = 'opacity 0.25s ease';
        promptBox.style.opacity = '1';
      }

      // Replace choices div with a fixed-height animation zone
      const animZone = document.createElement('div');
      animZone.className = 'decision-anim-zone';
      animZone.style.height = `${animHeight}px`;
      if (choicesDiv && choicesDiv.parentNode) {
        choicesDiv.parentNode.replaceChild(animZone, choicesDiv);
      }

      const numEffects = getNumericEffects(choice);
      showEffectBurst(numEffects, animZone, function proceed() {
        const state = State.get();
        if (state.story.boardConfidence <= 15 && !state.story.boardCrisisActive && !state.story.resignedChoice) {
          state.story.boardCrisisActive = true;
          State.save();
          Engine.advance('sacked_mid_season');
          return;
        }
        const nextId = Engine.resolveNext(choice.next, choice.condition);
        if (nextId) Engine.advance(nextId);
        else Engine.next();
      });
    }, 220);
  }

  return { render };

})();
