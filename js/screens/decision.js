/* ============================================================
   DECISION SCREEN — Choice panel renderer
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Decision = (function () {

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

    if (choice.effects)     State.applyEffects(choice.effects);
    if (choice.rootEffects) State.applyRootEffects(choice.rootEffects);
    State.save();

    // Check if sacked (only if not already in crisis and not already resigned)
    const state = State.get();
    if (state.story.boardConfidence <= 15 && !state.story.boardCrisisActive && !state.story.resignedChoice) {
      state.story.boardCrisisActive = true;
      State.save();
      Engine.advance('sacked_mid_season');
      return;
    }

    // Resolve next
    const nextId = Engine.resolveNext(choice.next, choice.condition);
    if (nextId) Engine.advance(nextId);
    else Engine.next();
  }

  return { render };

})();
