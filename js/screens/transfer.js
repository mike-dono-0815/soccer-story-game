/* ============================================================
   TRANSFER MARKET SCREEN
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Transfer = (function () {

  let _activeTab = 'buy';

  function render(nextSceneId) {
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
      tabEl.addEventListener('click', () => switchTab(tab, tabs, body, state, nextSceneId));
      tabEl.addEventListener('touchend', e => { e.preventDefault(); switchTab(tab, tabs, body, state, nextSceneId); }, { passive: false });
      tabs.appendChild(tabEl);
    });
    div.appendChild(tabs);

    // Body
    const body = document.createElement('div');
    body.className = 'transfer-body';
    body.id = 'transfer-body';
    renderBuyList(body, state);
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

  function switchTab(tab, tabs, body, state, nextSceneId) {
    _activeTab = tab;
    tabs.querySelectorAll('.transfer-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    body.innerHTML = '';
    if (tab === 'buy') renderBuyList(body, state);
    else renderSellList(body, state);
  }

  function renderBuyList(body, state) {
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

  function buildPlayerCard(player, action, state) {
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
        btn.addEventListener('click', () => buyPlayer(player, state, card, btn));
        btn.addEventListener('touchend', e => { e.preventDefault(); buyPlayer(player, state, card, btn); }, { passive: false });
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

  function buyPlayer(player, state, card, btn) {
    const { State, Utils } = window.Game;
    if (state.budget < player.price) return;

    state.budget -= player.price;
    player.purchased = true;
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
