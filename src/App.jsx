import { Fragment, useCallback, useEffect, useRef, useState } from 'react';

const GAME_WIDTH = 980;
const GAME_HEIGHT = 560;
const BASKET_WIDTH = 108;
const BASKET_HEIGHT = 54;
const ITEM_SIZE = 44;
const ITEM_HITBOX_INSET_X = 8;
const ITEM_HITBOX_TOP_INSET = 8;
const ITEM_HITBOX_BOTTOM_INSET = 8;
const GAME_SECONDS = 45;
const STARTING_LIVES = 3;
const PLAYER_SPEED = 520;
const GLOBAL_SKILL_COOLDOWN = 7;
const DASH_DURATION = 0.18;
const DASH_SPEED_MULTIPLIER = 3.2;
const DASH_IFRAME_SECONDS = 0.5;
const SHIELD_DURATION = 3;
const DOUBLE_POINTS_DURATION = 5;
const DOUBLE_POINTS_SLOW_MULTIPLIER = 0.55;
const RANDOM_SPECIAL_COOLDOWN = 15;
const SKILL_PRESS_FEEDBACK_SECONDS = 0.45;
const READY_COUNTDOWN_SECONDS = 3;
const GAME_OVER_HOLD_SECONDS = 5;
const BASKET_BOTTOM_OFFSET = 8;
const CATCH_ZONE_INSET_X = 9;
const CATCH_ZONE_WIDTH = BASKET_WIDTH - CATCH_ZONE_INSET_X * 2;
const CATCH_ZONE_HEIGHT = 18;
const CATCH_ZONE_OFFSET_X = CATCH_ZONE_INSET_X;
const CATCH_ZONE_OFFSET_Y = 0;
const CATCH_ZONE_TOP = GAME_HEIGHT - BASKET_BOTTOM_OFFSET - BASKET_HEIGHT + CATCH_ZONE_OFFSET_Y;
const CATCH_ZONE_BOTTOM = CATCH_ZONE_TOP + CATCH_ZONE_HEIGHT;
const MAX_FALL_DRIFT = 28;
const DEBUG_HITBOXES_DEFAULT = false;

const GOOD_SNACKS = ['🍩', '🧁', '🍪', '🍭', '🍫', '🍬', '🥨', '🍿'];
const BAD_SNACKS = ['☠️', '🤮', '🦠', '💀'];
const POWER_SNACKS = ['⭐', '💎'];
const CONFETTI_COLORS = ['#ff2f91', '#ffb000', '#31d6ff', '#7a2ee8', '#69ff9f', '#fff46b'];
const LEADERBOARD_KEY = 'snackrush-local-leaderboard-v1';
const PLAYER_PROFILE_KEY = 'snackrush-player-profile-v1';
const LEADERBOARD_LIMIT = 50;
const PLAYER_NAME_MAX_LENGTH = 15;
const DEFAULT_PLAYER_NAME = 'SweetTooth';
const DEFAULT_LEADERBOARD = [
  { id: 'default-1', name: 'Tyche', score: 520, caught: 38, tag: 'Candy Queen', createdAt: 50 },
  { id: 'default-2', name: 'Gummy Goblin', score: 430, caught: 32, tag: 'Sticky Fingers', createdAt: 40 },
  { id: 'default-3', name: 'Donut Dash', score: 320, caught: 25, tag: 'Glaze Blazer', createdAt: 30 },
  { id: 'default-4', name: 'Cookie Kid', score: 235, caught: 19, tag: 'Crumb Runner', createdAt: 20 },
  { id: 'default-5', name: 'Rookie Rush', score: 145, caught: 12, tag: 'First Bite', createdAt: 10 },
  { id: 'default-6', name: 'Mochi Mage', score: 120, caught: 10, tag: 'Soft Serve', createdAt: 9 },
  { id: 'default-7', name: 'Lolli Pilot', score: 95, caught: 8, tag: 'Sky Sugar', createdAt: 8 },
  { id: 'default-8', name: 'Choco Champ', score: 75, caught: 7, tag: 'Cocoa Crew', createdAt: 7 },
  { id: 'default-9', name: 'Jelly Bean', score: 55, caught: 5, tag: 'Tiny Treat', createdAt: 6 },
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

const makeConfettiBurst = (x, y, startId, count = 16) =>
  Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const distance = 42 + Math.random() * (count > 16 ? 88 : 68);

    return {
      id: startId + index,
      x,
      y,
      age: 0,
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - 18,
      spin: (Math.random() - 0.5) * 360,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      sparkle: index % 4 === 0,
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
    .sort((a, b) => b.score - a.score || b.caught - a.caught || (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, LEADERBOARD_LIMIT);
}

function normalizePlayerName(name) {
  const trimmed = String(name || '').trim().slice(0, PLAYER_NAME_MAX_LENGTH);
  return trimmed || DEFAULT_PLAYER_NAME;
}

function normalizePlayerProfile(profile = {}) {
  return { name: normalizePlayerName(profile.name) };
}

function loadPlayerProfile() {
  if (typeof window === 'undefined') return normalizePlayerProfile();

  try {
    return normalizePlayerProfile(JSON.parse(window.localStorage.getItem(PLAYER_PROFILE_KEY) || '{}'));
  } catch {
    return normalizePlayerProfile();
  }
}

function savePlayerProfile(profile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAYER_PROFILE_KEY, JSON.stringify(normalizePlayerProfile(profile)));
}

function normalizeLeaderboardEntry(entry, fallbackIndex = 0) {
  return {
    id: String(entry.id || `local-${fallbackIndex}`),
    name: normalizePlayerName(entry.name || 'Mystery Munch'),
    score: Math.max(0, Math.floor(Number(entry.score) || 0)),
    caught: Math.max(0, Math.floor(Number(entry.caught) || 0)),
    tag: String(entry.tag || 'Local Hero').slice(0, 24),
    isPlayer: Boolean(entry.isPlayer),
    createdAt: Number(entry.createdAt) || fallbackIndex,
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

function addLeaderboardScore(stats, currentEntries, playerProfile) {
  const createdAt = Date.now();
  const entryId = `player-${createdAt}`;
  const playerEntry = {
    id: entryId,
    name: normalizePlayerName(playerProfile?.name),
    score: Math.max(0, Math.floor(stats.score || 0)),
    caught: Math.max(0, Math.floor(stats.caught || 0)),
    tag: stats.score >= DEFAULT_LEADERBOARD[0].score ? 'Top Snack Boss' : 'Local Challenger',
    isPlayer: true,
    createdAt,
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
  const [playerProfile, setPlayerProfile] = useState(loadPlayerProfile);
  const [finalStats, setFinalStats] = useState({ score: 0, caught: 0, reason: 'Ready?', leaderboard, leaderboardRank: null });

  const updatePlayerProfile = (nextProfile) => {
    const profile = normalizePlayerProfile(nextProfile);
    savePlayerProfile(profile);
    setPlayerProfile(profile);
  };

  const startGame = () => {
    setGameKey((key) => key + 1);
    setScreen('playing');
  };
  const showMainMenu = () => setScreen('start');
  const endGame = (stats) => {
    const result = addLeaderboardScore(stats, leaderboard, playerProfile);
    setLeaderboard(result.leaderboard);
    setFinalStats({ ...stats, leaderboard: result.leaderboard, leaderboardRank: result.rank });
    setScreen('gameover');
  };

  return (
    <main className="app-shell">
      <div className="candy-cloud cloud-one">🍬</div>
      <div className="candy-cloud cloud-two">🍭</div>
      <div className="candy-cloud cloud-three">🍩</div>

      {screen === 'start' && (
        <StartScreen
          onStart={startGame}
          leaderboard={leaderboard}
          playerProfile={playerProfile}
          onChangePlayerProfile={updatePlayerProfile}
        />
      )}
      {screen === 'playing' && <GameBoard key={gameKey} onGameOver={endGame} onMainMenu={showMainMenu} onRestart={startGame} />}
      {screen === 'gameover' && <GameOverScreen stats={finalStats} leaderboard={leaderboard} onRestart={startGame} onMainMenu={showMainMenu} />}
    </main>
  );
}

function SocialIcon({ link }) {
  if (link.text) {
    return <span className="social-icon-text" aria-hidden="true">{link.text}</span>;
  }

  if (link.iconSrc) {
    return <img src={link.iconSrc} alt="" className="social-icon-image" aria-hidden="true" />;
  }

  switch (link.id) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="social-icon-svg" aria-hidden="true">
          <path d="M13.5 21v-7.1h2.4l.4-2.8h-2.8V9.3c0-.82.23-1.38 1.4-1.38H16V5.4c-.18-.02-.82-.08-1.57-.08-3.1 0-4.93 1.89-4.93 5.35v1.44H7v2.8h2.5V21h4Z" fill="currentColor" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="social-icon-svg" aria-hidden="true">
          <path d="M6.7 8.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM5.2 9.6h3V19h-3V9.6Zm4.9 0H13v1.28h.04c.4-.77 1.4-1.58 2.87-1.58 3.08 0 3.65 2.03 3.65 4.67V19h-3v-4.4c0-1.05-.02-2.4-1.46-2.4-1.47 0-1.7 1.15-1.7 2.33V19h-3V9.6Z" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="social-icon-svg" aria-hidden="true">
          <path d="M21.2 8.1a2.9 2.9 0 0 0-2.05-2.05C17.36 5.6 12 5.6 12 5.6s-5.36 0-7.15.45A2.9 2.9 0 0 0 2.8 8.1 30.2 30.2 0 0 0 2.35 12c0 1.33.15 2.65.45 3.9a2.9 2.9 0 0 0 2.05 2.05c1.79.45 7.15.45 7.15.45s5.36 0 7.15-.45a2.9 2.9 0 0 0 2.05-2.05c.3-1.25.45-2.57.45-3.9s-.15-2.65-.45-3.9ZM10.2 15.25v-6.5L15.8 12l-5.6 3.25Z" fill="currentColor" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" className="social-icon-svg" aria-hidden="true">
          <path d="M12 4.8a7.2 7.2 0 0 0-2.28 14.03c.36.07.49-.16.49-.35v-1.24c-2 .43-2.43-.84-2.43-.84-.33-.84-.8-1.07-.8-1.07-.66-.45.05-.44.05-.44.73.05 1.11.75 1.11.75.65 1.12 1.7.8 2.12.61.07-.47.25-.8.46-.99-1.6-.18-3.3-.8-3.3-3.6 0-.8.29-1.45.75-1.97-.08-.18-.33-.92.07-1.92 0 0 .61-.2 2 .75A6.85 6.85 0 0 1 12 8.7c.6 0 1.2.08 1.76.24 1.4-.95 2-.75 2-.75.4 1 .15 1.74.07 1.92.47.52.75 1.17.75 1.97 0 2.8-1.7 3.42-3.31 3.6.26.23.5.67.5 1.35v2c0 .2.13.43.5.35A7.2 7.2 0 0 0 12 4.8Z" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

function InfoModal({ open, onClose, socialLinks }) {
  if (!open) return null;

  const goodItems = ['🍩', '🧁', '🍪', '🍭'];
  const badItems = ['☠️', '🤮', '🦠', '💀'];

  return (
    <div className="menu-modal-overlay" role="presentation" onMouseDown={onClose}>
      <div id="snackrush-info-modal" className="menu-modal-card info-modal-card" role="dialog" aria-modal="true" aria-label="SnackRush mechanics and links" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="menu-modal-close" onClick={onClose} aria-label="Close info">
          ×
        </button>
        <p className="modal-eyebrow">Rush Guide</p>
        <h2>Game Mechanics</h2>
        <p>Catch sweets, avoid rotten drops, time your skills, and survive the rush clock as the candy shop gets meaner.</p>

        <div className="info-mechanics-grid">
          <section className="info-mechanic-card">
            <strong>Catch</strong>
            <div className="main-rule-icons" aria-label="Good snacks to catch">
              {goodItems.map((item) => <span key={item} className="main-rule-token">{item}</span>)}
            </div>
            <small>Good snacks add score and keep your combo alive.</small>
          </section>

          <section className="info-mechanic-card danger">
            <strong>Avoid</strong>
            <div className="main-rule-icons" aria-label="Bad snacks to avoid">
              {badItems.map((item) => <span key={item} className="main-rule-token">{item}</span>)}
            </div>
            <small>Rotten drops cost hearts and instantly break combo unless protected.</small>
          </section>

          <section className="info-mechanic-card wide">
            <strong>Difficulty spikes</strong>
            <small>Difficulty rises every minute, increasing fall pressure and rotten snack danger. In the planned 10-minute mode, it caps at minute 10.</small>
          </section>

          <section className="info-mechanic-card wide">
            <strong>Snack storms</strong>
            <small>Major rushes are planned at 2:30, 5:00, 7:30, and 9:30. Storms last 20 seconds, flood the board, add more bombs/rotten drops, and guarantee a powerup at the start.</small>
          </section>

          <section className="info-mechanic-card wide">
            <strong>Skills</strong>
            <small>Z Dash, X Shield, C Double Points, and V Random Special are live in-game skills. Skill use starts a shared 7-second global cooldown.</small>
          </section>
        </div>

        <div className="info-social-section">
          <strong>Socials</strong>
          <div className="socials-content-grid">
            <nav className="social-logo-row modal-social-logo-row" aria-label="Social links">
              {socialLinks.map((link) => (
                <a key={link.id} className={`social-logo social-${link.id}`} href={link.href} aria-label={link.label} title={link.label}>
                  <SocialIcon link={link} />
                </a>
              ))}
            </nav>
            <div className="made-by-card">
              <span>Gmail</span>
              <a href="mailto:jridpan1225@gmail.com">jridpan1225@gmail.com</a>
              <span>Made by</span>
              <strong>Joem</strong>
              <small>Heavily assisted by Codex</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerNameModal({ open, playerProfile, onChangePlayerProfile, onClose }) {
  const [draftName, setDraftName] = useState(playerProfile.name);

  useEffect(() => {
    if (open) setDraftName(playerProfile.name);
  }, [open, playerProfile.name]);

  if (!open) return null;

  const closeAndSave = () => {
    const nextProfile = normalizePlayerProfile({ name: draftName });
    onChangePlayerProfile(nextProfile);
    setDraftName(nextProfile.name);
    onClose();
  };

  return (
    <div className="menu-modal-overlay" role="presentation" onMouseDown={closeAndSave}>
      <div id="snackrush-player-modal" className="menu-modal-card player-name-modal-card" role="dialog" aria-modal="true" aria-label="Change leaderboard player name" onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="menu-modal-close" onClick={closeAndSave} aria-label="Close and save player name">
          ×
        </button>
        <p className="modal-eyebrow">Leaderboard Name</p>
        <h2>Player Name</h2>
        <p>Scores save automatically when this modal closes. Names are capped at {PLAYER_NAME_MAX_LENGTH} characters.</p>
        <div className="player-name-edit-row modal-player-name-row">
          <input
            type="text"
            value={draftName}
            maxLength={PLAYER_NAME_MAX_LENGTH}
            onChange={(event) => setDraftName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') closeAndSave();
              if (event.key === 'Escape') closeAndSave();
            }}
            aria-label="Leaderboard player name"
            autoFocus
          />
        </div>
        <small>Current saved name: {playerProfile.name}</small>
      </div>
    </div>
  );
}

function StartScreen({ onStart, leaderboard, playerProfile, onChangePlayerProfile }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [playerNameOpen, setPlayerNameOpen] = useState(false);
  const socialLinks = [
    { id: 'facebook', label: 'Facebook', href: '#' },
    { id: 'linkedin', label: 'LinkedIn', href: '#' },
    { id: 'youtube', label: 'YouTube', href: '#' },
    { id: 'github', label: 'GitHub', href: '#' },
    { id: 'email', label: 'Gmail', href: 'mailto:jridpan1225@gmail.com', text: 'GM' },
    { id: 'website', label: 'My Website', href: '#', iconSrc: '/social-icons/tychefolio-favicon.svg' },
    { id: 'gamecenter', label: 'Game Center', href: '#', iconSrc: '/social-icons/game-center-favicon.svg' },
  ];

  return (
    <>
      <section className="panel start-panel pop-panel">
        <div className="menu-sparkle sparkle-left" aria-hidden="true">✦</div>
        <div className="menu-sparkle sparkle-right" aria-hidden="true">✦</div>

        <p className="eyebrow hero-eyebrow">TYCHE CANDY SHOP PRESENTS</p>

        <div className="title-stack main-menu-title" aria-label="SnackRush">
          <span className="title-candy" aria-hidden="true">🍬</span>
          <h1>SnackRush</h1>
          <span className="title-candy" aria-hidden="true">🍭</span>
        </div>

        <div className="start-action-row">
          <button
            type="button"
            className="secondary-button start-side-button menu-info-button"
            onClick={() => setInfoOpen(true)}
            aria-controls="snackrush-info-modal"
          >
            Info
          </button>

          <button className="primary-button jumbo-button main-start-button" onClick={onStart}>
            Start Rush!
          </button>

          <button
            type="button"
            className="secondary-button start-side-button player-name-button"
            onClick={() => setPlayerNameOpen(true)}
            aria-controls="snackrush-player-modal"
            aria-label={`Change Name: ${playerProfile.name}`}
          >
            Change Name
          </button>
        </div>

        <div className="menu-layout main-menu-layout">
          <ControlsPanel />
          <Leaderboard
            entries={leaderboard}
            title="Local leaderboard"
            subtitle={`Beat ${leaderboard[0]?.name || 'Tyche'} at ${leaderboard[0]?.score || 0}!`}
          />
        </div>
      </section>

      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} socialLinks={socialLinks} />
      <PlayerNameModal open={playerNameOpen} playerProfile={playerProfile} onChangePlayerProfile={onChangePlayerProfile} onClose={() => setPlayerNameOpen(false)} />
    </>
  );
}

function ControlsPanel() {
  const skills = [
    { id: 'dash', key: 'Z', name: 'Dash', tone: 'skill-ready', tooltip: 'Fast dodge roll in your current move direction with 0.5 seconds of invincibility frames.' },
    { id: 'shield', key: 'X', name: 'Shield', tone: 'skill-ready', tooltip: 'Block rotten hits for 3 seconds. Shares the 7-second global skill cooldown.' },
    { id: 'double-points', key: 'C', name: 'Double Points', tone: 'skill-ready', tooltip: 'Double your score gains for 5 seconds, but move slower while it is active.' },
    { id: 'random-special', key: 'V', name: 'Random Special', tone: 'skill-ready', tooltip: 'Instantly trigger one random special effect with its own 15-second cooldown.' },
  ];
  const specialItems = [
    { emoji: '⭐', name: 'Star', tooltip: 'Bonus pickup. Grab it for a premium score pop.' },
    { emoji: '💎', name: 'Gem', tooltip: 'Bonus pickup. Worth extra points when you catch it.' },
    { emoji: '🛡️', name: 'Shield', tooltip: 'Menu preview only for now. Planned as a safety special.' },
    { emoji: '⚡', name: 'Lightning', tooltip: 'Menu preview only for now. Planned as a speed-style special.' },
    { emoji: '🧲', name: 'Magnet', tooltip: 'Menu preview only for now. Planned as a candy-pull special.' },
    { emoji: '🔥', name: 'Fire', tooltip: 'High-energy special teaser slot.' },
  ];

  return (
    <section className="controls-panel main-controls-panel" aria-label="SnackRush controls">
      <div className="main-controls-heading">
        <strong>Control Panel</strong>
      </div>

      <div className="main-controls-top-grid">
        <div className="main-feature-card main-move-block">
          <div className="main-section-heading">
            <strong>Move Basket</strong>
          </div>

          <div className="key-cluster main-move-keys" aria-label="Move with arrow keys or A and D">
            <kbd className="control-key letter-key">A</kbd>
            <kbd className="control-key letter-key">D</kbd>
            <span className="key-or">or</span>
            <kbd className="control-key arrow-key">←</kbd>
            <kbd className="control-key arrow-key">→</kbd>
          </div>
        </div>

        <div className="main-feature-card main-skills-block">
          <div className="main-section-heading">
            <strong>Skills</strong>
          </div>

          <div className="main-skills-grid">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`main-skill-card ${skill.tone}`}
                data-tooltip={skill.tooltip}
                aria-label={`${skill.name} on ${skill.key}`}
              >
                <kbd>{skill.key}</kbd>
                <span>{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-snack-rules specials-only-rules">
        <div className="main-rule-card special-rule">
          <span className="main-rule-label">Specials</span>
          <div className="main-rule-icons main-special-icons" aria-label="Special snacks and powerups">
            {specialItems.map((item) => (
              <button
                key={item.name}
                type="button"
                className="main-rule-token special-token"
                data-tooltip={item.tooltip}
                aria-label={item.name}
                title={item.name}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GameBoard({ onGameOver, onMainMenu, onRestart }) {
  const [pauseOpen, setPauseOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(DEBUG_HITBOXES_DEFAULT);
  const [skillPressTimers, setSkillPressTimers] = useState({});
  const [readyCountdown, setReadyCountdown] = useState(READY_COUNTDOWN_SECONDS);
  const [gameOverHold, setGameOverHold] = useState(null);
  const skillPressTimersRef = useRef({});
  const readyCountdownRef = useRef(READY_COUNTDOWN_SECONDS);
  const gameOverHoldRef = useRef(null);
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
    globalSkillCooldown: 0,
    dashActive: false,
    dashRemaining: 0,
    dashDirection: 0,
    dashIframeRemaining: 0,
    doublePointsActive: false,
    doublePointsRemaining: 0,
    randomSpecialCooldown: 0,
    randomSpecialCueRemaining: 0,
    randomSpecialLabel: '',
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
    globalSkillCooldown: 0,
    dashActive: false,
    dashRemaining: 0,
    dashDirection: 0,
    dashIframeRemaining: 0,
    doublePointsActive: false,
    doublePointsRemaining: 0,
    randomSpecialCooldown: 0,
    randomSpecialCueRemaining: 0,
    randomSpecialLabel: '',
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

  const startReadyCountdown = useCallback(() => {
    readyCountdownRef.current = READY_COUNTDOWN_SECONDS;
    setReadyCountdown(READY_COUNTDOWN_SECONDS);
    keysRef.current = { left: false, right: false };
  }, []);

  const resumeFromPause = useCallback(() => {
    setPauseMenu(false);
    startReadyCountdown();
  }, [setPauseMenu, startReadyCountdown]);

  const confirmGameOver = useCallback((nextHold = gameOverHoldRef.current) => {
    if (!nextHold) return;
    gameOverHoldRef.current = null;
    setGameOverHold(null);
    onGameOver({ score: nextHold.score, caught: nextHold.caught, reason: nextHold.reason });
  }, [onGameOver]);

  const finishGame = useCallback((reason) => {
    const state = stateRef.current;
    if (!state.running) return;
    setPauseMenu(false);
    state.running = false;
    cancelAnimationFrame(animationRef.current);
    const nextHold = { score: state.score, caught: state.caught, reason, timeLeft: GAME_OVER_HOLD_SECONDS };
    gameOverHoldRef.current = nextHold;
    setGameOverHold(nextHold);
  }, [setPauseMenu]);

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

  const pulseSkillCountdown = useCallback((skillId, seconds = SKILL_PRESS_FEEDBACK_SECONDS) => {
    skillPressTimersRef.current = { ...skillPressTimersRef.current, [skillId]: seconds };
    setSkillPressTimers(skillPressTimersRef.current);
  }, []);

  const applyRandomSpecial = useCallback(() => {
    const state = stateRef.current;
    const special = ['Star Ready', 'Gem Flash', 'Heart Glow', 'Candy Nuke'][Math.floor(Math.random() * 4)];
    state.randomSpecialLabel = special;
    state.randomSpecialCueRemaining = 1.35;
    state.flash = 'bonus';
  }, []);

  const canTriggerSkill = useCallback((skillId) => {
    if (pauseOpenRef.current || readyCountdownRef.current > 0 || gameOverHoldRef.current) return false;

    if (skillId === 'debug') return !debugMode && !skillPressTimersRef.current.debug;

    const state = stateRef.current;
    if (state.globalSkillCooldown > 0) return false;
    if (skillId === 'dash') return (state.movementDirection !== 0 || Number(keysRef.current.right) - Number(keysRef.current.left) !== 0) && state.dashIframeRemaining <= 0;
    if (skillId === 'shield') return !state.dodgeActive;
    if (skillId === 'doublePoints') return !state.doublePointsActive;
    if (skillId === 'randomSpecial') return state.randomSpecialCooldown <= 0;
    return false;
  }, [debugMode]);

  const handleSkillPress = useCallback((skillId) => {
    if (!canTriggerSkill(skillId)) return;

    const state = stateRef.current;

    if (skillId === 'debug') {
      pulseSkillCountdown('debug');
      setDebugMode((enabled) => !enabled);
      return;
    }

    state.globalSkillCooldown = GLOBAL_SKILL_COOLDOWN;
    pulseSkillCountdown(skillId, GLOBAL_SKILL_COOLDOWN);

    if (skillId === 'dash') {
      const direction = state.movementDirection || Number(keysRef.current.right) - Number(keysRef.current.left);
      if (direction === 0) {
        state.globalSkillCooldown = 0;
        return;
      }
      state.dashActive = true;
      state.dashRemaining = DASH_DURATION;
      state.dashDirection = direction;
      state.dashIframeRemaining = DASH_IFRAME_SECONDS;
      state.flash = 'bonus';
    }

    if (skillId === 'shield') {
      state.dodgeActive = true;
      state.dodgeRemaining = SHIELD_DURATION;
      state.flash = 'bonus';
    }

    if (skillId === 'doublePoints') {
      state.doublePointsActive = true;
      state.doublePointsRemaining = DOUBLE_POINTS_DURATION;
      state.flash = 'bonus';
    }

    if (skillId === 'randomSpecial') {
      state.randomSpecialCooldown = RANDOM_SPECIAL_COOLDOWN;
      applyRandomSpecial();
    }
  }, [applyRandomSpecial, canTriggerSkill, pulseSkillCountdown]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isControlKey = event.key === 'Escape' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || key === 'a' || key === 'd' || key === 'x' || key === 'z' || key === 'h' || key === 'c' || key === 'v';
      if (isControlKey) event.preventDefault();

      if (key === 'h' && !event.repeat) {
        handleSkillPress('debug');
        return;
      }

      if (gameOverHoldRef.current) return;

      if (event.key === 'Escape') {
        if (event.repeat) return;
        if (pauseOpenRef.current) {
          resumeFromPause();
        } else {
          setPauseMenu(true);
        }
        return;
      }

      if (pauseOpenRef.current) return;

      if (event.key === 'ArrowLeft' || key === 'a') keysRef.current.left = true;
      if (event.key === 'ArrowRight' || key === 'd') keysRef.current.right = true;
      if (event.repeat) return;
      if (key === 'x') handleSkillPress('shield');
      if (key === 'z') handleSkillPress('dash');
      if (key === 'c') handleSkillPress('doublePoints');
      if (key === 'v') handleSkillPress('randomSpecial');
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
  }, [handleSkillPress, resumeFromPause, setPauseMenu]);

  useEffect(() => {
    if (!gameOverHold) return undefined;

    const timer = window.setTimeout(() => {
      if (gameOverHold.timeLeft <= 0.1) {
        confirmGameOver(gameOverHold);
        return;
      }

      const nextHold = { ...gameOverHold, timeLeft: Math.max(0, gameOverHold.timeLeft - 0.1) };
      gameOverHoldRef.current = nextHold;
      setGameOverHold(nextHold);
    }, 100);

    return () => window.clearTimeout(timer);
  }, [confirmGameOver, gameOverHold]);

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

      if (readyCountdownRef.current > 0) {
        const nextCountdown = Math.max(0, readyCountdownRef.current - delta);
        readyCountdownRef.current = nextCountdown;
        setReadyCountdown(nextCountdown);
        state.movementDirection = 0;
        animationRef.current = requestAnimationFrame(tick);
        return;
      }

      state.elapsed += delta;
      state.timeLeft = Math.max(0, GAME_SECONDS - state.elapsed);

      const direction = Number(keysRef.current.right) - Number(keysRef.current.left);

      state.globalSkillCooldown = Math.max(0, state.globalSkillCooldown - delta);
      state.randomSpecialCooldown = Math.max(0, state.randomSpecialCooldown - delta);
      state.dashIframeRemaining = Math.max(0, state.dashIframeRemaining - delta);
      state.randomSpecialCueRemaining = Math.max(0, state.randomSpecialCueRemaining - delta);

      if (state.dashActive) {
        state.dashRemaining = Math.max(0, state.dashRemaining - delta);
        if (state.dashRemaining === 0) {
          state.dashActive = false;
          state.dashDirection = 0;
        }
      }

      if (state.dodgeActive) {
        state.dodgeRemaining = Math.max(0, state.dodgeRemaining - delta);
        if (state.dodgeRemaining === 0) state.dodgeActive = false;
      }

      if (state.doublePointsActive) {
        state.doublePointsRemaining = Math.max(0, state.doublePointsRemaining - delta);
        if (state.doublePointsRemaining === 0) state.doublePointsActive = false;
      }

      const movementDirection = state.dashActive ? state.dashDirection : direction;
      state.evading = state.dodgeActive || state.dashIframeRemaining > 0;
      state.speeding = state.dashActive || state.dashIframeRemaining > 0;
      state.movementDirection = movementDirection;
      const currentSpeed = PLAYER_SPEED * (state.dashActive ? DASH_SPEED_MULTIPLIER : state.doublePointsActive ? DOUBLE_POINTS_SLOW_MULTIPLIER : 1);
      const previousBasketX = state.basketX;
      state.basketX = clamp(state.basketX + movementDirection * currentSpeed * delta, 12, GAME_WIDTH - BASKET_WIDTH - 12);

      state.spawnClock -= delta;
      const spawnDelay = Math.max(0.28, 0.78 - state.elapsed * 0.01);
      if (state.spawnClock <= 0) {
        state.items.push(freshItem(state.nextId++));
        state.spawnClock = spawnDelay;
      }

      state.confetti = state.confetti
        .map((piece) => ({ ...piece, age: piece.age + delta }))
        .filter((piece) => piece.age < 0.75);

      if (Object.keys(skillPressTimersRef.current).length > 0) {
        const nextSkillPressTimers = Object.fromEntries(
          Object.entries(skillPressTimersRef.current)
            .map(([skillId, remaining]) => [skillId, Math.max(0, remaining - delta)])
            .filter(([, remaining]) => remaining > 0)
        );
        skillPressTimersRef.current = nextSkillPressTimers;
        setSkillPressTimers(nextSkillPressTimers);
      }

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
            if (state.dodgeActive || state.dashIframeRemaining > 0) {
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
            const earnedPoints = (basePoints + comboBonus) * (state.doublePointsActive ? 2 : 1);
            state.score += earnedPoints;
            state.caught += 1;
            state.flash = updated.type === 'bonus' ? 'bonus' : 'sweet';
            const burst = makeConfettiBurst(updated.x + ITEM_SIZE / 2, CATCH_ZONE_TOP + CATCH_ZONE_HEIGHT / 2, state.nextConfettiId, state.doublePointsActive ? 24 : 16);
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
          globalSkillCooldown: state.globalSkillCooldown,
          dashActive: state.dashActive,
          dashRemaining: state.dashRemaining,
          dashDirection: state.dashDirection,
          dashIframeRemaining: state.dashIframeRemaining,
          doublePointsActive: state.doublePointsActive,
          doublePointsRemaining: state.doublePointsRemaining,
          randomSpecialCooldown: state.randomSpecialCooldown,
          randomSpecialCueRemaining: state.randomSpecialCueRemaining,
          randomSpecialLabel: state.randomSpecialLabel,
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
    <section className={`game-wrap ${snapshot.flash} ${snapshot.evading ? 'evading' : ''} ${snapshot.speeding ? 'speeding' : ''} ${snapshot.doublePointsActive ? 'double-points' : ''} ${pauseOpen ? 'paused' : ''} ${gameOverHold ? 'gameover-hold' : ''}`} aria-label="SnackRush game area">
      <Hud score={snapshot.score} timeLeft={snapshot.timeLeft} lives={snapshot.lives} combo={snapshot.combo} />
      <div className="game-board" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div className="shop-awning" />
        <div className="conveyor-label">SNACK STORM</div>
        <SkillsHotkeysPanel
          debugMode={debugMode}
          paused={pauseOpen}
          locked={Boolean(gameOverHold) || readyCountdown > 0}
          skillPressTimers={skillPressTimers}
          movementDirection={snapshot.movementDirection}
          globalSkillCooldown={snapshot.globalSkillCooldown}
          dashIframeRemaining={snapshot.dashIframeRemaining}
          dodgeActive={snapshot.dodgeActive}
          dodgeRemaining={snapshot.dodgeRemaining}
          doublePointsActive={snapshot.doublePointsActive}
          doublePointsRemaining={snapshot.doublePointsRemaining}
          randomSpecialCooldown={snapshot.randomSpecialCooldown}
          randomSpecialLabel={snapshot.randomSpecialLabel}
          onSkillPress={handleSkillPress}
        />
        {snapshot.items.map((item) => <FallingSnack key={item.id} item={item} />)}
        <ConfettiBurst pieces={snapshot.confetti} />
        <Basket x={snapshot.basketX} evading={snapshot.evading} speeding={snapshot.speeding} movementDirection={snapshot.movementDirection} doublePoints={snapshot.doublePointsActive} />
        {snapshot.randomSpecialCueRemaining > 0 && <RandomSpecialCue label={snapshot.randomSpecialLabel} />}
        {debugMode && <DebugHitboxes items={snapshot.items} basketX={snapshot.basketX} />}
        {gameOverHold && <GameOverHoldOverlay hold={gameOverHold} onConfirm={() => confirmGameOver(gameOverHold)} />}
        {readyCountdown > 0 && !pauseOpen && !gameOverHold && <ReadyCountdownOverlay seconds={readyCountdown} />}
        {pauseOpen && (
          <PauseMenu
            onResume={resumeFromPause}
            onRestart={restartFromPause}
            onEndGame={() => finishGame('Rush ended from pause menu!')}
            onMainMenu={mainMenuFromPause}
          />
        )}
      </div>
    </section>
  );
}

function GameOverHoldOverlay({ hold, onConfirm }) {
  const shownTime = Math.max(0, Math.ceil(hold.timeLeft));

  return (
    <div className="gameover-hold-overlay" role="dialog" aria-modal="true" aria-label="Game over pause before results">
      <div className="gameover-hold-card">
        <span className="gameover-hold-eyebrow">Snack Rush crashed</span>
        <strong>Game Over</strong>
        <p>{hold.reason}</p>
        <small>Continuing in {shownTime}s</small>
        <button type="button" className="gameover-hold-button" onClick={onConfirm}>OK</button>
      </div>
    </div>
  );
}

function ReadyCountdownOverlay({ seconds }) {
  const number = Math.max(1, Math.ceil(seconds));

  return (
    <div className="ready-countdown-overlay" aria-live="polite" aria-label={`Game starts in ${number}`}>
      <div className="ready-countdown-card">
        <span>Get Ready</span>
        <strong key={number}>{number}</strong>
      </div>
    </div>
  );
}

function Hud({ score, timeLeft, lives, combo }) {
  const shownTime = Math.ceil(timeLeft);
  const timerMood = shownTime <= 5 ? 'timer-critical' : shownTime <= 10 ? 'timer-warning' : '';

  return (
    <div className="hud hud-redesign">
      <Stat label="Sugar Score" value={score.toString().padStart(4, '0')} className="score-card compact-stat" />
      <div className="timer-heart-stack">
        <div className={`stat-card timer-card hero-timer ${timerMood}`}>
          <span>Rush Clock</span>
          <strong key={shownTime}>{`${shownTime}s`}</strong>
          <HeartsDisplay lives={lives} />
        </div>
      </div>
      <Stat label="Combo Pop" value={combo > 1 ? `x${combo}` : '—'} className="combo-card compact-stat" />
    </div>
  );
}

function HeartsDisplay({ lives }) {
  const safeLives = Math.max(lives, 0);

  return (
    <div className="hearts-display" aria-label={`${safeLives} snack hearts left`}>
      <div className="heart-row">
        {Array.from({ length: STARTING_LIVES }, (_, index) => (
          <b key={index} className={index < safeLives ? 'heart-full' : 'heart-empty'}>{index < safeLives ? '❤️' : '♡'}</b>
        ))}
      </div>
    </div>
  );
}

function formatAbilityTime(seconds) {
  return `${Math.ceil(seconds)}s`;
}

function getAbilityProgress(seconds, totalSeconds) {
  return Math.max(0, Math.min(1, seconds / Math.max(totalSeconds, 1)));
}

const SKILL_HOTKEYS = [
  { id: 'dash', keyName: 'Z', label: 'Dash' },
  { id: 'shield', keyName: 'X', label: 'Shield' },
  { id: 'doublePoints', keyName: 'C', label: '2x Points' },
  { id: 'randomSpecial', keyName: 'V', label: 'Random' },
  { id: 'debug', keyName: 'H', label: 'Hitbox' },
];

function SkillsHotkeysPanel({ debugMode, paused, locked, skillPressTimers, movementDirection, globalSkillCooldown, dashIframeRemaining, dodgeActive, dodgeRemaining, doublePointsActive, doublePointsRemaining, randomSpecialCooldown, randomSpecialLabel, onSkillPress }) {
  const getSkillState = (skill) => {
    if (skill.id === 'debug') {
      const remaining = debugMode ? skillPressTimers.debug || SKILL_PRESS_FEEDBACK_SECONDS : skillPressTimers.debug || 0;
      return {
        shown: remaining > 0 || debugMode,
        disabled: paused || locked || remaining > 0 || debugMode,
        remaining,
        total: SKILL_PRESS_FEEDBACK_SECONDS,
        label: skill.label,
      };
    }

    if (skill.id === 'dash') {
      const remaining = dashIframeRemaining > 0 ? dashIframeRemaining : globalSkillCooldown;
      return {
        shown: remaining > 0,
        disabled: paused || locked || globalSkillCooldown > 0 || !movementDirection,
        remaining,
        total: dashIframeRemaining > 0 ? DASH_IFRAME_SECONDS : GLOBAL_SKILL_COOLDOWN,
        label: !movementDirection && globalSkillCooldown <= 0 ? 'Move First' : skill.label,
      };
    }

    if (skill.id === 'shield') {
      const remaining = dodgeActive ? dodgeRemaining : globalSkillCooldown;
      return {
        shown: remaining > 0,
        disabled: paused || locked || globalSkillCooldown > 0 || dodgeActive,
        remaining,
        total: dodgeActive ? SHIELD_DURATION : GLOBAL_SKILL_COOLDOWN,
        label: skill.label,
      };
    }

    if (skill.id === 'doublePoints') {
      const remaining = doublePointsActive ? doublePointsRemaining : globalSkillCooldown;
      return {
        shown: remaining > 0,
        disabled: paused || locked || globalSkillCooldown > 0 || doublePointsActive,
        remaining,
        total: doublePointsActive ? DOUBLE_POINTS_DURATION : GLOBAL_SKILL_COOLDOWN,
        label: doublePointsActive ? '2x + Slow' : skill.label,
      };
    }

    if (skill.id === 'randomSpecial') {
      const remaining = Math.max(globalSkillCooldown, randomSpecialCooldown);
      return {
        shown: remaining > 0,
        disabled: paused || locked || globalSkillCooldown > 0 || randomSpecialCooldown > 0,
        remaining,
        total: randomSpecialCooldown > globalSkillCooldown ? RANDOM_SPECIAL_COOLDOWN : GLOBAL_SKILL_COOLDOWN,
        label: skill.label,
      };
    }

    return { shown: false, disabled: paused || locked, remaining: 0, total: GLOBAL_SKILL_COOLDOWN, label: skill.label };
  };

  return (
    <div className="skills-hotkeys-panel" aria-label="Skill buttons">
      <div className="skills-hotkeys-row">
        {SKILL_HOTKEYS.map((skill) => {
          const state = getSkillState(skill);
          const progress = getAbilityProgress(state.remaining || (state.shown ? state.total : 0), state.total);
          const sweep = `${Math.round(progress * 360)}deg`;

          return (
            <button
              key={skill.id}
              type="button"
              className={`skill-hotkey ${skill.id} ${state.shown ? 'active' : ''}`}
              style={{ '--cooldown-sweep': sweep }}
              onClick={() => onSkillPress(skill.id)}
              aria-label={`${skill.label} skill hotkey`}
              disabled={state.disabled}
            >
              <span className="skill-cooldown-wipe" aria-hidden="true" />
              <kbd>{skill.keyName}</kbd>
              <small>{state.shown ? formatAbilityTime(state.remaining || state.total) : state.label}</small>
            </button>
          );
        })}
      </div>
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
        data-label="basket"
        style={{ left: basketX, top: GAME_HEIGHT - BASKET_BOTTOM_OFFSET - BASKET_HEIGHT, width: BASKET_WIDTH, height: BASKET_HEIGHT }}
      />
      <div
        className="debug-hitbox catch-zone"
        data-label="catch zone"
        style={{ left: catchZone.left, top: catchZone.top, width: catchZone.right - catchZone.left, height: catchZone.bottom - catchZone.top }}
      />
      {items.map((item) => {
        const hitbox = getItemHitbox(item);

        return (
          <Fragment key={`debug-${item.id}`}>
            <div className="debug-hitbox sprite-box" data-label="sprite" style={{ left: item.x, top: item.y, width: ITEM_SIZE, height: ITEM_SIZE }} />
            <div
              className={`debug-hitbox item-hitbox ${item.type}`}
              data-label="item hitbox"
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
      style={{ left: item.x, top: item.y }}
      aria-hidden="true"
    >
      {item.emoji}
    </div>
  );
}

function RandomSpecialCue({ label }) {
  return (
    <div className="random-special-cue" aria-hidden="true">
      <span>V</span>
      <strong>{label || 'Random Special'}</strong>
    </div>
  );
}

function ConfettiBurst({ pieces }) {
  return pieces.map((piece) => (
    <span
      key={piece.id}
      className={`confetti-piece ${piece.sparkle ? 'sparkle' : ''}`}
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

function Basket({ x, evading, speeding, movementDirection, doublePoints }) {
  const movementClass = movementDirection < 0 ? 'moving-left' : movementDirection > 0 ? 'moving-right' : 'idle';

  return (
    <div className={`basket ${evading ? 'evading' : ''} ${speeding ? 'speeding' : ''} ${doublePoints ? 'double-points' : ''} ${movementClass}`} style={{ transform: `translateX(${x}px)` }} aria-label="player basket">
      <div className="boost-aura" />
      <div className="boost-flame" />
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

function Leaderboard({ entries, title, subtitle, highlightRank = null }) {
  return (
    <section className="leaderboard-card" aria-label={title}>
      <div className="leaderboard-header">
        <div className="leaderboard-crown" aria-hidden="true">🏆</div>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <ol className="leaderboard-list">
        {entries.map((entry, index) => {
          const rank = index + 1;
          const isHighlighted = highlightRank === rank;

          return (
            <li
              key={entry.id}
              className={[
                `rank-${rank}`,
                entry.isPlayer ? 'player-score' : '',
                isHighlighted ? 'new-score' : '',
              ].filter(Boolean).join(' ')}
            >
              {rank === 1 && (
                <span className="leaderboard-top-crown" aria-hidden="true">👑</span>
              )}

              <span className="leaderboard-rank">#{rank}</span>

              <div className="leaderboard-name">
                <span>{entry.name}</span>
                <small>{entry.tag}</small>
              </div>

              <div className="leaderboard-score">
                <span>{entry.score}</span>
                <small>{entry.caught} caught</small>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function GameOverScreen({ stats, leaderboard, onRestart, onMainMenu }) {
  const title = stats.score >= 350 ? 'Sugar Legend!' : stats.score >= 180 ? 'Snack Champ!' : 'Rush Over!';
  const medal = stats.score >= 350 ? '🏆' : stats.score >= 180 ? '🎖️' : '🍬';
  const board = stats.leaderboard || leaderboard;
  const madeTopThree = Boolean(stats.leaderboardRank && stats.leaderboardRank <= 3);

  const [leaderboardOpen, setLeaderboardOpen] = useState(madeTopThree);

  const leaderboardSubtitle = stats.leaderboardRank
    ? `New local rank #${stats.leaderboardRank}!`
    : `Beat #1: ${board[0]?.score || 0} points`;

  return (
    <section className={`panel gameover-panel pop-panel ${madeTopThree ? 'top-three-win' : ''}`}>
      <div className="menu-sparkle sparkle-left" aria-hidden="true">✦</div>
      <div className="menu-sparkle sparkle-right" aria-hidden="true">✦</div>

      <p className="eyebrow hero-eyebrow gameover-reason">{stats.reason}</p>

      <div className="result-badge gameover-medal" aria-hidden="true">{medal}</div>

      <h1 className="gameover-title">{title}</h1>

      <div className="gameover-button-row">
        <button className="secondary-button gameover-side-button" type="button" onClick={onMainMenu}>
          Main Menu
        </button>

        <button className="primary-button jumbo-button gameover-play-button" type="button" onClick={onRestart}>
          Play Again
        </button>

        <button className="secondary-button gameover-side-button" type="button" onClick={() => setLeaderboardOpen(true)}>
          Leaderboards
        </button>
      </div>

      <div className="score-summary result-grid gameover-score-cards">
        <div>
          <span>Final Score</span>
          <strong className={`score-number digits-${String(stats.score).length}`}>
            {stats.score}
          </strong>
        </div>
        <div>
          <span>Snacks Caught</span>
          <strong className={`score-number digits-${String(stats.caught).length}`}>
            {stats.caught}
          </strong>
        </div>
      </div>

      <p className="tagline result-tagline gameover-bottom-text">
        The candy counter is closed. Count your loot, dodge the stink, and rush again!
      </p>

      {leaderboardOpen && (
        <div className="leaderboard-modal-overlay" role="dialog" aria-modal="true" aria-label="Local leaderboard">
          <div className="leaderboard-modal-card">
            {madeTopThree && (
              <div className="modal-confetti-layer" aria-hidden="true">
                {Array.from({ length: 28 }, (_, index) => (
                  <span key={index} />
                ))}
              </div>
            )}

            {madeTopThree && <p className="leaderboard-popout-badge">Top 3!</p>}

            <button
              className="leaderboard-modal-close"
              type="button"
              onClick={() => setLeaderboardOpen(false)}
              aria-label="Close leaderboard"
            >
              ×
            </button>

            <Leaderboard
              entries={board}
              title="Local leaderboard"
              subtitle={leaderboardSubtitle}
              highlightRank={stats.leaderboardRank}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default App;
