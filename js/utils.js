/* ============================================================
   UTILS — Global helpers
   ============================================================ */

window.Game = window.Game || {};

window.Game.Utils = (function () {

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Render a DOM node into the game root
  function render(el) {
    const root = document.getElementById('game-root');
    // Animate out existing screen
    const existing = root.querySelector('.game-container');
    if (existing) {
      existing.classList.add('screen-exit');
      setTimeout(() => {
        root.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'game-container screen-enter';
        container.appendChild(el);
        root.appendChild(container);
      }, 220);
    } else {
      root.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'game-container screen-enter';
      container.appendChild(el);
      root.appendChild(container);
    }
  }

  // Typewriter effect
  function typewriter(el, text, speed, callback) {
    el.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);

    const interval = setInterval(() => {
      if (i < text.length) {
        el.insertBefore(document.createTextNode(text[i]), cursor);
        // Auto-scroll to bottom so new text is always visible
        el.scrollTop = el.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        cursor.remove();
        if (callback) callback();
      }
    }, speed || 22);
    return interval;
  }

  // Format currency
  function formatMoney(millions) {
    if (millions >= 1) return `£${millions}M`;
    return `£${(millions * 1000).toFixed(0)}K`;
  }

  // Meter change display (e.g. +5, -10)
  function formatDelta(val) {
    return val >= 0 ? `+${val}` : `${val}`;
  }

  // Get ordinal suffix
  function ordinal(n) {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
  }

  // Deep clone a plain object
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Show debug overlay
  function showDebug() {
    const overlay = document.getElementById('debug-overlay');
    const text = document.getElementById('debug-text');
    const state = window.Game.State.get();
    text.textContent = JSON.stringify({
      week: state.progress.seasonWeek,
      phase: state.progress.phase,
      eventIndex: state.progress.currentEventIndex,
      story: state.story,
      results: state.results,
      budget: state.budget,
      formation: state.formation,
      trainingFocus: state.trainingFocus,
    }, null, 2);
    overlay.classList.remove('hidden');
  }

  // ============================================================
  // SETTINGS — portrait mode preference
  // ============================================================
  const SETTINGS_KEY = 'thegaffer_settings';

  window.Game.Settings = {
    portraitMode: 'image', // 'image' | 'svg'

    load: function () {
      try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        if (saved.portraitMode) this.portraitMode = saved.portraitMode;
      } catch (e) {}
    },

    save: function () {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ portraitMode: this.portraitMode }));
    },

    toggle: function () {
      this.portraitMode = this.portraitMode === 'image' ? 'svg' : 'image';
      this.save();
    },
  };

  window.Game.Settings.load();

  // Setup triple-tap debug
  let tapCount = 0;
  let tapTimer = null;
  document.addEventListener('click', function () {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => { tapCount = 0; }, 600);
    if (tapCount >= 5) {
      tapCount = 0;
      showDebug();
    }
  });

  // Create element helper
  function el(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  return { clamp, randomBetween, randomFrom, render, typewriter, formatMoney, formatDelta, ordinal, deepClone, el, showDebug };

})();
