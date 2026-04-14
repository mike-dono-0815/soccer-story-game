/* ============================================================
   PLAYER MOMENT SCREEN — Post-match key player splash
   Shows character portrait + self-aware quote after notable
   individual performances. Tap anywhere to dismiss.
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.PlayerMoment = (function () {

  // ── Quote pools ────────────────────────────────────────────────
  // star = Marco (always over-selling)
  // veteran = Roberto (always humble)
  // prodigy = Kai (wide-eyed, can't believe it)

  const QUOTES = {

    star: {
      scored_goal: [
        "That's what I do. Simple as that. You can analyse it all you want — it's just instinct.",
        "Goal? Obviously. I was always going to score. The only question was how good it would look.",
        "Did you see the keeper's face? He had no chance. Nobody does when I'm in that mood.",
        "Top corner. From that angle? Not many players in the world make that look easy. I do.",
        "I was waiting for that ball the whole game. When it came, I made no mistake. I never do.",
      ],
      scored_winner: [
        "The team needed a hero. I answered. That's what I'm here for.",
        "Match-winner. Again. I've stopped being surprised. The squad should start expecting it.",
        "When it mattered most, I delivered. Write that down — because it keeps happening.",
        "That's what separates me from the rest. When the game needs a moment, I create one.",
      ],
      scored_brace: [
        "Two goals? I was unlucky not to have four. The form is there — it's not going anywhere.",
        "Honestly? I was disappointed not to get a hat-trick. Two isn't enough for someone at my level.",
        "A brace. Not my best day, but I'll take it. The squad needs me and I deliver. Every time.",
        "Two goals and I'm still not satisfied. That's what makes me different.",
      ],
      scored_equaliser: [
        "They thought they had us. They forgot I was on the pitch.",
        "Behind? With me in the team? I don't accept that. So I fixed it.",
        "I wasn't going to let us lose. I refuse to lose. So I scored.",
        "One moment of quality changes everything. I provided it. You're welcome.",
      ],
      assisted: [
        "People miss this, but that pass was immaculate. I made that goal happen.",
        "The assist? Yes. I could have shot, but I'm a team player. Don't forget that.",
        "I set him up perfectly. The finish was... acceptable.",
        "Every great goal starts with a great pass. I gave him exactly what he needed.",
        "I made him look good out there. That's what I do for this team.",
      ],
      potm: [
        "Was there any doubt? Really? Was there any doubt at all?",
        "Best player on the pitch. I know it, the fans know it, everyone in that stadium knows it.",
        "Player of the Match. Again. I'm starting to lose count.",
        "Give it to someone else next time, just so they know what it feels like.",
        "They could give me this award every week and it still wouldn't feel like enough.",
      ],
    },

    veteran: {
      scored_goal: [
        "The goal? It was a team goal really. I just happened to be at the end of it.",
        "I got lucky, honestly. It bobbled kindly and I had a clear sight. The lads did the hard work.",
        "At my age, you don't think — you just react. The boys set everything up beautifully.",
        "I was in the right place because my teammates put me there. I'll thank them properly later.",
        "Seventeen years as a professional and a goal still surprises me a little.",
      ],
      scored_winner: [
        "The lads deserved that result. I'm just glad I could contribute something at the end.",
        "Thirty-four years of professional football teaches you one thing: stay in the game. Something will come.",
        "I didn't even celebrate properly. Too relieved. The boys put so much in today.",
        "That goal belongs to everyone in that dressing room. I was just the last one to touch it.",
      ],
      scored_brace: [
        "Two goals — I honestly don't know what to say. My body surprised me today.",
        "The Gaffer will be more shocked than I am. These things don't happen often anymore. I'll enjoy it.",
        "Two goals at my age? The physio is going to think I've been hiding something.",
      ],
      scored_equaliser: [
        "We weren't going to lose today. The character in this group is remarkable.",
        "I just did what needed to be done. Any of the lads would have done the same.",
        "The goal isn't mine. It belongs to everyone who kept fighting when it was difficult.",
      ],
      assisted: [
        "I just played the obvious pass. He made the run. That's his goal.",
        "An easy delivery to make. He did the difficult part — the finish was exceptional.",
        "I found him and he did the rest. The credit belongs entirely to him.",
        "That's a good ball, nothing more. Give the credit to the finish.",
      ],
      potm: [
        "That award belongs to the whole squad. I just ran around a lot today.",
        "Seventeen years as a professional and I still feel I don't deserve these things.",
        "The Gaffer's face when they called my name was worth more than any award.",
        "Give it to the fans. They were the real players out there today.",
        "I'll put it on a shelf and forget about it tomorrow. There's another game to prepare for.",
      ],
    },

    prodigy: {
      scored_goal: [
        "I don't know. I just hit it. And then it was in? And the crowd just... I need a minute.",
        "My head went completely blank. I've trained for that moment a thousand times. It still felt unreal.",
        "I looked up and the net was moving and I thought — wait, did I just... yes. Yes I did.",
        "I've imagined scoring a professional goal maybe a million times. It's better than I imagined.",
        "I couldn't hear anything after it went in. Just noise. Just noise everywhere.",
      ],
      scored_winner: [
        "The winner? I scored the WINNER? I'm still processing this.",
        "I didn't even know it was the winner until the final whistle. Then my legs just stopped working.",
        "I might have cried a bit in the tunnel. I'm not admitting that. But I might have.",
        "Roberto told me it was the winner and I had to sit down for a second.",
      ],
      scored_brace: [
        "Two goals. In the same game. I need to lie down for a bit.",
        "I keep expecting someone to tell me it doesn't count. It counts, right? Both of them count?",
        "My mum is going to lose her mind when she sees this.",
      ],
      scored_equaliser: [
        "We were losing and I thought — this is the moment. And somehow it worked.",
        "The Gaffer told me to make something happen. I didn't think he meant literally immediately.",
        "I was so nervous running onto that ball. But I just... I just hit it. And it went in.",
      ],
      assisted: [
        "I just played the pass I could see. He did the hard part. That's his goal, not mine.",
        "I panicked a bit when I got it, to be honest. But I found him and he finished it perfectly.",
        "I was just trying not to mess it up. Luckily it worked out.",
        "The run opened the space. I just spotted it. Lena always says 'play what you see'. I did.",
      ],
      potm: [
        "They said my name. Over the speakers. MY name. I need to call my mum.",
        "Player of the Match? There must have been a mistake. I'll check the board again.",
        "I'm going to remember this moment for the rest of my life. All of it.",
        "Roberto patted me on the back after. That meant more than the award, honestly.",
        "I don't think this is real. This doesn't feel real.",
      ],
    },
  };

  const ACHIEVEMENT_LABELS = {
    scored_goal:       'Goal',
    scored_winner:     'Match Winner',
    scored_brace:      'Brace',
    scored_equaliser:  'Equaliser',
    assisted:          'Decisive Assist',
    potm:              'Player of the Match',
  };

  function quoteKey(type, detail) {
    if (type === 'scored') return `scored_${detail || 'goal'}`;
    if (type === 'assisted') return 'assisted';
    return 'potm';
  }

  function pickQuote(charId, type, detail) {
    const key  = quoteKey(type, detail);
    const pool = (QUOTES[charId] || {})[key] || QUOTES[charId]?.potm || ['...'];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // ── Render ─────────────────────────────────────────────────────

  function show(moment, onDone) {
    const { Characters, Utils } = window.Game;
    const { character, player, type, detail } = moment;
    const char = Characters.get(character);
    const quote = pickQuote(character, type, detail);
    const label = ACHIEVEMENT_LABELS[quoteKey(type, detail)] || 'Player of the Match';

    const div = document.createElement('div');
    div.className = 'game-container';

    const screen = document.createElement('div');
    screen.className = 'screen-player-moment screen-enter';
    screen.style.setProperty('--char-color', char.color || '#f5c842');

    // Tap hint — centred at top
    const hint = document.createElement('div');
    hint.className = 'scene-tap-hint';
    hint.textContent = 'tap anywhere to continue';
    screen.appendChild(hint);

    // Portrait
    const portraitWrap = document.createElement('div');
    portraitWrap.className = 'player-moment-portrait';
    portraitWrap.appendChild(Characters.buildPortrait(character, 'large'));
    screen.appendChild(portraitWrap);

    // Info card
    const card = document.createElement('div');
    card.className = 'player-moment-card';

    const achiev = document.createElement('div');
    achiev.className = 'player-moment-achievement';
    achiev.textContent = label;

    const name = document.createElement('div');
    name.className = 'player-moment-name';
    name.style.color = char.color;
    name.textContent = player.name;

    const quoteEl = document.createElement('p');
    quoteEl.className = 'player-moment-quote';
    quoteEl.textContent = `"${quote}"`;

    card.appendChild(achiev);
    card.appendChild(name);
    card.appendChild(quoteEl);
    screen.appendChild(card);

    div.appendChild(screen);

    const root = document.getElementById('game-root');
    root.innerHTML = '';
    root.appendChild(div);

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      screen.classList.add('screen-exit');
      setTimeout(() => { div.remove(); if (onDone) onDone(); }, 300);
    }
    screen.addEventListener('click', dismiss);
    screen.addEventListener('touchend', e => { e.preventDefault(); dismiss(); }, { passive: false });
  }

  return { show };

})();
