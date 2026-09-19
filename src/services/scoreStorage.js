export const SCORE_KEY = 'word-castle.total-score';
export const POINTS_PER_ZOMBIE = 100;

export function loadScore(storage = localStorage) {
  const raw = storage.getItem(SCORE_KEY);
  if (raw === null) return 0;
  const score = Number(raw);
  if (!raw.trim() || !Number.isSafeInteger(score) || score < 0) {
    throw new Error('Saved score is invalid.');
  }
  return score;
}

// Never overwrite a higher saved total with an older in-memory value.
export function saveScore(score, storage = localStorage) {
  const total = Math.max(score, loadScore(storage));
  storage.setItem(SCORE_KEY, String(total));
  return total;
}
