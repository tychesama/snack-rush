const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (start, end, progress) => start + (end - start) * progress;

export const ADVENTURE_DURATION_SECONDS = 10 * 60;
export const MAX_DIFFICULTY_LEVEL = 10;

export function getDifficultyLevel(elapsedSeconds, durationSeconds = ADVENTURE_DURATION_SECONDS) {
  const safeElapsed = Math.max(0, Number(elapsedSeconds) || 0);
  const secondsPerLevel = Math.max(1, durationSeconds / MAX_DIFFICULTY_LEVEL);
  return clamp(Math.floor(safeElapsed / secondsPerLevel) + 1, 1, MAX_DIFFICULTY_LEVEL);
}

export function getDifficultyConfig(elapsedSeconds, durationSeconds = ADVENTURE_DURATION_SECONDS) {
  const safeElapsed = Math.max(0, Number(elapsedSeconds) || 0);
  const progress = clamp(safeElapsed / Math.max(1, durationSeconds), 0, 1);
  const level = getDifficultyLevel(safeElapsed, durationSeconds);

  return {
    level,
    progress,
    spawnDelay: lerp(0.86, 0.34, progress),
    fallSpeedMultiplier: lerp(0.88, 1.72, progress),
    badChance: lerp(0.1, 0.28, progress),
    specialChance: lerp(0.07, 0.14, progress),
    driftMultiplier: lerp(0.65, 1.38, progress),
    maxItems: Math.round(lerp(7, 18, progress)),
  };
}
