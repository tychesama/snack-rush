import {
  ADVENTURE_DURATION_SECONDS,
  MAX_DIFFICULTY_LEVEL,
  getDifficultyConfig,
  getDifficultyLevel,
} from '../src/game/difficulty.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(ADVENTURE_DURATION_SECONDS === 600, 'Adventure Mode should last 10 minutes');
assert(MAX_DIFFICULTY_LEVEL === 10, 'difficulty should cap at level 10');

assert(getDifficultyLevel(0) === 1, 'difficulty should start at level 1');
assert(getDifficultyLevel(59.9) === 1, 'difficulty should stay level 1 during first minute');
assert(getDifficultyLevel(60) === 2, 'difficulty should rise to level 2 after one minute');
assert(getDifficultyLevel(599) === 10, 'difficulty should reach level 10 near the end');
assert(getDifficultyLevel(999) === 10, 'difficulty should cap at level 10');

const early = getDifficultyConfig(0);
const mid = getDifficultyConfig(300);
const late = getDifficultyConfig(600);

assert(early.level === 1 && mid.level === 6 && late.level === 10, 'difficulty configs should expose the current level');
assert(early.spawnDelay > mid.spawnDelay && mid.spawnDelay > late.spawnDelay, 'spawn delay should shrink as difficulty rises');
assert(early.fallSpeedMultiplier < mid.fallSpeedMultiplier && mid.fallSpeedMultiplier < late.fallSpeedMultiplier, 'fall speed multiplier should rise as difficulty rises');
assert(early.badChance < mid.badChance && mid.badChance < late.badChance, 'bad item chance should rise as difficulty rises');
assert(early.specialChance < mid.specialChance && mid.specialChance < late.specialChance, 'special item chance should rise as difficulty rises');
assert(early.driftMultiplier < mid.driftMultiplier && mid.driftMultiplier < late.driftMultiplier, 'item drift should rise as difficulty rises');

const chanceTotal = late.badChance + late.specialChance;
assert(chanceTotal < 0.55, 'late-game bad/special chance should leave normal snacks as the majority');

console.log('difficulty checks passed');
