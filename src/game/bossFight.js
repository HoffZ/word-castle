export const BOSS_HEALTH = 3;
export const BOSS_APPROACH_SECONDS = 35;
export const CELEBRATION_SECONDS = 4;

export function bossVocabulary(batches, currentBatch) {
  const previous = batches
    .filter((batch) => batch.id !== currentBatch.id)
    .flatMap((batch) => batch.words);
  return previous.length ? previous : currentBatch.words;
}

export function pickBossWord(words, previousId, random = Math.random) {
  const alternatives = words.filter((word) => word.id !== previousId);
  const pool = alternatives.length ? alternatives : words;
  return pool[Math.floor(random() * pool.length)];
}

export function damageBoss(health) {
  return Math.max(0, health - 1);
}
