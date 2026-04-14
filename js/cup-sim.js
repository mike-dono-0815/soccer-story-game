/* ============================================================
   CUP SIM — FA Cup, Champions Cup, World Championship
   ============================================================ */

window.Game = window.Game || {};

window.Game.CupSim = (function () {

  // ── Team Definitions ─────────────────────────────────────────

  const FA_TEAMS = [
    { id: 'valhalla',     name: 'FC Valhalla',        str: 76 },
    { id: 'holbrook',     name: 'Holbrook Rangers',    str: 65 },
    { id: 'willowbrook',  name: 'Willowbrook City',    str: 72 },
    { id: 'ironclad',     name: 'Ironclad United',     str: 79 },
    { id: 'kingsford',    name: 'Kingsford United',    str: 75 },
    { id: 'castle_vale',  name: 'Castle Vale FC',      str: 74 },
    { id: 'millhaven',    name: 'Millhaven FC',        str: 73 },
    { id: 'northgate',    name: 'Northgate Athletic',  str: 70 },
    { id: 'dunmore',      name: 'Dunmore City',        str: 71 },
    { id: 'portmore',     name: 'Portmore Athletic',   str: 69 },
    { id: 'westbrook',    name: 'Westbrook Wanderers', str: 68 },
    { id: 'briarwood',    name: 'Briarwood City',      str: 67 },
    { id: 'redfield',     name: 'Redfield Rovers',     str: 66 },
    { id: 'harwick',      name: 'Harwick Town',        str: 64 },
    { id: 'fc_thornside', name: 'FC Thornside',        str: 63 },
    { id: 'southwick',    name: 'Southwick Saints',    str: 62 },
  ];

  const CHAMP_TEAMS = [
    { id: 'valhalla',        name: 'FC Valhalla',      str: 76, group: 'A' },
    { id: 'bayern_klauss',   name: 'FC Bayern Klauss', str: 84, group: 'A' },
    { id: 'sporting_lisora', name: 'Sporting Lisora',  str: 78, group: 'A' },
    { id: 'fc_aurora',       name: 'FC Aurora',        str: 74, group: 'A' },
    { id: 'real_estrada',    name: 'Real Estrada CF',  str: 83, group: 'B' },
    { id: 'dynamo_vostok',   name: 'Dynamo Vostok',    str: 85, group: 'B' },
    { id: 'atlas_fc',        name: 'Atlas FC',         str: 77, group: 'B' },
    { id: 'porto_negro',     name: 'Porto Negro',      str: 80, group: 'B' },
  ];

  const CWC_TEAMS = [
    { id: 'valhalla',          name: 'FC Valhalla',          str: 76, nation: 'Valoria',       flag: '🏴' },
    { id: 'santos_esmeralda',  name: 'Santos Esmeralda',     str: 82, nation: 'Brazil',         flag: '🇧🇷' },
    { id: 'shoguns_fc',        name: 'Shoguns FC',           str: 87, nation: 'Japan',           flag: '🇯🇵' },
    { id: 'atletico_porteno',  name: 'Atlético Porteño',     str: 80, nation: 'Argentina',      flag: '🇦🇷' },
    { id: 'dynamo_vostok',     name: 'Dynamo Vostok',        str: 85, nation: 'Russia',          flag: '🇷🇺' },
    { id: 'al_hilal_prime',    name: 'Al-Hilal Prime',       str: 80, nation: 'Saudi Arabia',   flag: '🇸🇦' },
    { id: 'red_stars_seoul',   name: 'Red Stars Seoul',      str: 78, nation: 'South Korea',    flag: '🇰🇷' },
    { id: 'leopards_fc',       name: 'Leopards FC',          str: 74, nation: 'Ivory Coast',    flag: '🇨🇮' },
    { id: 'wolves_prague',     name: 'Wolves Prague',        str: 75, nation: 'Czech Republic', flag: '🇨🇿' },
    { id: 'eagles_cairo',      name: 'Eagles Cairo',         str: 73, nation: 'Egypt',           flag: '🇪🇬' },
    { id: 'cf_azteca',         name: 'CF Azteca',            str: 79, nation: 'Mexico',          flag: '🇲🇽' },
    { id: 'pacific_united',    name: 'Pacific United',       str: 72, nation: 'Australia',      flag: '🇦🇺' },
    { id: 'cape_town_city',    name: 'Cape Town City',       str: 71, nation: 'South Africa',   flag: '🇿🇦' },
    { id: 'kartal_istanbul',   name: 'Kartal Istanbul',      str: 77, nation: 'Turkey',          flag: '🇹🇷' },
    { id: 'nordics_united',    name: 'Nordics United',       str: 73, nation: 'Norway',          flag: '🇳🇴' },
    { id: 'tigers_mumbai',     name: 'Tigers Mumbai',        str: 70, nation: 'India',           flag: '🇮🇳' },
  ];

  // ── Helpers ──────────────────────────────────────────────────

  function ft(id) { return FA_TEAMS.find(t => t.id === id); }
  function ct(id) { return CHAMP_TEAMS.find(t => t.id === id); }

  function simKO(a, b) {
    const p = Math.max(0.15, Math.min(0.85, 0.5 + (a.str - b.str) / 50));
    return Math.random() < p ? a.id : b.id;
  }

  // Generate a plausible scoreline for a pre-simulated KO match
  function genKOScore(hStr, aStr, homeId, winnerId) {
    const homeWon = winnerId === homeId;
    const diff = homeWon ? hStr - aStr : aStr - hStr;
    const r = Math.random();
    if (diff >= 10) {
      const opts = homeWon ? [[3,0],[3,1],[4,0],[2,0]] : [[0,3],[1,3],[0,4],[0,2]];
      return opts[Math.floor(r * opts.length)];
    } else if (diff >= 3) {
      const opts = homeWon ? [[2,0],[2,1],[1,0],[3,1]] : [[0,2],[1,2],[0,1],[1,3]];
      return opts[Math.floor(r * opts.length)];
    } else {
      const opts = homeWon ? [[1,0],[2,1],[1,0]] : [[0,1],[1,2],[0,1]];
      return opts[Math.floor(r * opts.length)];
    }
  }

  function simGroupGoals(a, b) {
    const pois = m => {
      let g = 0, p = Math.exp(-m), s = p, r = Math.random();
      while (s < r) { g++; p *= m / g; s += p; }
      return g;
    };
    const hg = pois((a.str / 77) * 1.3);
    const ag = pois((b.str / 77) * 1.3);
    return { hg, ag };
  }

  function ko(hId, aId, getTeam, forceWinner) {
    const ht = getTeam(hId);
    const at = getTeam(aId);
    const w = forceWinner || simKO(ht, at);
    const [hg, ag] = genKOScore(ht.str || 75, at.str || 75, hId, w);
    return { homeId: hId, awayId: aId, homeGoals: hg, awayGoals: ag, winnerId: w, isStory: false, played: true };
  }

  function story(hId, aId, sceneId) {
    return { homeId: hId, awayId: aId, homeGoals: null, awayGoals: null, winnerId: null, isStory: true, played: false, sceneId };
  }

  // ── FA Cup ───────────────────────────────────────────────────
  // 16 teams, 4 rounds. Valhalla path: R1 vs Holbrook → QF vs Willowbrook → SF vs Ironclad → Final vs Ironclad

  function simulateFA() {
    const R1 = [
      story('valhalla',    'holbrook',     'fa_cup_r1'),
      ko('willowbrook',  'briarwood',    ft, 'willowbrook'),  // forced — must reach QF
      ko('kingsford',    'northgate',    ft),
      ko('castle_vale',  'dunmore',      ft),
      ko('ironclad',     'southwick',    ft, 'ironclad'),     // forced — must reach SF
      ko('millhaven',    'portmore',     ft),
      ko('westbrook',    'harwick',      ft),
      ko('fc_thornside', 'redfield',     ft),
    ];

    const r1W = R1.map(m => m.winnerId || 'valhalla');

    const QF = [
      story('valhalla',   'willowbrook', 'fa_cup_qf'),
      ko(r1W[2], r1W[3], ft),
      ko(r1W[4], r1W[5], ft, r1W[4] === 'ironclad' ? 'ironclad' : r1W[5] === 'ironclad' ? 'ironclad' : null), // Ironclad advances
      ko(r1W[6], r1W[7], ft),
    ];

    const qfW = QF.map(m => m.winnerId || 'valhalla');

    const SF = [
      story('ironclad', 'valhalla', 'fa_cup_sf'),           // Valhalla away per story
      ko(qfW[1], qfW[3], ft),
    ];

    // Story has Ironclad in the Final (accepted story fixture)
    const Final = [
      story('ironclad', 'valhalla', 'fa_cup_final'),
    ];

    return { rounds: { R1, QF, SF, Final }, teams: FA_TEAMS };
  }

  // ── Champions Cup ─────────────────────────────────────────────
  // 8 teams, 2 groups of 4 (round-robin), top 2 advance, then KO + Final

  function simulateChampions() {
    // Group A: Valhalla (story vs Bayern + Lisora), simulated vs Aurora
    // Group B: all simulated
    const groupA_ids = ['valhalla', 'bayern_klauss', 'sporting_lisora', 'fc_aurora'];
    const groupB_ids = ['real_estrada', 'dynamo_vostok', 'atlas_fc', 'porto_negro'];

    // Story scenes for specific pairings (key = alphabetically sorted pair joined by |)
    const storyScenes = {
      'bayern_klauss|valhalla':   { sceneId: 'champions_group_1', homeId: 'bayern_klauss', awayId: 'valhalla' },
      'sporting_lisora|valhalla': { sceneId: 'champions_group_2', homeId: 'valhalla',      awayId: 'sporting_lisora' },
    };

    function buildGroup(teamIds) {
      const fixtures = [];
      for (let i = 0; i < teamIds.length; i++) {
        for (let j = i + 1; j < teamIds.length; j++) {
          const a = teamIds[i], b = teamIds[j];
          const key = [a, b].sort().join('|');
          if (storyScenes[key]) {
            const sc = storyScenes[key];
            fixtures.push({ homeId: sc.homeId, awayId: sc.awayId, homeGoals: null, awayGoals: null, winnerId: null, isStory: true, played: false, sceneId: sc.sceneId });
          } else {
            const ta = ct(a) || { id: a, str: 76 };
            const tb = ct(b) || { id: b, str: 76 };
            const { hg, ag } = simGroupGoals(ta, tb);
            const w = hg > ag ? a : hg < ag ? b : null;
            // played: false — revealed only after the group stage story matches complete
            fixtures.push({ homeId: a, awayId: b, homeGoals: hg, awayGoals: ag, winnerId: w, isStory: false, played: false });
          }
        }
      }
      return fixtures;
    }

    const groupA = buildGroup(groupA_ids);
    const groupB = buildGroup(groupB_ids);

    // Force Valhalla's simulated match (vs Aurora) as a win — the two story
    // matches vs Bayern and Sporting Lisora are what decide qualification.
    const auroraMatch = groupA.find(m =>
      !m.isStory && (m.homeId === 'valhalla' || m.awayId === 'valhalla')
    );
    if (auroraMatch) {
      auroraMatch.homeGoals = auroraMatch.homeId === 'valhalla' ? 2 : 0;
      auroraMatch.awayGoals = auroraMatch.homeId === 'valhalla' ? 0 : 2;
      auroraMatch.winnerId  = 'valhalla';
    }

    // KO: Valhalla vs Real Estrada (story), Dynamo vs atlas (Dynamo forced win)
    const KO = [
      story('real_estrada', 'valhalla', 'champions_ko'),     // Valhalla away per story
      ko('dynamo_vostok', 'atlas_fc', ct, 'dynamo_vostok'),  // forced — Final opponent
    ];

    const Final = [
      story('dynamo_vostok', 'valhalla', 'champions_final'), // Valhalla away per story
    ];

    return { groupA, groupB, KO, Final, teams: CHAMP_TEAMS };
  }

  // ── Club World Cup ─────────────────────────────────────────────
  // 16 teams (national champions), straight KO. Valhalla qualifies only by winning the league.
  // Story path: R16 vs Santos Esmeralda → QF vs Atlético Porteño → SF vs Shoguns FC → Final vs Dynamo Vostok

  function simulateCWC() {
    function cwt(id) { return CWC_TEAMS.find(t => t.id === id) || { id, str: 75 }; }

    function simKOcwc(hId, aId, forceWinner) {
      const r = ko(hId, aId, cwt, forceWinner);
      r.played = false; // revealed round-by-round
      return r;
    }

    // R16 — 8 matches. Valhalla match is a story scene; others are pre-simulated (held back).
    const R16 = [
      story('valhalla',         'santos_esmeralda', 'cwc_r16'),                            // [0] STORY
      simKOcwc('atletico_porteno',  'leopards_fc',       'atletico_porteno'),               // [1] forced — QF opponent
      simKOcwc('red_stars_seoul',   'pacific_united'),                                      // [2]
      simKOcwc('wolves_prague',     'tigers_mumbai'),                                       // [3]
      simKOcwc('shoguns_fc',        'cf_azteca',         'shoguns_fc'),                     // [4] forced — SF opponent
      simKOcwc('al_hilal_prime',    'cape_town_city'),                                      // [5]
      simKOcwc('dynamo_vostok',     'nordics_united',    'dynamo_vostok'),                  // [6] forced — Final opponent
      simKOcwc('kartal_istanbul',   'eagles_cairo'),                                        // [7]
    ];

    // QF — winners of R16 pairs. Valhalla match is a story scene.
    const QF = [
      story('valhalla',         'atletico_porteno', 'cwc_qf'),                             // [0] STORY
      simKOcwc(R16[2].winnerId || 'red_stars_seoul', R16[3].winnerId || 'wolves_prague'),  // [1]
      simKOcwc('shoguns_fc',        R16[5].winnerId || 'al_hilal_prime', 'shoguns_fc'),    // [2] forced
      simKOcwc('dynamo_vostok',     R16[7].winnerId || 'kartal_istanbul', 'dynamo_vostok'),// [3] forced
    ];

    // SF — Valhalla match is a story scene.
    const SF = [
      story('valhalla',         'shoguns_fc',   'cwc_sf'),                                 // [0] STORY
      simKOcwc('dynamo_vostok', QF[1].winnerId || 'red_stars_seoul', 'dynamo_vostok'),     // [1] forced
    ];

    // Final
    const Final = [
      story('valhalla', 'dynamo_vostok', 'cwc_final'),                                     // [0] STORY
    ];

    return { R16, QF, SF, Final, teams: CWC_TEAMS };
  }

  // ── Simulate All ─────────────────────────────────────────────

  function simulateAll() {
    return {
      fa:    simulateFA(),
      champ: simulateChampions(),
      world: simulateCWC(),
    };
  }

  // ── Inject Story Result ───────────────────────────────────────

  function injectResult(cups, sceneId, outcome, homeGoals, awayGoals) {
    if (!cups) return;

    const groupScenes = new Set(['champions_group_1', 'champions_group_2']);
    const fa = cups.fa.rounds;
    const ch = cups.champ;
    const wo = cups.world;

    const pools = [fa.R1, fa.QF, fa.SF, fa.Final, ch.groupA, ch.groupB, ch.KO, ch.Final, wo.R16, wo.QF, wo.SF, wo.Final];
    let match = null;
    for (const pool of pools) {
      if (!pool) continue;
      match = pool.find(m => m.sceneId === sceneId);
      if (match) break;
    }
    if (!match) return;

    match.homeGoals = homeGoals;
    match.awayGoals = awayGoals;
    match.played = true;

    const vIsHome = match.homeId === 'valhalla';
    if (groupScenes.has(sceneId)) {
      // Group match: draw is possible
      match.winnerId = outcome === 'win' ? 'valhalla'
        : outcome === 'loss' ? (vIsHome ? match.awayId : match.homeId)
        : null;
    } else {
      // Knockout: always a winner
      match.winnerId = outcome === 'win' ? 'valhalla' : (vIsHome ? match.awayId : match.homeId);
    }
  }

  // ── Group Standings ───────────────────────────────────────────

  function groupStandings(fixtures, teamIds) {
    const s = {};
    teamIds.forEach(id => { s[id] = { id, pts: 0, gd: 0, gf: 0, played: 0, w: 0, d: 0, l: 0 }; });
    fixtures.forEach(m => {
      if (!m.played) return;
      const h = s[m.homeId], a = s[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      h.gf += (m.homeGoals || 0); a.gf += (m.awayGoals || 0);
      h.gd += (m.homeGoals || 0) - (m.awayGoals || 0);
      a.gd += (m.awayGoals || 0) - (m.homeGoals || 0);
      if (m.winnerId === m.homeId)      { h.pts += 3; h.w++; a.l++; }
      else if (m.winnerId === m.awayId) { a.pts += 3; a.w++; h.l++; }
      else                              { h.pts++; a.pts++; h.d++; a.d++; }
    });
    return teamIds.map(id => s[id]).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  }

  // ── Phase Labels (for hub display) ───────────────────────────

  function getPhaseLabel(cups, results) {
    return { fa: _faPhase(cups.fa), champ: _champPhase(cups.champ), world: _worldPhase(cups.world, results) };
  }

  function _faPhase(fa) {
    const ORDER = ['R1', 'QF', 'SF', 'Final'];
    const N = { R1: 'Round 1', QF: 'Quarter-Final', SF: 'Semi-Final', Final: 'Final' };
    for (const k of ORDER) {
      const vm = fa.rounds[k].find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
      if (!vm) return 'Knocked Out';
      if (!vm.played) return N[k];
      if (vm.winnerId !== 'valhalla') return 'Out — ' + N[k];
    }
    return 'Cup Winners!';
  }

  function _champPhase(ch) {
    const GRP_A = ['valhalla', 'bayern_klauss', 'sporting_lisora', 'fc_aurora'];
    const allGroupPlayed = [...ch.groupA, ...ch.groupB].filter(
      m => m.homeId === 'valhalla' || m.awayId === 'valhalla'
    ).every(m => m.played);
    if (!allGroupPlayed) return 'Group Stage';
    const topTwo = groupStandings(ch.groupA, GRP_A).slice(0, 2).map(t => t.id);
    if (!topTwo.includes('valhalla')) return 'Out — Groups';
    const koVm = ch.KO.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!koVm || !koVm.played) return 'Semi-Final';
    if (koVm.winnerId !== 'valhalla') return 'Out — Semi-Final';
    const fVm = ch.Final[0];
    if (!fVm || !fVm.played) return 'Final';
    return fVm.winnerId === 'valhalla' ? 'Champions!' : 'Runners-up';
  }

  function _worldPhase(wo, results) {
    // Show qualification status until a CWC match has been played
    const r16Vm = wo.R16 && wo.R16.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!r16Vm || !r16Vm.played) {
      if (results && results.vplPosition !== 1) return 'Not Qualified';
      return 'Round of 16';
    }
    if (r16Vm.winnerId !== 'valhalla') return 'Out — Round of 16';
    const qfVm = wo.QF && wo.QF.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!qfVm || !qfVm.played) return 'Quarter-Final';
    if (qfVm.winnerId !== 'valhalla') return 'Out — Quarter-Final';
    const sfVm = wo.SF && wo.SF.find(m => m.homeId === 'valhalla' || m.awayId === 'valhalla');
    if (!sfVm || !sfVm.played) return 'Semi-Final';
    if (sfVm.winnerId !== 'valhalla') return 'Out — Semi-Final';
    const fVm = wo.Final[0];
    if (!fVm || !fVm.played) return 'Final';
    return fVm.winnerId === 'valhalla' ? 'Club World Champions!' : 'Runners-up';
  }

  // ── Finalize Champions Group ──────────────────────────────────
  // Called after the last story group match (champions_group_2) completes.
  // Reveals all pre-simulated group matches that were held back.

  function finalizeChampGroups(cups) {
    if (!cups) return;
    [...cups.champ.groupA, ...cups.champ.groupB].forEach(m => {
      if (!m.isStory && !m.played) m.played = true;
    });
  }

  // Reveal pre-simulated CWC matches for a completed round.
  // Call after each Valhalla story match completes.
  function finalizeCWCRound(cups, round) {
    if (!cups || !cups.world) return;
    const wo = cups.world;
    const pool = wo[round];
    if (!pool) return;
    pool.forEach(m => { if (!m.isStory && !m.played) m.played = true; });
  }

  function getTeamName(id) {
    const all = [...FA_TEAMS, ...CHAMP_TEAMS, ...CWC_TEAMS];
    return (all.find(t => t.id === id) || { name: id }).name;
  }

  function getCWCTeam(id) {
    return CWC_TEAMS.find(t => t.id === id) || { id, name: id, nation: '', flag: '' };
  }

  // ── Between-match cup results ─────────────────────────────────
  // Returns the other teams' results to show before a Valhalla cup scene,
  // or null if there's nothing to reveal at this point.

  function getBetweenResults(sceneId, cups) {
    if (!cups) return null;
    const fa = cups.fa.rounds;
    const ch = cups.champ;
    const wo = cups.world;

    switch (sceneId) {

      case 'fa_cup_qf':
        return { competition: 'FA Cup', roundLabel: 'Round 1 Results',
                 matches: fa.R1.filter(m => !m.isStory) };

      case 'fa_cup_sf':
        return { competition: 'FA Cup', roundLabel: 'Quarter-Final Results',
                 matches: fa.QF.filter(m => !m.isStory) };

      case 'fa_cup_final':
        return { competition: 'FA Cup', roundLabel: 'Semi-Final Results',
                 matches: fa.SF.filter(m => !m.isStory) };

      case 'champions_ko': {
        // After group stage — show Group B standings and key qualifier info
        const grpBIds = ['real_estrada', 'dynamo_vostok', 'atlas_fc', 'porto_negro'];
        return { competition: 'Champions Cup', roundLabel: 'Group Stage Complete',
                 matches: ch.groupB.filter(m => m.played),
                 groupMode: true,
                 groupBIds,
                 groupBFixtures: ch.groupB };
      }

      case 'champions_final':
        return { competition: 'Champions Cup', roundLabel: 'Semi-Final Results',
                 matches: ch.KO.filter(m => !m.isStory && m.played) };

      case 'cwc_qf':
        return { competition: 'Club World Cup', roundLabel: 'Round of 16 Results',
                 matches: (wo.R16 || []).filter(m => !m.isStory && m.played), isCWC: true };

      case 'cwc_sf':
        return { competition: 'Club World Cup', roundLabel: 'Quarter-Final Results',
                 matches: (wo.QF || []).filter(m => !m.isStory && m.played), isCWC: true };

      case 'cwc_final':
        return { competition: 'Club World Cup', roundLabel: 'Semi-Final Results',
                 matches: (wo.SF || []).filter(m => !m.isStory && m.played), isCWC: true };

      default:
        return null;
    }
  }

  return { simulateAll, injectResult, finalizeChampGroups, finalizeCWCRound, groupStandings, getTeamName, getCWCTeam, getPhaseLabel, getBetweenResults, FA_TEAMS, CHAMP_TEAMS, CWC_TEAMS };

})();
