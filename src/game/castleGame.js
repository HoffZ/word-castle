export const REQUIRED_WINS = 3;
export const APPROACH_SECONDS = 20;

export function normalizeAnswer(answer) {
  return answer.trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
}

export function isCorrectAnswer(answer, expected) {
  return expected.split(';').some((option) => normalizeAnswer(option) === normalizeAnswer(answer));
}

// Pick among the least-practised words so every word gets a turn.
export function nextWord(words, progress, previousId, random = Math.random) {
  const remaining = words.filter((word) => (progress[word.id] || 0) < REQUIRED_WINS);
  if (!remaining.length) return null;
  const minimum = Math.min(...remaining.map((word) => progress[word.id] || 0));
  let candidates = remaining.filter((word) => (progress[word.id] || 0) === minimum);
  const different = candidates.filter((word) => word.id !== previousId);
  if (different.length) candidates = different;
  return candidates[Math.floor(random() * candidates.length)];
}

export const SPAWN_SECONDS = 10;

export function createAttack() {
  return { time: 0, nextSpawn: SPAWN_SECONDS, nextId: 2, zombies: [{ id: 1, bornAt: 0 }] };
}

// Absolute game time preserves the spawn rhythm across frames and pauses.
export function advanceAttack(attack, seconds) {
  attack.time += seconds;
  while (attack.nextSpawn <= attack.time) {
    attack.zombies.push({ id: attack.nextId++, bornAt: attack.nextSpawn });
    attack.nextSpawn += SPAWN_SECONDS;
  }
  return attack.zombies.some((zombie) => attack.time - zombie.bornAt >= APPROACH_SECONDS);
}

export function shootNearest(attack) {
  if (!attack.zombies.length) return null;
  const nearest = attack.zombies.reduce((a, b) => (a.bornAt <= b.bornAt ? a : b));
  attack.zombies = attack.zombies.filter((zombie) => zombie.id !== nearest.id);
  return nearest;
}
