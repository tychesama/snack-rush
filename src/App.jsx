import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

const GAME_WIDTH = 980;
const GAME_HEIGHT = 560;
const BASKET_WIDTH = 108;
const BASKET_HEIGHT = 58;
const ITEM_SIZE = 44;
const ITEM_HITBOX_INSET_X = 7;
const ITEM_HITBOX_TOP_INSET = 6;
const ITEM_HITBOX_BOTTOM_INSET = 7;
const GAME_SECONDS = 45;
const STARTING_LIVES = 3;
const PLAYER_SPEED = 520;
const SPEEDUP_MULTIPLIER = 1.65;
const ABILITY_DURATION = 5;
const ABILITY_COOLDOWN = 10;
const BASKET_BOTTOM_OFFSET = 18;
const CATCH_ZONE_INSET_X = 5;
const CATCH_ZONE_WIDTH = BASKET_WIDTH - CATCH_ZONE_INSET_X * 2;
const CATCH_ZONE_HEIGHT = 22;
const CATCH_ZONE_OFFSET_X = CATCH_ZONE_INSET_X;
const CATCH_ZONE_OFFSET_Y = 1;
const CATCH_ZONE_TOP = GAME_HEIGHT - BASKET_BOTTOM_OFFSET - BASKET_HEIGHT + CATCH_ZONE_OFFSET_Y;
const CATCH_ZONE_BOTTOM = CATCH_ZONE_TOP + CATCH_ZONE_HEIGHT;
const MAX_FALL_DRIFT = 28;
const DEBUG_HITBOXES = false;

const GOOD_SNACKS = ['🍩', '🧁', '🍪', '🍭', '🍫', '🍬', '🥨', '🍿'];
const BAD_SNACKS = ['☠️', '🤮', '🦠', '💀'];
const POWER_SNACKS = ['⭐', '💎'];
const CONFETTI_COLORS = ['#ff2f91', '#ffb000', '#31d6ff', '#7a2ee8', '#69ff9f', '#fff46b'];
const LEADERBOARD_KEY = 'snackrush-local-leaderboard-v1';
const LEADERBOARD_LIMIT = 5;
const DEFAULT_LEADERBOARD = [
  { id: 'default-1', name: 'Tyche', score: 520, caught: 38, tag: 'Candy Queen' },
  { id: 'default-2', name: 'Gummy Goblin', score: 430, caught: 32, tag: 'Sticky Fingers' },
  { id: 'default-3', name: 'Donut Dash', score: 320, caught: 25, tag: 'Glaze Blazer' },
  { id: 'default-4', name: 'Cookie Kid', score: 235, caught: 19, tag: 'Crumb Runner' },
  { id: 'default-5', name: 'Rookie Rush', score: 145, caught: 12, tag: 'First Bite' },
];

const freshItem = (id) => {
  const roll = Math.random();
  const type = roll > 0.84 ? 'rotten' : roll > 0.76 ? 'bonus' : 'snack';
  const emoji =
    type === 'rotten'
      ? BAD_SNACKS[Math.floor(Math.random() * BAD_SNACKS.length)]
      : type === 'bonus'
        ? POWER_SNACKS[Math.floor(Math.random() * POWER_SNACKS.length)]
        : GOOD_SNACKS[Math.floor(Math.random() * GOOD_SNACKS.length)];

  return {
    id,
    type,
    emoji,
    x: 28 + Math.random() * (GAME_WIDTH - ITEM_SIZE - 56),
    y: -ITEM_SIZE,
    vx: (Math.random() - 0.5) * MAX_FALL_DRIFT * 2,
    speed: type === 'rotten' ? 145 + Math.random() * 145 : 185 + Math.random() * 180,
    spin: Math.random() > 0.5 ? 'spinA' : 'spinB',
  };
};

const makeConfettiBurst = (x, y, startId) =>
  Array.from({ length: 12 }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const distance = 36 + Math.random() * 58;

    return {
      id: startId + index,
      x,
      y,
      age: 0,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 18,
      spin: (Math.random() - 0.5) * 360,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    };
  });

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sortLeaderboard(entries) {
  const uniqueEntries = new Map();

  for (const entry of entries) {
    if (!Number.isFinite(entry.score)) continue;
    const existing = uniqueEntries.get(entry.id);
    if (!existing || entry.score > existing.score || (entry.score === existing.score && entry.caught > existing.caught)) {
      uniqueEntries.set(entry.id, entry);
    }
  }

  return [...uniqueEntries.values()]
    .sort((a, b) => b.score - a.score || b.caught - a.caught)
    .slice(0, LEADERBOARD_LIMIT);
}

function normalizeLeaderboardEntry(entry, fallbackIndex = 0) {
  return {
    id: String(entry.id || `local-${fallbackIndex}`),
    name: String(entry.name || 'Mystery Muncher').slice(0, 18),
    score: Math.max(0, Math.floor(Number(entry.score) || 0)),
    caught: Math.max(0, Math.floor(Number(entry.caught) || 0)),
    tag: String(entry.tag || 'Local Hero').slice(0, 24),
    isPlayer: Boolean(entry.isPlayer),
  };
}

function loadLeaderboard() {
  if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;

  try {
    const saved = JSON.parse(window.localStorage.getItem(LEADERBOARD_KEY) || '[]');
    const savedEntries = Array.isArray(saved) ? saved.map(normalizeLeaderboardEntry) : [];
    return sortLeaderboard([...savedEntries, ...DEFAULT_LEADERBOARD]);
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

function saveLeaderboard(entries) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function addLeaderboardScore(stats, currentEntries) {
  const entryId = `player-${Date.now()}`;
  const playerEntry = {
    id: entryId,
    name: 'You',
    score: Math.max(0, Math.floor(stats.score || 0)),
    caught: Math.max(0, Math.floor(stats.caught || 0)),
    tag: stats.score >= DEFAULT_LEADERBOARD[0].score ? 'Top Snack Boss' : 'Local Challenger',
    isPlayer: true,
  };
  const leaderboard = sortLeaderboard([...currentEntries, playerEntry]);
  const rank = leaderboard.findIndex((entry) => entry.id === entryId);
  saveLeaderboard(leaderboard);

  return { leaderboard, rank: rank === -1 ? null : rank + 1 };
}

function getCatchZone(basketX) {
  return {
    left: basketX + CATCH_ZONE_OFFSET_X,
    right: basketX + CATCH_ZONE_OFFSET_X + CATCH_ZONE_WIDTH,
    top: CATCH_ZONE_TOP,
    bottom: CATCH_ZONE_BOTTOM,
  };
}

function getSweptCatchZone(basketX, previousBasketX = basketX) {
  const current = getCatchZone(basketX);
  const previous = getCatchZone(previousBasketX);

  return {
    left: Math.min(current.left, previous.left),
    right: Math.max(current.right, previous.right),
    top: current.top,
    bottom: current.bottom,
  };
}

function getItemHitbox(item) {
  return {
    left: item.x + ITEM_HITBOX_INSET_X,
    right: item.x + ITEM_SIZE - ITEM_HITBOX_INSET_X,
    top: item.y + ITEM_HITBOX_TOP_INSET,
    bottom: item.y + ITEM_SIZE - ITEM_HITBOX_BOTTOM_INSET,
  };
}

function getSweptItemHitbox(item, updated) {
  const previous = getItemHitbox(item);
  const current = getItemHitbox(updated);

  return {
    left: Math.min(previous.left, current.left),
    right: Math.max(previous.right, current.right),
    top: Math.min(previous.top, current.top),
    bottom: Math.max(previous.bottom, current.bottom),
  };
}

function basketCatchesItem(item, updated, basketX, previousBasketX = basketX) {
  const catchZone = getSweptCatchZone(basketX, previousBasketX);
  const itemHitbox = getSweptItemHitbox(item, updated);

  const horizontallyTouchesCatchZone = itemHitbox.right >= catchZone.left && itemHitbox.left <= catchZone.right;
  const verticallyTouchesCatchZone = itemHitbox.bottom >= catchZone.top && itemHitbox.top <= catchZone.bottom;

  return horizontallyTouchesCatchZone && verticallyTouchesCatchZone;
}

function App() {
  const [screen, setScreen] = useState('start');
  const [gameKey, setGameKey] = useState(0);
  const [leaderboard, setLeaderboard] = useState(loadLeaderboard);
  const [finalStats, setFinalStats] = useState({ score: 0, caught: 0, reason: 'Ready?', leaderboard, leaderboardRank: null });

  const startGame = () => {
    setGameKey((key) => key + 1);
    setScreen('playing');
  };
  const showMainMenu = () => setScreen('start');
  const endGame = (stats) => {
    const result = addLeaderboardScore(stats, leaderboard);
    setLeaderboard(result.leaderboard);
    setFinalStats({ ...stats, leaderboard: result.leaderboard, leaderboardRank: result.rank });
    setScreen('gameover');
  };

  return (
    <main className="app-shell">
      <div className="candy-cloud cloud-one">🍬</div>
      <div className="candy-cloud cloud-two">🍭</div>
      <div className="candy-cloud cloud-three">🍩</div>

      {screen === 'start' && <StartScreen onStart={startGame} leaderboard={leaderboard} />}
      {screen === 'playing' && <GameBoard key={gameKey} onGameOver={endGame} onMainMenu={showMainMenu} onRestart={startGame} />}
      {screen === 'gameover' && <GameOverScreen stats={finalStats} leaderboard={leaderboard} onRestart={startGame} onMainMenu={showMainMenu} />}
    </main>
  );
}

function StartScreen({ onStart, leaderboard }) {
  return (
    <section className="panel start-panel pop-panel">
      <div className="menu-sparkle sparkle-left" aria-hidden="true">✦</div>
      <div className="menu-sparkle sparkle-right" aria-hidden="true">✦</div>
      <p className="eyebrow hero-eyebrow">TYCHE CANDY SHOP PRESENTS</p>
      <div className="title-stack" aria-label="SnackRush">
        <span className="title-candy" aria-hidden="true">🍬</span>
        <h1>SnackRush</h1>
        <span className="title-candy" aria-hidden="true">🍭</span>
      </div>
      <p className="tagline hero-tagline">Catch the sweet stuff. Power through suspicious snacks. Survive the candy shop chaos!</p>
      <div className="snack-marquee" aria-hidden="true">
        <span>🍩</span><span>🍪</span><span>🍭</span><span>⭐</span><span>☠️</span><span>🤮</span>
      </div>
      <div className="menu-layout">
        <div className="how-to-play menu-card-grid">
          <div><strong>Move</strong><span>← → or A / D</span></div>
          <div><strong>Pause</strong><span>Esc opens the snack menu</span></div>
          <div><strong>Boost</strong><span>Z — 5s speed burst</span></div>
          <div><strong>Invincibility</strong><span>X — 5s safety shield</span></div>
          <div><strong>Catch</strong><span>🍩 🍪 🍭 ⭐</span></div>
          <div><strong>Avoid</strong><span>☠️ 🤮 🦠 💀 bad food</span></div>
        </div>
        <Leaderboard entries={leaderboard} title="Local leaderboard" subtitle={`Beat ${leaderboard[0]?.name || 'Tyche'} at ${leaderboard[0]?.score || 0}!`} />
      </div>
      <button className="primary-button jumbo-button" onClick={onStart}>Start Rush!</button>
    </section>
  );
}

function GameBoard({ onGameOver, onMainMenu, onRestart }) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [snapshot, setSnapshot] = useState({
    basketX: GAME_WIDTH / 2 - BASKET_WIDTH / 2,
    items: [],
    score: 0,
    lives: STARTING_LIVES,
    timeLeft: GAME_SECONDS,
    caught: 0,
    combo: 0,
    flash: '',
    evading: false,
    speeding: false,
    movementDirection: 0,
    confetti: [],
    dodgeActive: false,
    dodgeRemaining: 0,
    dodgeCooldown: 0,
    speedActive: false,
    speedRemaining: 0,
    speedCooldown: 0,
  });

  const stateRef = useRef({
    basketX: GAME_WIDTH / 2 - BASKET_WIDTH / 2,
    items: [],
    score: 0,
    lives: STARTING_LIVES,
    timeLeft: GAME_SECONDS,
    caught: 0,
    combo: 0,
    flash: '',
    evading: false,
    speeding: false,
    movementDirection: 0,
    confetti: [],
    dodgeActive: false,
    dodgeRemaining: 0,
    dodgeCooldown: 0,
    speedActive: false,
    speedRemaining: 0,
    speedCooldown: 0,
    failReason: '',
    elapsed: 0,
    spawnClock: 0,
    nextId: 1,
    nextConfettiId: 1,
    running: true,
  });
  const keysRef = useRef({ left: false, right: false });
  const pauseOpenRef = useRef(false);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(null);
  const snapshotClockRef = useRef(0);
  const setPauseMenu = useCallback((open) => {
    pauseOpenRef.current = open;
    if (open) keysRef.current = { left: false, right: false };
    setPauseOpen(open);
  }, []);

  const finishGame = useCallback((reason) => {
    const state = stateRef.current;
    if (!state.running) return;
    setPauseMenu(false);
    state.running = false;
    cancelAnimationFrame(animationRef.current);
    onGameOver({ score: state.score, caught: state.caught, reason });
  }, [onGameOver, setPauseMenu]);

  const restartFromPause = useCallback(() => {
    stateRef.current.running = false;
    cancelAnimationFrame(animationRef.current);
    setPauseMenu(false);
    onRestart();
  }, [onRestart, setPauseMenu]);

  const mainMenuFromPause = useCallback(() => {
    stateRef.current.running = false;
    cancelAnimationFrame(animationRef.current);
    setPauseMenu(false);
    onMainMenu();
  }, [onMainMenu, setPauseMenu]);

  useEffect(() => {
    const activateAbility = (ability) => {
      const state = stateRef.current;
      const activeKey = `${ability}Active`;
      const remainingKey = `${ability}Remaining`;
      const cooldownKey = `${ability}Cooldown`;

      if (state[activeKey] || state[cooldownKey] > 0) return;
      state[activeKey] = true;
      state[remainingKey] = ABILITY_DURATION;
    };

    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isControlKey = event.key === 'Escape' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || key === 'a' || key === 'd' || key === 'x' || key === 'z';
      if (isControlKey) event.preventDefault();

      if (event.key === 'Escape') {
        if (event.repeat) return;
        setPauseMenu(!pauseOpenRef.current);
        return;
      }

      if (pauseOpenRef.current) return;

      if (event.key === 'ArrowLeft' || key === 'a') keysRef.current.left = true;
      if (event.key === 'ArrowRight' || key === 'd') keysRef.current.right = true;
      if (event.repeat) return;
      if (key === 'x') activateAbility('dodge');
      if (key === 'z') activateAbility('speed');
    };
    const onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      if (event.key === 'ArrowLeft' || key === 'a') keysRef.current.left = false;
      if (event.key === 'ArrowRight' || key === 'd') keysRef.current.right = false;
    };
    const onBlur = () => {
      keysRef.current = { left: false, right: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [setPauseMenu]);

  useEffect(() => {
    stateRef.current.running = true;
    lastTimeRef.current = null;
    snapshotClockRef.current = 0;

    const tick = (time) => {
      const state = stateRef.current;
      if (!state.running) return;

      if (pauseOpenRef.current) {
        lastTimeRef.current = time;
        state.movementDirection = 0;
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.035);
      lastTimeRef.current = time;
      state.elapsed += delta;
      state.timeLeft = Math.max(0, GAME_SECONDS - state.elapsed);

      const direction = Number(keysRef.current.right) - Number(keysRef.current.left);

      if (state.dodgeActive) {
        state.dodgeRemaining = Math.max(0, state.dodgeRemaining - delta);
        if (state.dodgeRemaining === 0) {
          state.dodgeActive = false;
          state.dodgeCooldown = ABILITY_COOLDOWN;
        }
      } else if (state.dodgeCooldown > 0) {
        state.dodgeCooldown = Math.max(0, state.dodgeCooldown - delta);
      }

      if (state.speedActive) {
        state.speedRemaining = Math.max(0, state.speedRemaining - delta);
        if (state.speedRemaining === 0) {
          state.speedActive = false;
          state.speedCooldown = ABILITY_COOLDOWN;
        }
      } else if (state.speedCooldown > 0) {
        state.speedCooldown = Math.max(0, state.speedCooldown - delta);
      }

      state.evading = state.dodgeActive;
      state.speeding = state.speedActive;
      state.movementDirection = direction;
      const currentSpeed = PLAYER_SPEED * (state.speeding ? SPEEDUP_MULTIPLIER : 1);
      const previousBasketX = state.basketX;
      state.basketX = clamp(state.basketX + direction * currentSpeed * delta, 12, GAME_WIDTH - BASKET_WIDTH - 12);

      state.spawnClock -= delta;
      const spawnDelay = Math.max(0.28, 0.78 - state.elapsed * 0.01);
      if (state.spawnClock <= 0) {
        state.items.push(freshItem(state.nextId++));
        state.spawnClock = spawnDelay;
      }

      state.confetti = state.confetti
        .map((piece) => ({ ...piece, age: piece.age + delta }))
        .filter((piece) => piece.age < 0.75);

      const survivors = [];
      for (const item of state.items) {
        const updated = {
          ...item,
          x: item.x + item.vx * delta,
          y: item.y + item.speed * delta,
        };
        if (updated.x <= 12 || updated.x >= GAME_WIDTH - ITEM_SIZE - 12) {
          updated.x = clamp(updated.x, 12, GAME_WIDTH - ITEM_SIZE - 12);
          updated.vx = -updated.vx;
        }

        if (basketCatchesItem(item, updated, state.basketX, previousBasketX)) {
          if (updated.type === 'rotten') {
            if (state.dodgeActive) {
              survivors.push(updated);
              continue;
            }

            state.lives -= 1;
            state.combo = 0;
            state.flash = 'yuck';
            state.failReason = 'Rotten snacks ruined the rush!';
          } else {
            state.combo += 1;
            const basePoints = updated.type === 'bonus' ? 25 : 10;
            const comboBonus = Math.min(20, Math.floor(state.combo / 4) * 5);
            state.score += basePoints + comboBonus;
            state.caught += 1;
            state.flash = updated.type === 'bonus' ? 'bonus' : 'sweet';
            const burst = makeConfettiBurst(updated.x + ITEM_SIZE / 2, CATCH_ZONE_TOP + CATCH_ZONE_HEIGHT / 2, state.nextConfettiId);
            state.nextConfettiId += burst.length;
            state.confetti.push(...burst);
          }
          continue;
        }

        if (updated.y > GAME_HEIGHT) {
          continue;
        }

        survivors.push(updated);
      }
      state.items = survivors;

      if (state.lives <= 0) {
        finishGame(state.failReason || 'Your basket got too funky!');
        return;
      }
      if (state.timeLeft <= 0) {
        finishGame('Time is up!');
        return;
      }

      snapshotClockRef.current += delta;
      if (snapshotClockRef.current > 0.025) {
        snapshotClockRef.current = 0;
        setSnapshot({
          basketX: state.basketX,
          items: state.items,
          score: state.score,
          lives: state.lives,
          timeLeft: state.timeLeft,
          caught: state.caught,
          combo: state.combo,
          flash: state.flash,
          evading: state.evading,
          speeding: state.speeding,
          movementDirection: state.movementDirection,
          confetti: state.confetti,
          dodgeActive: state.dodgeActive,
          dodgeRemaining: state.dodgeRemaining,
          dodgeCooldown: state.dodgeCooldown,
          speedActive: state.speedActive,
          speedRemaining: state.speedRemaining,
          speedCooldown: state.speedCooldown,
        });
        if (state.flash) state.flash = '';
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      stateRef.current.running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [finishGame]);

  return (
    <section className={`game-wrap ${snapshot.flash} ${snapshot.evading ? 'evading' : ''} ${snapshot.speeding ? 'speeding' : ''} ${pauseOpen ? 'paused' : ''}`} aria-label="SnackRush game area">
      <Hud score={snapshot.score} timeLeft={snapshot.timeLeft} lives={snapshot.lives} combo={snapshot.combo} />
      <div className="game-board" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div className="shop-awning" />
        <div className="conveyor-label">SNACK STORM</div>
        {snapshot.items.map((item) => <FallingSnack key={item.id} item={item} />)}
        <ConfettiBurst pieces={snapshot.confetti} />
        <Basket x={snapshot.basketX} evading={snapshot.evading} speeding={snapshot.speeding} movementDirection={snapshot.movementDirection} />
        {DEBUG_HITBOXES && <DebugHitboxes items={snapshot.items} basketX={snapshot.basketX} />}
        {pauseOpen && (
          <PauseMenu
            onResume={() => setPauseMenu(false)}
            onRestart={restartFromPause}
            onEndGame={() => finishGame('Rush ended from pause menu!')}
            onMainMenu={mainMenuFromPause}
          />
        )}
      </div>
      <AbilityPanel
        dodgeActive={snapshot.dodgeActive}
        dodgeRemaining={snapshot.dodgeRemaining}
        dodgeCooldown={snapshot.dodgeCooldown}
        speedActive={snapshot.speedActive}
        speedRemaining={snapshot.speedRemaining}
        speedCooldown={snapshot.speedCooldown}
      />
    </section>
  );
}

function Hud({ score, timeLeft, lives, combo }) {
  const shownTime = Math.ceil(timeLeft);
  const timerMood = shownTime <= 5 ? 'timer-critical' : shownTime <= 10 ? 'timer-warning' : '';

  return (
    <div className="hud">
      <Stat label="Sugar Score" value={score.toString().padStart(4, '0')} />
      <Stat label="Rush Clock" value={`${shownTime}s`} className={`timer-card ${timerMood}`} pulseKey={shownTime} />
      <Stat label="Snack Hearts" value={'❤️'.repeat(Math.max(lives, 0)) || '💔'} />
      <Stat label="Combo Pop" value={combo > 1 ? `x${combo}` : '—'} />
    </div>
  );
}

function formatAbilityTime(seconds) {
  return `${Math.ceil(seconds)}s`;
}

function abilityStatus(active, remaining, cooldown) {
  if (active) return `Active ${formatAbilityTime(remaining)}`;
  if (cooldown > 0) return `Cooldown ${formatAbilityTime(cooldown)}`;
  return 'Ready';
}

function AbilityPanel({ dodgeActive, dodgeRemaining, dodgeCooldown, speedActive, speedRemaining, speedCooldown }) {
  return (
    <div className="ability-panel" aria-label="Ability cooldowns">
      <AbilityCard
        name="Boost"
        keyName="Z"
        detail="Faster basket movement"
        variant="boost"
        active={speedActive}
        cooldown={speedCooldown}
        value={abilityStatus(speedActive, speedRemaining, speedCooldown)}
      />
      <AbilityCard
        name="Invincibility"
        keyName="X"
        detail="Rotten food passes through; snacks still count"
        variant="invincibility"
        active={dodgeActive}
        cooldown={dodgeCooldown}
        value={abilityStatus(dodgeActive, dodgeRemaining, dodgeCooldown)}
      />
    </div>
  );
}

function AbilityCard({ name, keyName, detail, active, cooldown, value, variant }) {
  const statusClass = active ? 'active' : cooldown > 0 ? 'cooldown' : 'ready';

  return (
    <div className={`ability-card ${variant} ${statusClass}`}>
      <div>
        <span>{name}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <kbd>{keyName}</kbd>
    </div>
  );
}

function Stat({ label, value, className = '', pulseKey }) {
  return (
    <div className={`stat-card ${className}`}>
      <span>{label}</span>
      <strong key={pulseKey ?? value}>{value}</strong>
    </div>
  );
}

function PauseMenu({ onResume, onRestart, onEndGame, onMainMenu }) {
  return (
    <div className="pause-menu-overlay" role="dialog" aria-modal="true" aria-label="Paused game menu">
      <div className="pause-menu-card">
        <p className="eyebrow">Auto-paused</p>
        <h2>Snack Break</h2>
        <p>Esc pauses the rush. Pick a route before the snacks start falling again.</p>
        <div className="pause-menu-actions">
          <button className="pause-menu-button" onClick={onResume}>Resume Rush</button>
          <button className="pause-menu-button" onClick={onRestart}>Restart</button>
          <button className="pause-menu-button danger" onClick={onEndGame}>End Game</button>
          <button className="pause-menu-button secondary" onClick={onMainMenu}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

function DebugHitboxes({ items, basketX }) {
  const catchZone = getCatchZone(basketX);

  return (
    <div className="debug-hitbox-layer" aria-hidden="true">
      <div
        className="debug-hitbox basket-box"
        style={{ left: basketX, top: GAME_HEIGHT - BASKET_BOTTOM_OFFSET - BASKET_HEIGHT, width: BASKET_WIDTH, height: BASKET_HEIGHT }}
      />
      <div
        className="debug-hitbox catch-zone"
        style={{ left: catchZone.left, top: catchZone.top, width: catchZone.right - catchZone.left, height: catchZone.bottom - catchZone.top }}
      />
      {items.map((item) => {
        const hitbox = getItemHitbox(item);

        return (
          <Fragment key={`debug-${item.id}`}>
            <div className="debug-hitbox sprite-box" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE }} />
            <div
              className={`debug-hitbox item-hitbox ${item.type}`}
              style={{ left: hitbox.left, top: hitbox.top, width: hitbox.right - hitbox.left, height: hitbox.bottom - hitbox.top }}
            />
          </Fragment>
        );
      })}
    </div>
  );
}

function FallingSnack({ item }) {
  return (
    <div
      className={`falling-snack ${item.type} ${item.spin}`}
      style={{ transform: `translate(${item.x}px, ${item.y}px)` }}
      aria-hidden="true"
    >
      {item.emoji}
    </div>
  );
}

function ConfettiBurst({ pieces }) {
  return pieces.map((piece) => (
    <span
      key={piece.id}
      className="confetti-piece"
      style={{
        left: piece.x,
        top: piece.y,
        background: piece.color,
        '--dx': `${piece.dx}px`,
        '--dy': `${piece.dy}px`,
        '--spin': `${piece.spin}deg`,
      }}
      aria-hidden="true"
    />
  ));
}

function Basket({ x, evading, speeding, movementDirection }) {
  const movementClass = movementDirection < 0 ? 'moving-left' : movementDirection > 0 ? 'moving-right' : 'idle';

  return (
    <div className={`basket ${evading ? 'evading' : ''} ${speeding ? 'speeding' : ''} ${movementClass}`} style={{ transform: `translateX(${x}px)` }} aria-label="player basket">
      <div className="boost-wind wind-one" />
      <div className="boost-wind wind-two" />
      <div className="boost-spark spark-one" />
      <div className="boost-spark spark-two" />
      <div className="invincible-shield" />
      <div className="invincible-stars" />
      <div className="basket-shadow" />
      <div className="basket-rim"><span className="basket-emoji">😋</span></div>
      <div className="basket-body">
        <div className="basket-weave" />
      </div>
    </div>
  );
}

function Leaderboard({ entries, title = 'Leaderboard', subtitle = 'Local scores only', highlightRank = null }) {
  return (
    <aside className="leaderboard-card" aria-label={title}>
      <div className="leaderboard-header">
        <span className="leaderboard-crown" aria-hidden="true">🏆</span>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <ol className="leaderboard-list">
        {entries.map((entry, index) => (
          <li key={entry.id} className={`${entry.isPlayer ? 'player-score' : ''} ${highlightRank === index + 1 ? 'new-score' : ''}`}>
            <span className="leaderboard-rank">#{index + 1}</span>
            <span className="leaderboard-name">
              {entry.name}
              <small>{entry.tag}</small>
            </span>
            <span className="leaderboard-score">
              {entry.score}
              <small>{entry.caught} caught</small>
            </span>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function GameOverScreen({ stats, leaderboard, onRestart, onMainMenu }) {
  const title = stats.score >= 350 ? 'Sugar Legend!' : stats.score >= 180 ? 'Snack Champ!' : 'Rush Over!';
  const medal = stats.score >= 350 ? '🏆' : stats.score >= 180 ? '🎖️' : '🍬';
  const board = stats.leaderboard || leaderboard;
  const leaderboardSubtitle = stats.leaderboardRank
    ? `New local rank #${stats.leaderboardRank}!`
    : `Beat #1: ${board[0]?.score || 0} points`;

  return (
    <section className="panel gameover-panel pop-panel">
      <div className="menu-sparkle sparkle-left" aria-hidden="true">✦</div>
      <div className="menu-sparkle sparkle-right" aria-hidden="true">✦</div>
      <p className="eyebrow hero-eyebrow">{stats.reason}</p>
      <div className="result-badge" aria-hidden="true">{medal}</div>
      <h1 className="gameover-title">{title}</h1>
      <p className="tagline result-tagline">The candy counter is closed. Count your loot, dodge the stink, and rush again!</p>
      <div className="score-summary result-grid">
        <div>
          <span>Final Score</span>
          <strong>{stats.score}</strong>
        </div>
        <div>
          <span>Snacks Caught</span>
          <strong>{stats.caught}</strong>
        </div>
      </div>
      <Leaderboard entries={board} title="Local leaderboard" subtitle={leaderboardSubtitle} highlightRank={stats.leaderboardRank} />
      <div className="gameover-actions">
        <button className="primary-button jumbo-button" onClick={onRestart}>Play Again</button>
        <button className="secondary-button" onClick={onMainMenu}>Main Menu</button>
      </div>
    </section>
  );
}

export default App;
