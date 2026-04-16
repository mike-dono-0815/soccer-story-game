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
      scored_hat_trick: [
        "Three goals. A hat-trick. Some people wait their whole career for this. I've been expecting it for weeks.",
        "Hat-trick. I'd say I'm surprised, but I'm not. I've been doing this since I was twelve.",
        "Three goals and people still talk about other strikers. What does it take?",
        "The hat-trick was the least this performance deserved. I was absolutely imperious today.",
        "I told Lena before kick-off. I said: I feel something special today. She didn't believe me. She will now.",
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
      scored_hat_trick: [
        "Three goals at my age. I need to call my doctor first, and then my wife.",
        "The lads set me up perfectly three times. I just finished. They deserve all the credit for this.",
        "I've scored maybe two hat-tricks in thirty years of football. Today was something very special.",
        "I don't know what to say. It's a hat-trick. I'm thirty-four. None of this makes sense.",
        "The young lads are staring at me in the dressing room. I don't blame them. I'm staring at myself.",
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
      scored_hat_trick: [
        "Three goals. Three. I keep counting them. I've counted them eight times now. Three.",
        "Hat-trick? A hat-trick? In a professional match? ME?",
        "I don't — I can't — someone needs to explain this to me because I am completely lost.",
        "My phone has completely melted. I don't know what to do. Three goals.",
        "Roberto said 'well done lad' in the tunnel and I nearly cried. Three goals. Actually three.",
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

  // ── Category tags (small badge above headline) ────────────────
  const CATEGORY_TAGS = {
    scored_goal:      'GOAL',
    scored_winner:    'MATCH WINNER',
    scored_brace:     'BRACE',
    scored_hat_trick: '🎩 HAT-TRICK',
    scored_equaliser: 'EQUALISER',
    assisted:         'ASSIST',
    potm:             'PLAYER OF THE MATCH',
  };

  // ── Narrative headlines ────────────────────────────────────────
  // {name} = player first-name / short name, {score} = score string e.g. "2–1"
  const HEADLINES = {
    scored_goal: [
      "What a finish from {name} — making it {score}!",
      "{name} finds the net at {score}. The crowd erupts.",
      "A goal for {name}. Timed to perfection.",
      "{name} strikes and it's {score}. This changes the game.",
      "That's a goal — and it belongs to {name}!",
      "{name} steps up and delivers. {score} on the board.",
    ],
    scored_winner: [
      "{name} wins it for Valhalla. Scenes!",
      "The match-winner — it's {name}. Unbelievable.",
      "{name} delivers when it matters most. Three points secured.",
      "Cue the celebrations — {name} seals the points!",
      "That's the one. {name} puts the result beyond doubt.",
      "Nobody will forget this. {name} with the winner.",
    ],
    scored_brace: [
      "Two goals for {name}. An astonishing brace.",
      "{name} doubles up — what a day for the {pos}.",
      "That's two from {name}. Impossible to stop today.",
      "{name} scores twice and the fans are on their feet.",
      "A brace for {name}. The performance of the season so far.",
    ],
    scored_hat_trick: [
      "Hat-trick hero! {name} with three goals today.",
      "{name} completes the hat-trick. History made at Nordstrom Park.",
      "Three goals from {name}. A moment nobody in that stadium will ever forget.",
      "The hat-trick is complete! {name} is absolutely unstoppable.",
      "{name} scores three. The crowd haven't stopped singing.",
      "Three. Goals. {name} puts on a show for the ages.",
    ],
    scored_equaliser: [
      "{name} pulls Valhalla level. We're back in this!",
      "Don't count them out — {name} makes it {score}!",
      "{name} refuses to accept defeat. The equaliser is his.",
      "Stunning from {name} — Valhalla are level at {score}!",
      "{name} drags Valhalla back into the contest. {score}.",
    ],
    assisted: [
      "The vision of {name} — a decisive assist.",
      "{name} creates the moment. That pass was exceptional.",
      "A game-changing assist from {name}. Pure craft.",
      "It was {name} who made it happen. What a delivery.",
      "The architect — {name} with an assist to remember.",
      "{name} sees it before anyone else. Brilliant.",
    ],
    potm: [
      "An outstanding performance. {name} takes the honours.",
      "{name} was simply the best player on the pitch today.",
      "Player of the Match — {name}. Nobody would argue.",
      "The award goes where it belongs: {name}.",
      "From first whistle to last, {name} was magnificent.",
      "Head and shoulders above the rest. {name} — Player of the Match.",
    ],
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

  function pickHeadline(type, detail, playerName, scoreStr, position) {
    const key  = quoteKey(type, detail);
    const pool = HEADLINES[key] || HEADLINES.potm;
    const raw  = pool[Math.floor(Math.random() * pool.length)];
    const shortName = playerName.split(' ')[0]; // first name
    const pos = position || '';
    return raw
      .replace(/\{name\}/g, shortName)
      .replace(/\{score\}/g, scoreStr || '–')
      .replace(/\{pos\}/g, pos);
  }

  // ── Render ─────────────────────────────────────────────────────

  function show(moment, onDone) {
    const { Characters, Utils } = window.Game;
    const { character, player, type, detail, scoreStr } = moment;
    const char = Characters.get(character);
    const quote    = pickQuote(character, type, detail);
    const headline = pickHeadline(type, detail, player.name, scoreStr, player.position);
    const key      = quoteKey(type, detail);
    const tag      = CATEGORY_TAGS[key] || 'PLAYER OF THE MATCH';

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

    // Small category tag
    const tagEl = document.createElement('div');
    tagEl.className = 'player-moment-achievement';
    tagEl.textContent = tag;

    // Narrative headline
    const headlineEl = document.createElement('div');
    headlineEl.className = 'player-moment-headline';
    headlineEl.textContent = headline;

    // Player name
    const name = document.createElement('div');
    name.className = 'player-moment-name';
    name.style.color = char.color;
    name.textContent = player.name;

    const quoteEl = document.createElement('p');
    quoteEl.className = 'player-moment-quote';
    quoteEl.textContent = `"${quote}"`;

    card.appendChild(tagEl);
    card.appendChild(headlineEl);
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
