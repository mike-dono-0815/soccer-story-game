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

    playIntro(() => renderMainMenu(false));
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

    const gameRoot = document.getElementById('game-root');
    gameRoot.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'game-container';
    container.appendChild(overlay);
    gameRoot.appendChild(container);

    let done = false;
    function finish() {
      if (done) return;
      done = true;
      overlay.classList.add('intro-fade-out');
      setTimeout(() => {
        container.remove();
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

  function _fmtSaveDate(ts) {
    if (!ts) return 'Unknown date';
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  function _weekLabel(week) {
    if (!week || week === 0) return 'Pre-Season';
    if (week <= 12) return `Week ${week} · Early Season`;
    if (week <= 23) return `Week ${week} · Mid-Season`;
    if (week <= 30) return `Week ${week} · Run-In`;
    return `Week ${week} · Final Stretch`;
  }

  function renderMainMenu(forceNew) {
    const slots = State.listSlots();
    const showSlots = !forceNew && slots.length > 0;

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-menu screen-enter';

    const stars = document.createElement('div');
    stars.className = 'menu-stars';
    screen.appendChild(stars);

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

    const title = document.createElement('div');
    title.className = 'menu-title';
    title.textContent = 'THE GAFFER';
    content.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.className = 'menu-subtitle';
    subtitle.textContent = 'A Soccer Story';
    content.appendChild(subtitle);

    if (showSlots) {
      // ── Two entry buttons ─────────────────────────────────────
      const buttons = document.createElement('div');
      buttons.className = 'menu-buttons';

      const loadGameBtn = document.createElement('button');
      loadGameBtn.className = 'btn-primary';
      loadGameBtn.textContent = '📂  Load Game';

      const newGameBtn = document.createElement('button');
      newGameBtn.className = 'btn-secondary';
      newGameBtn.textContent = '+ New Game';
      const doNew = () => renderMainMenu(true);
      newGameBtn.addEventListener('click', doNew);
      newGameBtn.addEventListener('touchend', e => { e.preventDefault(); doNew(); }, { passive: false });

      buttons.appendChild(loadGameBtn);
      buttons.appendChild(newGameBtn);
      content.appendChild(buttons);

      // ── Slot list (hidden until Load is clicked) ──────────────
      const slotList = document.createElement('div');
      slotList.className = 'menu-slot-list menu-slot-list-hidden';

      const renderSlots = () => {
        slotList.innerHTML = '';
        State.listSlots().forEach(slot => {
          const card = document.createElement('div');
          card.className = 'menu-slot-card';

          const info = document.createElement('div');
          info.className = 'menu-slot-info';

          const name = document.createElement('div');
          name.className = 'menu-slot-name';
          name.textContent = slot.slotName || slot.managerName;

          const date = document.createElement('div');
          date.className = 'menu-slot-date';
          date.textContent = _fmtSaveDate(slot.savedAt);

          const progress = document.createElement('div');
          progress.className = 'menu-slot-progress';
          progress.textContent = _weekLabel(slot.week);

          info.appendChild(name);
          info.appendChild(date);
          info.appendChild(progress);

          const actions = document.createElement('div');
          actions.className = 'menu-slot-actions';

          const loadBtn = document.createElement('button');
          loadBtn.className = 'menu-slot-load';
          loadBtn.textContent = 'Load ›';
          const doLoad = () => { State.loadSlot(slot.id); resumeGame(); };
          loadBtn.addEventListener('click', doLoad);
          loadBtn.addEventListener('touchend', e => { e.preventDefault(); doLoad(); }, { passive: false });

          const delBtn = document.createElement('button');
          delBtn.className = 'menu-slot-delete';
          delBtn.textContent = '✕';
          delBtn.title = 'Delete save';
          const doDel = () => {
            if (confirm(`Delete "${slot.slotName || slot.managerName}"?`)) {
              State.deleteSlot(slot.id);
              if (State.listSlots().length === 0) {
                renderMainMenu(true);
              } else {
                renderSlots();
              }
            }
          };
          delBtn.addEventListener('click', doDel);
          delBtn.addEventListener('touchend', e => { e.preventDefault(); doDel(); }, { passive: false });

          actions.appendChild(loadBtn);
          actions.appendChild(delBtn);
          card.appendChild(info);
          card.appendChild(actions);
          slotList.appendChild(card);
        });
      };

      renderSlots();
      content.appendChild(slotList);

      const doShowSlots = () => {
        slotList.classList.remove('menu-slot-list-hidden');
        loadGameBtn.style.display = 'none';
      };
      loadGameBtn.addEventListener('click', doShowSlots);
      loadGameBtn.addEventListener('touchend', e => { e.preventDefault(); doShowSlots(); }, { passive: false });

    } else {
      // ── New game form ─────────────────────────────────────────
      if (slots.length > 0) {
        // Back link when coming from forceNew
        const backBtn = document.createElement('button');
        backBtn.className = 'menu-back-link';
        backBtn.textContent = '‹ Back to saves';
        backBtn.addEventListener('click', () => renderMainMenu(false));
        backBtn.addEventListener('touchend', e => { e.preventDefault(); renderMainMenu(false); }, { passive: false });
        content.appendChild(backBtn);
      }

      const nameSetup = document.createElement('div');
      nameSetup.className = 'name-setup';
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Your name, Gaffer';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.placeholder = 'Enter your name...';
      nameInput.maxLength = 24;
      nameSetup.appendChild(nameLabel);
      nameSetup.appendChild(nameInput);
      content.appendChild(nameSetup);

      const buttons = document.createElement('div');
      buttons.className = 'menu-buttons';
      const startBtn = document.createElement('button');
      startBtn.className = 'btn-primary';
      startBtn.textContent = 'Begin Season';
      const doStart = () => {
        const name = nameInput.value.trim() || 'The Gaffer';
        State.reset(); // ensure fresh state
        State.get().meta.managerName = name;
        State.save();
        startGame();
      };
      startBtn.addEventListener('click', doStart);
      startBtn.addEventListener('touchend', e => { e.preventDefault(); doStart(); }, { passive: false });
      buttons.appendChild(startBtn);
      content.appendChild(buttons);
    }

    // Save tip
    const tip = document.createElement('div');
    tip.className = 'menu-save-tip';
    tip.textContent = 'Tap 💾 in the Hub to save your progress anytime';
    content.appendChild(tip);

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
      "It's a rainy Tuesday night. You and your buddies are crammed into your usual corner of The Beaver Pond, large beers in hand, watching FC Valhalla stumble through another weak first half.",
      "\"He's clueless,\" you complain. \"I could do better with my eyes shut. The formation's wrong, the substitutions are wrong, the whole thing is a mess.\"",
      "Suddenly, the TV flickers and the picture warps. The noise of the pub slowly melts away...",
      "You're sitting at the bench of the FC Valhalla. The roar of a packed stadium washes over you. A coach hands you a tactics board and looks at you expectantly.",
      "Strangely, you're the manager of FC Valhalla now.",
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
    btn.textContent = 'Start Your Journey';
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

    // Auto-process gates without stopping at the hub
    const nextEvent = events[state.progress.currentEventIndex];
    if (nextEvent && nextEvent.type === 'gate') {
      if (nextEvent.week !== undefined) state.progress.seasonWeek = nextEvent.week;
      if (nextEvent.phase) state.progress.phase = nextEvent.phase;
      State.save();
      routeScene(nextEvent);
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

  // Story match opponent name → VPL table team ID (only teams that exist in the simulated league)
  const OPP_TO_TEAM_ID = {
    'Red Storm FC':        'redstorm',
    'Castello FC':         'castello',
    'Ironclad United':     'ironclad',
    'Northern Stars FC':   'northstars',
    'Red Cliffs Athletic': 'redcliffs',
    'Ironport City':       'ironport',
  };

  function _currentTable() {
    const state = State.get();
    if (!state.league || !state.league.fixtures || state.league.round < 1) return null;
    return window.Game.LeagueSim.computeTable(state.league.fixtures, state.league.round);
  }

  function _valhallaLeaguePosition() {
    const table = _currentTable();
    if (!table) return null;
    const idx = table.findIndex(t => t.id === 'valhalla');
    return idx >= 0 ? idx + 1 : null;
  }

  function _oppLeaguePosition(opponentName) {
    const teamId = OPP_TO_TEAM_ID[opponentName];
    if (!teamId) return null;
    const table = _currentTable();
    if (!table) return null;
    const idx = table.findIndex(row => row.id === teamId);
    return idx >= 0 ? idx + 1 : null;
  }

  function _fixtureLabel(event) {
    const isHome = event.homeAway === 'home';
    const opp    = event.opponent || 'Opponent';
    const valPos = _valhallaLeaguePosition();
    const oppPos = _oppLeaguePosition(opp);
    const valLabel = valPos ? `FC Valhalla (P${valPos})` : 'FC Valhalla';
    const oppLabel = oppPos ? `${opp} (P${oppPos})` : opp;
    return isHome ? `${valLabel} – ${oppLabel}` : `${oppLabel} – ${valLabel}`;
  }

  // Returns a prefix string for the final VPL game based on league position
  function _titleDeciderPrefix() {
    const table = _currentTable();
    if (!table) return 'Season Finale';
    const valIdx = table.findIndex(t => t.id === 'valhalla');
    if (valIdx < 0) return 'Season Finale';
    const vPts   = table[valIdx].pts;
    const t1pts  = table[0].pts;
    if (t1pts - vPts <= 3) return 'Title Decider';
    const t2pts  = table.length > 1 ? table[1].pts : vPts;
    if (t2pts - vPts <= 3) return 'Champions Cup Place';
    const t5pts  = table.length > 4 ? table[4].pts : vPts;
    if (t5pts - vPts <= 3) return 'Europa Place';
    return 'Season Finale';
  }

  // Returns a copy of the title-decider scene with dynamic transition text
  function _patchTitleDecider(scene) {
    const prefix = _titleDeciderPrefix();
    const texts = {
      'Title Decider':       "Final day. The title is still within reach — three points could make Valhalla champions. The ground is sold out. It has been for weeks.",
      'Champions Cup Place': "Final day. A top-two finish and a place in Europe's biggest competition is still alive. Win and Valhalla go to the Champions Cup next season.",
      'Europa Place':        "Final day. A Europa Cup place is still in play. Win and the season ends with continental football secured. Not a title campaign — but far from nothing.",
      'Season Finale':       "Final day of the season. The table has already given its verdict. The city turns out anyway — because this is still Valhalla, and it's still football.",
    };
    return Object.assign({}, scene, {
      transition: Object.assign({}, scene.transition, { text: texts[prefix] }),
    });
  }

  // Returns how many competitions Valhalla is still alive in at the locker-room point
  function _activeCups() {
    const r = (State.get().results) || {};
    return {
      fa:       r.faRound       === 'final',
      champ:    r.championsRound === 'final',
    };
  }

  function _patchLockerRoom(scene) {
    const { fa, champ } = _activeCups();
    let prompt;
    if (fa && champ) {
      prompt = '"Crunch time — three competitions still alive. The squad is tired. What\'s your message in the dressing room?"';
    } else if (fa) {
      prompt = '"Crunch time — the league title and an FA Cup Final still to play. The squad is tired. What\'s your message in the dressing room?"';
    } else if (champ) {
      prompt = '"Crunch time — the league title and a Champions Cup Final still to play. The squad is tired. What\'s your message in the dressing room?"';
    } else {
      prompt = '"Crunch time — everything now riding on the league run-in. The squad is tired. What\'s your message in the dressing room?"';
    }
    return Object.assign({}, scene, { prompt });
  }

  function _patchSecondHalfReview(scene) {
    const { fa, champ } = _activeCups();
    let line;
    if (fa && champ) {
      line = '"Three competitions. One squad. This is your legacy, Gaffer."';
    } else if (fa) {
      line = '"The league title and an FA Cup Final. Two chances at glory, Gaffer."';
    } else if (champ) {
      line = '"The league title and a Champions Cup Final. Two chances at history, Gaffer."';
    } else {
      line = '"The league run-in. This is where legacies are made, Gaffer."';
    }
    const dialogue = scene.dialogue.map((d, i) => i === 2 ? line : d);
    return Object.assign({}, scene, { dialogue });
  }

  function _patchBoardPressure(scene) {
    const pos = _valhallaLeaguePosition() || 9;
    const posStr = Utils.ordinal(pos);

    let tier;
    if (pos === 1)      tier = 'elite';
    else if (pos <= 4)  tier = 'good';
    else if (pos <= 9)  tier = 'mid';
    else if (pos <= 15) tier = 'worried';
    else                tier = 'danger';

    const TIERS = {
      elite: {
        transitionText: "Paulo waves you in without looking up. He has the league table on his desk. He circles your position — first — and looks up with something you haven't seen from him before. A smile.",
        prompt: '"Top of the table. I\'ll be honest: I didn\'t dare dream this by January. How do we keep it there?"',
        choices: [
          { label: '"We win the title. Simple as that."',             hint: 'Paulo grins. The room feels lighter.' },
          { label: '"One game at a time. We won\'t get carried away."', hint: 'Smart and steady. He respects it.' },
          { label: '"Back me in the window and we\'ll win it by a mile."', hint: 'Paulo loves the ambition. He adds £2M to the budget.' },
        ],
      },
      good: {
        transitionText: "Paulo waves you in without looking up. He has the league table on his desk. He circles your position and taps it twice. 'Sit down,' he says.",
        prompt: `"${posStr} in the table — in the mix for the top places. Good. Now tell me: how do we go higher?"`,
        choices: [
          { label: '"We\'re pushing for the title. Not just Europe."', hint: 'Ambitious. Paulo raises an eyebrow — impressed.' },
          { label: '"Solid foundation. We push harder in the second half."', hint: 'Measured and credible. He nods.' },
          { label: '"Back me in the window and we close that gap."', hint: 'Paulo likes decisiveness. He adds £2M to the budget.' },
        ],
      },
      mid: {
        transitionText: "Paulo waves you in without looking up. He has the league table on his desk, a red pen in his hand. He circles something — your position — then looks at you.",
        prompt: `"${posStr} — right in the middle of the pack. I expected better by now. What\'s your plan?"`,
        choices: [
          { label: '"We\'re building momentum. Trust the process."', hint: 'Buys goodwill — but Paulo\'s patience is thinning.' },
          { label: '"A tough run of fixtures. The squad is improving."', hint: 'Factual. Paulo accepts it — for now.' },
          { label: '"Give me the transfer budget and we move up."', hint: 'Paulo likes decisiveness. He adds £2M to the budget.' },
        ],
      },
      worried: {
        transitionText: "Paulo waves you in without looking up. He has the league table on his desk, a red pen in his hand. He circles something — your position — and underlines it. Twice.",
        prompt: `"${posStr}. That\'s not good enough. We built this club for the top half. I need a proper explanation."`,
        choices: [
          { label: '"We\'re turning it around. Give me three more games."', hint: 'Paulo stares. He gives it — just about.' },
          { label: '"Injuries and tough fixtures. We\'re adapting."', hint: 'A weaker answer than he wanted. He notes it.' },
          { label: '"Give me the transfer budget and we fix this now."', hint: 'Paulo adds £2M. He needs results as much as you do.' },
        ],
      },
      danger: {
        transitionText: "Paulo waves you in without looking up. He has the league table on his desk, a red pen in his hand. He circles your position — near the bottom — and throws the pen down.",
        prompt: `"${posStr}. That\'s relegation territory. I need answers and I need them right now."`,
        choices: [
          { label: '"Results come or I walk. You have my word."', hint: 'Paulo pauses. He didn\'t expect that. Gives you the window.' },
          { label: '"The squad has been hit hard. We\'re not done."', hint: 'A plea. Paulo looks unconvinced but holds off.' },
          { label: '"Back me in the window — that\'s how we survive."', hint: 'Survival mode. Paulo adds £2M. He\'s desperate too.' },
        ],
      },
    };

    const d = TIERS[tier];
    return Object.assign({}, scene, {
      transition: Object.assign({}, scene.transition, { text: d.transitionText }),
      prompt: d.prompt,
      choices: scene.choices.map((c, i) => Object.assign({}, c, {
        label: d.choices[i] ? d.choices[i].label : c.label,
        hint:  d.choices[i] ? d.choices[i].hint  : c.hint,
      })),
    });
  }

  function _buildCupAftermathTransition(scene) {
    const state = State.get();
    const comp  = scene.competition;
    const r     = state.results;

    if (comp === 'FA Cup') {
      const won = (r.competitionWins || []).includes('FA Cup');
      if (won || r.cupRound === 'winner') {
        return {
          location: 'Wembley — FA Cup Winners',
          text: "The final whistle. The FA Cup is Valhalla's. The players don't move at first — it takes a moment to register what has just happened. Then Roberto is the first to react, arms wide, running toward you. Supporters pour past the stewards. The trophy glints somewhere in the chaos. Tonight, the whole city belongs to Valhalla.",
        };
      }
      if (r.cupRound === 'out_Final' || scene.round === 'Final') {
        return {
          location: 'Wembley — FA Cup Runners-Up',
          text: "The final whistle is the loneliest sound you've heard all season. Silver medals are draped over necks but nobody wants to wear them. The dressing room is silent for a long time — someone leaves the shower running and nobody turns it off. Outside, the city goes about its evening. Somehow that makes it worse.",
        };
      }
      if (scene.round === 'SF') {
        return {
          location: 'FA Cup — Semi-Final Exit',
          text: "Close enough to Wembley to hurt. You sit with the tactics board for an hour after the bus empties, replaying the moment it slipped away. Lena knocks gently and leaves a coffee on the desk without a word. The league still has everything to play for. Tonight, that doesn't help.",
        };
      }
      return {
        location: 'FA Cup — Quarter-Final Exit',
        text: "The quarter-final was one game too far. On the bus home a few of the players put headphones in and stare at the road. You make a note: same fixture, same pressure, different result. Next time Valhalla reaches the last eight, the squad will know what this moment feels like. That knowledge has a price.",
      };
    }

    if (comp === 'Champions Cup') {
      const won = (r.competitionWins || []).includes('Champions Cup');
      if (won || r.championsRound === 'winner') {
        return {
          location: 'Champions Cup — Winners',
          text: "The greatest night in this club's history. Confetti is still falling when Paulo Ferretti — who barely smiles — finds you on the pitch and says nothing, just shakes your hand for a very long time. The bus home takes four hours because the city won't let it through. Nobody on board minds at all.",
        };
      }
      if (r.championsRound === 'out_Final' || scene.round === 'Final') {
        return {
          location: 'Champions Cup Final — Runners-Up',
          text: "You took Valhalla to a European final. The continent watched. One match separated this club from the greatest prize in club football. In the hotel bar at two in the morning, a few of the staff sit together — not really talking, just present. That, at least, feels right.",
        };
      }
      if (scene.round === 'KO') {
        return {
          location: 'Champions Cup — Semi-Final Exit',
          text: "Eliminated in the last four. Sitting in the empty away dressing room after the final whistle, all you can think is — we were here. Valhalla was in a European semi-final. The squad is hurting now. In six months they'll understand what they just achieved. Right now, that's not much comfort.",
        };
      }
      return {
        location: 'Champions Cup — Group Stage Exit',
        text: "Europe found Valhalla out. The gap between ambition and readiness was visible in each game. Lena quietly collects a full set of opposition reports on the flight home — you'll work through them all winter. The lessons are expensive. They will not be wasted.",
      };
    }

    return { location: 'Cup Exit', text: 'The cup run is over.' };
  }

  function _buildLeagueAftermathTransition() {
    const state = State.get();
    const pos  = state.results.vplPosition || 9;
    const won  = (state.results.competitionWins || []).includes('VPL');

    if (won || pos === 1) {
      return {
        location: 'Nordstrom Park — Champions',
        text: "The final whistle is still ringing when the pitch floods with supporters. A sea of blue and gold. The trophy is somewhere in the chaos — you can't see it yet, but you can hear it being sung about. The celebrations pour out of the stadium and into every bar and street in the city. By midnight the party shows no sign of stopping. This is what it feels like to win a league title.",
      };
    }
    if (pos === 2) {
      return {
        location: 'Nordstrom Park — Runners-Up',
        text: "Second place. The Champions Cup is secured for next season. In the dressing room there are mixed emotions — pride, relief, and a quiet ache for what might have been. You sit with the squad for a long time after the final whistle, nobody quite ready to leave. It is a good season. A very good season. But the players already know they'll be back next year with unfinished business.",
      };
    }
    if (pos <= 4) {
      return {
        location: 'Nordstrom Park — European Football Secured',
        text: "Top four. European nights secured for next season. The city doesn't throw a parade, but the fans who linger outside the ground are smiling — the kind of satisfied smiles that come from a season that delivered what it promised. In the players' bar afterwards, Roberto orders a round for everyone. Marco raises his glass. 'Next year,' he says. 'Next year we go all the way.'",
      };
    }
    if (pos <= 8) {
      return {
        location: 'Nordstrom Park — Season\'s End',
        text: "A mid-table finish. Not what anyone dreamed about in July, but the season is done and the squad is intact. In a quiet corner of a bar near the ground, a handful of players end up together — Sven, Kwame, Diego. They don't talk much about football. They order another round and stay until closing. Some seasons are just about making it through.",
      };
    }
    return {
      location: 'Nordstrom Park — Difficult Night',
      text: "The final whistle brings more relief than joy. The dressing room empties quickly — some players disappear without a word. Later that evening you hear through Lena that a few of them ended up in a bar on the other side of town, drinking quietly until the small hours. Not a celebration. Just survivors processing a hard season together, the way footballers do.",
    };
  }

  function getEventLabel(event) {
    if (event.id === 'match_title_decider') {
      return _titleDeciderPrefix() + ' · ' + _fixtureLabel(event);
    }
    if (event.calendarLabel) return event.calendarLabel;
    if (event.type === 'match') return _fixtureLabel(event);
    return event.id.replace(/_/g, ' ');
  }

  function getEventDetail(event) {
    if (event.type === 'match') {
      const isVPL = !event.competition || event.competition === 'VPL';

      if (isVPL) {
        const round = window.Game.LeagueSim.SCENE_TO_ROUND[event.id];
        return round ? `VPL · Round ${round} of 34` : 'VPL League';
      }

      // Cup / other competitions — show competition + venue
      const comp  = event.competition || 'VPL';
      const venue = event.homeAway === 'home' ? 'Home' : event.homeAway === 'away' ? 'Away' : 'Neutral';
      return `${comp} · ${venue}`;
    }
    if (event.type === 'decision') return 'Decision Required';
    if (event.type === 'minigame') return `${event.miniGameType || ''}`;
    return event.phase || '';
  }

  // Route a scene to the correct screen
  function routeScene(scene) {
    if (!scene) return;

    // Dynamic patching for context-sensitive scenes
    if (scene.id === 'match_title_decider')  scene = _patchTitleDecider(scene);
    if (scene.id === 'locker_room_talk')     scene = _patchLockerRoom(scene);
    if (scene.id === 'second_half_review')   scene = _patchSecondHalfReview(scene);
    if (scene.id === 'board_pressure_1')     scene = _patchBoardPressure(scene);

    // Match scenes: context screens → lineup → match
    if (scene.type === 'match') {
      _runMatchPipeline(scene);
      return;
    }

    // Non-match: show transition if defined, then route
    if (scene.transition) {
      Screens.Transition.show(scene.transition, () => _doRouteScene(scene));
      return;
    }
    _doRouteScene(scene);
  }

  // Full pipeline for any match: [cup context] → [transition] → lineup → match
  function _runMatchPipeline(scene) {
    const state = State.get();
    const isVPL = !scene.competition || scene.competition === 'VPL';

    function afterContext() {
      // Show narrative transition if the match scene defines one
      if (scene.transition) {
        Screens.Transition.show(scene.transition, () => _showLineupThenMatch(scene));
      } else {
        _showLineupThenMatch(scene);
      }
    }

    afterContext();
  }

  // Show lineup selection, then proceed to match rendering
  function _showLineupThenMatch(scene) {
    Screens.Lineup.render(() => _doRouteScene(scene));
  }

  // Simulate Valhalla's league rounds fromRound..toRound, update state, return results
  // strengthPenalty: points subtracted from avg squad rating (rotation effect)
  function _runBetweenRoundSim(fromRound, toRound, state, strengthPenalty) {
    const { clamp } = Utils;
    const { LeagueSim } = window.Game;

    // Average rating of current starting lineup, minus any rotation penalty
    const starters = state.lineup
      .map(id => state.squad.find(p => p.id === id))
      .filter(Boolean);
    const avgStrength = Math.max(60,
      (starters.length > 0
        ? starters.reduce((sum, p) => sum + p.rating, 0) / starters.length
        : 76) - (strengthPenalty || 0)
    );

    const results = LeagueSim.simulateBetweenRounds(
      state.league.fixtures, fromRound, toRound, avgStrength,
      { squad: state.squad, lineup: state.lineup }
    );

    results.forEach(r => {
      if      (r.outcome === 'win')  state.results.vplWins++;
      else if (r.outcome === 'draw') state.results.vplDraws++;
      else                           state.results.vplLosses++;

      const moraleChange = r.outcome === 'win' ? 4 : r.outcome === 'draw' ? 1 : -5;
      state.story.teamMorale     = clamp(state.story.teamMorale     + moraleChange, 0, 100);
      const fanDelta = r.outcome === 'win' ? 3 : r.outcome === 'draw' ? 1 : -2;
      state.story.fanReputation  = clamp(state.story.fanReputation  + fanDelta,    0, 100);

      const short = r.outcome === 'win' ? 'W' : r.outcome === 'draw' ? 'D' : 'L';
      state.results.lastResults.push(short);
      if (state.results.lastResults.length > 10) state.results.lastResults.shift();
      if (!state.results.lastResultDetails) state.results.lastResultDetails = [];
      state.results.lastResultDetails.push({ opponent: r.opponent || '', vGoals: r.valGoals, oGoals: r.oppGoals, competition: 'VPL' });
      if (state.results.lastResultDetails.length > 10) state.results.lastResultDetails.shift();

      // Record per-player stats for simulated matches
      if (r.events) {
        const fakeEvents = r.events.map(e => ({
          type: 'goal', isValhalla: true,
          scorerId: e.scorerId, assistId: e.assistId,
        }));
        State.recordPlayerStats(fakeEvents, r.potm, 'VPL', state.lineup);
      }
    });

    state.league.round = Math.max(state.league.round, toRound);

    // Recompute league position from actual fixtures
    const table = LeagueSim.computeTable(state.league.fixtures, state.league.round);
    const posIdx = table.findIndex(row => row.id === 'valhalla');
    if (posIdx >= 0) state.results.vplPosition = posIdx + 1;

    State.save();
    return results;
  }

  // After a VPL story match completes: ask about rotation, then simulate
  // the rounds until the next story match, show summary, advance.
  function _doPostVPLRounds(sceneId, nextId) {
    const state = State.get();
    const postRounds = window.Game.LeagueSim.getPostMatchRounds(sceneId);

    if (postRounds && postRounds.count > 0) {
      // Ask the rotation question before running the sim
      const rotScene = window.Game.StoryData.scenes.rotation_decision;
      Screens.Decision.render(rotScene, function onRotationChoice(choice) {
        const penalty = choice.strengthPenalty || 0;
        const simResults = _runBetweenRoundSim(postRounds.from, postRounds.to, State.get(), penalty);
        if (simResults.length > 0) {
          const count = postRounds.count;
          const gameWord = count === 1 ? 'game' : 'games';
          const transitionText = `The squad moves on — ${count} more VPL ${gameWord} to play before the next big match.`;
          Screens.Transition.show(
            { location: 'Valorian Premier League', text: transitionText },
            () => {
              Screens.LeagueRounds.show(simResults, () => {
                if (nextId) advance(nextId); else next();
              });
            }
          );
        } else {
          if (nextId) advance(nextId); else next();
        }
      });
      return;
    }

    if (nextId) advance(nextId); else next();
  }

  function _doRouteScene(scene) {
    switch (scene.type) {
      case 'story':
        Screens.Scene.render(scene, null); // scene.js handles advance via scene.next or next()
        break;

      case 'decision':
        Screens.Decision.render(scene);
        break;

      case 'match': {
        const isVPL = !scene.competition || scene.competition === 'VPL';
        if (isVPL) {
          // VPL matches: intercept advance to show post-match rounds summary
          Screens.Match.render(scene, (nextId) => _doPostVPLRounds(scene.id, nextId));
        } else {
          Screens.Match.render(scene);
        }
        break;
      }

      case 'minigame':
        routeMiniGame(scene);
        break;

      case 'gate':
        advance(scene.check(State.get()) ? scene.ifTrue : scene.ifFalse);
        break;

      case 'knockout_transition':
        Screens.KnockoutTransition.show(scene, () => {
          if (scene.next) advance(scene.next); else next();
        });
        break;

      case 'cup_aftermath':
        Screens.Transition.show(_buildCupAftermathTransition(scene), () => {
          if (scene.next) advance(scene.next); else next();
        });
        break;

      case 'league_aftermath':
        Screens.Transition.show(_buildLeagueAftermathTransition(), () => { next(); });
        break;

      case 'season_summary':
        Screens.SeasonSummary.show(State.get(), () => { next(); });
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
        Screens.Transfer.render(nextSceneId, { isMidSeason: scene.id === 'transfer_window_2' });
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

    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn-primary';
    continueBtn.style.maxWidth = '300px';
    continueBtn.textContent = 'Continue →';
    continueBtn.addEventListener('click', () => renderSackingEpilogue(endingKey));
    continueBtn.addEventListener('touchend', e => {
      e.preventDefault();
      renderSackingEpilogue(endingKey);
    }, { passive: false });
    screen.appendChild(continueBtn);

    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);
  }

  // ============================================================
  // SACKING EPILOGUE — the final joke screen
  // ============================================================

  // Five tiers of sarcasm, keyed to how well you did.
  const SACKING_TIERS = {
    // Won VPL + at least one major cup
    glory: {
      salutation: 'Dear {name},',
      body: [
        'The double. The VPL title. The cup. The sold-out stadium. The standing ovations.',
        'We\'ve decided to let you go.',
        'It\'s not you. It\'s football. No job is ever guaranteed in this game — not even after a season like that. Especially not after a season like that, actually. The board felt the team needed "new energy". The new energy earns twenty percent less than you.',
        'Your replacement has already been photographed holding the scarf.',
      ],
      signoff: 'With the deepest respect and zero self-awareness,',
    },
    // Won VPL only
    league_champion: {
      salutation: 'Dear {name},',
      body: [
        'League champions. First title in eleven years. The city was in the streets.',
        'You\'re sacked.',
        'The board considered keeping you on. They really did. Then someone mentioned a bigger name was available for slightly less money, and — well — you know how it goes.',
        'The trophy stays. You don\'t. Such is football.',
      ],
      signoff: 'With warm regards and a cardboard box,',
    },
    // Won a cup but not the league, or chose to walk away
    cup_or_walkaway: {
      salutation: 'Dear {name},',
      body: [
        'What a run. What a cup campaign. What a night at Wembley.',
        'Unfortunately, the board has determined that cup success — while extremely good for merchandise sales — does not constitute the full picture. The full picture, they feel, required a top-four league finish.',
        'You did not provide a top-four league finish.',
        'You are, therefore, sacked. But please do keep the winners\' medal. It\'s yours. We\'re not animals.',
      ],
      signoff: 'All the best (and we mean that, sort of),',
    },
    // Honourable failure — fought hard, no trophies
    honourable: {
      salutation: 'Dear {name},',
      body: [
        'No trophies. No titles. A league position that was... fine.',
        'The fans sang your name on the last day. That counts for something. Just not enough to keep your job.',
        'The club would like to thank you for your efforts and your professionalism. The club would also like their car parking pass back.',
        'Football is a cruel business. You always knew that. You told everyone that, actually. Several times. In press conferences.',
      ],
      signoff: 'Best wishes and don\'t take it personally (it\'s a little bit personal),',
    },
    // Terrible — deserved it
    deserved: {
      salutation: 'Dear {name},',
      body: [
        'You have been sacked.',
        'This is not a surprise to anyone. Not to the board. Not to the players. Not to the groundskeeper. Not to Sandra, who runs the pie stand behind the south stand and has been calling for your head since October.',
        'The results were not there. The performances were not there. On one occasion, you appeared to not be entirely there yourself.',
        'Go back to your pub. Shout at the television. It is where your talents lie. It is where, perhaps, they have always lain.',
        'Do not apply again.',
      ],
      signoff: 'Warmly (and we use that word loosely),',
    },
  };

  function renderSackingEpilogue(endingKey) {
    const state  = State.get();
    const r      = state.results;
    const name   = state.meta.managerName || 'The Gaffer';
    const titles = r.competitionWins || [];
    const hasVPL = titles.some(t => t.includes('VPL') || t.includes('League'));
    const hasCup = titles.some(t => !t.includes('VPL') && !t.includes('League'));

    // Pick tier
    let tierKey;
    if (endingKey === 'glory')                     tierKey = 'glory';
    else if (endingKey === 'league_champion')      tierKey = 'league_champion';
    else if (endingKey === 'underdog_cup')         tierKey = 'cup_or_walkaway';
    else if (endingKey === 'walk_away')            tierKey = 'cup_or_walkaway';
    else if (endingKey === 'youth_revolution' ||
             endingKey === 'legendary_failure')    tierKey = 'honourable';
    else                                           tierKey = 'deserved'; // sacked, mid-season, fallback

    const tier = SACKING_TIERS[tierKey];

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-sacking screen-enter';

    // "Official Notice" badge
    const badge = document.createElement('div');
    badge.className = 'sacking-badge';
    badge.textContent = '📋 OFFICIAL CLUB NOTICE';
    screen.appendChild(badge);

    // Final screen illustration
    const finalImg = document.createElement('img');
    finalImg.src = 'FinalScreen.png';
    finalImg.className = 'sacking-image';
    finalImg.alt = '';
    screen.appendChild(finalImg);

    // Letter card
    const letter = document.createElement('div');
    letter.className = 'sacking-letter';

    const salutation = document.createElement('p');
    salutation.className = 'sacking-salutation';
    salutation.textContent = tier.salutation.replace('{name}', name);
    letter.appendChild(salutation);

    tier.body.forEach(para => {
      const p = document.createElement('p');
      p.className = 'sacking-para';
      p.textContent = para;
      letter.appendChild(p);
    });

    const signoffEl = document.createElement('p');
    signoffEl.className = 'sacking-signoff';
    signoffEl.textContent = tier.signoff;
    letter.appendChild(signoffEl);

    const sig = document.createElement('p');
    sig.className = 'sacking-sig';
    sig.textContent = 'Paulo Ferretti';
    letter.appendChild(sig);

    const sigRole = document.createElement('p');
    sigRole.className = 'sacking-sig-role';
    sigRole.textContent = 'Chairman, FC Valhalla';
    letter.appendChild(sigRole);

    screen.appendChild(letter);

    // Play Again
    const playAgainBtn = document.createElement('button');
    playAgainBtn.className = 'btn-primary sacking-play-again';
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
    sacking: function (key) {
      renderSackingEpilogue(key || 'glory');
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
