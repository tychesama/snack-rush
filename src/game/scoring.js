export const COMBO_TIMEOUT_SECONDS = 3.5;
export const COMBO_BONUS_CAP = 500;

export function calculateComboMultiplier(combo) {
  const safeCombo = Math.max(0, Math.floor(Number(combo) || 0));
  return 1 + Math.min(safeCombo, COMBO_BONUS_CAP) / 100;
}

export function calculateCatchPoints({ baseValue, combo, doublePointsActive = false }) {
  const safeBaseValue = Math.max(0, Number(baseValue) || 0);
  const comboPoints = Math.round(safeBaseValue * calculateComboMultiplier(combo));
  return comboPoints * (doublePointsActive ? 2 : 1);
}

export function formatComboMultiplier(combo) {
  return `${calculateComboMultiplier(combo).toFixed(2)}x`;
}
