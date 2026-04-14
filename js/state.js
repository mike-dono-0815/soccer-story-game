/* ============================================================
   STATE — Game state management & localStorage persistence
   ============================================================ */

window.Game = window.Game || {};

window.Game.State = (function () {

  const SAVE_KEY = 'thegaffer_v1';
  const SCHEMA_VERSION = 1;

  // Generate positional stats (str/mid/def/gk) from position + overall rating
  function ps(pos, r) {
    const R = Math.round;
    switch (pos) {
      case 'GK':  return { gk: r,          def: R(r*.25), mid: R(r*.10), str: 0          };
      case 'CB':  return { gk: R(r*.10),   def: r,        mid: R(r*.40), str: R(r*.15)   };
      case 'RB':
      case 'LB':  return { gk: R(r*.08),   def: R(r*.90), mid: R(r*.50), str: R(r*.20)   };
      case 'CM':
      case 'DM':  return { gk: 0,          def: R(r*.55), mid: r,        str: R(r*.45)   };
      case 'CAM': return { gk: 0,          def: R(r*.30), mid: r,        str: R(r*.65)   };
      case 'LM':
      case 'RM':  return { gk: 0,          def: R(r*.35), mid: R(r*.85), str: R(r*.60)   };
      case 'ST':
      case 'CF':  return { gk: 0,          def: R(r*.12), mid: R(r*.35), str: r          };
      default:    return { gk: 0,          def: R(r*.33), mid: R(r*.33), str: R(r*.33)   };
    }
  }

  const DEFAULT_SQUAD = [
    { id: 'p_gk1',   name: 'Anton Kovic',             position: 'GK',  rating: 76, age: 29, value: 0,  morale: 70, ...ps('GK',  76) },
    { id: 'p_rb1',   name: 'Dani Ferrera',             position: 'RB',  rating: 74, age: 24, value: 0,  morale: 65, ...ps('RB',  74) },
    { id: 'p_cb1',   name: 'Theo Larsson',             position: 'CB',  rating: 77, age: 27, value: 0,  morale: 70, ...ps('CB',  77) },
    { id: 'p_cb2',   name: 'Marcus Djordic',           position: 'CB',  rating: 75, age: 25, value: 0,  morale: 68, ...ps('CB',  75) },
    { id: 'p_lb1',   name: 'Luis Carvalho',            position: 'LB',  rating: 73, age: 23, value: 0,  morale: 72, ...ps('LB',  73) },
    { id: 'veteran', name: 'Roberto Okafor',           position: 'CM',  rating: 80, age: 34, value: 0,  morale: 75, ...ps('CM',  80) },
    { id: 'p_cm1',   name: 'Sven Halberg',             position: 'CM',  rating: 74, age: 22, value: 0,  morale: 65, ...ps('CM',  74) },
    { id: 'p_cam1',  name: 'Nico Bastien',             position: 'CAM', rating: 78, age: 26, value: 0,  morale: 70, ...ps('CAM', 78) },
    { id: 'p_lm1',   name: 'Kwame Asante',             position: 'LM',  rating: 75, age: 24, value: 0,  morale: 68, ...ps('LM',  75) },
    { id: 'p_rm1',   name: 'Tomas Pelka',              position: 'RM',  rating: 73, age: 21, value: 0,  morale: 60, ...ps('RM',  73) },
    { id: 'star',    name: 'Marco "El Tornado" Silva', position: 'ST',  rating: 88, age: 26, value: 0,  morale: 70, ...ps('ST',  88) },
    { id: 'p_st1',   name: 'Elia Montero',             position: 'ST',  rating: 72, age: 28, value: 0,  morale: 65, ...ps('ST',  72) },
    { id: 'p_gk2',   name: 'Bram Veldhuizen',          position: 'GK',  rating: 68, age: 31, value: 0,  morale: 62, ...ps('GK',  68) },
    { id: 'p_cb3',   name: 'Joao Figueiras',           position: 'CB',  rating: 71, age: 20, value: 0,  morale: 75, ...ps('CB',  71) },
    { id: 'p_cm2',   name: 'Aryan Mehta',              position: 'CM',  rating: 70, age: 19, value: 0,  morale: 78, ...ps('CM',  70) },
    { id: 'p_st2',   name: 'Diego Ruiz',               position: 'ST',  rating: 69, age: 21, value: 0,  morale: 70, ...ps('ST',  69) },
  ];

  const DEFAULT_TRANSFER_POOL = [
    { id: 't_cb1',   name: 'Henrik Sorensen',   position: 'CB',  rating: 79, age: 26, price: 4,  morale: 70, ...ps('CB',  79) },
    { id: 't_cm1',   name: 'Fabio Conti',       position: 'CM',  rating: 81, age: 28, price: 7,  morale: 70, ...ps('CM',  81) },
    { id: 't_st1',   name: 'Oluwaseun Adeyemi', position: 'ST',  rating: 83, age: 24, price: 12, morale: 70, ...ps('ST',  83) },
    { id: 't_gk1',   name: 'Pierre Lemaitre',   position: 'GK',  rating: 80, age: 27, price: 5,  morale: 70, ...ps('GK',  80) },
    { id: 't_lb1',   name: 'Carlos Vega',       position: 'LB',  rating: 77, age: 23, price: 3,  morale: 70, ...ps('LB',  77) },
    { id: 't_cam1',  name: 'Riku Tanaka',       position: 'CAM', rating: 82, age: 25, price: 9,  morale: 70, ...ps('CAM', 82) },
    { id: 't_rb1',   name: 'Ivan Petrovic',     position: 'RB',  rating: 76, age: 22, price: 3,  morale: 70, ...ps('RB',  76) },
    { id: 't_cm2',   name: 'Artur Blazek',      position: 'CM',  rating: 78, age: 30, price: 4,  morale: 70, ...ps('CM',  78) },
    { id: 't_st2',   name: 'Emmanuel Nkosi',    position: 'ST',  rating: 80, age: 22, price: 8,  morale: 70, ...ps('ST',  80) },
    { id: 't_lm1',   name: 'Sandro Pereira',    position: 'LM',  rating: 78, age: 24, price: 5,  morale: 70, ...ps('LM',  78) },
    { id: 'prodigy', name: 'Kai Voss',          position: 'ST',  rating: 72, age: 17, price: 0,  morale: 85, isProdigy: true, ...ps('ST', 72) },
  ];

  const DEFAULT_STATE = {
    meta: {
      version: SCHEMA_VERSION,
      managerName: 'The Gaffer',
      savedAt: null,
    },
    progress: {
      currentEventIndex: 0,
      currentSceneId: null,
      seasonWeek: 0,
      phase: 'preseason',
    },
    league: {
      round: 0,       // highest round revealed so far
      fixtures: null, // generated on first init: array[34][9] of [h,a,hg,ag]
    },
    cups: null,       // generated on first init via CupSim.simulateAll()
    results: {
      vplWins: 0, vplDraws: 0, vplLosses: 0,
      vplPosition: 9,
      lastResults: [],          // last 5: 'W','D','L'
      cupResult: null,
      championsResult: null,
      worldResult: null,
      cupRound: null,         // null | 'r1'|'qf'|'sf'|'final'|'winner' | 'out_R1'|'out_QF'|'out_SF'
      championsRound: null,   // null | 'group'|'ko'|'final'|'winner' | 'out_Group'|'out_KO'
      worldRound: null,       // null | 'group'|'final'|'winner' | 'out_Group'
      competitionWins: [],      // 'VPL','FA Cup','Champions Cup','World Championship'
    },
    squad: DEFAULT_SQUAD,
    lineup: ['p_gk1','p_rb1','p_cb1','p_cb2','p_lb1','veteran','p_cm1','p_cam1','p_lm1','p_rm1','star'],
    formation: '4-3-3',
    trainingFocus: 'fitness',
    budget: 10,
    transferPool: DEFAULT_TRANSFER_POOL,
    playerStats: {},  // { [playerId]: { apps, goals, assists, potm, leagueApps, leagueGoals, leagueAssists, leaguePotm } }
    story: {
      teamMorale: 50,
      teamStrengthBonus: 0,
      boardConfidence: 60,
      mediaRep: 50,
      fanReputation: 50,
      starHappiness: 50,
      youthInvestment: 0,
      managerStyle: null,
      captainChosen: false,
      captainId: null,
      starSold: false,
      starInjured: false,
      starRushedBack: false,
      rivalityEscalated: false,
      boardCrisisActive: false,
      prodigyPromoted: false,
      prodigyOnSquad: false,
      pressConflict: false,
      staffCrisis: false,
      fanEventDone: false,
      walkoutThreat: false,
      resignedChoice: false,
      tourChoice: null,          // 'europe'|'asia'|'americas'
      budgetChoice: null,        // 'facilities'|'signings'|'staff'
      scoutRegion: null,
      staffHired: null,
      contractRenewed: false,
      disciplineChoice: null,
      callupReleased: false,
      crisisHandled: false,
      mentorshipDone: false,
      conflictResolved: false,
      fanEventChoice: null,
      firstMatchWon: false,
    },
  };

  let _state = null;

  function init() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.meta && parsed.meta.version === SCHEMA_VERSION) {
          _state = parsed;
          // Back-fill league fixtures for saves that pre-date this feature
          if (!_state.league || !_state.league.fixtures) {
            _state.league = { round: 0, fixtures: window.Game.LeagueSim.simulateSeason() };
          }
          // Back-fill cups data for saves that pre-date this feature
          if (!_state.cups) {
            _state.cups = window.Game.CupSim.simulateAll();
          }
          if (!_state.playerStats) {
            _state.playerStats = {};
          }
          return true; // has save
        }
      } catch (e) {
        console.warn('Save load failed, starting fresh:', e);
      }
    }
    _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    _state.league = { round: 0, fixtures: window.Game.LeagueSim.simulateSeason() };
    _state.cups = window.Game.CupSim.simulateAll();
    return false; // no save
  }

  function get() {
    return _state;
  }

  function save() {
    _state.meta.savedAt = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(_state));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  // Apply story effects: numbers = meter delta (clamped), others = direct set
  function applyEffects(effects) {
    if (!effects) return;
    const s = _state.story;
    const { clamp } = window.Game.Utils;
    Object.keys(effects).forEach(key => {
      const val = effects[key];
      if (typeof val === 'number' && typeof s[key] === 'number') {
        s[key] = clamp(s[key] + val, 0, 100);
      } else {
        s[key] = val;
      }
    });
  }

  // Apply effects to top-level state (budget, lineup, formation, etc.)
  function applyRootEffects(effects) {
    if (!effects) return;
    const { clamp } = window.Game.Utils;
    Object.keys(effects).forEach(key => {
      if (key === 'budget') {
        _state.budget = clamp(_state.budget + effects[key], 0, 100);
      } else if (key === 'formation') {
        _state.formation = effects[key];
      } else if (key === 'trainingFocus') {
        _state.trainingFocus = effects[key];
      }
    });
  }

  // Record match result. homeGoals/awayGoals are from the actual scoreline.
  function recordResult(competition, outcome, sceneId, homeGoals, awayGoals) {
    if (competition === 'VPL') {
      if (outcome === 'win')  _state.results.vplWins++;
      if (outcome === 'draw') _state.results.vplDraws++;
      if (outcome === 'loss') _state.results.vplLosses++;
      // Fan reputation tracks league form
      const fanDelta = outcome === 'win' ? 4 : outcome === 'draw' ? 1 : -3;
      _state.story.fanReputation = window.Game.Utils.clamp(_state.story.fanReputation + fanDelta, 0, 100);

      // Update league fixture with actual result
      if (sceneId && _state.league && _state.league.fixtures) {
        const round = window.Game.LeagueSim.getRoundForScene(sceneId);
        if (round !== null) {
          const roundIdx = round - 1;
          const match = _state.league.fixtures[roundIdx]
            .find(([h, a]) => h === 0 || a === 0);
          if (match && homeGoals !== undefined && awayGoals !== undefined) {
            match[2] = homeGoals;
            match[3] = awayGoals;
          }
          _state.league.round = Math.max(_state.league.round, round);

          // Sync vplPosition from the actual computed table so hub and league screen always agree
          const table = window.Game.LeagueSim.computeTable(_state.league.fixtures, _state.league.round);
          const idx = table.findIndex(r => r.id === 'valhalla');
          if (idx >= 0) _state.results.vplPosition = idx + 1;
        }
      }
    }
    if (competition === 'FA Cup') {
      _state.results.cupResult = outcome === 'win' ? (_state.results.cupResult === 'final' ? 'winner' : 'progress') : 'eliminated';
      if (outcome === 'win') {
        if (sceneId === 'fa_cup_r1')   _state.results.cupRound = 'qf';
        else if (sceneId === 'fa_cup_qf') _state.results.cupRound = 'sf';
        else if (sceneId === 'fa_cup_sf') _state.results.cupRound = 'final';
        else if (sceneId === 'fa_cup_final') _state.results.cupRound = 'winner';
      } else {
        const labels = { fa_cup_r1: 'R1', fa_cup_qf: 'QF', fa_cup_sf: 'SF', fa_cup_final: 'Final' };
        _state.results.cupRound = 'out_' + (labels[sceneId] || 'R1');
      }
    }
    if (competition === 'Champions Cup') {
      _state.results.championsResult = outcome === 'win' ? 'progress' : 'eliminated';
      if (outcome === 'win') {
        if (sceneId === 'champions_group_1') _state.results.championsRound = 'group';
        else if (sceneId === 'champions_group_2') _state.results.championsRound = 'ko';
        else if (sceneId === 'champions_ko')   _state.results.championsRound = 'final';
        else if (sceneId === 'champions_final') _state.results.championsRound = 'winner';
      } else {
        const labels = { champions_group_1: 'Group', champions_group_2: 'Group', champions_ko: 'KO', champions_final: 'Final' };
        _state.results.championsRound = 'out_' + (labels[sceneId] || 'Group');
      }
    }
    if (competition === 'Club World Cup') {
      _state.results.worldResult = outcome === 'win' ? 'progress' : 'eliminated';
      if (outcome === 'win') {
        if      (sceneId === 'cwc_r16')   _state.results.worldRound = 'qf';
        else if (sceneId === 'cwc_qf')    _state.results.worldRound = 'sf';
        else if (sceneId === 'cwc_sf')    _state.results.worldRound = 'final';
        else if (sceneId === 'cwc_final') { _state.results.worldRound = 'winner'; _state.results.worldResult = 'winner'; }
      } else {
        const labels = { cwc_r16: 'R16', cwc_qf: 'QF', cwc_sf: 'SF', cwc_final: 'Final' };
        _state.results.worldRound = 'out_' + (labels[sceneId] || 'R16');
      }
    }
    // Inject result into cup bracket
    if (_state.cups) {
      window.Game.CupSim.injectResult(_state.cups, sceneId, outcome, homeGoals, awayGoals);
      // After each Champions group story match, reveal all pre-simulated group fixtures
      if (sceneId === 'champions_group_2') {
        window.Game.CupSim.finalizeChampGroups(_state.cups);
      }
      // After each CWC story match, reveal all other results for that round
      const cwcRoundMap = { cwc_r16: 'R16', cwc_qf: 'QF', cwc_sf: 'SF' };
      if (cwcRoundMap[sceneId]) {
        window.Game.CupSim.finalizeCWCRound(_state.cups, cwcRoundMap[sceneId]);
      }
    }

    // Morale effect
    const moraleChange = outcome === 'win' ? 6 : outcome === 'draw' ? 2 : -8;
    _state.story.teamMorale = window.Game.Utils.clamp(_state.story.teamMorale + moraleChange, 0, 100);
    // Track last 5 results
    const short = outcome === 'win' ? 'W' : outcome === 'draw' ? 'D' : 'L';
    _state.results.lastResults.push(short);
    if (_state.results.lastResults.length > 10) _state.results.lastResults.shift();

    save();
  }

  // Record per-player stats from a match summary
  function recordPlayerStats(events, potm, competition, lineup) {
    if (!_state.playerStats) _state.playerStats = {};
    const isVPL = competition === 'VPL' || !competition;

    function ensure(pid) {
      if (!_state.playerStats[pid]) {
        _state.playerStats[pid] = { apps: 0, goals: 0, assists: 0, potm: 0, leagueApps: 0, leagueGoals: 0, leagueAssists: 0, leaguePotm: 0 };
      }
    }

    // Appearances
    lineup.forEach(pid => {
      ensure(pid);
      _state.playerStats[pid].apps++;
      if (isVPL) _state.playerStats[pid].leagueApps++;
    });

    // Goals & assists
    (events || []).filter(e => e.type === 'goal' && e.isValhalla).forEach(e => {
      if (e.scorerId) {
        ensure(e.scorerId);
        _state.playerStats[e.scorerId].goals++;
        if (isVPL) _state.playerStats[e.scorerId].leagueGoals++;
      }
      if (e.assistId) {
        ensure(e.assistId);
        _state.playerStats[e.assistId].assists++;
        if (isVPL) _state.playerStats[e.assistId].leagueAssists++;
      }
    });

    // Player of the Match
    if (potm && potm.id) {
      ensure(potm.id);
      _state.playerStats[potm.id].potm++;
      if (isVPL) _state.playerStats[potm.id].leaguePotm++;
    }
  }

  // Mark competition as won
  function addCompetitionWin(name) {
    if (!_state.results.competitionWins.includes(name)) {
      _state.results.competitionWins.push(name);
    }
  }

  // Evaluate which ending the player gets
  function evaluateEnding() {
    const s = _state.story;
    const r = _state.results;

    // Sacked mid-season (handled inline)
    if (s.resignedChoice) return 'walk_away';

    const winsAll = r.competitionWins.length >= 3;
    const winsVPL = r.competitionWins.includes('VPL');
    const winsCup = r.competitionWins.includes('FA Cup');

    if (winsAll && s.boardConfidence >= 70) return 'glory';
    if (winsVPL && !winsCup && s.boardConfidence >= 60) return 'league_champion';
    if (winsCup && !winsVPL && s.teamMorale >= 60) return 'underdog_cup';
    if (s.prodigyPromoted && s.youthInvestment >= 60) return 'youth_revolution';
    if (s.teamMorale >= 60) return 'legendary_failure';
    return 'sacked'; // fallback if nothing else fits
  }

  return { init, get, save, reset, applyEffects, applyRootEffects, recordResult, recordPlayerStats, addCompetitionWin, evaluateEnding };

})();
