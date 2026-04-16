/* ============================================================
   LEAGUE SIM — VPL team data, fixture generation, simulation
   ============================================================ */

window.Game = window.Game || {};

window.Game.LeagueSim = (function () {

  // 18 VPL teams. Valhalla is index 0.
  // All 7 story VPL opponents are included here so they appear in the league
  // table and between-rounds summaries. Holbrook Rangers is an FA Cup opponent
  // only (not VPL) and is not included.
  const TEAMS = [
    { id: 'valhalla',   name: 'FC Valhalla',          strength: 76 },
    { id: 'ironport',   name: 'Ironport City',         strength: 86 },
    { id: 'castello',   name: 'Castello FC',           strength: 85 },
    { id: 'blackwood',  name: 'Blackwood City',        strength: 83 },
    { id: 'ironclad',   name: 'Ironclad United',       strength: 81 },
    { id: 'westbridge', name: 'Westbridge FC',         strength: 80 },
    { id: 'northstars', name: 'Northern Stars FC',     strength: 79 },
    { id: 'greenvale',  name: 'Greenvale United',      strength: 78 },
    { id: 'northgate',  name: 'Northgate United',      strength: 77 },
    { id: 'silverton',  name: 'Silverton Athletic',    strength: 76 },
    { id: 'portholm',   name: 'Port Holmvik SC',       strength: 75 },
    { id: 'eastport',   name: 'Eastport Town',         strength: 74 },
    { id: 'redstorm',   name: 'Red Storm FC',          strength: 73 },
    { id: 'dalemark',   name: 'Dalemark Rangers',      strength: 73 },
    { id: 'redcliffs',  name: 'Red Cliffs Athletic',   strength: 72 },
    { id: 'helmsby',    name: 'Helmsby Town',          strength: 70 },
    { id: 'ashbrook',   name: 'Ashbrook FC',           strength: 69 },
    { id: 'redstone',   name: 'Redstone Athletic',     strength: 68 },
  ];

  // Maps story VPL match scene IDs to the league round they represent.
  // Other teams' results for all intermediate rounds are pre-simulated.
  const SCENE_TO_ROUND = {
    match_league_1:      1,
    match_league_2:      5,
    match_league_3:      9,
    match_league_4:     13,
    match_league_5:     19,
    match_league_6:     25,
    match_title_decider: 34,
  };

  // Story-pinned fixtures: which team Valhalla must face at each story round,
  // and whether Valhalla is home or away. Used by buildValhallaSchedule().
  const STORY_PINS = [
    { round: 1,  teamId: 'redstorm',   valHome: true  },  // match_league_1
    { round: 5,  teamId: 'castello',   valHome: false },  // match_league_2
    { round: 9,  teamId: 'ironclad',   valHome: true  },  // match_league_3
    { round: 13, teamId: 'northstars', valHome: false },  // match_league_4
    { round: 19, teamId: 'ironclad',   valHome: false },  // match_league_5
    { round: 25, teamId: 'redcliffs',  valHome: true  },  // match_league_6
    { round: 34, teamId: 'castello',   valHome: true  },  // match_title_decider
  ];

  // Build Valhalla's complete 34-game schedule with story fixtures pinned and
  // remaining opponents distributed across non-story rounds (deterministic).
  // Returns object: roundNum (1-based) → [homeTeamIdx, awayTeamIdx]
  function buildValhallaSchedule() {
    const schedule = {};
    const pinnedRounds = new Set(STORY_PINS.map(p => p.round));
    const pinnedTeamLegs = {}; // teamId → legs consumed by story pins

    for (const { round, teamId, valHome } of STORY_PINS) {
      const tIdx = TEAMS.findIndex(t => t.id === teamId);
      schedule[round] = valHome ? [0, tIdx] : [tIdx, 0];
      pinnedTeamLegs[teamId] = (pinnedTeamLegs[teamId] || 0) + 1;
    }

    // Determine which legs still need scheduling for each non-Valhalla team.
    // Each team needs exactly 2 legs (1 home + 1 away) total.
    // Teams fully covered by story pins (ironclad × 2, castello × 2) need nothing more.
    const remaining = [];
    for (const t of TEAMS.slice(1)) {
      const consumed = pinnedTeamLegs[t.id] || 0;
      const tIdx = TEAMS.indexOf(t);
      if (consumed === 0) {
        remaining.push([0, tIdx]);   // home leg
        remaining.push([tIdx, 0]);   // away leg
      } else if (consumed === 1) {
        // One leg done — check which. If valHome was true for this team's pin,
        // the home leg is done, so we need the away leg, and vice-versa.
        const pin = STORY_PINS.find(p => p.teamId === t.id);
        if (pin.valHome) {
          remaining.push([tIdx, 0]); // need away leg
        } else {
          remaining.push([0, tIdx]); // need home leg
        }
      }
      // consumed === 2: both legs covered by story pins → nothing to add
    }
    // remaining should have exactly 27 entries (34 total − 7 story rounds)

    // Deterministic shuffle for variety without randomness
    const seed = 0xDEAD;
    let s = seed;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xFFFFFFFF; };
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }

    const nonPinnedRounds = [];
    for (let r = 1; r <= 34; r++) {
      if (!pinnedRounds.has(r)) nonPinnedRounds.push(r);
    }

    for (let i = 0; i < nonPinnedRounds.length; i++) {
      schedule[nonPinnedRounds[i]] = remaining[i];
    }

    return schedule;
  }

  // ─── Schedule ──────────────────────────────────────────────

  // Standard round-robin for 18 teams → 34 rounds of 9 fixtures each.
  // Valhalla (index 0) is fixed; teams 1–17 rotate.
  function generateSchedule() {
    const n = TEAMS.length; // 18
    const rot = Array.from({ length: n - 1 }, (_, i) => i + 1); // [1..17]
    const first = [];

    for (let r = 0; r < n - 1; r++) {
      const round = [];
      // Valhalla alternates home/away each round
      round.push(r % 2 === 0 ? [0, rot[r]] : [rot[r], 0]);
      for (let i = 1; i < n / 2; i++) {
        const h = rot[(r + i)       % (n - 1)];
        const a = rot[(r + n - 1 - i) % (n - 1)];
        round.push([h, a]);
      }
      first.push(round);
    }

    // Second half reverses home/away
    const second = first.map(round => round.map(([h, a]) => [a, h]));
    return [...first, ...second];
  }

  // ─── Simulation ────────────────────────────────────────────

  function poissonSample(mean) {
    const L = Math.exp(-Math.max(0.01, mean));
    let k = 0, p = 1;
    do { p *= Math.random(); k++; } while (p > L);
    return Math.min(k - 1, 8);
  }

  function simGoals(homeStr, awayStr) {
    const BASE = 74;
    const homeMean = (homeStr / BASE) * 1.45 + 0.15;
    const awayMean = (awayStr  / BASE) * 1.10;
    return [poissonSample(homeMean), poissonSample(awayMean)];
  }

  // Generate a realistic scoreline that matches a known outcome.
  // homeAway: 'home' | 'away' | 'neutral' (from Valhalla's perspective)
  function scoreFromOutcome(outcome, homeAway) {
    const isHome = homeAway !== 'away';
    const r = () => Math.random();
    if (outcome === 'win') {
      const opts = isHome
        ? [[2,0],[2,1],[3,1],[3,0],[1,0],[4,1],[2,0],[1,0]]
        : [[0,2],[1,2],[0,1],[1,3],[0,2],[1,2]];
      return opts[Math.floor(r() * opts.length)];
    }
    if (outcome === 'draw') {
      const opts = [[0,0],[1,1],[1,1],[2,2],[0,0],[1,1]];
      return opts[Math.floor(r() * opts.length)];
    }
    // loss
    const opts = isHome
      ? [[0,1],[1,2],[0,2],[0,1],[1,2]]
      : [[1,0],[2,1],[2,0],[1,0],[2,1]];
    return opts[Math.floor(r() * opts.length)];
  }

  // Pre-simulate ALL 306 matches (including Valhalla's).
  // Valhalla's fixtures are pinned via buildValhallaSchedule() so story
  // opponents always appear at the correct rounds with correct home/away.
  // Story match outcomes for Valhalla will be overwritten by simulateBetweenRounds.
  // Returns: array[34] of array[9] of [homeIdx, awayIdx, hGoals, aGoals]
  function simulateSeason() {
    const schedule = generateSchedule();
    const valSchedule = buildValhallaSchedule();

    // Override Valhalla's fixture in each round with the pinned schedule
    for (let r = 0; r < schedule.length; r++) {
      const roundNum = r + 1;
      const pinned = valSchedule[roundNum];
      if (!pinned) continue;
      const valSlot = schedule[r].findIndex(([h, a]) => h === 0 || a === 0);
      if (valSlot >= 0) schedule[r][valSlot] = pinned;
    }

    return schedule.map(round =>
      round.map(([h, a]) => {
        const [hg, ag] = simGoals(TEAMS[h].strength, TEAMS[a].strength);
        return [h, a, hg, ag];
      })
    );
  }

  // ─── Table ────────────────────────────────────────────────

  // Compute the league table for all rounds up to (and including) upToRound (1-based).
  function computeTable(fixtures, upToRound) {
    const rows = TEAMS.map((t, i) => ({
      idx: i, id: t.id, name: t.name,
      played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0,
    }));

    const limit = Math.min(upToRound, fixtures.length);
    for (let r = 0; r < limit; r++) {
      for (const [h, a, hg, ag] of fixtures[r]) {
        const home = rows[h], away = rows[a];
        home.played++; away.played++;
        home.gf += hg;  home.ga += ag;
        away.gf += ag;  away.ga += hg;
        if      (hg > ag) { home.won++;   away.lost++;  }
        else if (hg < ag) { home.lost++;  away.won++;   }
        else              { home.drawn++; away.drawn++;  }
      }
    }

    return rows
      .map(t => ({ ...t, gd: t.gf - t.ga, pts: t.won * 3 + t.drawn }))
      .sort((a, b) =>
        b.pts !== a.pts ? b.pts - a.pts :
        b.gd  !== a.gd  ? b.gd  - a.gd  :
        b.gf  !== a.gf  ? b.gf  - a.gf  :
        a.name.localeCompare(b.name)
      );
  }

  function getRoundForScene(sceneId) {
    return SCENE_TO_ROUND[sceneId] ?? null;
  }

  // ─── Between-match simulation ──────────────────────────────

  // Goal/assist weight by position (higher = more likely)
  const GOAL_WEIGHT   = { GK:1, CB:3, LB:3, RB:3, DM:5, CM:10, LM:15, RM:15, LW:15, RW:15, CAM:20, ST:35, CF:35 };
  const ASSIST_WEIGHT = { GK:0, CB:3, LB:5, RB:5, DM:8, CM:18, LM:18, RM:18, LW:18, RW:18, CAM:25, ST:8,  CF:8  };

  // Opponent scorer name pool (matches the pool in match-summary.js)
  const OPP_NAMES = [
    'Rossi','Müller','Petrov','Nkrumah','Tanaka','Brennan','Kowalski','Marchetti',
    'Bergqvist','Ferreira','Lindqvist','Johansson','Dembélé','Volkov','Ndidi',
    'Kruse','Cardoso','Almeida','Yilmaz','Dupont','Osei','Stankovic','Sakamoto',
    'Ribeiro','Holmberg','Nakamura','Dzeko','Kessler','Andriessen','Papadopoulos',
    'Traoré','Gomes','Ibrahim','Baptiste','Fernández','Hassan','Eriksen','Kovač',
  ];

  // Deterministic scorer name for a given opponent + goal index
  function _oppScorerName(opponentId, goalIdx) {
    let h = 5381;
    const key = opponentId + '_g' + goalIdx;
    for (let i = 0; i < key.length; i++) h = ((h << 5) + h ^ key.charCodeAt(i)) >>> 0;
    return OPP_NAMES[h % OPP_NAMES.length];
  }

  function _weightedPick(players, weightMap, excludeId) {
    const pool = excludeId ? players.filter(p => p.id !== excludeId) : players;
    if (!pool.length) return null;
    const total = pool.reduce((s, p) => s + (weightMap[p.position] || 5), 0);
    let rand = Math.random() * total;
    for (const p of pool) {
      rand -= (weightMap[p.position] || 5);
      if (rand <= 0) return p;
    }
    return pool[pool.length - 1];
  }

  // Simulate scorers, assists, POTM, and opponent scorers for a Valhalla match.
  // Returns { events: [{minute, isValhalla, scorerId?, scorerName, assistId?, assistName?}], potm }
  function simulateMatchEvents(valGoals, oppGoals, opponentId, lineup, squad) {
    const players = (lineup || []).map(id => (squad || []).find(p => p.id === id)).filter(Boolean);
    const shortName = p => window.Game.Characters.getShortName(p);

    const goalCounts = {}, assistCounts = {};
    const valMinutes = Array.from({ length: valGoals }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);
    const valEvents = [];

    for (const minute of valMinutes) {
      const scorer = _weightedPick(players, GOAL_WEIGHT, null);
      if (!scorer) continue;
      goalCounts[scorer.id] = (goalCounts[scorer.id] || 0) + 1;

      let assister = null;
      if (Math.random() > 0.15) {
        assister = _weightedPick(players, ASSIST_WEIGHT, scorer.id);
        if (assister) assistCounts[assister.id] = (assistCounts[assister.id] || 0) + 1;
      }
      valEvents.push({
        minute,
        isValhalla: true,
        scorerId:   scorer.id,
        scorerName: shortName(scorer),
        assistId:   assister ? assister.id        : null,
        assistName: assister ? shortName(assister) : null,
      });
    }

    // Opponent goal events with real names
    const oppMinutes = Array.from({ length: oppGoals }, () => Math.floor(Math.random() * 90) + 1).sort((a, b) => a - b);
    const oppEvents = oppMinutes.map((minute, i) => ({
      minute,
      isValhalla: false,
      scorerName: _oppScorerName(opponentId, i),
    }));

    // Merge and sort all events by minute
    const events = [...valEvents, ...oppEvents].sort((a, b) => a.minute - b.minute);

    // POTM: highest weighted contribution (goals double)
    let potm = null, best = -1;
    for (const p of players) {
      const score = (goalCounts[p.id] || 0) * 2 + (assistCounts[p.id] || 0);
      if (score > best || (score === best && score > 0 && Math.random() > 0.5)) {
        best = score; potm = p;
      }
    }
    if (!potm || best === 0) potm = players.length ? players[Math.floor(Math.random() * players.length)] : null;

    return {
      events,
      potm: potm ? { id: potm.id, name: shortName(potm) } : null,
    };
  }

  // Simulate Valhalla's matches for rounds fromRound..toRound (1-based, inclusive).
  // squadInfo (optional): { squad, lineup } — if provided, generates scorer/assist/potm data.
  // Returns array of result summaries for the summary screen.
  function simulateBetweenRounds(fixtures, fromRound, toRound, valhallaStrength, squadInfo) {
    const results = [];
    for (let r = fromRound; r <= toRound; r++) {
      const roundIdx = r - 1;
      if (roundIdx >= fixtures.length) break;
      const round = fixtures[roundIdx];
      const matchIdx = round.findIndex(([h, a]) => h === 0 || a === 0);
      if (matchIdx < 0) continue;

      const [h, a] = round[matchIdx];
      const isHome = h === 0;
      const oppIdx = isHome ? a : h;
      const opp = TEAMS[oppIdx];

      let hg, ag;
      if (isHome) {
        [hg, ag] = simGoals(valhallaStrength, opp.strength);
      } else {
        [hg, ag] = simGoals(opp.strength, valhallaStrength);
      }

      // Overwrite the pre-simulated fixture
      round[matchIdx] = [h, a, hg, ag];

      const valGoals = isHome ? hg : ag;
      const oppGoals = isHome ? ag : hg;
      const outcome = valGoals > oppGoals ? 'win' : valGoals < oppGoals ? 'loss' : 'draw';

      const result = { round: r, opponent: opp.name, homeAway: isHome ? 'home' : 'away', outcome, valGoals, oppGoals };

      if (squadInfo) {
        const { events, potm } = simulateMatchEvents(valGoals, oppGoals, opp.id, squadInfo.lineup, squadInfo.squad);
        result.events = events;
        result.potm   = potm;
      }

      results.push(result);
    }
    return results;
  }

  // ─── Post-match rounds ─────────────────────────────────────
  // Returns the simulated rounds to run AFTER sceneId completes,
  // i.e. from sceneId's round+1 up to the next story match's round-1.
  function getPostMatchRounds(sceneId) {
    const entries = Object.entries(SCENE_TO_ROUND).sort((a, b) => a[1] - b[1]);
    const currentRound = SCENE_TO_ROUND[sceneId];
    if (currentRound == null) return null;
    const next = entries.find(([, r]) => r > currentRound);
    if (!next) return null;
    const nextRound = next[1];
    if (nextRound <= currentRound + 1) return null;
    return { from: currentRound + 1, to: nextRound - 1, count: nextRound - currentRound - 1 };
  }

  return { TEAMS, SCENE_TO_ROUND, simulateSeason, computeTable, scoreFromOutcome, getRoundForScene, simulateBetweenRounds, getPostMatchRounds };

})();
