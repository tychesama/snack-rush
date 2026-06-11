import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const app = readFileSync(join(root, 'src/App.jsx'), 'utf8');
const css = readFileSync(join(root, 'src/App.css'), 'utf8');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(!existsSync(join(root, 'reference basket.png')), 'reference basket.png should be deleted');
assert(pkg.scripts.test === 'node tests/source-contract.test.mjs', 'package.json should expose the source contract test');

assert(app.includes('const DEBUG_HITBOXES_DEFAULT = false;'), 'debug hitboxes should default to off');
assert(app.includes('const [debugMode, setDebugMode] = useState(DEBUG_HITBOXES_DEFAULT);'), 'game state should track hitbox debug mode');
assert(app.includes('function DebugHitboxes'), 'debug hitbox overlay component should exist');
assert(app.includes('debugMode && <DebugHitboxes'), 'debug hitbox overlay should render when debug mode is enabled');
assert(app.includes('function SkillsHotkeysPanel'), 'skills hotkeys panel should replace the old debug panel');
assert(app.includes("key === 'h'"), 'H key should toggle hitbox debug mode');

assert(app.includes('pauseOpen'), 'game state should track whether the Escape pause menu is open');
assert(app.includes('function PauseMenu'), 'pause menu component should exist');
assert(app.includes('setPauseMenu(true)') && app.includes('resumeFromPause()'), 'Escape should pause and unpause through the ready countdown');
assert(app.includes('onMainMenu'), 'pause menu should offer a main menu action');
assert(app.includes('onRestart'), 'pause menu should offer a restart action');
assert(app.includes("finishGame('Rush ended from pause menu!')"), 'pause menu should offer an end game action');
assert(app.includes("<button className=\"pause-menu-button\" onClick={onResume}>Resume Rush</button>"), 'pause menu should offer resume');

assert(css.includes('.pause-menu-overlay'), 'pause menu overlay styles should exist');
assert(css.includes('.debug-hitbox'), 'debug hitbox styles should exist');
assert(css.includes('.debug-hitbox.catch-zone'), 'catch-zone hitbox style should exist');
assert(css.includes('.debug-hitbox.item-hitbox'), 'item hitbox style should exist');
assert(css.includes('.debug-hitbox.sprite-box'), 'sprite-box hitbox style should exist');

assert(app.includes('snackrush-local-leaderboard-v1'), 'leaderboard should persist to localStorage with a stable key');
assert(app.includes('snackrush-player-profile-v1'), 'player profile should persist separately from leaderboard scores');
assert(app.includes('PLAYER_NAME_MAX_LENGTH = 15'), 'player names should be capped at 15 characters');
assert(app.includes('function PlayerNameModal'), 'start screen should expose a change-name modal');
const playerModalSource = app.slice(app.indexOf('function PlayerNameModal'), app.indexOf('function StartScreen'));
assert(app.includes('Change Name') && playerModalSource.includes('Scores save automatically when this modal closes'), 'player name modal should clarify auto-save-on-close behavior');
assert(playerModalSource.includes('closeAndSave') && !playerModalSource.includes('>Save<'), 'player name modal should auto-save on close without a save button');
assert(app.includes('addLeaderboardScore(stats, leaderboard, playerProfile)'), 'completed scores should use the saved player profile name');
assert(!app.includes("name: 'You'"), 'completed leaderboard scores should not hard-code the player name');
assert(app.includes('DEFAULT_LEADERBOARD'), 'leaderboard should include default scores to beat');
assert(app.includes('function Leaderboard'), 'leaderboard component should exist');
assert(app.includes('addLeaderboardScore'), 'game over should record local leaderboard scores');
assert(css.includes('.leaderboard-card'), 'leaderboard card styles should exist');
assert(css.includes('.leaderboard-list'), 'leaderboard row styles should exist');
assert(css.includes('.player-name-modal-card'), 'player name change modal styles should exist');

assert(app.includes('function ControlsPanel'), 'start screen should use the one-panel controls component');
assert(app.includes('function InfoModal') && app.includes('snackrush-info-modal'), 'start screen should expose a combined info modal for mechanics and links');
const infoModalSource = app.slice(app.indexOf('function InfoModal'), app.indexOf('function PlayerNameModal'));
assert(infoModalSource.includes('const goodItems') && infoModalSource.includes('const badItems'), 'info modal should define its Catch/Avoid item lists before rendering');
assert(app.indexOf('</section>') < app.indexOf('<InfoModal open={infoOpen}'), 'start modals should render outside the clipped pop-panel');
assert(app.includes('start-action-row') && app.includes('menu-info-button') && app.includes('player-name-button'), 'start screen should place info and player name buttons around Start Rush');
assert(app.includes("iconSrc: '/social-icons/tychefolio-favicon.svg'") && app.includes("iconSrc: '/social-icons/game-center-favicon.svg'"), 'website and game center should use copied favicon assets');
assert(app.includes("mailto:jridpan1225@gmail.com") && app.includes('Made by') && app.includes('Joem') && app.includes('Heavily assisted by Codex'), 'info modal socials should include gmail and maker credits');
assert(!app.includes('Catch the sweet stuff. Power through suspicious snacks. Survive the candy shop chaos!'), 'old inline tagline should be removed in favor of the help popover');
assert(!app.includes('BOOST ACTIVATED'), 'boost activated text should be removed from controls and HUD');
assert(app.includes('className="boost-aura"'), 'basket should include a boost aura visual effect');
assert(css.includes('.basket.speeding .boost-aura'), 'basket boost aura should appear while speed boost is active');
assert(app.includes('const CATCH_ZONE_INSET_X = 9;'), 'catch-zone x inset should match the visible basket rim');
assert(app.includes('const CATCH_ZONE_HEIGHT = 18;'), 'catch-zone height should match the visible basket rim');
assert(app.includes('const CATCH_ZONE_OFFSET_Y = 0;'), 'catch-zone should sit slightly higher on the basket');
assert(css.includes('left: 9px;') && css.includes('width: 90px;') && css.includes('height: 18px;'), 'visible basket rim should match catch-zone geometry');
assert(app.includes('const ITEM_HITBOX_INSET_X = 8;') && app.includes('const ITEM_HITBOX_TOP_INSET = 8;') && app.includes('const ITEM_HITBOX_BOTTOM_INSET = 8;'), 'item hitboxes should align to centered visible snack icons');
assert(app.includes('style={{ left: item.x, top: item.y }}'), 'falling snack UI should use the same left/top coordinates as debug sprite boxes');
assert(!app.includes('transform: `translate(${item.x}px, ${item.y}px)`'), 'falling snack UI should not use a separate translate path from debug hitboxes');
assert(css.includes('transform-origin: center center;'), 'falling snack rotation should stay centered over its hitbox');
assert(css.includes('.controls-panel'), 'one-panel controls styles should exist');
assert(css.includes('.control-key:hover'), 'designed key controls should be hoverable');
assert(app.includes('Control Panel') && !app.includes('How to play'), 'main menu controls should keep the compact heading without the old badge');
assert(css.includes('.menu-modal-overlay') && css.includes('.info-modal-card') && css.includes('.modal-social-logo-row'), 'combined info modal styles should exist');
assert(css.includes('.info-modal-card') && css.includes('overflow: hidden') && css.includes('.socials-content-grid'), 'info modal should hide scrollbars and use the socials panel space');
assert(!app.includes('leaderboard-medal') && css.includes('leaderboard-top-crown') && css.includes('Top leaderboard ranks: medal-like rows, crown kept inside bounds'), 'leaderboard should keep the crown inside bounds while restoring top-three visual effects');
assert(app.includes('main-controls-top-grid') && css.includes('.main-controls-top-grid'), 'control panel should use a compact top grid layout');
assert(!app.includes('main-section-kicker') && app.includes('main-rule-label') && !app.includes('main-rule-kicker'), 'control panel should use plain text labels instead of circular badge labels');
assert(app.includes('Move Basket') && app.includes('Skills') && app.includes('Catch') && app.includes('Avoid') && app.includes('Specials'), 'menu and info modal should show plain text section labels');
assert(app.indexOf('Catch') < app.indexOf('function ControlsPanel'), 'Catch mechanics should live in the info modal instead of the main controls panel');
assert(app.indexOf('Avoid') < app.indexOf('function ControlsPanel'), 'Avoid mechanics should live in the info modal instead of the main controls panel');
assert(app.includes('Difficulty rises every minute') && app.includes('2:30, 5:00, 7:30, and 9:30'), 'info modal should describe minute difficulty spikes and snack storm timestamps');
assert(app.includes('Dash') && app.includes('Shield') && app.includes('Double Points') && app.includes('Random Special'), 'control panel should show the planned skills');
assert(!app.includes('Invincibility'), 'planned skill should be renamed to Shield');
assert(!app.includes('>Live<') && !app.includes('>Soon<'), 'control panel skills should not show live/soon badges');
assert(app.includes('special-token') && css.includes('.special-token::after') && css.includes('grid-column: 1 / -1;'), 'special icons should expose tooltips and keep specials on the full second row');
assert(css.includes('.main-skill-card:hover') && css.includes('scale(1.02)') && !css.includes('rotate(var(--skill-tilt'), 'skill cards should hover straight so tooltips do not tilt');
assert(css.includes('.skills-hotkeys-panel'), 'skills hotkeys panel styles should exist');
assert(!app.includes('className="skills-title"'), 'skills hotkeys text label should be removed for a compact panel');
assert(css.includes('.skill-cooldown-wipe') && css.includes('conic-gradient(from -90deg'), 'skills cooldown should use a clock-wipe style radial mask');
assert(app.includes("'--cooldown-sweep': sweep"), 'skill cooldown wipe should receive live sweep styling');
assert(app.includes('GLOBAL_SKILL_COOLDOWN = 7') && app.includes('RANDOM_SPECIAL_COOLDOWN = 15'), 'skills should use the planned 7s global cooldown and 15s random special cooldown');
assert(app.includes('DASH_DURATION = 0.18') && app.includes('DASH_SPEED_MULTIPLIER = 3.2') && app.includes('dashDirection'), 'dash should be a shorter/slower fast dodge roll over time, not an instant teleport');
assert(!app.includes('state.basketX = clamp(state.basketX + direction * DASH_DISTANCE'), 'dash should not instantly move the basket by a fixed distance');
assert(app.includes('DASH_IFRAME_SECONDS = 0.5'), 'dash should keep 0.5s invincibility frames');
assert(app.includes('DOUBLE_POINTS_DURATION = 5') && app.includes('DOUBLE_POINTS_SLOW_MULTIPLIER = 0.55'), 'double points should apply a stronger slow during the 5s effect');
assert(!app.includes('DOUBLE_POINTS_SLOW_DURATION') && !app.includes('doublePointsSlowRemaining'), 'double points should no longer apply a lingering slow after the effect');
assert(!app.includes('DoublePointsCue') && !css.includes('.double-points-cue'), 'double points should not use a notification-style cue');
assert(app.includes('doublePointsActive={snapshot.doublePointsActive}') && app.includes("${doublePoints ? 'double-points' : ''}") && css.includes('.basket.double-points'), 'double points should change the basket like other skills');
const randomSpecialSource = app.slice(app.indexOf('const applyRandomSpecial'), app.indexOf('const canTriggerSkill'));
assert(app.includes('randomSpecialCueRemaining') && app.includes('RandomSpecialCue') && css.includes('.random-special-cue'), 'random special should show a visual cue for now');
assert(!randomSpecialSource.includes('state.score +=') && !randomSpecialSource.includes('state.lives =') && !randomSpecialSource.includes('state.items = []') && !randomSpecialSource.includes('state.dodgeActive = true'), 'random special should not change gameplay yet');
assert(app.includes('makeConfettiBurst(updated.x + ITEM_SIZE / 2, CATCH_ZONE_TOP + CATCH_ZONE_HEIGHT / 2, state.nextConfettiId, state.doublePointsActive ? 24 : 16)') && css.includes('.confetti-piece.sparkle'), 'candy catches should create bigger confetti/effects, especially during double points');
assert(app.includes('disabled={state.disabled}') && app.includes('globalSkillCooldown') && app.includes('randomSpecialCooldown'), 'skill buttons should disable during pause, global cooldown, and random-special cooldown states');
assert(app.includes('SKILL_HOTKEYS') && app.includes("id: 'dash'") && app.includes("id: 'doublePoints'") && app.includes("id: 'randomSpecial'"), 'skills hotkeys should expose dash, shield, double points, and random special');
assert(!app.includes("id: 'frenzy'") && !app.includes("id: 'magnet'") && !app.includes("id: 'boost'"), 'old boost/magnet/frenzy placeholder skills should be removed');
assert(app.includes("key === 'c'") && app.includes("key === 'v'") && app.includes("handleSkillPress('doublePoints')") && app.includes("handleSkillPress('randomSpecial')"), 'new skill hotkeys should respond from keyboard');
assert(app.includes('skillPressTimers'), 'clicking a skill should show a countdown timer');
assert(!app.includes('function AbilityPanel'), 'old bottom skills panels should be removed');
assert(css.includes('/* Skills: no outer panel */') && css.includes('border-radius: 14px') && css.includes('conic-gradient(from -90deg'), 'skill UI should remove the outer panel, use rounded-square buttons, and start cooldown at 12:00');
assert(css.includes('.debug-hitbox::after'), 'debug hitboxes should display labels');
assert(app.includes('function HeartsDisplay'), 'hearts should be shown below the timer');
assert(app.includes('className={`stat-card timer-card hero-timer ${timerMood}`}') && css.includes('.stat-card.hero-timer .hearts-display'), 'hearts should be centered inside the rush clock panel below the timer');
assert(css.includes('grid-template-columns: minmax(150px, 188px) max-content minmax(150px, 188px)') && css.includes('width: max-content;') && css.includes('.score-card'), 'HUD should hug the Rush Clock contents, narrow side cards, and align Sugar Score right');
assert(css.includes('.heart-row b') && css.includes('background: transparent;') && css.includes('box-shadow: none;') && css.includes('font-size: 1.62rem'), 'hearts should render as enlarged standalone hearts without containers');
assert(app.includes('timeLeft: 0,') && app.includes("finishGame('Time is up!')"), 'timer finish path should snapshot 0s before showing game-over hold');
assert(css.includes('/* Top leaderboard ranks: medal-like rows, crown kept inside bounds */') && css.includes('.leaderboard-list li.rank-2') && css.includes('linear-gradient(90deg, #f7f7fb') && css.includes('.main-menu-layout .leaderboard-card'), 'leaderboard should preserve top-three effects and main-menu scroll sizing');
assert(css.includes('.timer-heart-stack') && css.includes('.hero-timer'), 'timer should be the top-most central HUD element');
assert(app.includes('const BASKET_BOTTOM_OFFSET = 8;'), 'basket should be moved down slightly');
assert(app.includes('const BASKET_HEIGHT = 54;'), 'basket should be flatter than the old design');
assert(app.includes('READY_COUNTDOWN_SECONDS = 3'), 'game should use a 3-second ready countdown');
assert(app.includes('function ReadyCountdownOverlay'), 'game should render a start/unpause countdown overlay');
assert(app.includes('resumeFromPause') && app.includes('startReadyCountdown()'), 'unpausing should trigger the ready countdown');
assert(!app.includes('Snack rush starts after the countdown'), 'countdown helper text below the number should be removed');
assert(css.includes('.ready-countdown-overlay') && css.includes('rgba(43, 18, 57, 0.68)') && css.includes('backdrop-filter: blur(4px)'), 'ready countdown overlay should use a dark pause-like mask');
assert(app.includes('GAME_OVER_HOLD_SECONDS = 5'), 'game over should pause on a 5-second hold before results');
assert(app.includes('function GameOverHoldOverlay'), 'game over hold overlay component should exist');
assert(!app.includes('<strong key={shownTime}>Game Over</strong>'), 'game over pop text should animate once instead of re-popping every second');
assert(app.includes('confirmGameOver') && app.includes('Continuing in {shownTime}s'), 'game over overlay should allow auto-advance and show countdown text');
assert(css.includes('.gameover-hold-overlay') && css.includes('.gameover-hold-button'), 'game over hold overlay styles should exist');
// Game-over layout is intentionally user-owned; do not enforce button placement here.

console.log('source contract checks passed');
