# The Gaffer — Soccer Story Game: Full Design Document

## Overview
A mobile-first, browser-based visual novel soccer management game. The player takes the role of a soccer manager at FC Valhalla for one full fictional season. Story-heavy with simplified management decisions that branch dramatically.

**Platform:** Pure HTML/CSS/JS, no build tools, GitHub Pages  
**Art style:** Visual novel — character portraits, dialogue boxes, choice cards  
**Scope:** Full season MVP (~45 min playthrough, multiple endings)

---

## 1. Game World & Fiction

| Element | Name |
|---------|------|
| Country | Valorian Republic |
| League | Valorian Premier League (VPL, 18 teams) |
| Player's Club | FC Valhalla — mid-table, ambitious chairman |
| Local Cup | Valorian FA Cup |
| European Competition | Champions Cup |
| Global Competition | World Club Championship |

### Key Characters

| ID | Name | Role | Personality |
|----|------|------|-------------|
| `chairman` | Paulo Ferretti | Club Chairman | Ambitious, impatient, threatens sacking |
| `assistant` | Lena Brandt | Assistant Coach | Loyal, gives player hints/advice |
| `star` | Marco "El Tornado" Silva | Star Forward | Brilliant but volatile, key story pivot |
| `veteran` | Roberto Okafor | Team Captain candidate | Wise, stabilizing, fading fitness |
| `prodigy` | Kai Voss | Youth Prodigy | Raw talent, only unlocked via youth investment |
| `rival` | Ivan Sorokin | Rival Manager | Antagonist, psyches out the player |
| `journalist` | Alexandra Chen | Sports Reporter | Asks hard questions at press conferences |

---

## 2. Story System

### Story State
All flags and meters stored in `GameState.story`:

```
Meters (0–100):
  teamMorale         — squad happiness and cohesion
  boardConfidence    — chairman's faith in the manager
  mediaRep           — public and press standing
  starHappiness      — Marco Silva's satisfaction
  youthInvestment    — cumulative investment in the academy

Style branch (set in pre-season):
  managerStyle: "visionary" | "pragmatist" | "champion"

Key boolean flags:
  captainChosen, captainId
  starSold, starInjured
  rivalityEscalated
  boardCrisisTrigger
  prodigyPromoted
  pressConflict
  staffCrisis
  fanEventDone
  walkoutThreat
  resignedChoice
```

### Three Manager Style Branches
Set permanently in pre-season by the player's first major decision.

- **Visionary** — Youth focus, innovative tactics. Board pressure if results are slow. Prodigy storyline unlocked when `youthInvestment ≥ 50`.
- **Pragmatist** — Buy experienced veterans. Ego management becomes central. Star player conflict arc drives mid-season drama.
- **People's Champion** — Culture and fan connection first. Board patience is the primary tension. Community arc unlocked.

Each branch unlocks ~10 unique scenes and alters dialogue in shared scenes.

### Seven Possible Endings
Evaluated at the end of the season based on accumulated flags and meters.

| # | Ending | Condition |
|---|--------|-----------|
| 1 | **Glory Season** | `boardConfidence ≥ 80` AND `teamMorale ≥ 80` AND win all 3 competitions |
| 2 | **League Champion** | Win VPL, lose cups, `boardConfidence ≥ 70` |
| 3 | **Underdog Cup** | Lose VPL, win FA Cup, `teamMorale ≥ 70` |
| 4 | **Sacked Mid-Season** | `boardConfidence ≤ 20` (triggers during season, ends run early) |
| 5 | **Walk Away** | `resignedChoice = true` |
| 6 | **Youth Revolution** | `prodigyPromoted = true` AND `youthInvestment ≥ 70`, mid-table finish |
| 7 | **Legendary Failure** | Lose everything, `teamMorale ≥ 60` (cult hero status) |

---

## 3. Season Calendar Structure

~80 events total, ordered sequentially. Events are objects of types: `story`, `decision`, `match`, `minigame`.

```
Pre-Season (Events 1–15)
  - Manager intro scene
  - Meet Lena, Paulo, Marco, Roberto
  - Style branch decision ← KEY FORK (visionary / pragmatist / champion)
  - Pre-season tour selection
  - Budget allocation
  - Captain selection
  - First lineup + training setup

League Phase (Events 16–55)
  - Weeks 5–30
  - Match result event every 3–4 events
  - Press interview every 5 events
  - Crisis events triggered by flag conditions (injury, discipline, board meeting)

Cup Phase (Events 35–65, concurrent)
  - Valorian FA Cup: 4 rounds (R1, QF, SF, Final)
  - Champions Cup: Group stage (3 matches) + KO rounds (QF, SF, Final)

World Championship (Events 70–80)
  - Group stage + Final
  - Ending flag evaluation

Season End (Event 80)
  - Flags evaluated → one of 7 ending scenes plays
```

---

## 4. The 25 Mini-Decision Types

| # | Type ID | Screen | Description |
|---|---------|--------|-------------|
| 1 | `lineup` | Lineup Screen | Pick 11 from squad, set formation |
| 2 | `training` | Training Screen | Set weekly focus: fitness / tactics / morale / set-pieces |
| 3 | `transfer` | Transfer Market | Buy/sell player cards within budget |
| 4 | `youth-pickup` | Story Scene | Choose to promote a youth player or pass |
| 5 | `board-meeting` | Decision Panel | Respond to chairman's demands (4 choices) |
| 6 | `press-interview` | Decision Panel | Choose how to answer journalist's question |
| 7 | `tactics` | Decision Panel | Formation + style for a key match |
| 8 | `captain` | Decision Panel | Choose team captain |
| 9 | `injury` | Decision Panel | Rush player back / rest / call youth |
| 10 | `locker-room` | Decision Panel | Pre-match team talk style |
| 11 | `halftime` | Decision Panel | Tactical change at half-time |
| 12 | `contract` | Decision Panel | Renew / let go / negotiate |
| 13 | `deadline` | Decision Panel | Last-minute transfer window decision under pressure |
| 14 | `discipline` | Decision Panel | Player misbehaves — fine / suspend / forgive |
| 15 | `scouting` | Decision Panel | Which region to scout (affects future player pool) |
| 16 | `budget` | Decision Panel | Allocate budget: facilities / signings / staff |
| 17 | `rotation` | Decision Panel | Rest key players vs. push them to the limit |
| 18 | `fan-event` | Story Scene | Community event: attend / skip / send youth players |
| 19 | `callup` | Decision Panel | Release player for international duty or resist |
| 20 | `crisis` | Decision Panel | Handle scandal or rumor (media or board) |
| 21 | `staff` | Decision Panel | Hire assistant / physio / sports psychologist |
| 22 | `mentorship` | Decision Panel | Pair veteran with a young player |
| 23 | `conflict` | Decision Panel | Resolve dispute between two players |
| 24 | `tour` | Decision Panel | Pre-season tour location: Europe / Asia / Americas |
| 25 | `post-match` | Decision Panel | Public reaction after a key result |

---

## 5. File Structure

```
soccer-story-game/
├── index.html              # Shell: imports all scripts/css, mounts game root div
├── css/
│   ├── style.css           # CSS variables, base styles, mobile layout
│   ├── screens.css         # Per-screen styles (hub, scene, decision, match, etc.)
│   └── animations.css      # Transitions, fade-in, slide-up, typewriter effect
├── js/
│   ├── utils.js            # Helpers: clamp(), randomBetween(), mergeFlags()
│   ├── state.js            # GameState object + save/load via localStorage
│   ├── characters.js       # Character portrait CSS/SVG strings keyed by character ID
│   ├── story-data.js       # All scenes, events, characters as JS data objects
│   ├── engine.js           # Scene runner: advance(), applyChoice(), resolveNext()
│   └── screens/
│       ├── hub.js          # Hub dashboard render + meter bar bindings
│       ├── scene.js        # Visual novel scene renderer (portrait + dialogue)
│       ├── decision.js     # Decision panel renderer (choice cards)
│       ├── match.js        # Match result animator (score reveal + narration)
│       ├── lineup.js       # Lineup selection screen
│       ├── training.js     # Training focus screen
│       ├── transfer.js     # Transfer market screen
│       └── calendar.js     # Season calendar timeline view
└── assets/
    └── (none required — all visuals are CSS/SVG)
```

**JS architecture:** All files use IIFE + global namespace pattern (no ES modules, no bundler).  
Load order in `index.html`: `utils → state → characters → story-data → screens/* → engine → hub`

```js
window.Game = window.Game || {};
window.Game.Engine = (function() {
  // ...
  return { advance, applyChoice };
})();
```

---

## 6. Data Schemas

### Story Scene
```js
{
  id: "preseason_intro",
  type: "story",                    // "story" | "decision" | "match" | "minigame"
  background: "stadium-dawn",       // CSS background class
  character: "assistant",           // character ID → renders portrait
  name: "Lena Brandt",
  dialogue: [
    "Welcome to Valhalla, Gaffer.",
    "I know it's your first day. The squad is waiting."
  ],
  next: "preseason_meet_paulo",     // next scene ID
  condition: null,                  // optional conditional branch (see below)
}
```

### Decision Scene
```js
{
  id: "captain_choice",
  type: "decision",
  prompt: "The squad needs a captain. Who do you choose?",
  character: "assistant",
  choices: [
    {
      label: "Marco Silva",
      hint: "He'll play with fire. High risk, high reward.",
      effects: { captainId: "star", captainChosen: true, starHappiness: +15, teamMorale: +5 },
      next: "captain_marco_reaction"
    },
    {
      label: "Roberto Okafor",
      hint: "The safe choice. He'll steady the ship.",
      effects: { captainId: "veteran", captainChosen: true, teamMorale: +10, boardConfidence: +5 },
      next: "captain_roberto_reaction"
    },
    {
      label: "Let the team vote",
      hint: "Morale boost, but you lose control of the narrative.",
      effects: { captainId: "vote", captainChosen: true, teamMorale: +15, boardConfidence: -5 },
      next: "captain_vote_reaction"
    }
  ]
}
```

### Conditional Branch
```js
condition: {
  check: () => GameState.story.managerStyle === "visionary",
  thenScene: "visionary_board_arc_start",
  elseScene: "standard_board_meeting"
}
```

### Match Event
```js
{
  id: "match_league_week3",
  type: "match",
  competition: "VPL",
  opponent: "Ironclad United",
  homeAway: "home",
  outcomeFunction: "calcLeagueMatch",
  next: "post_match_week3_press"
}
```

---

## 7. Game State Object

```js
const GameState = {
  meta: {
    version: 1,
    managerName: "The Gaffer",
    savedAt: null,
  },
  progress: {
    currentEventIndex: 0,
    currentSceneId: "main_menu",
    seasonWeek: 0,
    phase: "preseason",   // "preseason" | "league" | "cups" | "worlds" | "end"
  },
  results: {
    vplWins: 0, vplDraws: 0, vplLosses: 0,
    vplPosition: 9,
    cupResult: null,          // null | "eliminated" | "winner"
    championsResult: null,
    worldResult: null,
  },
  squad: [],                  // array of player objects
  lineup: [],                 // 11 player IDs
  formation: "4-3-3",
  trainingFocus: "fitness",
  budget: 10,                 // millions
  story: {
    teamMorale: 50,
    boardConfidence: 60,
    mediaRep: 50,
    starHappiness: 50,
    youthInvestment: 0,
    managerStyle: null,
    captainChosen: false,
    captainId: null,
    starSold: false,
    starInjured: false,
    rivalityEscalated: false,
    boardCrisisTrigger: false,
    prodigyPromoted: false,
    pressConflict: false,
    staffCrisis: false,
    fanEventDone: false,
    walkoutThreat: false,
    resignedChoice: false,
  }
};
```

**LocalStorage persistence:** Save on every event advance. Load on init with version check.

---

## 8. Scene Engine

```js
// engine.js

function advance(sceneId) {
  const scene = StoryData.scenes[sceneId];
  GameState.progress.currentSceneId = sceneId;
  switch (scene.type) {
    case "story":    Screens.Scene.render(scene); break;
    case "decision": Screens.Decision.render(scene); break;
    case "match":    Screens.Match.render(scene); break;
    case "minigame": renderMiniGame(scene.miniGameType); break;
  }
  saveGame();
}

function applyChoice(choice) {
  applyEffects(choice.effects || {});
  checkEndConditions();     // triggers early sacking if boardConfidence ≤ 20
  const nextId = resolveNext(choice.next, choice.condition);
  advance(nextId);
}

function resolveNext(nextId, condition) {
  if (!condition) return nextId;
  return condition.check() ? condition.thenScene : condition.elseScene;
}

// Effects: numbers = meter deltas (clamped 0–100), others = direct flag sets
function applyEffects(effects) {
  const s = GameState.story;
  Object.keys(effects).forEach(key => {
    const val = effects[key];
    if (typeof val === 'number' && typeof s[key] === 'number') {
      s[key] = clamp(s[key] + val, 0, 100);
    } else {
      s[key] = val;
    }
  });
}
```

---

## 9. Match Result System

Outcomes are deterministic with a small random variance — not pure RNG.

```
Score = (teamMorale × 0.4) + (boardConfidence × 0.3) + formationFit × 0.15 + trainingBonus × 0.15
Score > 0.65  → win
Score 0.40–0.65 → draw
Score < 0.40  → loss
+ ±10% random variance
```

Match screen shows: animated scoreboard → 2–3 key moment narration lines → "Continue" button.

---

## 10. Visual Design System

```css
:root {
  /* Dark stadium atmosphere palette */
  --bg-primary:   #0d0f1a;
  --bg-card:      #1a1d2e;
  --bg-scene:     #12141f;
  --accent-gold:  #f5c842;
  --accent-green: #3ddc84;
  --accent-red:   #e05555;
  --text-primary: #f0f0f0;
  --text-muted:   #888aaa;
  --border:       rgba(255,255,255,0.08);

  --font-display: 'Georgia', serif;
  --font-body:    system-ui, -apple-system, sans-serif;

  --safe-bottom:  env(safe-area-inset-bottom, 16px);
  --screen-max:   430px;
  --tap-min:      44px;     /* minimum touch target */
}
```

**Backgrounds:** CSS gradients only (no image files).
```css
.bg-stadium-dawn  { background: linear-gradient(180deg, #1a0a3d 0%, #3d1a00 60%, #0d0f1a 100%); }
.bg-locker-room   { background: linear-gradient(135deg, #1a1d2e 0%, #0d1a12 100%); }
.bg-press-room    { background: linear-gradient(180deg, #0a0a14 0%, #1a1400 100%); }
.bg-pitch         { background: linear-gradient(180deg, #0a1a0a 0%, #0d3d0a 50%, #0a1a0a 100%); }
```

**Character portraits:** CSS silhouette art (styled `<div>` elements) — zero external image dependencies.

---

## 11. Screens

| Screen | Purpose |
|--------|---------|
| **Main Menu** | Title, Start / Continue / Credits |
| **Hub Dashboard** | Always shown between events: week, league position, 4 meter bars, upcoming match, "Continue" |
| **Story Scene** | Full-screen: background, character portrait, name label, dialogue box (tap to advance) |
| **Decision Panel** | 2–4 choice cards with label + consequence hint |
| **Match Result** | Animated score reveal + 2–3 key moment lines |
| **Lineup Screen** | Squad list, tap to set 11 starters + formation grid |
| **Training Screen** | 4 focus options with effect previews |
| **Transfer Market** | Player cards with stats, buy/sell with budget |
| **Season Calendar** | Scrollable timeline of upcoming events |

**Hub data bindings:**
```js
document.getElementById('week').textContent = `Week ${GameState.progress.seasonWeek}`;
document.getElementById('morale-bar').style.width = `${GameState.story.teamMorale}%`;
// etc.
```

---

## 12. Implementation Phases

| Phase | Focus | Key Deliverables |
|-------|-------|-----------------|
| 1 | Foundation | `index.html`, CSS design system, `state.js`, `engine.js`, `utils.js` |
| 2 | Story Engine | `scene.js`, `decision.js`, tap-to-advance, flag application |
| 3 | Hub + Calendar | `hub.js`, `calendar.js`, all meter bars |
| 4 | Mini-game Screens | `lineup.js`, `training.js`, `transfer.js`, `match.js` |
| 5 | Story Content | All ~80 events in `story-data.js`, 3 branches, 7 endings |
| 6 | Characters + Polish | `characters.js` (CSS portraits), transition animations, typewriter effect |
| 7 | Test + Deploy | Walk all 7 endings, mobile testing, GitHub Pages deploy |

---

## 13. Testing Strategy

- Open `index.html` directly in browser (no build step) or `python -m http.server`
- **Debug overlay:** triple-tap anywhere to show all flags + meter values (hidden in production)
- **StoryWalker utility:** `StoryWalker.goto("ending_glory")` in browser console fast-forwards to any scene
- Test all 3 manager style branches manually
- Verify all 25 decision types render and apply effects correctly
- Confirm all 7 endings are reachable
- Test on 375px viewport (iOS Safari + Android Chrome)
- Verify localStorage save/load persists across page refresh

---

## 14. Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| `story-data.js` becomes unmanageable | Group scenes into named objects by arc (preseason, leagueArc, crisisArc, endings) |
| Flags drift → unintended endings | Debug overlay shows full state; write unit tests for ending conditions |
| Mobile scroll/viewport glitches | Use `100dvh`, `safe-area-inset-*`, lock body scroll on scene screens |
| Touch vs click event conflicts | Use `touchend` + `preventDefault()` as primary; fall back to `click` |
| Save corruption | Wrap `JSON.parse` in try/catch; include schema version in save |
| Branches untestable end-to-end | `StoryWalker` utility can set any flag state and jump to any scene |
