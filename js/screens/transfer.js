/* ============================================================
   TRANSFER MARKET SCREEN
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Transfer = (function () {

  let _activeTab = 'buy';

  // ── Mid-season pools by investment area ───────────────────────
  // Initialised once into state.midSeasonTransferPool on first open.

  function _ps(pos, r) {
    const R = Math.round;
    switch (pos) {
      case 'GK':  return { gk: r, def: R(r*.25), mid: R(r*.10), str: 0 };
      case 'CB':  return { gk: R(r*.10), def: r, mid: R(r*.40), str: R(r*.15) };
      case 'RB':
      case 'LB':  return { gk: R(r*.08), def: R(r*.90), mid: R(r*.50), str: R(r*.20) };
      case 'CM':
      case 'DM':  return { gk: 0, def: R(r*.55), mid: r, str: R(r*.45) };
      case 'CAM': return { gk: 0, def: R(r*.30), mid: r, str: R(r*.65) };
      case 'LM':
      case 'RM':  return { gk: 0, def: R(r*.35), mid: R(r*.85), str: R(r*.60) };
      case 'ST':
      case 'CF':  return { gk: 0, def: R(r*.12), mid: R(r*.35), str: r };
      default:    return { gk: 0, def: R(r*.33), mid: R(r*.33), str: R(r*.33) };
    }
  }

  const MID_SEASON_POOLS = {
    attack: [
      { id: 'ms_st1',  name: 'Luca Ferrante',     position: 'ST',  rating: 84, age: 25, price: 14, morale: 70, ...(_ps('ST', 84)) },
      { id: 'ms_cf1',  name: 'Yannick Dembélé',   position: 'CF',  rating: 82, age: 23, price: 10, morale: 72, ...(_ps('CF', 82)) },
      { id: 'ms_st2',  name: 'Bart van Dijk',      position: 'ST',  rating: 80, age: 28, price: 8,  morale: 68, ...(_ps('ST', 80)) },
      { id: 'ms_lw1',  name: 'Simone Greco',       position: 'LM',  rating: 79, age: 24, price: 7,  morale: 70, ...(_ps('LM', 79)) },
      { id: 'ms_rw1',  name: 'Jakub Holec',        position: 'RM',  rating: 78, age: 26, price: 6,  morale: 65, ...(_ps('RM', 78)) },
      { id: 'ms_st3',  name: 'Cristian Ureña',     position: 'ST',  rating: 77, age: 19, price: 5,  morale: 75, ...(_ps('ST', 77)) },
    ],
    defence: [
      { id: 'ms_gk1',  name: 'Florian Baur',       position: 'GK',  rating: 82, age: 28, price: 8,  morale: 70, ...(_ps('GK', 82)) },
      { id: 'ms_cb1',  name: 'Anders Lindqvist',   position: 'CB',  rating: 82, age: 26, price: 9,  morale: 72, ...(_ps('CB', 82)) },
      { id: 'ms_lb1',  name: 'Thierry Konaté',     position: 'LB',  rating: 81, age: 24, price: 8,  morale: 68, ...(_ps('LB', 81)) },
      { id: 'ms_cb2',  name: 'Emir Džeko',         position: 'CB',  rating: 79, age: 23, price: 7,  morale: 73, ...(_ps('CB', 79)) },
      { id: 'ms_rb1',  name: 'Nils Braun',         position: 'RB',  rating: 78, age: 27, price: 5,  morale: 66, ...(_ps('RB', 78)) },
      { id: 'ms_cb3',  name: 'Seun Okafor',        position: 'CB',  rating: 76, age: 21, price: 4,  morale: 77, ...(_ps('CB', 76)) },
    ],
    youth: [
      { id: 'ms_y1',   name: 'Mateus Rocha',       position: 'CAM', rating: 76, age: 18, price: 3,  morale: 82, ...(_ps('CAM', 76)) },
      { id: 'ms_y2',   name: 'Finn Andersen',      position: 'CM',  rating: 75, age: 19, price: 3,  morale: 80, ...(_ps('CM', 75)) },
      { id: 'ms_y3',   name: 'Oumar Diallo',       position: 'ST',  rating: 74, age: 17, price: 2,  morale: 85, ...(_ps('ST', 74)) },
      { id: 'ms_y4',   name: 'Pablo Soria',        position: 'LM',  rating: 73, age: 20, price: 3,  morale: 78, ...(_ps('LM', 73)) },
      { id: 'ms_y5',   name: 'Lukas Veit',         position: 'CB',  rating: 73, age: 18, price: 2,  morale: 80, ...(_ps('CB', 73)) },
      { id: 'ms_y6',   name: 'Tomás Blanco',       position: 'CM',  rating: 78, age: 20, price: 5,  morale: 76, ...(_ps('CM', 78)) },
    ],
  };

  const MID_SEASON_LABELS = {
    attack:  'Attack Focus — Forwards & Wingers',
    defence: 'Defence Focus — Defenders & Goalkeeper',
    youth:   'Young Talent — Future Stars',
  };

  function _initMidSeasonPool(state) {
    const investment = state.story.midSeasonInvestment;
    if (!investment || state.midSeasonTransferPool) return;
    state.midSeasonTransferPool = MID_SEASON_POOLS[investment]
      ? MID_SEASON_POOLS[investment].map(p => ({ ...p, purchased: false }))
      : [];
    window.Game.State.save();
  }

  function render(nextSceneId, opts) {
    const isMidSeason = !!(opts && opts.isMidSeason);
    const { State, Utils, Engine } = window.Game;
    const state = State.get();
    _activeTab = 'buy';

    const div = document.createElement('div');
    div.className = 'screen-transfer';

    // Header
    const header = document.createElement('div');
    header.className = 'transfer-header';
    const title = document.createElement('div');
    title.style.fontSize = '17px';
    title.style.fontWeight = '700';
    title.textContent = 'Transfer Market';

    const budgetBar = document.createElement('div');
    budgetBar.className = 'transfer-budget-bar';
    const budgetLabel = document.createElement('div');
    budgetLabel.className = 'transfer-budget-label';
    budgetLabel.textContent = 'Available Budget';
    const budgetVal = document.createElement('div');
    budgetVal.className = 'transfer-budget-val';
    budgetVal.id = 'transfer-budget-val';
    budgetVal.textContent = Utils.formatMoney(state.budget);
    budgetBar.appendChild(budgetLabel);
    budgetBar.appendChild(budgetVal);

    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;';
    titleRow.appendChild(title);
    const squadBtn = document.createElement('button');
    squadBtn.className = 'transfer-squad-btn';
    squadBtn.textContent = 'See Current Squad';
    const onSquad = () => window.Game.Screens.Squad.render(() => window.Game.Screens.Transfer.render(nextSceneId));
    squadBtn.addEventListener('click', onSquad);
    squadBtn.addEventListener('touchend', e => { e.preventDefault(); onSquad(); }, { passive: false });
    titleRow.appendChild(squadBtn);
    header.appendChild(titleRow);
    header.appendChild(budgetBar);
    div.appendChild(header);

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'transfer-tabs';
    ['buy', 'sell'].forEach(tab => {
      const tabEl = document.createElement('button');
      tabEl.className = `transfer-tab ${tab === _activeTab ? 'active' : ''}`;
      tabEl.textContent = tab === 'buy' ? 'Buy Players' : 'Sell Players';
      tabEl.dataset.tab = tab;
      tabEl.addEventListener('click', () => switchTab(tab, tabs, body, state, nextSceneId, isMidSeason));
      tabEl.addEventListener('touchend', e => { e.preventDefault(); switchTab(tab, tabs, body, state, nextSceneId, isMidSeason); }, { passive: false });
      tabs.appendChild(tabEl);
    });
    div.appendChild(tabs);

    // Body
    const body = document.createElement('div');
    body.className = 'transfer-body';
    body.id = 'transfer-body';
    renderBuyList(body, state, isMidSeason);
    div.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'transfer-footer';
    const doneBtn = document.createElement('button');
    doneBtn.className = 'btn-primary';
    doneBtn.textContent = 'Done — Close Market';
    const onTransferDone = () => {
      State.save();
      if (nextSceneId) Engine.advance(nextSceneId);
      else Engine.next();
    };
    doneBtn.addEventListener('click', onTransferDone);
    doneBtn.addEventListener('touchend', e => { e.preventDefault(); onTransferDone(); }, { passive: false });
    footer.appendChild(doneBtn);
    div.appendChild(footer);

    Utils.render(div);
  }

  function switchTab(tab, tabs, body, state, nextSceneId, isMidSeason) {
    _activeTab = tab;
    tabs.querySelectorAll('.transfer-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    body.innerHTML = '';
    if (tab === 'buy') renderBuyList(body, state, isMidSeason);
    else renderSellList(body, state);
  }

  function renderBuyList(body, state, isMidSeason) {
    if (isMidSeason) {
      _initMidSeasonPool(state);
      const investment = state.story.midSeasonInvestment;
      const label = MID_SEASON_LABELS[investment] || 'January Transfer Window';
      const header = document.createElement('div');
      header.className = 'transfer-focus-header';
      header.textContent = label;
      body.appendChild(header);

      const available = (state.midSeasonTransferPool || []).filter(p => !p.purchased);
      if (available.length === 0) {
        const empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:var(--text-muted);padding:40px 20px;font-size:14px;';
        empty.textContent = 'No players available in this group.';
        body.appendChild(empty);
        return;
      }
      available.forEach(player => {
        const card = buildPlayerCard(player, 'buy', state, true);
        body.appendChild(card);
      });
      return;
    }

    const available = (state.transferPool || []).filter(p => !p.purchased && !p.isProdigy);

    if (available.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'text-align:center;color:var(--text-muted);padding:40px 20px;font-size:14px;';
      empty.textContent = 'No players available on the market.';
      body.appendChild(empty);
      return;
    }

    available.forEach(player => {
      const card = buildPlayerCard(player, 'buy', state);
      body.appendChild(card);
    });
  }

  function renderSellList(body, state) {
    const sellable = state.squad.filter(p =>
      p.id !== 'p_gk1' && p.id !== 'veteran' && !p.sold
    );

    sellable.forEach(player => {
      const card = buildPlayerCard(player, 'sell', state);
      body.appendChild(card);
    });
  }

  const POSITION_GROUP = {
    GK:  'Goalkeeper',
    LB:  'Defender', CB:  'Defender', RB:  'Defender',
    LWB: 'Defender', RWB: 'Defender',
    CDM: 'Midfielder', CM: 'Midfielder', CAM: 'Midfielder',
    LM:  'Midfielder', RM:  'Midfielder',
    LW:  'Winger',   RW:  'Winger',
    CF:  'Forward',  ST:  'Forward',
  };

  function buildPlayerCard(player, action, state, isMidSeason) {
    const { Utils } = window.Game;
    const card = document.createElement('div');
    card.className = 'transfer-card';

    const info = document.createElement('div');
    info.className = 'transfer-card-info';
    const name = document.createElement('div');
    name.className = 'transfer-card-name';
    name.textContent = player.name;
    const group = POSITION_GROUP[player.position] || '';
    const detail = document.createElement('div');
    detail.className = 'transfer-card-detail';
    detail.textContent = `${player.position}${group ? ' · ' + group : ''} · Age ${player.age}`;

    const stats = document.createElement('div');
    stats.className = 'transfer-card-stats';
    stats.innerHTML = `<div class="transfer-stat">Rating <span>${player.rating}</span></div>`;

    info.appendChild(name);
    info.appendChild(detail);
    info.appendChild(stats);
    card.appendChild(info);

    const priceArea = document.createElement('div');
    priceArea.className = 'transfer-card-price';

    if (action === 'buy') {
      const price = document.createElement('div');
      price.className = 'transfer-price';
      price.textContent = Utils.formatMoney(player.price);
      const priceLabel = document.createElement('div');
      priceLabel.className = 'transfer-price-label';
      priceLabel.textContent = 'asking price';
      priceArea.appendChild(price);
      priceArea.appendChild(priceLabel);

      const canAfford = state.budget >= player.price;
      const btn = document.createElement('button');
      btn.className = `transfer-action-btn buy ${!canAfford ? 'disabled' : ''}`;
      btn.textContent = canAfford ? 'Sign' : 'Too costly';
      if (canAfford) {
        btn.addEventListener('click', () => buyPlayer(player, state, card, btn, isMidSeason));
        btn.addEventListener('touchend', e => { e.preventDefault(); buyPlayer(player, state, card, btn, isMidSeason); }, { passive: false });
      }
      priceArea.appendChild(btn);
    } else {
      const val = document.createElement('div');
      val.className = 'transfer-price';
      val.textContent = Utils.formatMoney((player.rating - 60) * 0.5);
      const valLabel = document.createElement('div');
      valLabel.className = 'transfer-price-label';
      valLabel.textContent = 'sell value';
      priceArea.appendChild(val);
      priceArea.appendChild(valLabel);

      const btn = document.createElement('button');
      btn.className = 'transfer-action-btn sell';
      btn.textContent = 'Sell';
      btn.addEventListener('click', () => sellPlayer(player, state, card, btn));
      btn.addEventListener('touchend', e => { e.preventDefault(); sellPlayer(player, state, card, btn); }, { passive: false });
      priceArea.appendChild(btn);
    }

    card.appendChild(priceArea);
    return card;
  }

  function buyPlayer(player, state, card, btn, isMidSeason) {
    const { State, Utils } = window.Game;
    if (state.budget < player.price) return;

    state.budget -= player.price;
    player.purchased = true;

    // Also mark purchased in the pool array so it persists
    if (isMidSeason && state.midSeasonTransferPool) {
      const poolEntry = state.midSeasonTransferPool.find(p => p.id === player.id);
      if (poolEntry) poolEntry.purchased = true;
    }

    state.squad.push({ ...player, value: player.price });

    // Mark prodigy as on squad if bought
    if (player.isProdigy) state.story.prodigyOnSquad = true;

    // Star player sell effect
    if (player.id === 'star') {
      state.story.starSold = false; // hired a new star? No, star was club player
    }

    State.save();

    const budgetEl = document.getElementById('transfer-budget-val');
    if (budgetEl) budgetEl.textContent = Utils.formatMoney(state.budget);

    btn.textContent = '✓ Signed';
    btn.className = 'transfer-action-btn disabled';
    card.style.opacity = '0.5';
  }

  function sellPlayer(player, state, card, btn) {
    const { State, Utils } = window.Game;
    const sellValue = (player.rating - 60) * 0.5;
    state.budget += sellValue;

    // Remove from squad
    const idx = state.squad.findIndex(p => p.id === player.id);
    if (idx >= 0) state.squad.splice(idx, 1);

    // Remove from lineup
    const liIdx = state.lineup.indexOf(player.id);
    if (liIdx >= 0) state.lineup.splice(liIdx, 1);

    // Star player sold
    if (player.id === 'star') {
      state.story.starSold = true;
      state.story.starHappiness = 0;
      state.story.teamMorale -= 10;
    }

    State.save();

    const budgetEl = document.getElementById('transfer-budget-val');
    if (budgetEl) budgetEl.textContent = Utils.formatMoney(state.budget);

    btn.textContent = '✓ Sold';
    btn.className = 'transfer-action-btn disabled';
    card.style.opacity = '0.4';
  }

  return { render };

})();
