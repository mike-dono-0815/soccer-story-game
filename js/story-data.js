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
      transition: {
        location: 'FC Valhalla Training Ground',
        text: 'You arrive at FC Valhalla on a damp morning in late July. The training ground sits on the edge of town — modest, lived-in, oddly charming. Your new assistant coach is waiting by the gates.',
      },
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
      transition: {
        location: "The Chairman's Office",
        text: "Lena leads you inside — past a corridor of dusty trophies and faded photographs from better decades — and stops at a heavy door at the far end. She knocks twice and steps aside. 'He's been waiting,' she says quietly.",
      },
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
      transition: {
        location: 'The Training Gym',
        text: "You follow Lena through a side door into the gym. It smells of liniment and rubber mats. In the far corner, Marco 'El Tornado' Silva sits alone on a bench — phone in hand, not looking up as you walk in.",
      },
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
      transition: {
        location: 'FC Valhalla Training Pitch',
        text: "Back outside, the morning session is winding down. Across the pitch, a broad-shouldered figure with grey at his temples jogs over and raises a hand in greeting. Thirty-four years old. Seventeen seasons as a professional.",
      },
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
      transition: {
        location: 'First Team Training Session',
        text: "The full squad assembles for the first time under your management. Forty-two faces look back at you — some curious, some sceptical, a few openly sizing you up. The noise of studs on concrete fades to silence. They're waiting.",
      },
      prompt: 'Lena hands you a whiteboard. What\'s our identity going to be, Gaffer? Everyone is curious."',
      calendarLabel: 'Define Your Philosophy',
      choices: [
        {
          label: '⚡ The Visionary',
          hint: 'Youth, innovation, high-press chaos. We build something new.',
          effects: { managerStyle: 'visionary', teamMorale: +5, boardConfidence: -5, youthInvestment: +20, fanReputation: +8 },
          next: 'style_visionary_reaction',
        },
        {
          label: '💼 The Pragmatist',
          hint: 'Results first, no apologies. We buy proven winners.',
          effects: { managerStyle: 'pragmatist', boardConfidence: +10, teamMorale: -5, fanReputation: +2 },
          next: 'style_pragmatist_reaction',
        },
        {
          label: '❤️ The People\'s Champion',
          hint: 'Culture and community. We win together or not at all.',
          effects: { managerStyle: 'champion', teamMorale: +12, mediaRep: +8, boardConfidence: -5, fanReputation: +15 },
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
        '"Come on — there\'s someone in the youth academy I think you need to meet."',
      ],
      next: 'meet_kai',
    },

    style_pragmatist_reaction: {
      id: 'style_pragmatist_reaction', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena nods slowly. "Paulo will be happy. The board love a results-first manager."',
        '"Just be careful — if we push too hard, we might lose the dressing room."',
        '"Before you look at transfers, there\'s a kid in the youth setup worth five minutes of your time."',
      ],
      next: 'meet_kai',
    },

    style_champion_reaction: {
      id: 'style_champion_reaction', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      dialogue: [
        'Lena\'s eyes light up. "That\'s what this club needs. Real leadership."',
        '"The fans have been calling for something like this for years."',
        '"There\'s a boy in the youth academy who\'s been waiting for a manager like you. Come and see."',
      ],
      next: 'meet_kai',
    },

    meet_kai: {
      id: 'meet_kai', type: 'story', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'prodigy', name: 'Kai Voss',
      transition: {
        location: 'FC Valhalla Youth Academy',
        text: "Lena leads you to a smaller pitch at the back of the complex. A seventeen-year-old is running drills alone — no coach, no audience. He hasn't noticed you yet.",
      },
      dialogue: [
        'Kai Voss stops mid-drill the moment he sees you. He stands very straight, like a soldier caught off-guard.',
        '"This is Kai," Lena says. "Seventeen. Best left foot in the academy by a distance."',
        'He doesn\'t say anything. Just looks at you with dark, serious eyes.',
        '"He\'s not on the first-team list yet," Lena adds quietly. "But I think he should be."',
        'Kai gives you a small nod. One sentence: "I\'m ready, Gaffer."',
      ],
      next: 'tour_choice',
    },

    tour_choice: {
      id: 'tour_choice', type: 'decision', phase: 'preseason',
      background: 'bg-office',
      character: 'chairman', name: 'Paulo Ferretti',
      transition: {
        location: "The Chairman's Office",
        text: "Paulo's assistant calls you back before you've even reached the car park. The pre-season calendar is already spread across his marble desk. A pen is waiting. He has, as usual, already decided what the options are.",
      },
      prompt: '"I\'ve arranged a pre-season tour. Three options. Pick one — it goes out tomorrow."',
      calendarLabel: 'Pre-Season Tour',
      choices: [
        {
          label: '🏰 Europe',
          hint: 'Competitive friendlies. Tough opposition, high exposure.',
          effects: { tourChoice: 'europe', boardConfidence: +8, teamMorale: +5, mediaRep: +5, fanReputation: +5 },
          next: 'tour_europe',
        },
        {
          label: '🌏 Asia',
          hint: 'Commercial tour. Big crowds, lighter preparation.',
          effects: { tourChoice: 'asia', boardConfidence: +5, teamMorale: +8, mediaRep: +10, fanReputation: +10 },
          next: 'tour_asia',
        },
        {
          label: '🌎 Americas',
          hint: 'Long trip, intense warm-up matches, good for team bonding.',
          effects: { tourChoice: 'americas', boardConfidence: +3, teamMorale: +15, mediaRep: +5, fanReputation: +6 },
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
        'The cameras roll. Whatever you say next will run on every back page.',
      ],
      next: 'tour_asia_press',
    },

    tour_asia_press: {
      id: 'tour_asia_press', type: 'decision', phase: 'preseason',
      background: 'bg-tour-asia',
      character: 'journalist', name: 'Alexandra Chen',
      prompt: '"Gaffer — forty thousand fans tonight, your face on every billboard in Bangkok. What\'s the message you\'re sending with this trip?"',
      choices: [
        {
          label: '"This club deserves a global stage. We belong here."',
          hint: 'Bold and ambitious. The headline writes itself.',
          effects: { mediaRep: +12, boardConfidence: +5, fanReputation: +8 },
          next: 'budget_choice',
        },
        {
          label: '"Football belongs to everyone. We\'re here for the fans."',
          hint: 'Humble and inclusive. The crowd loves it.',
          effects: { mediaRep: +8, teamMorale: +8, fanReputation: +12 },
          next: 'budget_choice',
        },
        {
          label: '"Pre-season is about work. The circus is secondary."',
          hint: 'Honest, but the press aren\'t thrilled.',
          effects: { teamMorale: +6, mediaRep: -4, fanReputation: -5 },
          next: 'budget_choice',
        },
        {
          label: '"We\'re here to win. Even friendlies mean something to us."',
          hint: 'Competitive edge. The board nods approvingly.',
          effects: { teamMorale: +10, boardConfidence: +8, fanReputation: +5 },
          next: 'budget_choice',
        },
      ],
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
      transition: {
        location: "The Chairman's Office",
        text: "A second meeting with Paulo, this one more practical. A budget spreadsheet is open on his screen. Numbers that will define your season before it has even begun. He swivels the monitor to face you.",
      },
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
      transition: {
        location: 'Transfer Window — Pre-Season',
        text: "The transfer window opens. Your phone starts ringing before you've sat down. Agents, scouts, intermediaries. The budget is set. The squad has gaps. It's time to build something.",
      },
      miniGameType: 'transfer',
      calendarLabel: 'Transfer Window',
      next: 'captain_choice',
    },

    captain_choice: {
      id: 'captain_choice', type: 'decision', phase: 'preseason',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      transition: {
        location: 'Training Ground Corridor',
        text: "A week before the season opener, Lena pulls you aside in the corridor. 'We need to talk about the armband,' she says. 'The players have been waiting. They need to hear it from you.'",
      },
      prompt: '"Gaffer — before the season starts, the squad needs to know who\'s wearing the armband."',
      calendarLabel: 'Choose Captain',
      choices: [
        {
          label: '⚡ Marco Silva',
          hint: 'He\'ll ignite the dressing room. High risk — but his ego needs this.',
          effects: { captainId: 'star', captainChosen: true, starHappiness: +20, teamMorale: +5, boardConfidence: +5, fanReputation: +8 },
          next: 'captain_marco',
        },
        {
          label: '🛡 Roberto Okafor',
          hint: 'The safe, wise choice. He\'ll provide stability and lead by example.',
          effects: { captainId: 'veteran', captainChosen: true, teamMorale: +12, boardConfidence: +8, fanReputation: +6 },
          next: 'captain_roberto',
        },
        {
          label: '🗳 Let the Team Vote',
          hint: 'Democratic — but you cede control of the narrative.',
          effects: { captainId: 'vote', captainChosen: true, teamMorale: +18, boardConfidence: -5, mediaRep: +8, fanReputation: +15 },
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
      transition: {
        location: 'Nordstrom Park — Pre-Season',
        text: "Your first match as Valhalla manager. The ground is half-full, the sun is low, and the opposition won't press hard. But the players are watching every move you make in the dugout. Everything starts here.",
      },
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
      transition: {
        location: "The Chairman's Office — Post Pre-Season",
        text: "You return from the friendly to find a message from Paulo's assistant. He wants a meeting this evening. His door is already open when you arrive. He doesn't ask how the game went.",
      },
      prompt: '"Good pre-season. Now — how do you define success this year? Because mine is clear: trophies."',
      calendarLabel: 'Board Meeting — Expectations',
      choices: [
        {
          label: '"Top four is the target."',
          hint: 'Aligns with Paulo\'s demands. Board happy — pressure is on.',
          effects: { boardConfidence: +10, teamMorale: -5, fanReputation: +5 },
          next: 'season_kickoff',
        },
        {
          label: '"We focus on progress, not position."',
          hint: 'Buys goodwill — for now. Paulo won\'t wait forever.',
          effects: { boardConfidence: -5, teamMorale: +8, mediaRep: +5, fanReputation: +3 },
          next: 'season_kickoff',
        },
        {
          label: '"We\'re going to win the league."',
          hint: 'Bold promise. The board is electrified — and so is the pressure.',
          effects: { boardConfidence: +15, teamMorale: +5, mediaRep: +10, fanReputation: +12 },
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
      transition: {
        location: 'Nordstrom Park — Matchday One',
        text: "The season is here. Sixty-two thousand people in the stands, all of them watching you. In the tunnel, the noise is a physical thing. You pull your jacket straight and walk out.",
      },
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
      transition: {
        location: 'Post-Match Press Room',
        text: "The noise of the crowd is still ringing in your ears as you take the seat in front of the cameras. The press room is packed. Alexandra Chen from the Valorian Tribune has her recorder out and her eyes on you.",
      },
      prompt: '"Gaffer, first game of the season — what\'s your honest assessment of the performance?"',
      calendarLabel: 'Post-Match Press',
      choices: [
        {
          label: '"We showed exactly what we\'re about."',
          hint: 'Confident. Fans love it. Board nodding along.',
          effects: { mediaRep: +8, boardConfidence: +5, fanReputation: +8 },
          next: 'training_2',
        },
        {
          label: '"There\'s a lot to improve on."',
          hint: 'Honest. Builds credibility with the press.',
          effects: { mediaRep: +5, boardConfidence: -3, teamMorale: -3, fanReputation: +3 },
          next: 'training_2',
        },
        {
          label: '"Ask me again in ten games."',
          hint: 'Deflects. Alexandra writes a "mysterious manager" piece.',
          effects: { mediaRep: +3, fanReputation: +5 },
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
      onLoss: 'fa_cup_out_r1',
    },

    injury_event: {
      id: 'injury_event', type: 'decision', phase: 'league',
      background: 'bg-training-ground',
      character: 'assistant', name: 'Lena Brandt',
      transition: {
        location: 'Training Ground — Emergency',
        text: "It happens in a Thursday five-a-side. A mistimed challenge. Marco goes down and doesn't get up immediately. The training ground goes very quiet. Lena is already on her phone before you reach him.",
      },
      prompt: '"Gaffer — bad news. Marco took a knock in training. The physio says three weeks minimum. What do we do?"',
      calendarLabel: 'Marco Injured!',
      choices: [
        {
          label: 'Rest him properly.',
          hint: 'Safe. He misses three games. Morale dips, but he comes back sharp.',
          effects: { starInjured: true, teamMorale: -5, starHappiness: +5, fanReputation: +5 },
          next: 'injury_rest_scene',
        },
        {
          label: 'Rush him back in two weeks.',
          hint: 'He plays, but risks a longer injury. Morale stays up.',
          effects: { starInjured: false, starRushedBack: true, teamMorale: +3, starHappiness: -5, fanReputation: -5 },
          next: 'injury_rush_scene',
        },
        {
          label: 'Call up youth — Kai Voss steps in.',
          hint: 'If Voss is on the squad, this is his chance. Invests in the future.',
          effects: { starInjured: true, youthInvestment: +15, teamMorale: +2, fanReputation: +8 },
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
      transition: {
        location: "The Chairman's Office",
        text: "Paulo's assistant calls at seven in the morning. The chairman wants to see you before training. His tone, as always, leaves no room for delay.",
      },
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
      transition: {
        location: 'Nordstrom Park — VPL Matchday',
        text: "Ironclad United. The fixture that's been circled on every calendar in the city since the draw was made. Paulo has texted you twice already this morning. The squad is silent on the coach.",
      },
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
      transition: {
        location: 'Training Ground — Monday Morning',
        text: "You haven't finished your coffee when Lena appears in the doorway. She has that look — the one that means something has already gone wrong before the week has even started.",
      },
      prompt: '"Gaffer — Sven Halberg was spotted in a nightclub at 2am before the match. Do you address this?"',
      calendarLabel: 'Discipline Decision',
      choices: [
        {
          label: 'Fine him two weeks\' wages.',
          hint: 'Sets a standard. The squad notices.',
          effects: { teamMorale: -3, boardConfidence: +5, mediaRep: +5, fanReputation: +5 },
          next: 'rivals_intro',
        },
        {
          label: 'Suspend him for one game.',
          hint: 'Public and decisive. Paulo is pleased.',
          effects: { teamMorale: -6, boardConfidence: +8, fanReputation: +8 },
          next: 'rivals_intro',
        },
        {
          label: 'Handle it privately.',
          hint: 'Protects the player. Builds loyalty in the dressing room.',
          effects: { teamMorale: +5, mediaRep: -5, starHappiness: +5, fanReputation: -3 },
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
          effects: { mediaRep: +12, rivalityEscalated: false, teamMorale: +8, fanReputation: +8 },
          next: 'champions_group_1',
        },
        {
          label: '"See you on the pitch, Ivan."',
          hint: 'Short. Sharp. The squad loves it. Sorokin escalates the war.',
          effects: { mediaRep: +8, rivalityEscalated: true, teamMorale: +12, boardConfidence: -3, fanReputation: +12 },
          next: 'champions_group_1',
        },
        {
          label: '"Honestly? He\'s not wrong yet. But he will be."',
          hint: 'Disarming and humble. Unexpected. The press eats it up.',
          effects: { mediaRep: +15, teamMorale: +5, fanReputation: +10 },
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
      transition: {
        location: 'Away — Champions Cup Group Stage',
        text: "Your first European away trip. A cold, grey stadium in a foreign city. Flags from a dozen nations fill the stands. This is a different level of football entirely — and everyone in the dressing room knows it.",
      },
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
      transition: {
        location: "Manager's Office — Tuesday Afternoon",
        text: "Roberto Okafor knocks on your office door one Tuesday afternoon. He's dressed in training gear, but he's not there to talk about football. He closes the door softly behind him.",
      },
      prompt: '"Gaffer, I need to know — is there a contract extension? I\'m out of contract in June. I want to finish here."',
      calendarLabel: 'Roberto\'s Contract',
      choices: [
        {
          label: 'Offer a one-year extension.',
          hint: 'He stays. Morale boosts. The captain\'s role is secured.',
          effects: { teamMorale: +10, boardConfidence: -3, contractRenewed: true, fanReputation: +10 },
          next: 'fa_cup_qf_check',
        },
        {
          label: 'Let him see out his contract.',
          hint: 'No commitment. Roberto accepts it, but something changes in him.',
          effects: { teamMorale: -8, boardConfidence: +3, fanReputation: -8 },
          next: 'fa_cup_qf_check',
        },
        {
          label: 'Offer two years — all-in.',
          hint: 'Generous. Paulo isn\'t happy about the wages. But Roberto is emotional.',
          effects: { teamMorale: +15, boardConfidence: -8, mediaRep: +8, contractRenewed: true, fanReputation: +14 },
          next: 'fa_cup_qf_check',
        },
      ],
    },

    fa_cup_qf: {
      id: 'fa_cup_qf', type: 'match', phase: 'cups',
      transition: {
        location: 'Nordstrom Park — FA Cup Quarter-Final',
        text: "One match separates Valhalla from an FA Cup semi-final. The ground is buzzing with a kind of nervous energy you haven't felt before. It feels like the whole city turned up.",
      },
      competition: 'FA Cup',
      opponent: 'Willowbrook City',
      homeAway: 'home',
      difficulty: 0.45,
      week: 9,
      calendarLabel: 'FA Cup Quarter Final',
      next: null,
      onLoss: 'fa_cup_out_qf',
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
          effects: { starHappiness: +15, teamMorale: -5, callupReleased: true, fanReputation: +6 },
          next: 'rotation_decision',
        },
        {
          label: 'Claim he\'s carrying a knock.',
          hint: 'Keeps him. The national team isn\'t happy. Marco says nothing but knows.',
          effects: { starHappiness: -10, mediaRep: -8, boardConfidence: +5, fanReputation: -8 },
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
      next: null,
    },

    player_conflict: {
      id: 'player_conflict', type: 'decision', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      transition: {
        location: 'Training Ground — Dressing Room',
        text: "You can hear the raised voices from the corridor before you've even reached the door. Roberto. Marco. The words are muffled, but the tone is unmistakable. The rest of the squad has gone very quiet.",
      },
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
      transition: {
        location: 'Training Ground — Late Afternoon',
        text: "The squad have gone home. The lights are being switched off one by one. Lena lingers in the doorway of the coaches' room with a look on her face that means she has something she needs to say.",
      },
      prompt: '"Kai Voss is struggling with the pace of professional life. Should we pair him with Roberto as a mentor?"',
      calendarLabel: 'Mentorship Decision',
      choices: [
        {
          label: 'Yes — Roberto is perfect for this.',
          hint: 'Kai develops faster. Roberto finds new purpose.',
          effects: { youthInvestment: +20, teamMorale: +5, mentorshipDone: true, fanReputation: +8 },
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
          effects: { youthInvestment: +10, starHappiness: +10, teamMorale: +5, mentorshipDone: true, fanReputation: +6 },
          next: 'media_crisis',
        },
      ],
    },

    media_crisis: {
      id: 'media_crisis', type: 'decision', phase: 'league',
      background: 'bg-press-room',
      character: 'journalist', name: 'Alexandra Chen',
      transition: {
        location: 'Match Week — Morning',
        text: "You see the headline on your phone before you've left the house. 'Valhalla Dressing Room In Meltdown.' The story has been up for three hours and it's already trending. Your phone won't stop.",
      },
      prompt: '"A tabloid is running a story: \'Valhalla Dressing Room In Meltdown\'. True or not — this is going to run. How do you respond?"',
      calendarLabel: 'Media Crisis',
      choices: [
        {
          label: 'Issue a firm denial. Call it fiction.',
          hint: 'Kills the story short-term. Alexandra files a follow-up anyway.',
          effects: { mediaRep: -5, boardConfidence: +5, crisisHandled: true, fanReputation: -3 },
          next: 'match_league_5',
        },
        {
          label: 'Open the training ground. Show them everything.',
          hint: 'Radical transparency. The story dies. Respect skyrockets.',
          effects: { mediaRep: +15, teamMorale: +8, crisisHandled: true, fanReputation: +10 },
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
      transition: {
        location: 'Ironclad Stadium — VPL Derby',
        text: "The away end is already full when your coach rolls in. Your name is on the graffiti outside. The atmosphere is hostile, electric, and entirely alive. This is the kind of match that defines seasons — and managers.",
      },
      difficulty: 0.65,
      week: 13,
      calendarLabel: 'Derby — vs. Ironclad (A)',
      next: 'transfer_deadline',
    },

    transfer_deadline: {
      id: 'transfer_deadline', type: 'decision', phase: 'league',
      background: 'bg-transfer-room',
      character: 'assistant', name: 'Lena Brandt',
      transition: {
        location: 'Transfer Deadline Day',
        text: "Lena is on two phones at once when you walk in. Agents have been texting since 6am. The clock on the wall says ninety minutes remain before the window slams shut. Then the fax machine starts.",
      },
      prompt: '"Transfer deadline — 90 minutes left. A club has bid £14M for Marco Silva. Paulo says it\'s our call. What do you do?"',
      calendarLabel: 'Transfer Deadline Day',
      choices: [
        {
          label: 'Reject it. He\'s not for sale.',
          hint: 'Marco is relieved. Paulo is frustrated. The board notes it.',
          effects: { starHappiness: +20, boardConfidence: -10, teamMorale: +8, fanReputation: +12 },
          next: 'fan_event',
        },
        {
          label: 'Accept — £14M is good business.',
          hint: 'Paulo is satisfied. The squad is shaken. Marco leaves with dignity.',
          effects: { starSold: true, starHappiness: 0, teamMorale: -15, boardConfidence: +15, fanReputation: -20 },
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
      transition: {
        location: 'Nordstrom Park — Community Day',
        text: "A Saturday morning in the off-week. The Valhalla Supporters' Trust has set up a marquee outside Nordstrom Park. Fans of all ages are already queuing. Some are wearing shirts thirty years old.",
      },
      prompt: '"The Valhalla Supporters\' Trust has invited you to a community day at the ground. Paulo says it\'s optional."',
      calendarLabel: 'Community Day',
      choices: [
        {
          label: 'Attend personally — bring the squad.',
          hint: 'Massive goodwill. Fans love you. Paolo is surprised.',
          effects: { mediaRep: +15, teamMorale: +8, fanEventDone: true, fanEventChoice: 'attend', fanReputation: +18 },
          next: 'staff_hiring',
        },
        {
          label: 'Send the youth players only.',
          hint: 'Shows investment in youth. Good PR without taking time away.',
          effects: { mediaRep: +8, youthInvestment: +10, fanEventDone: true, fanEventChoice: 'youth', fanReputation: +10 },
          next: 'staff_hiring',
        },
        {
          label: 'Decline — it\'s a crucial prep week.',
          hint: 'Focused. Fans are disappointed. Board doesn\'t care.',
          effects: { mediaRep: -10, teamMorale: -3, fanEventDone: true, fanEventChoice: 'decline', fanReputation: -15 },
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
      next: null,
    },

    fa_cup_sf: {
      id: 'fa_cup_sf', type: 'match', phase: 'cups',
      competition: 'FA Cup',
      opponent: 'Ironclad United',
      homeAway: 'away',
      difficulty: 0.58,
      week: 18,
      calendarLabel: 'FA Cup Semi-Final',
      next: null,
      onLoss: 'fa_cup_out_sf',
    },

    champions_ko: {
      id: 'champions_ko', type: 'match', phase: 'cups',
      competition: 'Champions Cup',
      opponent: 'Real Estrada CF',
      homeAway: 'away',
      difficulty: 0.62,
      week: 19,
      calendarLabel: 'Champions Cup QF',
      next: null,
      onLoss: 'champ_out_ko',
    },

    locker_room_talk: {
      id: 'locker_room_talk', type: 'decision', phase: 'league',
      background: 'bg-locker-room',
      character: 'assistant', name: 'Lena Brandt',
      transition: {
        location: 'The Dressing Room — Season Run-In',
        text: "The most important three weeks of the season. You push open the dressing room door. Twenty-three players look up. Steam from the showers. Boots scattered across the floor. The sound of a whole city holding its breath.",
      },
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
      transition: {
        location: "The Chairman's Office",
        text: "Paulo's car is already in the car park when you arrive at eight in the morning. That's never a good sign. His assistant meets you in the corridor and says nothing. She just holds the door open.",
      },
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
      transition: {
        location: 'Nordstrom Park — VPL Final Day',
        text: "Final day of the season. Every decision, every sleepless night, every choice you've made since arriving at Valhalla — it all comes down to these ninety minutes. The ground is sold out. It has been for weeks.",
      },
      competition: 'VPL',
      opponent: 'Castello FC',
      homeAway: 'home',
      difficulty: 0.55,
      isFinal: false,
      week: 24,
      calendarLabel: 'Title Decider vs. Castello',
      next: null,
    },

    fa_cup_final: {
      id: 'fa_cup_final', type: 'match', phase: 'cups',
      transition: {
        location: 'National Stadium — FA Cup Final',
        text: "The biggest stage in the domestic game. The national stadium on a May afternoon. Sixty thousand supporters in club colours. Forty years of hurt on one side of the pitch, and everything to play for on the other.",
      },
      competition: 'FA Cup',
      opponent: 'Ironclad United',
      homeAway: 'away',
      difficulty: 0.58,
      isFinal: true,
      week: 26,
      calendarLabel: 'FA Cup Final',
      next: null,
      onLoss: 'fa_cup_out_final',
    },

    champions_final: {
      id: 'champions_final', type: 'match', phase: 'cups',
      transition: {
        location: 'Champions Cup Final',
        text: "The biggest night of your managerial career. A neutral venue. A full house. The Champions Cup on a table behind the goal, glinting under the floodlights. This is everything you came here to do.",
      },
      competition: 'Champions Cup',
      opponent: 'Dynamo Vostok',
      homeAway: 'away',
      difficulty: 0.65,
      isFinal: true,
      week: 28,
      calendarLabel: 'Champions Cup Final',
      next: null,
      onLoss: 'champ_out_final',
    },

    // Gate: only proceed to CWC if league was won (vplPosition === 1)
    cwc_qualify_check: {
      id: 'cwc_qualify_check',
      type: 'gate',
      check: (state) => state.results.vplPosition === 1,
      ifTrue: 'cwc_r16',
      ifFalse: 'season_summary',
    },

    cwc_r16: {
      id: 'cwc_r16', type: 'match', phase: 'worlds',
      transition: {
        location: 'Club World Cup — Round of 16',
        text: "The Club World Cup. The best clubs on the planet, in one tournament, on a neutral stage. Valhalla — a club from a small city — standing alongside the giants of world football. Nobody gave you a chance to be here.",
      },
      competition: 'Club World Cup',
      opponent: 'Santos Esmeralda',
      homeAway: 'home',
      difficulty: 0.60,
      week: 30,
      calendarLabel: 'Club World Cup — Round of 16',
      next: null,
      onLoss: 'cwc_out_r16',
    },

    cwc_qf: {
      id: 'cwc_qf', type: 'match', phase: 'worlds',
      transition: {
        location: 'Club World Cup — Quarter-Final',
        text: "You've come this far. The quarter-final. Win this and Valhalla are in the last four clubs standing in the whole world. Three more wins from something no one thought was possible.",
      },
      competition: 'Club World Cup',
      opponent: 'Atlético Porteño',
      homeAway: 'home',
      difficulty: 0.64,
      week: 31,
      calendarLabel: 'Club World Cup — Quarter-Final',
      next: null,
      onLoss: 'cwc_out_qf',
    },

    cwc_sf: {
      id: 'cwc_sf', type: 'match', phase: 'worlds',
      transition: {
        location: 'Club World Cup — Semi-Final',
        text: "Two matches from becoming world champions. The semi-final. The whole of Valoria is watching. Paulo Ferretti flew out to be in the stands. Even Lena looks nervous.",
      },
      competition: 'Club World Cup',
      opponent: 'Shoguns FC',
      homeAway: 'neutral',
      difficulty: 0.68,
      week: 32,
      calendarLabel: 'Club World Cup — Semi-Final',
      next: null,
      onLoss: 'cwc_out_sf',
    },

    cwc_final: {
      id: 'cwc_final', type: 'match', phase: 'worlds',
      transition: {
        location: 'Club World Cup — The Final',
        text: "This is it. The last game. One match between Valhalla and a place in history no one will ever be able to take away. The tunnel is dark and silent. Somewhere above you, a hundred thousand people are waiting.",
      },
      competition: 'Club World Cup',
      opponent: 'Dynamo Vostok',
      homeAway: 'neutral',
      difficulty: 0.72,
      isFinal: true,
      week: 33,
      calendarLabel: 'Club World Cup Final',
      next: null,
      onLoss: 'cwc_out_final',
    },

    // ----------------------------------------------------------------
    // SEASON END — EVAL + ENDINGS
    // ----------------------------------------------------------------

    season_summary: {
      id: 'season_summary', type: 'season_summary',
      calendarLabel: 'Season Review',
      week: 34,
    },

    season_end_eval: {
      id: 'season_end_eval', type: 'eval', // special type handled by engine
      next: null, // engine calls evaluateEnding()
    },

    // ----------------------------------------------------------------
    // CUP QUALIFICATION GATES — inserted into spine
    // ----------------------------------------------------------------

    // FA Cup
    fa_cup_qf_check: {
      id: 'fa_cup_qf_check', type: 'gate',
      check: (state) => state.results.cupRound === 'qf',
      ifTrue: 'fa_cup_qf',
      ifFalse: 'callup_decision',
    },
    fa_cup_sf_check: {
      id: 'fa_cup_sf_check', type: 'gate',
      check: (state) => state.results.cupRound === 'sf',
      ifTrue: 'fa_cup_sf',
      ifFalse: 'champions_ko_check',
    },
    fa_cup_final_check: {
      id: 'fa_cup_final_check', type: 'gate',
      check: (state) => state.results.cupRound === 'final',
      ifTrue: 'fa_cup_final',
      ifFalse: 'champions_final_check',
    },

    // Champions Cup
    champ_group_check: {
      id: 'champ_group_check', type: 'gate',
      // Qualified if won at least one group game (championsRound = 'ko' or 'group')
      check: (state) => state.results.championsRound === 'ko' || state.results.championsRound === 'group',
      ifTrue: 'player_conflict',
      ifFalse: 'champ_out_group',
    },
    champions_ko_check: {
      id: 'champions_ko_check', type: 'gate',
      check: (state) => state.results.championsRound === 'ko' || state.results.championsRound === 'group',
      ifTrue: 'champions_ko',
      ifFalse: 'locker_room_talk',
    },
    champions_final_check: {
      id: 'champions_final_check', type: 'gate',
      check: (state) => state.results.championsRound === 'final',
      ifTrue: 'champions_final',
      ifFalse: 'cwc_qualify_check',
    },

    // ----------------------------------------------------------------
    // KNOCKOUT TRANSITION SCENES — shown when Valhalla is eliminated
    // ----------------------------------------------------------------

    fa_cup_out_r1: {
      id: 'fa_cup_out_r1', type: 'knockout_transition',
      competition: 'FA Cup', round: 'Round 1',
      lines: [
        "The FA Cup journey is over before it properly started.",
        "Holbrook Rangers held their nerve. Valhalla go out in the first round.",
        "It stings. The dressing room is quiet. But the season is far from over.",
      ],
      next: 'injury_event',
    },

    fa_cup_out_qf: {
      id: 'fa_cup_out_qf', type: 'knockout_transition',
      competition: 'FA Cup', round: 'Quarter-Final',
      lines: [
        "Willowbrook City end Valhalla's FA Cup dream at the last eight.",
        "So close to the semi-final — and now it's over.",
        "The focus shifts. The league and Europe remain. This isn't the end.",
      ],
      next: null, // Engine.next() → callup_decision in spine
    },

    fa_cup_out_sf: {
      id: 'fa_cup_out_sf', type: 'knockout_transition',
      competition: 'FA Cup', round: 'Semi-Final',
      lines: [
        "Ironclad United end the FA Cup run at the semi-final stage.",
        "Wembley was within sight. Now it's gone.",
        "Lena says nothing on the coach home. There's nothing to say.",
      ],
      next: null, // Engine.next() → champions_ko_check in spine
    },

    fa_cup_out_final: {
      id: 'fa_cup_out_final', type: 'knockout_transition',
      competition: 'FA Cup', round: 'Final',
      lines: [
        "The FA Cup Final ends in defeat. Runners-up.",
        "You stood on the biggest domestic stage and fell short. It will define your thinking for years.",
        "The trophy stays with Ironclad. The dressing room is devastated.",
      ],
      next: null, // Engine.next() → champions_final_check in spine
    },

    champ_out_group: {
      id: 'champ_out_group', type: 'knockout_transition',
      competition: 'Champions Cup', round: 'Group Stage',
      lines: [
        "Valhalla are eliminated from the Champions Cup at the group stage.",
        "Europe's elite were unforgiving. The lessons are painful but real.",
        "The continental chapter is closed — but the season still has so much to play for.",
      ],
      next: 'player_conflict',
    },

    champ_out_ko: {
      id: 'champ_out_ko', type: 'knockout_transition',
      competition: 'Champions Cup', round: 'Quarter-Final',
      lines: [
        "Real Estrada end the Champions Cup run. Out at the quarter-final stage.",
        "A European campaign to be proud of — and a reminder of how much further there is to go.",
        "The dressing room will take time to recover. The season run-in demands more.",
      ],
      next: 'locker_room_talk',
    },

    champ_out_final: {
      id: 'champ_out_final', type: 'knockout_transition',
      competition: 'Champions Cup', round: 'Final',
      lines: [
        "Dynamo Vostok win the Champions Cup Final. Valhalla finish as runners-up.",
        "You took this club to a European final. Nobody saw it coming.",
        "The trophy is theirs. The legacy is yours.",
      ],
      next: null, // Engine.next() → cwc_qualify_check in spine
    },

    cwc_out_r16: {
      id: 'cwc_out_r16', type: 'knockout_transition',
      competition: 'Club World Cup', round: 'Round of 16',
      lines: [
        "Santos Esmeralda eliminate Valhalla in the Round of 16.",
        "The Club World Cup ends early. But reaching it at all was extraordinary.",
        "The flight home is long and quiet.",
      ],
      next: 'season_summary',
    },

    cwc_out_qf: {
      id: 'cwc_out_qf', type: 'knockout_transition',
      competition: 'Club World Cup', round: 'Quarter-Final',
      lines: [
        "The Club World Cup quarter-final brings the run to an end.",
        "Four clubs left in the world — Valhalla just fell short of that group.",
        "It was a season that redefined what this club believes it can do.",
      ],
      next: 'season_summary',
    },

    cwc_out_sf: {
      id: 'cwc_out_sf', type: 'knockout_transition',
      competition: 'Club World Cup', round: 'Semi-Final',
      lines: [
        "The Club World Cup semi-final ends Valhalla's run. So close to the final.",
        "Third place. Top three clubs on the planet.",
        "Paulo Ferretti calls before the plane lands. He sounds like he's trying not to cry.",
      ],
      next: 'season_summary',
    },

    cwc_out_final: {
      id: 'cwc_out_final', type: 'knockout_transition',
      competition: 'Club World Cup', round: 'Final',
      lines: [
        "The Club World Cup Final. Valhalla gave everything. It wasn't enough.",
        "Runners-up at the Club World Cup. The greatest season in the club's history.",
        "The trophy is someone else's. The story belongs to Valhalla.",
      ],
      next: 'season_summary',
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
    // style_reaction is handled by branch from style_choice → leads to meet_kai
    scenes.meet_kai,
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
    scenes.fa_cup_r1,             // onLoss → fa_cup_out_r1 (off-spine)
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
    scenes.fa_cup_qf_check,       // gate: qualified for QF?
    scenes.fa_cup_qf,             // onLoss → fa_cup_out_qf (off-spine)
    scenes.callup_decision,
    scenes.rotation_decision,
    scenes.champions_group_2,
    scenes.champ_group_check,     // gate: qualified from groups?
    scenes.player_conflict,
    scenes.mentorship_scene,
    scenes.media_crisis,
    scenes.match_league_5,
    scenes.transfer_deadline,
    scenes.fan_event,
    scenes.staff_hiring,
    scenes.match_league_6,
    scenes.fa_cup_sf_check,       // gate: qualified for SF?
    scenes.fa_cup_sf,             // onLoss → fa_cup_out_sf (off-spine)
    scenes.champions_ko_check,    // gate: qualified for Champions KO?
    scenes.champions_ko,          // onLoss → champ_out_ko (off-spine)
    scenes.locker_room_talk,
    scenes.second_half_review,
    scenes.paulo_final_meeting,
    scenes.match_title_decider,
    scenes.fa_cup_final_check,    // gate: qualified for FA Cup Final?
    scenes.fa_cup_final,          // onLoss → fa_cup_out_final (off-spine)
    scenes.champions_final_check, // gate: qualified for Champions Final?
    scenes.champions_final,       // onLoss → champ_out_final (off-spine)
    scenes.cwc_qualify_check,     // gate: league winner → CWC
    scenes.cwc_r16,               // onLoss → cwc_out_r16 (off-spine)
    scenes.cwc_qf,                // onLoss → cwc_out_qf (off-spine)
    scenes.cwc_sf,                // onLoss → cwc_out_sf (off-spine)
    scenes.cwc_final,             // onLoss → cwc_out_final (off-spine)
    scenes.season_summary,
    scenes.season_end_eval,
  ];

  return { scenes, events };

})();
