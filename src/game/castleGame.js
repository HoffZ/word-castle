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
export const MIN_SPAWN_SECONDS = 5;

export function createAttack() {
  return {
    time: 0,
    nextSpawn: SPAWN_SECONDS,
    spawnInterval: SPAWN_SECONDS,
    earlyHits: 0,
    nextId: 2,
    zombies: [{ id: 1, bornAt: 0 }],
  };
}

// Absolute game time preserves the spawn rhythm across frames and pauses.
export function advanceAttack(attack, seconds) {
  attack.time += seconds;
  while (attack.nextSpawn <= attack.time) {
    attack.zombies.push({ id: attack.nextId++, bornAt: attack.nextSpawn });
    attack.nextSpawn += attack.spawnInterval;
  }
  return attack.zombies.some((zombie) => attack.time - zombie.bornAt >= APPROACH_SECONDS);
}

export function shootNearest(attack) {
  if (!attack.zombies.length) return null;
  const nearest = attack.zombies.reduce((a, b) => (a.bornAt <= b.bornAt ? a : b));
  attack.zombies = attack.zombies.filter((zombie) => zombie.id !== nearest.id);
  return nearest;
}

// Refill only after impact, so the visible target stays until the cannonball lands.
export function ensureZombie(attack) {
  if (attack.zombies.length) return;
  attack.zombies.push({ id: attack.nextId++, bornAt: attack.time });
}

// Two early hits speed up the wave gently; a late hit gives the player more room.
export function adjustDifficulty(attack, targetPosition) {
  const previousInterval = attack.spawnInterval;
  if (targetPosition < 35) {
    attack.earlyHits += 1;
    if (attack.earlyHits >= 2) {
      attack.spawnInterval = Math.max(MIN_SPAWN_SECONDS, previousInterval - 1);
      attack.earlyHits = 0;
    }
  } else {
    attack.earlyHits = 0;
    if (targetPosition >= 65) {
      attack.spawnInterval = Math.min(SPAWN_SECONDS, previousInterval + 1);
    }
  }
  if (attack.spawnInterval !== previousInterval) {
    // Preserve progress toward the next spawn instead of releasing a sudden extra wave.
    const remaining = Math.max(0, attack.nextSpawn - attack.time);
    attack.nextSpawn = attack.time + (remaining * attack.spawnInterval) / previousInterval;
  }
}
