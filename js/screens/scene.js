/* ============================================================
   SCENE SCREEN — Visual novel scene renderer
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Scene = (function () {

  let _scene = null;
  let _dialogueIndex = 0;
  let _typewriterTimer = null;
  let _isTyping = false;
  let _onComplete = null;

  function render(scene, onComplete) {
    _scene = scene;
    _dialogueIndex = 0;
    _onComplete = onComplete;

    const { Characters, Utils } = window.Game;
    const char = Characters.get(scene.character || 'narrator');

    const div = document.createElement('div');
    div.className = `screen-scene`;

    // Background
    const bg = document.createElement('div');
    bg.className = `scene-bg ${scene.background || 'bg-stadium-dawn'}`;
    div.appendChild(bg);

    // Tap hint
    const tapHint = document.createElement('div');
    tapHint.className = 'scene-tap-hint';
    tapHint.textContent = 'tap anywhere to continue';
    div.appendChild(tapHint);

    // Portrait area
    const portraitArea = document.createElement('div');
    portraitArea.className = 'scene-portrait-area';

    if (scene.character && scene.character !== 'narrator') {
      const portrait = Characters.buildPortrait(scene.character, 'large');
      portrait.classList.add('portrait-enter');
      portraitArea.appendChild(portrait);
    }
    div.appendChild(portraitArea);

    // Dialogue area
    const dialogueArea = document.createElement('div');
    dialogueArea.className = 'scene-dialogue-area dialogue-enter';

    const box = document.createElement('div');
    box.className = 'scene-dialogue-box';

    // Speaker name
    if (scene.character && scene.character !== 'narrator' && char.name) {
      const speakerEl = document.createElement('div');
      speakerEl.className = 'scene-speaker-name';
      speakerEl.style.color = char.color;
      speakerEl.textContent = scene.name || char.name;
      box.appendChild(speakerEl);
    }

    // Dialogue text
    const textEl = document.createElement('div');
    textEl.className = 'scene-dialogue-text';
    box.appendChild(textEl);

    // Continue indicator
    const continueEl = document.createElement('div');
    continueEl.className = 'scene-continue-indicator';
    continueEl.textContent = '▼';
    continueEl.style.display = 'none';
    box.appendChild(continueEl);

    dialogueArea.appendChild(box);
    div.appendChild(dialogueArea);

    // Tap handler
    div.addEventListener('click', function () {
      handleTap(textEl, continueEl);
    });
    div.addEventListener('touchend', function (e) {
      e.preventDefault();
      handleTap(textEl, continueEl);
    }, { passive: false });

    Utils.render(div);
    // Start first line after render
    setTimeout(() => showLine(_dialogueIndex, textEl, continueEl), 350);
  }

  function showLine(index, textEl, continueEl) {
    const lines = _scene.dialogue || [];
    if (index >= lines.length) return;

    continueEl.style.display = 'none';
    _isTyping = true;

    if (_typewriterTimer) clearInterval(_typewriterTimer);
    _typewriterTimer = window.Game.Utils.typewriter(textEl, lines[index], 20, function () {
      _isTyping = false;
      if (_dialogueIndex < lines.length - 1) {
        continueEl.style.display = 'block';
        continueEl.textContent = '▼';
      } else {
        continueEl.style.display = 'block';
        continueEl.textContent = '▶';
      }
    });
  }

  function handleTap(textEl, continueEl) {
    const lines = _scene.dialogue || [];

    if (_isTyping) {
      // Skip typewriter — show full line immediately
      if (_typewriterTimer) clearInterval(_typewriterTimer);
      textEl.textContent = lines[_dialogueIndex];
      _isTyping = false;
      if (_dialogueIndex < lines.length - 1) {
        continueEl.style.display = 'block';
        continueEl.textContent = '▼';
      } else {
        continueEl.style.display = 'block';
        continueEl.textContent = '▶';
      }
      return;
    }

    _dialogueIndex++;

    if (_dialogueIndex < lines.length) {
      showLine(_dialogueIndex, textEl, continueEl);
    } else {
      // All lines shown — advance
      if (_onComplete) {
        _onComplete(_scene);
      } else if (_scene.next) {
        window.Game.Engine.advance(_scene.next);
      } else {
        window.Game.Engine.next();
      }
    }
  }

  return { render };

})();
