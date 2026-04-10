/* ============================================================
   STORY DATA — All scenes, events, and season calendar
   ============================================================ */

window.Game = window.Game || {};

window.Game.StoryData = (function () {

  // ============================================================
  // SCENE DEFINITIONS
  // Each scene: { id, type, background, character, name, dialogue[], next, condition? }
  // Each decision: { id, type, background, character, prompt, choices[] }
  // Each match: { id, type, competition, opponent, homeAway, difficulty, next, phase, week }
  // ============================================================

  const scenes = {

    // ----------------------------------------------------------------
    // MENU / SETUP
    // ----------------------------------------------------------------

    main_menu: { id: 'main_menu', type: 'menu' },

    // ----------------------------------------------------------------
    // PRE-SEASON
    // ----------------------------------------------------------------

    intro: {
      id: 'intro', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Welcome to Valhalla, Gaffer. I\'m Lena — your assistant. I\'ve been here six years.',
        'The training ground isn\'t much, but the squad has heart. We finished ninth last season.',
        'The Chairman has... ambitions. He wants top four this year. I\'ll leave that conversation to him.',
        'Come on — let me show you around. There\'s someone you need to meet.',
      ],
      next: 'meet_paulo',
      calendarLabel: 'Arrival at Valhalla',
    },

    meet_paulo: {
      id: 'meet_paulo', type: 'story', phase: 'preseason',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      dialogue: [
        'You\'re finally here. Good. Sit down.',
        'I didn\'t hire you to be comfortable. I hired you to win. Top four, minimum. Understand?',
        'We have twelve million in the transfer budget. Don\'t waste it on sentiment.',
        'I\'ll be watching everything. Every result, every press conference, every training session.',
        'Now — go meet your squad. And don\'t let me down.',
      ],
      next: 'meet_marco',
      calendarLabel: 'Meet the Chairman',
    },

    meet_marco: {
      id: 'meet_marco', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'star', name: 'Marco Silva',
      dialogue: [
        'Marco "El Tornado" Silva barely glances up from his phone as you approach.',
        '"Oh. The new gaffer. Cool." He goes back to scrolling.',
        'Lena whispers: "He had a fallout with the last manager. Give him time."',
        'Marco suddenly looks up. "Just don\'t put me on the bench. I\'m not a bench player."',
        'He holds your gaze for a long moment. There\'s fire in those eyes — and something else. A test.',
      ],
      next: 'meet_roberto',
      calendarLabel: 'Meet Marco Silva',
    },

    meet_roberto: {
      id: 'meet_roberto', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'veteran', name: 'Roberto Okafor',
      dialogue: [
        'Roberto Okafor walks over with a warm smile and a firm handshake.',
        '"Good to have you, Gaffer. The boys need direction. I\'ll back you — we all will."',
        '"Seventeen years as a pro. This is probably my last season. I\'d like to end it right."',
        'He lowers his voice. "Marco\'s a good kid. He just needs to feel trusted."',
        '"Whatever you decide — I\'m with you. Just be honest with us, and we\'ll run through walls."',
      ],
      next: 'style_choice',
      calendarLabel: 'Meet Roberto Okafor',
    },

    style_choice: {
      id: 'style_choice', type: 'decision', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      prompt: 'Lena hands you a whiteboard. "First session with the full squad tomorrow. What\'s our identity going to be, Gaffer?"',
      calendarLabel: 'Define Your Philosophy',
      choices: [
        {
          label: '⚡ The Visionary',
          hint: 'Youth, innovation, high-press chaos. We build something new.',
          effects: { managerStyle: 'visionary', teamMorale: +5, boardConfidence: -5, youthInvestment: +20 },
          next: 'style_visionary_reaction',
        },
        {
          label: '💼 The Pragmatist',
          hint: 'Results first, no apologies. We buy proven winners.',
          effects: { managerStyle: 'pragmatist', boardConfidence: +10, teamMorale: -5 },
          next: 'style_pragmatist_reaction',
        },
        {
          label: '❤️ The People\'s Champion',
          hint: 'Culture and community. We win together or not at all.',
          effects: { managerStyle: 'champion', teamMorale: +12, mediaRep: +8, boardConfidence: -5 },
          next: 'style_champion_reaction',
        },
      ],
    },

    style_visionary_reaction: {
      id: 'style_visionary_reaction', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena grins. "Bold. The squad\'s going to need time to learn this system."',
        '"Paulo won\'t love the patience required. But if it works..."',
        '"Let\'s start by looking at the youth academy. I think there\'s someone you should see."',
      ],
      next: 'tour_choice',
    },

    style_pragmatist_reaction: {
      id: 'style_pragmatist_reaction', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena nods slowly. "Paulo will be happy. The board love a results-first manager."',
        '"Just be careful — if we push too hard, we might lose the dressing room."',
        '"Let\'s make the most of the transfer window. We need quality, fast."',
      ],
      next: 'tour_choice',
    },

    style_champion_reaction: {
      id: 'style_champion_reaction', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena\'s eyes light up. "That\'s what this club needs. Real leadership."',
        '"The fans have been calling for something like this for years."',
        '"Paulo might push back if results are slow. But the people will love you."',
      ],
      next: 'tour_choice',
    },

    tour_choice: {
      id: 'tour_choice', type: 'decision', phase: 'preseason',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      prompt: '"I\'ve arranged a pre-season tour. Three options. Pick one — it goes out tomorrow."',
      calendarLabel: 'Pre-Season Tour',
      choices: [
        {
          label: '🏰 Europe',
          hint: 'Competitive friendlies. Tough opposition, high exposure.',
          effects: { tourChoice: 'europe', boardConfidence: +8, teamMorale: +5, mediaRep: +5 },
          next: 'tour_europe',
        },
        {
          label: '🌏 Asia',
          hint: 'Commercial tour. Big crowds, lighter preparation.',
          effects: { tourChoice: 'asia', boardConfidence: +5, teamMorale: +8, mediaRep: +10 },
          next: 'tour_asia',
        },
        {
          label: '🌎 Americas',
          hint: 'Long trip, intense warm-up matches, good for team bonding.',
          effects: { tourChoice: 'americas', boardConfidence: +3, teamMorale: +15, mediaRep: +5 },
          next: 'tour_americas',
        },
      ],
    },

    tour_europe: {
      id: 'tour_europe', type: 'story', phase: 'preseason',
      background: 'bg-tour-europe',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Three tough games against European clubs. The results are mixed — but the intensity shows.',
        'Marco scores twice in the final friendly. He\'s grinning in training for the first time.',
        '"That\'s the best preparation we could have had," Lena says. "The squad knows what level we\'re aiming for."',
      ],
      next: 'budget_choice',
    },

    tour_asia: {
      id: 'tour_asia', type: 'story', phase: 'preseason',
      background: 'bg-tour-asia',
      character: 'journalist', name: 'Alexandra Chen',
      dialogue: [
        'The tour is a spectacle. Forty thousand fans in Bangkok for a friendly.',
        'Alexandra Chen from the Valorian Tribune catches up with you at the airport.',
        '"Gaffer, what\'s the message you\'re sending with this commercial trip?"',
        'The cameras roll. Whatever you say next will run on every back page.',
      ],
      next: 'budget_choice',
    },

    tour_americas: {
      id: 'tour_americas', type: 'story', phase: 'preseason',
      background: 'bg-tour-americas',
      character: 'veteran', name: 'Roberto Okafor',
      dialogue: [
        'Ten days in Buenos Aires and São Paulo. The flights are brutal. The bonding is real.',
        'Roberto organises team dinners every night. By the end, the squad is laughing, sharing stories.',
        '"This was smart, Gaffer," he says on the flight home. "We feel like a team now."',
      ],
      next: 'budget_choice',
    },

    budget_choice: {
      id: 'budget_choice', type: 'decision', phase: 'preseason',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      prompt: '"Beyond transfers, we\'ve got limited funds for infrastructure. Where do you want to put the focus?"',
      calendarLabel: 'Budget Allocation',
      choices: [
        {
          label: '🏗 Training Facilities',
          hint: 'Better conditions improve development and morale long-term.',
          effects: { budgetChoice: 'facilities', teamMorale: +6, youthInvestment: +15 },
          next: 'transfer_window_1',
        },
        {
          label: '💰 Transfer Budget',
          hint: 'Boost spending power. Add £3M to the war chest.',
          effects: { budgetChoice: 'signings', boardConfidence: +5 },
          rootEffects: { budget: +3 },
          next: 'transfer_window_1',
        },
        {
          label: '👨‍⚕️ Support Staff',
          hint: 'Better physios, analysts and sports psychologist.',
          effects: { budgetChoice: 'staff', teamMorale: +8, mediaRep: +5, staffCrisis: false },
          next: 'transfer_window_1',
        },
      ],
    },

    transfer_window_1: {
      id: 'transfer_window_1', type: 'minigame', phase: 'preseason',
      miniGameType: 'transfer',
      calendarLabel: 'Transfer Window',
      next: 'captain_choice',
    },

    captain_choice: {
      id: 'captain_choice', type: 'decision', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Gaffer — before the season starts, the squad needs to know who\'s wearing the armband."',
      calendarLabel: 'Choose Captain',
      choices: [
        {
          label: '⚡ Marco Silva',
          hint: 'He\'ll ignite the dressing room. High risk — but his ego needs this.',
          effects: { captainId: 'star', captainChosen: true, starHappiness: +20, teamMorale: +5, boardConfidence: +5 },
          next: 'captain_marco',
        },
        {
          label: '🛡 Roberto Okafor',
          hint: 'The safe, wise choice. He\'ll provide stability and lead by example.',
          effects: { captainId: 'veteran', captainChosen: true, teamMorale: +12, boardConfidence: +8 },
          next: 'captain_roberto',
        },
        {
          label: '🗳 Let the Team Vote',
          hint: 'Democratic — but you cede control of the narrative.',
          effects: { captainId: 'vote', captainChosen: true, teamMorale: +18, boardConfidence: -5, mediaRep: +8 },
          next: 'captain_vote',
        },
      ],
    },

    captain_marco: {
      id: 'captain_marco', type: 'story', phase: 'preseason',
      background: 'bg-locker-room',
      character: 'star', name: 'Marco Silva',
      dialogue: [
        'Marco goes very still when you tell him. Then a slow smile spreads across his face.',
        '"Gaffer... I won\'t let you down. I swear it."',
        'In the locker room he stands taller. Roberto gives him a respectful nod.',
        'Lena catches your eye: "Big gamble. But I think it might pay off."',
      ],
      next: 'training_1',
    },

    captain_roberto: {
      id: 'captain_roberto', type: 'story', phase: 'preseason',
      background: 'bg-locker-room',
      character: 'veteran', name: 'Roberto Okafor',
      dialogue: [
        'Roberto takes the armband without ceremony and holds it to his chest for a moment.',
        '"Thank you, Gaffer. I\'ll make sure this group is ready."',
        'Marco claps — genuinely. The gesture seems to mean everything.',
        '"He\'s a natural leader," Lena says. "The squad will run through walls for him."',
      ],
      next: 'training_1',
    },

    captain_vote: {
      id: 'captain_vote', type: 'story', phase: 'preseason',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'The vote is secret ballot. Fifteen minutes of heated discussion in the dressing room.',
        'The result: Roberto Okafor, twelve votes. Marco Silva, four. Okafor accepts with humility.',
        '"It\'s the right result," Marco mutters, just loud enough for you to hear.',
        '"Beautiful," Lena says. "The squad owns this decision. That\'s powerful."',
      ],
      next: 'training_1',
    },

    training_1: {
      id: 'training_1', type: 'minigame', phase: 'preseason',
      miniGameType: 'training',
      calendarLabel: 'First Training Week',
      next: 'lineup_friendly',
    },

    lineup_friendly: {
      id: 'lineup_friendly', type: 'minigame', phase: 'preseason',
      miniGameType: 'lineup',
      calendarLabel: 'Pick Lineup — Friendly',
      next: 'match_friendly',
    },

    match_friendly: {
      id: 'match_friendly', type: 'match', phase: 'preseason',
      competition: 'Pre-Season Friendly',
      opponent: 'Northgate City',
      homeAway: 'home',
      difficulty: 0.4,
      week: 0,
      calendarLabel: 'vs. Northgate City',
      next: 'paulo_demands',
    },

    paulo_demands: {
      id: 'paulo_demands', type: 'decision', phase: 'preseason',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      prompt: '"Good pre-season. Now — how do you define success this year? Because mine is clear: trophies."',
      calendarLabel: 'Board Meeting — Expectations',
      choices: [
        {
          label: '"Top four is the target."',
          hint: 'Aligns with Paulo\'s demands. Board happy — pressure is on.',
          effects: { boardConfidence: +10, teamMorale: -5 },
          next: 'season_kickoff',
        },
        {
          label: '"We focus on progress, not position."',
          hint: 'Buys goodwill — for now. Paulo won\'t wait forever.',
          effects: { boardConfidence: -5, teamMorale: +8, mediaRep: +5 },
          next: 'season_kickoff',
        },
        {
          label: '"We\'re going to win the league."',
          hint: 'Bold promise. The board is electrified — and so is the pressure.',
          effects: { boardConfidence: +15, teamMorale: +5, mediaRep: +10 },
          next: 'season_kickoff',
        },
      ],
    },

    // ----------------------------------------------------------------
    // SEASON KICKOFF + EARLY LEAGUE
    // ----------------------------------------------------------------

    season_kickoff: {
      id: 'season_kickoff', type: 'story', phase: 'league',
      background: 'bg-stadium-dawn',
      character: 'narrator',
      dialogue: [
        'MATCHDAY ONE. The Valorian Premier League season begins.',
        'The Valhalla faithful pack Nordstrom Park. Sixty-two thousand voices, one heartbeat.',
        'You stand in the tunnel. The roar builds above you.',
        'This is it. Everything you\'ve worked for starts now.',
      ],
      next: 'lineup_league_1',
      calendarLabel: 'Season Begins',
      week: 1,
    },

    lineup_league_1: {
      id: 'lineup_league_1', type: 'minigame', phase: 'league',
      miniGameType: 'lineup',
      calendarLabel: 'Pick Lineup — League',
      next: 'match_league_1',
    },

    match_league_1: {
      id: 'match_league_1', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Red Storm FC',
      homeAway: 'home',
      difficulty: 0.45,
      week: 1,
      calendarLabel: 'vs. Red Storm FC',
      next: 'post_match_1',
    },

    post_match_1: {
      id: 'post_match_1', type: 'decision', phase: 'league',
      background: 'bg-press-room',
      character: 'journalist', name: 'Alexandra Chen',
      prompt: '"Gaffer, first game of the season — what\'s your honest assessment of the performance?"',
      calendarLabel: 'Post-Match Press',
      choices: [
        {
          label: '"We showed exactly what we\'re about."',
          hint: 'Confident. Fans love it. Board nodding along.',
          effects: { mediaRep: +8, boardConfidence: +5 },
          next: 'training_2',
        },
        {
          label: '"There\'s a lot to improve on."',
          hint: 'Honest. Builds credibility with the press.',
          effects: { mediaRep: +5, boardConfidence: -3, teamMorale: -3 },
          next: 'training_2',
        },
        {
          label: '"Ask me again in ten games."',
          hint: 'Deflects. Alexandra writes a "mysterious manager" piece.',
          effects: { mediaRep: +3 },
          next: 'training_2',
        },
      ],
    },

    training_2: {
      id: 'training_2', type: 'minigame', phase: 'league',
      miniGameType: 'training',
      calendarLabel: 'Training Week 2',
      next: 'match_league_2',
    },

    match_league_2: {
      id: 'match_league_2', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Castello FC',
      homeAway: 'away',
      difficulty: 0.52,
      week: 3,
      calendarLabel: 'vs. Castello FC (A)',
      next: 'fa_cup_r1',
    },

    fa_cup_r1: {
      id: 'fa_cup_r1', type: 'match', phase: 'cups',
      competition: 'FA Cup',
      opponent: 'Holbrook Rangers',
      homeAway: 'home',
      difficulty: 0.30,
      week: 4,
      calendarLabel: 'FA Cup Round 1',
      next: 'injury_event',
    },

    injury_event: {
      id: 'injury_event', type: 'decision', phase: 'league',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Gaffer — bad news. Marco took a knock in training. The physio says three weeks minimum. What do we do?"',
      calendarLabel: 'Marco Injured!',
      choices: [
        {
          label: 'Rest him properly.',
          hint: 'Safe. He misses three games. Morale dips, but he comes back sharp.',
          effects: { starInjured: true, teamMorale: -5, starHappiness: +5 },
          next: 'injury_rest_scene',
        },
        {
          label: 'Rush him back in two weeks.',
          hint: 'He plays, but risks a longer injury. Morale stays up.',
          effects: { starInjured: false, starRushedBack: true, teamMorale: +3, starHappiness: -5 },
          next: 'injury_rush_scene',
        },
        {
          label: 'Call up youth — Kai Voss steps in.',
          hint: 'If Voss is on the squad, this is his chance. Invests in the future.',
          effects: { starInjured: true, youthInvestment: +15, teamMorale: +2 },
          next: 'injury_youth_scene',
          condition: { flag: 'prodigyOnSquad', truthy: true, thenScene: 'injury_youth_scene', elseScene: 'injury_rest_scene' },
        },
      ],
    },

    injury_rest_scene: {
      id: 'injury_rest_scene', type: 'story', phase: 'league',
      background: 'bg-locker-room',
      character: 'star', name: 'Marco Silva',
      dialogue: [
        'Marco nods slowly when you tell him. "I get it, Gaffer. Sometimes you have to sit."',
        '"But I\'ll be back sharper. Watch."',
        'Three weeks pass. When he returns, there\'s a new hunger in his eyes.',
      ],
      next: 'board_pressure_1',
    },

    injury_rush_scene: {
      id: 'injury_rush_scene', type: 'story', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Marco is back in two weeks. He plays through the pain, scoring once.',
        'But by week four, the physio pulls you aside. "The injury\'s worse."',
        'Marco misses six weeks. He doesn\'t look at you for a while after that.',
      ],
      next: 'board_pressure_1',
    },

    injury_youth_scene: {
      id: 'injury_youth_scene', type: 'story', phase: 'league',
      background: 'bg-training-ground',
      character: 'prodigy', name: 'Kai Voss',
      dialogue: [
        'Kai Voss gets the call-up. Seventeen years old. He looks terrified and thrilled in equal measure.',
        '"Don\'t think. Just play," you tell him before his first game.',
        'He doesn\'t score. But he runs like the wind and the crowd sings his name by the end.',
        'Lena is beaming. "Gaffer — that kid is something special."',
      ],
      next: 'board_pressure_1',
    },

    board_pressure_1: {
      id: 'board_pressure_1', type: 'decision', phase: 'league',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      prompt: '"I\'m watching the table. We\'re not where I expected. What\'s your explanation?"',
      calendarLabel: 'Board Meeting — Pressure',
      choices: [
        {
          label: '"We\'re building momentum. Trust the process."',
          hint: 'Buys goodwill but Paulo loses patience faster later.',
          effects: { boardConfidence: -5, teamMorale: +5 },
          next: 'match_league_3',
        },
        {
          label: '"Injuries have hurt us. We\'re adapting."',
          hint: 'Factual. Paulo accepts it — barely.',
          effects: { boardConfidence: +3, mediaRep: +3 },
          next: 'match_league_3',
        },
        {
          label: '"Give me the transfer budget and we\'ll fix it now."',
          hint: 'Paulo likes decisiveness. He adds £2M to the budget.',
          effects: { boardConfidence: +8, teamMorale: -3 },
          rootEffects: { budget: +2 },
          next: 'match_league_3',
        },
      ],
    },

    match_league_3: {
      id: 'match_league_3', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Ironclad United',
      homeAway: 'home',
      difficulty: 0.60,
      week: 6,
      calendarLabel: 'vs. Ironclad United',
      next: 'discipline_event',
    },

    discipline_event: {
      id: 'discipline_event', type: 'decision', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Gaffer — Sven Halberg was spotted in a nightclub at 2am before the match. Do you address this?"',
      calendarLabel: 'Discipline Decision',
      choices: [
        {
          label: 'Fine him two weeks\' wages.',
          hint: 'Sets a standard. The squad notices.',
          effects: { teamMorale: -3, boardConfidence: +5, mediaRep: +5 },
          next: 'rivals_intro',
        },
        {
          label: 'Suspend him for one game.',
          hint: 'Public and decisive. Paulo is pleased.',
          effects: { teamMorale: -6, boardConfidence: +8 },
          next: 'rivals_intro',
        },
        {
          label: 'Handle it privately.',
          hint: 'Protects the player. Builds loyalty in the dressing room.',
          effects: { teamMorale: +5, mediaRep: -5, starHappiness: +5 },
          next: 'rivals_intro',
        },
      ],
    },

    rivals_intro: {
      id: 'rivals_intro', type: 'story', phase: 'league',
      background: 'bg-press-room',
      character: 'rival', name: 'Ivan Sorokin',
      dialogue: [
        'The pre-match press conference. Ivan Sorokin, manager of Ironclad United, takes the mic next.',
        '"Valhalla are a nice little club. Cute project. But this league is built for serious teams."',
        'The room goes quiet. The cameras turn to you.',
        'Sorokin smirks. He wants a reaction.',
      ],
      next: 'rivals_response',
    },

    rivals_response: {
      id: 'rivals_response', type: 'decision', phase: 'league',
      background: 'bg-press-room',
      character: 'journalist', name: 'Alexandra Chen',
      prompt: '"Gaffer — Ivan Sorokin just called you a \'nice little club\'. Your response?"',
      calendarLabel: 'Rival Manager Clash',
      choices: [
        {
          label: '"We let our football do the talking."',
          hint: 'Dignified. Gets massive media play. Sorokin is furious.',
          effects: { mediaRep: +12, rivalityEscalated: false, teamMorale: +8 },
          next: 'champions_group_1',
        },
        {
          label: '"See you on the pitch, Ivan."',
          hint: 'Short. Sharp. The squad loves it. Sorokin escalates the war.',
          effects: { mediaRep: +8, rivalityEscalated: true, teamMorale: +12, boardConfidence: -3 },
          next: 'champions_group_1',
        },
        {
          label: '"Honestly? He\'s not wrong yet. But he will be."',
          hint: 'Disarming and humble. Unexpected. The press eats it up.',
          effects: { mediaRep: +15, teamMorale: +5 },
          next: 'champions_group_1',
        },
      ],
    },

    // ----------------------------------------------------------------
    // CUPS — CHAMPIONS CUP + FA CUP PROGRESS
    // ----------------------------------------------------------------

    champions_group_1: {
      id: 'champions_group_1', type: 'match', phase: 'cups',
      competition: 'Champions Cup',
      opponent: 'FC Bayern Klauss',
      homeAway: 'away',
      difficulty: 0.60,
      week: 7,
      calendarLabel: 'Champions Cup Group 1',
      next: 'training_3',
    },

    training_3: {
      id: 'training_3', type: 'minigame', phase: 'league',
      miniGameType: 'training',
      calendarLabel: 'Training Week',
      next: 'match_league_4',
    },

    match_league_4: {
      id: 'match_league_4', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Northern Stars FC',
      homeAway: 'away',
      difficulty: 0.48,
      week: 8,
      calendarLabel: 'vs. Northern Stars (A)',
      next: 'contract_decision',
    },

    contract_decision: {
      id: 'contract_decision', type: 'decision', phase: 'league',
      background: 'bg-office',
      character: 'veteran', name: 'Roberto Okafor',
      prompt: '"Gaffer, I need to know — is there a contract extension? I\'m out of contract in June. I want to finish here."',
      calendarLabel: 'Roberto\'s Contract',
      choices: [
        {
          label: 'Offer a one-year extension.',
          hint: 'He stays. Morale boosts. The captain\'s role is secured.',
          effects: { teamMorale: +10, boardConfidence: -3, contractRenewed: true },
          next: 'fa_cup_qf',
        },
        {
          label: 'Let him see out his contract.',
          hint: 'No commitment. Roberto accepts it, but something changes in him.',
          effects: { teamMorale: -8, boardConfidence: +3 },
          next: 'fa_cup_qf',
        },
        {
          label: 'Offer two years — all-in.',
          hint: 'Generous. Paulo isn\'t happy about the wages. But Roberto is emotional.',
          effects: { teamMorale: +15, boardConfidence: -8, mediaRep: +8, contractRenewed: true },
          next: 'fa_cup_qf',
        },
      ],
    },

    fa_cup_qf: {
      id: 'fa_cup_qf', type: 'match', phase: 'cups',
      competition: 'FA Cup',
      opponent: 'Willowbrook City',
      homeAway: 'home',
      difficulty: 0.45,
      week: 9,
      calendarLabel: 'FA Cup Quarter Final',
      next: 'callup_decision',
    },

    callup_decision: {
      id: 'callup_decision', type: 'decision', phase: 'league',
      background: 'bg-office',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"The national team wants Marco for the international break. Three key league games — including Ironclad. What do we say?"',
      calendarLabel: 'International Call-Up',
      choices: [
        {
          label: 'Release him. It\'s good for his career.',
          hint: 'Marco is grateful. But you face Ironclad without him.',
          effects: { starHappiness: +15, teamMorale: -5, callupReleased: true },
          next: 'rotation_decision',
        },
        {
          label: 'Claim he\'s carrying a knock.',
          hint: 'Keeps him. The national team isn\'t happy. Marco says nothing but knows.',
          effects: { starHappiness: -10, mediaRep: -8, boardConfidence: +5 },
          next: 'rotation_decision',
        },
        {
          label: 'Release him after the Ironclad match only.',
          hint: 'A compromise. Both sides get something.',
          effects: { starHappiness: +5, teamMorale: +3, callupReleased: true },
          next: 'rotation_decision',
        },
      ],
    },

    rotation_decision: {
      id: 'rotation_decision', type: 'decision', phase: 'league',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Big week — four games in ten days. Do we push the first team, or rotate heavily?"',
      calendarLabel: 'Rotation vs. Performance',
      choices: [
        {
          label: 'Push the first team — full strength.',
          hint: 'Best chance of good results, but fatigue risk.',
          effects: { teamMorale: -5, boardConfidence: +8 },
          next: 'champions_group_2',
        },
        {
          label: 'Rotate heavily.',
          hint: 'Squad stays fresh. But some big names on the bench are unhappy.',
          effects: { teamMorale: -3, starHappiness: -8, youthInvestment: +5 },
          next: 'champions_group_2',
        },
        {
          label: 'Selective rotation — protect key players only.',
          hint: 'Balanced. Some morale cost, but manageable.',
          effects: { teamMorale: +2 },
          next: 'champions_group_2',
        },
      ],
    },

    champions_group_2: {
      id: 'champions_group_2', type: 'match', phase: 'cups',
      competition: 'Champions Cup',
      opponent: 'Sporting Lisora',
      homeAway: 'home',
      difficulty: 0.55,
      week: 10,
      calendarLabel: 'Champions Cup Group 2',
      next: 'player_conflict',
    },

    player_conflict: {
      id: 'player_conflict', type: 'decision', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"There\'s been a blow-up in training. Marco and Roberto — they\'re not speaking. The dressing room is split."',
      calendarLabel: 'Dressing Room Conflict',
      choices: [
        {
          label: 'Bring them both in and mediate.',
          hint: 'Resolved together. Takes time, but they respect you for it.',
          effects: { teamMorale: +8, conflictResolved: true, starHappiness: +5 },
          next: 'mentorship_scene',
        },
        {
          label: 'Back Roberto — he\'s the captain.',
          hint: 'Clear hierarchy. Marco simmers but falls in line.',
          effects: { teamMorale: -5, starHappiness: -12, boardConfidence: +5 },
          next: 'mentorship_scene',
        },
        {
          label: 'Back Marco — he\'s the match-winner.',
          hint: 'Marco is elated. Roberto is hurt. The squad is divided.',
          effects: { teamMorale: -8, starHappiness: +15, boardConfidence: -5 },
          next: 'mentorship_scene',
        },
      ],
    },

    mentorship_scene: {
      id: 'mentorship_scene', type: 'decision', phase: 'league',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Kai Voss is struggling with the pace of professional life. Should we pair him with Roberto as a mentor?"',
      calendarLabel: 'Mentorship Decision',
      choices: [
        {
          label: 'Yes — Roberto is perfect for this.',
          hint: 'Kai develops faster. Roberto finds new purpose.',
          effects: { youthInvestment: +20, teamMorale: +5, mentorshipDone: true },
          next: 'media_crisis',
        },
        {
          label: 'Not now — the team is too fragile.',
          hint: 'Practical. But Kai feels overlooked.',
          effects: { youthInvestment: -5, teamMorale: +2 },
          next: 'media_crisis',
        },
        {
          label: 'Pair Kai with Marco instead.',
          hint: 'Unexpected. Marco rises to the challenge. Transforms both of them.',
          effects: { youthInvestment: +10, starHappiness: +10, teamMorale: +5, mentorshipDone: true },
          next: 'media_crisis',
        },
      ],
    },

    media_crisis: {
      id: 'media_crisis', type: 'decision', phase: 'league',
      background: 'bg-press-room',
      character: 'journalist', name: 'Alexandra Chen',
      prompt: '"A tabloid is running a story: \'Valhalla Dressing Room In Meltdown\'. True or not — this is going to run. How do you respond?"',
      calendarLabel: 'Media Crisis',
      choices: [
        {
          label: 'Issue a firm denial. Call it fiction.',
          hint: 'Kills the story short-term. Alexandra files a follow-up anyway.',
          effects: { mediaRep: -5, boardConfidence: +5, crisisHandled: true },
          next: 'match_league_5',
        },
        {
          label: 'Open the training ground. Show them everything.',
          hint: 'Radical transparency. The story dies. Respect skyrockets.',
          effects: { mediaRep: +15, teamMorale: +8, crisisHandled: true },
          next: 'match_league_5',
        },
        {
          label: '"No comment." Stay silent.',
          hint: 'Mysterious. The story grows for a week, then fades.',
          effects: { mediaRep: -8, boardConfidence: -5 },
          next: 'match_league_5',
        },
      ],
    },

    match_league_5: {
      id: 'match_league_5', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Ironclad United',
      homeAway: 'away',
      difficulty: 0.65,
      week: 13,
      calendarLabel: 'Derby — vs. Ironclad (A)',
      next: 'transfer_deadline',
    },

    transfer_deadline: {
      id: 'transfer_deadline', type: 'decision', phase: 'league',
      background: 'bg-transfer-room',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"Transfer deadline — 90 minutes left. A club has bid £14M for Marco Silva. Paulo says it\'s our call. What do you do?"',
      calendarLabel: 'Transfer Deadline Day',
      choices: [
        {
          label: 'Reject it. He\'s not for sale.',
          hint: 'Marco is relieved. Paulo is frustrated. The board notes it.',
          effects: { starHappiness: +20, boardConfidence: -10, teamMorale: +8 },
          next: 'fan_event',
        },
        {
          label: 'Accept — £14M is good business.',
          hint: 'Paulo is satisfied. The squad is shaken. Marco leaves with dignity.',
          effects: { starSold: true, starHappiness: 0, teamMorale: -15, boardConfidence: +15 },
          rootEffects: { budget: +14 },
          next: 'fan_event',
        },
        {
          label: 'Counter: £20M or nothing.',
          hint: 'They walk away. Marco stays — but he heard about the bid.',
          effects: { starHappiness: -10, teamMorale: +3, boardConfidence: -3 },
          next: 'fan_event',
        },
      ],
    },

    fan_event: {
      id: 'fan_event', type: 'decision', phase: 'league',
      background: 'bg-stadium-dawn',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"The Valhalla Supporters\' Trust has invited you to a community day at the ground. Paulo says it\'s optional."',
      calendarLabel: 'Community Day',
      choices: [
        {
          label: 'Attend personally — bring the squad.',
          hint: 'Massive goodwill. Fans love you. Paolo is surprised.',
          effects: { mediaRep: +15, teamMorale: +8, fanEventDone: true, fanEventChoice: 'attend' },
          next: 'staff_hiring',
        },
        {
          label: 'Send the youth players only.',
          hint: 'Shows investment in youth. Good PR without taking time away.',
          effects: { mediaRep: +8, youthInvestment: +10, fanEventDone: true, fanEventChoice: 'youth' },
          next: 'staff_hiring',
        },
        {
          label: 'Decline — it\'s a crucial prep week.',
          hint: 'Focused. Fans are disappointed. Board doesn\'t care.',
          effects: { mediaRep: -10, teamMorale: -3, fanEventDone: true, fanEventChoice: 'decline' },
          next: 'staff_hiring',
        },
      ],
    },

    staff_hiring: {
      id: 'staff_hiring', type: 'decision', phase: 'league',
      background: 'bg-office',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"We have £2M earmarked for a specialist staff hire. Who do we bring in?"',
      calendarLabel: 'Staff Hiring',
      choices: [
        {
          label: '🧠 Sports Psychologist',
          hint: 'Helps the squad handle pressure. Huge morale effect.',
          effects: { teamMorale: +12, boardConfidence: +3, staffHired: 'psychologist', teamStrengthBonus: +5 },
          next: 'match_league_6',
        },
        {
          label: '🏃 Elite Fitness Coach',
          hint: 'Better conditioning. Lower injury risk. Results improve.',
          effects: { boardConfidence: +8, teamMorale: +5, staffHired: 'fitness', teamStrengthBonus: +5 },
          next: 'match_league_6',
        },
        {
          label: '📊 Data Analyst',
          hint: 'Tactical edge. Press loves the "modern" angle.',
          effects: { boardConfidence: +10, mediaRep: +8, staffHired: 'analyst', teamStrengthBonus: +5 },
          next: 'match_league_6',
        },
      ],
    },

    match_league_6: {
      id: 'match_league_6', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Red Cliffs Athletic',
      homeAway: 'home',
      difficulty: 0.50,
      week: 17,
      calendarLabel: 'vs. Red Cliffs Athletic',
      next: 'fa_cup_sf',
    },

    fa_cup_sf: {
      id: 'fa_cup_sf', type: 'match', phase: 'cups',
      competition: 'FA Cup',
      opponent: 'Ironclad United',
      homeAway: 'neutral',
      homeAway: 'away',
      difficulty: 0.58,
      week: 18,
      calendarLabel: 'FA Cup Semi-Final',
      next: 'champions_ko',
    },

    champions_ko: {
      id: 'champions_ko', type: 'match', phase: 'cups',
      competition: 'Champions Cup',
      opponent: 'Real Estrada CF',
      homeAway: 'away',
      difficulty: 0.62,
      week: 19,
      calendarLabel: 'Champions Cup QF',
      next: 'locker_room_talk',
    },

    locker_room_talk: {
      id: 'locker_room_talk', type: 'decision', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      prompt: '"It\'s crunch time — three competitions still alive. The squad is tired. What\'s your message in the dressing room?"',
      calendarLabel: 'Dressing Room Address',
      choices: [
        {
          label: '"This is what we\'ve been building for."',
          hint: 'Inspirational. Morale surges. The squad finds something extra.',
          effects: { teamMorale: +15, boardConfidence: +5 },
          next: 'second_half_review',
        },
        {
          label: '"I don\'t need speeches. I need performances."',
          hint: 'Direct. High standards. The squad knows you mean it.',
          effects: { teamMorale: +5, boardConfidence: +10 },
          next: 'second_half_review',
        },
        {
          label: '"Let\'s have some fun out there."',
          hint: 'Unexpected lightness. The tension breaks. They play free.',
          effects: { teamMorale: +20, mediaRep: +5 },
          next: 'second_half_review',
        },
      ],
    },

    second_half_review: {
      id: 'second_half_review', type: 'story', phase: 'league',
      background: 'bg-stadium-night',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'The season is in its final stretch. The table tells one story. The cup draws tell another.',
        'Lena spreads the fixture list across the desk. "Everything we\'ve done has led to this."',
        '"Three competitions. One squad. This is your legacy, Gaffer."',
        'You look at the names on the whiteboard. The faces behind them. The decisions made.',
        'Whatever comes next — you\'ve already changed this club.',
      ],
      next: 'paulo_final_meeting',
      calendarLabel: 'Season Review — Final Stretch',
      week: 20,
    },

    paulo_final_meeting: {
      id: 'paulo_final_meeting', type: 'decision', phase: 'league',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      prompt: '"Sit down. I need to know — are we going all the way this year? Or do I need to make changes?"',
      calendarLabel: 'Board Ultimatum',
      choices: [
        {
          label: '"We\'re going all the way. I guarantee it."',
          hint: 'Bold. The board is electric. One slip and you\'re gone.',
          effects: { boardConfidence: +15, teamMorale: +8 },
          next: 'match_title_decider',
        },
        {
          label: '"We\'re giving everything. Results will come."',
          hint: 'Measured. Paulo accepts it — grudgingly.',
          effects: { boardConfidence: +5, teamMorale: +5 },
          next: 'match_title_decider',
        },
        {
          label: '"Back off, Paulo. Let me manage."',
          hint: 'Explosive. The squad hears. They love you for it — Paulo doesn\'t.',
          effects: { boardConfidence: -15, teamMorale: +15, mediaRep: +10, walkoutThreat: true },
          next: 'match_title_decider',
        },
        {
          label: '"I resign."',
          hint: 'You\'ve had enough. On your own terms.',
          effects: { resignedChoice: true },
          next: 'resign_scene',
        },
      ],
    },

    // ----------------------------------------------------------------
    // ENDGAME MATCHES
    // ----------------------------------------------------------------

    match_title_decider: {
      id: 'match_title_decider', type: 'match', phase: 'league',
      competition: 'VPL',
      opponent: 'Castello FC',
      homeAway: 'home',
      difficulty: 0.55,
      isFinal: false,
      week: 24,
      calendarLabel: 'Title Decider vs. Castello',
      next: 'fa_cup_final',
    },

    fa_cup_final: {
      id: 'fa_cup_final', type: 'match', phase: 'cups',
      competition: 'FA Cup',
      opponent: 'Ironclad United',
      homeAway: 'away',
      difficulty: 0.58,
      isFinal: true,
      week: 26,
      calendarLabel: 'FA Cup Final',
      next: 'champions_final',
    },

    champions_final: {
      id: 'champions_final', type: 'match', phase: 'cups',
      competition: 'Champions Cup',
      opponent: 'Dynamo Vostok',
      homeAway: 'away',
      difficulty: 0.65,
      isFinal: true,
      week: 28,
      calendarLabel: 'Champions Cup Final',
      next: 'world_champ_group',
    },

    world_champ_group: {
      id: 'world_champ_group', type: 'match', phase: 'worlds',
      competition: 'World Championship',
      opponent: 'Santos Esmeralda',
      homeAway: 'away',
      difficulty: 0.62,
      week: 30,
      calendarLabel: 'World Championship Group',
      next: 'world_champ_final',
    },

    world_champ_final: {
      id: 'world_champ_final', type: 'match', phase: 'worlds',
      competition: 'World Championship',
      opponent: 'Shoguns FC',
      homeAway: 'away',
      difficulty: 0.70,
      isFinal: true,
      week: 32,
      calendarLabel: 'World Championship Final',
      next: 'season_end_eval',
    },

    // ----------------------------------------------------------------
    // SEASON END — EVAL + ENDINGS
    // ----------------------------------------------------------------

    season_end_eval: {
      id: 'season_end_eval', type: 'eval', // special type handled by engine
      next: null, // engine calls evaluateEnding()
    },

    // ----------------------------------------------------------------
    // MID-SEASON SACKING
    // ----------------------------------------------------------------

    sacked_mid_season: {
      id: 'sacked_mid_season', type: 'story',
      background: 'bg-dark-room',
      character: 'chairman', name: 'Paulo Ferretti',
      dialogue: [
        'Paulo calls you in on a grey Tuesday morning.',
        '"I\'m going to be direct. The results aren\'t there. The board has lost confidence."',
        '"We\'re making a change. Effective immediately."',
        'He doesn\'t shake your hand when you leave.',
        'The players are silent in the corridor. Marco watches from the doorway.',
      ],
      next: 'ending_sacked',
    },

    // ----------------------------------------------------------------
    // RESIGNATION STORY
    // ----------------------------------------------------------------

    resign_scene: {
      id: 'resign_scene', type: 'story',
      background: 'bg-dark-room',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena finds you clearing the whiteboard. She stands in the doorway.',
        '"So that\'s it?" she asks. Her voice is quiet.',
        '"The team will be devastated. Marco... Roberto... they believe in you."',
        'You pack your bag. You shake her hand. You walk out into the cold afternoon air.',
        'On your own terms. That\'s something Paulo Ferretti can never take from you.',
      ],
      next: 'ending_walk_away',
    },

    // ----------------------------------------------------------------
    // ENDINGS
    // ----------------------------------------------------------------

    ending_glory: {
      id: 'ending_glory', type: 'ending', ending: 'glory',
    },
    ending_league_champion: {
      id: 'ending_league_champion', type: 'ending', ending: 'league_champion',
    },
    ending_underdog_cup: {
      id: 'ending_underdog_cup', type: 'ending', ending: 'underdog_cup',
    },
    ending_walk_away: {
      id: 'ending_walk_away', type: 'ending', ending: 'walk_away',
    },
    ending_youth_revolution: {
      id: 'ending_youth_revolution', type: 'ending', ending: 'youth_revolution',
    },
    ending_legendary_failure: {
      id: 'ending_legendary_failure', type: 'ending', ending: 'legendary_failure',
    },
    ending_sacked: {
      id: 'ending_sacked', type: 'ending', ending: 'sacked',
    },
  };

  // ============================================================
  // SEASON EVENT ARRAY — the ordered spine of the game
  // ============================================================

  const events = [
    scenes.intro,
    scenes.meet_paulo,
    scenes.meet_marco,
    scenes.meet_roberto,
    scenes.style_choice,
    // style_reaction is handled by branch from style_choice
    scenes.tour_choice,
    scenes.budget_choice,
    scenes.transfer_window_1,
    scenes.captain_choice,
    scenes.training_1,
    scenes.lineup_friendly,
    scenes.match_friendly,
    scenes.paulo_demands,
    scenes.season_kickoff,
    scenes.lineup_league_1,
    scenes.match_league_1,
    scenes.post_match_1,
    scenes.training_2,
    scenes.match_league_2,
    scenes.fa_cup_r1,
    scenes.injury_event,
    scenes.board_pressure_1,
    scenes.match_league_3,
    scenes.discipline_event,
    scenes.rivals_intro,
    scenes.rivals_response,
    scenes.champions_group_1,
    scenes.training_3,
    scenes.match_league_4,
    scenes.contract_decision,
    scenes.fa_cup_qf,
    scenes.callup_decision,
    scenes.rotation_decision,
    scenes.champions_group_2,
    scenes.player_conflict,
    scenes.mentorship_scene,
    scenes.media_crisis,
    scenes.match_league_5,
    scenes.transfer_deadline,
    scenes.fan_event,
    scenes.staff_hiring,
    scenes.match_league_6,
    scenes.fa_cup_sf,
    scenes.champions_ko,
    scenes.locker_room_talk,
    scenes.second_half_review,
    scenes.paulo_final_meeting,
    scenes.match_title_decider,
    scenes.fa_cup_final,
    scenes.champions_final,
    scenes.world_champ_group,
    scenes.world_champ_final,
    scenes.season_end_eval,
  ];

  return { scenes, events };

})();
