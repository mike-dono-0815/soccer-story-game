/* ============================================================
   LEAGUE SIM — VPL team data, fixture generation, simulation
   ============================================================ */

window.Game = window.Game || {};

window.Game.LeagueSim = (function () {

  // 18 VPL teams. Valhalla is index 0.
  // Opponents named in story events (Red Cliffs Athletic, Ironclad United,
  // Holbrook Rangers) are kept consistent with story-data.js.
  const TEAMS = [
    { id: 'valhalla',   name: 'FC Valhalla',          strength: 76 },
    { id: 'ironport',   name: 'Ironport City',         strength: 86 },
    { id: 'blackwood',  name: 'Blackwood City',        strength: 83 },
    { id: 'ironclad',   name: 'Ironclad United',       strength: 81 },
    { id: 'westbridge', name: 'Westbridge FC',         strength: 80 },
    { id: 'greenvale',  name: 'Greenvale United',      strength: 78 },
    { id: 'northgate',  name: 'Northgate United',      strength: 77 },
    { id: 'silverton',  name: 'Silverton Athletic',    strength: 76 },
    { id: 'portholm',   name: 'Port Holmvik SC',       strength: 75 },
    { id: 'eastport',   name: 'Eastport Town',         strength: 74 },
    { id: 'dalemark',   name: 'Dalemark Rangers',      strength: 73 },
    { id: 'redcliffs',  name: 'Red Cliffs Athletic',   strength: 72 },
    { id: 'helmsby',    name: 'Helmsby Town',          strength: 70 },
    { id: 'ashbrook',   name: 'Ashbrook FC',           strength: 69 },
    { id: 'redstone',   name: 'Redstone Athletic',     strength: 68 },
    { id: 'crofton',    name: 'Crofton Athletic',      strength: 66 },
    { id: 'holbrook',   name: 'Holbrook Rangers',      strength: 64 },
    { id: 'hollowmoor', name: 'Hollowmoor Rovers',     strength: 62 },
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
  // Story matches for Valhalla will overwrite the Valhalla entries later.
  // Returns: array[34] of array[9] of [homeIdx, awayIdx, hGoals, aGoals]
  function simulateSeason() {
    const schedule = generateSchedule();
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

  // Simulate Valhalla's matches for rounds fromRound..toRound (1-based, inclusive).
  // Overwrites those fixture entries in-place using valhallaStrength (avg squad rating).
  // Returns array of result summaries for the summary screen.
  function simulateBetweenRounds(fixtures, fromRound, toRound, valhallaStrength) {
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

      results.push({ round: r, opponent: opp.name, homeAway: isHome ? 'home' : 'away', outcome, valGoals, oppGoals });
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
