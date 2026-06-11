import {
  COMBO_TIMEOUT_SECONDS,
  calculateCatchPoints,
  calculateComboMultiplier,
  formatComboMultiplier,
} from '../src/game/scoring.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(COMBO_TIMEOUT_SECONDS === 3.5, 'combo timeout should be 3.5 seconds');

assert(calculateComboMultiplier(0) === 1, 'combo 0 should use the base multiplier');
assert(calculateComboMultiplier(1) === 1.01, 'combo 1 should add 1%');
assert(calculateComboMultiplier(10) === 1.1, 'combo 10 should add 10%');
assert(calculateComboMultiplier(500) === 6, 'combo 500 should cap at +500% bonus / 6x total');
assert(calculateComboMultiplier(999) === 6, 'combo above 500 should stay capped at 6x total');

assert(calculateCatchPoints({ baseValue: 10, combo: 0 }) === 10, 'base candy with combo 0 should score base points');
assert(calculateCatchPoints({ baseValue: 10, combo: 10 }) === 11, 'base candy with combo 10 should score 110% rounded');
assert(calculateCatchPoints({ baseValue: 25, combo: 10 }) === 28, 'powerup with combo 10 should score 110% rounded');
assert(calculateCatchPoints({ baseValue: 10, combo: 10, doublePointsActive: true }) === 22, 'double points should apply after combo multiplier');
assert(calculateCatchPoints({ baseValue: 10, combo: 999, doublePointsActive: true }) === 120, 'double points should respect the capped combo multiplier');

assert(formatComboMultiplier(0) === '1.00x', 'combo 0 display should be 1.00x');
assert(formatComboMultiplier(12) === '1.12x', 'combo 12 display should show multiplier compactly');
assert(formatComboMultiplier(600) === '6.00x', 'capped combo display should be 6.00x');

console.log('scoring checks passed');
