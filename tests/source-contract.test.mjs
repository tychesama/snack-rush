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

assert(app.includes('const DEBUG_HITBOXES = false;'), 'debug hitboxes should be gated by an internal false constant');
assert(app.includes('function DebugHitboxes'), 'debug hitbox overlay component should exist');
assert(app.includes('DEBUG_HITBOXES && <DebugHitboxes'), 'debug hitbox overlay should render only when DEBUG_HITBOXES is enabled');

assert(app.includes('pauseOpen'), 'game state should track whether the Escape pause menu is open');
assert(app.includes('function PauseMenu'), 'pause menu component should exist');
assert(app.includes('setPauseMenu(!pauseOpenRef.current)'), 'Escape should open/toggle the pause menu');
assert(app.includes('onMainMenu'), 'pause menu should offer a main menu action');
assert(app.includes('onRestart'), 'pause menu should offer a restart action');
assert(app.includes("finishGame('Rush ended from pause menu!')"), 'pause menu should offer an end game action');
assert(app.includes("<button className=\"pause-menu-button\" onClick={onResume}>Resume Rush</button>"), 'pause menu should offer resume');

assert(css.includes('.pause-menu-overlay'), 'pause menu overlay styles should exist');
assert(css.includes('.debug-hitbox'), 'debug hitbox styles should exist');
assert(css.includes('.debug-hitbox.catch-zone'), 'catch-zone hitbox style should exist');
assert(css.includes('.debug-hitbox.item-hitbox'), 'item hitbox style should exist');
assert(css.includes('.debug-hitbox.sprite-box'), 'sprite-box hitbox style should exist');

console.log('source contract checks passed');
