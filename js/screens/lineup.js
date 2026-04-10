/* ============================================================
   LINEUP SCREEN — Squad selection + drag-and-drop positioning
   ============================================================ */

window.Game = window.Game || {};
window.Game.Screens = window.Game.Screens || {};

window.Game.Screens.Lineup = (function () {

  const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2'];

  const FORMATION_POSITIONS = {
    '4-3-3':   [
      { pos: 'GK',  l: '50%', t: '88%' },
      { pos: 'RB',  l: '82%', t: '72%' }, { pos: 'CB',  l: '62%', t: '68%' },
      { pos: 'CB',  l: '38%', t: '68%' }, { pos: 'LB',  l: '18%', t: '72%' },
      { pos: 'CM',  l: '75%', t: '50%' }, { pos: 'CM',  l: '50%', t: '46%' }, { pos: 'CM', l: '25%', t: '50%' },
      { pos: 'RW',  l: '82%', t: '26%' }, { pos: 'ST',  l: '50%', t: '22%' }, { pos: 'LW', l: '18%', t: '26%' },
    ],
    '4-4-2':   [
      { pos: 'GK',  l: '50%', t: '88%' },
      { pos: 'RB',  l: '82%', t: '72%' }, { pos: 'CB',  l: '62%', t: '68%' },
      { pos: 'CB',  l: '38%', t: '68%' }, { pos: 'LB',  l: '18%', t: '72%' },
      { pos: 'RM',  l: '82%', t: '48%' }, { pos: 'CM',  l: '62%', t: '44%' },
      { pos: 'CM',  l: '38%', t: '44%' }, { pos: 'LM',  l: '18%', t: '48%' },
      { pos: 'ST',  l: '65%', t: '22%' }, { pos: 'ST',  l: '35%', t: '22%' },
    ],
    '3-5-2':   [
      { pos: 'GK',  l: '50%', t: '88%' },
      { pos: 'CB',  l: '70%', t: '70%' }, { pos: 'CB',  l: '50%', t: '66%' }, { pos: 'CB', l: '30%', t: '70%' },
      { pos: 'RWB', l: '88%', t: '52%' }, { pos: 'CM',  l: '68%', t: '46%' }, { pos: 'CM', l: '50%', t: '42%' },
      { pos: 'CM',  l: '32%', t: '46%' }, { pos: 'LWB', l: '12%', t: '52%' },
      { pos: 'ST',  l: '65%', t: '22%' }, { pos: 'ST',  l: '35%', t: '22%' },
    ],
    '4-2-3-1': [
      { pos: 'GK',  l: '50%', t: '88%' },
      { pos: 'RB',  l: '82%', t: '72%' }, { pos: 'CB',  l: '62%', t: '68%' },
      { pos: 'CB',  l: '38%', t: '68%' }, { pos: 'LB',  l: '18%', t: '72%' },
      { pos: 'DM',  l: '62%', t: '54%' }, { pos: 'DM',  l: '38%', t: '54%' },
      { pos: 'RM',  l: '80%', t: '36%' }, { pos: 'CAM', l: '50%', t: '34%' }, { pos: 'LM', l: '20%', t: '36%' },
      { pos: 'ST',  l: '50%', t: '18%' },
    ],
    '5-3-2':   [
      { pos: 'GK',  l: '50%', t: '88%' },
      { pos: 'RWB', l: '88%', t: '72%' }, { pos: 'CB', l: '70%', t: '67%' }, { pos: 'CB', l: '50%', t: '64%' },
      { pos: 'CB',  l: '30%', t: '67%' }, { pos: 'LWB', l: '12%', t: '72%' },
      { pos: 'CM',  l: '70%', t: '46%' }, { pos: 'CM',  l: '50%', t: '42%' }, { pos: 'CM', l: '30%', t: '46%' },
      { pos: 'ST',  l: '65%', t: '22%' }, { pos: 'ST',  l: '35%', t: '22%' },
    ],
  };

  // ── Position Fit Evaluation ───────────────────────────────────

  const POS_GROUP = {
    GK: 'GK',
    CB: 'DEF', RB: 'DEF', LB: 'DEF', RWB: 'DEF', LWB: 'DEF',
    CM: 'MID', DM: 'MID', CAM: 'MID', RM: 'MID', LM: 'MID',
    ST: 'FWD', CF: 'FWD', RW: 'FWD', LW: 'FWD',
  };

  // How much rating is kept at each fit level
  const FIT_FACTOR = { green: 1.00, yellow: 0.85, orange: 0.70, red: 0.50 };

  function posFit(playerPos, slotPos) {
    if (playerPos === slotPos) return 'green';
    const pg = POS_GROUP[playerPos] || 'MID';
    const sg = POS_GROUP[slotPos]   || 'MID';
    if (pg === sg) return 'yellow';
    if (pg === 'GK' || sg === 'GK') return 'red';
    if ((pg === 'DEF' && sg === 'MID') || (pg === 'MID' && sg === 'DEF')) return 'orange';
    if ((pg === 'MID' && sg === 'FWD') || (pg === 'FWD' && sg === 'MID')) return 'orange';
    return 'red'; // DEF <-> FWD
  }

  function effectiveRating(player, slotPos) {
    return Math.round(player.rating * FIT_FACTOR[posFit(player.position, slotPos)]);
  }

  // ── Render ────────────────────────────────────────────────────

  function render(nextSceneId) {
    const { State, Utils, Engine } = window.Game;
    const state = State.get();

    // Slot-indexed lineup: slottedLineup[i] = playerId or null
    let slottedLineup = Array.from({ length: 11 }, (_, i) => state.lineup[i] || null);
    let currentFormation = state.formation;

    const div = document.createElement('div');
    div.className = 'screen-lineup';

    // Header
    const header = document.createElement('div');
    header.className = 'lineup-header';
    const titleGroup = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'lineup-title';
    title.textContent = 'Select Lineup';
    const subtitle = document.createElement('div');
    subtitle.className = 'lineup-subtitle';
    subtitle.id = 'lineup-count';
    subtitle.textContent = countLabel(slottedLineup);
    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);
    header.appendChild(titleGroup);

    const squadBtn = document.createElement('button');
    squadBtn.className = 'lineup-done-btn';
    squadBtn.style.cssText = 'background:var(--bg-card);color:var(--text-muted);border:1px solid var(--border-bright);margin-right:6px;';
    squadBtn.textContent = 'Squad';
    const onSquad = () => window.Game.Screens.Squad.render(() => window.Game.Screens.Lineup.render(nextSceneId));
    squadBtn.addEventListener('click', onSquad);
    squadBtn.addEventListener('touchend', e => { e.preventDefault(); onSquad(); }, { passive: false });
    header.appendChild(squadBtn);

    const doneBtn = document.createElement('button');
    doneBtn.className = 'lineup-done-btn';
    doneBtn.textContent = 'Done';
    const onDone = () => {
      state.lineup = slottedLineup.filter(Boolean);
      state.formation = currentFormation;
      State.save();
      if (nextSceneId) Engine.advance(nextSceneId);
      else Engine.next();
    };
    doneBtn.addEventListener('click', onDone);
    doneBtn.addEventListener('touchend', e => { e.preventDefault(); onDone(); }, { passive: false });
    header.appendChild(doneBtn);
    div.appendChild(header);

    // Formation selector
    const fmtSel = document.createElement('div');
    fmtSel.className = 'formation-selector';
    FORMATIONS.forEach(f => {
      const btn = document.createElement('button');
      btn.className = `formation-btn ${f === currentFormation ? 'active' : ''}`;
      btn.textContent = f;
      btn.addEventListener('click', () => {
        currentFormation = f;
        document.querySelectorAll('.formation-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refreshPitch(pitchEl, currentFormation, slottedLineup);
      });
      fmtSel.appendChild(btn);
    });
    div.appendChild(fmtSel);

    // Body: pitch + squad list
    const body = document.createElement('div');
    body.className = 'lineup-body';

    const pitchEl = document.createElement('div');
    pitchEl.className = 'lineup-pitch';
    pitchEl.innerHTML = `
      <div class="lineup-pitch-lines"></div>
      <div class="lineup-pitch-center"></div>
      <div class="lineup-pitch-halfway"></div>
    `;

    const squadList = document.createElement('div');
    squadList.className = 'lineup-squad-list';

    // ── Refresh Helpers ───────────────────────────────────────

    function refreshAll() {
      refreshPitch(pitchEl, currentFormation, slottedLineup);
      refreshSquadCards();
      const countEl = document.getElementById('lineup-count');
      if (countEl) countEl.textContent = countLabel(slottedLineup);
    }

    function refreshSquadCards() {
      squadList.querySelectorAll('.player-card-small').forEach(card => {
        const pid = card.dataset.playerId;
        const inSlot = slottedLineup.includes(pid);
        card.classList.toggle('starter', inSlot);
        const numEl = card.querySelector('.player-num');
        if (numEl) {
          numEl.classList.toggle('starter', inSlot);
          const player = state.squad.find(p => p.id === pid);
          numEl.textContent = inSlot ? '✓' : (player ? player.position : '?');
        }
      });
    }

    // ── Click Handlers ────────────────────────────────────────

    function onSlotClick(slotIdx) {
      // Clicking a filled slot removes the player
      slottedLineup[slotIdx] = null;
      refreshAll();
    }

    function onCardClick(playerId) {
      const slotIdx = slottedLineup.indexOf(playerId);
      if (slotIdx >= 0) {
        // Remove from lineup
        slottedLineup[slotIdx] = null;
      } else {
        // Add to first empty slot, or last slot if all full
        const emptyIdx = slottedLineup.indexOf(null);
        if (emptyIdx >= 0) {
          slottedLineup[emptyIdx] = playerId;
        } else {
          slottedLineup[10] = playerId; // replace last slot
        }
      }
      refreshAll();
    }

    // ── Drag System ───────────────────────────────────────────

    let drag = null; // { playerId, sourceSlotIdx, ghost, moved }

    function startDrag(e, playerId, sourceSlotIdx) {
      if (drag) return;
      e.preventDefault();

      const ghost = document.createElement('div');
      ghost.className = 'lineup-drag-ghost';
      const player = state.squad.find(p => p.id === playerId);
      ghost.textContent = player ? abbrev(player.name) : '?';
      ghost.style.left = e.clientX + 'px';
      ghost.style.top  = e.clientY + 'px';
      document.body.appendChild(ghost);

      drag = { playerId, sourceSlotIdx, ghost, startX: e.clientX, startY: e.clientY, moved: false };

      function onMove(ev) {
        if (!drag) return;
        if (!drag.moved) {
          const dx = ev.clientX - drag.startX, dy = ev.clientY - drag.startY;
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
          drag.moved = true;
          // Highlight all slots as potential drop targets
          pitchEl.querySelectorAll('.lineup-position-slot').forEach(s => s.classList.add('drag-available'));
        }
        drag.ghost.style.left = ev.clientX + 'px';
        drag.ghost.style.top  = ev.clientY + 'px';

        // Highlight slot under pointer
        drag.ghost.style.visibility = 'hidden';
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        drag.ghost.style.visibility = '';
        pitchEl.querySelectorAll('.lineup-position-slot.drag-hover').forEach(s => s.classList.remove('drag-hover'));
        const targetSlot = under?.closest('.lineup-position-slot');
        if (targetSlot) targetSlot.classList.add('drag-hover');
      }

      function onUp(ev) {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup',   onUp);

        if (!drag) return;
        const wasMoved = drag.moved;
        const ghost = drag.ghost;
        const src = drag.sourceSlotIdx;
        const pid = drag.playerId;
        drag = null;

        ghost.remove();
        pitchEl.querySelectorAll('.lineup-position-slot').forEach(s => {
          s.classList.remove('drag-available', 'drag-hover');
        });

        if (!wasMoved) {
          // Treat as click
          if (src !== null) onSlotClick(src);
          else onCardClick(pid);
          return;
        }

        // Find drop target
        ghost.style.visibility = 'hidden'; // already removed but guard
        const under = document.elementFromPoint(ev.clientX, ev.clientY);
        const targetSlotEl = under?.closest('.lineup-position-slot');
        const targetIdx = targetSlotEl ? parseInt(targetSlotEl.dataset.slotIndex) : -1;

        if (targetIdx >= 0) {
          const existing = slottedLineup[targetIdx];
          slottedLineup[targetIdx] = pid;
          if (src !== null) {
            // Slot-to-slot: swap
            slottedLineup[src] = existing;
          } else {
            // Bench-to-slot: clear old slot (if player was already slotted)
            const oldIdx = slottedLineup.findIndex((id, i) => id === pid && i !== targetIdx);
            if (oldIdx >= 0) slottedLineup[oldIdx] = existing;
          }
        }
        // Drop outside a slot: no-op (don't remove from lineup)

        refreshAll();
      }

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup',   onUp);
    }

    // ── Build Pitch & Squad ───────────────────────────────────

    refreshPitch(pitchEl, currentFormation, slottedLineup);

    // Wire drag on pitch slots (delegate via event, slots re-created on refresh)
    pitchEl.addEventListener('pointerdown', e => {
      const slot = e.target.closest('.lineup-position-slot.filled');
      if (!slot) return;
      const slotIdx = parseInt(slot.dataset.slotIndex);
      const pid = slottedLineup[slotIdx];
      if (pid) startDrag(e, pid, slotIdx);
    });

    state.squad.forEach(player => {
      if (player.id === 'prodigy' && !state.story.prodigyOnSquad) return;
      const card = document.createElement('div');
      const inSlot = slottedLineup.includes(player.id);
      card.className = `player-card-small ${inSlot ? 'starter' : ''}`;
      card.dataset.playerId = player.id;
      card.style.touchAction = 'none';

      const numEl = document.createElement('div');
      numEl.className = `player-num ${inSlot ? 'starter' : ''}`;
      numEl.textContent = inSlot ? '✓' : player.position;

      const infoEl = document.createElement('div');
      infoEl.className = 'player-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'player-name';
      nameEl.textContent = player.name;
      const posEl = document.createElement('div');
      posEl.className = 'player-pos';
      posEl.textContent = `${player.position} · Age ${player.age}`;
      infoEl.appendChild(nameEl);
      infoEl.appendChild(posEl);

      const ratingEl = document.createElement('div');
      ratingEl.className = 'player-rating';
      ratingEl.textContent = player.rating;

      card.appendChild(numEl);
      card.appendChild(infoEl);
      card.appendChild(ratingEl);

      card.addEventListener('pointerdown', e => {
        startDrag(e, player.id, null);
      });

      squadList.appendChild(card);
    });

    body.appendChild(pitchEl);
    body.appendChild(squadList);
    div.appendChild(body);

    Utils.render(div);
  }

  // ── Pitch Rendering ───────────────────────────────────────────

  function refreshPitch(pitchEl, formation, slottedLineup) {
    pitchEl.querySelectorAll('.lineup-position-slot').forEach(el => el.remove());

    const positions = FORMATION_POSITIONS[formation] || FORMATION_POSITIONS['4-3-3'];
    const state = window.Game.State.get();

    positions.forEach((slot, i) => {
      const playerId = slottedLineup[i];
      const player   = playerId ? state.squad.find(p => p.id === playerId) : null;
      const fit      = player ? posFit(player.position, slot.pos) : null;
      const effRat   = player ? effectiveRating(player, slot.pos) : null;

      const el = document.createElement('div');
      el.dataset.slotIndex = i;
      el.style.left      = slot.l;
      el.style.top       = slot.t;
      el.style.transform = 'translate(-50%, -50%)';

      if (player) {
        el.className = `lineup-position-slot filled fit-${fit}`;

        const posLbl = document.createElement('div');
        posLbl.className = 'slot-pos';
        posLbl.textContent = slot.pos;

        const nameLbl = document.createElement('div');
        nameLbl.className = 'slot-name';
        nameLbl.textContent = abbrev(player.name);

        const ratLbl = document.createElement('div');
        ratLbl.className = 'slot-rating';
        ratLbl.textContent = effRat;

        el.appendChild(posLbl);
        el.appendChild(nameLbl);
        el.appendChild(ratLbl);
      } else {
        el.className = 'lineup-position-slot empty';
        const posLbl = document.createElement('div');
        posLbl.className = 'slot-pos slot-pos-empty';
        posLbl.textContent = slot.pos;
        el.appendChild(posLbl);
      }

      pitchEl.appendChild(el);
    });
  }

  // ── Utilities ─────────────────────────────────────────────────

  function abbrev(name) {
    // Last name up to 5 chars
    return name.split(' ').pop().slice(0, 5).toUpperCase();
  }

  function countLabel(slottedLineup) {
    const n = slottedLineup.filter(Boolean).length;
    return `${n}/11 selected`;
  }

  return { render };

})();
