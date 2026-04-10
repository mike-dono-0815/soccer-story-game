/* ============================================================
   ENGINE — Scene runner, router, and main game loop
   ============================================================ */

window.Game = window.Game || {};

window.Game.Engine = (function () {

  const { State, Utils, Screens, StoryData, Characters } = window.Game;

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    const hasSave = State.init();

    const root = document.getElementById('game-root');
    root.innerHTML = '';

    playIntro(() => renderMainMenu(hasSave));
  }

  function playIntro(onDone) {
    const overlay = document.createElement('div');
    overlay.className = 'intro-overlay';

    const video = document.createElement('video');
    video.src = 'The Soccer Game.mp4';
    video.className = 'intro-video';
    video.setAttribute('playsinline', '');
    video.setAttribute('preload', 'auto');
    video.muted = false;

    const skip = document.createElement('button');
    skip.className = 'intro-skip';
    skip.textContent = 'Skip';

    overlay.appendChild(video);
    overlay.appendChild(skip);

    const root = document.getElementById('game-root');
    root.appendChild(overlay);

    let done = false;
    function finish() {
      if (done) return;
      done = true;
      overlay.classList.add('intro-fade-out');
      setTimeout(() => {
        overlay.remove();
        onDone();
      }, 400);
    }

    video.addEventListener('ended', finish);
    skip.addEventListener('click', finish);
    skip.addEventListener('touchend', e => { e.preventDefault(); finish(); }, { passive: false });

    video.play().catch(() => {
      // Autoplay blocked — show a tap-to-play prompt instead
      video.muted = true;
      video.play().catch(() => finish());
    });
  }

  // ============================================================
  // MAIN MENU
  // ============================================================

  function renderMainMenu(hasSave) {
    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-menu screen-enter';

    // Stars bg
    const stars = document.createElement('div');
    stars.className = 'menu-stars';
    screen.appendChild(stars);

    // Stadium art
    const stadiumArt = document.createElement('div');
    stadiumArt.className = 'menu-stadium-art';
    screen.appendChild(stadiumArt);

    const content = document.createElement('div');
    content.className = 'menu-content';

    // Crest
    const crest = document.createElement('div');
    crest.className = 'menu-crest';
    const crestLetter = document.createElement('div');
    crestLetter.className = 'menu-crest-letter';
    crestLetter.textContent = 'G';
    crest.appendChild(crestLetter);
    content.appendChild(crest);

    // Title
    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'THE GAFFER';
    content.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'menu-subtitle';
    subtitle.textContent = 'A Soccer Story';
    content.appendChild(subtitle);

    const buttons = document.createElement('div');
    buttons.className = 'menu-buttons';

    if (!hasSave) {
      // Name input
      const nameSetup = document.createElement('div');
      nameSetup.className = 'name-setup';
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Your name, Gaffer';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Enter your name...';
      nameInput.maxLength = 24;
      nameInput.value = State.get().meta.managerName === 'The Gaffer' ? '' : State.get().meta.managerName;
      nameSetup.appendChild(nameLabel);
      nameSetup.appendChild(nameInput);
      content.appendChild(nameSetup);

      const startBtn = document.createElement('button');
      startBtn.className = 'btn-primary';
      startBtn.textContent = 'Begin Season';
      startBtn.addEventListener('click', () => {
        const name = nameInput.value.trim() || 'The Gaffer';
        State.get().meta.managerName = name;
        State.save();
        startGame();
      });
      startBtn.addEventListener('touchend', e => {
        e.preventDefault();
        const name = nameInput.value.trim() || 'The Gaffer';
        State.get().meta.managerName = name;
        State.save();
        startGame();
      }, { passive: false });
      buttons.appendChild(startBtn);
    } else {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn-primary';
      continueBtn.textContent = 'Continue Season';
      continueBtn.addEventListener('click', () => resumeGame());
      continueBtn.addEventListener('touchend', e => { e.preventDefault(); resumeGame(); }, { passive: false });
      buttons.appendChild(continueBtn);

      const newGameBtn = document.createElement('button');
      newGameBtn.className = 'btn-secondary';
      newGameBtn.textContent = 'New Game';
      newGameBtn.addEventListener('click', () => {
        if (confirm('Start a new game? Your current save will be lost.')) {
          State.reset();
          renderMainMenu(false);
        }
      });
      newGameBtn.addEventListener('touchend', e => {
        e.preventDefault();
        if (confirm('Start a new game? Your current save will be lost.')) {
          State.reset();
          renderMainMenu(false);
        }
      }, { passive: false });
      buttons.appendChild(newGameBtn);
    }

    content.appendChild(buttons);

    const version = document.createElement('div');
    version.className = 'menu-version';
    version.textContent = 'FC Valhalla · Valorian Premier League';
    content.appendChild(version);

    screen.appendChild(content);
    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);
  }

  function startGame() {
    State.get().progress.currentEventIndex = 0;
    State.save();
    renderStoryIntro();
  }

  function renderStoryIntro() {
    const { Utils } = window.Game;

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-story-intro screen-enter';

    const img = document.createElement('img');
    img.src = 'Intro.png';
    img.className = 'story-intro-img';
    img.alt = 'The pub';
    screen.appendChild(img);

    const card = document.createElement('div');
    card.className = 'story-intro-card';

    const paragraphs = [
      "It's a rainy Tuesday night. You and your mates are crammed into your usual corner of The Fox & Whistle, pints in hand, watching FC Valhalla stumble through another dismal first half.",
      "\"He's clueless,\" you groan, jabbing a finger at the screen. \"I could do better with my eyes shut. The formation's wrong, the substitutions are wrong, the whole thing is a mess.\"",
      "Your friends laugh. But the TV flickers. The picture warps. The noise of the pub melts away — and suddenly you're not in the pub anymore.",
      "You're sitting in the FC Valhalla dugout. The roar of a packed stadium washes over you. A coach hands you a tactics board and looks at you expectantly.",
      "Somehow, impossibly, you're the manager of FC Valhalla now.",
      "Time to show them you can do it better.",
    ];

    paragraphs.forEach((text, i) => {
      const p = document.createElement('p');
      p.className = 'story-intro-p' + (i === paragraphs.length - 1 ? ' story-intro-p-last' : '');
      p.textContent = text;
      card.appendChild(p);
    });

    const btn = document.createElement('button');
    btn.className = 'btn-primary story-intro-btn';
    btn.textContent = 'Take the Dugout';
    btn.addEventListener('click', () => {
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); showHub(); }, 350);
    });
    btn.addEventListener('touchend', e => {
      e.preventDefault();
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); showHub(); }, 350);
    }, { passive: false });
    card.appendChild(btn);

    screen.appendChild(card);
    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);
  }

  function resumeGame() {
    showHub();
  }

  // ============================================================
  // SCENE ROUTING
  // ============================================================

  // Advance to a scene by ID (handles both spine and branch scenes)
  function advance(sceneId) {
    if (!sceneId) {
      console.warn('advance() called with no sceneId');
      return;
    }

    const scene = StoryData.scenes[sceneId];
    if (!scene) {
      console.error('Scene not found:', sceneId);
      return;
    }

    const state = State.get();
    state.progress.currentSceneId = sceneId;

    // Sync currentEventIndex if this is a spine event
    const events = StoryData.events;
    const eventIdx = events.findIndex(e => e.id === sceneId);
    if (eventIdx >= 0) {
      state.progress.currentEventIndex = eventIdx;
    }

    if (scene.week !== undefined) state.progress.seasonWeek = scene.week;
    if (scene.phase) state.progress.phase = scene.phase;
    State.save();

    // Show hub before spine events that are matches or major decisions
    // (but not story scenes which flow automatically, and not minigames)
    const isSpineEvent = eventIdx >= 0;
    const isInterruptible = scene.type === 'match' || scene.type === 'decision';
    if (isSpineEvent && isInterruptible && scene.type !== 'story') {
      showHub();
      return;
    }

    routeScene(scene);
  }

  // Run the event at currentEventIndex (called by Hub's Continue button)
  function runCurrentEvent() {
    const state = State.get();
    const idx = state.progress.currentEventIndex;
    const events = StoryData.events;

    if (idx >= events.length) {
      renderEnding(State.evaluateEnding());
      return;
    }

    const event = events[idx];
    if (event.week !== undefined) state.progress.seasonWeek = event.week;
    if (event.phase) state.progress.phase = event.phase;
    State.save();

    routeScene(event);
  }

  // Called after an event completes — show hub then let user advance to next
  function next() {
    const state = State.get();
    state.progress.currentEventIndex++;
    State.save();

    const events = StoryData.events;
    if (state.progress.currentEventIndex >= events.length) {
      renderEnding(State.evaluateEnding());
      return;
    }
    showHub();
  }

  function showHub() {
    const state = State.get();
    const idx = state.progress.currentEventIndex;
    const events = StoryData.events;
    const currentEvent = events[idx];
    const nextLabel = currentEvent ? getEventLabel(currentEvent) : 'Season Complete';
    const nextDetail = currentEvent ? getEventDetail(currentEvent) : '';
    Screens.Hub.render(nextLabel, nextDetail);
  }

  function getEventLabel(event) {
    if (event.calendarLabel) return event.calendarLabel;
    if (event.type === 'match') return `vs. ${event.opponent}`;
    return event.id.replace(/_/g, ' ');
  }

  function getEventDetail(event) {
    if (event.type === 'match') {
      return `${event.competition || 'VPL'} · ${event.homeAway === 'home' ? 'Home' : 'Away'}`;
    }
    if (event.type === 'decision') return 'Decision Required';
    if (event.type === 'minigame') return `${event.miniGameType || ''}`;
    return event.phase || '';
  }

  // Route a scene to the correct screen
  function routeScene(scene) {
    if (!scene) return;

    switch (scene.type) {
      case 'story':
        Screens.Scene.render(scene, null); // scene.js handles advance via scene.next or next()
        break;

      case 'decision':
        Screens.Decision.render(scene);
        break;

      case 'match':
        Screens.Match.render(scene);
        break;

      case 'minigame':
        routeMiniGame(scene);
        break;

      case 'gate':
        advance(scene.check(State.get()) ? scene.ifTrue : scene.ifFalse);
        break;

      case 'eval':
        renderEnding(State.evaluateEnding());
        break;

      case 'ending':
        renderEnding(scene.ending);
        break;

      case 'menu':
        renderMainMenu(false);
        break;

      default:
        console.warn('Unknown scene type:', scene.type);
        next();
    }
  }

  function routeMiniGame(scene) {
    const nextSceneId = scene.next;
    switch (scene.miniGameType) {
      case 'lineup':
        Screens.Lineup.render(nextSceneId);
        break;
      case 'training':
        Screens.Training.render(nextSceneId);
        break;
      case 'transfer':
        Screens.Transfer.render(nextSceneId);
        break;
      default:
        advance(nextSceneId);
    }
  }

  // ============================================================
  // BRANCHING
  // ============================================================

  function resolveNext(nextId, condition) {
    if (!condition) return nextId;

    const state = State.get();
    const s = state.story;

    let val;
    // Check story flags first, then top-level state
    if (condition.flag in s) {
      val = s[condition.flag];
    } else {
      val = state[condition.flag];
    }

    if (condition.equals !== undefined) {
      return val === condition.equals ? condition.thenScene : condition.elseScene;
    }
    if (condition.gte !== undefined) {
      return val >= condition.gte ? condition.thenScene : condition.elseScene;
    }
    if (condition.lte !== undefined) {
      return val <= condition.lte ? condition.thenScene : condition.elseScene;
    }
    if (condition.truthy !== undefined) {
      return val ? condition.thenScene : condition.elseScene;
    }
    return nextId;
  }

  // Peek at the next event ID without advancing
  function peekNext() {
    const state = State.get();
    const idx = state.progress.currentEventIndex;
    const events = StoryData.events;
    const next = events[idx + 1];
    return next ? next.id : null;
  }

  // ============================================================
  // ENDINGS
  // ============================================================

  const ENDING_DATA = {
    glory: {
      icon: '🏆',
      bg: 'bg-trophy-room',
      title: 'Glory Season',
      subtitle: 'You did the impossible. FC Valhalla stands atop the world. The trophy cabinet is full, the fans are eternal, and Paulo Ferretti is — for once — speechless.',
      flavor: 'The greatest season in Valhalla history.',
    },
    league_champion: {
      icon: '🥇',
      bg: 'bg-stadium-night',
      title: 'League Champions',
      subtitle: 'The Valorian Premier League trophy comes home to Nordstrom Park. You fell short in the cups — but league title-holders is not nothing. Far from it.',
      flavor: 'First league title in eleven years.',
    },
    underdog_cup: {
      icon: '🏅',
      bg: 'bg-stadium-dawn',
      title: 'The Underdog\'s Cup',
      subtitle: 'The league eluded you. But when it mattered most — on the biggest stage — Valhalla refused to be beaten. The FA Cup belongs to the people\'s club.',
      flavor: 'Cup winners. Hearts of the nation.',
    },
    sacked: {
      icon: '📦',
      bg: 'bg-dark-room',
      title: 'Sacked',
      subtitle: 'The results weren\'t there, and Paulo Ferretti ran out of patience. You clear your desk. The players line the hallway as you leave — silent, grateful.',
      flavor: 'Some stories end early.',
    },
    walk_away: {
      icon: '🚪',
      bg: 'bg-dark-room',
      title: 'Walk Away',
      subtitle: 'On your own terms. You shook every hand, said your goodbyes, and walked through those gates knowing you never compromised on who you are.',
      flavor: 'Integrity intact.',
    },
    youth_revolution: {
      icon: '🌱',
      bg: 'bg-training-ground',
      title: 'Youth Revolution',
      subtitle: 'Mid-table. But the academy is buzzing. Kai Voss scores on debut and the crowd goes wild. You planted something here that will outlast any trophy.',
      flavor: 'The future is bright green.',
    },
    legendary_failure: {
      icon: '❤️‍🔥',
      bg: 'bg-stadium-night',
      title: 'Legendary Failure',
      subtitle: 'You didn\'t win anything. But the way you fought, the character you showed — Valhalla fans will sing your name for decades. Some losses are victories in disguise.',
      flavor: 'They\'ll write songs about this.',
    },
  };

  function renderEnding(endingKey) {
    const data = ENDING_DATA[endingKey] || ENDING_DATA.legendary_failure;
    const state = State.get();
    const r = state.results;

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = `screen-ending ${data.bg} screen-enter`;

    const icon = document.createElement('div');
    icon.className = 'ending-icon';
    icon.textContent = data.icon;
    screen.appendChild(icon);

    const title = document.createElement('div');
    title.className = 'ending-title';
    title.textContent = data.title;
    screen.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'ending-subtitle';
    subtitle.textContent = data.subtitle;
    screen.appendChild(subtitle);

    // Stats
    const stats = document.createElement('div');
    stats.className = 'ending-stats';

    const statRows = [
      ['League Record', `${r.vplWins}W ${r.vplDraws}D ${r.vplLosses}L`],
      ['Final Position', Utils.ordinal(r.vplPosition) + ' of 18'],
      ['Trophies', r.competitionWins.length ? r.competitionWins.join(', ') : 'None'],
      ['Team Morale', `${state.story.teamMorale}%`],
      ['Manager', state.meta.managerName],
      ['Flavour', data.flavor],
    ];

    statRows.forEach(([label, val]) => {
      const row = document.createElement('div');
      row.className = 'ending-stats-row';
      const lEl = document.createElement('span');
      lEl.className = 'ending-stats-label';
      lEl.textContent = label;
      const vEl = document.createElement('span');
      vEl.className = 'ending-stats-val';
      vEl.textContent = val;
      row.appendChild(lEl);
      row.appendChild(vEl);
      stats.appendChild(row);
    });

    screen.appendChild(stats);

    const playAgainBtn = document.createElement('button');
    playAgainBtn.className = 'btn-primary';
    playAgainBtn.style.maxWidth = '300px';
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.addEventListener('click', () => {
      State.reset();
      renderMainMenu(false);
    });
    playAgainBtn.addEventListener('touchend', e => {
      e.preventDefault();
      State.reset();
      renderMainMenu(false);
    }, { passive: false });
    screen.appendChild(playAgainBtn);

    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);
  }

  // ============================================================
  // STORYWALKER — fast-forward to any scene (debug)
  // ============================================================

  window.StoryWalker = {
    goto: function (sceneId) {
      console.log(`StoryWalker: jumping to ${sceneId}`);
      advance(sceneId);
    },
    setFlag: function (key, val) {
      State.get().story[key] = val;
      State.save();
      console.log(`StoryWalker: set story.${key} = ${val}`);
    },
    setMeter: function (key, val) {
      State.get().story[key] = val;
      State.save();
      console.log(`StoryWalker: set story.${key} = ${val}`);
    },
    ending: function (key) {
      renderEnding(key);
    },
    showAllEndings: function () {
      console.log('Endings: glory, league_champion, underdog_cup, sacked, walk_away, youth_revolution, legendary_failure');
    },
  };

  // ============================================================
  // BOOT
  // ============================================================

  // Auto-init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { advance, next, runCurrentEvent, resolveNext, peekNext, showHub, renderEnding };

})();
