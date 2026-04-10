/* ============================================================
   CHARACTERS — CSS portrait art and character data
   ============================================================ */

window.Game = window.Game || {};

window.Game.Characters = (function () {

  const data = {
    chairman: {
      name: 'Paulo Ferretti',
      title: 'Club Chairman',
      color: '#e05555',
      accent: '#ff8888',
    },
    assistant: {
      name: 'Lena Brandt',
      title: 'Assistant Coach',
      color: '#3ddc84',
      accent: '#88ffbb',
    },
    star: {
      name: 'Marco "El Tornado" Silva',
      title: 'Star Forward',
      color: '#f5c842',
      accent: '#ffe080',
    },
    veteran: {
      name: 'Roberto Okafor',
      title: 'Club Veteran',
      color: '#4d9ef5',
      accent: '#88ccff',
    },
    prodigy: {
      name: 'Kai Voss',
      title: 'Youth Prodigy',
      color: '#9b6af5',
      accent: '#cc99ff',
    },
    rival: {
      name: 'Ivan Sorokin',
      title: 'Rival Manager',
      color: '#888aaa',
      accent: '#aaaacc',
    },
    journalist: {
      name: 'Alexandra Chen',
      title: 'Sports Reporter',
      color: '#f5a042',
      accent: '#ffcc88',
    },
    narrator: {
      name: '',
      title: '',
      color: '#888aaa',
      accent: '#aaaacc',
    },
  };

  // PNG assignments (random for now — can be remapped later)
  const pngMap = {
    chairman:   'Soc_Put.png',
    assistant:  'Soc_Kus.png',
    star:       'Soc_Wam.png',
    veteran:    'Soc_Owl.png',
    prodigy:    'Soc_Bib.png',
    rival:      'Soc_Gauks.png',
    journalist: 'Soc_Empty.png',
  };

  // Build portrait — uses PNG or SVG depending on Settings.portraitMode
  function buildPortrait(characterId, size) {
    size = size || 'large';
    const mode = (window.Game.Settings && window.Game.Settings.portraitMode) || 'image';
    return mode === 'image'
      ? buildImagePortrait(characterId, size)
      : buildSVGPortrait(characterId, size);
  }

  function buildImagePortrait(characterId, size) {
    const isLarge = size === 'large';
    const pngFile = pngMap[characterId];

    const div = document.createElement('div');
    // portrait-image class lets CSS handle sizing (fills portrait area when large)
    div.className = isLarge ? 'portrait-wrap portrait-image' : 'portrait-wrap portrait-image-small';

    if (!isLarge) {
      // Small version (decision panel decoration) keeps a fixed size
      div.style.cssText = 'width:120px;height:160px;display:flex;align-items:flex-end;justify-content:center;';
    }

    if (!pngFile || characterId === 'narrator') return div;

    const img = document.createElement('img');
    img.src = pngFile;
    img.alt = (data[characterId] || {}).name || '';
    if (!isLarge) {
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:bottom center;';
    }
    div.appendChild(img);
    return div;
  }

  function buildSVGPortrait(characterId, size) {
    const char = data[characterId] || data.narrator;
    const isLarge = size === 'large';
    const w = isLarge ? 220 : 120;
    const h = isLarge ? 300 : 160;

    const div = document.createElement('div');
    div.className = 'portrait-wrap';
    div.style.cssText = `
      width: ${w}px;
      height: ${h}px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    `;

    if (characterId === 'narrator') return div;

    const scale = isLarge ? 1 : 0.55;
    div.innerHTML = getPortraitSVG(characterId, char, scale);
    return div;
  }

  function getPortraitSVG(characterId, char, scale) {
    const s = scale;
    const w = Math.round(220 * s);
    const h = Math.round(300 * s);

    // All portraits share a common body silhouette structure,
    // differentiated by head shape, hair, and color accents

    const portraits = {
      chairman: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Glow -->
          <ellipse cx="110" cy="290" rx="70" ry="12" fill="${char.color}" opacity="0.15"/>
          <!-- Body / suit -->
          <path d="M50 180 Q50 160 70 155 L90 150 L110 165 L130 150 L150 155 Q170 160 170 180 L175 300 H45 Z"
                fill="#1a1d2e" stroke="${char.color}" stroke-width="1.5" stroke-opacity="0.4"/>
          <!-- Tie -->
          <path d="M105 155 L115 155 L118 200 L110 210 L102 200 Z" fill="${char.color}" opacity="0.8"/>
          <!-- Shirt collar -->
          <path d="M95 155 L110 165 L125 155 L120 145 L110 155 L100 145 Z" fill="#f0f0f0" opacity="0.9"/>
          <!-- Shoulders epaulettes / power look -->
          <rect x="45" y="155" width="20" height="8" rx="2" fill="${char.color}" opacity="0.3"/>
          <rect x="155" y="155" width="20" height="8" rx="2" fill="${char.color}" opacity="0.3"/>
          <!-- Neck -->
          <rect x="100" y="128" width="20" height="22" rx="4" fill="${char.accent}" opacity="0.7"/>
          <!-- Head (square jaw, authority) -->
          <rect x="78" y="70" width="64" height="65" rx="14" fill="${char.accent}" opacity="0.85"/>
          <!-- Hair (slicked back) -->
          <path d="M78 82 Q78 62 110 60 Q142 62 142 82 L142 72 Q142 52 110 50 Q78 52 78 72 Z"
                fill="#1a1200" opacity="0.9"/>
          <!-- Eyes -->
          <ellipse cx="97" cy="97" rx="6" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <ellipse cx="123" cy="97" rx="6" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <circle cx="99" cy="96" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="125" cy="96" r="1.5" fill="white" opacity="0.8"/>
          <!-- Stern brow -->
          <path d="M90 89 Q97 86 104 89" stroke="#1a1200" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M116 89 Q123 86 130 89" stroke="#1a1200" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Nose -->
          <path d="M108 101 Q110 108 112 101" stroke="#1a1200" stroke-width="1.5" fill="none" stroke-linecap="round"/>
          <!-- Confident smirk -->
          <path d="M100 115 Q110 121 120 115" stroke="#1a1200" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>`,

      assistant: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="65" ry="12" fill="${char.color}" opacity="0.15"/>
          <!-- Body / tracksuit -->
          <path d="M55 178 Q55 158 72 152 L90 147 L110 162 L130 147 L148 152 Q165 158 165 178 L170 300 H50 Z"
                fill="#0d1a12" stroke="${char.color}" stroke-width="1.5" stroke-opacity="0.5"/>
          <!-- Club crest area -->
          <rect x="120" y="160" width="24" height="20" rx="3" fill="${char.color}" opacity="0.25"/>
          <text x="132" y="174" fill="${char.color}" font-size="10" text-anchor="middle" opacity="0.9">V</text>
          <!-- Zip/collar -->
          <path d="M98 150 L110 162 L122 150 L116 140 L110 148 L104 140 Z" fill="${char.color}" opacity="0.4"/>
          <!-- Neck -->
          <rect x="101" y="126" width="18" height="20" rx="4" fill="${char.accent}" opacity="0.7"/>
          <!-- Head (friendly, oval) -->
          <ellipse cx="110" cy="92" rx="32" ry="36" fill="${char.accent}" opacity="0.85"/>
          <!-- Hair (short, side parted) -->
          <path d="M78 80 Q78 56 110 54 Q142 56 142 80 L138 70 Q132 50 110 50 Q88 50 82 70 Z"
                fill="#c8a820" opacity="0.9"/>
          <path d="M78 78 Q78 68 85 65" stroke="#c8a820" stroke-width="3" stroke-linecap="round"/>
          <!-- Eyes (bright, confident) -->
          <ellipse cx="97" cy="90" rx="5.5" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <ellipse cx="123" cy="90" rx="5.5" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <circle cx="99" cy="89" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="125" cy="89" r="1.5" fill="white" opacity="0.8"/>
          <!-- Nose -->
          <path d="M108 98 Q110 104 112 98" stroke="#1a1200" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <!-- Warm smile -->
          <path d="M98 112 Q110 120 122 112" stroke="#1a1200" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>`,

      star: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="70" ry="12" fill="${char.color}" opacity="0.2"/>
          <!-- Body / kit -->
          <path d="M48 175 Q48 155 68 148 L88 143 L110 158 L132 143 L152 148 Q172 155 172 175 L176 300 H44 Z"
                fill="#1a1200" stroke="${char.color}" stroke-width="2" stroke-opacity="0.7"/>
          <!-- Kit number -->
          <text x="110" y="230" fill="${char.color}" font-size="32" font-weight="900" text-anchor="middle" opacity="0.3" font-family="Georgia,serif">7</text>
          <!-- Star flash on chest -->
          <path d="M85 160 L90 155 L95 160 L90 165 Z" fill="${char.color}" opacity="0.6"/>
          <!-- V-neck collar -->
          <path d="M96 145 L110 158 L124 145 L116 135 L110 145 L104 135 Z" fill="${char.color}" opacity="0.5"/>
          <!-- Neck -->
          <rect x="102" y="123" width="16" height="18" rx="3" fill="${char.accent}" opacity="0.75"/>
          <!-- Head (confident, angular) -->
          <path d="M80 88 Q80 58 110 56 Q140 58 140 88 L138 118 Q130 132 110 134 Q90 132 82 118 Z"
                fill="${char.accent}" opacity="0.88"/>
          <!-- Wild hair -->
          <path d="M80 80 Q75 55 110 50 Q148 48 142 78" fill="#1a0a00" opacity="0.9"/>
          <path d="M80 80 Q72 70 74 58" stroke="#1a0a00" stroke-width="4" stroke-linecap="round"/>
          <path d="M142 78 Q150 68 148 54" stroke="#1a0a00" stroke-width="3" stroke-linecap="round"/>
          <!-- Eyes (intense) -->
          <ellipse cx="96" cy="92" rx="6" ry="5.5" fill="#0d0f1a" opacity="0.9"/>
          <ellipse cx="124" cy="92" rx="6" ry="5.5" fill="#0d0f1a" opacity="0.9"/>
          <circle cx="98" cy="91" r="2" fill="white" opacity="0.85"/>
          <circle cx="126" cy="91" r="2" fill="white" opacity="0.85"/>
          <!-- Strong brows -->
          <path d="M88 84 Q96 81 103 84" stroke="#1a0a00" stroke-width="3" stroke-linecap="round"/>
          <path d="M117 84 Q124 81 132 84" stroke="#1a0a00" stroke-width="3" stroke-linecap="round"/>
          <!-- Jawline stubble hint -->
          <path d="M84 108 Q110 120 136 108" stroke="#1a0a00" stroke-width="1" fill="none" opacity="0.4"/>
          <!-- Smirk -->
          <path d="M100 114 Q112 122 122 114" stroke="#1a0a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>`,

      veteran: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="68" ry="12" fill="${char.color}" opacity="0.15"/>
          <!-- Body / training top -->
          <path d="M52 177 Q52 157 70 151 L89 146 L110 160 L131 146 L150 151 Q168 157 168 177 L172 300 H48 Z"
                fill="#0a0d1a" stroke="${char.color}" stroke-width="1.5" stroke-opacity="0.5"/>
          <!-- Captain armband -->
          <rect x="162" y="175" width="16" height="28" rx="3" fill="${char.color}" opacity="0.7"/>
          <text x="170" y="193" fill="#0d0f1a" font-size="9" font-weight="900" text-anchor="middle">C</text>
          <!-- Neck -->
          <rect x="101" y="126" width="18" height="20" rx="4" fill="${char.accent}" opacity="0.7"/>
          <!-- Head (weathered, broad) -->
          <rect x="78" y="68" width="64" height="64" rx="20" fill="${char.accent}" opacity="0.85"/>
          <!-- Close-cropped grey hair -->
          <path d="M78 80 Q78 60 110 58 Q142 60 142 80 L142 72 Q138 55 110 54 Q82 55 78 72 Z"
                fill="#9090a0" opacity="0.85"/>
          <!-- Lines of experience -->
          <path d="M86 94 Q94 91 102 94" stroke="#1a1200" stroke-width="1" fill="none" opacity="0.4"/>
          <path d="M118 94 Q126 91 134 94" stroke="#1a1200" stroke-width="1" fill="none" opacity="0.4"/>
          <!-- Eyes (kind, tired) -->
          <ellipse cx="97" cy="99" rx="5.5" ry="4.5" fill="#0d0f1a" opacity="0.85"/>
          <ellipse cx="123" cy="99" rx="5.5" ry="4.5" fill="#0d0f1a" opacity="0.85"/>
          <circle cx="99" cy="98" r="1.5" fill="white" opacity="0.7"/>
          <circle cx="125" cy="98" r="1.5" fill="white" opacity="0.7"/>
          <!-- Gentle brows -->
          <path d="M90 91 Q97 88 104 91" stroke="#9090a0" stroke-width="2" stroke-linecap="round"/>
          <path d="M116 91 Q123 88 130 91" stroke="#9090a0" stroke-width="2" stroke-linecap="round"/>
          <!-- Broad nose -->
          <ellipse cx="110" cy="108" rx="5" ry="3" fill="#1a1200" opacity="0.2"/>
          <!-- Calm smile -->
          <path d="M99 118 Q110 126 121 118" stroke="#1a1200" stroke-width="2" fill="none" stroke-linecap="round"/>
        </svg>`,

      prodigy: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="60" ry="11" fill="${char.color}" opacity="0.2"/>
          <!-- Glow halo (prodigy aura) -->
          <ellipse cx="110" cy="75" rx="50" ry="50" fill="${char.color}" opacity="0.06"/>
          <!-- Body / youth academy kit -->
          <path d="M58 180 Q58 160 75 154 L92 149 L110 163 L128 149 L145 154 Q162 160 162 180 L166 300 H54 Z"
                fill="#0a0a1a" stroke="${char.color}" stroke-width="1.5" stroke-opacity="0.6"/>
          <!-- Youth badge -->
          <circle cx="88" cy="165" r="9" fill="${char.color}" opacity="0.2" stroke="${char.color}" stroke-width="1"/>
          <text x="88" y="169" fill="${char.color}" font-size="8" text-anchor="middle" font-weight="900">Y</text>
          <!-- Neck -->
          <rect x="102" y="128" width="16" height="18" rx="3" fill="${char.accent}" opacity="0.7"/>
          <!-- Head (young, round face) -->
          <ellipse cx="110" cy="94" rx="30" ry="34" fill="${char.accent}" opacity="0.88"/>
          <!-- Messy youthful hair -->
          <path d="M80 88 Q78 60 110 56 Q142 60 140 88" fill="#2a1a00" opacity="0.9"/>
          <path d="M140 72 Q146 62 142 52" stroke="#2a1a00" stroke-width="3" stroke-linecap="round"/>
          <path d="M80 70 Q74 60 78 50" stroke="#2a1a00" stroke-width="2" stroke-linecap="round"/>
          <path d="M110 58 L112 48" stroke="#2a1a00" stroke-width="3" stroke-linecap="round"/>
          <!-- Eager wide eyes -->
          <ellipse cx="97" cy="92" rx="6.5" ry="6" fill="#0d0f1a" opacity="0.9"/>
          <ellipse cx="123" cy="92" rx="6.5" ry="6" fill="#0d0f1a" opacity="0.9"/>
          <circle cx="99" cy="91" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="125" cy="91" r="2.5" fill="white" opacity="0.9"/>
          <!-- Bright star highlight -->
          <circle cx="101" cy="90" r="1" fill="${char.color}" opacity="0.7"/>
          <circle cx="127" cy="90" r="1" fill="${char.color}" opacity="0.7"/>
          <!-- Freckle nose -->
          <path d="M107 100 Q110 106 113 100" stroke="#2a1a00" stroke-width="1.2" fill="none" stroke-linecap="round"/>
          <!-- Excited grin -->
          <path d="M98 112 Q110 122 122 112" stroke="#2a1a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>`,

      rival: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="65" ry="11" fill="${char.color}" opacity="0.1"/>
          <!-- Body / dark coat -->
          <path d="M46 172 Q46 150 67 144 L87 139 L110 155 L133 139 L153 144 Q174 150 174 172 L178 300 H42 Z"
                fill="#0a0a14" stroke="${char.color}" stroke-width="1" stroke-opacity="0.4"/>
          <!-- Lapels -->
          <path d="M87 140 L100 150 L100 170 L90 155 L87 140" fill="#14141e" opacity="0.9"/>
          <path d="M133 140 L120 150 L120 170 L130 155 L133 140" fill="#14141e" opacity="0.9"/>
          <!-- Neck -->
          <rect x="101" y="124" width="18" height="20" rx="4" fill="${char.accent}" opacity="0.65"/>
          <!-- Head (angular, menacing) -->
          <path d="M78 86 Q78 62 110 60 Q142 62 142 86 L140 116 Q132 130 110 132 Q88 130 80 116 Z"
                fill="${char.accent}" opacity="0.8"/>
          <!-- Slicked dark hair -->
          <path d="M78 82 Q78 58 110 56 Q142 58 142 82 L140 70 Q134 50 110 48 Q86 50 80 70 Z"
                fill="#0a0a14" opacity="0.95"/>
          <!-- Cold narrow eyes -->
          <ellipse cx="97" cy="94" rx="7" ry="4" fill="#0d0f1a" opacity="0.95"/>
          <ellipse cx="123" cy="94" rx="7" ry="4" fill="#0d0f1a" opacity="0.95"/>
          <circle cx="99" cy="94" r="1.5" fill="white" opacity="0.6"/>
          <circle cx="125" cy="94" r="1.5" fill="white" opacity="0.6"/>
          <!-- Scowling brows -->
          <path d="M88 87 Q97 83 105 88" stroke="#0a0a14" stroke-width="3" stroke-linecap="round"/>
          <path d="M115 88 Q123 83 132 87" stroke="#0a0a14" stroke-width="3" stroke-linecap="round"/>
          <!-- Thin line mouth -->
          <path d="M100 116 Q110 118 120 116" stroke="#0a0a14" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- Scar hint -->
          <path d="M126 98 L130 110" stroke="#0a0a14" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/>
        </svg>`,

      journalist: `
        <svg width="${w}" height="${h}" viewBox="0 0 220 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="110" cy="290" rx="63" ry="11" fill="${char.color}" opacity="0.15"/>
          <!-- Body / blazer -->
          <path d="M53 176 Q53 156 71 150 L90 145 L110 160 L130 145 L149 150 Q167 156 167 176 L171 300 H49 Z"
                fill="#1a0a00" stroke="${char.color}" stroke-width="1.5" stroke-opacity="0.4"/>
          <!-- Notepad -->
          <rect x="130" y="165" width="20" height="26" rx="2" fill="#f0f0e0" opacity="0.8"/>
          <line x1="133" y1="172" x2="147" y2="172" stroke="#888" stroke-width="1"/>
          <line x1="133" y1="176" x2="147" y2="176" stroke="#888" stroke-width="1"/>
          <line x1="133" y1="180" x2="147" y2="180" stroke="#888" stroke-width="1"/>
          <!-- Pen -->
          <rect x="147" y="163" width="3" height="18" rx="1" fill="${char.color}" opacity="0.8"/>
          <!-- Collar -->
          <path d="M98 148 L110 160 L122 148 L116 138 L110 148 L104 138 Z" fill="${char.color}" opacity="0.35"/>
          <!-- Neck -->
          <rect x="102" y="126" width="16" height="18" rx="3" fill="${char.accent}" opacity="0.7"/>
          <!-- Head (alert, pointed features) -->
          <ellipse cx="110" cy="92" rx="30" ry="34" fill="${char.accent}" opacity="0.87"/>
          <!-- Dark straight hair -->
          <path d="M80 84 Q80 58 110 56 Q140 58 140 84" fill="#0a0a14" opacity="0.9"/>
          <path d="M140 72 Q140 56 132 52" stroke="#0a0a14" stroke-width="2" stroke-linecap="round"/>
          <!-- Sharp eyes behind glasses -->
          <ellipse cx="97" cy="91" rx="5.5" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <ellipse cx="123" cy="91" rx="5.5" ry="5" fill="#0d0f1a" opacity="0.9"/>
          <circle cx="99" cy="90" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="125" cy="90" r="1.5" fill="white" opacity="0.8"/>
          <!-- Glasses frames -->
          <rect x="88" y="84" width="24" height="16" rx="6" fill="none" stroke="${char.color}" stroke-width="1.5" opacity="0.7"/>
          <rect x="108" y="84" width="24" height="16" rx="6" fill="none" stroke="${char.color}" stroke-width="1.5" opacity="0.7"/>
          <line x1="112" y1="91" x2="108" y2="91" stroke="${char.color}" stroke-width="1.5" opacity="0.7"/>
          <!-- Raised eyebrow (skeptical) -->
          <path d="M90 82 Q97 79 103 82" stroke="#0a0a14" stroke-width="2" stroke-linecap="round"/>
          <path d="M117 80 Q124 78 130 82" stroke="#0a0a14" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Pursed questioning mouth -->
          <path d="M100 112 Q110 117 120 112" stroke="#0a0a14" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>`,
    };

    return portraits[characterId] || `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"></svg>`;
  }

  function get(characterId) {
    return data[characterId] || { name: '', title: '', color: '#888', accent: '#aaa' };
  }

  return { buildPortrait, get };

})();
