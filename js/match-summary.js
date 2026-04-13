/* ============================================================
   MATCH SUMMARY — Procedural match reports with scorers,
   timelines, and narrative prose.
   ============================================================ */

window.Game = window.Game || {};

window.Game.MatchSummary = (function () {

  // ── Seeded RNG ────────────────────────────────────────────────
  function mkRng(seed) {
    let s = (seed ^ 0xdeadbeef) >>> 0;
    return function () {
      s ^= s << 13; s ^= s >> 17; s ^= s << 5;
      return (s >>> 0) / 0x100000000;
    };
  }
  function hashStr(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h ^ str.charCodeAt(i)) >>> 0;
    return h;
  }
  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

  // ── Opponent Name Pool ────────────────────────────────────────
  const OPP_NAMES = [
    'Rossi','Müller','Petrov','Nkrumah','Tanaka','Brennan','Kowalski','Marchetti',
    'Bergqvist','Ferreira','Lindqvist','Johansson','Dembélé','Volkov','Ndidi',
    'Kruse','Cardoso','Almeida','Yilmaz','Dupont','Osei','Stankovic','Sakamoto',
    'Ribeiro','Holmberg','Nakamura','Dzeko','Kessler','Andriessen','Papadopoulos',
    'Traoré','Gomes','Ibrahim','Baptiste','Fernández','Hassan','Eriksen','Kovač',
  ];

  function oppName(opponentTeam, idx) {
    const r = mkRng(hashStr(opponentTeam + '_' + idx));
    return pick(OPP_NAMES, r);
  }

  // ── Goal & Assist Weights By Position ─────────────────────────
  const GOAL_W = {
    GK: 0.04, CB: 0.5, RB: 0.6, LB: 0.6, RWB: 1.0, LWB: 1.0,
    CM: 1.4,  DM: 0.6, CAM: 2.5, RM: 2.0, LM: 2.0,
    ST: 4.5,  CF: 4.5, RW: 3.0, LW: 3.0,
  };
  const ASSIST_W = {
    GK: 0.1,  CB: 0.4, RB: 1.2, LB: 1.2, RWB: 1.6, LWB: 1.6,
    CM: 2.2,  DM: 0.8, CAM: 3.2, RM: 2.6, LM: 2.6,
    ST: 1.2,  CF: 1.2, RW: 2.0, LW: 2.0,
  };

  function wPick(players, weights, rng, excludeId) {
    const pool = excludeId ? players.filter(p => p.id !== excludeId) : players;
    const total = pool.reduce((s, p) => s + (weights[p.position] || 1), 0);
    let r = rng() * total;
    for (const p of pool) { r -= (weights[p.position] || 1); if (r <= 0) return p; }
    return pool[pool.length - 1];
  }

  // ── Goal Type By Position ─────────────────────────────────────
  function goalType(player, minute, rng) {
    const p = player.position;
    const late = minute > 78;
    let pool;
    if (['ST','CF'].includes(p))          pool = ['clinical','clinical','tap_in','tap_in','header','breakaway'];
    else if (['RW','LW'].includes(p))     pool = ['clinical','individual','long_range','header'];
    else if (['RM','LM'].includes(p))     pool = ['clinical','individual','long_range'];
    else if (p === 'CAM')                 pool = ['clinical','long_range','free_kick','individual'];
    else if (['CM','DM'].includes(p))     pool = ['long_range','long_range','header','free_kick'];
    else if (['CB','RB','LB','RWB','LWB'].includes(p)) pool = ['header','header','tap_in','long_range'];
    else                                  pool = ['header'];
    if (late && rng() < 0.18) return 'individual';
    return pick(pool, rng);
  }

  // ── Minute Generation ─────────────────────────────────────────
  function genMinutes(total, rng) {
    if (total === 0) return [];
    const mins = [];
    let attempts = 0;
    while (mins.length < total && attempts < 200) {
      attempts++;
      const r = rng();
      let m;
      if      (r < 0.15) m = 2  + Math.floor(rng() * 13);
      else if (r < 0.30) m = 16 + Math.floor(rng() * 15);
      else if (r < 0.47) m = 32 + Math.floor(rng() * 14);
      else if (r < 0.64) m = 47 + Math.floor(rng() * 14);
      else if (r < 0.83) m = 62 + Math.floor(rng() * 14);
      else               m = 77 + Math.floor(rng() * 14);
      if (!mins.some(x => Math.abs(x - m) < 2)) mins.push(m);
    }
    // Occasionally push one to injury time
    if (total > 0 && rng() < 0.14) mins[mins.length - 1] = 90 + 1 + Math.floor(rng() * 5);
    return mins.sort((a, b) => a - b);
  }

  // ── Arc Selection ─────────────────────────────────────────────
  function selectArc(vG, oG, firstIsV) {
    if (vG === 0 && oG === 0) return 'goalless';
    if (vG > oG) {
      if (!firstIsV) return 'comeback';
      if (vG >= 3 && oG === 0) return 'dominant';
      if (vG - oG >= 2) return 'dominant';
      return 'narrow_win';
    }
    if (vG === oG) return firstIsV ? 'heartbreak_draw' : 'fair_draw';
    return firstIsV ? 'sucker_punch' : 'defeat';
  }

  // ── Significance Labels ───────────────────────────────────────
  function significance(vBefore, oBefore, isV, isLast) {
    if (isV) {
      if (vBefore === 0 && oBefore === 0) return 'opener';
      if (vBefore < oBefore)  return (vBefore + 1 === oBefore) ? 'equaliser' : 'pulling_back';
      if (vBefore === oBefore) return 'go_ahead';
      return isLast ? 'final_nail' : 'insurance';
    } else {
      if (vBefore === 0 && oBefore === 0) return 'they_open';
      if (oBefore < vBefore)  return (oBefore + 1 === vBefore) ? 'they_level' : 'they_reduce';
      if (oBefore === vBefore) return 'they_go_ahead';
      return 'they_extend';
    }
  }

  // ── Template Pools ────────────────────────────────────────────

  const OPENINGS = {
    dominant: [
      "There was only ever one team in it.",
      "From the first whistle, Valhalla meant business.",
      "A masterclass — dominant, clinical, and in complete control.",
      "The script was written early. This was Valhalla's day.",
      "Rarely does a team impose themselves so completely.",
      "A performance to remember. Valhalla were simply outstanding.",
    ],
    comeback: [
      "It would have been easy to fold. Valhalla didn't.",
      "Down but never out — that's become this team's identity.",
      "Character. Pure, unadulterated character.",
      "Against the odds, against the run of play — Valhalla found a way.",
      "The Gaffer won't care how it looked. Three points is three points.",
    ],
    narrow_win: [
      "Grinding, battling, winning. The hallmark of a proper side.",
      "Not pretty, but effective. The three points are all that matters.",
      "A professional job done in difficult circumstances.",
      "They made it hard for themselves — but the result is all that counts.",
      "Resilience rewarded. Valhalla edge a tight one.",
    ],
    sucker_punch: [
      "Football can be a cruel game. Valhalla felt every inch of that today.",
      "They did so much right. And yet it wasn't enough.",
      "The performance deserved more — but results don't care about performances.",
      "A reminder that nothing is certain until the whistle blows.",
    ],
    heartbreak_draw: [
      "A draw feels like a defeat. Because it is, in every way that matters.",
      "Two points dropped. The dressing room will be quiet.",
      "So close to three points. So far from deserving just one.",
      "The Gaffer's expression told the story — frustration, barely concealed.",
    ],
    fair_draw: [
      "Honours even — and few would argue with the outcome.",
      "A hard-earned point against determined opposition.",
      "Both sides left with something. Neither with everything.",
      "Competitive, physical, honest. A fair result in the end.",
    ],
    goalless: [
      "Tight, tense, and goalless. A point apiece, and no complaints.",
      "The goalkeepers were the busiest players today.",
      "A clean sheet earned the hard way.",
    ],
    defeat: [
      "A difficult day at the office.",
      "The better team won. There is no other way to put it.",
      "Valhalla will regroup — but the wounds from this will take time.",
      "A rare off-day. The Gaffer will demand a response.",
    ],
  };

  const CLOSINGS = {
    dominant: [
      "A statement result. The rest of the division has been warned.",
      "Three points, zero doubts. The Gaffer can allow himself a smile.",
      "Emphatic. Clinical. Valhalla at their very best.",
      "The goals came freely and the defence barely looked troubled.",
    ],
    comeback: [
      "They'll show the highlights in the dressing room for a week.",
      "The Gaffer's half-time words clearly hit home.",
      "This is what football is about. Never, ever give up.",
      "Three points from nowhere. The stuff of legend.",
    ],
    narrow_win: [
      "The points are all that matter, and Valhalla have them.",
      "Unconvincing but winning. The Gaffer will take it.",
      "Job done. Questions to answer, but three points in the bank.",
      "They'll play better. But they won't always win.",
    ],
    sucker_punch: [
      "Recriminations can wait. Recovery starts now.",
      "The Gaffer's post-match expression said everything.",
      "A lesson in the fine margins of this game.",
    ],
    heartbreak_draw: [
      "Two dropped points. The table will be a reminder.",
      "The Gaffer will address it. He'll have to.",
      "A point in the end, but it tastes like nothing.",
    ],
    fair_draw: [
      "A point apiece — both managers can live with that.",
      "Solid, if unspectacular. The season is long.",
      "One point on the board. Not three, but not nothing.",
    ],
    goalless: [
      "A clean sheet on the road is rarely a bad result.",
      "Solidity first, always. One point safely banked.",
    ],
    defeat: [
      "The table doesn't lie. The Gaffer knows what needs to change.",
      "Onwards. There is no other direction.",
      "A difficult one to take. But it is not fatal — not yet.",
    ],
  };

  // Valhalla goal descriptions — {S} = scorer, {A} = assister
  const V_GOALS = {
    clinical: [
      "{S} collects on the edge of the area and drives it low into the corner. No chance for the keeper.",
      "One touch to control, one to finish — {S} makes it look effortless.",
      "{S} opens his body and guides it into the far corner. Textbook.",
      "The keeper gets a hand to it but {S}'s finish has too much venom. In off the post.",
      "{S} latches on to the through ball and slots it home with precision. Ice in his veins.",
      "{S} peels off his marker and buries it before the keeper can set himself.",
      "Sharp, quick, clinical. {S} receives, swivels, fires. The net billows.",
      "A composed finish from {S} — far post, bottom corner. Quite beautiful.",
    ],
    tap_in: [
      "It is a poacher's finish from {S} — right place, right time.",
      "The delivery comes in, the defender lunges and misses, and {S} pokes it home.",
      "{S} reacts quickest to the loose ball and rolls it into the empty net.",
      "A scramble in the box ends with {S} forcing it over the line. Ugly, but it counts.",
      "{S} is waiting at the back post and simply cannot miss. Two yards out, he doesn't.",
    ],
    header: [
      "{S} times the run to perfection and attacks the cross with a commanding header.",
      "From the delivery, {S} rises above his man and powers it into the top corner.",
      "Towering from {S} — he out-muscles the defender and sends a firm header past the keeper.",
      "{S} ghosts in at the back post and meets the cross with a glancing header. Unstoppable.",
      "From the corner, {S} attacks the ball early and it rockets into the net.",
    ],
    long_range: [
      "{S} looks up at 28 yards and lets fly. It dips viciously and crashes in off the bar.",
      "Nobody expects the shot from {S} at this range — least of all the keeper. 30 yards, top corner.",
      "{S} catches it sweetly from distance. The keeper backpedals helplessly.",
      "A thunderous strike from {S} from outside the area. Absolutely unstoppable.",
      "{S} cuts inside, shapes for the cross — then pulls the trigger. The keeper is rooted.",
      "Eyes up, 25 yards out. Strike. {S} makes it look embarrassingly simple.",
    ],
    individual: [
      "{S} picks up the ball in deep midfield, beats two challenges, and fires into the corner. Breathtaking.",
      "End-to-end from {S} — he carries 40 yards, skips past a challenge, and slots home with ease.",
      "A moment of pure quality: {S} dances past three defenders and bends it around the keeper.",
      "{S} sets off on a mazy run from the halfway line and nobody can stop him. Stunning.",
      "There is no stopping {S} when he's in this mood. He cuts in, feints, fires. In.",
      "Solo brilliance — {S} collects deep, accelerates away, and curls it into the far corner.",
    ],
    breakaway: [
      "Valhalla break at lightning pace. Three passes and {S} is clean through. He does not miss.",
      "The turnover is instant, the transition devastating. {S} slides it home on the counter.",
      "{S} latches on to the through ball, outstrips the last defender, and rounds the keeper coolly.",
      "In behind! {S} is one-on-one and shows nerves of steel. Back of the net.",
    ],
    free_kick: [
      "{S} stands over the free kick 22 yards out. He bends it over the wall and into the corner. Outrageous.",
      "The free kick delivery from {S} is immaculate — curls over the wall and drops just under the bar.",
      "{S} takes responsibility. Thunderous strike. The keeper doesn't move.",
      "A deadball delivery from {S} that any goalkeeper in the world would struggle to stop.",
    ],
    penalty: [
      "The referee points to the spot. {S} waits... and sends the keeper the wrong way. Ruthless.",
      "{S} places the penalty with cold precision into the bottom corner. No hesitation whatsoever.",
      "Cool under pressure: {S} waits for the keeper to commit, then rolls it into the empty side.",
      "{S} stutters in his run-up, the keeper dives early — {S} rolls it into the vacated corner.",
    ],
  };

  // Opponent goal descriptions — {scorer}, {opponent}, {score}
  const O_GOALS = {
    they_open: [
      "{scorer} catches Valhalla cold with a sharp finish from the edge of the box.",
      "Against the run of play, {scorer} reacts quickest to a loose ball and finishes clinically.",
      "A corner, a flick-on, and {scorer} is there to nod it home. Against the run of play.",
      "{scorer} strikes from range and it takes a cruel deflection past the keeper.",
      "A moment's lapse at the back and {scorer} pounces. Valhalla have been punished.",
    ],
    they_level: [
      "{scorer} pulls one back for {opponent} — a low drive that squirms through.",
      "The equaliser comes against the run of play. {scorer} finishes with confidence.",
      "{scorer} is given too much space on the edge of the box and he makes Valhalla pay.",
      "A free kick from {scorer} bends beyond the wall and the keeper alike.",
      "{opponent} level — {scorer} reacts to a spilled save and taps it home.",
    ],
    they_go_ahead: [
      "{scorer} gives {opponent} the lead — a sucker punch that silences the travelling support.",
      "The momentum shifts in an instant. {scorer} finishes emphatically to make it {score}.",
      "{opponent} turn the game on its head through {scorer}. A quality goal.",
      "A quality strike from {scorer}. Suddenly Valhalla find themselves behind.",
    ],
    they_extend: [
      "{scorer} makes it {score}. The deficit widens, and it begins to look bleak.",
      "A second for {opponent} through {scorer}. This is beginning to look ominous.",
      "{scorer} capitalises on a lapse in concentration. {score}. A mountain to climb.",
    ],
    they_reduce: [
      "{scorer} reduces the deficit. {score} — and {opponent} have a foothold.",
      "A consolation from {scorer}. It comes too late to matter, but {opponent} have their goal.",
    ],
    they_score: [
      "{scorer} pulls one back for {opponent}.",
      "A well-taken goal from {scorer}.",
      "{scorer} adds one for {opponent}. {score}.",
    ],
  };

  // ── Prose goal sentences (newspaper style, no minute stamps) ──
  // {S} = scorer name, {A} = assister name, {opp} = opponent team

  const V_PROSE = {
    opener: [
      "**{S}** broke the deadlock, finishing with the composure of a player who never had any doubt.",
      "It was **{S}** who opened the scoring, latching on to the chance and dispatching it with authority.",
      "**{S}** got Valhalla off the mark with a finish that showed exactly why the Gaffer selected him.",
      "The breakthrough came through **{S}**, who found the net with a well-taken effort.",
      "Valhalla drew first blood through **{S}**, who made no mistake when the opportunity presented itself.",
      "**{S}** gave Valhalla the lead, arriving at exactly the right moment to convert and send the support wild.",
    ],
    go_ahead: [
      "**{S}** restored Valhalla's lead, and this time there was a sense it would not be relinquished.",
      "The response was swift and emphatic — **{S}** put Valhalla back in front with a clinical finish.",
      "**{S}** turned the game back in Valhalla's favour, driving home to silence any growing doubts.",
      "Back in front through **{S}**, who took his chance with the composure of a seasoned professional.",
      "Valhalla seized the initiative again — **{S}** made it count with a composed and well-placed finish.",
    ],
    equaliser: [
      "**{S}** hauled Valhalla level, refusing to let the deficit stand.",
      "Parity restored through **{S}**, who rose to the occasion when it mattered most.",
      "**{S}** pulled Valhalla back into it, converting with the sort of finesse that changes games.",
      "Credit to **{S}** for Valhalla's equaliser — a goal that completely altered the complexion of the match.",
      "**{S}** drew Valhalla level in a moment that lifted the whole team.",
    ],
    insurance: [
      "**{S}** made the game safe, adding a second that all but ended the contest.",
      "A second from **{S}** gave Valhalla the breathing room they had been searching for.",
      "**{S}** doubled the advantage, finishing smartly to put the result beyond serious question.",
      "The lead was doubled through **{S}**, who capitalised on the space that had begun to open up.",
      "**{S}** extended Valhalla's lead, capping a fine individual display with a well-taken goal.",
    ],
    final_nail: [
      "**{S}** sealed the win and closed the chapter on an impressive Valhalla display.",
      "A third from **{S}** put the result to bed — the performance fully matched the scoreline.",
      "**{S}** completed the scoring, rounding off a performance that will be remembered warmly.",
      "The victory was confirmed through **{S}**, whose goal was the fullstop on an authoritative showing.",
      "**{S}** put the icing on the cake with a goal that Valhalla thoroughly deserved.",
    ],
    pulling_back: [
      "**{S}** gave Valhalla hope, reducing the deficit and injecting renewed belief.",
      "A goal from **{S}** cut the gap, and suddenly the crowd was back on their feet.",
      "**{S}** pulled one back for Valhalla, ensuring the final stages would carry real tension.",
      "Valhalla were not done — **{S}** reduced the arrears to make the closing minutes truly nervous ones.",
    ],
  };

  const O_PROSE = {
    they_open: [
      "**{scorer}** gave {opp} the lead against the run of play — a reminder that this game was never going to be straightforward.",
      "{opp} drew first blood through **{scorer}**, capitalising on a rare lapse to take the lead.",
      "**{scorer}** opened the scoring for {opp}, and suddenly Valhalla had a mountain to climb.",
      "Against the flow of play, **{scorer}** found the net for {opp}, and the mood shifted instantly.",
      "It was {opp} who struck first through **{scorer}** — a sharp, opportunistic finish that caught Valhalla cold.",
    ],
    they_go_ahead: [
      "**{scorer}** gave {opp} the lead, a sucker punch that demanded an immediate response.",
      "{opp} turned it around through **{scorer}** — a goal that shifted the entire dynamic of the afternoon.",
      "The game swung dramatically as **{scorer}** put {opp} in front with a finish Valhalla will rue conceding.",
      "**{scorer}** made it a lead for {opp}, and suddenly the Gaffer's expression was all that needed reading.",
    ],
    they_level: [
      "**{scorer}** drew {opp} level, and the Valhalla lead was gone in a moment of defensive frailty.",
      "{opp} equalised through **{scorer}** — against the run of play, and deeply frustrating for Valhalla.",
      "The lead was cancelled out as **{scorer}** finished smartly for {opp}. Back to square one.",
      "**{scorer}** brought {opp} back level and restored a tension that Valhalla had been hoping to extinguish.",
    ],
    they_extend: [
      "**{scorer}** made it two for {opp}, and the task facing Valhalla now looked genuinely daunting.",
      "A second for {opp} through **{scorer}** — the deficit was growing, and time was becoming a factor.",
      "**{scorer}** added a second and the game began to drift away from Valhalla at an alarming rate.",
    ],
    they_reduce: [
      "**{scorer}** pulled one back for {opp} late on — a consolation, but it gave the score a more flattering look for the visitors.",
      "A goal for {opp} through **{scorer}** made the final whistle feel like a relief rather than a celebration.",
    ],
    they_score: [
      "**{scorer}** added one for {opp} — a goal that was against the run of play but counted all the same.",
      "**{scorer}** scored for {opp}, keeping a small element of doubt alive in the final stages.",
    ],
  };

  const ASSIST_PHRASES = [
    "{A} providing the assist with an inch-perfect delivery.",
    "{A} laying it on a plate with a perfectly weighted pass.",
    "{A} the architect — a beautifully threaded ball that split the defence open.",
    "a fine assist from {A}, who found him with precision.",
    "{A} doing the hard work before picking out the run with a clever ball.",
    "{A} with the pass that carved everything open.",
  ];

  const GOALLESS_BODY = [
    "Both sides created moments without ever truly threatening to break the deadlock. Neither goalkeeper was badly exposed, but the quality in the final third was simply absent on the day.",
    "Chances came and went for both teams, but finishing let each side down. A match decided more by fine margins and tight defensive discipline than any lack of effort.",
    "A battle of wills that never quite ignited. The game was tight, physical, and honest — and a draw was probably the truest reflection of what was on show.",
    "The possession stats told one story; the chances stats told another. Valhalla probed without reward, and the visitors showed enough resilience to justify their point.",
  ];

  const PROSE_TRANSITIONS = [
    "The game's most decisive spell came shortly after the interval.",
    "It was in the second period that the match truly came alive.",
    "Valhalla continued to press as the game wore on, and it began to tell.",
    "There was barely time to draw breath before the next twist arrived.",
    "The momentum shifted, and with it the whole complexion of the match.",
    "A brief moment of calm gave way to the afternoon's most dramatic chapter.",
    "The Gaffer's half-time message clearly landed — Valhalla came out a different side.",
    "As the clock ticked past the hour mark, the game entered its most intense phase.",
  ];

  const NON_GOAL = {
    near_miss: [
      "{p}'s volley flashes inches wide of the far post. Agonisingly close.",
      "{p} gets on the end of the cross and glances a header just over the bar.",
      "A swerving drive from {p} rattles the crossbar. The woodwork denies them.",
      "{p} finds himself one-on-one but the keeper makes a brilliant save.",
      "The shot from {p} is goal-bound until a last-ditch block diverts it wide.",
      "{p}'s curling effort clips the outside of the post. So close.",
    ],
    great_save: [
      "{k} makes himself big and denies their striker with an outstretched leg.",
      "A superb save from {k} — full stretch to his right to tip it around the post.",
      "The shot is heading top corner. {k} is equal to it with a stunning reflex stop.",
      "{k} reads the danger and scoops the ball clear before their striker can react.",
      "Brilliant from {k} — gets down low and scoops away what looked a certain goal.",
    ],
    near_miss_opp: [
      "Their striker fires wide under pressure — a genuine let-off.",
      "A free header from their centre-back somehow clears the crossbar. Valhalla breathe.",
      "A chance for the home side flashes just past the far post. Relief.",
    ],
    yellow_v: [
      "{p} goes in late and earns a yellow. He will need to manage himself carefully.",
      "The referee brandishes yellow towards {p} — a marginal call he'll have to accept.",
    ],
    yellow_o: [
      "Their midfielder picks up a booking for a cynical challenge. A free kick in a dangerous area.",
      "Frustration shows — a yellow card conceded in a dangerous position.",
    ],
  };

  const TRANSITIONS = [
    "The match settles into a mid-game rhythm.",
    "Both sides probe without reward before the next flashpoint.",
    "A spell of sustained Valhalla pressure eventually tells.",
    "The game opens up as both managers push for the decisive moment.",
    "Midfield battles define the next twenty minutes.",
    "Tension rises with each passing minute.",
    "There is little to separate the sides in this period.",
    "The clock ticks and the stakes rise accordingly.",
  ];

  // ── Event Generation ──────────────────────────────────────────

  function generateEvents(scene, result, state, rng) {
    const isHome = scene.homeAway === 'home';
    const vG = isHome ? result.homeGoals : result.awayGoals;
    const oG = isHome ? result.awayGoals : result.homeGoals;
    const opponent = scene.opponent || 'the opponents';

    // Active lineup players
    const starters = state.lineup
      .map(id => state.squad.find(p => p.id === id))
      .filter(p => p && !(p.id === 'prodigy' && !state.story.prodigyOnSquad));

    const keeper = starters.find(p => p.position === 'GK') || starters[0] || { name: 'Kovic', position: 'GK', id: 'gk' };
    if (starters.length === 0) return [];

    const total = vG + oG;
    const minutes = genMinutes(total, rng);

    // Shuffle goal ownership: vG Valhalla goals, oG opponent goals
    const ownership = [...Array(vG).fill(true), ...Array(oG).fill(false)];
    for (let i = ownership.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [ownership[i], ownership[j]] = [ownership[j], ownership[i]];
    }

    // Opponent name pool (deterministic per opponent)
    const oppPool = Array.from({ length: 10 }, (_, i) => oppName(opponent, i));
    let oppIdx = 0;

    const events = [];
    let vScore = 0, oScore = 0;

    minutes.forEach((min, i) => {
      const isV = ownership[i];
      const isLast = (i === minutes.length - 1);

      if (isV) {
        const scorer  = wPick(starters, GOAL_W, rng, null);
        const hasAssist = rng() < 0.72;
        const assist  = hasAssist ? wPick(starters, ASSIST_W, rng, scorer.id) : null;
        const type    = goalType(scorer, min, rng);
        const sig     = significance(vScore, oScore, true, isLast);
        vScore++;
        const hS = isHome ? vScore : oScore, aS = isHome ? oScore : vScore;
        events.push({
          type: 'goal', minute: min, isValhalla: true,
          scorer: scorer.name, scorerShort: scorer.name.split(' ').pop(), scorerId: scorer.id,
          assist: assist ? assist.name : null, assistShort: assist ? assist.name.split(' ').pop() : null,
          assistId: assist ? assist.id : null,
          goalType: type, significance: sig,
          homeScore: hS, awayScore: aS, scoreStr: `${hS}–${aS}`,
        });
      } else {
        const sName = oppPool[oppIdx++ % oppPool.length];
        const sig   = significance(vScore, oScore, false, isLast);
        oScore++;
        const hS = isHome ? vScore : oScore, aS = isHome ? oScore : vScore;
        events.push({
          type: 'goal', minute: min, isValhalla: false,
          scorer: sName, scorerShort: sName, assist: null, assistShort: null,
          goalType: 'clinical', significance: sig,
          homeScore: hS, awayScore: aS, scoreStr: `${hS}–${aS}`,
        });
      }
    });

    // Non-goal filler events (2–4)
    const fillerCount = 2 + Math.floor(rng() * 3);
    for (let n = 0; n < fillerCount; n++) {
      let m, tries = 0;
      do { m = 2 + Math.floor(rng() * 88); tries++; }
      while (tries < 30 && events.some(e => Math.abs(e.minute - m) < 4));

      const r = rng();
      let ev;
      if (r < 0.28) {
        const atk = starters.filter(p => ['ST','CF','RW','LW','CAM','RM','LM'].includes(p.position));
        const p = pick(atk.length > 0 ? atk : starters, rng);
        ev = { type: 'near_miss', minute: m, isValhalla: true,
          text: pick(NON_GOAL.near_miss, rng).replace('{p}', p.name.split(' ').pop()) };
      } else if (r < 0.52) {
        ev = { type: 'save', minute: m, isValhalla: true,
          text: pick(NON_GOAL.great_save, rng).replace('{k}', keeper.name.split(' ').pop()) };
      } else if (r < 0.65) {
        ev = { type: 'near_miss_opp', minute: m, isValhalla: false,
          text: pick(NON_GOAL.near_miss_opp, rng) };
      } else if (r < 0.80) {
        const p = pick(starters, rng);
        ev = { type: 'yellow', minute: m, isValhalla: true,
          text: pick(NON_GOAL.yellow_v, rng).replace('{p}', p.name.split(' ').pop()) };
      } else {
        ev = { type: 'yellow_opp', minute: m, isValhalla: false,
          text: pick(NON_GOAL.yellow_o, rng) };
      }
      events.push(ev);
    }

    return events.sort((a, b) => a.minute - b.minute);
  }

  // ── Prose Builder (newspaper report style) ───────────────────

  function buildProse(events, arc, scene, result, rng) {
    const opp = scene.opponent || 'the opponents';
    const goalEvents = events.filter(e => e.type === 'goal');
    const paras = [];

    // Opening sentence
    paras.push(pick(OPENINGS[arc] || OPENINGS.narrow_win, rng));

    // Goalless match — single descriptive body paragraph
    if (goalEvents.length === 0) {
      paras.push(pick(GOALLESS_BODY, rng));
      paras.push(pick(CLOSINGS[arc] || CLOSINGS.goalless, rng));
      return paras;
    }

    // Build one prose sentence per goal
    const goalSentences = goalEvents.map(ev => goalSentence(ev, opp, rng));

    // Group into paragraphs: ≤2 goals = one paragraph; 3-4 = split roughly in half; 5+ = thirds
    const chunks = splitIntoChunks(goalSentences);

    chunks.forEach((chunk, i) => {
      // Transition between paragraphs
      if (i > 0) paras.push(pick(PROSE_TRANSITIONS, rng));
      paras.push(chunk.join(' '));
    });

    // Closing sentence
    paras.push(pick(CLOSINGS[arc] || CLOSINGS.narrow_win, rng));

    return paras;
  }

  function goalSentence(ev, opp, rng) {
    if (ev.isValhalla) {
      const pool  = V_PROSE[ev.significance] || V_PROSE.insurance;
      let sentence = pick(pool, rng)
        .replace(/\{S\}/g, ev.scorerShort);

      // Occasionally append assist mention
      if (ev.assist && rng() < 0.50) {
        const assistPhrase = pick(ASSIST_PHRASES, rng)
          .replace(/\{A\}/g, ev.assistShort);
        // Stitch naturally: strip trailing period, add comma + phrase + period
        sentence = sentence.replace(/\.\s*$/, '') + ', ' + assistPhrase + '.';
      }

      return sentence;
    } else {
      const pool = O_PROSE[ev.significance] || O_PROSE.they_score;
      return pick(pool, rng)
        .replace(/\{scorer\}/g, ev.scorerShort)
        .replace(/\{opp\}/g, opp);
    }
  }

  function splitIntoChunks(sentences) {
    const n = sentences.length;
    if (n <= 2) return [sentences];
    if (n <= 4) {
      const mid = Math.ceil(n / 2);
      return [sentences.slice(0, mid), sentences.slice(mid)];
    }
    const a = Math.ceil(n / 3), b = Math.ceil((n - a) / 2);
    return [sentences.slice(0, a), sentences.slice(a, a + b), sentences.slice(a + b)];
  }

  // ── Player of the Match ───────────────────────────────────────

  function pickPotm(events, starters, result, rng) {
    if (!starters || starters.length === 0) return null;
    const vGoals = events.filter(e => e.type === 'goal' && e.isValhalla);

    // Score each starter: goals × 3 + assists × 1 + rating bonus
    const scores = {};
    starters.forEach(p => { scores[p.id] = p.rating * 0.01; }); // tiny rating tiebreak
    vGoals.forEach(e => {
      if (scores[e.scorerId] !== undefined) scores[e.scorerId] += 3;
      if (e.assistId && scores[e.assistId] !== undefined) scores[e.assistId] += 1;
    });

    // In a clean sheet / win, boost defenders and keeper slightly
    const isHome = result.outcome !== undefined;
    if (result.outcome === 'win' && vGoals.length === 0) {
      starters.forEach(p => {
        if (['GK','CB','RB','LB','RWB','LWB'].includes(p.position)) scores[p.id] += 1.5;
      });
    }

    let best = starters[0];
    starters.forEach(p => { if (scores[p.id] > scores[best.id]) best = p; });
    return best;
  }

  // ── Key Player Moment Detection ───────────────────────────────

  function detectKeyMoment(events, potm, result, state) {
    const vGoals = events.filter(e => e.type === 'goal' && e.isValhalla);
    // Check star first (most dramatic), then prodigy (most surprising), then veteran
    const priority = ['star', 'prodigy', 'veteran'];

    for (const charId of priority) {
      const player = state.squad.find(p => p.id === charId);
      if (!player) continue;
      if (charId === 'prodigy' && !state.story.prodigyOnSquad) continue;
      if (!state.lineup.includes(charId)) continue;

      const scored  = vGoals.filter(e => e.scorerId === charId);
      const assisted = vGoals.filter(e => e.assistId === charId);
      const isPotm   = potm && potm.id === charId;

      if (!scored.length && !assisted.length && !isPotm) continue;

      let type, detail;
      if (scored.length >= 2) {
        type = 'scored'; detail = 'brace';
      } else if (scored.length === 1) {
        const sig = scored[0].significance;
        if (result.outcome === 'win' && (sig === 'go_ahead' || sig === 'final_nail' || sig === 'insurance')) {
          type = 'scored'; detail = 'winner';
        } else if (sig === 'equaliser') {
          type = 'scored'; detail = 'equaliser';
        } else {
          type = 'scored'; detail = 'goal';
        }
      } else if (assisted.length) {
        type = 'assisted'; detail = assisted[0].significance;
      } else {
        type = 'potm'; detail = null;
      }

      return { character: charId, player, type, detail };
    }
    return null;
  }

  // ── Public ────────────────────────────────────────────────────

  function generate(scene, result, state) {
    const seed = hashStr(scene.id + result.homeGoals + '_' + result.awayGoals + result.outcome);
    const rng  = mkRng(seed);

    const events = generateEvents(scene, result, state, rng);

    const isHome  = scene.homeAway === 'home';
    const vG      = isHome ? result.homeGoals : result.awayGoals;
    const oG      = isHome ? result.awayGoals : result.homeGoals;
    const firstGoal = events.find(e => e.type === 'goal');
    const arc     = selectArc(vG, oG, firstGoal ? firstGoal.isValhalla : true);

    const proseParts = buildProse(events, arc, scene, result, rng);

    const starters = state.lineup
      .map(id => state.squad.find(p => p.id === id))
      .filter(Boolean);
    const potm       = pickPotm(events, starters, result, rng);
    const keyMoment  = detectKeyMoment(events, potm, result, state);

    return { events, arc, proseParts, potm, keyMoment };
  }

  return { generate };

})();
